"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const email = 'rakin.jarvi@rp-tracker.com';
const password = 'Rakin123#';
const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
try {
    index_1.default.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, email);
    console.log('Password updated for: ' + email);
}
catch (e) {
    console.log('Error updating password:', e);
}
