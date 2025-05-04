// client/src/services/geminiJSON.js

/**
 * Reads PDFs (File objects), uploads them to your Express server,
 * calls Gemini, and returns the parsed JSON.
 * @param {File[]} files – Array of browser File objects
 * @returns {Promise<Object>} – Parsed JSON matching the "courses" schema
 */
export async function readPdfsAndParse(files) {
    // 1) Upload the files to your upload endpoint
    const form = new FormData();
    files.forEach((file) => form.append('pdfs', file));
  
    const uploadResponse = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: form,
    });
  
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }
  
    const { urls } = await uploadResponse.json();
    if (!Array.isArray(urls) || urls.length === 0) {
      throw new Error('Upload endpoint did not return any URLs');
    }
  
    // 2) Build the Gemini prompt
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
  
  Here are the PDF URLs to parse:
  ${urls.map(u => `- ${u}`).join('\n')}
  `.trim();
  
    // 3) Call the Gemini API (browser SDK)
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
  
    // 4) Parse and return the JSON
    try {
      return JSON.parse(aiResponse.text);
    } catch (error) {
      throw new Error('Failed to parse JSON from Gemini response: ' + error.message);
    }
  }
  