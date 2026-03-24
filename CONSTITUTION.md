# SignalForge Constitution
## The Authoritative Reference for All Build Decisions

> This document is the source of truth. Every architectural decision, agent prompt, UI choice, and product feature must be evaluated against this constitution. When in doubt, return here.

---

## 1. Product Vision

**Codename:** SignalForge
**Category:** AI-Powered Content Intelligence & Creative Operations Platform

### Core Idea
Transform raw, unstructured content into:
- Strategically aligned content outputs
- Approved creative direction
- Execution-ready creative briefs

### The Gap We Eliminate
> Idea → Strategy → Design Execution

### Problem Statement
Modern marketing and design workflows are broken:
- Poor content repurposing quality
- Lack of strategic clarity
- Weak or inconsistent creative briefs
- Misalignment between marketing and design teams
- Excessive revision cycles

### Core Insight
Most tools **generate** content. SignalForge must:
> Understand → Refine → Align → Translate → Execute

### Product Promise
> "Turn raw content into a fully structured, approved, and execution-ready content system—without guesswork."

---

## 2. System Pipeline (The Law)

```
1. Content Input Layer
2. Interpretation Engine (Multi-Agent System) ← CORE INTELLIGENCE
3. Content Intelligence View
4. Content Concept Generation
5. Review & Iteration Layer
6. Approval Layer
7. Creative Brief Generator
8. Export / Integration Layer
```

---

## 3. User Types

### Primary (build for these first)
- Marketing teams
- Content strategists
- Founders / personal brands

### Secondary
- Designers
- Creative directors
- Agencies

### Jobs To Be Done
- "Help me figure out what content I should create from this"
- "Make sure this content is strategically sound"
- "Give my design team clear direction"
- "Reduce back-and-forth and revisions"

---

## 4. Core System Components

### 4.1 Content Input Layer
**Inputs:** Video (upload/link), Audio, Text/documents, URLs

**Optional Metadata:**
- Campaign goal
- Target audience
- Platform preference

### 4.2 Interpretation Engine (Multi-Agent System)
**This is the CORE INTELLIGENCE LAYER.**

Architecture requirements:
- Modular agent-based system
- Each agent has a clearly defined, single role
- Outputs MUST be structured JSON
- Each agent receives ALL prior agent outputs

#### Agent 1: Content Deconstructor
- **Purpose:** Extract structure and meaning (no interpretation)
- **Outputs:** Key themes, main ideas, supporting points, narrative structure, emotional tone

#### Agent 2: Value Extractor
- **Purpose:** Identify commercial relevance
- **Outputs:** Pain points, value propositions, outcomes, transformation insights

#### Agent 3: Intent & Audience Mapper
- **Purpose:** Align to business goals
- **Outputs:** Audience segments, funnel stage, content intent, messaging angle

#### Agent 4: Insight Synthesizer
- **Purpose:** Create clarity and differentiation
- **Outputs:** Core message (1 sentence), supporting angles (2-4), contrarian insights, hook territories

#### Agent 5: Content Strategist
- **Purpose:** Generate structured content outputs
- **Outputs:** Platform-specific content (LinkedIn, Instagram carousel, TikTok script) with hooks, body structure, CTA, visual direction

#### Agent 6: Brief Architect (Post-Approval Only)
- **Purpose:** Translate approved content into execution-ready brief
- **Outputs:** Full creative brief (see section 4.7)

### 4.3 Content Intelligence View
**Must display:**
- Core message
- Key insights
- Audience + intent
- Content opportunities
- Suggested hooks

**Requirement:** Clean, high-trust UI. No overwhelming data.

### 4.4 Content Concept Generation
**Output types:** LinkedIn posts, Instagram carousels, Short-form video scripts

**Each output includes:** Hook, Body structure, CTA, Visual guidance

### 4.5 Review & Iteration Layer
- Edit tone
- Regenerate sections
- Swap angles
- Adjust audience

**Iteration Logic (ENFORCED):**
- Change tone → Re-run Agent 5 only
- Change audience → Re-run Agent 3 → 5
- Change angle → Re-run Agent 4 → 5

### 4.6 Approval Layer
Actions: Approve / Request changes / Regenerate

**Critical:** Approval LOCKS upstream outputs and UNLOCKS Brief Architect

### 4.7 Creative Brief Generator (Agent 6: Brief Architect)
**Triggered ONLY after approval.**

Output structure:
1. Objective
2. Core Message
3. Audience Definition
4. Tone & Emotional Direction
5. Content Breakdown
6. Visual Layout Instructions
7. Design System Guidance
8. Asset Requirements
9. Do / Don't Rules

**Non-negotiable:** Must feel like a senior creative director wrote it. No generic language.

### 4.8 Export Layer
- PDF
- Notion-ready doc
- Figma-ready structure (future)

---

## 5. AI System Design Principles (IMMUTABLE)

### 1. Structured Outputs Only
All agents MUST return structured JSON. No free-form text responses.

### 2. Opinionated Outputs
❌ Bad: "Use engaging visuals"
✅ Good: "Use high-contrast dark background with bold serif headline"

### 3. Context Preservation
Every agent receives the original input AND all prior agent outputs.

### 4. Deterministic Layers
Low temperature for consistency. Reduce randomness.

### 5. Human-in-the-Loop
User must: See insights → Approve direction → Control outputs.
Never automate past the approval gate.

---

## 6. Technical Architecture

### Frontend
- React / React Native (Expo)
- Modular dashboard UI
- State-driven workflow

### Backend
- Node.js / TypeScript
- API orchestration layer

### AI Layer
- Claude (via Anthropic API)
- `claude-opus-4-6` — primary model
- Adaptive thinking for synthesis/brief agents
- Streaming for all long-output agents
- Prompt chaining with JSON context preservation

### Storage
- User inputs
- Generated outputs
- Session memory (pipeline state)

---

## 7. Success Metrics

**Core:**
- Time to first "valuable output"
- Approval rate
- Reduction in revision cycles
- Output usage rate

**Business:**
- Conversion to paid
- Retention (weekly usage)
- Team expansion

---

## 8. MVP Scope

### Must Include
- Content upload / input
- Interpretation engine (all 5 analysis agents)
- Content Intelligence View
- Content generation (LinkedIn, Instagram, TikTok)
- Approval layer
- Creative brief generation (Brief Architect)

### Exclude for MVP
- Full design rendering engine
- Deep integrations (Figma, Notion, CMS)
- Advanced analytics

---

## 9. Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Generic outputs | Strong prompt engineering + multi-agent validation + quality control layer |
| User overwhelm | Progressive disclosure UI |
| Poor briefs | Strict formatting + constraints + quality gate |

---

## 10. Positioning

**Category:** Creative Operations AI

**Not:** "AI content generator"
**Instead:** "From raw content → to execution-ready marketing systems"

**Differentiator:** "We don't just generate content—we ensure what gets created is strategically right and execution-ready."

---

## 11. Future Expansion

- Automated design generation
- Performance feedback loops
- Brand voice memory systems
- Team collaboration workflows
- Real-time content optimization

---

## Final Principle

> This product wins if it becomes the system teams trust **BEFORE** anything gets designed or published. Not after.

---

*This constitution governs all build decisions. Changes require explicit justification against the product vision.*
