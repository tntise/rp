"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
exports.authRouter = router;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    invite_code: zod_1.z.string().min(1),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
router.post('/register', (req, res) => {
    try {
        const { name, email, password, invite_code } = registerSchema.parse(req.body);
        // Validate Invite Code
        const validCode = db_1.default.prepare('SELECT * FROM invite_codes WHERE code = ? AND is_used = 0').get(invite_code);
        if (!validCode) {
            return res.status(400).json({ error: 'Invalid or used invite code' });
        }
        const existingUser = db_1.default.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
        // Transaction to create user and mark code as used
        const createUser = db_1.default.transaction(() => {
            const result = db_1.default.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashedPassword);
            db_1.default.prepare('UPDATE invite_codes SET is_used = 1 WHERE id = ?').run(validCode.id);
            return result;
        });
        const result = createUser();
        const token = jsonwebtoken_1.default.sign({ id: result.lastInsertRowid, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: result.lastInsertRowid, name, email, role: 'user' } });
    }
    catch (error) {
        res.status(400).json({ error: error instanceof zod_1.z.ZodError ? error.errors : 'Invalid input' });
    }
});
router.post('/login', (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = db_1.default.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user || !bcryptjs_1.default.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.is_banned) {
            return res.status(403).json({ error: 'Account is banned' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});
router.get('/me', auth_1.authenticateToken, (req, res) => {
    const user = db_1.default.prepare('SELECT id, name, email, role, settings FROM users WHERE id = ?').get(req.user?.id);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    // Parse settings if it's a string, though better-sqlite3 usually returns strings for TEXT columns
    try {
        user.settings = JSON.parse(user.settings);
    }
    catch (e) {
        user.settings = {};
    }
    res.json(user);
});
