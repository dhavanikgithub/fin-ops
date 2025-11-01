import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import { getCurrentEnvironment } from '../config/environment.js';
import { logger } from './logger.js'
dotenv.config();

// Determine schema based on environment
const getSchema = (): string => {
    return getCurrentEnvironment()
};

// Database configuration interface
interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}

// Database configuration
const config: DatabaseConfig = {
    host: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || ''),
    database: process.env.DB_NAME || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    // Connection pool settings
    max: 20, // Maximum number of connections
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(config);

// Set search path to use the appropriate schema
const currentSchema = getSchema();
logger.info(`🗄️  Using database schema: ${currentSchema}`);

// Function to execute query with schema context
const query = async <T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
    const client = await pool.connect();
    try {
        // Set schema for this connection
        await client.query(`SET search_path TO ${currentSchema}`);
        const result = await client.query<T>(text, params);
        return result;
    } catch (error) {
        logger.error('Database query error:', error);
        throw error;
    } finally {
        client.release();
    }
};

// Function to execute transaction with schema context
const transaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Set schema for this transaction
        await client.query(`SET search_path TO ${currentSchema}`);

        const result = await callback(client);

        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Database transaction error:', error);
        throw error;
    } finally {
        client.release();
    }
};

// Function to get a client with schema set
const getClient = async (): Promise<PoolClient> => {
    const client = await pool.connect();
    await client.query(`SET search_path TO ${currentSchema}`);
    return client;
};

// Pool event handlers
pool.on('connect', () => {
    logger.info('📡 New database connection established');
});

pool.on('error', (err: Error) => {
    logger.error('🚨 Unexpected error on idle database client:', err);
});

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
    logger.info('🛑 Shutting down database pool...');
    await pool.end();
    process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export {
    pool,
    query,
    transaction,
    getClient,
    currentSchema,
    getSchema,
    gracefulShutdown
};