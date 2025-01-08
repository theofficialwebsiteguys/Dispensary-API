require('dotenv').config()

const express = require('express')
const cors = require('cors')
const sequelize = require('./db')

const logger = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')


const businessRoutes = require('./routes/businessRoutes')
const referralRoutes = require('./routes/referralRoutes')
const userRoutes = require('./routes/userRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')

const app = express()

// Enable CORS
// const corsOptions = {
//   origin: ['http://localhost:8100', 'https://localhost'], // Allow requests from Ionic frontend
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
// };

// app.use(cors(corsOptions));
app.use(cors({
  origin: '*', // For development; specify allowed origins for production.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: true
}));
app.options('*', cors()); // Preflight requests

app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});




// Middleware
app.use(express.json())
app.use(logger)

// Routes - mounting /api/users to all userRoutes in userRoutes.js
app.use('/api/businesses', businessRoutes)
app.use('/api/referrals', referralRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

// error handling must go after route definitions
app.use(errorHandler)

sequelize.authenticate()
  .then(() => {
    console.log('Connected to the database.');
    const port = process.env.PORT || 3333; // Use Heroku's PORT or 3333 locally
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Exit process on failure
  });


module.exports = app
