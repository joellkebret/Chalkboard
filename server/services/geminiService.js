import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import PDFParser from 'pdf2json';

// Initialize Gemini with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const extractTextFromPDF = (pdfPath) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const text = decodeURIComponent(pdfData.Pages.map(page => 
        page.Texts.map(text => text.R.map(r => r.T).join(' ')).join(' ')
      ).join('\n'));
      resolve(text);
    });
    
    pdfParser.on('pdfParser_dataError', (error) => {
      reject(error);
    });
    
    pdfParser.loadPDF(pdfPath);
  });
};

export const extractScheduleFromMultiplePDFs = async (filePaths) => {
  try {
    console.log("🔑 Using GEMINI_API_KEY:", process.env.GEMINI_API_KEY?.slice(0, 6) + '...');

    // Load the Gemini 1.5 Flash model for processing PDFs
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log("📂 Extracting text from PDFs...");
    const pdfContents = await Promise.all(
      filePaths.map(pdfPath => extractTextFromPDF(pdfPath))
    );

    console.log("🚀 Sending request to Gemini...");
    const result = await model.generateContent([
      {
        text: "These are multiple course outlines and you are to act as a extremely detail-oriented data parser. The data you return must be in the specified format exactly. I would like you to look at each course outline for each class and return the information for each class in the following format. Note that each piece of information I ask for should be on its own line. To begin, write the number of courses you were supplied. Then write the following for each course and remember to separate info onto its own lines. Write: COURSE_NAME=insert-course-name. Then write the lecture times in the following format: LECTURETIMES=WED1430-1630,THU1620-1850. If the course is asynchronous or has no fixed lecture times, write LECTURETIMES=ASYNC. You should use 24 hour time when you write these lecture times and the typical 3 letter abbreviation for days of the week. It is CRITICAL that you find ALL lecture times for each class and list them on the same line separated by commas. Then list office-hours using the same format as in OFFICE_HOURS=WED1240-1430,FRI0600-1600. For these times all should be 4 digits as I showed you. Then I want you to examine the syllabus and list the topics the students in this class will be learning in the following format: TOPICS=DERIVATIVE OF TRIG FUNCTIONS,INTEGRATION BY PARTS,LEBESGUE MEASURE THEORY. I want this information listed for each class in exactly the format I specified. there should be no lines separating classes and there should be absolutely no other text in your response other than the text I've directed you to find in the course outlines.  Thank you."
      },
      ...pdfContents.map(content => ({ text: content }))
    ]);

    const response = await result.response;
    const text = response.text();

    console.log("📄 Gemini Output:");
    console.log(text);

    return text;
  } catch (error) {
    console.error("❌ Error processing PDFs:", error);
    throw error;
  }
};