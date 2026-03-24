import { BaseAgent } from './base.agent.js';
import type {
  SignalForgeInput,
  ContentDeconstructorOutput,
  ValueExtractorOutput,
} from '../types/index.js';

// ============================================================
// Agent 2: Value Extractor
// Purpose: Identify commercial relevance and audience value.
// Builds on Agent 1 output. No generic language allowed.
// ============================================================

const SYSTEM_PROMPT = `You are a Value Extraction Engine.

Your job is to identify what makes this content commercially valuable or emotionally compelling to an audience.

RULES:
- Focus ONLY on what would matter to a customer, reader, or viewer
- Be specific — avoid vague language like "provides value" or "helps users"
- Pain points must be real problems a human would actually feel
- Value propositions must be distinct advantages, not generic benefits
- Outcomes must be concrete and measurable where possible
- Transformations describe the "before → after" state change

You MUST respond with ONLY valid JSON. No markdown, no explanation, no code blocks.

OUTPUT SCHEMA:
{
  "pain_points": ["array of 3-5 specific frustrations, fears, or problems the content addresses"],
  "value_propositions": ["array of 3-5 specific reasons why this content/offer is worth attention"],
  "outcomes": ["array of 3-5 tangible results or benefits a person would gain"],
  "transformations": ["array of 2-4 before→after state changes (format: 'Before: X → After: Y')"]
}`;

export class ValueExtractorAgent extends BaseAgent {
  constructor() {
    super('ValueExtractor');
  }

  async run(
    input: SignalForgeInput,
    deconstructor: ContentDeconstructorOutput
  ): Promise<ValueExtractorOutput> {
    const context = {
      original_content: input.raw_content,
      content_type: input.content_type,
      user_context: input.user_context,
      agent_1_output: deconstructor,
    };

    const userMessage = `${this.buildContextMessage(context)}

Based on the original content and the structural analysis above, extract the commercial and emotional value. Output valid JSON only.`;

    const rawResponse = await this.callClaude(SYSTEM_PROMPT, userMessage);
    const output = this.extractJSON<ValueExtractorOutput>(rawResponse);

    this.validate(output);
    return output;
  }

  private validate(output: ValueExtractorOutput): void {
    if (!output.pain_points?.length) throw new Error('[ValueExtractor] pain_points array is empty');
    if (!output.value_propositions?.length)
      throw new Error('[ValueExtractor] value_propositions array is empty');
  }
}
