import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShoppingBag, ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';
import './QuickViewModal.css';

export const QuickViewModal = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useApp();
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');

  // Reset index when product changes
  React.useEffect(() => {
    setSelectedImgIndex(0);
    setSelectedSize('');
  }, [quickViewProduct?.id]);

  if (!quickViewProduct) return null;

  // Deduplicate images and filter empty
  const rawImages = [
    quickViewProduct.mainImage,
    quickViewProduct.hoverImage,
    ...(Array.isArray(quickViewProduct.detailImages) ? quickViewProduct.detailImages : [])
  ].filter(Boolean);

  const images = Array.from(new Set(rawImages));

  const activeImg = images[selectedImgIndex] || quickViewProduct.mainImage;
  const currentSize = selectedSize || (quickViewProduct.sizes && quickViewProduct.sizes[0]) || 'Standard';

  const handleAddToCart = () => {
    addToCart(quickViewProduct, currentSize);
    setQuickViewProduct(null);
  };

  return (
    <div className="quickview-backdrop" onClick={() => setQuickViewProduct(null)}>
      <div className="quickview-modal" onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className="quickview-close" onClick={() => setQuickViewProduct(null)}>
          <X size={22} />
        </button>

        <div className="quickview-content">
          
          {/* Gallery Side */}
          <div className="quickview-gallery">
            <div className="quickview-main-image-wrap">
              <img
                src={activeImg}
                alt={quickViewProduct.title}
                className="quickview-main-image"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80';
                }}
              />
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="quickview-thumbs">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumb-btn ${selectedImgIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImgIndex(idx)}
                    title={`Ракурс ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Ракурс ${idx + 1}`}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=70';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Side */}
          <div className="quickview-info">
            <span className="qv-capsule">{quickViewProduct.capsule || 'Wild Rose Edition'}</span>
            <h2 className="qv-title">{quickViewProduct.title}</h2>
            
            <div className="qv-price-row">
              <span className="qv-price">{quickViewProduct.price.toLocaleString('ru-RU')} ₽</span>
              {quickViewProduct.oldPrice && (
                <span className="qv-old-price">{quickViewProduct.oldPrice.toLocaleString('ru-RU')} ₽</span>
              )}
              <span className={`qv-status-badge ${quickViewProduct.status}`}>
                {quickViewProduct.status === 'in_stock' && 'В наличии (отправка 24ч)'}
                {quickViewProduct.status === 'preorder' && 'Под заказ (3-5 дней)'}
                {quickViewProduct.status === 'limited' && 'Ограниченный тираж'}
              </span>
            </div>

            <p className="qv-story">{quickViewProduct.story}</p>

            {/* Jewelry Specs Table */}
            <div className="qv-specs-table">
              <div className="spec-row">
                <span className="spec-label">Материал:</span>
                <span className="spec-value">{quickViewProduct.metal}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Вставки / Камни:</span>
                <span className="spec-value">{quickViewProduct.stones}</span>
              </div>
              {quickViewProduct.weight && (
                <div className="spec-row">
                  <span className="spec-label">Вес:</span>
                  <span className="spec-value">{quickViewProduct.weight}</span>
                </div>
              )}
              {quickViewProduct.lockType && (
                <div className="spec-row">
                  <span className="spec-label">Замок / Закрепка:</span>
                  <span className="spec-value">{quickViewProduct.lockType}</span>
                </div>
              )}
            </div>

            {/* Size Selector */}
            {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
              <div className="qv-size-picker">
                <div className="size-label-row">
                  <span className="picker-title">Размер:</span>
                  <span className="picker-selected">{currentSize}</span>
                </div>
                <div className="size-buttons">
                  {quickViewProduct.sizes.map(size => (
                    <button
                      key={size}
                      className={`size-btn ${currentSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Actions */}
            <div className="qv-actions">
              <button className="btn btn-primary qv-add-btn" onClick={handleAddToCart}>
                <ShoppingBag size={18} />
                Добавить в корзину
              </button>
            </div>

            {/* Guarantees */}
            <div className="qv-trust-badges">
              <div className="trust-item">
                <ShieldCheck size={16} />
                <span>Фирменная гарантия & проба</span>
              </div>
              <div className="trust-item">
                <Truck size={16} />
                <span>Премиум упаковка & доставка</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
