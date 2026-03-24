// ============================================================
// SignalForge Type System
// Single source of truth for all data structures
// ============================================================

// --- Input ---

export type ContentType = 'video' | 'audio' | 'text' | 'link';
export type GoalType = 'awareness' | 'conversion' | 'authority';
export type PlatformType = 'linkedin' | 'instagram' | 'tiktok' | 'twitter' | 'youtube';

export interface UserContext {
  goal?: GoalType;
  audience?: string;
  platform_focus?: PlatformType[];
}

export interface SignalForgeInput {
  raw_content: string;
  content_type: ContentType;
  user_context?: UserContext;
}

// --- Agent 1: Content Deconstructor ---

export interface ContentDeconstructorOutput {
  themes: string[];
  main_ideas: string[];
  supporting_points: string[];
  narrative_structure: string[];
  emotional_tone: string;
}

// --- Agent 2: Value Extractor ---

export interface ValueExtractorOutput {
  pain_points: string[];
  value_propositions: string[];
  outcomes: string[];
  transformations: string[];
}

// --- Agent 3: Intent & Audience Mapper ---

export type FunnelStage = 'awareness' | 'consideration' | 'conversion';
export type ContentIntent = 'educate' | 'inspire' | 'sell' | 'provoke';

export interface IntentAudienceMapperOutput {
  audience_segments: string[];
  funnel_stage: FunnelStage;
  content_intent: ContentIntent;
  messaging_angle: string;
}

// --- Agent 4: Insight Synthesizer ---

export interface InsightSynthesizerOutput {
  core_message: string;
  supporting_angles: string[];
  contrarian_insight: string;
  hook_territories: string[];
}

// --- Agent 5: Content Strategist ---

export interface LinkedInContent {
  hook: string;
  body: string[];
  cta: string;
  visual_direction: string;
}

export interface InstagramSlide {
  slide_number: number;
  content: string;
  visual_direction: string;
}

export interface InstagramCarousel {
  slides: InstagramSlide[];
}

export interface TikTokScript {
  hook: string;
  script_flow: string[];
  cta: string;
}

export interface ContentStrategistOutput {
  linkedin?: LinkedInContent;
  instagram_carousel?: InstagramCarousel;
  tiktok_script?: TikTokScript;
}

// --- Agent 6: Brief Architect ---

export interface DesignDirection {
  typography: string;
  color: string;
  spacing: string;
}

export interface BriefArchitectOutput {
  objective: string;
  core_message: string;
  audience: string;
  tone: string;
  content_breakdown: string[];
  visual_layout: string[];
  design_direction: DesignDirection;
  asset_requirements: string[];
  do: string[];
  dont: string[];
}

// --- Pipeline Context ---
// Accumulates as agents run. Each agent receives the full context.

export interface PipelineContext {
  input: SignalForgeInput;
  deconstructor?: ContentDeconstructorOutput;
  value_extractor?: ValueExtractorOutput;
  intent_mapper?: IntentAudienceMapperOutput;
  insight_synthesizer?: InsightSynthesizerOutput;
  content_strategist?: ContentStrategistOutput;
  brief_architect?: BriefArchitectOutput;
}

// --- Pipeline Run Options ---

export type StartFromAgent =
  | 'deconstructor'
  | 'value_extractor'
  | 'intent_mapper'
  | 'insight_synthesizer'
  | 'content_strategist';

export interface PipelineOptions {
  start_from?: StartFromAgent;
  platforms?: PlatformType[];
}

// --- API Shapes ---

export interface AnalyzeRequest {
  input: SignalForgeInput;
  options?: PipelineOptions;
}

export interface IterateRequest {
  context: PipelineContext;
  start_from: StartFromAgent;
  options?: PipelineOptions;
}

export interface BriefRequest {
  context: PipelineContext;
  approved_content: ContentStrategistOutput;
}

export interface PipelineResult {
  context: PipelineContext;
  intelligence_view: IntelligenceView;
}

// --- Content Intelligence View ---
// Maps pipeline outputs to what the UI displays

export interface IntelligenceView {
  core_message: string;
  key_insights: string[];
  audience_label: string;
  intent_label: ContentIntent;
  funnel_stage: FunnelStage;
  content_opportunities: string[];
  hook_suggestions: string[];
}

// --- Quality Control ---

export interface QualityCheckResult {
  passed: boolean;
  issues: string[];
  score: number; // 0-100
}

// --- Error ---

export interface SignalForgeError {
  code: string;
  message: string;
  agent?: string;
}
