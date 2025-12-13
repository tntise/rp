"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
try {
    console.log('Migrating employees table...');
    index_1.default.prepare('ALTER TABLE employees ADD COLUMN notification_enabled BOOLEAN DEFAULT 1').run();
    console.log('Added notification_enabled column.');
}
catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('Column already exists.');
    }
    else {
        console.error('Migration failed:', error);
    }
}
