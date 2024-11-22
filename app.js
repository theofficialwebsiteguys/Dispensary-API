require('dotenv').config()

const express = require('express')
const cors = require('cors')
const sequelize = require('./db')

const logger = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')


const businessRoutes = require('./routes/businessRoutes')
const referralRoutes = require('./routes/referralRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express()

// Enable CORS
const corsOptions = {
  origin: 'http://localhost:8100', // Allow requests from Ionic frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight requests

// Middleware
app.use(express.json())
app.use(logger)

// Routes - mounting /api/users to all userRoutes in userRoutes.js
app.use('/api/businesses', businessRoutes)
app.use('/api/referrals', referralRoutes)
app.use('/api/users', userRoutes)

// error handling must go after route definitions
app.use(errorHandler)

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
