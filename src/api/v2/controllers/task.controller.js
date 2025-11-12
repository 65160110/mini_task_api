// [สำคัญ] เรา import service ตัวเดียวกับที่ v1 ใช้
const taskService = require('../../../services/task.service');

/**
 * (Controller V2) ดึง Task 1 ชิ้น
 */
const getTaskById = async (req, res) => {
    // (Middleware 'authenticate' และ 'checkTaskAccess('read')' ทำงานไปแล้ว)
    // เราสามารถใช้ req.task ที่ middleware ดึงมาให้ได้เลย
    const task = req.task; 

    if (!task) {
        // (เผื่อไว้เฉยๆ ปกติ middleware จะกัน 404 ให้แล้ว)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }

    // --- [นี่คือจุดต่างของ V2] ---
    // สร้าง Response V2 โดยเพิ่ม "metadata"
    const v2Response = {
        id: task.id,
        title: task.title,
        status: task.status,
        description: task.description,
        priority: task.priority,
        ownerId: task.ownerId,
        // ... (ใส่ field อื่นๆ ของ task ที่ v2 ต้องการ) ...
        metadata: {
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            version: "v2" // ระบุว่าเป็น v2
        }
    };
    // --- [จบจุดต่าง] ---

    return res.status(200).json(v2Response);
};

// (คุณต้องทำแบบนี้กับ listTasks V2 ด้วย)
// (ตอนนี้เราทำแค่ getTaskById V2 เป็นตัวอย่างก่อน)

module.exports = {
    getTaskById,
};