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
  const { currentView, setCurrentView, sections } = useApp();
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Synchronize URL path or hash for standalone admin page (/admin or #/admin)
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#/admin' || hash === '#admin') {
        const isAuth = localStorage.getItem('wrj_admin_auth') === 'true' || sessionStorage.getItem('wrj_admin_auth') === 'true';
        if (isAuth) {
          setIsAdminLoginOpen(false);
          setCurrentView('admin');
        } else {
          setIsAdminLoginOpen(true);
        }
      } else if (currentView === 'admin') {
        // If user navigated back away from admin
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
