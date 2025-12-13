"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeRouter = void 0;
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
exports.employeeRouter = router;
const employeeSchema = zod_1.z.object({
    qid: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1),
    country: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    rp_expiry: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"), // Expecting YYYY-MM-DD
    phone_number: zod_1.z.string().optional(),
    home_number: zod_1.z.string().optional(),
    notification_enabled: zod_1.z.boolean().optional(),
});
router.use(auth_1.authenticateToken);
router.get('/', (req, res) => {
    const userId = req.user.id;
    const { search } = req.query;
    let query = 'SELECT * FROM employees WHERE user_id = ?';
    const params = [userId];
    if (search) {
        query += ' AND (name LIKE ? OR qid LIKE ? OR country LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY rp_expiry ASC';
    try {
        const employees = db_1.default.prepare(query).all(...params);
        res.json(employees);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});
router.post('/', (req, res) => {
    const userId = req.user.id;
    try {
        const data = employeeSchema.parse(req.body);
        const result = db_1.default.prepare(`
      INSERT INTO employees (user_id, qid, name, country, gender, rp_expiry, phone_number, home_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, data.qid, data.name, data.country, data.gender, data.rp_expiry, data.phone_number, data.home_number);
        res.status(201).json({ id: result.lastInsertRowid, ...data });
    }
    catch (error) {
        res.status(400).json({ error: error instanceof zod_1.z.ZodError ? error.errors : 'Invalid input' });
    }
});
router.put('/:id', (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
        const data = employeeSchema.parse(req.body);
        const existing = db_1.default.prepare('SELECT id FROM employees WHERE id = ? AND user_id = ?').get(id, userId);
        if (!existing)
            return res.status(404).json({ error: 'Employee not found' });
        db_1.default.prepare(`
      UPDATE employees 
      SET qid = ?, name = ?, country = ?, gender = ?, rp_expiry = ?, phone_number = ?, home_number = ?, notification_enabled = COALESCE(?, notification_enabled)
      WHERE id = ? AND user_id = ?
    `).run(data.qid, data.name, data.country, data.gender, data.rp_expiry, data.phone_number, data.home_number, data.notification_enabled ? 1 : (data.notification_enabled === false ? 0 : null), id, userId);
        res.json({ id, ...data });
    }
    catch (error) {
        res.status(400).json({ error: error instanceof zod_1.z.ZodError ? error.errors : 'Invalid input' });
    }
});
router.delete('/:id', (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const result = db_1.default.prepare('DELETE FROM employees WHERE id = ? AND user_id = ?').run(id, userId);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted' });
});
router.post('/bulk-delete', (req, res) => {
    const userId = req.user.id;
    const { ids } = req.body; // Array of IDs
    if (!Array.isArray(ids))
        return res.status(400).json({ error: 'ids must be an array' });
    const deleteStmt = db_1.default.prepare('DELETE FROM employees WHERE id = ? AND user_id = ?');
    const deleteMany = db_1.default.transaction((ids) => {
        for (const id of ids)
            deleteStmt.run(id, userId);
    });
    deleteMany(ids);
    res.json({ message: 'Employees deleted' });
});
router.post('/bulk-toggle-notification', (req, res) => {
    const userId = req.user.id;
    const { ids, enabled } = req.body;
    if (!Array.isArray(ids))
        return res.status(400).json({ error: 'ids must be an array' });
    const updateStmt = db_1.default.prepare('UPDATE employees SET notification_enabled = ? WHERE id = ? AND user_id = ?');
    const updateMany = db_1.default.transaction((ids) => {
        for (const id of ids)
            updateStmt.run(enabled ? 1 : 0, id, userId);
    });
    updateMany(ids);
    res.json({ message: 'Notifications updated' });
});
router.post('/upload', (req, res) => {
    const userId = req.user.id;
    const { employees } = req.body; // Expecting array of objects from CSV
    if (!Array.isArray(employees))
        return res.status(400).json({ error: 'Invalid data format' });
    const insertStmt = db_1.default.prepare(`
    INSERT INTO employees (user_id, qid, name, country, gender, rp_expiry, notification_enabled)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
    const insertMany = db_1.default.transaction((emps) => {
        for (const emp of emps) {
            // Basic validation or fallback
            if (!emp.name || !emp.rp_expiry)
                continue;
            insertStmt.run(userId, emp.qid || null, emp.name, emp.country || null, emp.gender || null, emp.rp_expiry);
        }
    });
    try {
        insertMany(employees);
        res.json({ message: 'Import successful' });
    }
    catch (e) {
        res.status(400).json({ error: 'Import failed' });
    }
});
