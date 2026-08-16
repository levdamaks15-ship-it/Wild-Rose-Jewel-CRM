import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Shield, Menu, X, Sparkles } from 'lucide-react';
import './Header.css';

export const Header = () => {
  const { cart, setIsCartOpen, setCurrentView, currentView, setSelectedCategory } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const cartItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setMobileMenuOpen(false);
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Rotating announcement messages without emojis
  const announcements = [
    'Фирменная подарочная упаковка к каждому заказу',
    'Бережная доставка по Казахстану и странам ЕАЭС комплиментарно',
    'Авторские украшения ручной работы • Серебро 925 и жемчуг',
  ];
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = React.useState(0);
  const [fadeState, setFadeState] = React.useState('visible');

  React.useEffect(() => {
    const timer = setInterval(() => {
      setFadeState('fading');
      setTimeout(() => {
        setCurrentAnnouncementIndex((prev) => (prev + 1) % announcements.length);
        setFadeState('visible');
      }, 500);
    }, 6000);

    return () => clearInterval(timer);
  }, [announcements.length]);

  return (
    <header className="site-header">
      {/* Top Announcement Bar */}
      <div className="header-top-bar">
        <div className="container top-bar-content">
          <div className={`top-bar-announcement ${fadeState}`}>
            {announcements[currentAnnouncementIndex]}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="header-main-nav">
        <div className="container header-grid">
          
          {/* Mobile Menu Toggle */}
          <button className="mobile-toggle-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Left Nav (Desktop) */}
          <nav className="desktop-nav">
            <button onClick={() => handleCategoryClick('all')}>Каталог</button>
            <button onClick={() => handleCategoryClick('necklaces')}>Колье</button>
            <button onClick={() => handleCategoryClick('rings')}>Кольца</button>
            <button onClick={() => handleCategoryClick('earrings')}>Серьги</button>
          </nav>

          {/* Center Brand Logo */}
          <div className="header-brand-logo" onClick={() => setCurrentView('store')}>
            <span className="brand-sub">Atelier</span>
            <h1 className="brand-name">Wild Rose Jewel</h1>
          </div>

          {/* Right Nav / Actions */}
          <div className="header-actions">
            <button
              className="admin-switch-btn"
              onClick={() => setCurrentView(currentView === 'admin' ? 'store' : 'admin')}
              title="Панель администратора"
            >
              CMS Админка
            </button>

            <button className="cart-trigger-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={20} />
              {cartItemsCount > 0 && <span className="cart-badge-count">{cartItemsCount}</span>}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Off-Canvas */}
      <div className={`mobile-drawer-backdrop ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <span className="brand-sub">Atelier</span>
            <span className="brand-name-sm">Wild Rose Jewel</span>
          </div>
          <button className="mobile-drawer-close" onClick={() => setMobileMenuOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <div className="mobile-drawer-links">
          <button onClick={() => handleCategoryClick('all')}>Весь каталог</button>
          <button onClick={() => handleCategoryClick('necklaces')}>Колье и цепи</button>
          <button onClick={() => handleCategoryClick('rings')}>Кольца</button>
          <button onClick={() => handleCategoryClick('earrings')}>Серьги</button>
          <button onClick={() => handleCategoryClick('bracelets')}>Браслеты</button>
          <button onClick={() => handleCategoryClick('sets')}>Комплекты</button>
        </div>

        <div className="mobile-drawer-footer">
          <div className="mobile-nav-divider"></div>
          <button 
            className="mobile-drawer-cms-btn" 
            onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }}
          >
            Панель управления (CMS)
          </button>
        </div>
      </div>
    </header>
  );
};
