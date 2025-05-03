import { extractScheduleFromMultiplePDFs as extractText } from './services/geminiService.js';
import { extractScheduleFromMultiplePDFs as extractJSON } from './services/geminiServiceJSON.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testServices = async () => {
  try {
    const pdfPaths = [
      path.join(__dirname, 'services', 'oldcalc.pdf'),
      path.join(__dirname, 'services', 'test.pdf')
    ];

    console.log('\n=== Testing Text Extraction Service ===');
    const textResult = await extractText(pdfPaths);
    console.log('\nText Result:', textResult);

    console.log('\n=== Testing JSON Extraction Service ===');
    const jsonResult = await extractJSON(pdfPaths);
    console.log('\nJSON Result:', JSON.stringify(jsonResult, null, 2));

  } catch (error) {
    console.error('Error testing services:', error);
  }
};

testServices(); 