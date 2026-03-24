import { BaseAgent } from './base.agent.js';
import type {
  PipelineContext,
  ContentStrategistOutput,
  BriefArchitectOutput,
} from '../types/index.js';

// ============================================================
// Agent 6: Brief Architect
// Triggered ONLY after user approval.
// Purpose: Translate approved content into an execution-ready creative brief.
// Must feel like a senior creative director wrote it.
// ============================================================

const SYSTEM_PROMPT = `You are a Creative Brief Architect.

You write creative briefs that designers can execute without a single follow-up question. You write like a senior creative director who has been burned by vague briefs enough times to never write one again.

RULES:
- Every statement must be specific enough to design from
- Visual layout instructions must describe actual layouts, not feelings
- Design system guidance must reference real typographic and color choices
- Do/Don't rules must be concrete — no "avoid clichés" or "keep it clean"
- Asset requirements must list actual deliverables with dimensions

❌ REJECT outputs like:
- "Use bold, modern typography" → too vague
- "Choose colors that match the brand" → useless
- "Create engaging visuals" → meaningless
- "Avoid using stock photos" → obvious

✅ REQUIRE outputs like:
- "Neue Haas Grotesk Display, 96px, weight 700, tracked -0.02em, left-aligned"
- "Background: #0A0A0A. Primary text: #F5F5F5. Accent: single hex only — derive from the content's dominant emotional color"
- "No more than 12 words per slide. Test it: if you can't read it in 2 seconds, cut it."

You MUST respond with ONLY valid JSON. No markdown, no explanation, no code blocks.

OUTPUT SCHEMA:
{
  "objective": "One sentence: what does this creative execution need to achieve?",
  "core_message": "The single message this design must communicate",
  "audience": "Who this is for — specific enough to picture one person",
  "tone": "3-4 adjectives + one reference: e.g. 'Direct, urgent, minimal — think WSJ Op-Ed meets product launch'",
  "content_breakdown": ["Each content piece to produce, in order of priority"],
  "visual_layout": ["Specific layout instructions for each content piece"],
  "design_direction": {
    "typography": "Specific typeface, weights, sizes, and usage rules",
    "color": "Specific hex values or palette description with usage rules",
    "spacing": "Specific margin, padding, and density rules"
  },
  "asset_requirements": ["Each deliverable with format, dimensions, and specs"],
  "do": ["5-8 specific, actionable rules for what to do"],
  "dont": ["5-8 specific, concrete rules for what not to do"]
}`;

export class BriefArchitectAgent extends BaseAgent {
  constructor() {
    super('BriefArchitect');
  }

  async run(
    context: PipelineContext,
    approvedContent: ContentStrategistOutput
  ): Promise<BriefArchitectOutput> {
    const fullContext = {
      original_input: context.input,
      agent_1_deconstructor: context.deconstructor,
      agent_2_value_extractor: context.value_extractor,
      agent_3_intent_mapper: context.intent_mapper,
      agent_4_insight_synthesizer: context.insight_synthesizer,
      approved_content: approvedContent,
    };

    const userMessage = `${this.buildContextMessage(fullContext)}

## Brief Generation Instructions

The user has APPROVED the content above. Now generate the execution-ready creative brief.

Core message to brief around: "${context.insight_synthesizer?.core_message}"
Audience: ${context.intent_mapper?.audience_segments.join(', ')}
Tone derived from: "${context.insight_synthesizer?.contrarian_insight}"

Write a brief that a designer can execute tomorrow without asking a single question. Be specific, directive, and non-generic. Output valid JSON only.`;

    // Uses adaptive thinking — this is the most complex, highest-stakes output
    const rawResponse = await this.callClaude(SYSTEM_PROMPT, userMessage, { useThinking: true });
    const output = this.extractJSON<BriefArchitectOutput>(rawResponse);

    this.validate(output);
    return output;
  }

  private validate(output: BriefArchitectOutput): void {
    const requiredFields: (keyof BriefArchitectOutput)[] = [
      'objective',
      'core_message',
      'audience',
      'tone',
      'content_breakdown',
      'visual_layout',
      'design_direction',
      'asset_requirements',
      'do',
      'dont',
    ];

    for (const field of requiredFields) {
      if (!output[field]) {
        throw new Error(`[BriefArchitect] Required field missing: ${field}`);
      }
    }

    if (!output.design_direction.typography)
      throw new Error('[BriefArchitect] design_direction.typography is missing');
    if (!output.design_direction.color)
      throw new Error('[BriefArchitect] design_direction.color is missing');

    if (!output.do?.length || output.do.length < 3)
      throw new Error('[BriefArchitect] Need at least 3 do rules');
    if (!output.dont?.length || output.dont.length < 3)
      throw new Error('[BriefArchitect] Need at least 3 dont rules');
  }
}
