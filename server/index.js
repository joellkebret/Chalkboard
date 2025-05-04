<<<<<<< HEAD
import express from 'express';
import uploadRoutes from './routes/upload.js';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

// Needed to calculate the current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point to .env in the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Routes
app.use('/upload', uploadRoutes);

// Root test route (optional)
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
=======
import express from 'express'
import scheduleRoutes from './routes/schedule.js'

const app = express()
app.use(express.json())

// Mount the scheduling engine route
app.use('/api', scheduleRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

export default app 
>>>>>>> origin/frontend
