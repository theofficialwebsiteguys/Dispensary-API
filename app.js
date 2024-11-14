require('dotenv').config()

const express = require('express')
const sequelize = require('./db')

const userRoutes = require('./routes/userRoutes')
const businessRoutes = require('./routes/businessRoutes')

const app = express()

// Middleware
app.use(express.json())

// Routes - mounting /api/users to all userRoutes in userRoutes.js
app.use('/api/users', userRoutes)
app.use('/api/businesses', businessRoutes)

sequelize.authenticate()
  .then(() => {
    console.log('Connected to the database.')
    app.listen(process.env.API_PORT, () => {
      console.log(`Server is running on port ${process.env.API_PORT}`)
    })
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })

module.exports = app
