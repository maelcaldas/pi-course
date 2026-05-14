# Module 06: Cross-Cutting Subsystems

The previous modules followed package boundaries. This module follows concerns that **span** packages and that contributors trip over precisely because they do not live in one place.

If you can hold these four subsystems in your head at the same time, you can reason about almost any change in pi without breaking an invariant you did not know existed.

## The Four Subsystems

| Chapter | Concern | Why it spans layers |
| --- | --- | --- |
| [01 - Event Vocabularies](01-event-vocabularies.md) | Streaming events, agent lifecycle events, product event bus | Three distinct event taxonomies coexist; confusing them is a common bug class |
| [02 - The Tools Subsystem](02-tools-subsystem.md) | `core/tools/` directory, file-mutation queue, output accumulator | Tools are not just `pi-ai` schemas; the product owns real execution policy |
| [03 - Cancellation and AbortSignal](03-cancellation-and-abort.md) | How aborts propagate from UI through agent to provider call | Cancellation is end-to-end or it is broken |
| [04 - Persistence Boundaries](04-persistence-boundaries.md) | Who writes JSONL, when, and what is intentionally not persisted | Persistence is split across `SessionManager`, `AgentSession`, and (evolving) `AgentHarness` |

## How To Read This Module

Unlike modules 02–05, this module is **not** organized around one package. Each chapter pulls together files from multiple packages. Expect to jump between `packages/ai`, `packages/agent`, and `packages/coding-agent` constantly.

Treat each chapter as:

1. one short conceptual frame
2. a curated multi-file reading list
3. a set of "which layer owns this?" questions

## Why This Module Exists

The package-by-package modules can leave you with an unspoken assumption that every concern lives cleanly inside one package. That is false in four important places:

- **Events** are emitted at every layer and re-shaped on the way up.
- **Tools** are *defined* in `pi-ai` shape, *executed* by `pi-agent-core` policy, and *implemented* by `coding-agent` with file/output safety on top.
- **Aborts** must be honored by the provider transport, the loop, and the UI all at once.
- **Persistence** is a product concern that nevertheless reaches into how the agent loop is shaped.

Misreading any of these as "someone else's problem" produces the most common contributor regressions.

## Stable Surface vs Evolving

Most of what is described here is **current implementation**. The boundaries themselves ("events flow up, aborts flow down, persistence belongs to the product") are stable. The exact splits between `Agent`, `AgentSession`, and `AgentHarness` are still moving — see the `AgentHarness` doc you read in Module 03.

## Exit Criteria

Before moving to the capstone, you should be able to answer:

- Name the three event vocabularies and where each one is defined.
- For a given tool (say `edit`), list every layer that touches the call between user input and persisted result.
- Trace what happens to an in-flight provider request when the user presses Esc.
- State which of the following are persisted, and where: assistant text, thinking blocks, tool calls, tool results, model changes, compaction summaries, branch summaries, extension state.
- Identify at least one place where the wrong layer *could* take ownership of a concern, and explain why the current split is preferred.
