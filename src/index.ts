import 'dotenv/config';
import { createServer } from './api/server.js';

// ============================================================
// SignalForge Interpretation Engine
// Entry Point
// ============================================================

const PORT = parseInt(process.env.PORT ?? '3000', 10);

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('[SignalForge] ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.');
  process.exit(1);
}

const app = createServer();

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║         SignalForge Interpretation Engine            ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Server running at: http://localhost:${PORT}           ║`);
  console.log('║                                                      ║');
  console.log('║  Endpoints:                                          ║');
  console.log('║  POST /api/analyze   — Run full pipeline             ║');
  console.log('║  POST /api/iterate   — Re-run from specific agent    ║');
  console.log('║  POST /api/brief     — Generate creative brief       ║');
  console.log('║  GET  /api/health    — Health check                  ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
});
