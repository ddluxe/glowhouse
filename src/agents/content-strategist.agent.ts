import { BaseAgent } from './base.agent.js';
import type {
  SignalForgeInput,
  ContentDeconstructorOutput,
  ValueExtractorOutput,
  IntentAudienceMapperOutput,
  InsightSynthesizerOutput,
  ContentStrategistOutput,
  PlatformType,
} from '../types/index.js';

// ============================================================
// Agent 5: Content Strategist
// Purpose: Convert insights into platform-specific content structures.
// Outputs execution-ready content, not generic suggestions.
// ============================================================

const SYSTEM_PROMPT = `You are a Content Strategist.

You convert strategic insights into structured, platform-ready content. You write actual content — not descriptions of content.

PLATFORM RULES:

LINKEDIN:
- Hook: First line must stop the scroll. Pattern interrupts. Specific, not clever-generic.
- Body: Array of 3-6 items. Each is a standalone paragraph or bullet point. No fluff.
- CTA: Specific action tied to the content intent. Not "follow me for more."
- Visual direction: Specific layout and visual treatment instruction (e.g. "Single image: dark slate background, white Neue Haas Grotesk, one bold statistic as the hero text, creator headshot bottom-right corner")

INSTAGRAM CAROUSEL:
- 5-8 slides. Each has content + visual direction.
- Slide 1 (Hook): Bold claim or question. Must make someone stop.
- Slide 2-N (Value): Each slide delivers ONE insight. Short. No padding.
- Final slide (CTA): Specific action.
- Visual direction per slide must be specific (colors, type treatment, layout)

TIKTOK SCRIPT:
- Hook: First 2 seconds. Visual + audio hook described.
- Script flow: Array of 4-7 beats. Each beat describes what happens on screen + what's said.
- CTA: Specific action, native to TikTok culture.

RULES:
- Write ACTUAL content — real hooks, real copy, real scripts
- Every visual direction must be specific enough for a designer to execute without asking questions
- No generic placeholders like "[your content here]" or "engaging visual"
- If a platform wasn't requested, omit it from the output

You MUST respond with ONLY valid JSON. No markdown, no explanation, no code blocks.

OUTPUT SCHEMA:
{
  "linkedin": {
    "hook": "The exact first line of the post",
    "body": ["paragraph 1", "paragraph 2", "paragraph 3 or bullet points"],
    "cta": "The specific call to action",
    "visual_direction": "Specific, actionable visual description"
  },
  "instagram_carousel": {
    "slides": [
      { "slide_number": 1, "content": "Exact text on this slide", "visual_direction": "Specific visual description" }
    ]
  },
  "tiktok_script": {
    "hook": "Exact opening — what's shown and said in first 2 seconds",
    "script_flow": ["Beat 1: [visual] + [audio]", "Beat 2: [visual] + [audio]"],
    "cta": "Specific end action"
  }
}`;

export class ContentStrategistAgent extends BaseAgent {
  constructor() {
    super('ContentStrategist');
  }

  async run(
    input: SignalForgeInput,
    deconstructor: ContentDeconstructorOutput,
    valueExtractor: ValueExtractorOutput,
    intentMapper: IntentAudienceMapperOutput,
    insightSynthesizer: InsightSynthesizerOutput,
    platforms?: PlatformType[]
  ): Promise<ContentStrategistOutput> {
    const requestedPlatforms = platforms ?? input.user_context?.platform_focus ?? ['linkedin', 'instagram', 'tiktok'];

    const context = {
      original_content: input.raw_content,
      content_type: input.content_type,
      user_context: input.user_context,
      agent_1_deconstructor: deconstructor,
      agent_2_value_extractor: valueExtractor,
      agent_3_intent_mapper: intentMapper,
      agent_4_insight_synthesizer: insightSynthesizer,
    };

    const userMessage = `${this.buildContextMessage(context)}

## Content Generation Instructions

Core message to build from: "${insightSynthesizer.core_message}"

Audience: ${intentMapper.audience_segments.join(', ')}
Funnel stage: ${intentMapper.funnel_stage}
Content intent: ${intentMapper.content_intent}
Messaging angle: ${intentMapper.messaging_angle}

Requested platforms: ${requestedPlatforms.join(', ')}

Generate platform-specific content for ONLY the requested platforms. Write actual content — real copy, real hooks, real scripts. Be specific. Output valid JSON only.`;

    const rawResponse = await this.callClaude(SYSTEM_PROMPT, userMessage);
    const output = this.extractJSON<ContentStrategistOutput>(rawResponse);

    this.validate(output, requestedPlatforms);
    return output;
  }

  private validate(output: ContentStrategistOutput, platforms: PlatformType[]): void {
    if (platforms.includes('linkedin') && output.linkedin) {
      if (!output.linkedin.hook) throw new Error('[ContentStrategist] LinkedIn hook is missing');
      if (!output.linkedin.body?.length)
        throw new Error('[ContentStrategist] LinkedIn body is empty');
    }

    if (platforms.includes('instagram') && output.instagram_carousel) {
      if (!output.instagram_carousel.slides?.length)
        throw new Error('[ContentStrategist] Instagram carousel has no slides');
      if (output.instagram_carousel.slides.length < 3)
        throw new Error('[ContentStrategist] Instagram carousel needs at least 3 slides');
    }

    if (platforms.includes('tiktok') && output.tiktok_script) {
      if (!output.tiktok_script.hook)
        throw new Error('[ContentStrategist] TikTok hook is missing');
      if (!output.tiktok_script.script_flow?.length)
        throw new Error('[ContentStrategist] TikTok script_flow is empty');
    }
  }
}
