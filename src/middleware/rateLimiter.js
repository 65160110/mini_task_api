const rateLimit = require('express-rate-limit');

// ฟังก์ชันนี้จะ "เลือก" Limit ที่ถูกต้องให้ user
const getLimit = (req) => {
    // 1. ตรวจสอบว่า req.user (จาก authenticate middleware) มีอยู่หรือไม่
    if (req.user) {
        // 2. ถ้ามี, ตรวจสอบว่าเป็น premium หรือ admin
        if (req.user.role === 'admin' || req.user.isPremium) {
            return 500; // Premium/Admin: 500 req/15min [cite: 130]
        }
        return 100; // User: 100 req/15min [cite: 129]
    }
    return 20; // Anonymous: 20 req/15min [cite: 128]
};

// สร้าง Rate Limiter Middleware
const apiLimiter = rateLimit({
    // 15 นาที (คิดเป็นมิลลิวินาที)
    windowMs: 15 * 60 * 1000, 
    
    // 'max' จะถูกกำหนดแบบไดนามิกโดยฟังก์ชัน 'getLimit'
    max: (req, res) => getLimit(req),
    
    // Response Headers ที่โจทย์ต้องการ [cite: 131-134]
    headers: true, 
    
    // ข้อความ Error เมื่อติด Limit (429)
    // เราจะปรับ format ให้ตรงตามโจทย์ [cite: 135-142]
    handler: (req, res, next) => {
        const retryAfter = Math.ceil( (res.getHeader('x-ratelimit-reset') * 1000 - Date.now()) / 1000 );
        
        res.status(429).json({
            error: {
                code: "RATE_LIMIT_EXCEEDED",
                message: "Too many requests. Try again later.",
                // (โจทย์ต้องการ retryAfter เป็นวินาที)
                retryAfter: retryAfter || (15 * 60) 
            }
        });
    },
});

module.exports = apiLimiter;