import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X } from 'lucide-react';
import { handleImageError } from '../utils/imageOptimizer';
import './Lookbook.css';

export const Lookbook = ({
  title = "Образы Wild Rose",
  subtitle = "Интерактивный Лукбук",
  imageUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
  hotspots = []
}) => {
  const { products, setQuickViewProduct, addToCart } = useApp();
  const [activeHotspot, setActiveHotspot] = useState(null);
  const containerRef = useRef(null);

  // Close hotspot when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveHotspot(null);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, []);

  const handleContainerClick = (e) => {
    // If click is on a pin, popover card, or mobile sheet, let internal handlers manage it
    if (
      e.target.closest('.hotspot-pin') || 
      e.target.closest('.hotspot-popover') || 
      e.target.closest('.lookbook-mobile-sheet')
    ) {
      return;
    }
    // Clicking anywhere on the photo or background immediately closes the active card
    setActiveHotspot(null);
  };

  const activeSpotData = hotspots.find(s => s.id === activeHotspot);
  const activeProduct = activeSpotData ? products.find(p => p.id === activeSpotData.productId) : null;

  return (
    <section id="lookbook" className="section lookbook-section" onClick={() => setActiveHotspot(null)}>
      <div className="container">
        
        <div className="section-header">
          <span className="section-subtitle">{subtitle}</span>
          <h2 className="section-title">{title}</h2>
        </div>

        <div className="lookbook-wrapper">
          <div 
            className="lookbook-image-container" 
            ref={containerRef} 
            onClick={handleContainerClick}
          >
            <img 
              src={imageUrl} 
              alt="Lookbook" 
              className="lookbook-hero-img"
              onError={handleImageError}
            />

            {/* Interactive Hotspots */}
            {hotspots.map((spot) => {
              const product = products.find(p => p.id === spot.productId);
              const isActive = activeHotspot === spot.id;
              
              // Edge detection for positioning
              const leftPercent = parseFloat(spot.left) || 50;
              const topPercent = parseFloat(spot.top) || 50;

              const alignH = leftPercent < 28 ? 'align-left' : leftPercent > 72 ? 'align-right' : 'align-center';
              const alignV = topPercent < 35 ? 'align-below' : 'align-above';

              return (
                <div
                  key={spot.id}
                  className={`hotspot-pin-wrapper ${alignH} ${alignV}`}
                  style={{ top: spot.top, left: spot.left }}
                >
                  <button
                    className={`hotspot-pin ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHotspot(isActive ? null : spot.id);
                    }}
                    title={spot.label || (product ? product.title : 'Точка образа')}
                    aria-label={spot.label || 'Точка образа'}
                  >
                    <span className="pin-pulse"></span>
                    <Plus size={14} />
                  </button>

                  {/* Desktop Popover Card */}
                  {isActive && product && (
                    <div className="hotspot-popover desktop-popover" onClick={e => e.stopPropagation()}>
                      <button 
                        className="popover-close-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHotspot(null);
                        }}
                        title="Закрыть"
                        aria-label="Закрыть"
                      >
                        <X size={13} />
                      </button>

                      <img 
                        src={product.mainImage} 
                        alt={product.title} 
                        className="popover-thumb" 
                        onError={handleImageError}
                      />
                      <div className="popover-details">
                        <span className="popover-capsule">{product.capsule || 'Wild Rose'}</span>
                        <h4 className="popover-title" title={product.title}>{product.title}</h4>
                        <div className="popover-price">{product.price.toLocaleString('ru-RU')} ₽</div>
                        
                        <div className="popover-actions">
                          <button
                            className="popover-btn-view"
                            onClick={() => {
                              setQuickViewProduct(product);
                              setActiveHotspot(null);
                            }}
                          >
                            Подробнее
                          </button>
                          <button
                            className="popover-btn-buy"
                            onClick={() => {
                              addToCart(product);
                              setActiveHotspot(null);
                            }}
                          >
                            В корзину
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mobile Bottom Bar (Overlays bottom of lookbook image flawlessly on phones/tablets) */}
            {activeProduct && (
              <div className="lookbook-mobile-sheet" onClick={e => e.stopPropagation()}>
                <img 
                  src={activeProduct.mainImage} 
                  alt={activeProduct.title} 
                  className="mobile-sheet-thumb" 
                  onError={handleImageError}
                />
                <div className="mobile-sheet-info">
                  <span className="mobile-sheet-capsule">{activeProduct.capsule || 'Wild Rose'}</span>
                  <h4 className="mobile-sheet-title">{activeProduct.title}</h4>
                  <div className="mobile-sheet-price">{activeProduct.price.toLocaleString('ru-RU')} ₽</div>
                </div>
                <div className="mobile-sheet-actions">
                  <button
                    className="mobile-sheet-btn-view"
                    onClick={() => {
                      setQuickViewProduct(activeProduct);
                      setActiveHotspot(null);
                    }}
                  >
                    Инфо
                  </button>
                  <button
                    className="mobile-sheet-btn-buy"
                    onClick={() => {
                      addToCart(activeProduct);
                      setActiveHotspot(null);
                    }}
                  >
                    В корзину
                  </button>
                </div>
                <button 
                  className="mobile-sheet-close" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspot(null);
                  }}
                  title="Закрыть"
                  aria-label="Закрыть"
                >
                  <X size={16} />
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};

