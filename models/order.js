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
    }
}, {
    timestamps: true,
    tableName: 'Orders',
});


module.exports = Order;