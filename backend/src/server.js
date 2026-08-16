import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
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

// Process-level crash prevention
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ [CRITICAL] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('💥 [CRITICAL] Uncaught Exception:', err);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Railway, Render, Nginx) for accurate client IP rate limiting
app.set('trust proxy', 1);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// --- RATE LIMITERS ---
// General API limiter: 300 requests per 1 minute per IP
const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  message: { error: 'Слишком много запросов. Пожалуйста, попробуйте чуть позже.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Order creation limiter: max 10 orders per 15 minutes per IP
const orderCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Слишком много попыток оформления заказа. Пожалуйста, подождите несколько минут.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload limiter: max 30 uploads per 10 minutes per IP
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { error: 'Превышен лимит загрузки файлов. Пожалуйста, подождите.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', generalApiLimiter);

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

// API Routes with tailored rate limits
app.use('/api/products', productsRouter);
app.use('/api/sections', sectionsRouter);
app.use('/api/orders', orderCreationLimiter, ordersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadLimiter, uploadRouter);

// Protected Database Manual Migration / Seed Endpoint
app.post('/api/init-db', async (req, res) => {
  const secretKey = process.env.ADMIN_SECRET || 'wildrose-crm-init-key-2026';
  const providedKey = req.headers['x-admin-key'] || req.query.key;

  if (!providedKey || providedKey !== secretKey) {
    return res.status(403).json({ error: 'Доступ запрещен: требуется корректный x-admin-key' });
  }

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
