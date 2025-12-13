"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const email = 'rakin.jarvi@rp-tracker.com'; // Using email format as system requires email
const name = 'Rakin Jarvi';
const password = 'Rakin123#';
const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
try {
    // Check if user exists
    const user = index_1.default.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (user) {
        index_1.default.prepare('UPDATE users SET password = ?, role = ? WHERE email = ?').run(hashedPassword, 'admin', email);
        console.log('Admin updated: ' + email);
    }
    else {
        index_1.default.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
            .run(name, email, hashedPassword, 'admin');
        console.log('Admin created: ' + email);
    }
}
catch (e) {
    console.log('Error creating/updating admin:', e);
}
