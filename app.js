// 1. โหลดตัวแปร .env ก่อน (สำคัญมาก)
const { PORT } = require('./src/config/env');

const express = require('express');

// --- Import Middleware (ยาม) ---
const authenticate = require('./src/middleware/authenticate');
const errorHandler = require('./src/middleware/errorHandler'); // <-- Global Error Handler

// --- Import Routes (เส้นทาง) ---
const v1AuthRoutes = require('./src/api/v1/routes/auth.routes');
const v1UserRoutes = require('./src/api/v1/routes/user.routes');
const v1TaskRoutes = require('./src/api/v1/routes/task.routes');
const v2TaskRoutes = require('./src/api/v2/routes/task.routes');

const app = express();
const port = PORT || 3000;

// --- 2. Global Middleware ---
// (ต้องมี ไม่งั้น req.body จะเป็น undefined)
app.use(express.json()); 

// --- 3. Route Groups ---

// V1 Auth Routes (Public: /register, /login, /refresh, Private: /logout)
// *Logout ใช้ authenticate ที่ถูก import ไว้ใน auth.routes.js แล้ว*
app.use('/api/v1/auth', v1AuthRoutes); 

// V1/V2 Protected Routes (ใช้ authenticate ดักไว้ที่ Group Level)
// *Rate Limiter ถูกใส่ไว้ในไฟล์ routes ภายในแล้ว*
app.use('/api/v1/users', authenticate, v1UserRoutes);
app.use('/api/v1/tasks', authenticate, v1TaskRoutes);
app.use('/api/v2/tasks', authenticate, v2TaskRoutes);

// --- 4. Global Error Handler (ต้องอยู่ท้ายสุด) ---
// Middleware นี้จะดักจับ Error ที่หลุดออกมาจากทุกส่วน (400, 500)
app.use(errorHandler);


// --- 5. Start Server ---
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});