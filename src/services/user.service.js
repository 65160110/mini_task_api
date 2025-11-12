const pool = require('../config/db');

/**
 * (Service) ดึง User ทั้งหมด (สำหรับ Admin)
 */
const listUsers = async () => {
    const [users] = await pool.query('SELECT id, email, name, role, isPremium FROM users');
    return users;
};

/**
 * (Service) อัปเดตข้อมูล User (สำหรับ /me)
 */
const updateUserById = async (userId, userData) => {
    // อนุญาตให้อัปเดตแค่ 2 field นี้
    const { name } = userData;
    
    const [result] = await pool.query(
        'UPDATE users SET name = ? WHERE id = ?',
        [name, userId]
    );
    return result.affectedRows > 0;
};

/**
 * (Service) ลบ User (สำหรับ /me)
 */
const deleteUserById = async (userId) => {
    const [result] = await pool.query(
        'DELETE FROM users WHERE id = ?',
        [userId]
    );
    return result.affectedRows > 0;
};

module.exports = {
    listUsers,
    updateUserById,
    deleteUserById,
};