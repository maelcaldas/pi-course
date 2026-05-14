# Module 05: pi-coding-agent

This is the center of the core track.

It is where the lower layers become “pi” as an interactive coding system.

Do **not** treat this module as one uninterrupted wall. The package is too policy-dense for that. Take it in two passes.

## Read First

1. `../pi/packages/coding-agent/README.md`
2. `../pi/packages/coding-agent/docs/index.md`
3. [`tests-to-read.md`](tests-to-read.md)

## Pass I — Runtime Assembly and Prompt Shaping

Start here.

### Read in this pass

| Item | Why |
| --- | --- |
| [01 - Runtime and Services](01-runtime-and-services.md) | How one `AgentSession` and one replaceable runtime are assembled |
| [`examples/runtime-session-replacement.ts`](examples/runtime-session-replacement.ts) | Smallest concrete example of runtime/session replacement |
| [02 - Extensions and Resource Loading](02-extensions-and-resource-loading.md) | How product behavior is loaded, merged, and chained |
| [`examples/resource-loader-override.ts`](examples/resource-loader-override.ts) | Smallest concrete example of prompt/resource shaping |
| runtime / extensions sections in [`tests-to-read.md`](tests-to-read.md) | Executable specs for merge, precedence, collisions, and lifecycle |

### Stop after Pass I when you can explain

- how an `AgentSession` is constructed
- why runtime/session replacement is a first-class concern
- how model/auth/settings state is resolved in practice
- how `DefaultResourceLoader` and `ExtensionRunner` shape a run before the loop starts
- where product policy begins on top of `pi-agent-core`

## Pass II — Sessions, Trees, and Context Pressure

Only start this once Pass I feels stable.

### Read in this pass

| Item | Why |
| --- | --- |
| [03 - Sessions, Compaction, and Tree Navigation](03-sessions-compaction-and-tree.md) | The product’s history model and runtime context rebuild story |
| [`../07-capstone/flow-c-worked-example.md`](../07-capstone/flow-c-worked-example.md) | Worked narrative for tree navigation with branch summary — read it now, not only at capstone |
| session-history sections in [`tests-to-read.md`](tests-to-read.md) | Deterministic specs for compaction, serialization, and tree semantics |
| [Exercise 02: Compaction Test Walkthrough](exercises/exercise-02-compaction-test-walkthrough.md) | Forces precise reasoning about compaction |
| [Exercise 03: Tree Navigation Test Walkthrough](exercises/exercise-03-tree-navigation-test-walkthrough.md) | Forces precise reasoning about branch summaries and editor text |

### Stop after Pass II when you can explain

- why sessions are trees rather than linear transcripts
- how `SessionManager.buildSessionContext()` reconstructs runtime state
- why compaction is lossy in runtime but safe in persisted history
- how branch summaries preserve abandoned context without rewriting history
- why retry and compaction are adjacent but distinct recovery mechanisms

## Why This Layer Is Harder Than The Others

`packages/coding-agent` contains the highest concentration of product policy:

- what gets persisted
- what gets rendered
- when context gets compacted
- how extensions are discovered and invoked
- how runtime replacement works
- how model/auth/settings state is resolved in practice

Deep understanding here requires reading both source and tests. Summaries alone are not enough.

## Exercises

- [Exercise 01: Custom Tool Extension](exercises/exercise-01-extension-tool.md)
- [Exercise 02: Compaction Test Walkthrough](exercises/exercise-02-compaction-test-walkthrough.md)
- [Exercise 03: Tree Navigation Test Walkthrough](exercises/exercise-03-tree-navigation-test-walkthrough.md)
- [Exercise 04: Resource Loader Walkthrough](exercises/exercise-04-resource-loader.md)

Recommended pacing:

- do Exercise 01 or 04 during Pass I
- do Exercises 02 and 03 during Pass II

## Exit Criteria

Before moving to Module 06, you should be able to trace:

- how an `AgentSession` is constructed
- how a runtime is replaced on new/resume/fork
- how extensions contribute tools, commands, and prompt changes
- how session context is rebuilt from JSONL tree entries
- how compaction and branch summaries alter runtime context without rewriting history
