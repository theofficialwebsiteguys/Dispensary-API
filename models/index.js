const sequelize = require('../db')
const { DataTypes } = require('sequelize');

// Import models
const Business = require('./business');
const User = require('./user');

// Set up associations

// FK for business_id on User model
User.belongsTo(Business, { foreignKey: 'business_id' });
Business.hasMany(User, { foreignKey: 'business_id' });

// FK for referred_by on User model
User.belongsTo(User, { foreignKey: 'referred_by', as: 'referrer' }); 
User.hasMany(User, { foreignKey: 'referred_by', as: 'referredUsers' });

// Sync all models with the database
sequelize.sync({ force: true }) // Set to `true` only in development, to drop and recreate tables
  .then(() => {
    console.log('Database & tables synced successfully');
  })
  .catch(error => {
    console.error('Error syncing database:', error);
  });

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Business,
};
