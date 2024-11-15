// ./api/businesses

const express = require('express');
const businessController = require('../controllers/businessController')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', businessController.getAllBusinesses)
router.get('/id/:id', businessController.getBusinessById)
router.post('/register', businessController.registerBusiness)

module.exports = router;
