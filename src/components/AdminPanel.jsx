import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers, Package, ShoppingCart, Settings, ArrowUp, ArrowDown, Eye, EyeOff,
  Plus, Trash2, Edit, Check, Link, Save, RefreshCw, FileSpreadsheet, HardDrive,
  SlidersHorizontal, CheckCircle2, AlertCircle, Key, Cloud, Info, X
} from 'lucide-react';
import { LookbookEditor } from './LookbookEditor';
import { ImageUploader } from './ImageUploader';
import { api } from '../api/apiClient';
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

  const [activeTab, setActiveTab] = useState('sections'); // 'sections', 'products', 'orders', 'integrations'
  const [editingLookbookSection, setEditingLookbookSection] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  
  // Test connection state
  const [testDriveStatus, setTestDriveStatus] = useState({ isTesting: false, message: '', success: null });
  const [showServiceAccountGuide, setShowServiceAccountGuide] = useState(false);
  
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

  const handleEditProduct = (prod) => {
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

    setIsAddingProduct(false);
    setEditingProduct(null);
  };

  const handleOpenEditSection = (sec) => {
    const cloned = JSON.parse(JSON.stringify(sec));
    if (!cloned.extraData) cloned.extraData = {};
    
    if (cloned.type === 'craftsmanship') {
      if (!cloned.extraData.features || !Array.isArray(cloned.extraData.features)) {
        cloned.extraData.features = [
          { num: "925 / 585", label: "Благородные сплавы и проба" },
          { num: "100%", label: "Ручной отбор натуральных камней" },
          { num: "Lifetime", label: "Безупречная полировка и сервис" }
        ];
      }
    }
    
    if (cloned.type === 'hero') {
      if (!cloned.extraData.metrics || !Array.isArray(cloned.extraData.metrics)) {
        cloned.extraData.metrics = [
          { num: "925°", label: "Проба & Качество" },
          { num: "100%", label: "Ручной Отбор Камней" },
          { num: "24 ч", label: "Бережная Отправка" }
        ];
      }
    }

    if (cloned.type === 'journal') {
      if (!cloned.extraData.gallery || !Array.isArray(cloned.extraData.gallery)) {
        cloned.extraData.gallery = [
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
      }
      if (!cloned.extraData.accountHandle) {
        cloned.extraData.accountHandle = "@wildrosejewel";
      }
      if (!cloned.extraData.instagramUrl) {
        cloned.extraData.instagramUrl = "https://instagram.com";
      }
    }
    
    setEditingSection(cloned);
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
      
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-badge">CMS</span>
          <h2>Wild Rose Studio</h2>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === 'sections' ? 'active' : ''}`}
            onClick={() => setActiveTab('sections')}
          >
            <Layers size={18} />
            <span>Конструктор Блоков</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} />
            <span>Каталог Товаров ({products.length})</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCart size={18} />
            <span>Заказы & CRM ({orders.length})</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            <FileSpreadsheet size={18} />
            <span>Google Drive / Sheets</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button 
            className="btn btn-secondary exit-admin-btn" 
            onClick={() => {
              window.location.hash = '';
              if (window.location.pathname === '/admin') {
                window.history.pushState({}, '', '/');
              }
              setCurrentView('store');
            }}
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
                    <div>
                      <h4 className="section-name">{section.name}</h4>
                      <span className="section-type-tag">тип: {section.type}</span>
                    </div>
                  </div>

                  <div className="section-card-controls">
                    {/* Lookbook Customizer Button */}
                    {section.type === 'lookbook' && (
                      <button
                        className="control-icon-btn highlight-btn"
                        onClick={() => setEditingLookbookSection(section)}
                        title="Настроить фото и интерактивные точки"
                        style={{ width: 'auto', padding: '0 12px', gap: '6px', color: 'var(--color-rose-deep)', borderColor: 'var(--color-rose-deep)' }}
                      >
                        <SlidersHorizontal size={15} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Настроить точки</span>
                      </button>
                    )}

                    {/* Edit Section Content & Banner Image */}
                    <button
                      className="control-icon-btn"
                      onClick={() => handleOpenEditSection(section)}
                      title="Редактировать баннер и текст секции"
                      style={{ width: 'auto', padding: '0 10px', gap: '5px' }}
                    >
                      <Edit size={14} />
                      <span style={{ fontSize: '0.78rem' }}>Контент</span>
                    </button>

                    {/* Move Up/Down */}
                    <button
                      className="control-icon-btn"
                      disabled={index === 0}
                      onClick={() => moveSection(index, -1)}
                      title="Переместить выше"
                    >
                      <ArrowUp size={16} />
                    </button>

                    <button
                      className="control-icon-btn"
                      disabled={index === sections.length - 1}
                      onClick={() => moveSection(index, 1)}
                      title="Переместить ниже"
                    >
                      <ArrowDown size={16} />
                    </button>

                    {/* Enable / Disable */}
                    <button
                      className={`control-toggle-btn ${section.enabled ? 'active' : ''}`}
                      onClick={() => toggleSection(section.id)}
                      title={section.enabled ? 'Скрыть секцию' : 'Показать секцию'}
                    >
                      {section.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                      <span>{section.enabled ? 'Активен' : 'Скрыт'}</span>
                    </button>
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
                className="btn btn-primary"
                onClick={() => {
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
                    story: ''
                  });
                  setIsAddingProduct(true);
                }}
              >
                <Plus size={16} />
                Добавить изделие
              </button>
            </div>

            {/* Product Modal/Form */}
            {isAddingProduct && (
              <form className="product-edit-modal" onSubmit={handleSaveProduct}>
                <h3>{editingProduct ? 'Редактирование изделия' : 'Новое ювелирное изделие'}</h3>
                
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
                          Размер карточек предпросмотра точно соответствует формату фото в каталоге
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

                <div className="product-form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsAddingProduct(false)}>
                    Отмена
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Сохранить товар
                  </button>
                </div>
              </form>
            )}

            {/* Products Table */}
            <div className="admin-table-wrap">
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
                        <img src={prod.mainImage} alt={prod.title} className="table-thumb" />
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
                          <button className="action-btn edit" onClick={() => handleEditProduct(prod)}>
                            <Edit size={14} />
                          </button>
                          <button className="action-btn delete" onClick={() => deleteProduct(prod.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>Google Service Account JSON Key (Сервисный аккаунт)</h4>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
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

      </main>

      {/* Lookbook Visual Hotspots Editor Modal */}
      {editingLookbookSection && (
        <LookbookEditor
          section={editingLookbookSection}
          onClose={() => setEditingLookbookSection(null)}
        />
      )}

      {/* General Section Content / Banner Editor Modal */}
      {editingSection && (
        <div className="lookbook-editor-overlay" onClick={() => setEditingSection(null)}>
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
              <button className="control-icon-btn" onClick={() => setEditingSection(null)}>
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
              <button className="btn btn-secondary" onClick={() => setEditingSection(null)}>
                Отмена
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  updateSection(editingSection.id, editingSection);
                  setEditingSection(null);
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
