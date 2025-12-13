"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const migrate = () => {
    console.log('Migrating system_settings table...');
    index_1.default.exec(`
        CREATE TABLE IF NOT EXISTS system_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            smtp_host TEXT DEFAULT 'smtp.gmail.com',
            smtp_port INTEGER DEFAULT 587,
            smtp_user TEXT DEFAULT '',
            smtp_pass TEXT DEFAULT '',
            notification_frequency_minutes INTEGER DEFAULT 5,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    // Insert default row if not exists
    const row = index_1.default.prepare('SELECT * FROM system_settings WHERE id = 1').get();
    if (!row) {
        index_1.default.prepare(`
            INSERT INTO system_settings (id, smtp_host, smtp_port, smtp_user, smtp_pass, notification_frequency_minutes)
            VALUES (1, 'smtp.gmail.com', 587, '', '', 5)
        `).run();
        console.log('Inserted default system settings.');
    }
    else {
        console.log('System settings already initialized.');
    }
};
migrate();
