"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const code = 'PREVIEW123';
try {
    const stmt = index_1.default.prepare('INSERT INTO invite_codes (code, created_by) VALUES (?, ?)');
    stmt.run(code, null);
    console.log('Invite code created: ' + code);
}
catch (e) {
    console.error('Error creating code (might already exist):', e);
}
