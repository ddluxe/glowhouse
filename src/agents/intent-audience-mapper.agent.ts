import { BaseAgent } from './base.agent.js';
import type {
  SignalForgeInput,
  ContentDeconstructorOutput,
  ValueExtractorOutput,
  IntentAudienceMapperOutput,
} from '../types/index.js';

// ============================================================
// Agent 3: Intent & Audience Mapper
// Purpose: Align content to business goals and audience reality.
// Makes decisive, specific calls. No hedging.
// ============================================================

const SYSTEM_PROMPT = `You are an Intent and Audience Mapping Engine.

Your job is to make decisive, specific decisions about who this content is for and what it's trying to achieve. You are a strategist, not a researcher — commit to your calls.

RULES:
- Audience segments must be specific personas, not demographics (e.g. "Early-stage B2B SaaS founders who've tried and failed with content marketing" not "marketing professionals")
- Funnel stage must be ONE of: awareness | consideration | conversion
- Content intent must be ONE of: educate | inspire | sell | provoke
- Messaging angle must be ONE specific angle, stated as a strategic position
- If the user provided context (goal, audience, platforms), weight it heavily

You MUST respond with ONLY valid JSON. No markdown, no explanation, no code blocks.

OUTPUT SCHEMA:
{
  "audience_segments": ["array of 2-3 highly specific audience personas"],
  "funnel_stage": "awareness | consideration | conversion",
  "content_intent": "educate | inspire | sell | provoke",
  "messaging_angle": "single sentence stating the specific strategic angle this content should own"
}`;

export class IntentAudienceMapperAgent extends BaseAgent {
  constructor() {
    super('IntentAudienceMapper');
  }

  async run(
    input: SignalForgeInput,
    deconstructor: ContentDeconstructorOutput,
    valueExtractor: ValueExtractorOutput
  ): Promise<IntentAudienceMapperOutput> {
    const context = {
      original_content: input.raw_content,
      content_type: input.content_type,
      user_context: input.user_context,
      agent_1_output: deconstructor,
      agent_2_output: valueExtractor,
    };

    const userMessage = `${this.buildContextMessage(context)}

Based on all prior analysis, determine the definitive audience and intent mapping. Be decisive. Output valid JSON only.`;

    const rawResponse = await this.callClaude(SYSTEM_PROMPT, userMessage);
    const output = this.extractJSON<IntentAudienceMapperOutput>(rawResponse);

    this.validate(output);
    return output;
  }

  private validate(output: IntentAudienceMapperOutput): void {
    const validFunnelStages = ['awareness', 'consideration', 'conversion'];
    const validIntents = ['educate', 'inspire', 'sell', 'provoke'];

    if (!output.audience_segments?.length)
      throw new Error('[IntentAudienceMapper] audience_segments is empty');
    if (!validFunnelStages.includes(output.funnel_stage))
      throw new Error(`[IntentAudienceMapper] Invalid funnel_stage: ${output.funnel_stage}`);
    if (!validIntents.includes(output.content_intent))
      throw new Error(`[IntentAudienceMapper] Invalid content_intent: ${output.content_intent}`);
    if (!output.messaging_angle)
      throw new Error('[IntentAudienceMapper] messaging_angle is missing');
  }
}
