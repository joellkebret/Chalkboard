// client/src/services/geminiJSON.js

import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ storage });

/**
 * Handles PDF upload and returns URLs for processing
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
export async function handleUpload(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const urls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process upload' });
  }
}

/**
 * Processes PDFs using Gemini and returns structured course data
 * @param {string[]} urls - Array of PDF URLs
 * @returns {Promise<Object>} - Structured course data
 */
export async function processPdfs(urls) {
  try {
    // Read PDF contents
    const pdfContents = await Promise.all(
      urls.map(async (url) => {
        const filePath = path.join(process.cwd(), url);
        const content = await fs.promises.readFile(filePath, 'base64');
        return content;
      })
    );

    // Build the Gemini prompt
    const prompt = `
You are an extremely detail-oriented data parser analyzing course outlines. Extract and format the information EXACTLY as specified below.

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
\`\`\`json
{
  "courses": [
    {
      "courseName": "MATH*2210: Advanced Calculus II",
      "lectureTimes": ["MON1430-1630", "WED1430-1630"],
      "officeHours": ["TUE1200-1300", "THU1100-1230"],
      "topics": ["DOUBLE INTEGRALS", "TRIPLE INTEGRALS", "VECTOR CALCULUS"]
    }
    // ...more courses
  ]
}
\`\`\`

Here are the PDF contents to parse:
${pdfContents.map((content, i) => `PDF ${i + 1}:\n${content}`).join('\n\n')}
`.trim();

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse and return the JSON
    return JSON.parse(text);
  } catch (error) {
    console.error('PDF processing error:', error);
    throw error;
  }
}
  