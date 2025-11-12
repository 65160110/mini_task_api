const userService = require('../../../services/user.service');
const { getTaskById } = require('../../../services/task.service'); // (เราไม่ได้ใช้ getTaskById ที่นี่ ลบออกได้)

/**
 * (Controller) ดึงข้อมูลตัวเอง
 */
const getMe = async (req, res) => {
    // "authenticate" middleware ทำงานแล้ว
    // เราเลยมี req.user ให้ใช้
    const user = req.user;
    // (ควรไปดึงข้อมูลล่าสุดจาก DB แต่เพื่อความง่าย เราใช้ข้อมูลจาก Token)
    res.status(200).json(user);
};

/**
 * (Controller) ดึง User ทั้งหมด (Admin only)
 */
const listUsers = async (req, res) => {
    try {
        const users = await userService.listUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('List Users Error:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list users' } });
    }
};

// --- [เพิ่ม 2 ฟังก์ชันนี้] ---

/**
 * (Controller) อัปเดตข้อมูลตัวเอง (ชื่อ)
 */
const updateMe = async (req, res) => {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Name is required' } });
    }

    try {
        const success = await userService.updateUserById(userId, { name });
        if (success) {
            return res.status(200).json({ message: 'User updated successfully' });
        } else {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
        }
    } catch (error) {
        console.error('Update Me Error:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update user' } });
    }
};

/**
 * (Controller) ลบบัญชีตัวเอง
 */
const deleteMe = async (req, res) => {
    const userId = req.user.userId;
    try {
        const success = await userService.deleteUserById(userId);
        if (success) {
            // (ควรจะ Blacklist refresh token ที่นี่ด้วย)
            return res.status(200).json({ message: 'User deleted successfully' });
        } else {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
        }
    } catch (error) {
        console.error('Delete Me Error:', error);
        // (อาจจะพังเพราะ Foreign Key ถ้า user ยังมี task ค้างอยู่
        // แต่เราตั้งค่า ON DELETE CASCADE ไว้ในตาราง tasks แล้ว)
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete user' } });
    }
};

module.exports = {
    getMe,
    listUsers,
    updateMe, // <-- เพิ่ม
    deleteMe, // <-- เพิ่ม
};