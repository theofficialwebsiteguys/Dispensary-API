const sequelize = require('../db')
const { DataTypes } = require('sequelize')
const User = require('./user')

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: User,
          key: 'id',
        },
    },
    employee_id: { 
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users', 
            key: 'id',
        },
    },
    pos_order_id: {
        type: DataTypes.STRING,
    },
    points_add: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    points_redeem: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    complete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    points_awarded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    points_locked: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 4), // Allows up to 10 digits, 4 after the decimal
        defaultValue: 0.0,
    },
    business_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    timestamps: true,
    tableName: 'Orders',
});


module.exports = Order;