import express from 'express';
import { extractScheduleFromMultiplePDFs } from '../services/geminiServiceJSON.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/process-pdf', upload.any(), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const pdfPaths = req.files.map(file => file.path);
    const result = await extractScheduleFromMultiplePDFs(pdfPaths);
    
    // Clean up uploaded files after processing
    req.files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error processing PDFs:', error);
    res.status(500).json({ error: 'Error processing PDFs' });
  }
});

export default router; 