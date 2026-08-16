import React, { useState, useRef } from 'react';
import {
  UploadCloud, Image as ImageIcon, CheckCircle2, AlertCircle,
  RefreshCw, Trash2, ExternalLink, Sparkles, HelpCircle, Link as LinkIcon
} from 'lucide-react';
import { optimizeImage, formatBytes, OPTIMIZATION_PRESETS } from '../utils/imageOptimizer';
import { api } from '../api/apiClient';
import './ImageUploader.css';

/**
 * ImageUploader Component with Drag & Drop, Previews, WebP Auto-Compression & Storage Upload
 * 
 * @param {Object} props
 * @param {string} props.value - Current image URL
 * @param {function} props.onChange - Callback with new image URL
 * @param {string} [props.targetType='product'] - 'product' | 'lookbook' | 'banner' | 'general'
 * @param {string} [props.label] - Custom label
 * @param {string} [props.customHint] - Optional extra hint text
 * @param {boolean} [props.required=false]
 */
export const ImageUploader = ({
  value = '',
  onChange,
  targetType = 'product',
  label = 'Изображение',
  customHint,
  required = false,
  compact = false
}) => {
  const preset = OPTIMIZATION_PRESETS[targetType] || OPTIMIZATION_PRESETS.general;

  const [isDragging, setIsDragging] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(''); // Status message
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState(null); // { originalSize, optimizedSize, ratio, width, height }
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [showHintModal, setShowHintModal] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  // Reset error when value changes
  React.useEffect(() => {
    setHasImageError(false);
  }, [value]);

  const fileInputRef = useRef(null);

  // Handle file processing
  const handleProcessFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Пожалуйста, выберите файл изображения (JPG, PNG, WebP, HEIC).');
      return;
    }

    setErrorMessage('');
    setIsOptimizing(true);
    setUploadStatus('Сжатие и оптимизация в WebP...');

    try {
      // 1. Client-Side WebP Conversion & High Quality Resizing
      const optimized = await optimizeImage(file, { targetType });
      
      setStats({
        originalSize: optimized.originalSize,
        optimizedSize: optimized.optimizedSize,
        ratio: optimized.compressionRatio,
        width: optimized.width,
        height: optimized.height
      });

      setIsOptimizing(false);
      setIsUploading(true);
      setUploadStatus('Загрузка в хранилище (Google Drive / Server)...');

      // 2. Upload to backend / Google Drive
      const uploadRes = await api.uploadImage(optimized.blob, {
        targetType,
        fileName: optimized.fileName
      });

      if (uploadRes && uploadRes.url) {
        onChange(uploadRes.url);
        setUploadStatus('Изображение успешно загружено!');
      } else {
        throw new Error('Сервер не вернул URL изображения.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setErrorMessage(err.message || 'Ошибка при загрузке фото.');
    } finally {
      setIsOptimizing(false);
      setIsUploading(false);
      setTimeout(() => setUploadStatus(''), 4000);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setStats(null);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplyManualUrl = () => {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setShowUrlInput(false);
      setManualUrl('');
    }
  };

  return (
    <div className={`wrj-image-uploader-wrapper ${compact ? 'compact-mode' : ''}`}>
      
      {/* Label and Hint Bar (only if label given and not compact without label) */}
      {label && (
        <div className="uploader-header-row">
          <label className="uploader-label">
            {label} {required && <span className="req-star">*</span>}
          </label>
          
          <div className="uploader-preset-badge" onClick={() => setShowHintModal(!showHintModal)} title="Нажмите, чтобы увидеть требования к формату">
            <Sparkles size={13} className="sparkle-icon" />
            <span>{preset.aspectRatio}</span>
            <HelpCircle size={13} className="help-icon" />
          </div>
        </div>
      )}

      {/* Interactive Hint Popover Modal */}
      {showHintModal && (
        <div className="uploader-hint-popover">
          <div className="hint-popover-header">
            <div className="hint-popover-title">
              <Sparkles size={14} className="sparkle-icon" />
              <span>Параметры: {preset.label}</span>
            </div>
            <button
              type="button"
              className="hint-popover-close"
              onClick={() => setShowHintModal(false)}
            >
              ✕
            </button>
          </div>

          <div className="hint-popover-grid">
            <div className="hint-grid-item">
              <span className="hint-item-label">Пропорции:</span>
              <strong className="hint-item-value">{preset.aspectRatio}</strong>
            </div>
            <div className="hint-grid-item">
              <span className="hint-item-label">Разрешение:</span>
              <strong className="hint-item-value">до {preset.maxWidth}×{preset.maxHeight}px</strong>
            </div>
            <div className="hint-grid-item">
              <span className="hint-item-label">Формат на выходе:</span>
              <strong className="hint-item-value">WebP (~200-400 КБ)</strong>
            </div>
            <div className="hint-grid-item">
              <span className="hint-item-label">Исходный файл:</span>
              <strong className="hint-item-value">JPG, PNG, HEIC до 30 МБ</strong>
            </div>
          </div>

          <p className="hint-popover-desc">
            {customHint || preset.hint}
          </p>

          <div className="hint-popover-note">
            💡 Автоматическое масштабирование в вертикальный формат 4:5 или 1:1.
          </div>
        </div>
      )}

      {/* Target Dimension Suggestion Hint (hidden in compact mode) */}
      {!compact && (customHint || preset.hint) && (
        <div className="uploader-dimension-hint">
          <span>{customHint || preset.hint}</span>
        </div>
      )}

      {/* Main Upload Box */}
      <div
        className={`uploader-dropzone ${isDragging ? 'dragging' : ''} ${value ? 'has-image' : ''} ${isOptimizing || isUploading ? 'loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !value && !isOptimizing && !isUploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {/* State 1: Active Image Loaded */}
        {value ? (
          <div className="uploader-preview-container">
            {!hasImageError ? (
              <img
                src={value}
                alt="Превью изделия"
                className="uploader-preview-img"
                onError={() => {
                  setHasImageError(true);
                  setErrorMessage('Не удалось загрузить изображение по данной ссылке. Проверьте адрес или загрузите файл.');
                }}
              />
            ) : (
              <div className="uploader-preview-fallback">
                <AlertCircle size={28} className="fallback-error-icon" />
                <span>Изображение недоступно по ссылке</span>
                <button
                  type="button"
                  className="uploader-btn-action replace"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <RefreshCw size={14} /> Загрузить файл
                </button>
              </div>
            )}

            <div className="uploader-overlay-actions">
              <button
                type="button"
                className="uploader-btn-action replace"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                title="Заменить фото"
              >
                <RefreshCw size={15} /> Заменить
              </button>
              
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="uploader-btn-action link"
                onClick={(e) => e.stopPropagation()}
                title="Открыть в оригинале"
              >
                <ExternalLink size={15} />
              </a>

              <button
                type="button"
                className="uploader-btn-action delete"
                onClick={handleClear}
                title="Удалить фото"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Optimization stats pill */}
            {stats && (
              <div className="uploader-stats-pill">
                <CheckCircle2 size={13} />
                <span>
                  {formatBytes(stats.originalSize)} → {formatBytes(stats.optimizedSize)} WebP (-{stats.ratio}%)
                </span>
              </div>
            )}
          </div>
        ) : (
          /* State 2: Empty Drag & Drop Area */
          <div className="uploader-empty-content">
            <div className="uploader-icon-circle">
              <UploadCloud size={28} />
            </div>

            <div className="uploader-text-block">
              <p className="primary-text">
                <strong>Перетащите фото сюда</strong> или <span className="browse-link">выберите на устройстве</span>
              </p>
              <p className="sub-text">
                Авто-сжатие в WebP • Поддержка до 30 МБ
              </p>
            </div>
          </div>
        )}

        {/* Loading Spinner / Progress Overlay */}
        {(isOptimizing || isUploading) && (
          <div className="uploader-loading-overlay">
            <div className="uploader-spinner"></div>
            <p className="loading-status-text">{uploadStatus}</p>
          </div>
        )}
      </div>

      {/* Secondary Actions: Manual URL Input toggle */}
      <div className="uploader-footer-controls">
        {!showUrlInput ? (
          <button
            type="button"
            className="uploader-toggle-url-btn"
            onClick={() => setShowUrlInput(true)}
          >
            <LinkIcon size={13} /> Вставить прямую ссылку на фото
          </button>
        ) : (
          <div className="uploader-manual-url-box">
            <input
              type="url"
              placeholder="https://images.unsplash.com/... или ссылка на Google Drive"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="uploader-url-input"
            />
            <button
              type="button"
              className="uploader-apply-url-btn"
              onClick={handleApplyManualUrl}
            >
              Применить
            </button>
            <button
              type="button"
              className="uploader-cancel-url-btn"
              onClick={() => setShowUrlInput(false)}
            >
              Отмена
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {errorMessage && (
        <div className="uploader-error-box">
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Notification */}
      {uploadStatus && !isOptimizing && !isUploading && (
        <div className="uploader-success-box">
          <CheckCircle2 size={15} />
          <span>{uploadStatus}</span>
        </div>
      )}

    </div>
  );
};
