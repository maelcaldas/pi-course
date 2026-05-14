# 04.01 The Rendering Pipeline

The TUI is small in surface but dense in invariants. This chapter is the state-machine view of one render cycle so that, when you read `tui.ts`, you already know what you are looking at.

## The Render Cycle

One render cycle is, conceptually:

```
  invalidation
      ↓
  schedule render (coalesced)
      ↓
  for each visible component: render(width) → string[]
      ↓
  composite overlays into the same line space
      ↓
  locate CURSOR_MARKER → cursor position
      ↓
  diff against prevLines
      ↓
  emit minimal terminal updates
      ↓
  wrap output in synchronized output (BSU/ESU) sequences
      ↓
  update prevLines
```

Every box is a place a regression can hide.

## Source-Guided Path

1. `../pi/packages/tui/src/tui.ts` — read once with the cycle above in mind
2. `../pi/packages/tui/src/terminal.ts` — the abstraction over raw stdout / sequences
3. `../pi/packages/tui/src/utils.ts` — width, truncation, cursor marker helpers
4. `../pi/packages/tui/src/components/editor.ts` — the most invariant-heavy component
5. `../pi/packages/tui/test/tui-render.test.ts` — the regression encyclopedia

## State You Should Be Able To Name

While reading `tui.ts`, identify where each of these lives:

- `prevLines` (or equivalent) — last frame written to the terminal
- the dirty / invalidation flag(s)
- the scheduled-render token (to coalesce bursts)
- the focus pointer
- the overlay stack
- the resolved cursor position for the current frame
- terminal width/height and how resize invalidates state
- any pending image/cleanup tracking

If you cannot point at each of these in source, you do not yet have the model.

## Why String-Based Rendering

A virtual DOM would buy nothing here. Terminals are themselves a string-diffing surface. Pi's render output is `string[]`; the diff is a line-by-line comparison; the write is the minimum of move + replace + clear-to-eol sequences. This is **the** reason the TUI stays comprehensible at this size.

## Why Overlays Composite Into The Same Line Space

If overlays were rendered as separate writes, the diff layer would not see them as part of the frame, and resize / focus / scroll would each need overlay-aware special cases. Compositing into one `string[]` collapses those special cases into the normal diff path.

## Why `CURSOR_MARKER` Exists

The cursor is **hardware**, not a glyph. For IME (input method editors) and screen readers to work, the OS-level cursor must sit at the real character position, not a position pi guesses. `CURSOR_MARKER` is a sentinel embedded in the rendered string that the pipeline locates *after* compositing, so the cursor follows the same overlay/focus rules as everything else.

## When A Full Redraw Is Forced

Differential rendering is the fast path. A full redraw is forced when an assumption underlying the diff is no longer safe:

- terminal resize → `prevLines` no longer corresponds to the current geometry
- alt-screen enter/exit
- after image cleanup, when escape sequences may have left unknown terminal state
- explicit invalidation from a component that knows its previous output is unrelated to its new output

Read `tui-render.test.ts` looking for *which test pinned each of these cases*. That is the most useful map of the file.

## Synchronized Output

Frames are wrapped in begin/end synchronized-update sequences (`BSU`/`ESU`). On terminals that honor them, this prevents tearing during multi-line updates. On terminals that do not, the sequences are harmless. This is a "why is this here?" that becomes obvious once you see a flicker bug.

## Image Lifecycle

Images are out-of-band relative to text. They can be left behind on the terminal if not explicitly cleared. The pipeline tracks them so that scroll, resize, and frame replacement all clean up correctly. This is where most TUI regressions originate.

## What To Be Able To Explain

- The full render cycle from invalidation to written bytes.
- Why overlays are part of the same `string[]` rather than a separate write path.
- Why `CURSOR_MARKER` is necessary even though pi could compute a cursor position itself.
- Every condition under which a full redraw is forced, and why each one breaks the diff assumption.
- Why image cleanup is part of rendering correctness and not a separate concern.
