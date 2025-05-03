import { GoogleGenerativeAI } from '@google/generative-ai';
import PDFParser from 'pdf2json';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Ensure API key is properly formatted
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(apiKey);

const extractTextFromPDF = (pdfPath) => {
  return new Promise((resolve, reject) => {
    console.log(`\nProcessing PDF: ${pdfPath}`);
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const text = decodeURIComponent(pdfData.Pages.map(page => 
        page.Texts.map(text => text.R.map(r => r.T).join(' ')).join(' ')
      ).join('\n'));
      console.log(`Successfully extracted text from PDF. Text length: ${text.length} characters`);
      console.log('First 200 characters of text:', text.substring(0, 200));
      resolve(text);
    });

    pdfParser.on('pdfParser_dataError', (errData) => {
      console.error('PDF parsing error:', errData);
      reject(new Error('Error parsing PDF: ' + errData.parserError));
    });

    pdfParser.loadPDF(pdfPath);
  });
};

const processTextWithGemini = async (text) => {
  try {
    console.log('\nSending text to Gemini API...');
    // Configure the model with safety settings
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.3,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });
    
    const prompt = `You are an extremely detail-oriented data parser analyzing course outlines. Extract and format the information EXACTLY as specified below.

CRITICAL REQUIREMENTS:
1. Return ONLY a JSON object, no markdown or other formatting
2. Use 24-hour time format (e.g., "1430" not "2:30")
3. Use 3-letter abbreviations for days (MON, TUE, WED, THU, FRI)
4. All times must be 4 digits (e.g., "0900" not "9:00")
5. Combine multiple lecture times or office hours with commas
6. For asynchronous courses, use "ASYNC" for lectureTimes
7. Topics should be in ALL CAPS
8. Each course must have ALL fields filled out

Format the data as a JSON object with this exact structure:
{
  "courses": [
    {
      "courseName": "MATH*2210: Advanced Calculus II",
      "lectureTimes": ["MON1430-1630", "WED1430-1630"],  // or "ASYNC" for asynchronous courses
      "officeHours": ["TUE1200-1300", "THU1100-1230"],
      "topics": ["DOUBLE INTEGRALS", "TRIPLE INTEGRALS", "VECTOR CALCULUS"]
    }
  ]
}

EXTRACTION RULES:
- courseName: Include both course code and full name
- lectureTimes: All lecture times in 24-hour format with 3-letter days
- officeHours: All office hours in same format as lecture times
- topics: Main topics covered in the course, in ALL CAPS

Text to process:
${text}`;

    // Generate content with proper error handling
    const result = await model.generateContent(prompt);
    if (!result || !result.response) {
      throw new Error('No response received from Gemini API');
    }

    const response = result.response;
    let jsonStr = response.text();
    
    console.log('Received response from Gemini API');
    console.log('Raw response:', jsonStr);
    
    if (!jsonStr) {
      throw new Error('Empty response from Gemini API');
    }

    // Remove any markdown code block formatting
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON string to ensure it's valid
    try {
      const jsonData = JSON.parse(jsonStr);
      return jsonData;
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError.message}\nReceived: ${jsonStr}`);
    }
  } catch (error) {
    console.error('Error processing text with Gemini:', error);
    if (error.message.includes('not found') || error.message.includes('404')) {
      throw new Error('Gemini API model not available. Please check your API key and ensure you have access to the gemini-pro model.');
    }
    throw new Error(`Failed to process text with Gemini: ${error.message}`);
  }
};

export const extractScheduleFromMultiplePDFs = async (pdfPaths) => {
  try {
    console.log(`\nStarting to process ${pdfPaths.length} PDFs`);
    const allCourses = [];
    
    for (const pdfPath of pdfPaths) {
      console.log(`\nProcessing PDF: ${pdfPath}`);
      const text = await extractTextFromPDF(pdfPath);
      const result = await processTextWithGemini(text);
      
      if (result.courses && Array.isArray(result.courses)) {
        console.log(`Found ${result.courses.length} courses in this PDF`);
        allCourses.push(...result.courses);
      } else {
        console.log('No courses found in this PDF');
      }
    }

    console.log(`\nTotal courses found: ${allCourses.length}`);
    return {
      courses: allCourses
    };
  } catch (error) {
    console.error('Error in extractScheduleFromMultiplePDFs:', error);
    throw error;
  }
}; 