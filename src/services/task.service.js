const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * (Service) ดึง Task 1 ชิ้นจาก ID
 */
const getTaskById = async (taskId) => {
    const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (tasks.length === 0) {
        return null;
    }
    return tasks[0];
};

/**
 * (Service) สร้าง Task ใหม่ลง DB
 */
const createTask = async (taskData, ownerId) => {
    const taskId = uuidv4();
    const { title, description, priority, isPublic, assignedTo } = taskData;
    const newTask = {
        id: taskId,
        title,
        description: description || null,
        priority: priority || 'low',
        status: 'pending',
        ownerId: ownerId,
        isPublic: isPublic || false,
        assignedTo: assignedTo || null
    };
    await pool.query(
        'INSERT INTO tasks (id, title, description, priority, status, ownerId, isPublic, assignedTo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
            newTask.id, newTask.title, newTask.description, newTask.priority,
            newTask.status, newTask.ownerId, newTask.isPublic, newTask.assignedTo
        ]
    );
    return newTask;
};

/**
 * (Service) อัปเดต Status ของ Task (PATCH)
 */
const updateTaskStatus = async (taskId, status) => {
    const [result] = await pool.query(
        'UPDATE tasks SET status = ? WHERE id = ?',
        [status, taskId]
    );
    return result.affectedRows > 0;
};

/**
 * (Service) ดึง Task ทั้งหมด (พร้อม Filtering)
 */
const listTasksByOwner = async (ownerId, filters) => {
    let query = 'SELECT * FROM tasks WHERE (ownerId = ? OR assignedTo = ?)';
    let params = [ownerId, ownerId];

    if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
    }
    if (filters.priority) {
        query += ' AND priority = ?';
        params.push(filters.priority);
    }
    if (filters.isPublic) {
        query += ' AND isPublic = ?';
        params.push(filters.isPublic === 'true');
    }
    
    if (filters.sort) {
        const [field, direction] = filters.sort.split(':');
        const allowedSortFields = ['createdAt', 'updatedAt', 'priority'];
        if (allowedSortFields.includes(field)) {
            query += ` ORDER BY ?? ${direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
            params.push(field);
        }
    }

    if (filters.page && filters.limit) {
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 10;
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
    }

    const [tasks] = await pool.query(query, params);
    return tasks;
};

/**
 * (Service) อัปเดต Task ทั้งตัว (PUT)
 */
const updateTask = async (taskId, taskData) => {
    const { title, description, priority, status, isPublic, assignedTo } = taskData;
    
    // (โจทย์ระบุ PUT /tasks/:id (full update))
    const [result] = await pool.query(
        `UPDATE tasks SET 
            title = ?, 
            description = ?, 
            priority = ?, 
            status = ?, 
            isPublic = ?, 
            assignedTo = ? 
        WHERE id = ?`,
        [
            title, 
            description || null, 
            priority || 'low', 
            status || 'pending', 
            isPublic || false, 
            assignedTo || null, 
            taskId
        ]
    );
    return result.affectedRows > 0;
};

/**
 * (Service) ลบ Task (DELETE)
 */
const deleteTask = async (taskId) => {
    const [result] = await pool.query(
        'DELETE FROM tasks WHERE id = ?',
        [taskId]
    );
    return result.affectedRows > 0;
};

module.exports = {
    getTaskById,
    createTask,
    updateTaskStatus,
    listTasksByOwner,
    updateTask,
    deleteTask,
};