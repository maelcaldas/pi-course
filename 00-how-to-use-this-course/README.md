# Module 00: How to Use This Course

This module sets the method and the reading order for the rest of the course.

The intended reader already knows how to read code. The point here is to choose the right order so you build the right mental model from the real repo, not just from simplified explanations.

## Required Setup

Expected directory layout:

```text
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

## Start Here: The 20-Minute System Spine

Before doing anything else, read:

- [`01-system-spine.md`](01-system-spine.md)

That file is the short end-to-end movie of the system. It is intentionally smaller than the capstone worked flows. The goal is to give every later module a shared causal spine.

## Important: The Best Reading Order Is Not Strictly Numeric

The module numbers mostly follow package boundaries. The best learning flow for deep core-runtime understanding does **not** strictly follow the directory numbers.

## Recommended Core Track

If your goal is deep understanding of pi’s core logic, follow this order:

1. Module 00 — start with the system spine
2. Module 01 — foundations / ownership boundaries
3. Module 02 — `pi-ai`
4. Module 03 — `pi-agent-core`
5. Module 05, Part I — runtime assembly + extensions + prompt shaping
6. Module 05, Part II — sessions + tree navigation + compaction
7. Module 06 — cross-cutting consolidation
8. Module 07 — one independent full flow trace

## Recommended Branch Tracks

Take these after the core track, or when you specifically need them:

- Module 04 — `pi-tui` (important, but not on the shortest path to runtime understanding)
- `AgentHarness` / other evolving orchestration surfaces (read after Module 03 first pass, or at the end)

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
- `packages/coding-agent` — product runtime, sessions, extensions, compaction, tree navigation
- `packages/tui` — terminal rendering and focus model (branch track for the core-runtime path)

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
2. Take the **first-pass route** first, if the module provides one
3. Read the linked `tests-to-read.md`
4. Write down 3–5 invariants the module is protecting
5. Do exactly one exercise before moving on
6. Come back later for the **deep-pass route** only after the first pass is stable in your head

## Anti-Patterns

Avoid these if your goal is deep understanding:

- treating package READMEs as complete truth
- skipping tests because the source “already makes sense”
- forcing yourself to read the modules in numeric order when the causal flow suggests otherwise
- treating the coding agent product as if it were the core architecture
- assuming current implementation details are identical to intended long-term direction

## Exit Criteria for Module 00

Before moving to Foundations, you should be able to answer:

- Why does this course require the local `../pi` repo?
- What is the difference between stable surface and evolving direction?
- Why are tests part of the primary learning path?
- What is the prompt-to-persistence spine of the system in one paragraph?
- Why is Module 04 important but still not on the shortest path to core runtime understanding?
