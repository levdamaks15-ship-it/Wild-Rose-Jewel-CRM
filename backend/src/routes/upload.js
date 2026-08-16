import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import { query } from '../db.js';
import sharp from 'sharp';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer storage in memory for processing
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB limit for raw camera photos
});

const router = express.Router();

/**
 * Fetch current Google Drive settings from DB
 */
async function getStorageSettings() {
  try {
    const res = await query(`SELECT value FROM site_settings WHERE key = 'general'`);
    if (res.rows.length > 0) {
      const val = res.rows[0].value;
      const parsed = typeof val === 'string' ? JSON.parse(val) : val;
      return {
        storageMode: parsed.storageMode || 'auto', // 'google_drive', 'local', 'auto'
        googleDriveFolderId: parsed.googleDriveFolderId || process.env.GOOGLE_DRIVE_FOLDER_ID || '',
        googleServiceAccountKey: parsed.googleServiceAccountKey || process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '',
        googleDriveWebhookUrl: parsed.googleDriveWebhookUrl || process.env.GOOGLE_DRIVE_WEBHOOK_URL || ''
      };
    }
  } catch (err) {
    console.warn('Failed to read site_settings for storage:', err.message);
  }

  return {
    storageMode: 'auto',
    googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
    googleServiceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '',
    googleDriveWebhookUrl: process.env.GOOGLE_DRIVE_WEBHOOK_URL || ''
  };
}

/**
 * Upload buffer to Google Drive using Service Account
 */
async function uploadToGoogleDriveServiceAccount(buffer, fileName, mimeType, folderId, serviceAccountKey) {
  let credentials;
  if (typeof serviceAccountKey === 'string') {
    credentials = JSON.parse(serviceAccountKey);
  } else {
    credentials = serviceAccountKey;
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : undefined
  };

  const media = {
    mimeType: mimeType || 'image/webp',
    body: stream
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink, webContentLink'
  });

  const fileId = response.data.id;

  // Make the file publicly viewable so it can render as <img> on the website
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
  } catch (permErr) {
    console.warn('Permission setting warning:', permErr.message);
  }

  // Direct high-speed CDN URL for Google Drive files
  const directPublicUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

  return {
    fileId,
    url: directPublicUrl,
    fallbackUrl: `https://drive.google.com/uc?export=view&id=${fileId}`
  };
}

/**
 * Upload buffer to Google Drive via Google Apps Script Webhook
 */
async function uploadToGoogleDriveWebhook(buffer, fileName, mimeType, folderId, webhookUrl) {
  const base64Data = buffer.toString('base64');
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'uploadImage',
      fileName,
      mimeType: mimeType || 'image/webp',
      folderId,
      base64Data
    })
  });

  if (!response.ok) {
    throw new Error(`Google Apps Script returned status ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Google Apps Script upload failed');
  }

  return {
    fileId: result.fileId,
    url: result.directUrl || result.url || `https://lh3.googleusercontent.com/d/${result.fileId}`
  };
}

/**
 * Save buffer locally to /uploads/
 */
async function saveLocally(buffer, fileName, req) {
  const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = path.join(uploadsDir, safeName);
  
  await fs.promises.writeFile(filePath, buffer);

  // Construct absolute URL or relative URL based on host
  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost:5000';
  const url = `${protocol}://${host}/uploads/${safeName}`;

  return {
    url,
    relativePath: `/uploads/${safeName}`,
    fileName: safeName
  };
}

/**
 * Optimize / resize image buffer using Sharp if not already optimized
 */
async function processImageBuffer(inputBuffer, targetType = 'product') {
  const presets = {
    product: { maxWidth: 1200, maxHeight: 1200, quality: 88 },
    lookbook: { maxWidth: 1800, maxHeight: 2200, quality: 90 },
    banner: { maxWidth: 2000, maxHeight: 1200, quality: 88 },
    general: { maxWidth: 1600, maxHeight: 1600, quality: 85 }
  };

  const preset = presets[targetType] || presets.general;

  try {
    const pipeline = sharp(inputBuffer);
    const metadata = await pipeline.metadata();

    let transform = sharp(inputBuffer)
      .resize({
        width: preset.maxWidth,
        height: preset.maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: preset.quality, effort: 4 });

    const optimizedBuffer = await transform.toBuffer();
    const finalMeta = await sharp(optimizedBuffer).metadata();

    return {
      buffer: optimizedBuffer,
      mimeType: 'image/webp',
      width: finalMeta.width || metadata.width,
      height: finalMeta.height || metadata.height,
      originalSize: inputBuffer.length,
      optimizedSize: optimizedBuffer.length
    };
  } catch (err) {
    console.warn('Sharp processing notice (using direct buffer):', err.message);
    return {
      buffer: inputBuffer,
      mimeType: 'image/webp',
      originalSize: inputBuffer.length,
      optimizedSize: inputBuffer.length
    };
  }
}

