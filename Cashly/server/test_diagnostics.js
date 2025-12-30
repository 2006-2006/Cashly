require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testConnection() {
    console.log("--- DIAGNOSTICS START ---");

    // 1. Check Key Presence
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) {
        console.error("❌ FAILURE: No API Key found in env.");
        return;
    }
    console.log("✅ API Key loaded (starts with):", key.substring(0, 10) + "...");

    // 2. Test Gemini API
    try {
        console.log("Testing Gemini API connection...");
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say 'Hello Connection Working'");
        const response = result.response.text();
        console.log("✅ Gemini Success! Response:", response.trim());
    } catch (error) {
        console.error("❌ Gemini API Failed:", error.message);
        if (error.message.includes("403")) console.error("   -> Reason: Quota exceeded or API not enabled.");
        if (error.message.includes("key")) console.error("   -> Reason: Invalid API Key.");
    }

    console.log("--- DIAGNOSTICS END ---");
}

testConnection();
