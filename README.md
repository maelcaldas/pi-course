# Deep Dive into the Pi Agent

A self-contained course for understanding the pi agent architecture end-to-end, from LLM streaming primitives to a full interactive coding agent.

## Goal

By the end of this course, you will:
- Understand every layer of the pi stack and why it is designed the way it is
- Be able to implement your own minimal version of pi from scratch
- Know the boundaries, extension points, and design trade-offs

## Prerequisites

- TypeScript/Node.js proficiency
- Basic familiarity with LLM APIs (OpenAI, Anthropic, or similar)
- Comfort with async/await and event-driven architectures

## Structure

| Module | Topic | Focus |
|--------|-------|-------|
| [01 - Foundations](01-foundations/) | Concepts, architecture, design philosophy | Why pi exists and how it is organized |
| [02 - pi-ai](02-pi-ai/) | Unified LLM API | Streaming, tools, thinking, cross-provider handoffs |
| [03 - pi-agent-core](03-pi-agent-core/) | Agent loop and state management | The heart of the agent: turns, events, tools |
| [04 - pi-tui](04-pi-tui/) | Terminal UI | Differential rendering, components, overlays |
| [05 - pi-coding-agent](05-pi-coding-agent/) | The interactive CLI product | Sessions, extensions, skills, compaction |
| [06 - Capstone](06-capstone/) | Build your own | A minimal but complete reimplementation |

## How to Use This Course

Each module contains:
- **Concepts**: The "why" — design decisions, boundaries, trade-offs
- **Deep Dive**: Annotated walkthroughs of key source files
- **Exercises**: Hands-on tasks to solidify understanding
- **Examples**: Runnable code demonstrations

Work through modules in order. The capstone ties everything together.
