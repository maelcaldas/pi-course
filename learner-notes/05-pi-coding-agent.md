# Notes: 05 pi-coding-agent

## How `createAgentSession()` assembles runtime dependencies

## Why session/runtime replacement is a first-class concern

## How `ModelRegistry`, `SettingsManager`, and `AuthStorage` interact

## How `DefaultResourceLoader` merges resources and handles collisions

### Precedence rules (my version)

- prompts:
- skills:
- themes:
- extensions:

## How `ExtensionRunner` composes handlers and prompt transformations

## Agent-level vs provider-level hooks

## How `SessionManager.buildSessionContext()` reconstructs runtime context

## Compaction vs branch summary vs retry (one sentence each)

- compaction:
- branch summary:
- retry:

## Compaction test walkthrough (Exercise 02) — my answers

1. Cut point selection:
2. Why lossy is allowed:
3. What survives in the JSONL:
4. Pure-logic vs model-calling parts:
5. Tests that would worry me to break:

## Tree navigation walkthrough (Exercise 03) — my answers

1. When `editorText` is returned:
2. When new leaf is `null`:
3. Branch summary attachment point:
4. User-message vs assistant-message navigation:
5. Abort behavior:

## Resource loader walkthrough (Exercise 04) — my answers

## Invariants I think Module 05 is protecting

1.
2.
3.
