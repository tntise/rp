"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSchema = void 0;
const initSchema = (db) => {
    // Users Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'user')) DEFAULT 'user',
      is_banned BOOLEAN DEFAULT 0,
      additional_emails TEXT,
      settings TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Invite Codes Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS invite_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      is_used BOOLEAN DEFAULT 0,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Employees Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      qid TEXT,
      name TEXT NOT NULL,
      country TEXT,
      gender TEXT,
      rp_expiry DATE NOT NULL,
      phone_number TEXT,
      home_number TEXT,
      notification_enabled BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    // Settings column in users table stores JSON string: { email_enabled: boolean, telegram_enabled: boolean, notify_days: number[] }
};
exports.initSchema = initSchema;
