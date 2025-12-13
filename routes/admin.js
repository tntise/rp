"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
exports.adminRouter = router;
const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
router.use(auth_1.authenticateToken);
router.use(isAdmin);
router.get('/users', (req, res) => {
    try {
        const users = db_1.default.prepare('SELECT id, name, email, role, is_banned, created_at FROM users').all();
        res.json(users);
    }
    catch (e) {
        console.error('GET /users ERROR:', e);
        res.status(500).json({ error: e.message });
    }
});
router.get('/users/:id/employees', (req, res) => {
    const { id } = req.params;
    const employees = db_1.default.prepare('SELECT * FROM employees WHERE user_id = ?').all(id);
    res.json(employees);
});
router.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    // Prevent deleting self? Maybe.
    try {
        db_1.default.prepare('DELETE FROM employees WHERE user_id = ?').run(id);
        const result = db_1.default.prepare('DELETE FROM users WHERE id = ?').run(id);
        if (result.changes === 0)
            return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted' });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
router.post('/users/bulk-delete', (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids))
        return res.status(400).json({ error: 'ids must be array' });
    const deleteUser = db_1.default.prepare('DELETE FROM users WHERE id = ?');
    const deleteEmps = db_1.default.prepare('DELETE FROM employees WHERE user_id = ?');
    const transaction = db_1.default.transaction((userIds) => {
        for (const id of userIds) {
            deleteEmps.run(id);
            deleteUser.run(id);
        }
    });
    try {
        transaction(ids);
        res.json({ message: 'Users deleted' });
    }
    catch (e) {
        res.status(500).json({ error: 'Bulk delete failed' });
    }
});
// Alternative POST for deleting user (more robust)
router.post('/users/delete', (req, res) => {
    const { id } = req.body;
    try {
        db_1.default.prepare('DELETE FROM employees WHERE user_id = ?').run(id);
        const result = db_1.default.prepare('DELETE FROM users WHERE id = ?').run(id);
        if (result.changes === 0)
            return res.status(404).json({ error: 'User not found or already deleted' });
        res.json({ message: 'User deleted' });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
router.delete('/invite-codes/:id', (req, res) => {
    const { id } = req.params;
    db_1.default.prepare('DELETE FROM invite_codes WHERE id = ?').run(id);
    res.json({ message: 'Code deleted' });
});
// Alternative POST for deleting code
router.post('/invite-codes/delete', (req, res) => {
    const { id } = req.body;
    db_1.default.prepare('DELETE FROM invite_codes WHERE id = ?').run(id);
    res.json({ message: 'Code deleted' });
});
router.post('/create-id', async (req, res) => {
    // Legacy/Typo fix: User asked for "admin panel er user r password jeno add kora jay"
    // We will call this /create-user or /users
    const { name, email, password, role } = req.body;
    console.log('Received Create User Request:', { name, email, role });
    if (!name || !email || !password)
        return res.status(400).json({ error: 'Missing fields' });
    // Validate email
    const existing = db_1.default.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing)
        return res.status(400).json({ error: 'Email already exists' });
    const hash = await Promise.resolve().then(() => __importStar(require('bcryptjs'))).then(m => m.hash(password, 10));
    try {
        const result = db_1.default.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hash, role || 'admin');
        res.json({ id: result.lastInsertRowid, name, email, role: role || 'admin' });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});
// REMOVED: router.get('/employees') as user requested to remove employee view from admin
router.post('/invite-codes', (req, res) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const userId = req.user.id;
    const result = db_1.default.prepare('INSERT INTO invite_codes (code, created_by) VALUES (?, ?)').run(code, userId);
    const newCode = db_1.default.prepare('SELECT * FROM invite_codes WHERE id = ?').get(result.lastInsertRowid);
    res.json(newCode);
});
router.get('/invite-codes', (req, res) => {
    const codes = db_1.default.prepare('SELECT * FROM invite_codes ORDER BY created_at DESC').all();
    res.json(codes);
});
router.post('/users/:id/ban', (req, res) => {
    const { id } = req.params;
    const { is_banned } = req.body;
    db_1.default.prepare('UPDATE users SET is_banned = ? WHERE id = ?').run(is_banned ? 1 : 0, id);
    res.json({ message: `User ${is_banned ? 'banned' : 'unbanned'}` });
});
// System Settings Routes
router.get('/system-settings', (req, res) => {
    const settings = db_1.default.prepare('SELECT * FROM system_settings WHERE id = 1').get();
    res.json(settings);
});
const notification_1 = require("../services/notification");
router.put('/system-settings', (req, res) => {
    const { smtp_host, smtp_port, smtp_user, smtp_pass, notification_frequency_minutes } = req.body;
    try {
        db_1.default.prepare(`
            UPDATE system_settings 
            SET smtp_host = ?, smtp_port = ?, smtp_user = ?, smtp_pass = ?, notification_frequency_minutes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `).run(smtp_host, smtp_port, smtp_user, smtp_pass, notification_frequency_minutes);
        // Restart the scheduler with new frequency
        (0, notification_1.startNotificationScheduler)();
        res.json({ message: 'Settings updated and Scheduler restarted.' });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});
router.post('/test-email', async (req, res) => {
    const { email } = req.body;
    // Fetch current settings explicitly to ensure we test what is in DB
    const settings = db_1.default.prepare('SELECT * FROM system_settings WHERE id = 1').get();
    if (!settings.smtp_user || !settings.smtp_pass) {
        return res.status(400).json({ error: 'SMTP credentials not configured' });
    }
    try {
        const nodemailer = await Promise.resolve().then(() => __importStar(require('nodemailer')));
        const transporter = nodemailer.createTransport({
            host: settings.smtp_host,
            port: settings.smtp_port,
            secure: false,
            auth: { user: settings.smtp_user, pass: settings.smtp_pass }
        });
        await transporter.sendMail({
            from: `"Test" <${settings.smtp_user}>`,
            to: email,
            subject: 'Test Email from Admin Panel',
            text: 'If you see this, your SMTP configuration is working correctly.'
        });
        res.json({ message: 'Test email sent' });
    }
    catch (e) {
        res.status(500).json({ error: 'Email failed: ' + e.message });
    }
});
