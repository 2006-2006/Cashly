const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TEST_DIR = path.join(__dirname, '..', 'test');

// First, we need to login/register to get a token
const authenticateUser = async () => {
    try {
        // Try to login first
        const loginRes = await axios.post(`${API_URL}/users/login`, {
            email: process.env.TEST_USER_EMAIL || 'user@example.com',
            password: process.env.TEST_USER_PASSWORD || 'password123'
        });
        return loginRes.data.token;
    } catch (error) {
        // If login fails, register
        try {
            const registerRes = await axios.post(`${API_URL}/users`, {
                name: 'Test User',
                email: process.env.TEST_USER_EMAIL || 'user@example.com',
                password: process.env.TEST_USER_PASSWORD || 'password123'
            });
            return registerRes.data.token;
        } catch (regError) {
            console.error('Authentication failed:', regError.response?.data || regError.message);
            throw new Error('Could not authenticate user');
        }
    }
};

const uploadFile = async (endpoint, filePath, token) => {
    const fileName = path.basename(filePath);
    console.log(`Uploading ${fileName}...`);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    try {
        const response = await axios.post(`${API_URL}/upload/${endpoint}`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`✓ ${fileName} uploaded successfully`);
        return response.data;
    } catch (error) {
        console.error(`✗ Failed to upload ${fileName}:`, error.response?.data?.message || error.message);
        throw error;
    }
};

const main = async () => {
    console.log('=== Cashly Auto-Upload Test Data ===\n');

    // Step 1: Authenticate
    console.log('Step 1: Authenticating...');
    let token;
    try {
        token = await authenticateUser();
        console.log('✓ Authentication successful\n');
    } catch (error) {
        console.error('✗ Authentication failed. Make sure the server is running.');
        process.exit(1);
    }

    // Step 2: Upload files
    console.log('Step 2: Uploading test data files...\n');

    const files = [
        { endpoint: 'sales', file: 'sales_data.xlsx' },
        { endpoint: 'expenses', file: 'expenses_data.xlsx' },
        { endpoint: 'inventory', file: 'inventory_data.xlsx' },
        { endpoint: 'receivables', file: 'receivables_data.xlsx' }
    ];

    let successCount = 0;
    let failCount = 0;

    for (const { endpoint, file } of files) {
        const filePath = path.join(TEST_DIR, file);

        if (!fs.existsSync(filePath)) {
            console.error(`✗ File not found: ${file}`);
            console.log('  Run: node scripts/generateTestData.js first\n');
            failCount++;
            continue;
        }

        try {
            await uploadFile(endpoint, filePath, token);
            successCount++;
        } catch (error) {
            failCount++;
        }

        // Small delay between uploads
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Summary
    console.log('\n=== Upload Summary ===');
    console.log(`✓ Successful: ${successCount}/${files.length}`);
    console.log(`✗ Failed: ${failCount}/${files.length}`);

    if (successCount === files.length) {
        console.log('\n🎉 All test data uploaded successfully!');
        console.log('\nYou can now:');
        console.log('1. Login to Cashly with:');
        console.log('   Email: ' + (process.env.TEST_USER_EMAIL || 'user@example.com'));
        console.log('   Password: ' + (process.env.TEST_USER_PASSWORD || 'password123'));
        console.log('2. View the dashboard with real data');
        console.log('3. Check Income, Expenses pages for uploaded records');
        console.log('4. Run forecasts and simulations');
    } else {
        console.log('\n⚠️  Some uploads failed. Check the errors above.');
    }
};

// Run the upload
main().catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
});
