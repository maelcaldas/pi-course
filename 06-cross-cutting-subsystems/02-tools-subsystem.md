# 06.02 The Tools Subsystem

Tools in pi are not just "schemas you pass to an LLM". They are a layered subsystem with separate responsibilities at every level.

## The Three Layers of "Tool"

| Layer | What it owns |
| --- | --- |
| `pi-ai` | Tool **schema** (TypeBox), validation, streaming representation of a tool call |
| `pi-agent-core` | Tool **execution policy**: preflight, parallel vs sequential, result ordering, lifecycle events |
| `pi-coding-agent` | Tool **implementations** with file/output safety: `bash`, `edit`, `read`, `find`, `grep`, `ls`, plus extension-contributed tools |

All three meet in one runtime call. If you only know one layer, you will misattribute bugs.

## Source-Guided Path

1. `../pi/packages/ai/src/types.ts` — `Tool`, `ToolCall`, `ToolResult` shapes
2. `../pi/packages/agent/src/agent-loop.ts` — search for tool preflight, parallel/sequential branches, result append order
3. `../pi/packages/coding-agent/src/core/tools/index.ts` — the registry of built-in product tools
4. `../pi/packages/coding-agent/src/core/tools/bash.ts` — a non-trivial tool with output streaming
5. `../pi/packages/coding-agent/src/core/tools/edit.ts` and `edit-diff.ts` — mutation tool with diffing
6. `../pi/packages/coding-agent/src/core/tools/file-mutation-queue.ts` — serialization of file mutations across concurrent calls
7. `../pi/packages/coding-agent/src/core/tools/output-accumulator.ts` — large-output policy

## Tests

- `../pi/packages/coding-agent/test/tools.test.ts`
- `../pi/packages/coding-agent/test/tool-execution-component.test.ts`
- `../pi/packages/coding-agent/test/file-mutation-queue.test.ts`
- `../pi/packages/coding-agent/test/edit-tool-no-full-redraw.test.ts`

## Why The File-Mutation Queue Exists

Parallel tool execution (Module 03) is great for read-only tools and bad for concurrent writes to the same file. The file-mutation queue is the concrete answer: tools that mutate the filesystem are serialized through one queue while read-only tools remain parallel.

This is the cleanest example in the repo of "the agent loop gives you parallelism; the product layer gives you safety on top".

## Why The Output Accumulator Exists

A `bash` call can produce megabytes. The agent loop does not care; the LLM context budget very much does, and the TUI rendering path even more. The output accumulator is the policy boundary that decides what becomes the persisted `toolResult` and what becomes UI-only streamed output.

## Reading Questions

- For a single `edit` call, list every layer that touches it from streaming `toolcall_*` to persisted `toolResult`.
- Where is the decision "this tool is parallel-safe" actually encoded? Is it per-tool, per-call, or per-runtime?
- What happens if two parallel tools both try to write the same file?
- What policy converts megabyte-sized stdout into something safe for the LLM context?
- Why are extension-contributed tools registered through the product layer rather than directly into `pi-ai`?

## What To Be Able To Explain

- The split: schema (`pi-ai`), execution (`pi-agent-core`), implementation + safety (`coding-agent`).
- Why parallelism lives in `pi-agent-core` but mutation serialization lives in `coding-agent`.
- Why `toolResult` content can differ from what the user saw streamed in the UI.
- Why an extension cannot bypass the product layer to register a tool directly with the agent loop — and what would break if it could.
