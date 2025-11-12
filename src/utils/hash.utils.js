const bcrypt = require('bcryptjs');

// ฟังก์ชันสำหรับ hash รหัสผ่าน
const hashPassword = async (password) => {
    // 10 คือ "salt rounds" ยิ่งเยอะ ยิ่งปลอดภัย แต่ยิ่งช้า
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

// ฟังก์ชันสำหรับเปรียบเทียบรหัสผ่าน
const comparePassword = async (inputPassword, hashedPassword) => {
    return await bcrypt.compare(inputPassword, hashedPassword);
};

module.exports = {
    hashPassword,
    comparePassword,
};