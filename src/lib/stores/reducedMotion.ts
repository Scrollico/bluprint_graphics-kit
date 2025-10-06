import { writable, type Writable } from 'svelte/store';

function getInitialPreference(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = window.localStorage.getItem('reduced-motion');
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch {}

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mq.matches;
}

export const reducedMotion: Writable<boolean> = writable(getInitialPreference());

// Keep in sync with system preference unless user explicitly sets a value
if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onChange = () => {
    try {
      const stored = window.localStorage.getItem('reduced-motion');
      // Only update from system if user hasn't set an explicit preference
      if (stored === null) {
        reducedMotion.set(mq.matches);
      }
    } catch {}
  };
  mq.addEventListener?.('change', onChange);
}

export function setReducedMotion(value: boolean): void {
  reducedMotion.set(value);
  try {
    window.localStorage.setItem('reduced-motion', value ? 'true' : 'false');
  } catch {}
}


