/**
 * Chart Transition Store
 * Manages smooth transitions between different chart types in scrollytelling
 */

import { writable } from 'svelte/store';

export interface BubbleNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  type: 'solution' | 'country';
  data?: any;
}

export interface TransitionState {
  isTransitioning: boolean;
  fromStep: string | null;
  toStep: string | null;
  progress: number; // 0 to 1
  bubbles: BubbleNode[];
}

// Initial state
const initialState: TransitionState = {
  isTransitioning: false,
  fromStep: null,
  toStep: null,
  progress: 0,
  bubbles: []
};

// Create the store
export const chartTransition = writable<TransitionState>(initialState);

// Helper functions
export function startTransition(fromStep: string, toStep: string, bubbles: BubbleNode[]) {
  chartTransition.update(state => ({
    ...state,
    isTransitioning: true,
    fromStep,
    toStep,
    progress: 0,
    bubbles
  }));
}

export function updateTransitionProgress(progress: number) {
  chartTransition.update(state => ({
    ...state,
    progress: Math.max(0, Math.min(1, progress))
  }));
}

export function completeTransition() {
  chartTransition.update(state => ({
    ...state,
    isTransitioning: false,
    fromStep: null,
    toStep: null,
    progress: 0,
    bubbles: []
  }));
}

export function resetTransition() {
  chartTransition.set(initialState);
}
