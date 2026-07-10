import express from 'express';
import { registerUser, loginUser, getMe as getUserMe } from '../controllers/user.controller.js';
import { registerDealer, loginDealer, getMe as getDealerMe, getDealerDispatches, getOpenRequests } from '../controllers/dealer.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// User auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, restrictTo('user'), getUserMe);

// Dealer auth routes
router.post('/dealer/register', registerDealer);
router.post('/dealer/login', loginDealer);
router.get('/dealer/me', protect, restrictTo('dealer'), getDealerMe);
router.get('/dealer/dispatches', protect, restrictTo('dealer'), getDealerDispatches);
router.get('/dealer/open-requests', protect, restrictTo('dealer'), getOpenRequests);

export default router;
