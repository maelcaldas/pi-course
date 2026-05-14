# 05.01 Runtime and Services

This chapter is about how the coding agent runtime is assembled before any interesting interaction happens.

## Source-Guided Path

Read these in order:

1. `../pi/packages/coding-agent/docs/sdk.md`
2. `../pi/packages/coding-agent/src/core/sdk.ts`
3. `../pi/packages/coding-agent/src/core/agent-session.ts`
4. `../pi/packages/coding-agent/src/core/agent-session-runtime.ts`
5. `../pi/packages/coding-agent/src/core/model-registry.ts`
6. `../pi/packages/coding-agent/src/core/settings-manager.ts`
7. `../pi/packages/coding-agent/test/model-registry.test.ts`
8. `../pi/packages/coding-agent/test/settings-manager.test.ts`

## Main Abstractions

| Abstraction | Role |
| --- | --- |
| `createAgentSession()` | Assemble one working `AgentSession` from services and defaults |
| `AgentSession` | Product wrapper around `Agent` with sessions, extensions, compaction, retry, and prompting rules |
| `createAgentSessionRuntime()` / `AgentSessionRuntime` | Replace the active session/runtime safely during new/resume/fork/import flows |
| `ModelRegistry` | Merge built-in and custom model/provider definitions, then resolve request auth at runtime |
| `SettingsManager` | Merge global/project settings and persist changes safely |
| `AuthStorage` | Store runtime, persisted, and environment-backed credential state |

## The First Important Distinction

Distinguish carefully between:

- **creating one session**
- **owning a replaceable runtime**

`createAgentSession()` is enough when you want a single session.

`AgentSessionRuntime` exists because the product must support replacing the active session and its cwd-bound services without pretending the old runtime objects are still valid.

## AgentSession Is Product Logic, Not Just a Wrapper

Read `agent-session.ts` as the place where generic agent behavior becomes product behavior.

It adds things like:

- prompt-template and skill expansion
- extension command handling
- queue behavior at the product boundary
- model/auth preflight checks
- compaction checks
- auto-retry
- extension event routing
- session persistence side effects

## Runtime Replacement Footgun

`AgentSessionRuntime` is one of the most important files for understanding how stale state is avoided.

The key idea is:

- tear down old runtime
- build new runtime
- rebind host state to the new session
- never keep using the old session-bound context as if it survived the swap

This is a major source of product complexity and one of the easiest places to form the wrong mental model if you only read summaries.

## ModelRegistry: More Than a Lookup Table

`ModelRegistry` encodes several important policies:

- merge built-in models with custom providers/models from `models.json`
- support provider-level overrides and per-model overrides
- resolve headers/api keys at request time
- keep auth concerns separate from model metadata when possible

The tests are especially valuable here because the file handles many small compatibility cases.

## SettingsManager: Small File, Real Policy

`SettingsManager` is easy to underestimate. It is worth understanding because it reveals how pi thinks about:

- global vs project overrides
- nested settings merge semantics
- preserving unknown or externally added settings
- write queues and explicit durability via `flush()`

## What To Be Able To Explain

- Why `AgentSession` exists on top of `Agent`
- Why session replacement is a first-class runtime concern
- How model selection is resolved from session, settings, and availability
- Why auth/header resolution happens at request time instead of being baked into static model objects only
- Why settings persistence is asynchronous internally even though the API often feels synchronous
