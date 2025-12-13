"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000/api';
async function runTest() {
    console.log('--- Starting Backend Integrity Test ---');
    try {
        // 1. Login
        console.log('1. Attempting Login...');
        const loginRes = await axios_1.default.post(`${BASE_URL}/auth/login`, {
            email: 'rakin@gmail.com', // Assuming this admin exists
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('✅ Login Successful. Token obtained.');
        const headers = { Authorization: `Bearer ${token}` };
        // CLEANUP: Try to delete test user if exists (by email lookup? No, admin delete needs ID).
        // Best approach: Use RANDOM email.
        const randomId = Math.floor(Math.random() * 10000);
        const testEmail = `testbackend${randomId}@example.com`;
        // 2. Create User
        console.log(`2. Creating User "TestUser${randomId}" (${testEmail})...`);
        const createRes = await axios_1.default.post(`${BASE_URL}/admin/create-id`, {
            name: `TestUser${randomId}`,
            email: testEmail,
            password: 'password123',
            role: 'user'
        }, { headers });
        console.log('✅ User Created:', createRes.data);
        const userId = createRes.data.id;
        // 2.5 Verify Persistence (Simulate Refresh)
        console.log('2.5 Verifying Persistence (GET /users)...');
        const listRes = await axios_1.default.get(`${BASE_URL}/admin/users`, { headers });
        const exists = listRes.data.find((u) => u.id === userId);
        if (exists) {
            console.log('✅ User FOUND in DB list. Persistence confirmed.');
        }
        else {
            console.error('❌ User NOT FOUND in list. Persistence FAILED.');
            throw new Error('Persistence Check Failed');
        }
        // 3. Generate Invite Code
        console.log('3. Generating Invite Code...');
        const codeRes = await axios_1.default.post(`${BASE_URL}/admin/invite-codes`, {}, { headers });
        console.log('✅ Code Generated:', codeRes.data);
        const codeId = codeRes.data.id;
        // 4. Delete User
        console.log('4. Deleting User...');
        await axios_1.default.post(`${BASE_URL}/admin/users/delete`, { id: userId }, { headers });
        console.log('✅ User Deleted.');
        // 5. Delete Code
        console.log('5. Deleting Code...');
        await axios_1.default.post(`${BASE_URL}/admin/invite-codes/delete`, { id: codeId }, { headers });
        console.log('✅ Code Deleted.');
        console.log('--- TEST PASSED: ALL SYSTEMS GO ---');
    }
    catch (error) {
        console.error('❌ TEST FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        else {
            console.error(error.message);
        }
    }
}
runTest();
