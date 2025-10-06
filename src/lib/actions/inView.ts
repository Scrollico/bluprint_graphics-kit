export type InViewParams = {
  threshold?: number | number[];
  root?: Element | Document | null;
  rootMargin?: string;
  onEnter?: (node: Element, entry: IntersectionObserverEntry) => void;
  onExit?: (node: Element, entry: IntersectionObserverEntry) => void;
};

export default function inView(
  node: Element,
  {
    threshold = [0, 0.1, 0.25, 0.5, 0.75, 1],
    root = null,
    rootMargin = '0px 0px -10% 0px',
    onEnter,
    onExit,
  }: InViewParams = {}
) {
  if (typeof window === 'undefined') return {};

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onEnter?.(node, entry);
        else onExit?.(node, entry);
      }
    },
    { threshold, root: root as Element | null, rootMargin }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    },
  };
}


