/**
 * Middleware นี้ใช้ตรวจสอบสิทธิ์ Premium (ABAC + RBAC)
 */
const checkPremiumFeature = (req, res, next) => {
    const user = req.user;

    if (user.role === 'admin') {
        return next(); // Admin ผ่าน
    }

    // --- [นี่คือจุดที่แก้] ---
    // เราเปลี่ยนจาก === true มาเป็น == true (หรือใช้ if (user.isPremium))
    // เพื่อให้มันยอมรับค่า '1' (จาก DB) ว่าเท่ากับ 'true'
    if (user.isPremium == true) {
        return next(); // Premium ผ่าน
    }
    // --- [จบจุดที่แก้] ---
    
    // ถ้าไม่ใช่ทั้ง admin และ premium
    return res.status(403).json({
        error: {
            code: 'PREMIUM_REQUIRED',
            message: 'This feature requires a premium subscription or admin role'
        }
    });
};

/**
 * Middleware นี้ใช้กับ POST /tasks โดยเฉพาะ
 */
const checkHighPriorityTask = (req, res, next) => {
    const { priority } = req.body;
    
    if (priority !== 'high') {
        return next(); // ปล่อยผ่าน (User ธรรมดาสร้างได้)
    }

    // ถ้าตั้ง priority: 'high'... ให้เรียก "ยาม" ตัวบนมาทำงาน
    return checkPremiumFeature(req, res, next);
};

module.exports = {
    checkPremiumFeature,
    checkHighPriorityTask,
};