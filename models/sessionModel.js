// models/sessionModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js'); // Import your Sequelize instance

const Session = sequelize.define('Session', {
    sessionID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    sessionToken: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Reference to the User model
            key: 'id',
        },
    },
    businessProfileKey: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'BusinessProfiles', // Reference to the BusinessProfile model
            key: 'id',
        },
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    timestamps: false, // Sequelize will not automatically add createdAt/updatedAt columns
    tableName: 'sessions',
});

module.exports = Session;