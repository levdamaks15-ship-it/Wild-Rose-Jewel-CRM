import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Helper to format DB Section
const formatSection = (row, hotspots = []) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  enabled: row.enabled,
  orderIndex: row.order_index,
  title: row.title,
  subtitle: row.subtitle,
  buttonText: row.button_text,
  buttonLink: row.button_link,
  imageUrl: row.image_url,
  text: row.text,
  extraData: typeof row.extra_data === 'string' ? JSON.parse(row.extra_data) : row.extra_data || {},
  hotspots: hotspots.map(h => ({
    id: h.id,
    top: h.top,
    left: h.left_coord,
    productId: h.product_id,
    label: h.label
  }))
});

// GET /api/sections - Get all page sections with hotspots
router.get('/', async (req, res) => {
  try {
    const secResult = await query('SELECT * FROM page_sections ORDER BY order_index ASC');
    const spotsResult = await query('SELECT * FROM lookbook_hotspots');

    const sections = secResult.rows.map(sec => {
      const sectionSpots = spotsResult.rows.filter(spot => spot.section_id === sec.id);
      return formatSection(sec, sectionSpots);
    });

    res.json(sections);
  } catch (err) {
    console.error('Error fetching sections:', err);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// PUT /api/sections/reorder - Reorder and update sections batch
router.put('/reorder', async (req, res) => {
  try {
    const { sections } = req.body; // Array of sections with updated orderIndex and enabled
    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'Sections array is required' });
    }

    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      await query(
        `UPDATE page_sections
         SET order_index = $1, enabled = COALESCE($2, enabled), updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [i, s.enabled !== undefined ? s.enabled : true, s.id]
      );
    }

    res.json({ success: true, message: 'Sections reordered successfully' });
  } catch (err) {
    console.error('Error reordering sections:', err);
    res.status(500).json({ error: 'Failed to reorder sections' });
  }
});

// PUT /api/sections/:id - Update specific section (titles, lookbook image & hotspots)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, imageUrl, buttonText, buttonLink, text, extraData, enabled, hotspots } = req.body;

    const result = await query(
      `UPDATE page_sections SET
        title = COALESCE($1, title),
        subtitle = COALESCE($2, subtitle),
        image_url = COALESCE($3, image_url),
        button_text = COALESCE($4, button_text),
        button_link = COALESCE($5, button_link),
        text = COALESCE($6, text),
        extra_data = COALESCE($7, extra_data),
        enabled = COALESCE($8, enabled),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *`,
      [
        title, subtitle, imageUrl, buttonText, buttonLink, text,
        extraData ? JSON.stringify(extraData) : undefined, enabled, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // If hotspots provided (e.g. Lookbook editor save), sync hotspots table
    if (Array.isArray(hotspots)) {
      // Clear existing hotspots for this section
      await query('DELETE FROM lookbook_hotspots WHERE section_id = $1', [id]);

      // Insert updated hotspots
      for (const h of hotspots) {
        const spotId = h.id || `h_${Date.now().toString().slice(-4)}`;
        await query(
          `INSERT INTO lookbook_hotspots (id, section_id, product_id, top, left_coord, label)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [spotId, id, h.productId || null, h.top, h.left || h.leftCoord, h.label]
        );
      }
    }

    // Fetch updated hotspots
    const updatedSpots = await query('SELECT * FROM lookbook_hotspots WHERE section_id = $1', [id]);

    res.json(formatSection(result.rows[0], updatedSpots.rows));
  } catch (err) {
    console.error('Error updating section:', err);
    res.status(500).json({ error: err.message || 'Failed to update section' });
  }
});

export default router;
