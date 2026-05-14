# Module 02: pi-ai

`@earendil-works/pi-ai` is the LLM-facing layer. If you misunderstand this package, you will misread the rest of the stack.

## Source-Guided Path

Read these in order:

1. `../pi/packages/ai/README.md`
2. `../pi/packages/ai/src/types.ts`
3. `../pi/packages/ai/src/stream.ts`
4. `../pi/packages/ai/src/providers/transform-messages.ts`
5. [`tests-to-read.md`](tests-to-read.md)

## Stable Surface

Core abstractions you should internalize:

- `Model`
- `Context`
- `Message`
- `AssistantMessageEventStream`
- tool definitions via TypeBox schemas
- `stream()` / `complete()` and `streamSimple()` / `completeSimple()`

## What This Layer Actually Does

`pi-ai` is not an agent framework. It is a normalization layer over heterogeneous provider APIs.

It is responsible for:

- provider/model discovery
- request adaptation
- streaming event normalization
- tool call representation
- reasoning/thinking normalization
- image input / image-output distinctions
- cross-provider conversation handoff transforms
- usage and cost accounting

It is not responsible for:

- session persistence
- tool execution
- turn semantics
- terminal rendering

## Core Abstractions

### `Model`

Treat `Model<TApi>` as metadata plus routing information.

The critical fields are:

- `api` — which implementation path is used
- `provider` — who owns the model listing/auth story
- `reasoning` — whether reasoning controls should matter
- `input` — whether images are accepted
- `compat` — where provider quirks are explicitly encoded

The important insight is that `provider` and `api` are related but not identical.

### `Context`

`Context` is deliberately plain and serializable:

- `systemPrompt?`
- `messages`
- `tools?`

This simplicity is what makes model switching and context persistence tractable.

### `AssistantMessageEvent`

Streaming is event-based, not “just chunked text”. The protocol includes:

- text start/delta/end
- thinking start/delta/end
- toolcall start/delta/end
- done
- error

Use `contentIndex` mentally as the stable coordinate inside a partially built assistant message.

## The Most Important Source File: `transform-messages.ts`

If you want to understand how pi handles cross-provider handoffs, read this file closely.

It encodes several important realities:

- non-vision models must degrade image content safely
- same-model replay is different from cross-model replay
- reasoning blocks may need conversion or omission
- tool call identifiers may need normalization
- incomplete or errored assistant messages should not be replayed as if they were stable history

This file is one of the strongest examples in the repo of “the docs give the shape; the source gives the real semantics”.

## Faux Provider Matters More Than It First Appears

`registerFauxProvider()` is not just a test helper. It is the cleanest way to isolate:

- event sequencing
- tool-call streaming
- cross-provider handoff assumptions
- context mutation without real API noise

For this course, faux-provider-based understanding is part of the main path. Real multi-provider API exercises are optional.

## Required Exercises

- [Exercise 01: Basic Streaming](exercises/exercise-01-basic-streaming.md)
- [Exercise 02: Faux-Provider Handoff](exercises/exercise-02-faux-provider-handoff.md)

## Optional Live Exercise

Only after the deterministic work:

- run a real multi-provider handoff across providers you already have access to
- compare what surprised you against `transform-messages.ts`

## Questions to Answer Before Moving On

You should be able to explain:

- why `Context` is intentionally plain
- why `provider` and `api` are distinct concepts
- why streaming is modeled as structured events instead of text chunks only
- what gets transformed during cross-provider handoff and why
- why faux providers are central to understanding this layer
