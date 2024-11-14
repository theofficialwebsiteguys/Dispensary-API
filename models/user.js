// USER MODEL DEFINITION
const sequelize = require('../db')
const { DataTypes } = require('sequelize');
const Business = require('./business');

const User = sequelize.define('User', 
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isPhoneNumber(value) {
          const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
          if (!phoneRegex.test(value)) {
            throw new Error('Phone number is invalid');
          }
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Business,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  },
  {
    timestamps: true
  }
);

module.exports = User;
