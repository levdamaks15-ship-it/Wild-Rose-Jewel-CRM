import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialProducts, initialPageSections, initialSiteSettings } from '../data/initialData';
import { api } from '../api/apiClient';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Loading & Sync States
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // Products State
  const [products, setProducts] = useState(initialProducts);

  // Homepage Sections State
  const [sections, setSections] = useState(initialPageSections);

  // Site Settings & Integrations
  const [settings, setSettings] = useState(initialSiteSettings);

  // Cart State (Persisted in LocalStorage for client cart convenience)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('wrj_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Orders State (for CRM)
  const [orders, setOrders] = useState([]);

  // Quick View Product Modal State
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Cart Drawer open/close
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Current Active View ('store' or 'admin')
  const [currentView, setCurrentView] = useState('store');

  // Active Filter in Catalog
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [gridMode, setGridMode] = useState('compact'); // 'compact' (4-col) or 'editorial' (2-col)

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('wrj_cart', JSON.stringify(cart));
  }, [cart]);

  // Initial Fetch Data from Backend DB
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setSyncError(null);
    try {
      const [fetchedProducts, fetchedSections, fetchedSettings, fetchedOrders] = await Promise.allSettled([
        api.getProducts(),
        api.getSections(),
        api.getSettings(),
        api.getOrders()
      ]);

      if (fetchedProducts.status === 'fulfilled' && Array.isArray(fetchedProducts.value) && fetchedProducts.value.length > 0) {
        setProducts(fetchedProducts.value);
      }
      if (fetchedSections.status === 'fulfilled' && Array.isArray(fetchedSections.value) && fetchedSections.value.length > 0) {
        setSections(fetchedSections.value);
      }
      if (fetchedSettings.status === 'fulfilled' && fetchedSettings.value && Object.keys(fetchedSettings.value).length > 0) {
        setSettings(fetchedSettings.value);
      }
      if (fetchedOrders.status === 'fulfilled' && Array.isArray(fetchedOrders.value)) {
        setOrders(fetchedOrders.value);
      }
    } catch (err) {
      console.warn('Backend API connection warning (using offline/initial state):', err);
      setSyncError('Работа в автономном режиме. Данные загружены локально.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cart Actions
  const addToCart = (product, selectedSize = null) => {
    const size = selectedSize || (product.sizes && product.sizes[0]) || 'Standard';
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.size === size);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id, size) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.size === size)));
  };

  const updateCartQuantity = (id, size, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === id && item.size === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => setCart([]);

  // Create Order (Saves to DB & triggers Google Sheets)
  const createOrder = async (orderData) => {
    setIsSyncing(true);
    const newOrderPayload = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      items: cart,
      total: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
      status: 'new',
      ...orderData
    };

    try {
      const savedOrder = await api.createOrder(newOrderPayload);
      setOrders(prev => [savedOrder, ...prev]);
      clearCart();
      setIsCartOpen(false);
      return savedOrder;
    } catch (err) {
      console.warn('API createOrder failed, falling back to local state:', err);
      // Fallback local save
      setOrders(prev => [newOrderPayload, ...prev]);
      clearCart();
      setIsCartOpen(false);
      return newOrderPayload;
    } finally {
      setIsSyncing(false);
    }
  };

  // CMS Section Management
  const moveSection = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSections(updated);

    try {
      setIsSyncing(true);
      await api.reorderSections(updated);
    } catch (err) {
      console.warn('Failed to sync section reordering to DB:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleSection = async (id) => {
    const targetSec = sections.find(s => s.id === id);
    if (!targetSec) return;
    const newEnabled = !targetSec.enabled;

    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: newEnabled } : s))
    );

    try {
      setIsSyncing(true);
      await api.updateSection(id, { enabled: newEnabled });
    } catch (err) {
      console.warn('Failed to sync section toggle to DB:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateSection = async (id, fields) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, ...fields } : s))
    );

    try {
      setIsSyncing(true);
      const updated = await api.updateSection(id, fields);
      setSections(prev =>
        prev.map(s => (s.id === id ? { ...s, ...updated } : s))
      );
    } catch (err) {
      console.warn('Failed to sync section update to DB:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Products CRUD
  const addProduct = async (product) => {
    setIsSyncing(true);
    try {
      const created = await api.createProduct(product);
      setProducts(prev => [created, ...prev]);
    } catch (err) {
      console.warn('API addProduct failed, saving locally:', err);
      const fallbackProd = {
        ...product,
        id: `wr-${Date.now().toString().slice(-4)}`
      };
      setProducts(prev => [fallbackProd, ...prev]);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateProduct = async (id, fields) => {
    setIsSyncing(true);
    try {
      const updated = await api.updateProduct(id, fields);
      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, ...updated } : p))
      );
    } catch (err) {
      console.warn('API updateProduct failed, updating locally:', err);
      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, ...fields } : p))
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteProduct = async (id) => {
    setIsSyncing(true);
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.warn('API deleteProduct failed, deleting locally:', err);
      setProducts(prev => prev.filter(p => p.id !== id));
    } finally {
      setIsSyncing(false);
    }
  };

  // Update Settings
  const saveSettings = async (newSettings) => {
    setSettings(newSettings);
    try {
      setIsSyncing(true);
      await api.updateSettings(newSettings);
    } catch (err) {
      console.warn('Failed to sync settings to DB:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isLoading,
        isSyncing,
        syncError,
        fetchData,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        sections,
        moveSection,
        toggleSection,
        updateSection,
        settings,
        setSettings: saveSettings,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        orders,
        createOrder,
        quickViewProduct,
        setQuickViewProduct,
        isCartOpen,
        setIsCartOpen,
        currentView,
        setCurrentView,
        selectedCategory,
        setSelectedCategory,
        gridMode,
        setGridMode
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
