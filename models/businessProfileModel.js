// models/businessProfileModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js'); // Import your Sequelize instance

const BusinessProfile = sequelize.define('BusinessProfile', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Reference to the User model
            key: 'id',
        },
    },
    businessName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Additional fields for the business profile
}, {
    timestamps: true,
    tableName: 'business_profiles',
});

module.exports = BusinessProfile;