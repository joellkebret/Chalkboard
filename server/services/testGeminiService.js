import { extractScheduleFromMultiplePDFs } from './geminiService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from root directory
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testGeminiService() {
    try {
        // Check if API key is available
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is not set');
        }

        // Debug: Check API key value
        console.log('API Key length:', process.env.GEMINI_API_KEY.length);
        console.log('API Key starts with:', process.env.GEMINI_API_KEY.substring(0, 10));

        // Test with the MATH2210 course outline
        const testPdfPath = path.join(__dirname, 'MATH2210 (W21) Course Outline.pdf');
        console.log('Testing with PDF:', testPdfPath);
        
        console.log('Starting Gemini API call...');
        const result = await extractScheduleFromMultiplePDFs([testPdfPath]);
        console.log('Gemini API Response:');
        console.log(result);
    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
    }
}

// Run the test
testGeminiService(); 