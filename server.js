import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { dataStore } from './data/store.js';

import cookieParser from 'cookie-parser';
import { authenticateJWT, authorizeRoles } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Health & System Info Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Smart Canteen Pre-order System Backend',
    database: getDBStatus(),
    auth: {
      jwt: 'ACTIVE (HS256)',
      hashing: 'bcrypt (10 rounds) & Argon2 compatible',
      rbacRoles: ['admin', 'teacher', 'student', 'worker'],
      httpCodes: {
        unauthenticated: 401,
        forbidden: 403
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Pickup Slots Endpoints
app.get('/api/slots', async (req, res) => {
  try {
    const slots = await dataStore.getPickupSlots();
    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected: Admin/Worker only (Enforces HTTP 401 and 403)
app.patch('/api/slots/:id/toggle', authenticateJWT, authorizeRoles('admin', 'worker'), async (req, res) => {
  try {
    const updated = await dataStore.togglePickupSlot(req.params.id);
    if (!updated) return res.status(404).json({ success: false, message: 'Slot not found' });
    res.json({ 
      success: true, 
      message: `Slot "${updated.label}" is now ${updated.isFull ? 'FULL (Disabled)' : 'AVAILABLE'}`, 
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Demo Data Reset Endpoint - Admin only
app.post('/api/reset', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    await dataStore.resetSeed();
    res.json({ success: true, message: 'Sample canteen data reset successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static assets from dist
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback all non-API routes to index.html for React SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Connect to MongoDB and start HTTP Server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Smart Canteen API Server running at http://localhost:${PORT}`);
    console.log(`📊 Health Endpoint: http://localhost:${PORT}/api/health`);
    console.log(`🍔 Menu API:        http://localhost:${PORT}/api/menu`);
    console.log(`📦 Orders API:      http://localhost:${PORT}/api/orders`);
    console.log(`🔑 Student Demo:    Username: E025015  | Password: 690141`);
    console.log(`👨‍🍳 Worker Demo:     Username: WORKER01 | Password: 690141`);
    console.log(`======================================================\n`);
  });
};

startServer();
