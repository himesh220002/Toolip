/**
 * Generic Stack Data Structure implementation (LIFO - Last In First Out)
 * Used to store execution calls and state snapshots for Undo / Redo operations.
 */
export class Stack<T> {
  private items: T[] = [];
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  /**
   * Pushes an item onto the top of the stack.
   * If stack size exceeds maxSize, the oldest item (bottom of stack) is dropped.
   */
  push(item: T): void {
    if (this.items.length >= this.maxSize) {
      this.items.shift(); // Evict oldest item to maintain memory limit
    }
    this.items.push(item);
  }

  /**
   * Removes and returns the top item from the stack.
   * Returns undefined if the stack is empty.
   */
  pop(): T | undefined {
    return this.items.pop();
  }

  /**
   * Returns the top item without removing it.
   */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /**
   * Checks if the stack is empty.
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Returns current number of items in the stack.
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Clears all items from the stack.
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Returns a copy of the internal stack elements array.
   */
  toArray(): T[] {
    return [...this.items];
  }
}
