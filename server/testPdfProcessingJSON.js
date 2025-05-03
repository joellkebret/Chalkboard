import { extractScheduleFromMultiplePDFs } from './services/geminiServiceJSON.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

// Validate API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY environment variable is not set');
  process.exit(1);
}

// Debug: Check API key format
console.log('API Key validation:', {
  hasApiKey: true,
  apiKeyLength: apiKey.length,
  startsWithPrefix: apiKey.startsWith('AI-'),
  isValidFormat: /^AI-[a-zA-Z0-9-_]{39}$/.test(apiKey)
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testPDFs = async () => {
  try {
    // Verify PDF files exist
    const pdfPaths = [
      path.join(__dirname, 'services', 'oldcalc.pdf'),
      path.join(__dirname, 'services', 'test.pdf')
    ];

    for (const pdfPath of pdfPaths) {
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`PDF file not found: ${pdfPath}`);
      }
    }

    console.log('Processing PDFs:', pdfPaths);
    const result = await extractScheduleFromMultiplePDFs(pdfPaths);
    
    console.log('\nProcessed Course Information:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error testing PDF processing:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Run the test
testPDFs(); 