"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const list = () => {
    const users = index_1.default.prepare('SELECT id, name, email, role, password FROM users').all();
    console.log('Current Users:', users);
};
list();
