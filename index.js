"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./routes/auth");
const employees_1 = require("./routes/employees");
const admin_1 = require("./routes/admin");
const settings_1 = require("./routes/settings");
const db_1 = require("./db");
const notification_1 = require("./services/notification");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Force restart timestamp: 44444
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.authRouter);
app.use('/api/employees', employees_1.employeeRouter);
app.use('/api/admin', admin_1.adminRouter);
app.use('/api/settings', settings_1.settingsRouter);
// Health check
app.get('/', (req, res) => {
    res.send('Employee RP Tracker API is running');
});
// Initialize DB and Notification Service
(0, db_1.initDatabase)();
(0, notification_1.startNotificationScheduler)();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
