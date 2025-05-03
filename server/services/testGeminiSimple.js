import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from root directory
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

async function testGeminiSimple() {
    try {
        // Check if API key is available
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is not set');
        }

        console.log('API Key length:', process.env.GEMINI_API_KEY.length);
        console.log('API Key starts with:', process.env.GEMINI_API_KEY.substring(0, 10));

        // Initialize Gemini with the API key
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Use the same model as the main service for consistency
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

        console.log('Making a simple text request...');
        const prompt = 'Say hello world';
        console.log('Prompt:', prompt);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('Gemini Response:', text);
    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
    }
}

// Run the test
testGeminiSimple(); 