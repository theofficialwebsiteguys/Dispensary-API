const sequelize = require('../db')
const { DataTypes } = require('sequelize')
const User = require('./user')
  
const Referral = sequelize.define('Referral', 
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    referrer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    referred_email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
        validate: {
          isEmail: true,
        },
    },
    referred_phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isPhoneNumber(value) {
          const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/
          if (value && !phoneRegex.test(value)) {
            throw new Error('Phone number is invalid')
          }
        },
      },
      },
    referral_converted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, 
  {
    timestamps: true,
    validate: {
        // ensure that at least one of the email or phone is provided
        emailOrPhone() {
          if (!this.referred_email && !this.referred_phone) {
            throw new Error('Either referred_email or referred_phone must be provided')
          }
        },
      },
  }
);

module.exports = Referral;
