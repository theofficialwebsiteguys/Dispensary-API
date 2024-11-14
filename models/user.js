// USER MODEL DEFINITION
const sequelize = require('../db')
const { DataTypes } = require('sequelize')
const Business = require('./business')

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
    dob: {
      type: DataTypes.DATE, // Store date of birth
      allowNull: false, // Make it required
      validate: {
        isDate: {
          msg: 'Please provide a valid date for the date of birth',
        },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isPhoneNumber(value) {
          const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/
          if (!phoneRegex.test(value)) {
            throw new Error('Phone number is invalid')
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
    },
    referred_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users', // This refers to the `Users` table itself
        key: 'id', // We reference the `id` column of the `Users` table
      },
      validate: {
        isInt: true
      }
    }
  },
  {
    timestamps: true
  }
)

module.exports = User
