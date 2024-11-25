// ./api/businesses

const express = require('express');
const businessController = require('../controllers/businessController')
const { authenticateRequest } = require('../middleware/authMiddleware');

const router = express.Router()

router.use(authenticateRequest);

router.get('/', businessController.getAllBusinesses)
router.get('/id/:id', businessController.getBusinessById)
router.post('/register', businessController.registerBusiness)
router.delete('/delete/:id', businessController.deleteBusiness)
router.put('/update', businessController.updateBusiness)

module.exports = router;
