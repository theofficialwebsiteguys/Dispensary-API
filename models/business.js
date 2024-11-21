// BUSINESS MODEL DEFINITION
const sequelize = require('../db')
const { DataTypes } = require('sequelize')
const { generateApiKey } = require('./validators/apiKey')

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
        },
        api_key: {
          type: DataTypes.STRING,
          unique: true
        }
    },
    {
        timestamps: true
    }
)

Business.beforeCreate(async (business) => {
  business.api_key= generateApiKey()
})
  
module.exports = Business
