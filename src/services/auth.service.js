const { v4: uuidv4 } = require('uuid');
const { hashPassword, comparePassword } = require('../utils/hash.utils');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');
const pool = require('../config/db');
// const userService = require('../services/user.service'); // Note: ไม่จำเป็นต้องใช้ service ของ user ที่นี่

/**
 * (Service) สมัครสมาชิก
 */
const registerNewUser = async (userData) => {
    const { email, password, name } = userData;
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
        console.log('Service: Email นี้ถูกใช้แล้ว');
        return null; 
    }
    const hashedPassword = await hashPassword(password);
    const newUserId = uuidv4();
    // กำหนดค่า default สำหรับ isPremium และ subscriptionExpiry
    const newUser = { 
        id: newUserId, 
        email, 
        password: hashedPassword, 
        name, 
        role: 'user', 
        isPremium: false,
        subscriptionExpiry: null
    };
    try {
        // [ปรับปรุง] เพิ่มการระบุคอลัมน์ subscriptionExpiry ใน INSERT เพื่อให้ชัดเจน
        await pool.query('INSERT INTO users (id, email, password, name, role, isPremium, subscriptionExpiry) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [newUser.id, newUser.email, newUser.password, newUser.name, newUser.role, newUser.isPremium, newUser.subscriptionExpiry]
        );
    } catch (error) {
        console.error('Error saving user to DB:', error);
        return null;
    }
    const userResponse = { ...newUser };
    delete userResponse.password;
    return userResponse;
};

/**
 * (Service) ล็อกอิน (อัปเกรด: บันทึก tokenId)
 */
const loginUser = async (email, password) => {
    // ดึงข้อมูลทั้งหมดที่จำเป็นสำหรับสร้าง Token และเช็ค Password
    const [users] = await pool.query('SELECT id, password, email, role, isPremium, currentTokenId FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
        console.log('Service: ไม่พบ user นี้');
        return null;
    }
    const user = users[0];
    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch) {
        console.log('Service: รหัสผ่านผิด');
        return null;
    }

    // สร้าง tokenId ใหม่เพื่อใช้เป็นตัว Blacklist ตัวเก่า
    const tokenId = uuidv4();
    await pool.query('UPDATE users SET currentTokenId = ? WHERE id = ?', [tokenId, user.id]);

    // สร้าง Tokens (ส่ง tokenId ให้ Refresh Token)
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, tokenId);

    return { accessToken, refreshToken };
};

/**
 * (Service) ต่ออายุ Token (Refresh)
 */
const refreshUserToken = async (refreshToken) => {
    // 1. ตรวจสอบ Refresh Token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
        return null; // Token ไม่ถูกต้อง หรือหมดอายุ
    }
    
    const { userId, tokenId } = decoded;

    // 2. [ปรับปรุง] ดึงข้อมูล user ทั้งหมดและ currentTokenId ใน Query เดียว
    const [userResult] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = userResult[0];

    if (!user || user.currentTokenId !== tokenId) {
        console.log('Service: Refresh token is blacklisted or invalid');
        return null; // Token นี้ถูก Logout ไปแล้ว หรือเป็น Token เก่า
    }

    // 3. ถ้าผ่าน, สร้าง Access Token ใหม่
    // (ใช้ข้อมูล user ที่ดึงมาในข้อ 2 เลย)
    const newAccessToken = generateAccessToken(user);
    return { accessToken: newAccessToken };
};

/**
 * (Service) ล็อกเอาท์ (Blacklist)
 */
const logoutUser = async (userId) => {
    // 1. ล้าง currentTokenId ใน DB (นี่คือการ Blacklist)
    const [result] = await pool.query(
        'UPDATE users SET currentTokenId = NULL WHERE id = ?',
        [userId]
    );
    return result.affectedRows > 0;
};

module.exports = {
    registerNewUser,
    loginUser,
    refreshUserToken,
    logoutUser,
};