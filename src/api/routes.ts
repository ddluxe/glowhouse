import { Router, Request, Response } from 'express';
import { runPipeline, iteratePipeline, generateBrief } from '../orchestration/pipeline.js';
import type { AnalyzeRequest, IterateRequest, BriefRequest } from '../types/index.js';

// ============================================================
// SignalForge API Routes
// ============================================================

export const router = Router();

/**
 * POST /api/analyze
 * Run the full interpretation pipeline on raw content.
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const body = req.body as AnalyzeRequest;

    if (!body.input?.raw_content) {
      return res.status(400).json({
        error: { code: 'MISSING_CONTENT', message: 'raw_content is required' },
      });
    }

    if (!body.input?.content_type) {
      return res.status(400).json({
        error: { code: 'MISSING_TYPE', message: 'content_type is required (video|audio|text|link)' },
      });
    }

    const result = await runPipeline(body.input, body.options);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('[/analyze] Error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({
      error: { code: 'PIPELINE_ERROR', message },
    });
  }
});

/**
 * POST /api/iterate
 * Re-run the pipeline from a specific agent.
 * Used when the user changes tone, audience, or angle.
 *
 * Iteration rules (per Constitution):
 * - Change tone → start_from: content_strategist
 * - Change audience → start_from: intent_mapper
 * - Change angle → start_from: insight_synthesizer
 */
router.post('/iterate', async (req: Request, res: Response) => {
  try {
    const body = req.body as IterateRequest;

    if (!body.context) {
      return res.status(400).json({
        error: { code: 'MISSING_CONTEXT', message: 'context is required' },
      });
    }

    if (!body.start_from) {
      return res.status(400).json({
        error: {
          code: 'MISSING_START',
          message: 'start_from is required (deconstructor|value_extractor|intent_mapper|insight_synthesizer|content_strategist)',
        },
      });
    }

    const validStartPoints = [
      'deconstructor',
      'value_extractor',
      'intent_mapper',
      'insight_synthesizer',
      'content_strategist',
    ];

    if (!validStartPoints.includes(body.start_from)) {
      return res.status(400).json({
        error: { code: 'INVALID_START', message: `Invalid start_from value: ${body.start_from}` },
      });
    }

    const result = await iteratePipeline(body.context, body.start_from, body.options);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('[/iterate] Error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({
      error: { code: 'ITERATION_ERROR', message },
    });
  }
});

/**
 * POST /api/brief
 * Generate the creative brief.
 * MUST only be called after the user has approved content.
 * Triggers Agent 6: Brief Architect.
 */
router.post('/brief', async (req: Request, res: Response) => {
  try {
    const body = req.body as BriefRequest;

    if (!body.context) {
      return res.status(400).json({
        error: { code: 'MISSING_CONTEXT', message: 'context is required' },
      });
    }

    if (!body.approved_content) {
      return res.status(400).json({
        error: {
          code: 'MISSING_APPROVAL',
          message: 'approved_content is required — brief generation is locked until approval',
        },
      });
    }

    if (!body.context.insight_synthesizer || !body.context.intent_mapper) {
      return res.status(400).json({
        error: {
          code: 'INCOMPLETE_PIPELINE',
          message: 'Pipeline must be completed before generating a brief',
        },
      });
    }

    const brief = await generateBrief(body.context, body.approved_content);

    return res.status(200).json({
      success: true,
      data: { brief },
    });
  } catch (err) {
    console.error('[/brief] Error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({
      error: { code: 'BRIEF_ERROR', message },
    });
  }
});

/**
 * GET /api/health
 * Health check.
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'SignalForge Interpretation Engine',
    version: '0.1.0',
    agents: [
      'ContentDeconstructor',
      'ValueExtractor',
      'IntentAudienceMapper',
      'InsightSynthesizer',
      'ContentStrategist',
      'BriefArchitect',
    ],
  });
});
