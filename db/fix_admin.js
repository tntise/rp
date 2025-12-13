"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const bcryptjs_1 = require("bcryptjs");
const fix = async () => {
    console.log('--- Checking Admin ---');
    const user = index_1.default.prepare('SELECT * FROM users WHERE email = ?').get('rakin@gmail.com');
    console.log('User found:', user);
    if (user) {
        if (user.is_banned) {
            console.log('⚠️ User is BANNED. Unbanning...');
            index_1.default.prepare('UPDATE users SET is_banned = 0 WHERE id = ?').run(user.id);
        }
        console.log('--- Resetting Password ---');
        const newPass = await (0, bcryptjs_1.hash)('123456', 10);
        index_1.default.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPass, user.id);
        console.log('✅ Password reset to: 123456');
    }
    else {
        console.log('❌ User NOT FOUND. Creating...');
        const newPass = await (0, bcryptjs_1.hash)('123456', 10);
        index_1.default.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Rakin Admin', 'rakin@gmail.com', newPass, 'admin');
        console.log('✅ Created admin with password: 123456');
    }
};
fix();
