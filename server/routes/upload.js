import express from 'express';
import multer from 'multer';
import { extractScheduleFromMultiplePDFs } from '../services/geminiService.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.array('pdfs'), async (req, res) => {
  console.log("📥 Upload route was hit!");

  try {
    const filePaths = req.files.map(file => file.path);
    console.log("📁 Files received:", filePaths);

    const result = await extractScheduleFromMultiplePDFs(filePaths);
    console.log("📤 Gemini response:", result);

    res.json({ schedule: result });
  } catch (error) {
    console.error("❌ Route error:", error);
    res.status(500).json({ error: 'Failed to extract schedule from uploaded PDFs.' });
  }
});

export default router;