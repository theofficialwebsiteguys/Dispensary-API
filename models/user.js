// USER MODEL DEFINITION
const sequelize = require('../db')
const { DataTypes } = require('sequelize')
const Business = require('./business')
const { isValidPhoneNumber, formatPhoneNumber } = require('../validators/phoneNumber')


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
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Please provide a valid date for the date of birth',
        },
      },
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: 'US'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isValidPhoneNumber(value) {
          const countryCode = this.country || 'US'
          isValidPhoneNumber(value, countryCode)
        }
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
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
    },
    allow_notifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    timestamps: true
  }
)

User.beforeCreate(async (user) => {
  user.phone = formatPhoneNumber(user.phone, user.country)
})

User.beforeUpdate(async (user) => {
  user.phone = formatPhoneNumber(user.phone, user.country)
})


module.exports = User
