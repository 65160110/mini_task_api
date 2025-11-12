const express = require('express');
const router = express.Router();

// --- Import "ยาม" และ Controller ---
const userController = require('../controllers/user.controller');
const authorize = require('../../../middleware/authorize');
const apiLimiter = require('../../../middleware/rateLimiter'); // <-- Import Limiter

// --- Endpoint: ดูข้อมูลตัวเอง (ต้องล็อกอิน) ---
// GET /api/v1/users/me
router.get('/me', apiLimiter, userController.getMe); // <-- ใส่ Limiter

// --- Endpoint: อัปเดตข้อมูลตัวเอง ---
// PUT /api/v1/users/me
router.put('/me', apiLimiter, userController.updateMe); // <-- ใส่ Limiter

// --- Endpoint: ลบบัญชีตัวเอง ---
// DELETE /api/v1/users/me
router.delete('/me', apiLimiter, userController.deleteMe); // <-- ใส่ Limiter

// --- Endpoint: ดู User ทั้งหมด (Admin only) ---
// GET /api/v1/users/users
router.get(
    '/users',
    apiLimiter, // <-- ใส่ Limiter
    authorize(['admin']),
    userController.listUsers
);

module.exports = router;
// (หมายเหตุ: ไฟล์ app.js ยังคงมี authenticate ดักไว้ที่ app.use('/api/v1/users', authenticate, ...))