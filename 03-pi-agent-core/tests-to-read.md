# pi-agent-core Tests to Read

| Test | Why it matters |
| --- | --- |
| `../pi/packages/agent/test/agent-loop.test.ts` | The clearest executable picture of loop semantics, transforms, and event ordering |
| `../pi/packages/agent/test/agent.test.ts` | Shows what the `Agent` wrapper adds beyond the raw loop |

## Reading Notes

Focus on these questions while reading:

- What is guaranteed by the raw loop?
- What is only guaranteed by the `Agent` wrapper?
- Where do queue semantics become visible in the tests?
- Which behaviors are about correctness, and which are about usability?
