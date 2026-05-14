# Module 05: pi-coding-agent

This is the product layer. It is where the lower layers become “pi” as an interactive coding system.

The module is intentionally split. A single summary page is too compressed for the complexity in this package.

## Read First

1. `../pi/packages/coding-agent/README.md`
2. `../pi/packages/coding-agent/docs/index.md`
3. [`tests-to-read.md`](tests-to-read.md)

## Deep-Dive Chapters

| Chapter | Focus |
| --- | --- |
| [01 - Runtime and Services](01-runtime-and-services.md) | `createAgentSession`, runtime creation, session replacement, auth/model/settings infrastructure |
| [02 - Extensions and Resource Loading](02-extensions-and-resource-loading.md) | `DefaultResourceLoader`, `ExtensionRunner`, prompt assembly, resource precedence, extension lifecycle |
| [03 - Sessions, Compaction, and Tree Navigation](03-sessions-compaction-and-tree.md) | JSONL tree model, `SessionManager`, branch summaries, compaction, retry interplay |

## Why This Layer Is Harder Than The Others

`packages/coding-agent` contains the highest concentration of product policy:

- what gets persisted
- what gets rendered
- when context gets compacted
- how extensions are discovered and invoked
- how runtime replacement works
- how model/auth/settings state is resolved in practice

Deep understanding here requires reading both source and tests. Summaries alone are not enough.

## Existing Hands-On Exercise

- [Exercise 01: Custom Tool Extension](exercises/exercise-01-extension-tool.md)

## New Reading Exercises

- [Exercise 02: Compaction Test Walkthrough](exercises/exercise-02-compaction-test-walkthrough.md)
- [Exercise 03: Tree Navigation Test Walkthrough](exercises/exercise-03-tree-navigation-test-walkthrough.md)
- [Exercise 04: Resource Loader Walkthrough](exercises/exercise-04-resource-loader.md)

## Exit Criteria

Before moving to the capstone, you should be able to trace:

- how an `AgentSession` is constructed
- how a runtime is replaced on new/resume/fork
- how extensions contribute tools, commands, and prompt changes
- how session context is rebuilt from JSONL tree entries
- how compaction and branch summaries alter runtime context without rewriting history
