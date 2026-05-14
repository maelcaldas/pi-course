# Understanding Checklist

You deeply understand the pi stack when you can do most of the following without hand-waving.

## Core Track (required for deep runtime understanding)

### Foundations

- Explain why the repo is split into `ai`, `agent`, `tui`, and `coding-agent`
- Explain why extensibility is a design principle rather than an add-on
- Explain why session history is modeled as a tree
- Explain which layer should own a behavior before you explain how the current code implements it

### pi-ai

- Explain the difference between provider identity and API implementation identity
- Explain the full assistant streaming event protocol
- Explain what `transform-messages.ts` is protecting during cross-provider replay
- Explain why faux providers are central to deterministic understanding
- Explain why abort semantics start at the provider boundary but do not end there

### pi-agent-core

- Explain the difference between the inner and outer agent loops
- Explain the role of `AgentMessage` vs raw LLM `Message`
- Explain why tool completion order and transcript order differ in parallel mode
- Explain what the `Agent` wrapper adds beyond raw `agentLoop()`
- Explain what guarantees this layer gives before product policy is layered on top

### pi-coding-agent

- Explain how `createAgentSession()` assembles runtime dependencies
- Explain why runtime/session replacement is a first-class concern
- Explain how `ModelRegistry`, `SettingsManager`, and `AuthStorage` interact
- Explain how `DefaultResourceLoader` merges resources and handles collisions
- Explain how `ExtensionRunner` composes handlers and prompt transformations
- Explain how `SessionManager.buildSessionContext()` reconstructs runtime context
- Explain the difference between compaction, branch summary, and retry

### Cross-cutting consolidation

- Name the three event vocabularies and where each one lives
- Trace one tool call across every layer that touches it
- Trace how abort propagates from caller to provider and back to idle state
- Explain what is persisted, where it is persisted, and why the lower layers do not write JSONL directly

### System-level tracing

- Trace a prompt from user input to final persisted messages
- Trace a tool-using turn including preflight, execution, result ordering, and follow-up turn behavior
- Trace `/tree` navigation with branch summary
- Trace how an extension can change the next run without directly owning the agent loop
- Produce one independent flow note at the same depth as the worked examples

## Branch Tracks (recommended after the core track)

### pi-tui

- Explain how the TUI render cycle works end-to-end
- Explain why overlays are composited rather than rendered separately
- Explain how `CURSOR_MARKER` and focus cooperate to support IME positioning
- Explain when a full redraw is required and why

### Evolving internals

- Explain what `AgentHarness` is trying to make explicit about lifecycle and snapshots
- Explain which parts of that story feel like architecture direction rather than settled API

## Stable vs Evolving

- Name parts of the architecture that feel structurally stable
- Name parts that are clearly current implementation rather than immutable design
- Name at least one evolving direction and explain how you know it is still evolving

If you can do the above, contribution becomes a consequence of understanding rather than the main objective.