/**
 * POST /api/upload
 * Handles file upload (multipart/form-data or JSON with base64/buffer)
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    let inputBuffer;
    let originalName = 'upload.webp';
    const targetType = req.body.targetType || 'product';

    if (req.file) {
      inputBuffer = req.file.buffer;
      originalName = req.file.originalname || originalName;
    } else if (req.body.base64Data) {
      const base64Clean = req.body.base64Data.replace(/^data:image\/\w+;base64,/, '');
      inputBuffer = Buffer.from(base64Clean, 'base64');
      if (req.body.fileName) originalName = req.body.fileName;
    } else {
      return res.status(400).json({ error: 'Изображение не передано. Прикрепите файл или base64 данные.' });
    }

    // Process & optimize to WebP
    const processed = await processImageBuffer(inputBuffer, targetType);
    const webpFileName = originalName.replace(/\.[^/.]+$/, '') + '.webp';

    const settings = await getStorageSettings();
    let uploadResult = null;
    let provider = 'local';

    // Attempt Google Drive upload if configured
    if (settings.storageMode !== 'local') {
      // 1. Check Service Account Key
      if (settings.googleServiceAccountKey) {
        try {
          const gdriveRes = await uploadToGoogleDriveServiceAccount(
            processed.buffer,
            webpFileName,
            processed.mimeType,
            settings.googleDriveFolderId,
            settings.googleServiceAccountKey
          );
          uploadResult = gdriveRes;
          provider = 'google_drive_service_account';
        } catch (gErr) {
          console.error('Google Drive Service Account upload error:', gErr.message);
        }
      }
      // 2. Check Apps Script Webhook
      else if (settings.googleDriveWebhookUrl) {
        try {
          const gdriveRes = await uploadToGoogleDriveWebhook(
            processed.buffer,
            webpFileName,
            processed.mimeType,
            settings.googleDriveFolderId,
            settings.googleDriveWebhookUrl
          );
          uploadResult = gdriveRes;
          provider = 'google_drive_webhook';
        } catch (wErr) {
          console.error('Google Drive Webhook upload error:', wErr.message);
        }
      }
    }

    // Fallback to local storage if Google Drive wasn't used or failed
    if (!uploadResult) {
      uploadResult = await saveLocally(processed.buffer, webpFileName, req);
      provider = 'local_fallback';
    }

    res.json({
      success: true,
      url: uploadResult.url,
      fallbackUrl: uploadResult.fallbackUrl || uploadResult.url,
      provider,
      fileName: webpFileName,
      originalSize: processed.originalSize,
      optimizedSize: processed.optimizedSize,
      width: processed.width,
      height: processed.height
    });

  } catch (err) {
    console.error('Upload handler error:', err);
    res.status(500).json({ error: err.message || 'Ошибка при загрузке изображения' });
  }
});

/**
 * POST /api/upload/test-drive
 * Validates Google Drive connection with given settings
 */
router.post('/test-drive', async (req, res) => {
  try {
    const { googleServiceAccountKey, googleDriveFolderId, googleDriveWebhookUrl } = req.body;

    if (googleServiceAccountKey) {
      let credentials;
      try {
        credentials = typeof googleServiceAccountKey === 'string' ? JSON.parse(googleServiceAccountKey) : googleServiceAccountKey;
      } catch {
        return res.status(400).json({ success: false, error: 'Неверный JSON формат Service Account Key' });
      }

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly']
      });

      const drive = google.drive({ version: 'v3', auth });

      if (googleDriveFolderId) {
        const folder = await drive.files.get({
          fileId: googleDriveFolderId,
          fields: 'id, name, mimeType'
        });
        return res.json({
          success: true,
          message: `Подключение успешно! Папка найдена: "${folder.data.name}"`,
          folderName: folder.data.name
        });
      } else {
        const list = await drive.files.list({ pageSize: 1 });
        return res.json({
          success: true,
          message: 'Подключение успешно! Доступ к Google Drive подтвержден.'
        });
      }
    } else if (googleDriveWebhookUrl) {
      const response = await fetch(googleDriveWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping' })
      });
      const data = await response.json();
      return res.json({
        success: true,
        message: 'Google Apps Script Webhook активен и отвечает!',
        data
      });
    } else {
      return res.status(400).json({ success: false, error: 'Не указаны настройки Google Drive' });
    }
  } catch (err) {
    console.error('Test drive failed:', err);
    res.status(500).json({ success: false, error: err.message || 'Ошибка проверки Google Drive' });
  }
});

export default router;
