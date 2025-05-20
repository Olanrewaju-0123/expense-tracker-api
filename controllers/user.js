const { Op } = require("sequelize");
const { createUserValidation } = require("../validations/user.validations");
const {
  createTransactionValidation,
} = require("../validations/transaction.validations");
const { Categories } = require("../models/category");
const { Transactions } = require("../models/transactions");
const { Users } = require("../models/user.model");
const { TemporaryUsers } = require("../models/user_temp.model");
const { Otp } = require("../models/otp.model");
const { v4: uuidv4 } = require("uuid");
const { hashPassword, generateOtp } = require("../utils/index");
const sequelize = require("../config/sequelize");
const jwt = require("jsonwebtoken");
const data = require("../messages/index");
const bcrypt = require("bcrypt");
const ONE_HOUR = "1h";

const createUser = async (req, res, next) => {
  try {
    const { surname, othernames, email, password } = req.body;
    const { error } = createUserValidation(req.body);
    if (error != undefined)
      throw new Error(error.details[0].message || "Something went wrong");
    const checkIfEmailExist = await Users.findOne({
      where: { email: email },
    });
    if (checkIfEmailExist != null) throw new Error(data.userExist);

    const [hash, salt] = await hashPassword(password);
    await TemporaryUsers.create({
      user_id: uuidv4(),
      surname: surname,
      othernames: othernames,
      email: email,
      hash: hash,
      salt: salt,
    });

    //generate otp
    const otp = generateOtp();
    await Otp.create({
      email: email,
      otp: otp,
    });
    res.status(200).json({
      status: data.successStatus,
      message: data.otpSent,
    });
  } catch (error) {
    // console.log("error: ", error)
    res.status(400).json({
      status: "error",
      message: error.message,
    });

    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.params;
    console.log("Checking OTP for:", email, otp);

    const checkIfEmailAndOtpExist = await Otp.findOne({
      where: { email: email, otp: otp },
    });
    console.log("Found OTP record:", checkIfEmailAndOtpExist);
    if (checkIfEmailAndOtpExist == null) {

      const error = new Error(data.wrongOtpOrExpired);
      error.statusCode = 400;
      throw error;
    }

    // get all data by email from user_temp table
    const userTemp = await TemporaryUsers.findOne({
      where: { email: email },
    });
    if (userTemp == null) {
      const error = new Error(data.userTempNotExist);
      error.statusCode = 404;
      throw error;
    }

    //   start a databasetransaction
    await sequelize.transaction(async (t) => {
      await Users.create(
        {
          user_id: userTemp.user_id,
          surname: userTemp.surname,
          othernames: userTemp.othernames,
          email: userTemp.email,
          phone: userTemp.phone,
          hash: userTemp.hash,
          salt: userTemp.salt,
          is_email_verified: true,
        },
        { transaction: t }
      );

      const defaultCategory = await Categories.findOne({
        where: {
          user_id: userTemp.user_id,
          category_type: {
            [Op.or]: ["income", "expense"],
          },
        },
        transaction: t,
      });
      // if (!defaultCategory) {
      //   throw new Error("Default income category not found for this user.");
      // }
      // Insert in Transaction Table
      await Transactions.create(
        {
          transaction_id: uuidv4(),
          user_id: userTemp.user_id,
          amount: 0.0,
          transaction_type: "income",
          description: "Initial Balance",
          category: defaultCategory.Categories,
          date: new Date(),
        },
        { transaction: t }
      );

      //   delete all data by email from otp table
      await Otp.destroy(
        {
          where: { email: email },
        },
        { transaction: t }
      );
      //   delete all data by email from user_temp table
      await TemporaryUsers.destroy(
        {
          where: { email: email },
        },
        { transaction: t }
      );
    });
    res.status(200).json({
      status: data.successStatus,
      message: data.userVerified,
    });
  } catch (error) {
    // console.log("error: ", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error("Email and Password are required");
    const checkIfEmailExist = await Users.findOne({
      where: { email: email },
    });
    if (checkIfEmailExist == null) throw new Error(data.userDoesNotExist);
    const match = await bcrypt.compare(password, checkIfEmailExist.hash);
    if (!match) throw new Error(data.userDoesNotExist);
    // const token = jwt.sign({ _id: uuidv4() }, process.env.JWT_SECRET, {
    //   expiresIn: ONE_HOUR,
    // });
    const token = jwt.sign(
      { email: checkIfEmailExist.email },
      process.env.JWT_SECRET,
      {
        expiresIn: ONE_HOUR,
      }
    );

    // res.setHeader('access_token', token);
    res.status(200).json({
      status: data.successStatus,
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    // next(error);
    res.status(400).json({
      status: data.errorStatus,
      message: error.message,
    });
  }
};

const createCatogories = async (req, res, next) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) throw new Error("Name and type are required");
    // convert Name to lowerCase
    const nameConverted = name.toLowerCase();
    const typeConverted = type.toLowerCase();
    const validType = ["income", "expense"];
    if (!validType.includes(typeConverted))
      throw new Error("Invalid Type" + type);
    // check if category already exists on the user
    const existingCategory = await Categories.findOne({
      where: {
        category_name: nameConverted,
        category_type: typeConverted,
        user_id: req.user.user_id,
      },
    });
    if (existingCategory) {
      throw new Error("Category already exist");
    }
    // create the category
    const newCategory = await Categories.create({
      user_id: req.user.user_id,
      category_name: nameConverted,
      category_type: typeConverted,
    });
    res.status(200).json({
      status: "success",
      message: "Category Created Successfully",
      data: newCategory,
    });
  } catch (error) {
    console.log("error:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const updateCatogories = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    if (!name || !type) throw new Error("Name and type are required");
    // convert Name to LowerCase
    const nameConverted = name.toLowerCase();
    const typeConverted = type.toLowerCase();
    const category = await Categories.findOne({
      where: {
        id,
        user_id: req.user.user_id,
      },
    });
    if (!category) throw new Error("Category does not exist");
    category.category_name = nameConverted;
    category.category_type = typeConverted;
    await category.save();
    res.status(200).json({
      status: "success",
      message: "Category Updated Successfully",
      data: category,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// create a Transaction
const createTransaction = async (req, res, next) => {
  try {
    const { amount, transaction_type, description, category, date } = req.body;
    const { error } = createTransactionValidation(req.body);
    if (error != undefined)
      throw new Error(error.details[0].message || "Something went wrong");

    const categoryId = parseInt(category, 10);
    if (isNaN(categoryId))
      throw new Error("Category ID must be a valid number");

    // Check if category exists and belongs to user
    const categoryExist = await Categories.findOne({
      where: {
        category_id: category,
        user_id: req.user.user_id,
      },
    });
    if (!categoryExist)
      throw new Error("Invalid category or category does not belong to user");

    // Generate next unique transaction_id manually
    const lastTransaction = await Transactions.findOne({
      order: [["transaction_id", "DESC"]],
    });
    const nextTransactionId = lastTransaction
      ? lastTransaction.transaction_id + 1
      : 1;

    const newTransaction = await Transactions.create({
      transaction_id: nextTransactionId,
      user_id: req.user.user_id,
      amount,
      transaction_type,
      description,
      category,
      date,
    });
    res.status(201).json({
      status: "success",
      message: "Transaction Created Successfully",
      data: newTransaction,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// get a list of Transaction
const getFilteredTransaction = async (req, res, next) => {
  try {
    const { startDate, endDate, type, category } = req.query;
    const where = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.date[Op.lte] = new Date(endDate);
      }
    }
    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    const transactions = await Transactions.findAll({
      where,
      order: [["date", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  createUser,
  verifyEmail,
  login,
  createCatogories,
  updateCatogories,
  createTransaction,
  getFilteredTransaction,
};
