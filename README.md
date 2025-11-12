Mini-Task API
โปรเจกต์นี้เป็น API สำหรับจัดการ Task ที่มีระบบสมาชิก การยืนยันตัวตน (Authentication) และการจัดการสิทธิ์ (Authorization) ตาม Role ของผู้ใช้งาน

Features
คุณสมบัติ,กลไกการทำงาน
การยืนยันตัวตน (Authentication),ผู้ใช้สมัครสมาชิก (register) โดยมีการเข้ารหัสรหัสผ่าน (Password Hashing) และเข้าสู่ระบบ (login) เพื่อรับ JWT Token
การเข้าถึง (Protected Routes),Endpoints ส่วนใหญ่ถูกป้องกัน และต้องแสดง JWT Bearer Token ใน Header เพื่อยืนยันตัวตน
การจัดการ Error,จัดการ Error Response ในรูปแบบ JSON ที่เป็นมาตรฐานเดียวกัน (Standardized Error Handling)
RBAC (Role-Based Access Control),"แบ่งผู้ใช้งานเป็น 3 Roles: user, premium, และ admin เพื่อควบคุมสิทธิ์ 
Backend Core,"Node.js, Express.js",โครงสร้างหลักของ API.
Database System,"phpMyAdmin, MySQL",เครื่องมือและระบบจัดการฐานข้อมูล.
Database Driver,mysql2,สำหรับเชื่อมต่อฐานข้อมูล MySQL.
Security/Auth,"jsonwebtoken, bcryptjs",ใช้สำหรับสร้าง/ยืนยัน JWT และ Hash รหัสผ่าน.
Utilities,"dotenv, nodemon",จัดการ Environment Variables และ Auto-restart Server.
ก่อนจะเริ่ม โปรดตรวจสอบให้แน่ใจว่าคุณได้ติดตั้งโปรแกรมเหล่านี้แล้ว:

🛠️ Prerequisites (สิ่งที่ต้องติดตั้ง)
Node.js (LTS version).
Github.
Postman.
โปรแกรมฐานข้อมูล MySQL (เช่น XAMPP).
🚀 Installation & Setup
ทำตามขั้นตอนต่อไปนี้เพื่อติดตั้งและรันโปรเจกต์บนเครื่องของคุณ

