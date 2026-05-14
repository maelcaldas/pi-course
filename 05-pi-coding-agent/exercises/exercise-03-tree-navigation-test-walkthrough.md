# Exercise 03: Tree Navigation Test Walkthrough

## Goal

Understand how `/tree` navigation and branch summaries actually change session state.

## Read

- `../pi/packages/coding-agent/test/agent-session-tree-navigation.test.ts`
- `../pi/packages/coding-agent/src/core/session-manager.ts`
- `../pi/packages/coding-agent/src/core/agent-session.ts`

## Questions

1. When does navigation return `editorText`, and why?
2. When is the new leaf `null`, and what does that mean semantically?
3. Where does a branch summary attach in the tree?
4. What behavior changes when navigating to a user message vs an assistant message?
5. How does abort behavior preserve session integrity?

## Deliverable

Draw a small before/after tree for one navigation case and annotate:

- old leaf
- target node
- summary attachment point
- new leaf
