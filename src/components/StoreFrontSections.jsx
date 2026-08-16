import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, Gem, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';
import './StoreFrontSections.css';

// Variant 1: Premium Split Editorial Hero Component
export const HeroSection = ({ section }) => {
  const { setSelectedCategory, setQuickViewProduct, products } = useApp();

  const handleExplore = () => {
    setSelectedCategory('all');
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Featured Hero Highlight Product (e.g. iconic necklace or ring)
  const featuredProduct = products.find(p => p.id === 'wr-001') || products[0];

  const metrics = section?.extraData?.metrics || [
    { num: "925°", label: "Проба & Качество" },
    { num: "100%", label: "Ручной Отбор Камней" },
    { num: "24 ч", label: "Бережная Отправка" }
  ];

  return (
    <section className="hero-split-section">
      <div className="container hero-split-container">
        
        {/* Left Column: Typography, Manifesto & CTA */}
        <div className="hero-split-left">
          <div className="hero-top-badge">
            <span className="badge-sparkle">✦</span>
            <span>{section.subtitle || "Новая Коллекция 2026"}</span>
          </div>

          <h1 className="hero-editorial-heading">
            {section.title || (
              <>
                Искусство <br />
                <span className="italic-serif text-accent">Дикой Розы</span> <br />
                в Драгоценном Металле
              </>
            )}
          </h1>

          <p className="hero-split-desc">
            {section.text || "Авторские ювелирные изделия ручной работы из серебра 925 пробы, золота и натурального барочного жемчуга. Украшения, которые говорят о вас без слов."}
          </p>

          <div className="hero-split-actions">
            <button className="btn btn-primary hero-main-btn" onClick={handleExplore}>
              <span>{section.buttonText || "Смотреть Коллекцию"}</span>
              <ArrowRight size={16} />
            </button>
            <a href={section?.extraData?.secondaryButtonLink || "#lookbook"} className="hero-link-btn">
              <span>{section?.extraData?.secondaryButtonText || "Интерактивный Лукбук"}</span>
              <ArrowUpRight size={15} />
            </a>
          </div>

          {/* Social Proof & Metrics */}
          <div className="hero-metrics-row">
            {metrics.map((m, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <div className="metric-divider"></div>}
                <div className="metric-item">
                  <span className="metric-num">{m.num}</span>
                  <span className="metric-lbl">{m.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right Column: Visual Showcase & Floating Feature Card */}
        <div className="hero-split-right">
          <div className="hero-visual-wrapper">
            <img
              src={section.imageUrl || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85"}
              alt="Wild Rose Editorial Look"
              className="hero-main-photo"
            />
            
            {/* Floating Top Tag */}
            <div className="floating-craft-tag">
              <Sparkles size={14} className="tag-icon" />
              <span>{section?.extraData?.floatingTag || "Limited Atelier Edition"}</span>
            </div>

            {/* Floating Product Highlight Card */}
            {featuredProduct && (
              <div
                className="floating-product-card"
                onClick={() => setQuickViewProduct(featuredProduct)}
              >
                <img
                  src={featuredProduct.mainImage}
                  alt={featuredProduct.title}
                  className="floating-card-thumb"
                />
                <div className="floating-card-info">
                  <span className="floating-card-label">Бестселлер коллекции</span>
                  <h4 className="floating-card-title">{featuredProduct.title}</h4>
                  <span className="floating-card-price">
                    {featuredProduct.price.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="floating-card-arrow">
                  <ArrowRight size={14} />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

// Capsule Collections Component
export const CapsulesSection = ({ section }) => {
  const { setSelectedCategory } = useApp();

  const defaultCapsules = [
    {
      title: "Pearl Essence",
      desc: "Натуральный барочный жемчуг в объятиях золота",
      category: "necklaces",
      img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Iconic Solitaire",
      desc: "Винные гранаты и кольца с акцентными кристаллами",
      category: "rings",
      img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Sculptural Gold",
      desc: "Литые браслеты-каффы и массивные звенья",
      category: "bracelets",
      img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
    }
  ];

  const capsules = section?.extraData?.capsules || defaultCapsules;

  const handleClick = (cat) => {
    setSelectedCategory(cat);
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section capsules-section">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">{section.subtitle}</span>
          <h2 className="section-title">{section.title}</h2>
        </div>

        <div className="capsules-grid">
          {capsules.map((cap, idx) => (
            <div key={idx} className="capsule-card" onClick={() => handleClick(cap.category)}>
              <div className="capsule-image-wrap">
                <img src={cap.img} alt={cap.title} className="capsule-img" />
              </div>
              <div className="capsule-content">
                <h3 className="capsule-title">{cap.title}</h3>
                <p className="capsule-desc">{cap.desc}</p>
                <span className="capsule-link">
                  {cap.buttonText || "Смотреть капсулу"} <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Craftsmanship & Brand Story
export const CraftsmanshipSection = ({ section }) => {
  const defaultFeatures = [
    { num: "925 / 585", label: "Благородные сплавы и проба" },
    { num: "100%", label: "Ручной отбор натуральных камней" },
    { num: "Lifetime", label: "Безупречная полировка и сервис" }
  ];

  const features = section?.extraData?.features || defaultFeatures;

  return (
    <section className="section craft-section">
      <div className="container-narrow">
        <div className="craft-card">
          <div className="craft-badge">
            <Gem size={20} />
          </div>
          {section.subtitle && <span className="section-subtitle">{section.subtitle}</span>}
          <h2 className="section-title">{section.title || "Магия Ручной Работы"}</h2>
          {section.text && <p className="craft-text">{section.text}</p>}
          
          <div className="craft-features-row">
            {features.map((feat, idx) => (
              <div key={idx} className="craft-feature">
                <span className="craft-num">{feat.num}</span>
                <span className="craft-feature-title">{feat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Journal / Instagram & UGC Feed Component
export const JournalSection = ({ section }) => {
  const { settings } = useApp();

  const defaultGallery = [
    {
      imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
      author: "@sofia.atelier",
      tag: "#WildRoseJewel"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
      author: "@elena_muse",
      tag: "#PearlEssence"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
      author: "@anna.jewelry",
      tag: "#WildRoseRing"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80",
      author: "@maria_noir",
      tag: "#GarnetTwilight"
    }
  ];

  const gallery = section?.extraData?.gallery || defaultGallery;
  const instagramUrl = section?.extraData?.instagramUrl || settings?.instagramUrl || "https://instagram.com";
  const handle = section?.extraData?.accountHandle || "@wildrosejewel";

  return (
    <section className="section journal-section">
      <div className="container">
        <div className="section-header journal-header">
          <span className="section-subtitle">{section.subtitle || "Как наши изделия живут в ваших образах"}</span>
          <h2 className="section-title">{section.title || "Вдохновение #WildRoseJewel"}</h2>
          {section.text && <p className="section-description" style={{ maxWidth: '600px', margin: '8px auto 0' }}>{section.text}</p>}
        </div>

        <div className="journal-ugc-grid">
          {gallery.map((item, idx) => (
            <a
              key={idx}
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="ugc-card"
            >
              <img src={item.imageUrl} alt={item.tag || "Wild Rose Look"} className="ugc-img" />
              <div className="ugc-overlay">
                <span className="ugc-icon">✦</span>
                <span className="ugc-author">{item.author || handle}</span>
                <span className="ugc-tag">{item.tag || "#WildRoseJewel"}</span>
              </div>
            </a>
          ))}
        </div>

        <div className="journal-cta-wrap">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary journal-follow-btn"
          >
            <span>Подписаться на {handle}</span>
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
};

// Footer Component
export const Footer = () => {
  const { settings, setSelectedCategory } = useApp();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        
        <div className="footer-col brand-col">
          <h3 className="footer-brand-title">Wild Rose Jewel</h3>
          <p className="footer-brand-desc">
            Авторские ювелирные изделия и талисманы, рожденные в союзе эстетики и страсти.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Каталог</h4>
          <ul className="footer-links">
            <li><a href="#catalog" onClick={() => setSelectedCategory('necklaces')}>Колье и ожерелья</a></li>
            <li><a href="#catalog" onClick={() => setSelectedCategory('rings')}>Кольца</a></li>
            <li><a href="#catalog" onClick={() => setSelectedCategory('earrings')}>Серьги</a></li>
            <li><a href="#catalog" onClick={() => setSelectedCategory('bracelets')}>Браслеты</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Консьерж-сервис</h4>
          <ul className="footer-links">
            <li><span>Телефон: {settings.contactPhone}</span></li>
            <li><span>Email: {settings.contactEmail}</span></li>
            <li><a href={settings.telegramUrl} target="_blank" rel="noreferrer">Telegram Консультация</a></li>
            <li><a href={settings.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp Чат</a></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>© {new Date().getFullYear()} Wild Rose Jewel. Все права защищены.</p>
          <p className="footer-meta">Сделано с любовью к ювелирному искусству</p>
        </div>
      </div>
    </footer>
  );
};
