const authService = require('../../../services/auth.service');

// (register controller - เหมือนเดิม)
const register = async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Email, password, and name are required' } });
    }
    try {
        const newUser = await authService.registerNewUser(req.body);
        if (!newUser) {
            return res.status(409).json({ error: { code: 'CONFLICT', message: 'Email already exists' } });
        }
        return res.status(201).json(newUser);
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' } });
    }
};

// (login controller - เหมือนเดิม)
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } });
    }
    try {
        const tokens = await authService.loginUser(email, password);
        if (!tokens) {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
        }
        return res.status(200).json(tokens);
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' } });
    }
};

// --- [เพิ่ม 2 ฟังก์ชันนี้] ---

/**
 * (Controller) ต่ออายุ Token (Refresh)
 */
const refresh = async (req, res) => {
    const { refreshToken } = req.body; // (เราคาดหวังว่า client จะส่ง refreshToken มาใน body)
    
    if (!refreshToken) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Refresh token is required' } });
    }

    try {
        const result = await authService.refreshUserToken(refreshToken);
        if (!result) {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' } });
        }
        return res.status(200).json(result); // (ส่ง accessToken ใหม่กลับไป)
    } catch (error) {
        console.error('Refresh Token Error:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' } });
    }
};

/**
 * (Controller) ล็อกเอาท์
 */
const logout = async (req, res) => {
    const userId = req.user.userId; // (ได้มาจาก 'authenticate' middleware)
    try {
        await authService.logoutUser(userId);
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout Error:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' } });
    }
};

module.exports = {
    register,
    login,
    refresh, // <-- เพิ่ม
    logout,  // <-- เพิ่ม
};