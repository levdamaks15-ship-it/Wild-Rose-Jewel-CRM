import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroSection, CapsulesSection, CraftsmanshipSection, JournalSection, Footer } from './components/StoreFrontSections';
import { Catalog } from './components/Catalog';
import { Lookbook } from './components/Lookbook';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const { currentView, sections } = useApp();

  // If in Admin Mode, render full CMS interface
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

      <Footer />

      {/* Global Modals & Drawers */}
      <QuickViewModal />
      <CartDrawer />
    </div>
  );
}

export default App;
