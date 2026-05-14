# Exercise 02: Faux-Provider Handoff

This is the required deterministic handoff exercise.

## Goal

Understand how pi-ai preserves or transforms assistant state across model boundaries without using real provider APIs.

## Requirements

1. Register a faux provider with at least two faux models
2. Generate an assistant message containing:
   - thinking
   - a tool call
   - text
3. Append a tool result to the context
4. Continue the conversation with the second faux model
5. Inspect the resulting messages and event stream

## What to Observe

- Which parts of assistant history survive unchanged?
- Which parts would require transformation across real providers?
- What assumptions does your code make about tool call IDs?
- How easy is it to confuse “provider” identity with “API” identity?

## Suggested Source Pairing

Read while doing the exercise:

- `../pi/packages/ai/test/faux-provider.test.ts`
- `../pi/packages/ai/src/providers/transform-messages.ts`

## Deliverable

Write a short note answering:

1. What is the minimum information required to continue a tool-using conversation?
2. Why is handoff logic not just a raw message pass-through?
3. Which transforms feel policy-like, and which feel structurally necessary?
