# Module 00: How to Use This Course

This module sets the method for the rest of the course.

The intended reader already knows how to read code. The point here is to choose the right reading order so you build the right mental model from the real repo, not just from simplified explanations.

## Required Setup

Expected directory layout:

```
/workspace/
├── pi/
└── pi-course/
```

Validate from `pi-course/`:

```bash
npm run typecheck
npm run check:paths
```

`npm run typecheck` proves the TypeScript examples still line up with the live repo.

`npm run check:paths` proves file references in the course still point at real files in `../pi`.

## How to Read Pi

Pi is easiest to understand by moving through four layers of evidence:

1. **Conceptual summary** — what problem the layer solves
2. **Source** — where the decisions actually live
3. **Tests** — what invariants the maintainers cared enough to encode
4. **Exercise** — one narrow task that forces you to restate the model in your own words

Do not invert this order. If you start from the largest files in `packages/coding-agent`, you will see mechanics before boundaries.

## Repo Map for This Course

Focus on these packages first:

- `packages/ai` — LLM abstraction, provider normalization, tool-call streaming
- `packages/agent` — generic agent loop, tool execution, queue semantics
- `packages/tui` — terminal rendering and focus model
- `packages/coding-agent` — product runtime, sessions, extensions, compaction, tree navigation

## Stable Surface vs Current Implementation vs Evolving Direction

You should classify what you read.

### Stable surface

These are the concepts you should expect to remain central even if files move:

- layered separation (`pi-ai` / `agent` / `tui` / `coding-agent`)
- event-driven streaming
- JSONL session trees
- compaction as runtime-only lossy summarization
- extension-first product philosophy

### Current implementation

These are the files and mechanisms that implement today’s behavior:

- `packages/agent/src/agent-loop.ts`
- `packages/tui/src/tui.ts`
- `packages/coding-agent/src/core/agent-session.ts`
- `packages/coding-agent/src/core/session-manager.ts`
- `packages/coding-agent/src/core/extensions/runner.ts`

### Evolving direction

These matter for understanding where the architecture is heading:

- `packages/agent/docs/agent-harness.md`
- any source/doc area that explicitly describes not-yet-final lifecycle guarantees

Treat these as important, but do not mistake them for settled APIs.

## How to Use Tests

Tests in this repo are not just verification. They are design documents with executable precision.

Read tests to learn:

- what order events must occur in
- what edge cases are considered first-class
- what kinds of regressions have already happened
- where the implementation has surprising semantics

Separate these classes mentally:

- **deterministic unit tests** — required reading
- **API-key / e2e tests** — optional unless the module explicitly asks for them

## Recommended Study Loop Per Module

Use this loop every time:

1. Read the module README in `pi-course`
2. Open every file listed under “Source-guided path”
3. Read the linked `tests-to-read.md`
4. Write down 3–5 invariants the module is protecting
5. Do exactly one exercise before moving on

## Anti-Patterns

Avoid these if your goal is deep understanding:

- treating package READMEs as complete truth
- skipping tests because the source “already makes sense”
- treating the coding agent product as if it were the core architecture
- assuming current implementation details are identical to intended long-term direction

## Exit Criteria for Module 00

Before moving to Foundations, you should be able to answer:

- Why does this course require the local `../pi` repo?
- What is the difference between stable surface and evolving direction?
- Why are tests part of the primary learning path?
- Which four packages matter most for this course, and why?
