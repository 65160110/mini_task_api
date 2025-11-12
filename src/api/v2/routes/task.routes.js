const express = require('express');
const router = express.Router();

// 1. [สำคัญ] Import controller จาก v2
const taskControllerV2 = require('../controllers/task.controller');

// 2. [สำคัญ] Import middleware ตัวเดิม (ใช้ยามชุดเดิม)
const checkTaskAccess = require('../../../middleware/checkTaskAccess');
// (authenticate อยู่ที่ app.js แล้ว)

// --- Endpoint V2: ดู Task 1 ชิ้น ---
// GET /api/v2/tasks/:id
router.get(
    '/:id',
    checkTaskAccess('read'),      // 1. เช็คสิทธิ์ (ABAC)
    taskControllerV2.getTaskById  // 2. เรียก controller v2
);

// (คุณต้องสร้าง v2 routes อื่นๆ ให้ครบตาม v1)

module.exports = router;