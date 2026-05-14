# Exercise 02: Compaction Test Walkthrough

## Goal

Understand compaction from deterministic tests before touching any live provider behavior.

## Read

- `../pi/packages/coding-agent/docs/compaction.md`
- `../pi/packages/coding-agent/test/compaction.test.ts`
- `../pi/packages/coding-agent/src/core/compaction/index.ts`

## Questions

1. How does pi choose a cut point?
2. Why is compaction allowed to be lossy?
3. What data remains available even after compaction changes runtime context?
4. Which parts of compaction are pure logic and which parts call the model?
5. Which test cases would make you nervous to break?

## Optional Follow-Up

If you have provider credentials and want to compare behavior with the real system:

- read `../pi/packages/coding-agent/test/agent-session-compaction.test.ts`
- treat it as confirmation, not as the primary learning artifact
