# Module 04: pi-tui — Terminal UI

## What It Is

`@mariozechner/pi-tui` is a terminal UI library with differential rendering. It knows nothing about LLMs or agents. It renders components to the terminal, handles keyboard input, and manages overlays.

## Core Abstractions

### Component

Every UI element implements `Component`:

```typescript
interface Component {
  render(width: number): string[];
  handleInput?(data: string): void;
  invalidate(): void;
}
```

A component renders itself to an array of strings (one per line) given a viewport width. There is no height constraint; components render as many lines as they need.

### TUI

The `TUI` class is the root container:
- Manages the component tree
- Handles differential rendering (only redraws changed lines)
- Processes keyboard input and routes it to the focused component
- Manages overlays (modal dialogs, popups)
- Positions the hardware cursor for IME support

### Differential Rendering

The TUI compares the current render output to the previous output and only updates changed lines. This minimizes terminal flicker and improves performance.

```
Previous:  ["Hello", "World", "!!!"]
Current:   ["Hello", "Pi",    "!!!"]
           ────────  ────     ─────
           unchanged changed  unchanged

Only line 1 is redrawn.
```

### Overlay System

Overlays are components rendered on top of the base content:
- Positioned with anchors (`center`, `top-left`, etc.) or absolute coordinates
- Can be sized absolutely or as percentages
- Support margins and max height
- Capture focus when shown
- Stacked with focus order (higher = on top)

### Focus and Hardware Cursor

Components can implement `Focusable` to receive focus. When focused, they emit `CURSOR_MARKER` at the cursor position. The TUI finds this marker, strips it, and positions the hardware cursor there. This enables proper IME candidate window positioning.

## Deep Dive: Rendering

### The Render Cycle

1. `requestRender()` is called (debounced to ~60fps)
2. `doRender()` runs:
   - Render all components to lines
   - Composite overlays into the lines
   - Extract cursor position from `CURSOR_MARKER`
   - Apply line resets (normalize ANSI sequences)
   - Compare to previous lines
   - Build escape sequence buffer for updates
   - Write buffer to terminal

### Full Render Triggers

A full render (clear screen + redraw everything) happens when:
- Terminal width changes (wrapping changes)
- Terminal height changes (viewport alignment)
- Content shrinks below the working area (`clearOnShrink`)
- First render
- `requestRender(force=true)` is called

### Differential Update

For partial updates, the TUI:
1. Finds the first and last changed lines
2. Moves the cursor to the first changed line
3. Rewrites from there to the last changed line
4. Clears any lines that were deleted

### Terminal Synchronization

All output is wrapped in `\x1b[?2026h` (begin synchronized output) and `\x1b[?2026l` (end synchronized output). This tells the terminal to batch updates and prevents flicker.

## Design Decisions

### Why Strings Instead of a Virtual DOM

The TUI renders directly to strings. There is no virtual DOM or diffing algorithm. The "diff" is a simple line-by-line string comparison. This is fast enough for terminal UIs and much simpler than a full VDOM.

### Why No Height in Component Interface

Components only know their width. They render as many lines as needed. The TUI handles scrolling and viewport management. This simplifies components: they never have to worry about fitting into a constrained space.

### Why Overlays are Composited, Not Rendered Separately

Overlays are rendered into the same line array as the base content before differential comparison. This means:
- Overlay changes trigger the same differential update as base content changes
- No special overlay rendering path
- Overlays can be partially updated just like base content

### Why APC Sequence for Cursor Marker

`CURSOR_MARKER` uses an APC (Application Program Command) sequence: `\x1b_pi:c\x07`. Terminals ignore APC sequences, so this is a zero-width marker that the TUI can find and strip.

## Exercises

### Exercise 1: Minimal Component

Implement a `Counter` component that displays a number and increments/decrements on `+`/`-` key presses.

### Exercise 2: Overlay Dialog

Create a modal confirmation dialog using `showOverlay`. Position it centered with a max height of 50%.

### Exercise 3: Differential Rendering

Build a component that changes only one character per render. Observe that only that line is redrawn by enabling `PI_DEBUG_REDRAW=1`.

### Exercise 4: Focus Chain

Create two focusable components. Implement tab cycling between them. Verify that the hardware cursor moves to the correct position in each.

## Key Source Files

| File | Purpose |
|------|---------|
| `packages/tui/src/tui.ts` | `TUI` class: rendering, input, overlays |
| `packages/tui/src/components/editor.ts` | Text editor component |
| `packages/tui/src/components/select-list.ts` | List selector component |
| `packages/tui/src/terminal.ts` | Terminal abstraction |
| `packages/tui/src/utils.ts` | Width calculation, ANSI handling |
