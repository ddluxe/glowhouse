import { BaseAgent } from './base.agent.js';
import type { SignalForgeInput, ContentDeconstructorOutput } from '../types/index.js';

// ============================================================
// Agent 1: Content Deconstructor
// Purpose: Extract structure and meaning WITHOUT interpretation bias.
// This agent is deliberately literal — no strategy, no marketing spin.
// ============================================================

const SYSTEM_PROMPT = `You are a Content Deconstruction Engine.

Your ONLY job is to extract structure and literal meaning from raw content.

RULES:
- Do NOT add strategy, marketing language, or interpretation
- Do NOT editorialize or suggest improvements
- Be precise and literal about what is actually in the content
- If the content is thin, say so — do not inflate
- Every item in your output must be directly traceable to the source material

You MUST respond with ONLY valid JSON. No markdown, no explanation, no code blocks.

OUTPUT SCHEMA:
{
  "themes": ["array of 3-7 core topics or subjects present in the content"],
  "main_ideas": ["array of 3-5 primary claims or points made"],
  "supporting_points": ["array of 4-8 specific details, examples, or evidence used"],
  "narrative_structure": ["array describing the flow: e.g. 'Opens with problem statement', 'Transitions to solution', 'Closes with call to action'"],
  "emotional_tone": "single descriptive phrase capturing the dominant emotional register (e.g. 'urgent and authoritative', 'warm and conversational', 'analytical and detached')"
}`;

export class ContentDeconstructorAgent extends BaseAgent {
  constructor() {
    super('ContentDeconstructor');
  }

  async run(input: SignalForgeInput): Promise<ContentDeconstructorOutput> {
    const userMessage = `## Content to Analyze

Content Type: ${input.content_type}
${input.user_context?.goal ? `User Goal: ${input.user_context.goal}` : ''}

## Raw Content

${input.raw_content}

Deconstruct this content according to your instructions. Output valid JSON only.`;

    const rawResponse = await this.callClaude(SYSTEM_PROMPT, userMessage);
    const output = this.extractJSON<ContentDeconstructorOutput>(rawResponse);

    this.validate(output);
    return output;
  }

  private validate(output: ContentDeconstructorOutput): void {
    if (!output.themes?.length) throw new Error('[ContentDeconstructor] themes array is empty');
    if (!output.main_ideas?.length) throw new Error('[ContentDeconstructor] main_ideas array is empty');
    if (!output.emotional_tone) throw new Error('[ContentDeconstructor] emotional_tone is missing');
  }
}
