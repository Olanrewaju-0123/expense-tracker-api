const {Sequelize, DataTypes} = require("sequelize")
const sequelize = require('../config/sequelize')

const Otp = sequelize.define("Otp", 
    {
    sn: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      references:{
        model: 'TemporaryUsers',
        key: 'email'
      }
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.STRING,
      
    },
    modified_at: {
      type: DataTypes.STRING
    }

},{
  timestamps: false,
  createdAt: false,
  updatedAt: false  
})


module.exports = { Otp }