import { ContentDeconstructorAgent } from '../agents/content-deconstructor.agent.js';
import { ValueExtractorAgent } from '../agents/value-extractor.agent.js';
import { IntentAudienceMapperAgent } from '../agents/intent-audience-mapper.agent.js';
import { InsightSynthesizerAgent } from '../agents/insight-synthesizer.agent.js';
import { ContentStrategistAgent } from '../agents/content-strategist.agent.js';
import { BriefArchitectAgent } from '../agents/brief-architect.agent.js';
import { validateInsights, validateContentOutput } from './quality-control.js';
import type {
  SignalForgeInput,
  PipelineContext,
  PipelineResult,
  PipelineOptions,
  IntelligenceView,
  StartFromAgent,
  ContentStrategistOutput,
  BriefArchitectOutput,
} from '../types/index.js';

// ============================================================
// SignalForge Interpretation Engine
// Orchestrates the 5-agent analysis pipeline.
// Agents run sequentially with full context preservation.
// ============================================================

const deconstructor = new ContentDeconstructorAgent();
const valueExtractor = new ValueExtractorAgent();
const intentMapper = new IntentAudienceMapperAgent();
const insightSynthesizer = new InsightSynthesizerAgent();
const contentStrategist = new ContentStrategistAgent();
const briefArchitect = new BriefArchitectAgent();

/**
 * Run the full analysis pipeline from scratch.
 */
export async function runPipeline(
  input: SignalForgeInput,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const context: PipelineContext = { input };

  console.log('[Pipeline] Starting full analysis pipeline');

  // Agent 1: Content Deconstructor
  console.log('[Pipeline] Running Agent 1: Content Deconstructor');
  context.deconstructor = await deconstructor.run(input);

  // Agent 2: Value Extractor
  console.log('[Pipeline] Running Agent 2: Value Extractor');
  context.value_extractor = await valueExtractor.run(input, context.deconstructor);

  // Agent 3: Intent & Audience Mapper
  console.log('[Pipeline] Running Agent 3: Intent & Audience Mapper');
  context.intent_mapper = await intentMapper.run(
    input,
    context.deconstructor,
    context.value_extractor
  );

  // Agent 4: Insight Synthesizer
  console.log('[Pipeline] Running Agent 4: Insight Synthesizer');
  context.insight_synthesizer = await insightSynthesizer.run(
    input,
    context.deconstructor,
    context.value_extractor,
    context.intent_mapper
  );

  // Quality check on insights — regenerate once if failing
  const insightCheck = validateInsights(context.insight_synthesizer);
  if (!insightCheck.passed && insightCheck.score < 50) {
    console.log('[Pipeline] Insight quality check failed. Regenerating...');
    console.log('[Pipeline] Issues:', insightCheck.issues);
    context.insight_synthesizer = await insightSynthesizer.run(
      input,
      context.deconstructor,
      context.value_extractor,
      context.intent_mapper
    );
  }

  // Agent 5: Content Strategist
  console.log('[Pipeline] Running Agent 5: Content Strategist');
  context.content_strategist = await contentStrategist.run(
    input,
    context.deconstructor,
    context.value_extractor,
    context.intent_mapper,
    context.insight_synthesizer,
    options.platforms
  );

  // Quality check on content — regenerate once if failing
  const contentCheck = validateContentOutput(context.content_strategist);
  if (!contentCheck.passed && contentCheck.score < 50) {
    console.log('[Pipeline] Content quality check failed. Regenerating...');
    console.log('[Pipeline] Issues:', contentCheck.issues);
    context.content_strategist = await contentStrategist.run(
      input,
      context.deconstructor,
      context.value_extractor,
      context.intent_mapper,
      context.insight_synthesizer,
      options.platforms
    );
  }

  console.log('[Pipeline] Pipeline complete');

  return {
    context,
    intelligence_view: buildIntelligenceView(context),
  };
}

/**
 * Re-run the pipeline from a specific agent.
 * Used for iteration: change tone → re-run from Agent 5, etc.
 */
