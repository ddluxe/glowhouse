import type { QualityCheckResult, InsightSynthesizerOutput, ContentStrategistOutput, BriefArchitectOutput } from '../types/index.js';

// ============================================================
// Quality Control Layer
// Validates agent outputs before they reach the user.
// Rejects generic, vague, or low-quality responses.
// ============================================================

// Phrases that indicate generic, low-quality outputs
const VAGUE_PATTERNS = [
  /\bengage[d]?\s+(your\s+)?audience\b/i,
  /\buse\s+engaging\s+visuals\b/i,
  /\bkeep\s+it\s+clean\b/i,
  /\bavoid\s+clichés\b/i,
  /\bvalue[\s-]added\b/i,
  /\bthought\s+leader/i,
  /\bcutting[\s-]edge\b/i,
  /\binnovative\s+solution/i,
  /\bseamless\s+experience\b/i,
  /\bempower[s]?\s+users\b/i,
  /\bleverage\s+the\s+power\b/i,
  /\bworld[\s-]class\b/i,
  /\bsecret\s+to\b/i,
  /\bmost\s+people\s+don't\s+know\b/i,
  /\bx\s+is\s+more\s+important\s+than\s+people\s+realize\b/i,
  /\bhere's\s+the\s+thing\b/i,
];

function detectVagueness(text: string): string[] {
  const issues: string[] = [];
  for (const pattern of VAGUE_PATTERNS) {
    if (pattern.test(text)) {
      issues.push(`Generic phrase detected: "${text.match(pattern)?.[0]}"`);
    }
  }
  return issues;
}

function checkStringArray(arr: string[], field: string, minItems: number = 1): string[] {
  const issues: string[] = [];
  if (!arr || arr.length < minItems) {
    issues.push(`${field}: needs at least ${minItems} item(s), got ${arr?.length ?? 0}`);
    return issues;
  }
  for (const item of arr) {
    if (item.length < 10) {
      issues.push(`${field}: item too short to be meaningful: "${item}"`);
    }
    issues.push(...detectVagueness(item));
  }
  return issues;
}

export function validateInsights(output: InsightSynthesizerOutput): QualityCheckResult {
  const issues: string[] = [];

  // Core message quality
  if (!output.core_message || output.core_message.length < 20) {
    issues.push('core_message: too short — must be a substantive, specific sentence');
  }
  issues.push(...detectVagueness(output.core_message ?? ''));

  // Supporting angles
  issues.push(...checkStringArray(output.supporting_angles, 'supporting_angles', 2));

  // Contrarian insight — must actually be contrarian
  if (!output.contrarian_insight || output.contrarian_insight.length < 30) {
    issues.push('contrarian_insight: too short — must be a fully stated contrarian position');
  }
  issues.push(...detectVagueness(output.contrarian_insight ?? ''));

  // Hook territories
  issues.push(...checkStringArray(output.hook_territories, 'hook_territories', 3));

  const score = Math.max(0, 100 - issues.length * 15);

  return {
    passed: issues.length === 0,
    issues,
    score,
  };
}

export function validateContentOutput(output: ContentStrategistOutput): QualityCheckResult {
  const issues: string[] = [];

  if (output.linkedin) {
    if (!output.linkedin.hook || output.linkedin.hook.length < 15) {
      issues.push('LinkedIn hook: too short — must be a compelling, specific opening line');
    }
    issues.push(...detectVagueness(output.linkedin.hook ?? ''));

    if (output.linkedin.visual_direction?.toLowerCase().includes('engaging')) {
      issues.push('LinkedIn visual_direction: contains generic language — must be specific');
    }
    if (output.linkedin.visual_direction?.toLowerCase().includes('relevant image')) {
      issues.push('LinkedIn visual_direction: "relevant image" is not specific enough');
    }
  }

  if (output.instagram_carousel?.slides) {
    for (const slide of output.instagram_carousel.slides) {
      if (!slide.visual_direction || slide.visual_direction.length < 20) {
        issues.push(`Slide ${slide.slide_number}: visual_direction too vague`);
      }
      issues.push(...detectVagueness(slide.content ?? ''));
    }
  }

  if (output.tiktok_script) {
    if (!output.tiktok_script.hook || output.tiktok_script.hook.length < 20) {
      issues.push('TikTok hook: must describe both visual and audio in the first 2 seconds');
    }
    if (output.tiktok_script.script_flow?.length < 3) {
      issues.push('TikTok script_flow: needs at least 3 beats');
    }
  }

  const score = Math.max(0, 100 - issues.length * 12);

  return {
    passed: issues.length === 0,
    issues,
    score,
  };
}

export function validateBrief(output: BriefArchitectOutput): QualityCheckResult {
  const issues: string[] = [];

  // Typography must be specific
  if (
    output.design_direction?.typography?.toLowerCase().includes('bold') &&
    output.design_direction?.typography?.toLowerCase().includes('modern') &&
    !output.design_direction?.typography?.match(/\d+px|\d+pt|grotesk|serif|sans|helvetica|futura|inter|freight|garamond/i)
  ) {
    issues.push('design_direction.typography: must name specific typefaces and sizes');
  }

  // Color must have hex values or very specific description
  if (
    output.design_direction?.color &&
    !output.design_direction.color.match(/#[0-9a-fA-F]{3,6}|rgb\(|hsl\(|pantone|cmyk/i) &&
    !output.design_direction.color.match(/\b(black|white|navy|slate|cream|charcoal|midnight)\b/i)
  ) {
    issues.push('design_direction.color: must specify actual color values or named palette');
  }

  // Do/Don't rules must be specific
  for (const rule of [...(output.do ?? []), ...(output.dont ?? [])]) {
    issues.push(...detectVagueness(rule));
    if (rule.length < 15) {
      issues.push(`Rule too vague: "${rule}"`);
    }
  }

  // Asset requirements must be concrete
  for (const asset of output.asset_requirements ?? []) {
    if (!asset.match(/\d+x\d+|px|pt|@\dx|svg|png|pdf|mp4|webp|jpg/i)) {
      issues.push(`Asset requirement missing specs: "${asset}"`);
    }
  }

  const score = Math.max(0, 100 - issues.length * 10);

  return {
    passed: issues.length === 0,
    issues,
    score,
  };
}
