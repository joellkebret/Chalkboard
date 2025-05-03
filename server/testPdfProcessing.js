import 'dotenv/config';
import { extractScheduleFromMultiplePDFs } from './services/geminiService.js';
import path from 'path';
import PDFParser from 'pdf2json';

// Test the PDF processing
async function testPdfProcessing() {
  try {
    // Get both PDFs from the services directory
    const pdfPaths = [
      path.join(process.cwd(), 'services', 'oldcalc.pdf'),
      path.join(process.cwd(), 'services', 'test.pdf')
    ];
    
    console.log('📄 Testing PDF processing with multiple files:');
    pdfPaths.forEach(path => console.log('-', path));
    
    // Process each PDF with Gemini
    const result = await extractScheduleFromMultiplePDFs(pdfPaths);
    
    console.log('\n✅ Processing completed successfully!');
    console.log('\n📋 Results:');
    console.log(result);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPdfProcessing(); 