import express from 'express';
import profilerClientRoute from './profilerClientRoute.js';
import profilerBankRoute from './profilerBankRoute.js';
import profilerProfileRoute from './profilerProfileRoute.js';
import profilerTransactionRoute from './profilerTransactionRoute.js';

const router = express.Router();

// Profiler API Routes
router.use('/profiler/clients', profilerClientRoute);
router.use('/profiler/banks', profilerBankRoute);
router.use('/profiler/profiles', profilerProfileRoute);
router.use('/profiler/transactions', profilerTransactionRoute);

export default router;