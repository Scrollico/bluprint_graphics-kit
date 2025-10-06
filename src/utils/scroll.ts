import { onMount, onDestroy } from 'svelte';

interface ScrollOptions {
  step: string;
  offset?: number; // 0..1 threshold center
  progress?: (index: number) => void; // legacy single-callback
  onEnter?: (index: number, dir: 'down' | 'up') => void;
  onExit?: (index: number, dir: 'down' | 'up') => void;
  onDirection?: (dir: 'down' | 'up') => void;
  debug?: boolean;
}

export function scroller(options: ScrollOptions) {
  let observer: IntersectionObserver | null = null;
  let steps: Element[] = [];
  let currentStep = 0;
  let lastStep = -1;
  let direction: 'down' | 'up' = 'down';
  let lastScrollY = 0;

  // Initialize function to be called from component's onMount
  function init() {
    // Find all step elements
    steps = Array.from(document.querySelectorAll(options.step));

    console.log('🔍 Scroller: Found', steps.length, 'step elements with selector:', options.step);
    if (options.debug) {
      steps.forEach((step, i) => {
        console.log(`  Step ${i}:`, step.className, step);
        console.log(`    Element:`, step);
        console.log(`    Bounding rect:`, step.getBoundingClientRect());
      });
    }

    if (steps.length === 0) {
      console.warn('No step elements found with selector:', options.step);
      return;
    }

    // Track scroll direction globally
    const onWinScroll = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      const newDir: 'down' | 'up' = y >= lastScrollY ? 'down' : 'up';
      if (newDir !== direction) {
        direction = newDir;
        options.onDirection?.(direction);
        if (options.debug) console.log('↕️ Direction:', direction);
      }
      lastScrollY = y;
    };
    window.addEventListener('scroll', onWinScroll, { passive: true });

    // Create intersection observer - more robust approach
    observer = new IntersectionObserver(
      (entries) => {
        // Find the step that's most visible in the viewport
        let mostVisibleStep = currentStep;
        let maxVisibility = 0;

        entries.forEach((entry) => {
          const index = steps.indexOf(entry.target);
          if (index === -1) return;

          // Calculate visibility based on intersection ratio
          const visibility = entry.intersectionRatio;

          if (visibility > maxVisibility) {
            maxVisibility = visibility;
            mostVisibleStep = index;
          }
        });

        // Update if we have a different step and sufficient visibility
        if (mostVisibleStep !== currentStep && maxVisibility > 0.05) {
          lastStep = currentStep;
          currentStep = mostVisibleStep;
          const dir: 'down' | 'up' = currentStep > lastStep ? 'down' : 'up';

          // Exit event for previous step
          if (lastStep >= 0 && lastStep < steps.length) {
            options.onExit?.(lastStep, dir);
          }

          // Enter event for new step
          options.onEnter?.(currentStep, dir);

          // Legacy
          options.progress?.(currentStep);

          if (options.debug) {
            console.log('🎯 Step changed to:', currentStep, 'dir:', dir, 'vis:', maxVisibility);
          }
        }
      },
      {
        // Multiple thresholds for better detection
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        // More generous root margin
        rootMargin: '0px 0px -10% 0px',
      }
    );

    // Observe all steps
    steps.forEach((step) => observer?.observe(step));

    // Add scroll event listener as backup (center proximity)
    const handleScroll = () => {
      if (typeof window === 'undefined') return;

      const viewportHeight = window.innerHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const viewportCenter = scrollTop + viewportHeight / 2;

      let closestStep = 0;
      let minDistance = Infinity;

      steps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        const stepTop = scrollTop + rect.top;
        const stepCenter = stepTop + rect.height / 2;
        const distance = Math.abs(stepCenter - viewportCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestStep = index;
        }
      });

      if (closestStep !== currentStep) {
        lastStep = currentStep;
        currentStep = closestStep;
        const dir: 'down' | 'up' = currentStep > lastStep ? 'down' : 'up';
        options.onExit?.(lastStep, dir);
        options.onEnter?.(currentStep, dir);
        options.progress?.(currentStep);
        if (options.debug) {
          console.log('🎯 Step changed via scroll to:', currentStep, 'dir:', dir, 'dist:', minDistance);
        }
      }
    };

    // Add scroll listener with throttling
    let scrollTimeout: number | null = null;
    const throttledScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = window.setTimeout(() => {
        handleScroll();
        scrollTimeout = null;
      }, 100);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Return cleanup function
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('scroll', onWinScroll);
    };
  }

  // Cleanup function
  function destroy() {
    if (observer) {
      observer.disconnect();
    }
  }

  return {
    init,
    destroy,
    get currentStep() {
      return currentStep;
    },
    get totalSteps() {
      return steps.length;
    },
    get direction() {
      return direction;
    },
    // Programmatic navigation (smooth scroll to step)
    goTo(index: number, behavior: ScrollBehavior = 'smooth') {
      const el = steps[index] as HTMLElement | undefined;
      if (!el) return;
      el.scrollIntoView({ behavior, block: 'center' });
    },
  };
}

// Alternative scrollama-style API
export function createScroller(options: ScrollOptions) {
  return scroller(options);
}
