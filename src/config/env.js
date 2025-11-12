const dotenv = require('dotenv');
const path = require('path');

// โหลดไฟล์ .env จาก root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT || 3306,
    
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    PORT: process.env.PORT || 3000
};