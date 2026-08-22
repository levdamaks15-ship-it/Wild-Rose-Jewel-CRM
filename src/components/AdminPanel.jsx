import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers, Package, ShoppingCart, Settings, ArrowUp, ArrowDown, Eye, EyeOff,
  Plus, Trash2, Edit, Check, Link, Save, RefreshCw, FileSpreadsheet, HardDrive,
  SlidersHorizontal, CheckCircle2, AlertCircle, Key, Cloud, Info, X, ArrowLeft
} from 'lucide-react';
import { LookbookEditor } from './LookbookEditor';
import { ImageUploader } from './ImageUploader';
import { api } from '../api/apiClient';
import { handleImageError } from '../utils/imageOptimizer';
import './AdminPanel.css';

export const AdminPanel = () => {
  const {
    sections,
    moveSection,
    toggleSection,
    updateSection,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    settings,
    setSettings,
    setCurrentView
  } = useApp();

  const [activeTab, setActiveTab] = useState('products'); // 'products', 'sections', 'orders', 'integrations', 'footer'
  const [editingLookbookSection, setEditingLookbookSection] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  
  // Test connection state
  const [testDriveStatus, setTestDriveStatus] = useState({ isTesting: false, message: '', success: null });
  const [showServiceAccountGuide, setShowServiceAccountGuide] = useState(false);
  
  // Footer CMS Form State
  const [footerForm, setFooterForm] = useState({
    footerBrandTitle: '',
    footerBrandDesc: '',
    footerCatalogTitle: 'Каталог',
    footerConciergeTitle: 'Консьерж-сервис',
    contactPhone: '',
    contactEmail: '',
    telegramUrl: '',
    whatsappUrl: '',
    instagramUrl: '',
    footerCopyright: '',
    footerMetaText: '',
    footerAdminBtnText: 'CMS Админка'
  });
  const [footerSaveStatus, setFooterSaveStatus] = useState({ show: false, success: null, message: '' });

  // Sync footer form with loaded settings
  useEffect(() => {
    if (settings) {
      setFooterForm({
        footerBrandTitle: settings.footerBrandTitle ?? settings.brandName ?? 'Wild Rose Jewel',
        footerBrandDesc: settings.footerBrandDesc ?? 'Авторские ювелирные изделия и талисманы, рожденные в союзе эстетики и страсти.',
        footerCatalogTitle: settings.footerCatalogTitle ?? 'Каталог',
        footerConciergeTitle: settings.footerConciergeTitle ?? 'Консьерж-сервис',
        contactPhone: settings.contactPhone ?? '+7 (999) 000-00-00',
        contactEmail: settings.contactEmail ?? 'concierge@wildrosejewel.com',
        telegramUrl: settings.telegramUrl ?? 'https://t.me/wildrosejewel',
        whatsappUrl: settings.whatsappUrl ?? 'https://wa.me/79990000000',
        instagramUrl: settings.instagramUrl ?? '',
        footerCopyright: settings.footerCopyright ?? 'Wild Rose Jewel. Все права защищены.',
        footerMetaText: settings.footerMetaText ?? 'Сделано с любовью к ювелирному искусству',
        footerAdminBtnText: settings.footerAdminBtnText ?? 'CMS Админка'
      });
    }
  }, [settings]);

  const handleSaveFooter = async (e) => {
    if (e) e.preventDefault();
    try {
      const updated = {
        ...settings,
        ...footerForm
      };
      await setSettings(updated);
      setFooterSaveStatus({
        show: true,
        success: true,
        message: 'Настройки подвала успешно сохранены в базе данных!'
      });
      setTimeout(() => {
        setFooterSaveStatus({ show: false, success: null, message: '' });
      }, 4000);
    } catch (err) {
      setFooterSaveStatus({
        show: true,
        success: false,
        message: 'Ошибка сохранения подвала: ' + (err.message || 'Не удалось обновить')
      });
    }
  };
  
  // Product Form State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [prodForm, setProdForm] = useState({
    title: '',
    sku: '',
    category: 'necklaces',
    capsule: '',
    price: '',
    oldPrice: '',
    status: 'in_stock',
    metal: '',
    stones: '',
    sizes: '',
    mainImage: '',
    hoverImage: '',
    detailImages: [],
    story: ''
  });

  // URL Hash & History Synchronizer
  useEffect(() => {
    const syncFromHash = () => {
      const rawHash = window.location.hash || '';
      if (!rawHash.startsWith('#/admin') && !rawHash.startsWith('#admin')) {
        return;
      }

      const cleanHash = rawHash.replace(/^#\/?admin\/?/, '');
      const [pathPart, queryPart] = cleanHash.split('?');
      const segments = pathPart ? pathPart.split('/').filter(Boolean) : [];
      const queryParams = new URLSearchParams(queryPart || '');

      const tab = segments[0] || 'products';
      const action = segments[1] || null;
      const itemId = queryParams.get('id');

      if (['sections', 'products', 'orders', 'integrations', 'footer'].includes(tab)) {
        setActiveTab(tab);
      } else {
        setActiveTab('products');
      }

      // 1. Tab: products
      if (tab === 'products') {
        if (action === 'new') {
          setEditingProduct(null);
          setProdForm({
            title: '',
            sku: '',
            category: 'necklaces',
            capsule: '',
            price: '',
            oldPrice: '',
            status: 'in_stock',
            metal: '',
            stones: '',
            sizes: '',
            mainImage: '',
            hoverImage: '',
            detailImages: [],
            story: ''
          });
          setIsAddingProduct(true);
        } else if (action === 'edit' && itemId) {
          const prod = products.find(p => String(p.id) === String(itemId));
          if (prod) {
            setEditingProduct(prod.id);
            setProdForm({
              title: prod.title,
              sku: prod.sku,
              category: prod.category,
              capsule: prod.capsule,
              price: prod.price,
              oldPrice: prod.oldPrice || '',
              status: prod.status,
              metal: prod.metal,
              stones: prod.stones,
              sizes: (prod.sizes || []).join(', '),
              mainImage: prod.mainImage,
              hoverImage: prod.hoverImage || '',
              detailImages: Array.isArray(prod.detailImages) ? prod.detailImages : [],
              story: prod.story || ''
            });
            setIsAddingProduct(true);
          }
        } else {
          setIsAddingProduct(false);
          setEditingProduct(null);
        }
        setEditingSection(null);
        setEditingLookbookSection(null);
      }

      // 2. Tab: sections
      if (tab === 'sections') {
        setIsAddingProduct(false);
        setEditingProduct(null);

        if (action === 'edit' && itemId) {
          const sec = sections.find(s => String(s.id) === String(itemId));
          if (sec) {
            const cloned = JSON.parse(JSON.stringify(sec));
            if (!cloned.extraData) cloned.extraData = {};
            setEditingSection(cloned);
          }
        } else if (action === 'lookbook' && itemId) {
          const sec = sections.find(s => String(s.id) === String(itemId));
          if (sec) {
            setEditingLookbookSection(sec);
          }
        } else {
          setEditingSection(null);
          setEditingLookbookSection(null);
        }
      }

      // 3. Other tabs
      if (tab === 'orders' || tab === 'integrations' || tab === 'footer') {
        setIsAddingProduct(false);
        setEditingProduct(null);
        setEditingSection(null);
        setEditingLookbookSection(null);
      }
    };

    // If initial hash has no sub-tab, initialize to #/admin/products
    if (!window.location.hash || window.location.hash === '#admin' || window.location.hash === '#/admin') {
      window.history.replaceState(null, '', '#/admin/products');
    }

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);

    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, [products, sections]);

  // Navigation handlers with history preservation
  const switchTab = (tab) => {
    window.location.hash = `#/admin/${tab}`;
  };

  const openAddProduct = () => {
    window.location.hash = '#/admin/products/new';
  };

  const openEditProduct = (prod) => {
    window.location.hash = `#/admin/products/edit?id=${prod.id}`;
  };

  const closeProductModal = () => {
    window.location.hash = '#/admin/products';
  };

  const openEditSection = (sec) => {
    window.location.hash = `#/admin/sections/edit?id=${sec.id}`;
  };

  const closeEditSectionModal = () => {
    window.location.hash = '#/admin/sections';
  };

  const openLookbookEditor = (sec) => {
    window.location.hash = `#/admin/sections/lookbook?id=${sec.id}`;
  };

  const closeLookbookEditor = () => {
    window.location.hash = '#/admin/sections';
  };

  const handleExitToStore = () => {
    window.location.hash = '';
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
    }
    setCurrentView('store');
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const payload = {
      ...prodForm,
      price: Number(prodForm.price),
      oldPrice: prodForm.oldPrice ? Number(prodForm.oldPrice) : null,
      sizes: prodForm.sizes ? prodForm.sizes.split(',').map(s => s.trim()) : ['Standard'],
      detailImages: Array.isArray(prodForm.detailImages) ? prodForm.detailImages.filter(Boolean) : []
    };

    if (editingProduct) {
      updateProduct(editingProduct, payload);
    } else {
      addProduct(payload);
    }

    closeProductModal();
  };

  const handleTestDriveConnection = async () => {
    setTestDriveStatus({ isTesting: true, message: 'Проверка подключения к Google Drive...', success: null });
    try {
      const res = await api.testGoogleDrive({
        googleServiceAccountKey: settings.googleServiceAccountKey,
        googleDriveFolderId: settings.googleDriveFolderId,
        googleDriveWebhookUrl: settings.googleDriveWebhookUrl
      });
      setTestDriveStatus({
        isTesting: false,
        message: res.message || 'Подключение успешно установлено!',
        success: true
      });
    } catch (err) {
      setTestDriveStatus({
        isTesting: false,
        message: err.message || 'Ошибка подключения к Google Drive',
        success: false
      });
    }
  };

  return (
    <div className="admin-wrapper">
      
      {/* Mobile Top Header (Visible on screens <= 900px) */}
      <header className="admin-mobile-header">
        <div className="admin-mobile-header-left">
          {/* If inside sub-modal or sub-view, show prominent Back Arrow */}
          {(isAddingProduct || editingSection || editingLookbookSection) ? (
            <button
              type="button"
              className="admin-mobile-back-btn"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  switchTab(activeTab);
                }
              }}
              title="Назад в раздел"
            >
              <ArrowLeft size={18} />
              <span>Назад</span>
            </button>
          ) : (
            <div className="admin-mobile-brand">
              <span className="brand-badge">CMS</span>
              <h2>Wild Rose CRM</h2>
            </div>
          )}
        </div>

        <button 
          type="button"
          className="admin-mobile-exit-btn" 
          onClick={handleExitToStore}
          title="Вернуться на витрину сайта"
        >
          <span>На сайт</span>
          <ArrowUp size={14} style={{ transform: 'rotate(45deg)' }} />
        </button>
      </header>

      {/* Mobile Horizontal Swipeable Tabs Bar */}
      <nav className="admin-mobile-tabs" aria-label="Разделы CRM">
        <button
          type="button"
          className={`mobile-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => switchTab('products')}
        >
          <Package size={17} />
          <span>Товары ({products.length})</span>
        </button>

        <button
          type="button"
          className={`mobile-tab-btn ${activeTab === 'sections' ? 'active' : ''}`}
          onClick={() => switchTab('sections')}
        >
          <Layers size={17} />
          <span>Блоки витрины</span>
        </button>

        <button
          type="button"
          className={`mobile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => switchTab('orders')}
        >
          <ShoppingCart size={17} />
          <span>Заказы ({orders.length})</span>
        </button>

        <button
          type="button"
          className={`mobile-tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => switchTab('integrations')}
        >
          <FileSpreadsheet size={17} />
          <span>Диск & CRM</span>
        </button>

        <button
          type="button"
          className={`mobile-tab-btn ${activeTab === 'footer' ? 'active' : ''}`}
          onClick={() => switchTab('footer')}
        >
          <Settings size={17} />
          <span>Подвал сайта</span>
        </button>
      </nav>

      {/* Sidebar Navigation (Desktop >= 901px) */}
      <aside className="admin-sidebar desktop-sidebar">
        <div className="admin-brand">
          <span className="brand-badge">CMS</span>
          <h2>Wild Rose Studio</h2>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => switchTab('products')}
          >
            <Package size={18} />
            <span>Каталог Товаров ({products.length})</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'sections' ? 'active' : ''}`}
            onClick={() => switchTab('sections')}
          >
            <Layers size={18} />
            <span>Конструктор Блоков</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => switchTab('orders')}
          >
            <ShoppingCart size={18} />
            <span>Заказы & CRM ({orders.length})</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => switchTab('integrations')}
          >
            <FileSpreadsheet size={18} />
            <span>Google Drive / Sheets</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'footer' ? 'active' : ''}`}
            onClick={() => switchTab('footer')}
          >
            <Settings size={18} />
            <span>Подвал & Контакты</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button 
            className="btn btn-secondary exit-admin-btn" 
            onClick={handleExitToStore}
          >
            Вернуться на сайт
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="admin-content">
        
        {/* TAB 1: SECTIONS / PAGE BUILDER */}
        {activeTab === 'sections' && (
          <div className="admin-tab-pane">
            <div className="pane-header">
              <div>
                <h2>Конструктор Главной Страницы</h2>
                <p>Управляйте видимостью и порядком отображения секций на главной витрине</p>
              </div>
            </div>

            <div className="sections-manager-list">
              {sections.map((section, index) => (
                <div key={section.id} className={`section-manager-card ${!section.enabled ? 'disabled' : ''}`}>
                  
                  <div className="section-card-left">
                    <span className="section-index">#{index + 1}</span>
                    <div className="section-title-wrap">
                      <h4 className="section-name">{section.name}</h4>
                      <span className="section-type-tag">тип: {section.type}</span>
                    </div>
                  </div>

                  <div className="section-card-controls">
                    {/* Primary action buttons */}
                    <div className="control-action-group">
                      {section.type === 'lookbook' && (
                        <button
                          type="button"
                          className="control-action-btn lookbook-btn"
                          onClick={() => openLookbookEditor(section)}
                          title="Настроить фото и интерактивные точки"
                        >
                          <SlidersHorizontal size={15} />
                          <span>Настроить точки</span>
                        </button>
                      )}

                      {/* Edit Section Content & Banner Image */}
                      <button
                        type="button"
                        className="control-action-btn content-btn"
                        onClick={() => openEditSection(section)}
                        title="Редактировать баннер и текст секции"
                      >
                        <Edit size={14} />
                        <span>Контент</span>
                      </button>
                    </div>

                    {/* Ordering & Visibility Controls */}
                    <div className="control-utility-group">
                      <button
                        type="button"
                        className="control-icon-btn"
                        disabled={index === 0}
                        onClick={() => moveSection(index, -1)}
                        title="Переместить выше"
                        aria-label="Переместить выше"
                      >
                        <ArrowUp size={16} />
                      </button>

                      <button
                        type="button"
                        className="control-icon-btn"
                        disabled={index === sections.length - 1}
                        onClick={() => moveSection(index, 1)}
                        title="Переместить ниже"
                        aria-label="Переместить ниже"
                      >
                        <ArrowDown size={16} />
                      </button>

                      <button
                        type="button"
                        className={`control-toggle-btn ${section.enabled ? 'active' : ''}`}
                        onClick={() => toggleSection(section.id)}
                        title={section.enabled ? 'Скрыть секцию' : 'Показать секцию'}
                      >
                        {section.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                        <span>{section.enabled ? 'Активен' : 'Скрыт'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGER */}
        {activeTab === 'products' && (
          <div className="admin-tab-pane">
            <div className="pane-header">
              <div>
                <h2>Управление Каталогом</h2>
                <p>Редактируйте цены, ювелирные характеристики, фото и статусы наличия</p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-add-product-header"
                onClick={openAddProduct}
              >
                <Plus size={16} />
                <span>Добавить изделие</span>
              </button>
            </div>

            {/* Product Modal/Form */}
            {isAddingProduct && (
              <form className="product-edit-modal" onSubmit={handleSaveProduct}>
                <div className="product-modal-header-bar">
                  <div className="product-modal-title-wrap">
                    <h3>{editingProduct ? 'Редактирование изделия' : 'Новое ювелирное изделие'}</h3>
                    <p className="product-modal-sub">Заполните параметры и загрузите фото ракурсов</p>
                  </div>
                  <button 
                    type="button" 
                    className="modal-close-icon-btn"
                    onClick={closeProductModal}
                    title="Закрыть без сохранения"
                    aria-label="Закрыть"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Название изделия *</label>
                    <input
                      type="text"
                      required
                      placeholder="Колье «Жемчужная Нить»"
                      value={prodForm.title}
                      onChange={e => setProdForm({ ...prodForm, title: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Категория *</label>
                    <select
                      value={prodForm.category}
                      onChange={e => setProdForm({ ...prodForm, category: e.target.value })}
                    >
                      <option value="necklaces">Колье & Ожерелья</option>
                      <option value="earrings">Серьги</option>
                      <option value="rings">Кольца</option>
                      <option value="bracelets">Браслеты</option>
                      <option value="brooches">Броши & Сеты</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Артикул (SKU) *</label>
                    <input
                      type="text"
                      required
                      placeholder="WR-009"
                      value={prodForm.sku}
                      onChange={e => setProdForm({ ...prodForm, sku: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Капсула / Коллекция</label>
                    <input
                      type="text"
                      placeholder="Pearl Essence"
                      value={prodForm.capsule}
                      onChange={e => setProdForm({ ...prodForm, capsule: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Цена (₽) *</label>
                    <input
                      type="number"
                      required
                      placeholder="18500"
                      value={prodForm.price}
                      onChange={e => setProdForm({ ...prodForm, price: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Старая цена (₽)</label>
                    <input
                      type="number"
                      placeholder="21000"
                      value={prodForm.oldPrice}
                      onChange={e => setProdForm({ ...prodForm, oldPrice: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Статус наличия</label>
                    <select
                      value={prodForm.status}
                      onChange={e => setProdForm({ ...prodForm, status: e.target.value })}
                    >
                      <option value="in_stock">В наличии (24ч)</option>
                      <option value="preorder">Под заказ (3-5 дней)</option>
                      <option value="limited">Ограниченный тираж</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Металл и проба *</label>
                    <input
                      type="text"
                      required
                      placeholder="Серебро 925 с позолотой 18K"
                      value={prodForm.metal}
                      onChange={e => setProdForm({ ...prodForm, metal: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Вставки / Камни</label>
                    <input
                      type="text"
                      placeholder="Натуральный барочный жемчуг"
                      value={prodForm.stones}
                      onChange={e => setProdForm({ ...prodForm, stones: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Размеры (через запятую)</label>
                    <input
                      type="text"
                      placeholder="16.0, 16.5, 17.0"
                      value={prodForm.sizes}
                      onChange={e => setProdForm({ ...prodForm, sizes: e.target.value })}
                    />
                  </div>

                  {/* Photo Management Section - 5 Photo Card Gallery */}
                  <div className="product-photos-section" style={{ gridColumn: '1 / -1' }}>
                    <div className="photos-section-header">
                      <div>
                        <h4>Галерея изделия (пропорции 1:1 или 4:5, до 5 ракурсов)</h4>
                        <p className="photos-section-sub">
                          Нажмите на карточку слота для выбора из галереи или съёмки камерой смартфона
                        </p>
                      </div>
                      <span className="photos-section-badge">
                        Заполнено: { [prodForm.mainImage, prodForm.hoverImage, ...(prodForm.detailImages || [])].filter(Boolean).length } / 5 фото
                      </span>
                    </div>

                    {/* Unified 5-Photo Cards Row */}
                    <div className="product-photo-cards-row">
                      
                      {/* 1. Main Photo */}
                      <div className="photo-slot-card main-slot">
                        <div className="slot-badge">
                          <span className="slot-title">1. Главное (Каталог) *</span>
                          <span className="slot-tag">1:1 / 4:5</span>
                        </div>
                        <ImageUploader
                          value={prodForm.mainImage}
                          onChange={(newUrl) => setProdForm({ ...prodForm, mainImage: newUrl })}
                          targetType="product"
                          label=""
                          compact
                          required
                        />
                      </div>

                      {/* 2. Hover Photo */}
                      <div className="photo-slot-card hover-slot">
                        <div className="slot-badge">
                          <span className="slot-title">2. На модели (Hover)</span>
                          <span className="slot-tag">Hover</span>
                        </div>
                        <ImageUploader
                          value={prodForm.hoverImage}
                          onChange={(newUrl) => setProdForm({ ...prodForm, hoverImage: newUrl })}
                          targetType="product"
                          label=""
                          compact
                        />
                      </div>

                      {/* 3..5. Detail Images */}
                      {(prodForm.detailImages || []).map((imgUrl, index) => (
                        <div key={index} className="photo-slot-card detail-slot">
                          <div className="slot-badge">
                            <span className="slot-title">#{index + 3}. Ракурс {index + 1}</span>
                            <button
                              type="button"
                              className="btn-delete-slot"
                              title="Удалить ракурс"
                              onClick={() => {
                                const next = [...prodForm.detailImages];
                                next.splice(index, 1);
                                setProdForm({ ...prodForm, detailImages: next });
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <ImageUploader
                            value={imgUrl}
                            onChange={(newUrl) => {
                              const next = [...prodForm.detailImages];
                              next[index] = newUrl;
                              setProdForm({ ...prodForm, detailImages: next });
                            }}
                            targetType="product"
                            label=""
                            compact
                          />
                        </div>
                      ))}

                      {/* Add Slot Button if < 3 extra images */}
                      {(!prodForm.detailImages || prodForm.detailImages.length < 3) && (
                        <button
                          type="button"
                          className="photo-slot-add-btn"
                          onClick={() => setProdForm({
                            ...prodForm,
                            detailImages: [...(prodForm.detailImages || []), '']
                          })}
                        >
                          <div className="add-slot-icon">
                            <Plus size={22} />
                          </div>
                          <span className="add-slot-text">
                            Добавить ракурс #{ (prodForm.detailImages || []).length + 3 }
                          </span>
                          <span className="add-slot-hint">Макро, замок, упаковка</span>
                        </button>
                      )}

                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label>История / Описание изделия</label>
                  <textarea
                    rows="3"
                    value={prodForm.story}
                    onChange={e => setProdForm({ ...prodForm, story: e.target.value })}
                  ></textarea>
                </div>

                <div className="product-form-actions sticky-mobile-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeProductModal}>
                    Отмена
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Сохранить товар
                  </button>
                </div>
              </form>
            )}

            {/* Desktop Products Table */}
            <div className="admin-table-wrap desktop-table-view">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Фото</th>
                    <th>Название & Капсула</th>
                    <th>Категория</th>
                    <th>Металл / Вставки</th>
                    <th>Цена</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => (
                    <tr key={prod.id}>
                      <td>
                        <img 
                          src={prod.mainImage} 
                          alt={prod.title} 
                          className="table-thumb" 
                          onError={handleImageError}
                        />
                      </td>
                      <td>
                        <strong>{prod.title}</strong>
                        <div className="table-sub">{prod.capsule}</div>
                      </td>
                      <td>{prod.category}</td>
                      <td>
                        <div>{prod.metal}</div>
                        <div className="table-sub">{prod.stones}</div>
                      </td>
                      <td>
                        <strong className="table-price">{prod.price.toLocaleString('ru-RU')} ₽</strong>
                      </td>
                      <td>
                        <span className={`status-pill ${prod.status}`}>{prod.status}</span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="action-btn edit" onClick={() => openEditProduct(prod)} title="Редактировать">
                            <Edit size={14} />
                          </button>
                          <button className="action-btn delete" onClick={() => deleteProduct(prod.id)} title="Удалить">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Products Cards Grid (Optimized for smartphones) */}
            <div className="admin-product-cards-mobile">
              {products.map(prod => (
                <div key={prod.id} className="mobile-product-card">
                  <div className="mobile-card-media-wrap" onClick={() => openEditProduct(prod)}>
                    <img 
                      src={prod.mainImage} 
                      alt={prod.title} 
                      className="mobile-card-thumb" 
                      onError={handleImageError}
                    />
                    <span className={`mobile-status-badge ${prod.status}`}>
                      {prod.status === 'in_stock' ? 'В наличии' : prod.status === 'preorder' ? 'Под заказ' : 'Лимит'}
                    </span>
                  </div>

                  <div className="mobile-card-content">
                    <div className="mobile-card-header">
                      <span className="mobile-card-capsule-tag">{prod.capsule || prod.category}</span>
                      <strong className="mobile-card-price">{prod.price.toLocaleString('ru-RU')} ₽</strong>
                    </div>

                    <h4 className="mobile-card-title" onClick={() => openEditProduct(prod)}>
                      {prod.title}
                    </h4>

                    <div className="mobile-card-specs">
                      {prod.metal && <span className="spec-chip">{prod.metal}</span>}
                      {prod.stones && <span className="spec-chip stones">{prod.stones}</span>}
                    </div>

                    <div className="mobile-card-footer">
                      <button 
                        type="button" 
                        className="mobile-btn-edit" 
                        onClick={() => openEditProduct(prod)}
                      >
                        <Edit size={14} />
                        <span>Редактировать</span>
                      </button>
                      <button 
                        type="button" 
                        className="mobile-btn-delete" 
                        onClick={() => deleteProduct(prod.id)}
                        title="Удалить изделие"
                        aria-label="Удалить изделие"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Action Button (FAB) for Mobile */}
            {!isAddingProduct && (
              <button
                type="button"
                className="mobile-fab-add"
                onClick={openAddProduct}
                aria-label="Добавить ювелирное изделие"
              >
                <Plus size={22} />
                <span>Добавить</span>
              </button>
            )}

          </div>
        )}

        {/* TAB 3: ORDERS & CRM */}
        {activeTab === 'orders' && (
          <div className="admin-tab-pane">
            <div className="pane-header">
              <div>
                <h2>Заказы & CRM ({orders.length})</h2>
                <p>Все входящие заказы с витрины магазина в реальном времени</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="empty-orders-banner">
                <ShoppingCart size={40} />
                <h3>Заказов пока нет</h3>
                <p>Новые заказы с витрины будут автоматически появляться в этом списке</p>
              </div>
            ) : (
              <div className="orders-cards-grid">
                {orders.map(order => (
                  <div key={order.id} className="order-admin-card">
                    <div className="order-card-header">
                      <div>
                        <h4>Заказ {order.id}</h4>
                        <span className="order-time">{new Date(order.createdAt).toLocaleString('ru-RU')}</span>
                      </div>
                      <span className="order-total-badge">{order.total.toLocaleString('ru-RU')} ₽</span>
                    </div>

                    <div className="order-client-info">
                      <p><strong>Клиент:</strong> {order.customerName} ({order.customerPhone})</p>
                      <p><strong>Город / Доставка:</strong> {order.customerCity || 'Не указан'} ({order.deliveryMethod})</p>
                      {order.customerComment && <p><strong>Пожелания:</strong> {order.customerComment}</p>}
                    </div>

                    <div className="order-items-mini">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="order-item-chip">
                          {it.title} ({it.size}) × {it.quantity} шт. — {(it.price * it.quantity).toLocaleString('ru-RU')} ₽
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GOOGLE DRIVE & SERVICE ACCOUNT INTEGRATIONS */}
        {activeTab === 'integrations' && (
          <div className="admin-tab-pane">
            <div className="pane-header">
              <div>
                <h2>Google Cloud, Drive & Таблицы Учета</h2>
                <p>Настройка хранения фото на Google Диске и выгрузки заказов через Google Service Account</p>
              </div>
            </div>

            <div className="integration-box">
              
              {/* Storage Mode Selector */}
              <div className="integration-item">
                <div className="integration-icon">
                  <Cloud size={28} />
                </div>
                <div className="integration-body">
                  <h4>Режим Хранилища Изображений</h4>
                  <p>Выберите, куда автоматически сохранять оптимизированные WebP фотографии товаров и баннеров.</p>
                  
                  <div className="input-with-button" style={{ marginTop: '10px' }}>
                    <select
                      className="admin-form-select"
                      style={{ maxWidth: '380px' }}
                      value={settings.storageMode || 'auto'}
                      onChange={e => setSettings({ ...settings, storageMode: e.target.value })}
                    >
                      <option value="auto">Авто (Google Drive + Локальный Fallback на сервер)</option>
                      <option value="google_drive">Только Google Drive</option>
                      <option value="local">Только локальный сервер (/uploads/)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Google Service Account Key */}
              <div className="integration-item">
                <div className="integration-icon">
                  <Key size={28} />
                </div>
                <div className="integration-body">
                  <div className="integration-header-row">
                    <h4>Google Service Account JSON Key</h4>
                    <button
                      type="button"
                      className="btn btn-secondary guide-toggle-btn"
                      onClick={() => setShowServiceAccountGuide(!showServiceAccountGuide)}
                    >
                      <Info size={13} /> {showServiceAccountGuide ? 'Скрыть инструкцию' : 'Как получить ключ?'}
                    </button>
                  </div>
                  
                  <p>Ключ сервисного аккаунта Google Cloud для прямой загрузки фото в Google Drive и заполнения Google Таблицы учета.</p>

                  {showServiceAccountGuide && (
                    <div className="service-account-guide-box">
                      <h5>Инструкция по настройке Google Cloud Service Account:</h5>
                      <ol>
                        <li>Перейдите в <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer">Google Cloud Console</a> и создайте проект (или выберите существующий).</li>
                        <li>В разделе <strong>APIs & Services → Library</strong> включите <strong>Google Drive API</strong> и <strong>Google Sheets API</strong>.</li>
                        <li>В разделе <strong>IAM & Admin → Service Accounts</strong> нажмите <em>Create Service Account</em>, создайте ключ (Keys → Add Key → Create new key → JSON) и скачайте файл.</li>
                        <li>Вставьте содержимое скачанного <code>.json</code> файла в поле ниже.</li>
                        <li><strong>Важно:</strong> Откройте вашу папку на Google Диске и предоставьте доступ с правами <em>Редактора</em> для email сервисного аккаунта (например: <code>xxx@project.iam.gserviceaccount.com</code>).</li>
                      </ol>
                    </div>
                  )}

                  <div style={{ marginTop: '8px' }}>
                    <textarea
                      rows="4"
                      className="admin-form-input"
                      style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                      placeholder='{"type": "service_account", "project_id": "...", "private_key": "...", "client_email": "..."}'
                      value={settings.googleServiceAccountKey || ''}
                      onChange={e => setSettings({ ...settings, googleServiceAccountKey: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Google Drive Folder ID */}
              <div className="integration-item">
                <div className="integration-icon">
                  <HardDrive size={28} />
                </div>
                <div className="integration-body">
                  <h4>ID Папки Google Диска (для фотографий)</h4>
                  <p>Скопируйте ID папки из адресной строки браузера (например: <code>https://drive.google.com/drive/folders/<strong>1BxiMVs0XR_...</strong></code>)</p>
                  
                  <div className="input-with-button">
                    <input
                      type="text"
                      placeholder="1BxiMVs0XR_v9QvQ3QG89Y..."
                      value={settings.googleDriveFolderId || ''}
                      onChange={e => setSettings({ ...settings, googleDriveFolderId: e.target.value })}
                    />
                    <button
                      className="btn btn-secondary"
                      onClick={handleTestDriveConnection}
                      disabled={testDriveStatus.isTesting}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RefreshCw size={15} className={testDriveStatus.isTesting ? 'spinning' : ''} />
                      {testDriveStatus.isTesting ? 'Проверка...' : 'Проверить доступ'}
                    </button>
                  </div>

                  {/* Test Connection Status Banner */}
                  {testDriveStatus.message && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: testDriveStatus.success ? '#f0fdf4' : '#fef2f2',
                        color: testDriveStatus.success ? '#166534' : '#991b1b',
                        border: `1px solid ${testDriveStatus.success ? '#bbf7d0' : '#fecaca'}`
                      }}
                    >
                      {testDriveStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      <span>{testDriveStatus.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Google Sheets Webhook */}
              <div className="integration-item">
                <div className="integration-icon">
                  <FileSpreadsheet size={28} />
                </div>
                <div className="integration-body">
                  <h4>Google Таблица Заказов (Apps Script Webhook)</h4>
                  <p>При каждом заказе на сайте данные автоматически отправляются новой строкой в вашу Google Таблицу (Дата, Клиент, Телефон, Сумма, Состав).</p>
                  
                  <div className="input-with-button">
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      value={settings.googleSheetsWebhookUrl || ''}
                      onChange={e => setSettings({ ...settings, googleSheetsWebhookUrl: e.target.value })}
                    />
                    <button className="btn btn-primary" onClick={() => alert('Настройки сохранены!')}>
                      <Save size={16} /> Сохранить
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: FOOTER & CONTACTS CMS */}
        {activeTab === 'footer' && (
          <div className="admin-tab-pane">
            <div className="pane-header">
              <div>
                <h2>Управление Подвалом Сайта & Контактами</h2>
                <p>Настройте название бренда, слоган, контакты, соцсети и копирайт в нижней части витрины</p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveFooter}
              >
                <Save size={16} />
                <span>Сохранить подвал</span>
              </button>
            </div>

            {footerSaveStatus.message && (
              <div
                style={{
                  marginBottom: '18px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: footerSaveStatus.success ? '#f0fdf4' : '#fef2f2',
                  color: footerSaveStatus.success ? '#166534' : '#991b1b',
                  border: `1px solid ${footerSaveStatus.success ? '#bbf7d0' : '#fecaca'}`
                }}
              >
                {footerSaveStatus.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{footerSaveStatus.message}</span>
              </div>
            )}

            <div className="footer-editor-grid">
              {/* CARD 1: Бренд и Описание */}
              <div className="footer-editor-card">
                <div className="card-header-bar">
                  <h3>✦ Колонка 1: Бренд и Манифест</h3>
                </div>
                <div className="form-group">
                  <label>Заголовок / Название бренда в подвале</label>
                  <input
                    type="text"
                    className="editor-input"
                    value={footerForm.footerBrandTitle}
                    onChange={e => setFooterForm({ ...footerForm, footerBrandTitle: e.target.value })}
                    placeholder="Wild Rose Jewel"
                  />
                </div>
                <div className="form-group">
                  <label>Описание бренда / Манифест</label>
                  <textarea
                    rows="3"
                    className="editor-textarea"
                    value={footerForm.footerBrandDesc}
                    onChange={e => setFooterForm({ ...footerForm, footerBrandDesc: e.target.value })}
                    placeholder="Авторские ювелирные изделия и талисманы, рожденные в союзе эстетики и страсти."
                  />
                </div>
              </div>

              {/* CARD 2: Каталог и Меню */}
              <div className="footer-editor-card">
                <div className="card-header-bar">
                  <h3>✦ Колонка 2: Навигация</h3>
                </div>
                <div className="form-group">
                  <label>Заголовок колонки каталога</label>
                  <input
                    type="text"
                    className="editor-input"
                    value={footerForm.footerCatalogTitle}
                    onChange={e => setFooterForm({ ...footerForm, footerCatalogTitle: e.target.value })}
                    placeholder="Каталог"
                  />
                  <span style={{ fontSize: '0.75rem', color: '#8c827a', marginTop: '4px', display: 'block' }}>
                    Ссылки на категории (Колье, Кольца, Серьги, Браслеты) формируются автоматически
                  </span>
                </div>
              </div>

              {/* CARD 3: Контакты и Консьерж */}
              <div className="footer-editor-card">
                <div className="card-header-bar">
                  <h3>✦ Колонка 3: Контакты & Соцсети</h3>
                </div>
                <div className="form-group">
                  <label>Заголовок колонки контактов</label>
                  <input
                    type="text"
                    className="editor-input"
                    value={footerForm.footerConciergeTitle}
                    onChange={e => setFooterForm({ ...footerForm, footerConciergeTitle: e.target.value })}
                    placeholder="Консьерж-сервис"
                  />
                </div>
                <div className="form-group">
                  <label>Контактный телефон</label>
                  <input
                    type="text"
                    className="editor-input"
                    value={footerForm.contactPhone}
                    onChange={e => setFooterForm({ ...footerForm, contactPhone: e.target.value })}
                    placeholder="+7 (999) 000-00-00"
                  />
                </div>
                <div className="form-group">
                  <label>Контактный Email</label>
                  <input
                    type="email"
                    className="editor-input"
                    value={footerForm.contactEmail}
                    onChange={e => setFooterForm({ ...footerForm, contactEmail: e.target.value })}
                    placeholder="concierge@wildrosejewel.com"
                  />
                </div>
                <div className="form-group">
                  <label>Ссылка на Telegram</label>
                  <input
                    type="url"
                    className="editor-input"
                    value={footerForm.telegramUrl}
                    onChange={e => setFooterForm({ ...footerForm, telegramUrl: e.target.value })}
                    placeholder="https://t.me/wildrosejewel"
                  />
                </div>
                <div className="form-group">
                  <label>Ссылка на WhatsApp</label>
                  <input
                    type="url"
                    className="editor-input"
                    value={footerForm.whatsappUrl}
                    onChange={e => setFooterForm({ ...footerForm, whatsappUrl: e.target.value })}
                    placeholder="https://wa.me/79990000000"
                  />
                </div>
                <div className="form-group">
                  <label>Ссылка на Instagram (опционально)</label>
                  <input
                    type="url"
                    className="editor-input"
                    value={footerForm.instagramUrl}
                    onChange={e => setFooterForm({ ...footerForm, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/wildrosejewel"
                  />
                </div>
              </div>

              {/* CARD 4: Нижняя строка и Копирайт */}
              <div className="footer-editor-card">
                <div className="card-header-bar">
                  <h3>✦ Нижняя строка & Копирайт</h3>
                </div>
                <div className="form-group">
                  <label>Текст копирайта (после знака © и текущего года)</label>
                  <input
                    type="text"
                    className="editor-input"
                    value={footerForm.footerCopyright}
                    onChange={e => setFooterForm({ ...footerForm, footerCopyright: e.target.value })}
                    placeholder="Wild Rose Jewel. Все права защищены."
                  />
                </div>
                <div className="form-group">
                  <label>Подпись справа</label>
                  <input
                    type="text"
                    className="editor-input"
                    value={footerForm.footerMetaText}
                    onChange={e => setFooterForm({ ...footerForm, footerMetaText: e.target.value })}
                    placeholder="Сделано с любовью к ювелирному искусству"
                  />
                </div>
                <div className="form-group">
                  <label>Текст кнопки входа в админку</label>
                  <input
                    type="text"
                    className="editor-input"
                    value={footerForm.footerAdminBtnText}
                    onChange={e => setFooterForm({ ...footerForm, footerAdminBtnText: e.target.value })}
                    placeholder="CMS Админка"
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveFooter}
                style={{ padding: '12px 28px', fontSize: '0.96rem' }}
              >
                <Save size={18} />
                <span>Сохранить настройки подвала</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Lookbook Visual Hotspots Editor Modal */}
      {editingLookbookSection && (
        <LookbookEditor
          section={editingLookbookSection}
          onClose={closeLookbookEditor}
        />
      )}

      {/* General Section Content / Banner Editor Modal */}
      {editingSection && (
        <div className="lookbook-editor-overlay" onClick={closeEditSectionModal}>
          <div className="lookbook-editor-modal section-modal-container" onClick={e => e.stopPropagation()}>
            <div className="lookbook-editor-header">
              <div>
                <h3>Редактирование секции: {editingSection.name}</h3>
                <p>
                  {editingSection.type === 'craftsmanship' && 'Настройка текстов, философии бренда и ключевых преимуществ'}
                  {editingSection.type === 'hero' && 'Редактирование баннера, заголовков, кнопок и характеристик первого экрана'}
                  {editingSection.type === 'capsules' && 'Настройка заголовков и карточек коллекций/направлений'}
                  {editingSection.type !== 'craftsmanship' && editingSection.type !== 'hero' && editingSection.type !== 'capsules' && 'Изменение текстов, заголовков и визуального оформления'}
                </p>
              </div>
              <button className="control-icon-btn" onClick={closeEditSectionModal} aria-label="Закрыть">
                <X size={20} />
              </button>
            </div>

            <div className="lookbook-editor-body section-modal-scrollable">
              
              {/* === CRAFTSMANSHIP (О БРЕНДЕ И МАСТЕРСТВЕ) === */}
              {editingSection.type === 'craftsmanship' && (
                <>
                  <div className="editor-field-group">
                    <label className="editor-field-label">Верхняя строка / Бейдж над заголовком</label>
                    <input
                      type="text"
                      className="editor-input"
                      placeholder="КАЖДОЕ ИЗДЕЛИЕ ХРАНИТ ТЕПЛО РУК МАСТЕРА"
                      value={editingSection.subtitle || ''}
                      onChange={e => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                    />
                    <span className="editor-field-hint">Отображается мелким золотистым шрифтом с иконкой ювелирного кристалла</span>
                  </div>

                  <div className="editor-field-group">
                    <label className="editor-field-label">Главный заголовок блока</label>
                    <input
                      type="text"
                      className="editor-input"
                      placeholder="Магия Ручной Работы"
                      value={editingSection.title || ''}
                      onChange={e => setEditingSection({ ...editingSection, title: e.target.value })}
                    />
                  </div>

                  <div className="editor-field-group">
                    <label className="editor-field-label">Основной текст / Манифест бренда</label>
                    <textarea
                      rows="4"
                      className="editor-textarea"
                      placeholder="Мы верим, что ювелирные украшения — это не просто драгоценный металл, а личный талисман..."
                      value={editingSection.text || ''}
                      onChange={e => setEditingSection({ ...editingSection, text: e.target.value })}
                    ></textarea>
                    <span className="editor-field-hint">Основное текстовое наполнение карточки по центру экрана</span>
                  </div>

                  <div className="editor-fieldset">
                    <div className="editor-fieldset-title">
                      ✦ Ключевые преимущества / Метрики (3 нижние карточки)
                    </div>
                    <span className="editor-field-hint" style={{ marginTop: '-6px', marginBottom: '8px' }}>
                      Эти цифры и надписи выводятся внизу блока в 3 аккуратные колонки
                    </span>

                    <div className="features-editor-grid">
                      {((editingSection.extraData?.features) || [
                        { num: "925 / 585", label: "Благородные сплавы и проба" },
                        { num: "100%", label: "Ручной отбор натуральных камней" },
                        { num: "Lifetime", label: "Безупречная полировка и сервис" }
                      ]).map((feat, fIdx) => (
                        <div key={fIdx} className="feature-editor-card">
                          <span className="feature-card-header">Блок #{fIdx + 1}</span>
                          <div className="editor-field-group">
                            <label style={{ fontSize: '0.74rem', color: '#666' }}>Число / Выделение</label>
                            <input
                              type="text"
                              className="editor-input"
                              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                              value={feat.num}
                              onChange={e => {
                                const updatedFeatures = [...(editingSection.extraData?.features || [
                                  { num: "925 / 585", label: "Благородные сплавы и проба" },
                                  { num: "100%", label: "Ручной отбор натуральных камней" },
                                  { num: "Lifetime", label: "Безупречная полировка и сервис" }
                                ])];
                                updatedFeatures[fIdx] = { ...updatedFeatures[fIdx], num: e.target.value };
                                setEditingSection({
                                  ...editingSection,
                                  extraData: { ...editingSection.extraData, features: updatedFeatures }
                                });
                              }}
                            />
                          </div>
                          <div className="editor-field-group">
                            <label style={{ fontSize: '0.74rem', color: '#666' }}>Описание</label>
                            <input
                              type="text"
                              className="editor-input"
                              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                              value={feat.label}
                              onChange={e => {
                                const updatedFeatures = [...(editingSection.extraData?.features || [
                                  { num: "925 / 585", label: "Благородные сплавы и проба" },
                                  { num: "100%", label: "Ручной отбор натуральных камней" },
                                  { num: "Lifetime", label: "Безупречная полировка и сервис" }
                                ])];
                                updatedFeatures[fIdx] = { ...updatedFeatures[fIdx], label: e.target.value };
                                setEditingSection({
                                  ...editingSection,
                                  extraData: { ...editingSection.extraData, features: updatedFeatures }
                                });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* === HERO (ГЛАВНЫЙ БАННЕР ПЕРВОГО ЭКРАНА) === */}
              {editingSection.type === 'hero' && (
                <>
                  <div className="editor-row-2">
                    <div className="editor-field-group">
                      <label className="editor-field-label">Верхний бейдж / Слоган</label>
                      <input
                        type="text"
                        className="editor-input"
                        placeholder="Новая Коллекция 2026"
                        value={editingSection.subtitle || ''}
                        onChange={e => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                      />
                    </div>
                    <div className="editor-field-group">
                      <label className="editor-field-label">Плавающий тег на фото</label>
                      <input
                        type="text"
                        className="editor-input"
                        placeholder="Limited Atelier Edition"
                        value={editingSection.extraData?.floatingTag || ''}
                        onChange={e => setEditingSection({
                          ...editingSection,
                          extraData: { ...editingSection.extraData, floatingTag: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="editor-field-group">
                    <label className="editor-field-label">Главный заголовок первого экрана</label>
                    <input
                      type="text"
                      className="editor-input"
                      placeholder="Искусство Дикой Розы в Драгоценном Металле"
                      value={editingSection.title || ''}
                      onChange={e => setEditingSection({ ...editingSection, title: e.target.value })}
                    />
                  </div>

                  <div className="editor-field-group">
                    <label className="editor-field-label">Текст манифеста / Описание</label>
                    <textarea
                      rows="3"
                      className="editor-textarea"
                      placeholder="Авторские ювелирные изделия ручной работы..."
                      value={editingSection.text || ''}
                      onChange={e => setEditingSection({ ...editingSection, text: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="editor-fieldset">
                    <div className="editor-fieldset-title">✦ Кнопки первого экрана</div>
                    <div className="editor-row-2">
                      <div className="editor-field-group">
                        <label style={{ fontSize: '0.74rem', color: '#666' }}>Текст главной кнопки</label>
                        <input
                          type="text"
                          className="editor-input"
                          placeholder="Смотреть Коллекцию"
                          value={editingSection.buttonText || ''}
                          onChange={e => setEditingSection({ ...editingSection, buttonText: e.target.value })}
                        />
                      </div>
                      <div className="editor-field-group">
                        <label style={{ fontSize: '0.74rem', color: '#666' }}>Ссылка главной кнопки</label>
                        <input
                          type="text"
                          className="editor-input"
                          placeholder="#catalog"
                          value={editingSection.buttonLink || ''}
                          onChange={e => setEditingSection({ ...editingSection, buttonLink: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="editor-row-2">
                      <div className="editor-field-group">
                        <label style={{ fontSize: '0.74rem', color: '#666' }}>Текст второй кнопки</label>
                        <input
                          type="text"
                          className="editor-input"
                          placeholder="Интерактивный Лукбук"
                          value={editingSection.extraData?.secondaryButtonText || ''}
                          onChange={e => setEditingSection({
                            ...editingSection,
                            extraData: { ...editingSection.extraData, secondaryButtonText: e.target.value }
                          })}
                        />
                      </div>
                      <div className="editor-field-group">
                        <label style={{ fontSize: '0.74rem', color: '#666' }}>Ссылка второй кнопки</label>
                        <input
                          type="text"
                          className="editor-input"
                          placeholder="#lookbook"
                          value={editingSection.extraData?.secondaryButtonLink || ''}
                          onChange={e => setEditingSection({
                            ...editingSection,
                            extraData: { ...editingSection.extraData, secondaryButtonLink: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="editor-fieldset">
                    <div className="editor-fieldset-title">✦ Метрики доверия (3 плашки внизу)</div>
                    <div className="features-editor-grid">
                      {((editingSection.extraData?.metrics) || [
                        { num: "925°", label: "Проба & Качество" },
                        { num: "100%", label: "Ручной Отбор Камней" },
                        { num: "24 ч", label: "Бережная Отправка" }
                      ]).map((metric, mIdx) => (
                        <div key={mIdx} className="feature-editor-card">
                          <span className="feature-card-header">Метрика #{mIdx + 1}</span>
                          <input
                            type="text"
                            className="editor-input"
                            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                            placeholder="925°"
                            value={metric.num}
                            onChange={e => {
                              const updatedMetrics = [...(editingSection.extraData?.metrics || [
                                { num: "925°", label: "Проба & Качество" },
                                { num: "100%", label: "Ручной Отбор Камней" },
                                { num: "24 ч", label: "Бережная Отправка" }
                              ])];
                              updatedMetrics[mIdx] = { ...updatedMetrics[mIdx], num: e.target.value };
                              setEditingSection({
                                ...editingSection,
                                extraData: { ...editingSection.extraData, metrics: updatedMetrics }
                              });
                            }}
                          />
                          <input
                            type="text"
                            className="editor-input"
                            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                            placeholder="Проба & Качество"
                            value={metric.label}
                            onChange={e => {
                              const updatedMetrics = [...(editingSection.extraData?.metrics || [
                                { num: "925°", label: "Проба & Качество" },
                                { num: "100%", label: "Ручной Отбор Камней" },
                                { num: "24 ч", label: "Бережная Отправка" }
                              ])];
                              updatedMetrics[mIdx] = { ...updatedMetrics[mIdx], label: e.target.value };
                              setEditingSection({
                                ...editingSection,
                                extraData: { ...editingSection.extraData, metrics: updatedMetrics }
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="editor-field-group">
                    <ImageUploader
                      value={editingSection.imageUrl || ''}
                      onChange={url => setEditingSection({ ...editingSection, imageUrl: url })}
                      targetType="banner"
                      label="Главная фотография витрины (Hero Showcase Photo)"
                      customHint="Рекомендуется вертикальный или 4:5 портретный кадр высокого качества."
                    />
                  </div>
                </>
              )}

              {/* === CAPSULES (КОЛЛЕКЦИИ И НАПРАВЛЕНИЯ) === */}
              {editingSection.type === 'capsules' && (
                <>
                  <div className="editor-row-2">
                    <div className="editor-field-group">
                      <label className="editor-field-label">Заголовок секции</label>
                      <input
                        type="text"
                        className="editor-input"
                        placeholder="Коллекция Украшений"
                        value={editingSection.title || ''}
                        onChange={e => setEditingSection({ ...editingSection, title: e.target.value })}
                      />
                    </div>
                    <div className="editor-field-group">
                      <label className="editor-field-label">Подзаголовок / Слоган</label>
                      <input
                        type="text"
                        className="editor-input"
                        placeholder="Выберите свою эстетику"
                        value={editingSection.subtitle || ''}
                        onChange={e => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="editor-fieldset">
                    <div className="editor-fieldset-title">✦ 3 Тематические Капсулы</div>
                    
                    {((editingSection.extraData?.capsules) || [
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
                    ]).map((cap, cIdx) => (
                      <div key={cIdx} style={{ background: '#fff', border: '1px solid #e6ded8', borderRadius: '8px', padding: '14px', marginBottom: '10px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '8px', color: 'var(--color-rose-deep)' }}>
                          Капсула #{cIdx + 1}
                        </div>
                        <div className="editor-row-2">
                          <div className="editor-field-group">
                            <label style={{ fontSize: '0.74rem', color: '#666' }}>Название капсулы</label>
                            <input
                              type="text"
                              className="editor-input"
                              value={cap.title}
                              onChange={e => {
                                const updated = [...(editingSection.extraData?.capsules || [])];
                                updated[cIdx] = { ...updated[cIdx], title: e.target.value };
                                setEditingSection({
                                  ...editingSection,
                                  extraData: { ...editingSection.extraData, capsules: updated }
                                });
                              }}
                            />
                          </div>
                          <div className="editor-field-group">
                            <label style={{ fontSize: '0.74rem', color: '#666' }}>Категория каталога</label>
                            <select
                              className="editor-input"
                              value={cap.category}
                              onChange={e => {
                                const updated = [...(editingSection.extraData?.capsules || [])];
                                updated[cIdx] = { ...updated[cIdx], category: e.target.value };
                                setEditingSection({
                                  ...editingSection,
                                  extraData: { ...editingSection.extraData, capsules: updated }
                                });
                              }}
                            >
                              <option value="necklaces">Колье & Ожерелья</option>
                              <option value="rings">Кольца</option>
                              <option value="earrings">Серьги</option>
                              <option value="bracelets">Браслеты</option>
                              <option value="sets">Сеты & Комплекты</option>
                            </select>
                          </div>
                        </div>

                        <div className="editor-row-2" style={{ marginTop: '8px' }}>
                          <div className="editor-field-group">
                            <label style={{ fontSize: '0.74rem', color: '#666' }}>Описание капсулы</label>
                            <input
                              type="text"
                              className="editor-input"
                              value={cap.desc}
                              onChange={e => {
                                const updated = [...(editingSection.extraData?.capsules || [])];
                                updated[cIdx] = { ...updated[cIdx], desc: e.target.value };
                                setEditingSection({
                                  ...editingSection,
                                  extraData: { ...editingSection.extraData, capsules: updated }
                                });
                              }}
                            />
                          </div>
                          <div className="editor-field-group">
                            <label style={{ fontSize: '0.74rem', color: '#666' }}>Текст ссылки / кнопки</label>
                            <input
                              type="text"
                              className="editor-input"
                              placeholder="Смотреть капсулу"
                              value={cap.buttonText || ''}
                              onChange={e => {
                                const updated = [...(editingSection.extraData?.capsules || [])];
                                updated[cIdx] = { ...updated[cIdx], buttonText: e.target.value };
                                setEditingSection({
                                  ...editingSection,
                                  extraData: { ...editingSection.extraData, capsules: updated }
                                });
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ marginTop: '10px' }}>
                          <ImageUploader
                            value={cap.img || ''}
                            onChange={url => {
                              const updated = [...(editingSection.extraData?.capsules || [])];
                              updated[cIdx] = { ...updated[cIdx], img: url };
                              setEditingSection({
                                ...editingSection,
                                extraData: { ...editingSection.extraData, capsules: updated }
                              });
                            }}
                            targetType="banner"
                            label={`Фото для капсулы «${cap.title || `#${cIdx + 1}`}»`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* === JOURNAL (INSTAGRAM & UGC ЛЕНТА) === */}
              {editingSection.type === 'journal' && (
                <>
                  <div className="editor-row-2">
                    <div className="editor-field-group">
                      <label className="editor-field-label">Заголовок секции</label>
                      <input
                        type="text"
                        className="editor-input"
                        placeholder="Вдохновение #WildRoseJewel"
                        value={editingSection.title || ''}
                        onChange={e => setEditingSection({ ...editingSection, title: e.target.value })}
                      />
                    </div>
                    <div className="editor-field-group">
                      <label className="editor-field-label">Подзаголовок / Слоган</label>
                      <input
                        type="text"
                        className="editor-input"
                        placeholder="Как наши изделия живут в ваших образах"
                        value={editingSection.subtitle || ''}
                        onChange={e => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="editor-field-group">
                    <label className="editor-field-label">Текст призыва / Описание блока</label>
                    <textarea
                      rows="2"
                      className="editor-textarea"
                      placeholder="Отмечайте @wildrosejewel в ваших историях и публикациях, чтобы стать частью нашего ювелирного комьюнити..."
                      value={editingSection.text || ''}
                      onChange={e => setEditingSection({ ...editingSection, text: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="editor-row-2">
                    <div className="editor-field-group">
                      <label className="editor-field-label">Instagram аккаунт / Хэндл</label>
                      <input
                        type="text"
                        className="editor-input"
                        placeholder="@wildrosejewel"
                        value={editingSection.extraData?.accountHandle || ''}
                        onChange={e => setEditingSection({
                          ...editingSection,
                          extraData: { ...editingSection.extraData, accountHandle: e.target.value }
                        })}
                      />
                    </div>
                    <div className="editor-field-group">
                      <label className="editor-field-label">Ссылка на профиль Instagram</label>
                      <input
                        type="url"
                        className="editor-input"
                        placeholder="https://instagram.com/wildrosejewel"
                        value={editingSection.extraData?.instagramUrl || ''}
                        onChange={e => setEditingSection({
                          ...editingSection,
                          extraData: { ...editingSection.extraData, instagramUrl: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="editor-fieldset">
                    <div className="editor-fieldset-title">✦ 4 Кадра Ленты Вдохновения (UGC Фото)</div>
                    <span className="editor-field-hint" style={{ marginTop: '-6px', marginBottom: '8px' }}>
                      Фотографии клиентов, амбассадоров и эстетичные макро-кадры изделий
                    </span>

                    <div className="editor-row-2">
                      {((editingSection.extraData?.gallery) || [
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
                      ]).map((item, gIdx) => (
                        <div key={gIdx} style={{ background: '#fff', border: '1px solid #e6ded8', borderRadius: '8px', padding: '12px' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.78rem', marginBottom: '6px', color: 'var(--color-rose-deep)' }}>
                            Кадр #{gIdx + 1}
                          </div>
                          <div className="editor-row-2">
                            <div className="editor-field-group">
                              <label style={{ fontSize: '0.72rem', color: '#666' }}>Автор / Ник</label>
                              <input
                                type="text"
                                className="editor-input"
                                style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                                value={item.author}
                                onChange={e => {
                                  const updated = [...(editingSection.extraData?.gallery || [])];
                                  updated[gIdx] = { ...updated[gIdx], author: e.target.value };
                                  setEditingSection({
                                    ...editingSection,
                                    extraData: { ...editingSection.extraData, gallery: updated }
                                  });
                                }}
                              />
                            </div>
                            <div className="editor-field-group">
                              <label style={{ fontSize: '0.72rem', color: '#666' }}>Хэштег</label>
                              <input
                                type="text"
                                className="editor-input"
                                style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                                value={item.tag}
                                onChange={e => {
                                  const updated = [...(editingSection.extraData?.gallery || [])];
                                  updated[gIdx] = { ...updated[gIdx], tag: e.target.value };
                                  setEditingSection({
                                    ...editingSection,
                                    extraData: { ...editingSection.extraData, gallery: updated }
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div style={{ marginTop: '8px' }}>
                            <ImageUploader
                              value={item.imageUrl || ''}
                              onChange={url => {
                                const updated = [...(editingSection.extraData?.gallery || [])];
                                updated[gIdx] = { ...updated[gIdx], imageUrl: url };
                                setEditingSection({
                                  ...editingSection,
                                  extraData: { ...editingSection.extraData, gallery: updated }
                                });
                              }}
                              targetType="product"
                              label="Фото кадра"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* === ALL OTHER SECTIONS (BESTSELLERS, ETC.) === */}
              {editingSection.type !== 'craftsmanship' && editingSection.type !== 'hero' && editingSection.type !== 'capsules' && editingSection.type !== 'journal' && (
                <>
                  <div className="editor-field-group">
                    <label className="editor-field-label">Заголовок секции</label>
                    <input
                      type="text"
                      className="editor-input"
                      value={editingSection.title || ''}
                      onChange={e => setEditingSection({ ...editingSection, title: e.target.value })}
                    />
                  </div>

                  <div className="editor-field-group">
                    <label className="editor-field-label">Подзаголовок / Описание</label>
                    <input
                      type="text"
                      className="editor-input"
                      value={editingSection.subtitle || ''}
                      onChange={e => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                    />
                  </div>

                  <div className="editor-field-group">
                    <label className="editor-field-label">Текстовое наполнение (опционально)</label>
                    <textarea
                      rows="3"
                      className="editor-textarea"
                      value={editingSection.text || ''}
                      onChange={e => setEditingSection({ ...editingSection, text: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="editor-field-group" style={{ marginTop: '12px' }}>
                    <ImageUploader
                      value={editingSection.imageUrl || ''}
                      onChange={url => setEditingSection({ ...editingSection, imageUrl: url })}
                      targetType="banner"
                      label="Баннер / Фоновое изображение секции"
                      customHint="Рекомендуется: 16:9 или 4:3, от 1600×900px до 2000×1200px для 4K/Retina экранов."
                    />
                  </div>
                </>
              )}

            </div>

            <div className="lookbook-editor-footer">
              <button className="btn btn-secondary" onClick={closeEditSectionModal}>
                Отмена
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  updateSection(editingSection.id, editingSection);
                  closeEditSectionModal();
                }}
              >
                <Check size={16} /> Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
