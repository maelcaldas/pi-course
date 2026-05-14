# Exercise 04: Resource Loader Walkthrough

## Goal

Understand discovery and precedence rules instead of treating resource loading as a black box.

## Read

- `../pi/packages/coding-agent/src/core/resource-loader.ts`
- `../pi/packages/coding-agent/test/resource-loader.test.ts`
- `../pi/packages/coding-agent/docs/extensions.md`

## Questions

1. Which resource types are discovered automatically?
2. How do project-local and user-level resources interact on name collisions?
3. Why are symlink cases explicitly tested?
4. How do extensions contribute additional resource paths?
5. Which parts of resource loading are about user experience, and which are about runtime correctness?

## Deliverable

Write a short note describing the precedence rules for:

- prompts
- skills
- themes
- extensions
