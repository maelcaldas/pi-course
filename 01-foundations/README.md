# Module 01: Foundations

This module establishes the architectural model of pi before you dive into implementation details.

## Source-Guided Path

Read these in order:

1. `../pi/README.md`
2. `../pi/packages/ai/README.md`
3. `../pi/packages/agent/README.md`
4. `../pi/packages/tui/README.md`
5. `../pi/packages/coding-agent/README.md`

## The Five Layers

```
+----------------------------------------------------------+
|  pi-coding-agent  |  Interactive CLI, sessions, themes,  |
|                   |  extensions, skills, compaction       |
+-------------------+----------------------------------------+
|  pi-tui           |  Terminal UI, differential rendering,  |
|                   |  overlays, focus, input                |
+-------------------+----------------------------------------+
|  pi-agent-core    |  Agent loop, turns, tool execution,    |
|                   |  queues, lifecycle events              |
+-------------------+----------------------------------------+
|  pi-ai            |  Unified LLM API, provider adaptation, |
|                   |  tools, reasoning, images              |
+-------------------+----------------------------------------+
|  LLM Providers    |  Anthropic, OpenAI, Google, Groq, etc. |
+----------------------------------------------------------+
```

## The Core Boundary Decisions

### 1. Separation of concerns

Each layer knows less than you might expect:

- `pi-ai` knows models, messages, tools, and streaming — not sessions or terminals
- `pi-agent-core` knows turns, tools, and events — not files, settings, or UI
- `pi-tui` knows terminal rendering and focus — not LLMs or sessions
- `pi-coding-agent` assembles a product out of the lower layers

This is the first thing to protect mentally. Most of the repo becomes legible once you stop expecting product behavior to live in the lower packages.

### 2. Events instead of direct coupling

The UI does not own the agent loop. The loop emits events; product layers subscribe.

That means the same loop can drive:

- an interactive TUI
- a print-mode CLI
- JSON/RPC modes
- host applications embedding the SDK

### 3. Session state is a tree, not a transcript string

Pi treats session history as a navigable tree of entries connected by `id` and `parentId`, not as a single append-only conversation.

This choice drives:

- `/tree`
- `/fork`
- `/clone`
- branch summaries
- compaction reload behavior

### 4. Compaction is runtime transformation, not data mutation

Compaction is intentionally lossy in memory, but the full session remains persisted in JSONL.

The important distinction is:

- **runtime context** changes
- **stored history** does not get rewritten into a shorter truth

### 5. Extensibility is a first-order design choice

Pi omits features other tools hardcode because it expects extensions, skills, prompts, and packages to carry much of the product variation.

This is not an afterthought. It is a core architectural value.

## Stable Surface

These are the foundations you should expect to keep paying off throughout the course:

- layered architecture
- event-driven updates
- queue semantics (steering vs follow-up)
- session trees
- compaction as lossy runtime summary
- extension-first philosophy

## Current Implementation Questions to Carry Forward

As you move into later modules, keep asking:

- Where exactly is the boundary between generic runtime and product logic?
- Which parts of the transcript are persisted vs only rendered?
- Where is ordering guaranteed, and where is it only incidental?
- Which features are implemented by composition rather than by deep coupling?

## Before Moving On

Make sure you can explain, without looking at notes:

- why `pi-ai` knows nothing about terminals
- why `AgentMessage` can be richer than raw LLM messages
- why session trees are necessary for pi’s branching model
- why compaction is described as lossy but safe
- why extensibility is a design principle rather than a plugin afterthought