Clone the repository:
git clone [https://github.com/65160110/mini_task_api.git]
cd mini-task-api
Install dependency
npm install
Database Setup
เปิด phpMyAdmin

สร้าง Database ใหม่ชื่อ mini-task-api (Collation เป็น utf8mb4_unicode_ci)

ไปที่แท็บ SQL แล้วรัน Script ข้างล่างนี้เพื่อสร้างตารางที่จำเป็นทั้งหมด:

SQL สำหรับสร้างตาราง CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('user','premium','admin') NOT NULL DEFAULT 'user',
  `isPremium` tinyint(1) NOT NULL DEFAULT 0,
  `subscriptionExpiry` timestamp NULL DEFAULT NULL,
  `currentTokenId` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

คอลัมน์,ประเภทข้อมูล,รายละเอียด
id,VARCHAR(255),คีย์หลัก (Primary Key). ID ผู้ใช้ในรูปแบบ UUID.
email,VARCHAR(255),อีเมลของผู้ใช้งาน (ต้องไม่ซ้ำกัน).
password,VARCHAR(255),รหัสผ่านที่ถูก Hash แล้ว.
name,VARCHAR(255),ชื่อของผู้ใช้งาน.
role,"ENUM('user','premium','admin')",สิทธิ์การเข้าถึงของผู้ใช้งาน (ค่าเริ่มต้นคือ 'user').
isPremium,TINYINT(1),"สถานะสมาชิกพรีเมียม (0=No, 1=Yes)."
subscriptionExpiry,TIMESTAMP NULL,วันที่หมดอายุสมาชิกพรีเมียม.
currentTokenId,VARCHAR(255) DEFAULT NULL,ID ของ Refresh Token ล่าสุดที่ใช้งานอยู่.
createdAt,TIMESTAMP,วันที่สร้างบัญชี.
updatedAt,TIMESTAMP,วันที่อัปเดตข้อมูลล่าสุด.

SQL สำหรับสร้างตาราง tasks CREATE TABLE `tasks` (
  `id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','in progress','completed') NOT NULL DEFAULT 'pending',
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'low',
  `ownerId` varchar(255) NOT NULL,
  `assignedTo` varchar(255) DEFAULT NULL,
  `isPublic` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

 คอลัมน์,ประเภทข้อมูล,รายละเอียด
id,VARCHAR(255),คีย์หลัก (Primary Key). ID งานในรูปแบบ UUID.
title,VARCHAR(255),ชื่องาน.
description,TEXT DEFAULT NULL,รายละเอียดของงาน.
status,"ENUM('pending','in progress','completed')",สถานะของงาน (ค่าเริ่มต้นคือ 'pending').
priority,"ENUM('low','medium','high')",ลำดับความสำคัญของงาน (ค่าเริ่มต้นคือ 'low').
ownerId,VARCHAR(255),Foreign Key ไปยัง users.id ผู้สร้างงาน.
assignedTo,VARCHAR(255) DEFAULT NULL,Foreign Key ไปยัง users.id ผู้ที่ถูกมอบหมายงาน.
isPublic,TINYINT(1) DEFAULT 0,"สถานะการเข้าถึง (0=Private, 1=Public)."
createdAt,TIMESTAMP,วันที่สร้างงาน.
updatedAt,TIMESTAMP,วันที่อัปเดตข้อมูลล่าสุด.


CREATE TABLE `idempotency_keys` (
  `id_key` varchar(255) NOT NULL,
  `response_body` text NOT NULL,
  `response_status` int(11) NOT NULL DEFAULT 201,
  `request_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

คอลัมน์,ประเภทข้อมูล,รายละเอียด
id_key,VARCHAR(255),คีย์หลัก (Primary Key). Idempotency Key ที่ส่งมากับ Request.
response_body,TEXT,Response Body ของการร้องขอครั้งแรก.
response_status,INT(11) DEFAULT 201,HTTP Status Code ของการตอบสนองครั้งแรก.
request_hash,VARCHAR(255) DEFAULT NULL,Hash ของ Request Body ที่ใช้ในการยืนยันความถูกต้องของการร้องขอซ้ำ.
created_at,TIMESTAMP,วันที่และเวลาที่บันทึก Idempotency Key นี้.

Environment Variables
สร้างไฟล์ใหม่ใน root ของโปรเจกต์ชื่อว่า .env

คัดลอกเนื้อหาข้างล่างนี้ไปวางในไฟล์ .env DB_HOST=localhost DB_USER=root DB_PASSWORD= # <-- ใส่รหัสผ่าน MySQL ของคุณ (ถ้าไม่มีให้เว้นว่าง) DB_DATABASE=mini-task-api

JWT_SECRET	นี่คือ คีย์ลับ ที่ใช้ในการเข้ารหัสและถอดรหัส (Sign/Verify) Access Token ซึ่งจำเป็นต่อการใช้งาน Protected Routes

JWT_REFRESH_SECRET ระบบที่ใช้ Access Token ที่อายุสั้น (15m) จำเป็น ต้องใช้ Refresh Token ที่อายุยาวกว่า และต้องใช้คีย์ลับที่ แตกต่างกัน เพื่อเพิ่มความปลอดภัย

JWT_REFRESH_EXPIRE กำหนดอายุของ Refresh Token (มักจะเป็น 7 วัน หรือ 30 วัน) เพื่อให้ผู้ใช้ไม่ต้องล็อกอินใหม่บ่อยๆ

Running Application
เมื่อตั้งค่าทุกอย่างสำเร็จ ให้เปิด Terminal แล้วรันคำสั่ง npm run dev
Endpoints

POST,/api/v1/tasks,"สร้าง Task ใหม่ (Body: title, description, priority).",Protected
GET,/api/v1/tasks/:id,ดูรายละเอียด Task ตาม ID (เช่น /api/v1/tasks/ef55035d-8c2d-41df...),Protected
PUT,/api/v1/tasks/:id,อัปเดต Task ตาม ID,Protected
DEL,/api/v1/tasks/:id,ลบ Task ตาม ID,Protected
GET,/api/v2/tasks/:id,(อาจเป็น Version 2 ของ API สำหรับ Task),Protected
GET,/api/v1/tasks/wtf,(Endpoint สำหรับการทดสอบ/Endpoint ที่ไม่ชัดเจน),Protected