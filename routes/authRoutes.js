import express from 'express';
import { login, register, logout, verifyToken, rechargeWallet, getStudents, getBalance } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', loginRateLimiter, login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/verify', authenticateJWT, verifyToken);
router.post('/wallet/recharge', rechargeWallet);
router.get('/students', getStudents);
router.get('/balance/:username', getBalance);

export default router;

