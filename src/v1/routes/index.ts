import express from 'express';
import healthRoute from './healthRoute.js';
import bankRoute from './bankRoute.js';
import cardRoute from './cardRoute.js';
import clientRoute from './clientRoute.js';
import transactionRoute from './transactionRoute.js';
import finkedaSettingsRoute from './finkedaSettingsRoute.js';

const router = express.Router();

// Version 1 API Routes
router.use('/health', healthRoute);
router.use('/banks', bankRoute);
router.use('/cards', cardRoute);
router.use('/clients', clientRoute);
router.use('/transactions', transactionRoute);
router.use('/finkeda-settings', finkedaSettingsRoute);


export default router;
