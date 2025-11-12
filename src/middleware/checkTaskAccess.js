const taskService = require('../services/task.service');

const checkTaskAccess = (action) => {
    
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
            }

            const taskId = req.params.id;

            const task = await taskService.getTaskById(taskId);

            if (!task) {
                return res.status(404).json({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Task not found'
                    }
                });
            }

            let isAllowed = false;

            switch (action) {
                case 'read':
                    // --- [นี่คือจุดที่แก้] ---
                    // เราเปลี่ยนจาก === true มาเป็น == true
                    // เพื่อให้มันยอมรับค่า '1' (จาก DB) ว่าเท่ากับ 'true'
                    isAllowed = 
                        task.isPublic == true || 
                        user.userId === task.ownerId ||
                        user.userId === task.assignedTo ||
                        user.role === 'admin';
                    // --- [จบจุดที่แก้] ---
                    break;
                
                case 'write': // (Update/Delete)
                    isAllowed =
                        user.userId === task.ownerId ||
                        user.role === 'admin';
                    break;
                
                default:
                    isAllowed = false;
            }

            if (isAllowed) {
                req.task = task;
                next(); // อนุญาต
            } else {
                return res.status(403).json({
                    error: {
                        code: 'FORBIDDEN',
                        message: 'You do not have permission to perform this action on this task'
                    }
                });
            }

        } catch (error) {
            console.error('Check Task Access Error:', error);
            return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error checking task access' } });
        }
    };
};

module.exports = checkTaskAccess;