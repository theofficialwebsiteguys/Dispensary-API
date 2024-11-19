const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Replace with your Sequelize instance
const User = require('./user'); // Replace with your User model
const Business = require('./business'); // Replace with your Business model

const Session = sequelize.define('Sessions', {
    sessionId: {
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
            model: User,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    businessProfileKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Business,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    timestamps: false, // Do not add Sequelize's default timestamps
    tableName: 'sessions', // Ensure table name matches your database
});

module.exports = Session;