const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Categories = sequelize.define(
  "Categories",
  {
    sn: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    category_id: {
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
    category_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category_type: {
      type: DataTypes.ENUM("income", "expense"),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.STRING,
    },
    modified_at: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: false,
    tableName: "categories",
    createdAt: false,
    updatedAt: false,
  }
);

module.exports = { Categories };
