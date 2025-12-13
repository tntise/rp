"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const repair = () => {
    console.log('Repairing schema...');
    // Attempt to add is_banned
    try {
        index_1.default.prepare('ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT 0').run();
        console.log('✅ Added column: is_banned');
    }
    catch (e) {
        console.log('ℹ️ is_banned:', e.message);
    }
    // Attempt to add additional_emails
    try {
        index_1.default.prepare('ALTER TABLE users ADD COLUMN additional_emails TEXT').run();
        console.log('✅ Added column: additional_emails');
    }
    catch (e) {
        console.log('ℹ️ additional_emails:', e.message);
    }
    // Attempt to add settings
    try {
        index_1.default.prepare("ALTER TABLE users ADD COLUMN settings TEXT DEFAULT '{}'").run();
        console.log('✅ Added column: settings');
    }
    catch (e) {
        console.log('ℹ️ settings:', e.message);
    }
    // Attempt to add telegram_chat_id (wait, do we need it? No, I removed it from code)
    // But for future proofing? No, keep it clean.
};
repair();
