// ./api/referrals

const express = require('express');
const referralController = require('../controllers/referralController')
const { authenticateRequest } = require('../middleware/authMiddleware');

const router = express.Router()

router.use(authenticateRequest);

router.get('/', referralController.getAllReferrals)
router.get('/id/:id', referralController.getReferralById)
router.post('/refer', referralController.referUser)

module.exports = router;
