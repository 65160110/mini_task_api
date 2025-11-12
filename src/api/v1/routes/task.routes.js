const express = require('express');
const router = express.Router();

// --- Import "ยาม" และ Controller ทั้งหมด ---
const taskController = require('../controllers/task.controller');
const checkTaskAccess = require('../../../middleware/checkTaskAccess');
const idempotencyCheck = require('../../../middleware/idempotencyCheck');
const { checkHighPriorityTask } = require('../../../middleware/checkPremium'); // <-- [สำคัญ] Import ยามตัวใหม่

// (authenticate อยู่ที่ app.js แล้ว)

// --- Endpoint: ดู Task ทั้งหมด (List) ---
router.get('/', taskController.listTasks);

// --- Endpoint: สร้าง Task ---
router.post(
    '/',
    idempotencyCheck,         // 1. เช็ค Idempotency Key
    checkHighPriorityTask,    // 2. [ใหม่] เช็ค Premium ถ้า priority='high'
    taskController.createTask // 3. สร้าง Task
);

// --- Endpoint: ดู Task 1 ชิ้น ---
router.get(
    '/:id',
    checkTaskAccess('read'),
    taskController.getTaskById
);

// --- Endpoint: เปลี่ยน Status ---
router.patch(
    '/:id/status',
    checkTaskAccess('write'),
    taskController.updateTaskStatus
);

// --- Endpoint: อัปเดต Task (Full Update) ---
router.put(
    '/:id',
    checkTaskAccess('write'),
    taskController.updateTask
);

// --- Endpoint: ลบ Task ---
router.delete(
    '/:id',
    checkTaskAccess('write'),
    taskController.deleteTask
);

module.exports = router;