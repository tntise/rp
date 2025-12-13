"use strict";
async function verifySettings() {
    try {
        // 1. Login
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'user@example.com', password: 'User123#' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login:', loginRes.status);
        if (!token)
            throw new Error('No token');
        // 2. Update Settings
        const newEmails = 'test1@example.com, test2@example.com';
        const updateRes = await fetch('http://localhost:3000/api/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                additional_emails: newEmails,
                email_enabled: true,
                notify_days: [30, 7]
            })
        });
        console.log('Update Settings:', updateRes.status);
        // 3. Fetch Settings
        const getRes = await fetch('http://localhost:3000/api/settings', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const getData = await getRes.json();
        console.log('Fetched Settings:', getData);
        if (getData.additional_emails === newEmails) {
            console.log('SUCCESS: Additional emails persisted.');
        }
        else {
            console.error('FAILURE: Additional emails NOT persisted.');
        }
        // 4. Test Email
        const testRes = await fetch('http://localhost:3000/api/settings/test', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const testData = await testRes.json();
        console.log('Test Email:', testRes.status, testData);
    }
    catch (e) {
        console.error('Verification Failed:', e);
    }
}
verifySettings();
