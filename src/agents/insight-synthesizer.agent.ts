import { BaseAgent } from './base.agent.js';
import type {
  SignalForgeInput,
  ContentDeconstructorOutput,
  ValueExtractorOutput,
  IntentAudienceMapperOutput,
  InsightSynthesizerOutput,
} from '../types/index.js';

// ============================================================
// Agent 4: Insight Synthesizer
// Purpose: Create strategic clarity and differentiation.
// Uses adaptive thinking — this is the highest-stakes agent.
// Output feeds directly into what the user sees and approves.
// ============================================================

const SYSTEM_PROMPT = `You are an Insight Synthesizer.

You sit above the analysis. Your job is to take everything that has been extracted and distilled, and produce the strategic clarity that turns raw analysis into an angle worth owning.

RULES:
- The core message must be ONE sentence. Clear, specific, powerful. No hedging, no "and also"
- Supporting angles must be distinct — not rephrasing the same point
- The contrarian insight must be genuinely unexpected or counter to conventional wisdom in this space. Not just "X is often overlooked" — actually challenge something
- Hook territories are creative directions, not full hooks. Each should feel like a genuinely different entry point to the content
- Be bold. Generic insights are a failure state.

❌ REJECT patterns like:
- "X is more important than people realize"
- "Most people don't know this, but..."
- "The secret to X is..."
- Any hook territory that could apply to any piece of content

✅ REQUIRE patterns like:
- Specific claims tied to the actual content
- Contrarian positions that name what's wrong with the conventional approach
- Hook territories rooted in the specific emotional tension or knowledge gap in this material

You MUST respond with ONLY valid JSON. No markdown, no explanation, no code blocks.

OUTPUT SCHEMA:
{
  "core_message": "The single most important thing this content communicates — stated as one powerful sentence",
  "supporting_angles": ["2-4 distinct angles that support or complement the core message"],
  "contrarian_insight": "One bold, specific insight that challenges conventional thinking in this space",
  "hook_territories": ["3-5 creative directions — each a different emotional or intellectual entry point to the content"]
}`;

export class InsightSynthesizerAgent extends BaseAgent {
  constructor() {
    super('InsightSynthesizer');
  }

  async run(
    input: SignalForgeInput,
    deconstructor: ContentDeconstructorOutput,
    valueExtractor: ValueExtractorOutput,
    intentMapper: IntentAudienceMapperOutput
  ): Promise<InsightSynthesizerOutput> {
    const context = {
      original_content: input.raw_content,
      content_type: input.content_type,
      user_context: input.user_context,
      agent_1_deconstructor: deconstructor,
      agent_2_value_extractor: valueExtractor,
      agent_3_intent_mapper: intentMapper,
    };

    const userMessage = `${this.buildContextMessage(context)}

You have the full analysis. Now synthesize it into sharp strategic clarity.

The audience is: ${intentMapper.audience_segments.join(', ')}
The intent is: ${intentMapper.content_intent}
The funnel stage is: ${intentMapper.funnel_stage}
The messaging angle is: ${intentMapper.messaging_angle}

Create the core message, supporting angles, a contrarian insight, and hook territories. Be bold and specific. Output valid JSON only.`;

    // Uses adaptive thinking — this agent needs to reason strategically
    const rawResponse = await this.callClaude(SYSTEM_PROMPT, userMessage, { useThinking: true });
    const output = this.extractJSON<InsightSynthesizerOutput>(rawResponse);

    this.validate(output);
    return output;
  }

  private validate(output: InsightSynthesizerOutput): void {
    if (!output.core_message) throw new Error('[InsightSynthesizer] core_message is missing');
    if (output.core_message.split('.').filter(Boolean).length > 2)
      throw new Error('[InsightSynthesizer] core_message must be a single sentence');
    if (!output.supporting_angles?.length)
      throw new Error('[InsightSynthesizer] supporting_angles is empty');
    if (output.supporting_angles.length < 2)
      throw new Error('[InsightSynthesizer] Need at least 2 supporting_angles');
    if (!output.contrarian_insight)
      throw new Error('[InsightSynthesizer] contrarian_insight is missing');
    if (!output.hook_territories?.length)
      throw new Error('[InsightSynthesizer] hook_territories is empty');
    if (output.hook_territories.length < 3)
      throw new Error('[InsightSynthesizer] Need at least 3 hook_territories');
  }
}
