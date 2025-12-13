"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const bcryptjs_1 = require("bcryptjs");
const seed = async () => {
    const password = await (0, bcryptjs_1.hash)('password123', 10);
    try {
        index_1.default.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Rakin Admin', 'rakin@gmail.com', password, 'admin');
        console.log('✅ Created admin: rakin@gmail.com');
    }
    catch (e) {
        if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            index_1.default.prepare('UPDATE users SET password = ? WHERE email = ?').run(password, 'rakin@gmail.com');
            console.log('✅ Updated admin password: rakin@gmail.com');
        }
        else {
            console.error('Failed', e);
        }
    }
};
seed();
