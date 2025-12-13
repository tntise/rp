"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
const run = () => {
    console.log('--- Debugging Notification Logic ---');
    // 1. Check System Settings
    const settings = db_1.default.prepare('SELECT * FROM system_settings WHERE id = 1').get();
    console.log('Settings:', settings);
    // 2. Check Users
    const users = db_1.default.prepare('SELECT * FROM users').all();
    console.log(`Found ${users.length} users.`);
    // 3. Check Employees & Dates
    users.forEach(u => {
        console.log(`\nChecking User ${u.email} (ID: ${u.id})...`);
        const employees = db_1.default.prepare('SELECT * FROM employees WHERE user_id = ?').all(u.id);
        console.log(`User has ${employees.length} employees.`);
        employees.forEach(e => {
            const rawDate = e.rp_expiry;
            // Test SQL Date Math
            const sqlResult = db_1.default.prepare(`
                SELECT 
                    julianday(?) as julianday_expiry, 
                    julianday('now') as julianday_now,
                    (julianday(?) - julianday('now')) as diff_days
            `).get(rawDate, rawDate);
            console.log(`  - Emp: ${e.name} | Expiry: ${rawDate}`);
            console.log(`    SQL Math: ${JSON.stringify(sqlResult)}`);
            if (sqlResult.diff_days <= 30 && sqlResult.diff_days > -1) {
                console.log('    ✅ SHOULD NOTIFY');
            }
            else {
                console.log('    ❌ NO NOTIFY');
            }
        });
    });
};
run();
