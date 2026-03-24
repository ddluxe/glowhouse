import express from 'express';
import cors from 'cors';
import { router } from './routes.js';

// ============================================================
// SignalForge API Server
// ============================================================

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Log all incoming requests
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  app.use('/api', router);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
  });

  // Global error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Server] Unhandled error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  });

  return app;
}
