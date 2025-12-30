const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    try {
        // Create a dummy CSV file
        const filePath = path.join(__dirname, 'dummy_sales.csv');
        fs.writeFileSync(filePath, 'Date,Amount,Description,Payment Type\n2023-01-01,100,Test Sale,Cash');

        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        // We need a businessId. Using a dummy one or one from the specific user user's DB if possible.
        // For test, we might fail on businessId check if not logged in, but we should get a 401/400, NOT a network error.
        // To properly test, we need a token. Alternatively, we just check if we get a response (even 401).

        console.log('Attempting upload to http://localhost:5000/api/upload/sales ...');

        const response = await axios.post('http://localhost:5000/api/upload/sales', form, {
            headers: {
                ...form.getHeaders()
            },
            validateStatus: () => true // Resolve promise for all status codes
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);

        if (response.status !== 500 && response.status !== 200 && response.status !== 401 && response.status !== 400) {
            console.log('UNKNOWN STATUS - Investigation needed');
        }

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ CONNECTION REFUSED: Server is not running on port 5000');
        } else {
            console.error('❌ REQUEST FAILED:', error.message);
            if (error.response) {
                console.error('Response Status:', error.response.status);
                console.error('Response Data:', error.response.data);
            }
        }
    }
}

testUpload();
