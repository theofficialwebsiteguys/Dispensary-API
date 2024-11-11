// app.js
const express = require('express');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Routes - mounting /api/users to all userRoutes in userRoutes.js
app.use('/api/users', userRoutes);

module.exports = app;
