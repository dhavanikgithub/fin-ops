import express from 'express';
import healthRoute from './healthRoute';
import bankRoute from './bankRoute';
import cardRoute from './cardRoute';
import clientRoute from './clientRoute';
import transactionRoute from './transactionRoute';
import finkedaSettingsRoute from './finkedaSettingsRoute';

const router = express.Router();

// Version 1 API Routes
router.use('/health', healthRoute);
router.use('/banks', bankRoute);
router.use('/cards', cardRoute);
router.use('/clients', clientRoute);
router.use('/transactions', transactionRoute);
router.use('/finkeda-settings', finkedaSettingsRoute);


export default router;
