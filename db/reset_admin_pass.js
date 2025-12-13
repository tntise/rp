"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
const bcryptjs_1 = require("bcryptjs");
const reset = async () => {
    const password = await (0, bcryptjs_1.hash)('password123', 10);
    index_1.default.prepare('UPDATE users SET password = ? WHERE email = ?').run(password, 'rakin@gmail.com');
    console.log('Admin password reset to: password123');
};
reset();
