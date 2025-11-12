const crypto = require('crypto');
const pool = require('../config/db'); // <-- [สำคัญ] Import DB Pool ของจริง

const idempotencyCheck = async (req, res, next) => {
    // 1. ดึง Key จาก Header
    const idempotencyKey = req.headers['idempotency-key'];

    // 2. ถ้าไม่มี Key
    if (!idempotencyKey) {
        return res.status(400).json({
            error: {
                code: 'BAD_REQUEST',
                message: 'Idempotency-Key header is missing'
            }
        });
    }

    // 3. สร้าง "ลายนิ้วมือ" (hash) ของ request body
    const bodyHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(req.body))
        .digest('hex');
    
    // --- [UPGRADED] ---
    // 4. ค้นหา Key ใน DB (ด้วย Query จริง)
    let savedRecord;
    try {
        const [rows] = await pool.query(
            // (โจทย์ระบุว่า key expire 24 ชม.)
            'SELECT * FROM idempotency_keys WHERE id_key = ? AND created_at > NOW() - INTERVAL 24 HOUR', 
            [idempotencyKey]
        );
        if (rows.length > 0) {
            savedRecord = rows[0];
        }
    } catch (error) {
        console.error('Idempotency check DB error:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error checking idempotency' } });
    }
    // --- [END UPGRADE] ---

    
    if (savedRecord) {
        // 5. ถ้าเจอ Key
        if (savedRecord.request_hash === bodyHash) {
            // 5a. [cite_start]Key ตรง, Body ตรง -> คืน Response เดิม (ที่เซฟไว้) [cite: 157]
            console.log('Idempotency: Key found, body matches. Returning saved response.');
            return res
                .status(savedRecord.response_status)
                .json(JSON.parse(savedRecord.response_body));
        } else {
            // 5b. [cite_start]Key ตรง, แต่ Body ไม่ตรง -> 409 Conflict [cite: 188]
            console.log('Idempotency: Key found, but body conflicts.');
            return res.status(409).json({
                error: {
                    code: 'CONFLICT',
                    message: 'Idempotency key reused with a different request body'
                }
            });
        }
    } else {
        // 6. ถ้าไม่เจอ Key -> นี่คือ request ใหม่
        // แนบ Key กับ Hash ไปกับ req เพื่อให้ controller เอาไปใช้บันทึก
        req.idempotencyKey = idempotencyKey;
        req.bodyHash = bodyHash;
        next(); // ส่งต่อไปให้ controller ทำงาน
    }
};

module.exports = idempotencyCheck;