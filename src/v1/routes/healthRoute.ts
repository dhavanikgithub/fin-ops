import express from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = express.Router();

// @route   GET /api/v1/health
// @desc    Health check endpoint
// @access  Public
router.get('/', getHealth);

export default router;
