import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Helper to format Order
const formatOrder = (row) => ({
  id: row.id,
  status: row.status,
  items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
  total: Number(row.total),
  customerName: row.customer_name,
  customerPhone: row.customer_phone,
  customerEmail: row.customer_email,
  deliveryCity: row.delivery_city,
  deliveryAddress: row.delivery_address,
  comment: row.comment,
  createdAt: row.created_at
});

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows.map(formatOrder));
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  try {
    const o = req.body;
    const id = o.id || `ORD-${Date.now().toString().slice(-6)}`;
    const items = o.items || [];
    const total = o.total !== undefined ? Number(o.total) : items.reduce((sum, i) => sum + (Number(i.price) * (i.quantity || 1)), 0);

    const result = await query(
      `INSERT INTO orders (
        id, status, items, total, customer_name, customer_phone, customer_email,
        delivery_city, delivery_address, comment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        id, o.status || 'new', JSON.stringify(items), total,
        o.customerName || o.name, o.customerPhone || o.phone, o.customerEmail || o.email,
        o.deliveryCity || o.city, o.deliveryAddress || o.address, o.comment
      ]
    );

    const savedOrder = formatOrder(result.rows[0]);

    // Check if Google Sheets Webhook is configured
    try {
      const setRes = await query(`SELECT value FROM site_settings WHERE key = 'general'`);
      if (setRes.rows.length > 0) {
        const settings = typeof setRes.rows[0].value === 'string' ? JSON.parse(setRes.rows[0].value) : setRes.rows[0].value;
        if (settings && settings.googleSheetsWebhookUrl) {
          fetch(settings.googleSheetsWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(savedOrder)
          }).catch(e => console.warn('Google Sheets Webhook async err:', e.message));
        }
      }
    } catch (hookErr) {
      console.warn('Could not trigger Google Sheets webhook:', hookErr.message);
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: err.message || 'Failed to create order' });
  }
});

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(formatOrder(result.rows[0]));
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
