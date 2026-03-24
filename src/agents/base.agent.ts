import Anthropic from '@anthropic-ai/sdk';

// ============================================================
// Base Agent
// All SignalForge agents extend this class.
// Handles Claude API calls, streaming, and JSON extraction.
// ============================================================

export interface AgentCallOptions {
  useThinking?: boolean;
  temperature?: number;
}

export abstract class BaseAgent {
  protected client: Anthropic;
  protected agentName: string;

  constructor(agentName: string) {
    this.agentName = agentName;
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Core Claude call. Streams the response and returns the text content.
   * Uses adaptive thinking for complex synthesis agents.
   */
  protected async callClaude(
    systemPrompt: string,
    userMessage: string,
    options: AgentCallOptions = {}
  ): Promise<string> {
    const { useThinking = false } = options;

    const params: Anthropic.MessageCreateParamsStreaming = {
      model: 'claude-opus-4-6',
      max_tokens: useThinking ? 16000 : 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      stream: true,
    };

    if (useThinking) {
      (params as any).thinking = { type: 'adaptive' };
    }

    const stream = this.client.messages.stream(params as any);
    const message = await stream.finalMessage();

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error(`[${this.agentName}] No text content in Claude response`);
    }

    return textBlock.text;
  }

  /**
   * Extracts JSON from a Claude response.
   * Handles raw JSON, markdown code blocks, and mixed content.
   */
  protected extractJSON<T>(rawText: string): T {
    const text = rawText.trim();

    // Try raw JSON first
    if (text.startsWith('{') || text.startsWith('[')) {
      try {
        return JSON.parse(text) as T;
      } catch {
        // Fall through to extraction
      }
    }

    // Extract from markdown code block
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1]) as T;
      } catch {
        // Fall through
      }
    }

    // Find first JSON object in text
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      try {
        return JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as T;
      } catch {
        // Fall through
      }
    }

    throw new Error(
      `[${this.agentName}] Failed to extract valid JSON from response.\n\nRaw response:\n${rawText.slice(0, 500)}`
    );
  }

  /**
   * Builds a standard context message for agents.
   * Ensures every agent has full visibility into prior outputs.
   */
  protected buildContextMessage(context: Record<string, unknown>): string {
    return `## Pipeline Context (All Prior Outputs)\n\n${JSON.stringify(context, null, 2)}`;
  }
}
