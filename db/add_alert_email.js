"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const migrate = () => {
    try {
        index_1.default.prepare('ALTER TABLE system_settings ADD COLUMN alert_email TEXT').run();
        console.log('✅ Added column: alert_email');
    }
    catch (e) {
        console.log('ℹ️ alert_email might exist:', e.message);
    }
};
migrate();
