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
| [00 - How to Use This Course](00-how-to-use-this-course/) | Method, setup, repo map | Align on how to learn from source and tests |
| [01 - Foundations](01-foundations/) | Layers, boundaries, philosophy | Build the architectural model |
| [02 - pi-ai](02-pi-ai/) | Unified LLM layer | Understand streaming, tools, provider transforms, faux providers |
| [03 - pi-agent-core](03-pi-agent-core/) | Agent loop | Understand turns, tool execution, queues, and lifecycle |
| [04 - pi-tui](04-pi-tui/) | Terminal UI | Understand differential rendering, overlays, focus, and regressions |
| [05 - pi-coding-agent](05-pi-coding-agent/) | Product runtime | Understand runtime assembly, extensions, sessions, compaction, and tree navigation |
| [06 - Cross-Cutting Subsystems](06-cross-cutting-subsystems/) | Event bus, tools, abort, persistence | Understand the systems that span all layers |
| [07 - Capstone](07-capstone/) | Real-flow tracing | Prove deep understanding on real pi flows |
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

- read `00`, `01`, `02`, `03`, `04`
- do all `tests-to-read.md` files in order
- spend most of your time in `05`
- read `06` to connect what you saw in `02`–`05`
- use `07` to trace real production flows end-to-end
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
