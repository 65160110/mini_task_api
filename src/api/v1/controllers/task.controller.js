const taskService = require('../../../services/task.service');
const pool = require('../../../config/db');

/**
 * (Controller) สร้าง Task
 */
const createTask = async (req, res) => {
    const ownerId = req.user.userId;
    const { idempotencyKey, bodyHash } = req;
    try {
        const newTask = await taskService.createTask(req.body, ownerId);
        if (!newTask) {
             return res.status(500).json({ error: { code: 'TASK_CREATION_FAILED', message: 'Failed to create task' } });
        }
        const responseStatus = 201;
        const responseBody = JSON.stringify(newTask);
        try {
            await pool.query(
                'INSERT INTO idempotency_keys (id_key, response_status, response_body, request_hash) VALUES (?, ?, ?, ?)',
                [idempotencyKey, responseStatus, responseBody, bodyHash]
            );
        } catch (dbError) {
            if (dbError.code !== 'ER_DUP_ENTRY') {
                console.warn('Failed to save idempotency key (non-critical):', dbError);
            }
        }
        return res.status(responseStatus).json(newTask);
    } catch (error) {
        console.error('Create Task Error:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create task' } });
    }
};

/**
 * (Controller) อัปเดต Status
 */
const updateTaskStatus = async (req, res) => {
    const taskId = req.params.id;
    const { status } = req.body;
    if (!['pending', 'in progress', 'completed'].includes(status)) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid status' }});
    }
    try {
        const success = await taskService.updateTaskStatus(taskId, status);
        if (success) {
            return res.status(200).json({ message: 'Status updated' });
        } else {
             return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found or no change' }});
        }
    } catch (error) {
         console.error('Update Status Error:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update status' } });
    }
};

/**
 * (Controller) ดึง Task 1 ชิ้น
 */
const getTaskById = async (req, res) => {
    if (req.task) {
        return res.status(200).json(req.task);
    }
    try {
        const task = await taskService.getTaskById(req.params.id);
        if (task) {
            return res.status(200).json(task);
        } else {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' }});
        }
    } catch (error) {
        console.error('Get Task By Id Error:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error getting task' } });
    }
};

/**
 * (Controller) ดึง Task ทั้งหมด
 */
const listTasks = async (req, res) => {
    const ownerId = req.user.userId;
    const filters = req.query;
    try {
        const tasks = await taskService.listTasksByOwner(ownerId, filters);
        return res.status(200).json(tasks);
    } catch (error) {
        console.error('List Tasks Error:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list tasks' } });
    }
};

// --- [เพิ่ม 2 ฟังก์ชันนี้] ---

/**
 * (Controller) อัปเดต Task (PUT)
 */
const updateTask = async (req, res) => {
    // (Middleware 'checkTaskAccess('write')' ทำงานไปแล้ว)
    const taskId = req.params.id;
    // (สำหรับ PUT เราคาดหวังว่า body จะมีข้อมูลครบทุก field)
    const { title, description, priority, status, isPublic, assignedTo } = req.body;

    // (ควรมีการ Validation 400 ที่นี่ ว่า title, status ฯลฯ ไม่ได้ว่างมา)
    if (!title || !status) {
         return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Title and status are required for PUT' }});
    }

    try {
        const success = await taskService.updateTask(taskId, req.body);
        if (success) {
            // ดึง Task ที่อัปเดตแล้วกลับไป
            const updatedTask = await taskService.getTaskById(taskId);
            return res.status(200).json(updatedTask);
        } else {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' }});
        }
    } catch (error) {
        console.error('Update Task Error:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update task' } });
    }
};

/**
 * (Controller) ลบ Task (DELETE)
 */
const deleteTask = async (req, res) => {
    // (Middleware 'checkTaskAccess('write')' ทำงานไปแล้ว)
    const taskId = req.params.id;

    try {
        const success = await taskService.deleteTask(taskId);
        if (success) {
            // 200 OK หรือ 204 No Content ก็ได้
            return res.status(200).json({ message: 'Task deleted successfully' });
        } else {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' }});
        }
    } catch (error) {
        console.error('Delete Task Error:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete task' } });
    }
};

module.exports = {
    createTask,
    updateTaskStatus,
    getTaskById,
    listTasks,
    updateTask, // <-- เพิ่ม
    deleteTask, // <-- เพิ่ม
};