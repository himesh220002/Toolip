import { useState, useRef, useCallback } from 'react';
import { Stack } from '../lib/stack';

export interface UseUndoRedoStackOptions {
  maxSize?: number;
}

export interface UseUndoRedoStackResult<T> {
  canUndo: boolean;
  canRedo: boolean;
  recordState: (state: T) => void;
  undo: (currentState: T) => T | undefined;
  redo: (currentState: T) => T | undefined;
  clearHistory: () => void;
  undoSize: number;
  redoSize: number;
}

/**
 * Custom React hook for Undo/Redo state history tracking.
 * Utilizes two Stack data structures (`undoStack` and `redoStack`) to manage state transitions.
 */
export function useUndoRedoStack<T>(options: UseUndoRedoStackOptions = {}): UseUndoRedoStackResult<T> {
  const maxSize = options.maxSize ?? 50;
  const undoStackRef = useRef<Stack<T>>(new Stack<T>(maxSize));
  const redoStackRef = useRef<Stack<T>>(new Stack<T>(maxSize));

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [undoSize, setUndoSize] = useState(0);
  const [redoSize, setRedoSize] = useState(0);

  const updateStateFlags = useCallback(() => {
    setCanUndo(!undoStackRef.current.isEmpty());
    setCanRedo(!redoStackRef.current.isEmpty());
    setUndoSize(undoStackRef.current.size());
    setRedoSize(redoStackRef.current.size());
  }, []);

  /**
   * Pushes a state snapshot onto the undo stack and clears the redo stack.
   */
  const recordState = useCallback(
    (state: T) => {
      const snapshot = typeof state === 'object' && state !== null ? JSON.parse(JSON.stringify(state)) : state;
      undoStackRef.current.push(snapshot);
      redoStackRef.current.clear();
      updateStateFlags();
    },
    [updateStateFlags]
  );

  /**
   * Reverts to the last item from the undo stack and moves current state to the redo stack.
   */
  const undo = useCallback(
    (currentState: T): T | undefined => {
      if (undoStackRef.current.isEmpty()) return undefined;

      const previousState = undoStackRef.current.pop();
      if (previousState !== undefined) {
        const currentSnapshot = typeof currentState === 'object' && currentState !== null ? JSON.parse(JSON.stringify(currentState)) : currentState;
        redoStackRef.current.push(currentSnapshot);
      }
      updateStateFlags();
      return previousState;
    },
    [updateStateFlags]
  );

  /**
   * Re-applies the next item from the redo stack and moves current state to the undo stack.
   */
  const redo = useCallback(
    (currentState: T): T | undefined => {
      if (redoStackRef.current.isEmpty()) return undefined;

      const nextState = redoStackRef.current.pop();
      if (nextState !== undefined) {
        const currentSnapshot = typeof currentState === 'object' && currentState !== null ? JSON.parse(JSON.stringify(currentState)) : currentState;
        undoStackRef.current.push(currentSnapshot);
      }
      updateStateFlags();
      return nextState;
    },
    [updateStateFlags]
  );

  /**
   * Resets both undo and redo stacks.
   */
  const clearHistory = useCallback(() => {
    undoStackRef.current.clear();
    redoStackRef.current.clear();
    updateStateFlags();
  }, [updateStateFlags]);

  return {
    canUndo,
    canRedo,
    recordState,
    undo,
    redo,
    clearHistory,
    undoSize,
    redoSize,
  };
}
