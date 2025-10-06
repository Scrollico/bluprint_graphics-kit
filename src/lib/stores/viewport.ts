import { readable } from 'svelte/store';

export const viewport = readable({ width: 0, height: 0 }, (set) => {
  if (typeof window === 'undefined') return () => {};

  const onResize = () => {
    set({ width: window.innerWidth, height: window.innerHeight });
  };
  onResize();

  let timeout: number | null = null;
  const handler = () => {
    if (timeout) return;
    timeout = window.setTimeout(() => {
      onResize();
      timeout = null;
    }, 100);
  };

  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
});


