import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import { defaultUsers, defaultMenuItems, defaultOrders, defaultPickupSlots } from './defaultData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// Local in-memory / file cache
let localData = {
  users: [...defaultUsers],
  menuItems: [...defaultMenuItems],
  orders: [...defaultOrders],
  slots: [...defaultPickupSlots]
};

// Try loading persisted file if exists
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    localData = JSON.parse(raw);
    if (!localData.slots) {
      localData.slots = [...defaultPickupSlots];
    }
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(localData, null, 2), 'utf8');
  }
} catch (e) {
  console.warn('Error reading db.json, using defaults:', e.message);
}

const saveLocal = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(localData, null, 2), 'utf8');
  } catch (e) {
    console.error('Error persisting db.json:', e);
  }
};

const isMongooseLive = () => mongoose.connection.readyState === 1;

export const dataStore = {
  // USERS
  async findUserByUsername(username) {
    if (isMongooseLive()) {
      try {
        const u = await User.findOne({ username });
        if (u) return u;
      } catch (err) {
        console.error('Mongoose findUser error:', err.message);
      }
    }
    return localData.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  },

  async createUser(userData) {
    if (isMongooseLive()) {
      try {
        const newUser = await User.create(userData);
        return newUser;
      } catch (err) {
        console.error('Mongoose createUser error:', err.message);
      }
    }
    const exists = localData.users.some(u => u.username.toLowerCase() === userData.username.toLowerCase());
    if (exists) throw new Error('User already exists');
    localData.users.push(userData);
    saveLocal();
    return userData;
  },

  async updateUserBalance(username, delta) {
    if (isMongooseLive()) {
      try {
        const u = await User.findOneAndUpdate(
          { username },
          { $inc: { balance: delta } },
          { new: true }
        );
        if (u) return u.balance;
      } catch (err) {
        console.error('Mongoose updateUserBalance error:', err.message);
      }
    }
    const idx = localData.users.findIndex(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (idx !== -1) {
      const current = Number(localData.users[idx].balance) || 0;
      localData.users[idx].balance = Math.max(0, current + Number(delta));
      saveLocal();
      return localData.users[idx].balance;
    }
    return null;
  },

  async getAllStudents() {
    if (isMongooseLive()) {
      try {
        const students = await User.find({ role: 'student' }).select('-password');
        if (students && students.length > 0) return students;
      } catch (err) {
        console.error('Mongoose getAllStudents error:', err.message);
      }
    }
    return localData.users
      .filter(u => u.role === 'student')
      .map(({ password, ...rest }) => rest);
  },

  // MENU ITEMS (CRUD)
  // Read all
  async getMenuItems() {
    if (isMongooseLive()) {
      try {
        const items = await MenuItem.find().sort({ createdAt: -1 });
        if (items && items.length > 0) return items;
      } catch (err) {
        console.error('Mongoose getMenuItems error:', err.message);
      }
    }
    return localData.menuItems;
  },

  // Read one
  async getMenuItemById(id) {
    if (isMongooseLive()) {
      try {
        const item = await MenuItem.findById(id);
        if (item) return item;
      } catch (err) {
        // May be a local ID
      }
    }
    return localData.menuItems.find(m => m._id === id || m.id === id);
  },

  // Create
  async createMenuItem(itemData) {
    if (isMongooseLive()) {
      try {
        const item = await MenuItem.create(itemData);
        return item;
      } catch (err) {
        console.error('Mongoose createMenuItem error:', err.message);
      }
    }
    const newItem = {
      _id: 'item_' + Date.now(),
      id: 'item_' + Date.now(),
      ...itemData,
      rating: itemData.rating || 4.5,
      createdAt: new Date().toISOString()
    };
    localData.menuItems.unshift(newItem);
    saveLocal();
    return newItem;
  },

  // Update
  async updateMenuItem(id, updates) {
    if (isMongooseLive()) {
      try {
        const updated = await MenuItem.findByIdAndUpdate(id, updates, { new: true });
        if (updated) return updated;
      } catch (err) {
        // Fallback
      }
    }
    const idx = localData.menuItems.findIndex(m => m._id === id || m.id === id);
    if (idx === -1) return null;
    localData.menuItems[idx] = { ...localData.menuItems[idx], ...updates, updatedAt: new Date().toISOString() };
    saveLocal();
    return localData.menuItems[idx];
  },

  // Delete
  async deleteMenuItem(id) {
    if (isMongooseLive()) {
      try {
        const res = await MenuItem.findByIdAndDelete(id);
        if (res) return true;
      } catch (err) {
        // Fallback
      }
    }
    const prevLen = localData.menuItems.length;
    localData.menuItems = localData.menuItems.filter(m => m._id !== id && m.id !== id);
    saveLocal();
    return localData.menuItems.length < prevLen;
  },

  // ORDERS (CRUD)
  // Read all (worker view) or filtered by studentId (student view)
  async getOrders(filter = {}) {
    if (isMongooseLive()) {
      try {
        const q = filter.studentId ? { studentId: filter.studentId } : {};
        const orders = await Order.find(q).sort({ createdAt: -1 });
        if (orders && orders.length >= 0) return orders;
      } catch (err) {
        console.error('Mongoose getOrders error:', err.message);
      }
    }
    let list = [...localData.orders];
    if (filter.studentId) {
      list = list.filter(o => o.studentId && o.studentId.toLowerCase() === filter.studentId.toLowerCase());
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Create Order
  async createOrder(orderData) {
    const orderNumber = 'CAN-' + Math.floor(1000 + Math.random() * 9000);
    const payload = {
      orderNumber,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...orderData
    };

    if (isMongooseLive()) {
      try {
        const order = await Order.create(payload);
        return order;
      } catch (err) {
        console.error('Mongoose createOrder error:', err.message);
      }
    }

    const newOrder = {
      _id: 'ord_' + Date.now(),
      id: 'ord_' + Date.now(),
      ...payload
    };
    localData.orders.unshift(newOrder);
    saveLocal();
    return newOrder;
  },

  // Update Order Status
  async updateOrderStatus(id, status) {
    if (isMongooseLive()) {
      try {
        const updated = await Order.findByIdAndUpdate(id, { status, updatedAt: new Date() }, { new: true });
        if (updated) return updated;
      } catch (err) {
        // Fallback
      }
    }
    const idx = localData.orders.findIndex(o => o._id === id || o.id === id || o.orderNumber === id);
    if (idx === -1) return null;
    localData.orders[idx].status = status;
    localData.orders[idx].updatedAt = new Date().toISOString();
    saveLocal();
    return localData.orders[idx];
  },

  // Delete/Cancel Order
  async deleteOrder(id) {
    if (isMongooseLive()) {
      try {
        await Order.findByIdAndDelete(id);
        return true;
      } catch (err) {
        // Fallback
      }
    }
    const prev = localData.orders.length;
    localData.orders = localData.orders.filter(o => o._id !== id && o.id !== id);
    saveLocal();
    return localData.orders.length < prev;
  },

  // PICKUP SLOTS
  async getPickupSlots() {
    if (!localData.slots || localData.slots.length === 0) {
      localData.slots = [...defaultPickupSlots];
      saveLocal();
    }
    return localData.slots;
  },

  async togglePickupSlot(id) {
    if (!localData.slots) localData.slots = [...defaultPickupSlots];
    const slot = localData.slots.find(s => s.id === id || s.label === id || s.time === id);
    if (!slot) return null;
    slot.isFull = !slot.isFull;
    saveLocal();
    return slot;
  },

  // Reset to default seed
  async resetSeed() {
    localData = {
      users: [...defaultUsers],
      menuItems: [...defaultMenuItems],
      orders: [...defaultOrders],
      slots: [...defaultPickupSlots]
    };
    saveLocal();
    if (isMongooseLive()) {
      try {
        await User.deleteMany({});
        await MenuItem.deleteMany({});
        await Order.deleteMany({});
        await User.insertMany(defaultUsers);
        await MenuItem.insertMany(defaultMenuItems);
        await Order.insertMany(defaultOrders);
      } catch (err) {
        console.error('Mongoose seed error:', err.message);
      }
    }
    return true;
  }
};
