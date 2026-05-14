# pi-tui Tests to Read

| Test | Why it matters |
| --- | --- |
| `../pi/packages/tui/test/tui-render.test.ts` | Shows the redraw strategy, image cleanup, and resize behavior |
| `../pi/packages/tui/test/editor.test.ts` | Encodes the real editor behavior better than a conceptual summary can |
| `../pi/packages/tui/test/overlay-options.test.ts` | Clarifies how overlay positioning and sizing semantics are expected to behave |

## Reading Notes

While reading, classify each test as defending one of these:

- rendering correctness
- interaction correctness
- terminal cleanup
- cursor/focus correctness
