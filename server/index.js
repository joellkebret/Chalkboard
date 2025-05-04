import express from 'express';
import path from 'path';
import scheduleRoutes from './routes/schedule.js';
import uploadRoutes from './routes/upload.js';

const app = express();

// 1. Parse JSON bodies
app.use(express.json());

// 2. Serve uploaded files statically
//    Any GET to /uploads/<filename> will return server/uploads/<filename>
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'))
);

// 3. Mount your upload endpoint at POST /upload
//    'uploadRoutes' handles POST '/' inside so '/upload' is correct
app.use('/upload', uploadRoutes);

// 4. Mount your scheduling engine routes under /api
app.use('/api', scheduleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;