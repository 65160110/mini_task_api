// ฟังก์ชันนี้เป็น Higher-Order Function
// มันรับ 'roles' (เช่น ['admin']) เข้ามา
// แล้วมันจะคืนค่า 'ฟังก์ชัน' (ที่เป็น middleware) กลับไป
const authorize = (allowedRoles) => {
    
    return (req, res, next) => {
        // 1. ตรวจสอบว่า 'req.user' ถูกสร้างโดย authenticate middleware หรือยัง
        if (!req.user) {
            // (อันนี้ไม่ควรเกิด ถ้าเราวาง middleware ถูกลำดับ)
            return res.status(500).json({
                error: {
                    code: 'SERVER_ERROR',
                    message: 'User not found in request'
                }
            });
        }

        const { role } = req.user;

        // 2. ตรวจสอบว่า 'role' ของ user ที่ล็อกอิน
        // อยู่ใน 'allowedRoles' (อาร์เรย์ของสิทธิ์) ที่เรากำหนดให้ route นี้หรือไม่
        if (allowedRoles.includes(role)) {
            // 3. ถ้าสิทธิ์ถูกต้อง, ปล่อยผ่าน
            next();
        } else {
            // 4. ถ้าสิทธิ์ไม่พอ, คืนค่า 403 Forbidden [cite: 204-206]
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to access this resource'
                }
            });
        }
    };
};

module.exports = authorize;