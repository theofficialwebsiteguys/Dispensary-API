const sequelize = require('../db')
const { DataTypes } = require('sequelize')
const Session = require('./session')

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    session_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: Session,
          key: 'sessionId',
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