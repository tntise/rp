"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRouter = void 0;
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middleware/auth");
const notification_1 = require("../services/notification");
const router = express_1.default.Router();
exports.settingsRouter = router;
const settingsSchema = zod_1.z.object({
    email_enabled: zod_1.z.boolean().optional(),
    notify_days: zod_1.z.array(zod_1.z.number()).optional(),
    additional_emails: zod_1.z.string().optional(),
});
router.use(auth_1.authenticateToken);
router.get('/', (req, res) => {
    const user = db_1.default.prepare('SELECT settings, additional_emails FROM users WHERE id = ?').get(req.user.id);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    try {
        const settings = JSON.parse(user.settings);
        res.json({ ...settings, additional_emails: user.additional_emails || '' });
    }
    catch (e) {
        res.json({ additional_emails: user.additional_emails || '' });
    }
});
router.put('/', (req, res) => {
    const userId = req.user.id;
    try {
        const data = settingsSchema.parse(req.body);
        const { additional_emails, ...settings } = data;
        const user = db_1.default.prepare('SELECT settings FROM users WHERE id = ?').get(userId);
        const currentSettings = user.settings ? JSON.parse(user.settings) : {};
        const newSettings = { ...currentSettings, ...settings };
        if (additional_emails !== undefined) {
            db_1.default.prepare('UPDATE users SET additional_emails = ? WHERE id = ?').run(additional_emails, userId);
        }
        db_1.default.prepare('UPDATE users SET settings = ? WHERE id = ?').run(JSON.stringify(newSettings), userId);
        res.json({ ...newSettings, additional_emails });
    }
    catch (error) {
        console.error('Settings Update Error:', error);
        res.status(400).json({ error: 'Invalid input', details: error });
    }
});
const passwordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string(),
    newPassword: zod_1.z.string().min(6),
});
router.post('/password', (req, res) => {
    const userId = req.user.id;
    try {
        const { currentPassword, newPassword } = passwordSchema.parse(req.body);
        const user = db_1.default.prepare('SELECT password FROM users WHERE id = ?').get(userId);
        if (!bcryptjs_1.default.compareSync(currentPassword, user.password)) {
            return res.status(401).json({ error: 'Incorrect current password' });
        }
        const hashedPassword = bcryptjs_1.default.hashSync(newPassword, 10);
        db_1.default.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});
router.post('/test', async (req, res) => {
    const userId = req.user.id;
    const user = db_1.default.prepare('SELECT email FROM users WHERE id = ?').get(userId);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    // Mock employee data for test
    const testEmployees = [{
            name: 'Test Employee',
            qid: '12345678900',
            rp_expiry: new Date().toISOString().split('T')[0],
            phone_number: '12345678'
        }];
    try {
        if (!user.email)
            return res.status(400).json({ error: 'No email found for user' });
        await (0, notification_1.sendEmail)(user.email, testEmployees);
        res.json({ message: 'Test notification sent! Check your email.' });
    }
    catch (error) {
        console.error('Test email failed:', error);
        res.status(500).json({ error: 'Failed to send test email' });
    }
});
