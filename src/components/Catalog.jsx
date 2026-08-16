import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, SlidersHorizontal, Eye, Heart, Check, X, ChevronRight, Sparkles, ArrowUp } from 'lucide-react';
import './Catalog.css';

export const Catalog = ({ title = "Каталог Изделий", subtitle = "Коллекции и Авторские Работы" }) => {
  const { products, addToCart, setQuickViewProduct, selectedCategory, setSelectedCategory, gridMode, setGridMode } = useApp();

  const [filterMetal, setFilterMetal] = useState('all');
  const [filterStones, setFilterStones] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [showMobileDock, setShowMobileDock] = useState(false);

  const catalogRef = useRef(null);
  const dockRef = useRef(null);

  const categories = [
    { id: 'all', label: 'Все изделия' },
    { id: 'necklaces', label: 'Колье & Цепи' },
    { id: 'rings', label: 'Кольца' },
    { id: 'earrings', label: 'Серьги' },
    { id: 'bracelets', label: 'Браслеты' },
    { id: 'sets', label: 'Комплекты' }
  ];

  // Mobile Bottom Dock Scroll Visibility & Behavior
  useEffect(() => {
    const handleScroll = () => {
      if (!catalogRef.current) return;
      const rect = catalogRef.current.getBoundingClientRect();
      // Show dock when user has scrolled into the catalog area
      const inCatalogView = rect.top < window.innerHeight * 0.4 && rect.bottom > 220;
      setShowMobileDock(inCatalogView);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Center active category inside the floating dock
  useEffect(() => {
    if (dockRef.current) {
      const activeBtn = dockRef.current.querySelector('.mobile-dock-pill.active');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedCategory]);

  const scrollToCatalogTop = () => {
    if (catalogRef.current) {
      const topOffset = 70;
      const elementPosition = catalogRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleMobileCategorySelect = (catId) => {
    setSelectedCategory(catId);
    scrollToCatalogTop();
  };

  // Filtering Logic
  const filteredProducts = products.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (filterMetal !== 'all' && !item.metal.toLowerCase().includes(filterMetal.toLowerCase())) return false;
    if (filterStones !== 'all') {
      if (filterStones === 'pearl' && !item.stones.toLowerCase().includes('жемчуг')) return false;
      if (filterStones === 'color' && !item.stones.toLowerCase().includes('гранат') && !item.stones.toLowerCase().includes('турмалин')) return false;
      if (filterStones === 'none' && !item.stones.toLowerCase().includes('без вставок')) return false;
    }
    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'new') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return 0; // featured default
  });

  return (
    <section id="catalog" ref={catalogRef} className="section catalog-section">
      <div className="container">
        
        {/* Header */}
        <div className="section-header">
          <span className="section-subtitle">{subtitle}</span>
          <h2 className="section-title">{title}</h2>
        </div>

        {/* Category Pills */}
        <div className="category-nav">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filters & View Controls Bar */}
        <div className="catalog-controls">
          <div className="filter-group">
            <div className="select-wrapper">
              <select value={filterMetal} onChange={(e) => setFilterMetal(e.target.value)}>
                <option value="all">Металл: Все</option>
                <option value="серебро">Серебро 925</option>
                <option value="золот">Золото / Позолота</option>
                <option value="родий">Родий</option>
              </select>
            </div>

            <div className="select-wrapper">
              <select value={filterStones} onChange={(e) => setFilterStones(e.target.value)}>
                <option value="all">Вставки: Все</option>
                <option value="pearl">Жемчуг</option>
                <option value="color">Цветные камни</option>
                <option value="none">Без вставок</option>
              </select>
            </div>
          </div>

          <div className="view-group">
            <div className="select-wrapper sort-wrapper">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Сначала рекомендуемые</option>
                <option value="new">Сначала новинки</option>
                <option value="price-asc">По возрастанию цены</option>
                <option value="price-desc">По убыванию цены</option>
              </select>
            </div>

            {/* Grid Switcher */}
            <div className="grid-toggle">
              <button
                className={`grid-btn ${gridMode === 'compact' ? 'active' : ''}`}
                onClick={() => setGridMode('compact')}
                title="Сетка 4 в ряд"
              >
                <span></span><span></span><span></span><span></span>
              </button>
              <button
                className={`grid-btn ${gridMode === 'editorial' ? 'active' : ''}`}
                onClick={() => setGridMode('editorial')}
                title="Лукбук 2 в ряд"
              >
                <span className="wide"></span><span className="wide"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="no-products">
            <p>В этой категории украшения временно отсутствуют.</p>
            <button className="btn btn-secondary" onClick={() => { setSelectedCategory('all'); setFilterMetal('all'); setFilterStones('all'); }}>
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className={`products-grid ${gridMode === 'editorial' ? 'grid-editorial' : 'grid-compact'}`}>
            {sortedProducts.map(product => {
              const isHovered = hoveredProduct === product.id;
              const displayImg = isHovered && product.hoverImage ? product.hoverImage : product.mainImage;

              return (
                <div
                  key={product.id}
                  className="product-card"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Visual Box with Image Flip & Badges */}
                  <div className="product-media" onClick={() => setQuickViewProduct(product)}>
                    <img
                      src={displayImg}
                      alt={product.title}
                      className="product-image"
                      loading="lazy"
                    />

                    {/* Badges */}
                    <div className="product-badges">
                      {product.isNew && <span className="badge badge-new">New</span>}
                      {product.status === 'limited' && <span className="badge badge-gold">Limited</span>}
                      {product.status === 'preorder' && <span className="badge badge-outline">Предзаказ</span>}
                    </div>

                    {/* Quick View Button */}
                    <button
                      className="quick-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(product);
                      }}
                      title="Быстрый просмотр"
                    >
                      <Eye size={16} />
                      <span>Подробнее</span>
                    </button>
                  </div>

                  {/* Info Box */}
                  <div className="product-info">
                    <span className="product-capsule">{product.capsule || product.metal}</span>
                    <h3 className="product-title" onClick={() => setQuickViewProduct(product)}>
                      {product.title}
                    </h3>
                    <p className="product-stones">{product.stones}</p>

                    <div className="product-bottom-row">
                      <div className="product-price-box">
                        <span className="current-price">{product.price.toLocaleString('ru-RU')} ₽</span>
                        {product.oldPrice && (
                          <span className="old-price">{product.oldPrice.toLocaleString('ru-RU')} ₽</span>
                        )}
                      </div>

                      <button
                        className="add-to-cart-btn"
                        onClick={() => addToCart(product)}
                        title="Добавить в корзину"
                      >
                        <ShoppingBag size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Mobile Category Dock (Option 2) */}
        <div className={`mobile-catalog-dock-wrapper ${showMobileDock ? 'visible' : ''}`}>
          <div className="mobile-catalog-dock" ref={dockRef}>
            <div className="mobile-dock-scroll">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`mobile-dock-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleMobileCategorySelect(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <button 
              className="mobile-dock-top-btn" 
              onClick={scrollToCatalogTop}
              title="Наверх каталога"
              aria-label="Наверх каталога"
            >
              <ArrowUp size={15} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
