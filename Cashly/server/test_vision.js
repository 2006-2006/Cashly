require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testVision() {
    console.log("--- VISION TEST START ---");
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) { console.error("No Key"); return; }

    const genAI = new GoogleGenerativeAI(key);
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"];

    for (const modelName of models) {
        try {
            console.log(`\nTesting Model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(["Describe this image", imagePart]);
            console.log(`✅ SUCCESS with ${modelName}! Response:`, result.response.text());
            return; // Exit on first success
        } catch (error) {
            console.error(`❌ FAILED with ${modelName}:`, error.message);
        }
    }
}

testVision();
