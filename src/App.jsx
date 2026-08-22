import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroSection, CapsulesSection, CraftsmanshipSection, JournalSection, Footer } from './components/StoreFrontSections';
import { Catalog } from './components/Catalog';
import { Lookbook } from './components/Lookbook';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';

function App() {
  const { currentView, setCurrentView, sections, isLoading } = useApp();
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Synchronize URL path or hash for standalone admin page (/admin or #/admin, #/admin/...)
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const isAdminRoute = path.startsWith('/admin') || hash.startsWith('#/admin') || hash.startsWith('#admin');
      
      if (isAdminRoute) {
        const isAuth = localStorage.getItem('wrj_admin_auth') === 'true' || sessionStorage.getItem('wrj_admin_auth') === 'true';
        if (isAuth) {
          setIsAdminLoginOpen(false);
          setCurrentView('admin');
        } else {
          setIsAdminLoginOpen(true);
        }
      } else if (currentView === 'admin') {
        // If user navigated back away from admin completely
        setCurrentView('store');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [setCurrentView, currentView]);

  // When password 0000 is entered on the website
  const handleAdminAuthSuccess = () => {
    // If we were directly on the admin URL tab, just switch view
    const isDirectAdminUrl = window.location.hash === '#/admin' || window.location.hash === '#admin' || window.location.pathname === '/admin';
    
    localStorage.setItem('wrj_admin_auth', 'true');
    sessionStorage.setItem('wrj_admin_auth', 'true');
    setIsAdminLoginOpen(false);

    if (isDirectAdminUrl) {
      setCurrentView('admin');
    } else {
      // Open new tab with the admin page, keep current site view untouched
      const adminUrl = `${window.location.origin}${window.location.pathname}#/admin`;
      window.open(adminUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Clicking "CMS Админка" in the footer opens the PIN code modal on the current website
  const handleOpenAdminLogin = () => {
    setIsAdminLoginOpen(true);
  };

  // If in Admin Mode, render full CMS standalone interface
  if (currentView === 'admin') {
    return <AdminPanel />;
  }

  // If initial load on a completely fresh browser without cached data, show elegant branded loading screen
  const hasCachedSections = Boolean(localStorage.getItem('wrj_cached_sections'));
  if (isLoading && !hasCachedSections) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#FAF8F5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6B1D2F',
        fontFamily: "'Cormorant Garamond', serif"
      }}>
        <span style={{ fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.7 }}>
          ATELIER
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: '400', letterSpacing: '2px', margin: 0 }}>
          Wild Rose Jewel
        </h1>
        <div style={{
          marginTop: '24px',
          width: '28px',
          height: '28px',
          border: '2px solid rgba(107, 29, 47, 0.15)',
          borderTopColor: '#6B1D2F',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  // Dynamic Section Renderer based on CMS block order and toggle state
  const renderSection = (section) => {
    if (!section.enabled) return null;

    switch (section.type) {
      case 'hero':
        return <HeroSection key={section.id} section={section} />;
      case 'capsules':
        return <CapsulesSection key={section.id} section={section} />;
      case 'lookbook':
        return (
          <Lookbook
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            imageUrl={section.imageUrl}
            hotspots={section.hotspots}
          />
        );
      case 'bestsellers':
        return (
          <Catalog
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
          />
        );
      case 'craftsmanship':
        return <CraftsmanshipSection key={section.id} section={section} />;
      case 'journal':
        return <JournalSection key={section.id} section={section} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-root">
      <Header />
      
      {/* Render Dynamic Sections Ordered in Admin */}
      <main>
        {sections.map(section => renderSection(section))}
      </main>

      <Footer onOpenAdminLogin={handleOpenAdminLogin} />

      {/* Global Modals & Drawers */}
      <QuickViewModal />
      <CartDrawer />
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />
    </div>
  );
}

export default App;
