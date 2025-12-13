"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
async function verifyPersistence() {
    try {
        console.log('--- Verifying Persistence ---');
        // 1. Get User
        const user = db_1.default.prepare('SELECT id, email FROM users LIMIT 1').get();
        if (!user)
            throw new Error('No user found');
        console.log('User:', user.email);
        // 2. Update Settings manually (simulating API)
        const newEmails = 'persistent@example.com';
        const newSettings = JSON.stringify({ email_enabled: true, notify_days: [30] });
        db_1.default.prepare('UPDATE users SET additional_emails = ?, settings = ? WHERE id = ?')
            .run(newEmails, newSettings, user.id);
        console.log('Updated DB directly.');
        // 3. Read back
        const updatedUser = db_1.default.prepare('SELECT additional_emails FROM users WHERE id = ?').get(user.id);
        console.log('Read from DB:', updatedUser.additional_emails);
        if (updatedUser.additional_emails === newEmails) {
            console.log('SUCCESS: Database persistence is working.');
        }
        else {
            console.error('FAILURE: Database did not save value.');
        }
    }
    catch (e) {
        console.error('Verification Failed:', e);
    }
}
verifyPersistence();
