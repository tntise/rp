"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const email = 'rakin@gmail.com';
const password = 'Rakin123#';
const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
try {
    // 1. Check if ANY user exists with this email
    const existingUser = index_1.default.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
        // Upgrade this user to admin
        console.log(`User ${email} found (ID: ${existingUser.id}). Promoting to Admin...`);
        index_1.default.prepare(`
            UPDATE users 
            SET password = ?, role = 'admin' 
            WHERE id = ?
        `).run(hashedPassword, existingUser.id);
    }
    else {
        // 2. Check if there was an OLD admin (e.g. rakin.jarvi@...) that we should rename
        const oldAdmin = index_1.default.prepare("SELECT * FROM users WHERE role = 'admin'").get();
        if (oldAdmin) {
            console.log(`Renaming old admin ${oldAdmin.email} to ${email}...`);
            index_1.default.prepare(`
                UPDATE users 
                SET email = ?, password = ? 
                WHERE id = ?
            `).run(email, hashedPassword, oldAdmin.id);
        }
        else {
            // 3. Create fresh admin
            console.log('No existing admin or user found. Creating new Admin...');
            index_1.default.prepare(`
                INSERT INTO users (name, email, password, role)
                VALUES ('Admin', ?, ?, 'admin')
            `).run(email, hashedPassword);
        }
    }
    console.log('Admin credentials updated successfully.');
}
catch (error) {
    console.error('Error updating admin:', error);
}
