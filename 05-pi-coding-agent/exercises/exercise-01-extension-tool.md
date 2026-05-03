# Exercise 1: Custom Tool Extension

Write an extension that adds a custom tool to pi.

## Requirements

1. Create a TypeScript file that exports a default function
2. Register a `count_files` tool that counts files in a directory
3. The tool should accept a `path` parameter and return the count
4. Load the extension with `pi -e ./my-extension.ts`

## Extension Template

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@mariozechner/pi-ai";
import { readdirSync } from "node:fs";

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "count_files",
    label: "Count Files",
    description: "Count files in a directory",
    parameters: Type.Object({
      path: Type.String({ description: "Directory path" }),
    }),
    execute: async (toolCallId, params, signal) => {
      // TODO: Implement
    },
  });
}
```

## Verification

After loading the extension, ask pi: "How many files are in src/?" It should use the `count_files` tool.
