const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = (extra = {}) => {
  const token = localStorage.getItem('smart_canteen_token');
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Health
  async getHealth() {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      return await res.json();
    } catch (e) {
      return { status: 'OFFLINE', error: e.message };
    }
  },

  // Pickup Slots
  async getSlots() {
    const res = await fetch(`${BASE_URL}/slots`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch slots');
    return data.data || [];
  },

  async togglePickupSlot(id) {
    const res = await fetch(`${BASE_URL}/slots/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to toggle slot');
    return data;
  },

  // Auth
  async login(username, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  // Menu Items (CRUD)
  async getMenu(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.isVeg !== undefined && params.isVeg !== '') query.append('isVeg', params.isVeg);

    const res = await fetch(`${BASE_URL}/menu?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch menu');
    return data.data || [];
  },

  async createMenuItem(itemData) {
    const res = await fetch(`${BASE_URL}/menu`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(itemData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create menu item');
    return data;
  },

  async updateMenuItem(id, updates) {
    const res = await fetch(`${BASE_URL}/menu/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update menu item');
    return data;
  },

  async deleteMenuItem(id) {
    const res = await fetch(`${BASE_URL}/menu/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete menu item');
    return data;
  },

  // Orders
  async getOrders(params = {}) {
    const query = new URLSearchParams();
    if (params.studentId) query.append('studentId', params.studentId);
    if (params.status && params.status !== 'All') query.append('status', params.status);

    const res = await fetch(`${BASE_URL}/orders?${query.toString()}`, {
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
    return data.data || [];
  },

  async placeOrder(orderData) {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to place order');
    return data;
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update status');
    return data;
  },

  async deleteOrder(orderId) {
    const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to cancel order');
    return data;
  },

  async getStats() {
    const res = await fetch(`${BASE_URL}/orders/stats`, {
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
    return data.data;
  },

  async resetData() {
    const res = await fetch(`${BASE_URL}/reset`, { 
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  }
};

