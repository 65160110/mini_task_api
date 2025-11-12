const ApiError = require('../utils/apiError.utils');

const errorHandler = (err, req, res, next) => {
    // 1. ตรวจสอบว่าเป็น Error ที่เรารู้จัก (ApiError) หรือไม่
    if (err instanceof ApiError) {
        // ถ้าใช่ ให้ตอบกลับตาม format ที่เราต้องการ
        return res.status(err.statusCode).json({
            error: {
                code: err.errorCode,
                message: err.message,
                details: err.details,
                timestamp: new Date().toISOString(),
                path: req.originalUrl,
            }
        });
    }

    // 2. ถ้าเป็น Error ที่ไม่รู้จัก (เช่น DB crash, Syntax Error) ให้ตอบกลับ 500
    console.error('Unhandled Internal Server Error:', err); // [cite: 175-190]
    return res.status(500).json({
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong on the server",
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
        }
    });
};

module.exports = errorHandler;