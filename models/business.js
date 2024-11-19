// BUSINESS MODEL DEFINITION
const sequelize = require('../db')
const { DataTypes } = require('sequelize');

const Business = sequelize.define('Business', 
    {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        }
    },
    {
        timestamps: true
    }
);
  
  module.exports = Business;
