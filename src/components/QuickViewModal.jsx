import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShoppingBag, ShieldCheck, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import './QuickViewModal.css';

export const QuickViewModal = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useApp();
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  
  // Touch coordinates for swipe detection
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const isPoppingRef = useRef(false);

  // Sync with browser history so edge swipe-back closes the photo modal instead of closing the tab/page
  useEffect(() => {
    if (!quickViewProduct) return;

    // Push virtual modal state to browser history
    window.history.pushState({ wrj_modal: 'quickview' }, '');

    const handlePopState = () => {
      isPoppingRef.current = true;
      setQuickViewProduct(null);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);

      // Clean up history entry if closed from UI (not via back button)
      if (!isPoppingRef.current && window.history.state?.wrj_modal === 'quickview') {
        window.history.back();
      }
      isPoppingRef.current = false;
    };
  }, [quickViewProduct?.id]);

  // Reset index when product changes
  useEffect(() => {
    setSelectedImgIndex(0);
    setSelectedSize('');
  }, [quickViewProduct?.id]);

  if (!quickViewProduct) return null;

  const closeModal = () => {
    setQuickViewProduct(null);
  };

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
    closeModal();
  };

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    setSelectedImgIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    setSelectedImgIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Touch Swipe Handlers for Image Gallery (Left/Right to switch photos, Down to close modal)
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diffX = touchEndX.current - touchStartX.current;
    const diffY = touchEndY.current - touchStartY.current;
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    // Horizontal Swipe (Switch photo) - priority if horizontal movement is greater
    if (absX > 45 && absX > absY) {
      if (diffX < 0) {
        // Swiped Left -> Next Image
        if (images.length > 1) handleNextImage();
      } else {
        // Swiped Right -> Prev Image
        if (images.length > 1) handlePrevImage();
      }
    } 
    // Vertical Swipe Down (Pull down to dismiss modal)
    else if (diffY > 80 && absY > absX * 1.4) {
      closeModal();
    }
  };

  return (
    <div className="quickview-backdrop" onClick={closeModal}>
      <div className="quickview-modal" onClick={e => e.stopPropagation()}>
        
        {/* Mobile Pull Handle */}
        <div className="quickview-drag-pill" title="Потяните вниз, чтобы закрыть" />

        {/* Close Button */}
        <button className="quickview-close" onClick={closeModal} aria-label="Закрыть">
          <X size={22} />
        </button>

        <div className="quickview-content">
          
          {/* Gallery Side */}
          <div 
            className="quickview-gallery"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="quickview-main-image-wrap">
              <img
                src={activeImg}
                alt={quickViewProduct.title}
                className="quickview-main-image"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80';
                }}
              />

              {/* Gallery Arrow Controls */}
              {images.length > 1 && (
                <>
                  <button 
                    className="qv-gallery-arrow prev" 
                    onClick={handlePrevImage} 
                    aria-label="Предыдущее фото"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    className="qv-gallery-arrow next" 
                    onClick={handleNextImage} 
                    aria-label="Следующее фото"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Photo Counter Pill on Image */}
                  <div className="qv-image-counter">
                    {selectedImgIndex + 1} / {images.length}
                  </div>
                </>
              )}
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
