const { verifyAccessToken } = require('../utils/jwt.utils');

const authenticate = (req, res, next) => {
    // 1. ดึงค่า Authorization header
    const authHeader = req.headers['authorization']; // หรือ req.headers.authorization
    
    // 2. ตรวจสอบว่ามี header และมี "Bearer " นำหน้าหรือไม่
    // (รูปแบบที่ถูกต้องคือ "Bearer <token>")
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Access token is missing or invalid'
            }
        });
    }

    // 3. ดึง token ออกมาจาก header (ตัด "Bearer " ทิ้ง)
    const token = authHeader.split(' ')[1];

    try {
        // 4. ตรวจสอบ token
        const decodedPayload = verifyAccessToken(token);

        if (!decodedPayload) {
            // ถ้า verifyAccessToken คืนค่า null (token หมดอายุ หรือไม่ถูกต้อง)
            return res.status(401).json({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Invalid or expired access token'
                }
            });
        }

        // 5. [สำคัญ] ถ้า token ถูกต้อง, แนบข้อมูล user (payload) ไปกับ req
        // เพื่อให้ endpoint ต่อไป (เช่น controller) นำไปใช้ได้ 
        req.user = decodedPayload;
        
        // 6. ส่งต่อไปยัง middleware หรือ controller ตัวถัดไป
        next();

    } catch (error) {
        // (ส่วนนี้เผื่อไว้ ถ้ามี error ที่ไม่คาดคิด)
        return res.status(500).json({
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong during authentication'
            }
        });
    }
};

module.exports = authenticate;