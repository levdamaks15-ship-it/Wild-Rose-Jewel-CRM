import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Trash2, Check, Sparkles, Image as ImageIcon, Crosshair, ArrowRight } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import './LookbookEditor.css';

export const LookbookEditor = ({ section, onClose }) => {
  const { updateSection, products } = useApp();

  const [title, setTitle] = useState(section?.title || 'Образы Wild Rose');
  const [subtitle, setSubtitle] = useState(section?.subtitle || 'Интерактивный Лукбук');
  const [imageUrl, setImageUrl] = useState(
    section?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85'
  );
  const [hotspots, setHotspots] = useState(section?.hotspots || []);
  const [selectedHotspotId, setSelectedHotspotId] = useState(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState(null);

  const imageBoxRef = useRef(null);

  // Click on image canvas to add or move a hotspot
  const handleCanvasClick = (e) => {
    if (!imageBoxRef.current) return;
    const rect = imageBoxRef.current.getBoundingClientRect();
    
    // Calculate click position as percentage of image width/height
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const topStr = `${Math.round(y)}%`;
    const leftStr = `${Math.round(x)}%`;

    // If a hotspot is currently selected, move it to the clicked position
    if (selectedHotspotId) {
      setHotspots(prev =>
        prev.map(h => (h.id === selectedHotspotId ? { ...h, top: topStr, left: leftStr } : h))
      );
    } else {
      // Add a new hotspot
      const newId = `h_${Date.now().toString().slice(-4)}`;
      const defaultProduct = products[0] || null;
      const newHotspot = {
        id: newId,
        top: topStr,
        left: leftStr,
        productId: defaultProduct ? defaultProduct.id : '',
        label: defaultProduct ? defaultProduct.title : 'Новая точка'
      };

      setHotspots(prev => [...prev, newHotspot]);
      setSelectedHotspotId(newId);
    }
  };

  const handleUpdateHotspot = (id, updates) => {
    setHotspots(prev =>
      prev.map(h => {
        if (h.id === id) {
          const updated = { ...h, ...updates };
          // If productId changed, auto-update default label if possible
          if (updates.productId) {
            const p = products.find(prod => prod.id === updates.productId);
            if (p && (!h.label || h.label === 'Новая точка')) {
              updated.label = p.title;
            }
          }
          return updated;
        }
        return h;
      })
    );
  };

  const handleDeleteHotspot = (id, e) => {
    e.stopPropagation();
    setHotspots(prev => prev.filter(h => h.id !== id));
    if (selectedHotspotId === id) {
      setSelectedHotspotId(null);
    }
  };

  const handleSave = () => {
    updateSection(section.id, {
      title,
      subtitle,
      imageUrl,
      hotspots
    });
    onClose();
  };

  return (
    <div className="lookbook-editor-overlay" onClick={onClose}>
      <div className="lookbook-editor-modal" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="lookbook-editor-header">
          <div>
            <h3>Редактор Образа и Точек Лукбука</h3>
            <p>Кликайте по изображению для расстановки интерактивных меток и привязки товаров</p>
          </div>
          <button className="control-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="lookbook-editor-body">
          
          {/* Left Canvas */}
          <div className="lookbook-canvas-column">
            <div className="canvas-hint-banner">
              <Crosshair size={16} />
              <span>
                {selectedHotspotId 
                  ? 'Выбранная точка активна: кликните на фото, чтобы переместить её' 
                  : 'Кликните на фото в месте украшения, чтобы добавить новую точку'}
              </span>
            </div>

            <div
              className="interactive-image-box"
              ref={imageBoxRef}
              onClick={handleCanvasClick}
            >
              <img
                src={imageUrl}
                alt="Lookbook model"
                className="interactive-canvas-img"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85";
                }}
              />

              {/* Placed Hotspots & Live Preview Popovers */}
              {hotspots.map((spot, idx) => {
                const isSelected = selectedHotspotId === spot.id;
                const isHovered = hoveredHotspotId === spot.id;
                const product = products.find(p => p.id === spot.productId);
                const showPreview = isHovered || isSelected;

                return (
                  <div
                    key={spot.id}
                    className="editor-pin-anchor"
                    style={{ position: 'absolute', top: spot.top, left: spot.left, zIndex: isSelected ? 30 : isHovered ? 25 : 10 }}
                  >
                    <button
                      type="button"
                      className={`editor-hotspot-pin ${isSelected ? 'selected' : ''}`}
                      onMouseEnter={() => setHoveredHotspotId(spot.id)}
                      onMouseLeave={() => setHoveredHotspotId(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHotspotId(isSelected ? null : spot.id);
                      }}
                      title={spot.label}
                    >
                      {idx + 1}
                    </button>

                    {/* Real-time Popover Preview */}
                    {showPreview && product && (
                      <div className="editor-popover-preview" onClick={e => e.stopPropagation()}>
                        <div className="popover-preview-badge">Превью карточки</div>
                        <div className="popover-preview-content">
                          <img src={product.mainImage} alt={product.title} className="popover-preview-img" />
                          <div className="popover-preview-info">
                            <span className="popover-preview-capsule">{product.capsule || 'Wild Rose'}</span>
                            <h5 className="popover-preview-title">{product.title}</h5>
                            <div className="popover-preview-price">{product.price.toLocaleString('ru-RU')} ₽</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar: Settings & List */}
          <div className="lookbook-sidebar-column">
            
            {/* General Info */}
            <div className="editor-section-card">
              <h4>Основные настройки</h4>
              
              <div className="admin-form-group">
                <label className="admin-form-label">Заголовок секции</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Подзаголовок</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                />
              </div>

              <div className="admin-form-group" style={{ marginTop: '6px' }}>
                <ImageUploader
                  value={imageUrl}
                  onChange={(newUrl) => setImageUrl(newUrl)}
                  targetType="lookbook"
                  label="Фото модели для Лукбука"
                  required
                />
              </div>
            </div>

            {/* Hotspots List */}
            <div className="editor-section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>Точки на фото ({hotspots.length})</h4>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    const defaultProduct = products[0] || null;
                    const newSpot = {
                      id: `h_${Date.now().toString().slice(-4)}`,
                      top: '50%',
                      left: '50%',
                      productId: defaultProduct ? defaultProduct.id : '',
                      label: defaultProduct ? defaultProduct.title : 'Новая точка'
                    };
                    setHotspots(prev => [...prev, newSpot]);
                    setSelectedHotspotId(newSpot.id);
                  }}
                >
                  <Plus size={14} /> Добавить
                </button>
              </div>

              {hotspots.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  На фото пока нет точек. Кликните по фото слева, чтобы поставить метку на серьги, колье или кольцо.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {hotspots.map((spot, index) => {
                    const isSelected = selectedHotspotId === spot.id;
                    const linkedProduct = products.find(p => p.id === spot.productId);

                    return (
                      <div
                        key={spot.id}
                        className={`hotspot-editor-item ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedHotspotId(spot.id)}
                      >
                        <div className="hotspot-item-header">
                          <div className="hotspot-badge">
                            <span className="hotspot-num-circle">{index + 1}</span>
                            <span>{spot.label || 'Метка'}</span>
                            <span className="hotspot-coords">({spot.top}, {spot.left})</span>
                          </div>
                          <button
                            className="btn-icon-danger"
                            onClick={(e) => handleDeleteHotspot(spot.id, e)}
                            title="Удалить точку"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="hotspot-item-body">
                          <div className="full-width">
                            <label className="admin-form-label" style={{ fontSize: '0.75rem' }}>Привязанный товар из каталога</label>
                            <select
                              className="admin-form-select"
                              value={spot.productId}
                              onChange={e => handleUpdateHotspot(spot.id, { productId: e.target.value })}
                            >
                              <option value="">-- Выберите товар --</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.title} ({p.price.toLocaleString('ru-RU')} ₽)
                                </option>
                              ))}
                            </select>
                          </div>

                          {linkedProduct && (
                            <div className="full-width product-select-preview">
                              <img src={linkedProduct.mainImage} alt={linkedProduct.title} />
                              <div>
                                <strong style={{ fontSize: '0.8rem', display: 'block' }}>{linkedProduct.title}</strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-rose-deep)', fontWeight: '600' }}>
                                  {linkedProduct.price.toLocaleString('ru-RU')} ₽
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="full-width">
                            <label className="admin-form-label" style={{ fontSize: '0.75rem' }}>Подпись метки (Label)</label>
                            <input
                              type="text"
                              className="admin-form-input"
                              value={spot.label}
                              onChange={e => handleUpdateHotspot(spot.id, { label: e.target.value })}
                              placeholder="Например: Серьги с гранатом"
                            />
                          </div>

                          <div>
                            <label className="admin-form-label" style={{ fontSize: '0.75rem' }}>Сверху (Top)</label>
                            <input
                              type="text"
                              className="admin-form-input"
                              value={spot.top}
                              onChange={e => handleUpdateHotspot(spot.id, { top: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="admin-form-label" style={{ fontSize: '0.75rem' }}>Слева (Left)</label>
                            <input
                              type="text"
                              className="admin-form-input"
                              value={spot.left}
                              onChange={e => handleUpdateHotspot(spot.id, { left: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="lookbook-editor-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Check size={16} /> Сохранить изменения
          </button>
        </div>

      </div>
    </div>
  );
};
