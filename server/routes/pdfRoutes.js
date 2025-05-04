import express from 'express';
import { upload, handleUpload, processPdfs } from '../services/geminiJSON.js';

const router = express.Router();

// Handle PDF uploads
router.post('/upload', upload.array('pdfs'), handleUpload);

// Process uploaded PDFs
router.post('/process', async (req, res) => {
  try {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'Invalid URLs provided' });
    }

    const result = await processPdfs(urls);
    res.json(result);
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Failed to process PDFs' });
  }
});

export default router; 