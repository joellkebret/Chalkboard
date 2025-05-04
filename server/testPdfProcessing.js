import { extractScheduleFromMultiplePDFs } from './services/geminiService.js';
import { extractScheduleFromMultiplePDFs as extractScheduleFromMultiplePDFsJSON } from './services/geminiServiceJSON.js';

const pdfPaths = [
    './services/oldcalc.pdf',
    './services/test.pdf'
];

async function testServices() {
    try {
        console.log('Testing geminiService.js (text format)...');
        const textResult = await extractScheduleFromMultiplePDFs(pdfPaths);
        console.log('\nText Format Result:');
        console.log(textResult);

        console.log('\nTesting geminiServiceJSON.js (JSON format)...');
        const jsonResult = await extractScheduleFromMultiplePDFsJSON(pdfPaths);
        console.log('\nJSON Format Result:');
        console.log(JSON.stringify(jsonResult, null, 2));
    } catch (error) {
        console.error('Error testing services:', error);
    }
}

testServices(); 