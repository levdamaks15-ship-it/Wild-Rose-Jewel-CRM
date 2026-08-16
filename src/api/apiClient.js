// Base API URL: either from env or relative /api (handled by Vite proxy)
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const api = {
  // Products
  getProducts: async () => {
    const res = await fetch(`${API_BASE}/products`);
    return handleResponse(res);
  },
  getProductById: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return handleResponse(res);
  },
  createProduct: async (product) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return handleResponse(res);
  },
  updateProduct: async (id, product) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return handleResponse(res);
  },
  deleteProduct: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Page Sections & Lookbook
  getSections: async () => {
    const res = await fetch(`${API_BASE}/sections`);
    return handleResponse(res);
  },
  reorderSections: async (sections) => {
    const res = await fetch(`${API_BASE}/sections/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections })
    });
    return handleResponse(res);
  },
  updateSection: async (id, sectionData) => {
    const res = await fetch(`${API_BASE}/sections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sectionData)
    });
    return handleResponse(res);
  },

  // Orders
  getOrders: async () => {
    const res = await fetch(`${API_BASE}/orders`);
    return handleResponse(res);
  },
  createOrder: async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return handleResponse(res);
  },
  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  // Site Settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse(res);
  },
  updateSettings: async (settings) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return handleResponse(res);
  },

  // Image Upload & Storage
  uploadImage: async (fileOrBlob, { targetType = 'product', fileName = 'image.webp' } = {}) => {
    const formData = new FormData();
    formData.append('image', fileOrBlob, fileName);
    formData.append('targetType', targetType);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    return handleResponse(res);
  },

  testGoogleDrive: async (driveConfig) => {
    const res = await fetch(`${API_BASE}/upload/test-drive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driveConfig)
    });
    return handleResponse(res);
  }
};
