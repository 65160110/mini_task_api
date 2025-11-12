const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../../../middleware/authenticate'); // (Logout ต้องใช้)

// (Public Routes)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// (Authenticated Route)
// POST /api/v1/auth/logout
router.post('/logout', authenticate, authController.logout);

module.exports = router;