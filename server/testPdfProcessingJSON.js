import { extractScheduleFromMultiplePDFs } from './services/geminiServiceJSON.js';
import { extractScheduleFromMultiplePDFs as extractScheduleFromMultiplePDFsText } from './services/geminiService.js';
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
    const pdfPaths = [
      path.join(process.cwd(), 'uploads', 'a6d0b07194b23d9a602b3e1e42a74525'),
      path.join(process.cwd(), 'uploads', '70ccbd80ef2e2c74a6d2244a3472ccdb')
    ];

    console.log('Testing JSON version...');
    const jsonResult = await extractScheduleFromMultiplePDFs(pdfPaths);
    console.log('JSON Result:', JSON.stringify(jsonResult, null, 2));

    console.log('\nTesting Text version...');
    const textResult = await extractScheduleFromMultiplePDFsText(pdfPaths);
    console.log('Text Result:', textResult);

  } catch (error) {
    console.error('Error during testing:', error);
  }
};

// Run the test
testPDFs(); 