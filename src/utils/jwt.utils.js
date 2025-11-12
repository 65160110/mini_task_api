const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require('../config/env');

// สร้าง Access Token (15 นาที)
const generateAccessToken = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
    };
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

// สร้าง Refresh Token (7 วัน)
const generateRefreshToken = (user, tokenId) => {
    // Payload ต้องมี tokenId ตามโจทย์ [cite: 221]
    const payload = {
        userId: user.id,
        tokenId: tokenId,
    };
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// ตรวจสอบ Access Token
const verifyAccessToken = (token) => {
    try {
        const decodedPayload = jwt.verify(token, ACCESS_TOKEN_SECRET);
        return decodedPayload;
    } catch (error) {
        return null;
    }
};

// --- [เพิ่มฟังก์ชันนี้] ---
// ตรวจสอบ Refresh Token
const verifyRefreshToken = (token) => {
    try {
        const decodedPayload = jwt.verify(token, REFRESH_TOKEN_SECRET);
        return decodedPayload; // คืนค่า { userId, tokenId }
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken, // <-- เพิ่ม
};