export async function iteratePipeline(
  context: PipelineContext,
  startFrom: StartFromAgent,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const updatedContext = { ...context };
  const input = context.input;

  console.log(`[Pipeline] Iterating from: ${startFrom}`);

  if (startFrom === 'intent_mapper' || startFrom === 'insight_synthesizer' || startFrom === 'content_strategist') {
    if (!context.deconstructor || !context.value_extractor) {
      throw new Error('Cannot iterate from this point — missing upstream context');
    }
  }

  switch (startFrom) {
    case 'deconstructor':
      updatedContext.deconstructor = await deconstructor.run(input);
      // Fall through to re-run all downstream agents
      updatedContext.value_extractor = await valueExtractor.run(input, updatedContext.deconstructor);
      updatedContext.intent_mapper = await intentMapper.run(input, updatedContext.deconstructor, updatedContext.value_extractor);
      updatedContext.insight_synthesizer = await insightSynthesizer.run(input, updatedContext.deconstructor, updatedContext.value_extractor, updatedContext.intent_mapper);
      updatedContext.content_strategist = await contentStrategist.run(input, updatedContext.deconstructor, updatedContext.value_extractor, updatedContext.intent_mapper, updatedContext.insight_synthesizer, options.platforms);
      break;

    case 'value_extractor':
      updatedContext.value_extractor = await valueExtractor.run(input, context.deconstructor!);
      updatedContext.intent_mapper = await intentMapper.run(input, context.deconstructor!, updatedContext.value_extractor);
      updatedContext.insight_synthesizer = await insightSynthesizer.run(input, context.deconstructor!, updatedContext.value_extractor, updatedContext.intent_mapper);
      updatedContext.content_strategist = await contentStrategist.run(input, context.deconstructor!, updatedContext.value_extractor, updatedContext.intent_mapper, updatedContext.insight_synthesizer, options.platforms);
      break;

    case 'intent_mapper':
      updatedContext.intent_mapper = await intentMapper.run(input, context.deconstructor!, context.value_extractor!);
      updatedContext.insight_synthesizer = await insightSynthesizer.run(input, context.deconstructor!, context.value_extractor!, updatedContext.intent_mapper);
      updatedContext.content_strategist = await contentStrategist.run(input, context.deconstructor!, context.value_extractor!, updatedContext.intent_mapper, updatedContext.insight_synthesizer, options.platforms);
      break;

    case 'insight_synthesizer':
      updatedContext.insight_synthesizer = await insightSynthesizer.run(input, context.deconstructor!, context.value_extractor!, context.intent_mapper!);
      updatedContext.content_strategist = await contentStrategist.run(input, context.deconstructor!, context.value_extractor!, context.intent_mapper!, updatedContext.insight_synthesizer, options.platforms);
      break;

    case 'content_strategist':
      // Tone/style change only — re-run Agent 5 with existing context
      updatedContext.content_strategist = await contentStrategist.run(
        input,
        context.deconstructor!,
        context.value_extractor!,
        context.intent_mapper!,
        context.insight_synthesizer!,
        options.platforms
      );
      break;
  }

  return {
    context: updatedContext,
    intelligence_view: buildIntelligenceView(updatedContext),
  };
}

/**
 * Generate the creative brief.
 * MUST only be called after user approval.
 */
export async function generateBrief(
  context: PipelineContext,
  approvedContent: ContentStrategistOutput
): Promise<BriefArchitectOutput> {
  if (!context.insight_synthesizer || !context.intent_mapper) {
    throw new Error('Cannot generate brief — pipeline has not been run');
  }

  console.log('[Pipeline] Running Agent 6: Brief Architect (post-approval)');
  return briefArchitect.run(context, approvedContent);
}

/**
 * Maps pipeline context to the Content Intelligence View.
 * This is what the UI displays — clean, focused, no raw agent data.
 */
function buildIntelligenceView(context: PipelineContext): IntelligenceView {
  const { deconstructor, value_extractor, intent_mapper, insight_synthesizer, content_strategist } = context;

  if (!insight_synthesizer || !intent_mapper) {
    throw new Error('Cannot build intelligence view — pipeline incomplete');
  }

  // Gather content opportunities from across agent outputs
  const contentOpportunities: string[] = [
    ...(insight_synthesizer.supporting_angles ?? []),
    ...(value_extractor?.value_propositions?.slice(0, 2) ?? []),
  ].slice(0, 5);

  return {
    core_message: insight_synthesizer.core_message,
    key_insights: [
      insight_synthesizer.contrarian_insight,
      ...(deconstructor?.main_ideas?.slice(0, 2) ?? []),
    ].filter(Boolean),
    audience_label: intent_mapper.audience_segments[0] ?? 'General audience',
    intent_label: intent_mapper.content_intent,
    funnel_stage: intent_mapper.funnel_stage,
    content_opportunities: contentOpportunities,
    hook_suggestions: insight_synthesizer.hook_territories ?? [],
  };
}
