import { readable } from 'svelte/store';

export const scrollY = readable(0, (set) => {
  if (typeof window === 'undefined') return () => {};

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      set(window.pageYOffset || document.documentElement.scrollTop || 0);
      ticking = false;
    });
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
});


