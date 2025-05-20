const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Transactions = sequelize.define(
  "Transactions",
  {
    sn: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    transaction_id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Users",
        key: "user_id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0.0,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Categories",
        key: "category_id",
      },
    },
    transaction_type: {
      type: DataTypes.ENUM,
      values: ["income", "expenses"],
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.STRING,
    },
    modified_at: {
      type: DataTypes.STRING,
    },
    deleted_at: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: false,
    tableName: "transactions",
    createdAt: false,
    updatedAt: false,
  }
);
module.exports = {
  Transactions,
};
