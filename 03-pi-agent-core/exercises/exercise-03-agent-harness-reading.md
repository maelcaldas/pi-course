# Exercise 03: AgentHarness Reading

This is a reading and explanation exercise, not an implementation exercise.

## Goal

Understand the current orchestration direction without confusing it with already-settled stable API.

## Read

- `../pi/packages/agent/docs/agent-harness.md`
- `../pi/packages/agent/src/harness/agent-harness.ts`
- `../pi/packages/agent/src/harness/types.ts`

## Questions

Answer these in writing:

1. What problem does `AgentHarness` try to solve that `Agent` alone does not?
2. What is the difference between harness config and turn snapshot?
3. Why are save points important?
4. What operations are intended to be legal while busy, and which are intentionally rejected?
5. Which parts of the document are stated as current behavior, and which are stated as future work?

## Deliverable

Produce a one-page note with two sections:

- **What is already true today**
- **What is architectural direction but not yet fully settled**
