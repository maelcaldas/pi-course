# Module 04: pi-tui

`@earendil-works/pi-tui` is a terminal UI system, not a chat-specific widget library.

## Source-Guided Path

Read these in order:

1. `../pi/packages/tui/README.md`
2. `../pi/packages/tui/src/tui.ts`
3. `../pi/packages/tui/src/components/editor.ts`
4. `../pi/packages/tui/src/components/select-list.ts`
5. `../pi/packages/tui/src/terminal.ts`
6. `../pi/packages/tui/src/utils.ts`
7. [`tests-to-read.md`](tests-to-read.md)

## Stable Surface

The important stable concepts are:

- `Component`
- `TUI`
- overlays
- focus model
- hardware cursor / `CURSOR_MARKER`
- differential rendering

## Core Mental Model

Pi’s TUI renders strings, not a virtual DOM. The important loop is:

1. render components into lines
2. composite overlays into the same line space
3. locate the cursor marker
4. diff against previous rendered lines
5. emit the minimal terminal update wrapped in synchronized output

This simplicity is deliberate.

## What to Watch for in `tui.ts`

The large file size is not the key point. The key point is the set of invariants it is protecting:

- line widths must stay valid
- overlays must behave like part of the same render space
- focus transitions must remain consistent
- hardware cursor placement must remain compatible with IME workflows
- image cleanup must not leave terminal artifacts behind

## Regression Mindset

TUI changes are easy to reason about locally and easy to break globally.

Read the tests with this question:

- “What terminal artifact or interaction bug did this test exist to prevent?”

That is more useful than memorizing individual helper functions.

## Required Exercises

- [Exercise 01: Counter Component](exercises/exercise-01-counter.md)
- [Exercise 02: Render Regression Reading](exercises/exercise-02-render-regression.md)

## Questions to Answer Before Moving On

You should be able to explain:

- why string-based rendering is sufficient here
- why overlays are composited into the same render space
- why `CURSOR_MARKER` exists at all
- when pi chooses a full redraw instead of a partial redraw
- what kinds of regressions the TUI tests are defending against
