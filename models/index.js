const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const Business = require('./business')
const Referral = require('./referral')
const User = require('./user')

// FK for business_id on User model
User.belongsTo(Business, { foreignKey: 'business_id' })
Business.hasMany(User, { foreignKey: 'business_id' })

// FK for referred_by on User model
User.belongsTo(User, { foreignKey: 'referred_by', as: 'referrer' })
User.hasMany(User, { foreignKey: 'referred_by', as: 'referredUsers' })

// FK for referrer_id on Refferal model
Referral.belongsTo(User, { foreignKey: 'user_id', as: 'referrer' }) 
User.hasMany(Referral, { foreignKey: 'referrer_id', as: 'referrals' })

// Sync all models with the database
sequelize.sync({ alter: true }) // change to force: true to drop all data and tables and recreate based on model definitions
  .then(() => {
    console.log('Database & tables synced successfully')
  })
  .catch(error => {
    console.error('Error syncing database:', error)
  })

// Export models and sequelize instance
module.exports = {
  sequelize,
  Business,
  Referral,
  User
}
