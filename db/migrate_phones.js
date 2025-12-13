"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
try {
    index_1.default.exec('ALTER TABLE employees ADD COLUMN phone_number TEXT');
    index_1.default.exec('ALTER TABLE employees ADD COLUMN home_number TEXT');
    console.log('Added phone columns.');
}
catch (e) {
    console.log('Columns might already exist', e);
}
