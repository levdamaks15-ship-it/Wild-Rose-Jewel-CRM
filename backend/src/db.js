import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Support Railway DATABASE_URL, local PG connection string, or default connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wild_rose_db';

const isProduction = process.env.NODE_ENV === 'production' || connectionString.includes('railway') || connectionString.includes('neon') || connectionString.includes('supabase');

export const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

export const query = (text, params) => pool.query(text, params);

// Auto-run schema migration
export const initDb = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(sql);
      console.log('✅ PostgreSQL Schema initialized successfully');
    }
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error);
  }
};
