import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Helper to format DB product to frontend format
const formatProduct = (row) => ({
  id: row.id,
  sku: row.sku,
  title: row.title,
  category: row.category,
  capsule: row.capsule,
  price: Number(row.price),
  oldPrice: row.old_price ? Number(row.old_price) : null,
  status: row.status,
  isNew: row.is_new,
  isBestseller: row.is_bestseller,
  metal: row.metal,
  stones: row.stones,
  sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes || [],
  weight: row.weight,
  lockType: row.lock_type,
  mainImage: row.main_image,
  hoverImage: row.hover_image,
  detailImages: typeof row.detail_images === 'string' ? JSON.parse(row.detail_images) : row.detail_images || [],
  videoUrl: row.video_url,
  story: row.story,
  styleAdvice: row.style_advice,
  care: row.care,
  createdAt: row.created_at
});

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    let sql = 'SELECT * FROM products';
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      sql += ` WHERE category = $${params.length}`;
    }

    if (status) {
      sql += params.length ? ` AND status = $${params.length + 1}` : ` WHERE status = $1`;
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows.map(formatProduct));
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(formatProduct(result.rows[0]));
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const p = req.body;
    const id = p.id || `wr-${Date.now().toString().slice(-4)}`;
    const sku = p.sku || `WR-${Date.now().toString().slice(-6)}`;

    const result = await query(
      `INSERT INTO products (
        id, sku, title, category, capsule, price, old_price, status, is_new, is_bestseller,
        metal, stones, sizes, weight, lock_type, main_image, hover_image, detail_images,
        video_url, story, style_advice, care
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *`,
      [
        id, sku, p.title, p.category || 'necklaces', p.capsule, Number(p.price) || 0,
        p.oldPrice ? Number(p.oldPrice) : null, p.status || 'in_stock', p.isNew ?? false,
        p.isBestseller ?? false, p.metal, p.stones, JSON.stringify(p.sizes || ['Standard']),
        p.weight, p.lockType, p.mainImage, p.hoverImage, JSON.stringify(p.detailImages || []),
        p.videoUrl, p.story, p.styleAdvice, p.care
      ]
    );

    res.status(201).json(formatProduct(result.rows[0]));
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const p = req.body;

    const result = await query(
      `UPDATE products SET
        sku = COALESCE($1, sku),
        title = COALESCE($2, title),
        category = COALESCE($3, category),
        capsule = COALESCE($4, capsule),
        price = COALESCE($5, price),
        old_price = $6,
        status = COALESCE($7, status),
        is_new = COALESCE($8, is_new),
        is_bestseller = COALESCE($9, is_bestseller),
        metal = COALESCE($10, metal),
        stones = COALESCE($11, stones),
        sizes = COALESCE($12, sizes),
        weight = COALESCE($13, weight),
        lock_type = COALESCE($14, lock_type),
        main_image = COALESCE($15, main_image),
        hover_image = COALESCE($16, hover_image),
        detail_images = COALESCE($17, detail_images),
        video_url = COALESCE($18, video_url),
        story = COALESCE($19, story),
        style_advice = COALESCE($20, style_advice),
        care = COALESCE($21, care),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $22
      RETURNING *`,
      [
        p.sku, p.title, p.category, p.capsule, p.price ? Number(p.price) : undefined,
        p.oldPrice !== undefined ? (p.oldPrice ? Number(p.oldPrice) : null) : undefined,
        p.status, p.isNew, p.isBestseller, p.metal, p.stones,
        p.sizes ? JSON.stringify(p.sizes) : undefined, p.weight, p.lockType,
        p.mainImage, p.hoverImage, p.detailImages ? JSON.stringify(p.detailImages) : undefined,
        p.videoUrl, p.story, p.styleAdvice, p.care, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(formatProduct(result.rows[0]));
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
