# Notes: 04 pi-tui

## The render cycle (in my own words, end to end)

## Why string-based rendering is sufficient

## Why overlays composite into the same line space

## Why `CURSOR_MARKER` exists and how it cooperates with focus

## When a full redraw is forced, and the assumption being broken in each case

- resize:
- alt-screen enter/exit:
- after image cleanup:
- explicit component invalidation:

## Why image lifecycle is part of rendering correctness

## Diff from Exercise 01: what my counter ignores that `tui.ts` cannot

- (item) → (test that pins it)

## Three regression classes that would make me cautious before editing `tui.ts`

1.
2.
3.
