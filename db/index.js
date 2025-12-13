"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const schema_1 = require("./schema");
const dbPath = path_1.default.resolve(__dirname, '../../database.sqlite');
const db = new better_sqlite3_1.default(dbPath); // verbose: console.log
const initDatabase = () => {
    console.log('Initializing database at:', dbPath);
    (0, schema_1.initSchema)(db);
};
exports.initDatabase = initDatabase;
exports.default = db;
