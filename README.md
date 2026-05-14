# Deep Dive into Pi

This course is for developing a deep, systems-level understanding of the `pi` stack.

It is not a standalone substitute for the live `../pi` repository. The course gives you the architecture, the reading order, and the key questions. The live source, docs, and tests provide the authoritative current behavior.

## What This Course Is

- An architecture guide to the full pi stack
- A source-guided deep dive into the real implementation
- A test-guided map of behavioral boundaries and edge cases
- A path to understanding current stable surfaces and current evolving directions

## What This Course Is Not

- A frozen API reference
- A repo-independent tutorial
- A replacement for reading `../pi`
- A contribution checklist disguised as a course

Deep understanding is the goal. Safe contribution should fall out of that.

## Required Local Setup

This course assumes:

- `../pi` is checked out next to `pi-course`
- dependencies for `../pi` are installed
- you are willing to read both source and tests as part of the course

Validate the setup from `pi-course/`:

```bash
npm run typecheck
npm run check:paths
```

If `npm run typecheck` fails because `../pi/node_modules` is missing, install dependencies in `../pi` first.

## Recommended Learning Flow

Important: the directory numbers mostly follow package boundaries. The best learning flow for deep core-runtime understanding is **not** strictly numeric.

### Core track

Follow this if your goal is the shortest path to understanding how pi works end-to-end:

1. [00 - How to Use This Course](00-how-to-use-this-course/)
   - start with [`01-system-spine.md`](00-how-to-use-this-course/01-system-spine.md)
2. [01 - Foundations](01-foundations/)
3. [02 - pi-ai](02-pi-ai/)
4. [03 - pi-agent-core](03-pi-agent-core/)
5. [05 - pi-coding-agent](05-pi-coding-agent/) — Part I: runtime assembly + extensions + prompt shaping
6. [05 - pi-coding-agent](05-pi-coding-agent/) — Part II: sessions + tree navigation + compaction
7. [06 - Cross-Cutting Subsystems](06-cross-cutting-subsystems/) — as consolidation, not first exposure
8. [07 - Capstone](07-capstone/) — one independent full flow trace

### Branch tracks

Take these after the core track, or when you specifically need them:

- [04 - pi-tui](04-pi-tui/) — important UI/rendering branch, but not on the shortest path to runtime understanding
- evolving orchestration surfaces like `AgentHarness` — important, but explicitly still moving

## Study Method

Each module should be approached in this order:

1. Read the conceptual overview in `pi-course`
2. Read the listed source files in `../pi`
3. Read the listed tests as executable specifications
4. Do one focused exercise
5. Write down the invariants you think the module is protecting

## Stability Labels

Throughout the course, reason about three categories separately:

- **Stable surface**: concepts or APIs that appear intentionally supported
- **Current implementation**: how the current code realizes the concept
- **Evolving direction**: active design movement that matters for understanding, but is not fully settled

## Structure

| Module | Topic | Purpose |
| --- | --- | --- |
| [00 - How to Use This Course](00-how-to-use-this-course/) | Method, setup, system spine | Align on how to learn from source and tests, then get one short end-to-end movie of the system |
| [01 - Foundations](01-foundations/) | Layers, boundaries, philosophy | Build the architectural model |
| [02 - pi-ai](02-pi-ai/) | Unified LLM layer | Understand streaming, tools, provider transforms, faux providers |
| [03 - pi-agent-core](03-pi-agent-core/) | Agent loop | Understand turns, tool execution, queues, and lifecycle |
| [04 - pi-tui](04-pi-tui/) | Terminal UI | Understand rendering/focus as a branch track, not the core-runtime spine |
| [05 - pi-coding-agent](05-pi-coding-agent/) | Product runtime | Understand runtime assembly, extensions, sessions, compaction, and tree navigation |
| [06 - Cross-Cutting Subsystems](06-cross-cutting-subsystems/) | Event bus, tools, abort, persistence | Consolidate the cross-layer concerns you first saw in Modules 02, 03, and 05 |
| [07 - Capstone](07-capstone/) | Real-flow tracing | Prove deep understanding on one independent real pi flow |
| [Learner Notes](learner-notes/) | Synthesis | Write down what you understand, per module |
| [Understanding Checklist](UNDERSTANDING-CHECKLIST.md) | Exit criteria | Verify that you actually understand the system |

## Primary Reading Principle

When the course and the live repo appear to disagree, trust the live repo.

In practice, check in this order:

1. package README / docs in `../pi`
2. source file implementing the behavior
3. tests encoding the edge cases

## Suggested Route

If you want the fastest route to real understanding:

- start with the 20-minute system spine in Module 00
- do Module 01 immediately after it
- keep the causal chain intact through Modules 02 → 03 → 05
- treat Module 06 as a consolidation pass, not as a new mountain
- do one independent capstone flow before attempting more
- take Module 04 after the runtime/history story is already stable in your head
- fill in `learner-notes/` as you go; treat empty sections as gaps in understanding

The optional “build mini-pi” work remains useful, but it is no longer the main endpoint of the course.

## What This Course Does Not Cover

This course is intentionally scoped to the core runtime stack. The following are deliberately out of scope. If you need them, read the live repo directly.

- `packages/web-ui` — the web frontend is not part of the core runtime focus
- image generation paths in `pi-ai` (`images.ts`, `images-api-registry.ts`, `providers/images/`)
- the CLI surface in `packages/coding-agent/src/cli/` and the print/RPC modes — mentioned in capstone Flow A but not studied in depth
- provider-specific transport details (Bedrock, Azure, OAuth flows, GitHub Copilot headers)
- the `bun/` runtime adaptation layer in `coding-agent`
- export-html, telemetry, footer/keybinding/theme subsystems
- migration scripts and packaging

These are real and important; they are simply not on the critical path to understanding pi’s architecture.
