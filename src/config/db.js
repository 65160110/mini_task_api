const mysql = require('mysql2/promise');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = require('./env');

// สร้าง Connection Pool
// Pool จะจัดการการเชื่อมต่อหลายๆ อันพร้อมกัน และนำกลับมาใช้ใหม่
const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 10, // ตั้งค่าจำนวน connection สูงสุด
    queueLimit: 0
});

// (ทางเลือก) ฟังก์ชันสำหรับทดสอบการเชื่อมต่อ
const checkConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully!');
        connection.release();
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
};

// ทดสอบการเชื่อมต่อเมื่อไฟล์นี้ถูกเรียกใช้
checkConnection();

// Export 'pool' ออกไปให้ 'services' ใช้
module.exports = pool;