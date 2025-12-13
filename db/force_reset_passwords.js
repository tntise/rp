"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const adminEmail = 'rakin@gmail.com';
const userEmail = 'user@example.com';
const adminPass = 'Rakin123#';
const userPass = 'User123#';
const hashAdmin = bcryptjs_1.default.hashSync(adminPass, 10);
const hashUser = bcryptjs_1.default.hashSync(userPass, 10);
try {
    // Upsert Admin
    const adminCheck = index_1.default.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
    if (adminCheck) {
        index_1.default.prepare("UPDATE users SET password = ?, role = 'admin' WHERE email = ?").run(hashAdmin, adminEmail);
        console.log('Updated Admin password.');
    }
    else {
        index_1.default.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')").run('Admin', adminEmail, hashAdmin);
        console.log('Created Admin user.');
    }
    // Upsert User
    const userCheck = index_1.default.prepare('SELECT * FROM users WHERE email = ?').get(userEmail);
    if (userCheck) {
        index_1.default.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashUser, userEmail);
        console.log('Updated User password.');
    }
    else {
        index_1.default.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')").run('User', userEmail, hashUser);
        console.log('Created User.');
    }
}
catch (e) {
    console.error(e);
}
