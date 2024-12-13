// USER MODEL DEFINITION
const sequelize = require('../db')
const { DataTypes } = require('sequelize')
const Business = require('./business')
const { isValidPhoneNumber, formatPhoneNumber } = require('./validators/phoneNumber')
const { isValidCountryCode } = require('./validators/countryCode')


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
      defaultValue: 'US',
      validate: {
        isValidCountry(value) {
          isValidCountryCode(value)
        },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
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
      onDelete: 'SET NULL',
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
    },
    pushToken: {
      type: DataTypes.STRING,
      allowNull: true, // Initially null until the frontend updates it
      comment: 'Device-specific push notification token for the user',
    },
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_token_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    premium: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    premium_start: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    premium_end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    alpineToken: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["email", "business_id"],
        name: "unique_email_per_business"
      },
      {
        unique: true,
        fields: ["phone", "business_id"],
        name: "unique_phone_per_business"
      }
    ]
  }
)

User.beforeCreate(async (user) => {
  user.phone = formatPhoneNumber(user.phone, user.country)
})

User.beforeUpdate(async (user) => {
  user.phone = formatPhoneNumber(user.phone, user.country)
})


module.exports = User
