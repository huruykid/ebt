// Utility to batch DOM reads and writes to avoid forced reflows

export class LayoutBatcher {
  private readCallbacks: Array<() => void> = [];
  private writeCallbacks: Array<() => void> = [];
  private scheduled = false;

  read(callback: () => void) {
    this.readCallbacks.push(callback);
    this.schedule();
  }

  write(callback: () => void) {
    this.writeCallbacks.push(callback);
    this.schedule();
  }

  private schedule() {
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  private flush() {
    // Execute all reads first
    const reads = this.readCallbacks;
    this.readCallbacks = [];
    reads.forEach(callback => callback());

    // Then execute all writes
    const writes = this.writeCallbacks;
    this.writeCallbacks = [];
    writes.forEach(callback => callback());

    this.scheduled = false;
  }
}

export const layoutBatcher = new LayoutBatcher();

// Helper to measure elements without causing reflows
export function measureElement(element: HTMLElement) {
  return new Promise<DOMRect>((resolve) => {
    layoutBatcher.read(() => {
      resolve(element.getBoundingClientRect());
    });
  });
}

// Helper to update styles without causing reflows
export function updateStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
  layoutBatcher.write(() => {
    Object.assign(element.style, styles);
  });
}
