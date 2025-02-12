const sequelize = require('../db')
const { DataTypes } = require('sequelize')
const Order = require('./order')

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Order,
            key: 'id',
        },
        onDelete: 'CASCADE', // Ensures items are deleted if the order is deleted
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    brand: {
        type: DataTypes.STRING,
    },
    category: {
        type: DataTypes.STRING,
    },
    price: {
        type: DataTypes.DECIMAL(10, 4), // Matches the format used in orders
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1,
        }
    },
}, {
    timestamps: true,
    tableName: 'OrderItems',
});


module.exports = OrderItem;
