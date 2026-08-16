import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db.js';
import { seedDatabase } from './seed.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import productsRouter from './routes/products.js';
import sectionsRouter from './routes/sections.js';
import ordersRouter from './routes/orders.js';
import settingsRouter from './routes/settings.js';
import uploadRouter from './routes/upload.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve built React frontend from root dist directory
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Wild Rose Jewel API', timestamp: new Date() });
});

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/sections', sectionsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadRouter);

// Database Manual Migration / Seed Endpoint
app.post('/api/init-db', async (req, res) => {
  try {
    await initDb();
    await seedDatabase();
    res.json({ success: true, message: 'Database initialized and seeded successfully' });
  } catch (err) {
    console.error('Init DB failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Wildcard SPA Handler: send index.html for frontend routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('Wild Rose Jewel API is running. Build frontend with npm run build.');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server & Auto-init DB
app.listen(PORT, async () => {
  console.log(`✨ Wild Rose Jewel Backend running on http://localhost:${PORT}`);
  if (process.env.DATABASE_URL) {
    try {
      await initDb();
      await seedDatabase();
    } catch (e) {
      console.warn('Auto DB initialization notice:', e.message);
    }
  } else {
    console.log('⚠️ DATABASE_URL is not set. Please set DATABASE_URL in backend/.env to connect to Railway PostgreSQL.');
  }
});
