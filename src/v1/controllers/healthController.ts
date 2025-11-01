import { Request, Response } from 'express';
import PACKAGE_CONFIG from '../../config/packageInfo.js';

export const getHealth = (req: Request, res: Response): void => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: PACKAGE_CONFIG.ENVIRONMENT,
        version: PACKAGE_CONFIG.VERSION,
        apiVersion: 'v1'
    });
};

export const getApiInfo = (req: Request, res: Response): void => {
    res.json({
        ...PACKAGE_CONFIG.APP_INFO,
        endpoints: {
            health_v1: '/api/v1/health',
        }
    });
};