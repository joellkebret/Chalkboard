import express from 'express';
import cors from 'cors';
import path from 'path';
import scheduleRoutes from './routes/schedule.js';
import uploadRoutes from './routes/upload.js';
import pdfRoutes from './routes/pdfRoutes.js';

const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mount all routes under /api
app.use('/api', uploadRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', pdfRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;