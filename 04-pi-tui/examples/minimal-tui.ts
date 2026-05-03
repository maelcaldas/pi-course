/**
 * Example: Minimal TUI with a counter component.
 *
 * This shows how to create components, handle input, and use differential rendering.
 */

import { Component, ProcessTerminal, TUI } from "@mariozechner/pi-tui";

// --- 1. Define a component ---

class Counter implements Component {
  private count = 0;
  private label: string;

  constructor(label: string) {
    this.label = label;
  }

  render(width: number): string[] {
    const line = `${this.label}: ${this.count}`;
    // Pad or truncate to width
    return [line.slice(0, width)];
  }

  handleInput(data: string): void {
    if (data === "+") {
      this.count++;
    } else if (data === "-") {
      this.count--;
    }
  }

  invalidate(): void {
    // No cached state to invalidate
  }
}

// --- 2. Set up TUI ---

const terminal = new ProcessTerminal();
const tui = new TUI(terminal);

const counter = new Counter("Count");
tui.addChild(counter);
tui.setFocus(counter);

// --- 3. Start ---

console.log("Press + to increment, - to decrement, q to quit");
tui.start();

// Handle 'q' to quit
tui.addInputListener((data) => {
  if (data === "q") {
    tui.stop();
    process.exit(0);
  }
  return undefined; // Let other handlers process it
});
