"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const email = 'user@example.com';
const password = 'User123#';
const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
try {
    const existing = index_1.default.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!existing) {
        index_1.default.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Test User', email, hashedPassword, 'user');
        console.log('Test user created.');
    }
    else {
        console.log('Test user exists.');
    }
}
catch (e) {
    console.log('Error creating test user:', e);
}
