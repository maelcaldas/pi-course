# pi-ai Tests to Read

Read these in order.

| Test | Why it matters |
| --- | --- |
| `../pi/packages/ai/test/stream.test.ts` | The broadest picture of normalized streaming behavior across models/providers |
| `../pi/packages/ai/test/validation.test.ts` | Shows how tool schemas are expected to constrain tool execution inputs |
| `../pi/packages/ai/test/faux-provider.test.ts` | The cleanest explanation of faux-provider behavior and deterministic streaming semantics |
| `../pi/packages/ai/test/cross-provider-handoff.test.ts` | Shows the real complexity of provider-to-provider replay and why handoff logic is non-trivial |

## Reading Notes

- `stream.test.ts` tells you what the public event stream is expected to look like.
- `faux-provider.test.ts` tells you how to reason locally without live providers.
- `cross-provider-handoff.test.ts` is intentionally broad; read it for categories of failure, not every provider credential path.

## Optional API-Key Reading

If you have credentials and want more depth, scan:

- `../pi/packages/ai/test/context-overflow.test.ts`
- `../pi/packages/ai/test/tool-call-without-result.test.ts`
- `../pi/packages/ai/test/openai-responses-tool-result-images.test.ts`

These are not required for the main course path.
