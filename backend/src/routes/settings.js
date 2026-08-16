import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// GET /api/settings - Get site settings
router.get('/', async (req, res) => {
  try {
    const result = await query(`SELECT value FROM site_settings WHERE key = 'general'`);
    if (result.rows.length === 0) {
      return res.json({});
    }
    const val = result.rows[0].value;
    res.json(typeof val === 'string' ? JSON.parse(val) : val);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings - Update site settings
router.put('/', async (req, res) => {
  try {
    const settings = req.body;
    const result = await query(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES ('general', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP
       RETURNING value`,
      [JSON.stringify(settings)]
    );

    const val = result.rows[0].value;
    res.json(typeof val === 'string' ? JSON.parse(val) : val);
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
