//./api/sessions

const express = require('express');
const sessionsController = require('../controllers/sessionController')
const { authenticateRequest } = require('../middleware/authMiddleware');

const router = express.Router()

router.use(authenticateRequest);

router.get('/', sessionsController.getAllSessions)

module.exports = router;
