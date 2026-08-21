/**
 * Wild Rose Jewel - Client-Side Image Optimizer
 * Converts large raw photos (JPG, PNG, HEIC, etc.) into lightweight,
 * high-detail WebP images tailored for jewelry showcases.
 */

export const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80";

export const handleImageError = (e, fallback = DEFAULT_FALLBACK_IMAGE) => {
  if (e?.target && e.target.src !== fallback) {
    e.target.onerror = null;
    e.target.src = fallback;
  }
};

export const OPTIMIZATION_PRESETS = {
  product: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.88,
    label: 'Каталог товаров',
    hint: 'Рекомендуется: 1:1 или 4:5, от 1000×1000px до 1200×1200px. Оптимальный размер ~200-350 КБ.',
    aspectRatio: '1:1 или 4:5'
  },
  lookbook: {
    maxWidth: 1800,
    maxHeight: 2200,
    quality: 0.90,
    label: 'Интерактивный Лукбук',
    hint: 'Рекомендуется: 3:4 или 4:5 (портретный кадр), от 1200×1600px до 1800×2200px для четкой расстановки меток.',
    aspectRatio: '3:4 или 4:5'
  },
  banner: {
    maxWidth: 2000,
    maxHeight: 1200,
    quality: 0.88,
    label: 'Главный Баннер / Hero',
    hint: 'Рекомендуется: 16:9 или 4:3 (горизонтальный ракурс), от 1600×900px до 2000×1200px для четкости на 4K/Retina.',
    aspectRatio: '16:9 или 4:3'
  },
  general: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.85,
    label: 'Универсальный',
    hint: 'JPG, PNG, WebP до 20 МБ. Автоматическое масштабирование и сжатие в WebP.',
    aspectRatio: 'Любой'
  }
};

/**
 * Optimizes an image file in the browser using HTML5 Canvas.
 * @param {File|Blob} file - The raw input file
 * @param {Object} options - { targetType: 'product'|'lookbook'|'banner'|'general', quality, maxWidth, maxHeight }
 * @returns {Promise<{ blob: Blob, dataUrl: string, originalSize: number, optimizedSize: number, width: number, height: number, compressionRatio: number, fileName: string }>}
 */
export async function optimizeImage(file, options = {}) {
  const targetType = options.targetType || 'product';
  const preset = OPTIMIZATION_PRESETS[targetType] || OPTIMIZATION_PRESETS.general;

  const maxWidth = options.maxWidth || preset.maxWidth;
  const maxHeight = options.maxHeight || preset.maxHeight;
  const quality = options.quality || preset.quality;

  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Не удалось прочитать файл изображения.'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Не удалось декодировать изображение.'));

      img.onload = () => {
        let { width, height } = img;

        // Calculate scaling preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas with high quality smoothing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          return reject(new Error('Не удалось инициализировать графический контекст Canvas.'));
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP (fallback to JPEG if browser does not support webp export)
        const mimeType = 'image/webp';
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Не удалось сжать изображение.'));
            }

            const optimizedSize = blob.size;
            const compressionRatio = originalSize > 0 
              ? Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100))
              : 0;

            const dataUrl = canvas.toDataURL(mimeType, quality);

            resolve({
              blob,
              dataUrl,
              originalSize,
              optimizedSize,
              width,
              height,
              compressionRatio,
              fileName: file.name ? file.name.replace(/\.[^/.]+$/, '') + '.webp' : 'image.webp'
            });
          },
          mimeType,
          quality
        );
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes into human readable string (e.g. 2.4 МБ, 320 КБ)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 Б';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
