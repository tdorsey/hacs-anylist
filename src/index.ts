/**
 * Main entry point for HACS Anylist TypeScript Application
 * This file will be the starting point for the TypeScript conversion
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { config } from './config/app';
import { AnylistService } from './services/anylist';
import { healthCheckRouter } from './routes/health';

// Load environment variables
dotenv.config();

const app = express();
const port = config.port || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Performance middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.use('/health', healthCheckRouter);

// API routes will be added here during TypeScript conversion
app.get('/', (req, res) => {
  res.json({
    name: 'HACS Anylist TypeScript Service',
    version: '2.0.0',
    status: 'running',
    environment: process.env.NODE_ENV,
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(port, () => {
  logger.info(`HACS Anylist TypeScript service listening on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Health check available at: http://localhost:${port}/health`);
});

export default app;