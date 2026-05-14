# Exercise 02: Render Regression Reading

## Goal

Learn how to reason about TUI changes as regression-risk management, not just feature work.

## Read

- `../pi/packages/tui/test/tui-render.test.ts`
- `../pi/packages/tui/src/tui.ts`

## Questions

1. Which tests are really about terminal cleanup rather than rendering appearance?
2. Where does the implementation choose full redraws, and why?
3. Which bugs would be invisible in a normal unit-test mindset but obvious in a real terminal?
4. Which parts of the file are about correctness, and which parts are about flicker/performance?

## Deliverable

Write a short note describing three regression classes that would make you cautious before editing `tui.ts`.
