# 05.02 Extensions and Resource Loading

This chapter explains how pi loads behavior and how extensions are allowed to shape a run.

## Source-Guided Path

Read these in order:

1. `../pi/packages/coding-agent/docs/extensions.md`
2. `../pi/packages/coding-agent/src/core/resource-loader.ts`
3. `../pi/packages/coding-agent/src/core/extensions/runner.ts`
4. `../pi/packages/coding-agent/src/core/extensions/types.ts`
5. `../pi/packages/coding-agent/test/resource-loader.test.ts`
6. `../pi/packages/coding-agent/test/extensions-runner.test.ts`

## What This Layer Owns

The extension/resource subsystem decides:

- where resources are discovered
- which resource wins on collision
- how extension handlers are composed
- how commands/tools/shortcuts are registered
- how system prompt modifications are chained
- how prompt-time, turn-time, and provider-time hooks fit together

## DefaultResourceLoader

Read `resource-loader.ts` with two questions in mind:

1. What resources are discovered automatically?
2. What precedence rules decide who wins?

Important ideas to retain:

- user-level and project-level resources are merged deliberately
- collisions are a designed behavior, not an edge case
- extensions can contribute additional resource paths
- context files and system prompt material are part of resource loading, not an unrelated side system

## ExtensionRunner

`ExtensionRunner` is the runtime composition point for extension behavior.

Its responsibilities include:

- handler registration
- tool/command/shortcut registration
- event emission and handler ordering
- chained transforms like `before_agent_start` and input transforms
- surfacing extension errors without taking down the runtime unnecessarily

## Prompt Assembly Is Chained, Not Global-Mutable Magic

A key detail to understand is how `before_agent_start` works.

The runner chains system-prompt changes handler by handler. Later handlers see the current prompt after earlier handler modifications.

This is cleaner and more understandable than “everyone mutates one invisible prompt object”.

## Provider Hooks vs Agent Hooks

Keep these layers separate:

- **input / before_agent_start** — shape the run before the low-level loop begins
- **context** — shape the message set before a provider call
- **before_provider_request** — inspect/replace the serialized provider payload
- **after_provider_response** — inspect transport-level response data

These are similar in spirit, but they operate at different abstraction levels.

## Session Replacement Footgun Revisited

The extensions docs are unusually explicit about stale contexts after session replacement. Pay attention to that.

This is one of the clearest examples in the repo of the maintainers documenting a real lifecycle hazard instead of pretending it does not exist.

## What To Be Able To Explain

- How project and user resources are discovered and merged
- Why resource collisions are a policy question, not just a file-loading detail
- How `ExtensionRunner` chains handlers and prompt modifications
- The difference between agent-level and provider-level hooks
- Why replacement-session contexts must not reuse stale session-bound objects
