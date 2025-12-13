"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const users = [
    { email: 'rakin@gmail.com', password: 'Rakin123#' },
    { email: 'user@example.com', password: 'User123#' }
];
users.forEach(u => {
    const hashedPassword = bcryptjs_1.default.hashSync(u.password, 10);
    try {
        index_1.default.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, u.email);
        console.log(`Password reset for ${u.email}`);
    }
    catch (e) {
        console.error(`Failed to reset ${u.email}`, e);
    }
});
