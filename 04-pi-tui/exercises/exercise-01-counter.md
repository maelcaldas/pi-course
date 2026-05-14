# Exercise 1: Counter Component

Implement a `Counter` component that displays a number and responds to keyboard input.

## Requirements

1. Display a label and a number: `Count: 0`
2. Increment on `+` key press
3. Decrement on `-` key press
4. Quit on `q` key press

## Starter Code

See `examples/minimal-tui.ts` for a working starting point.

## Extension Ideas

- Add a second counter and tab between them
- Show a history of previous values
- Add color using ANSI escape codes

## Diff Step (required)

After the counter works, open `../pi/packages/tui/src/tui.ts` and `../pi/packages/tui/src/components/editor.ts`. **Diff your component and your TUI usage against the real implementations in writing**. List every concern you did not have to handle that the real code handles. Expect at least:

- focus stack and overlay-aware focus, not just `setFocus(component)`
- `CURSOR_MARKER` and hardware cursor placement
- coalesced render scheduling rather than render-on-every-keystroke
- differential rendering vs full redraw decisions
- terminal resize and width/height invalidation
- synchronized output sequences (BSU/ESU)
- alt-screen / image cleanup
- IME and multi-byte width handling (`truncateToWidth` is a hint, not the whole story)

Deliverable: a short note titled “What my counter ignores that `tui.ts` cannot ignore”. Tie at least three items to a specific test in `../pi/packages/tui/test/tui-render.test.ts`.
