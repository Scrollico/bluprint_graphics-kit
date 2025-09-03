import { onMount, onDestroy } from 'svelte';

interface ScrollOptions {
    step: string;
    offset?: number;
    progress?: (index: number) => void;
    debug?: boolean;
}

export function scroller(options: ScrollOptions) {
    let observer: IntersectionObserver | null = null;
    let steps: Element[] = [];
    let currentStep = 0;
    let stepVisibility: number[] = [];

    onMount(() => {
        // Find all step elements
        steps = Array.from(document.querySelectorAll(options.step));

        if (steps.length === 0) {
            console.warn('No step elements found with selector:', options.step);
            return;
        }

        // Initialize visibility array
        stepVisibility = new Array(steps.length).fill(0);

        // Create intersection observer with multiple thresholds
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = steps.indexOf(entry.target);
                    if (index !== -1) {
                        // Update visibility for this step
                        stepVisibility[index] = entry.intersectionRatio;
                        
                        // Find the step with highest visibility
                        const maxVisibility = Math.max(...stepVisibility);
                        const mostVisibleIndex = stepVisibility.indexOf(maxVisibility);
                        
                        // Only update if we have a clear winner and it's different
                        if (maxVisibility > 0.3 && mostVisibleIndex !== currentStep) {
                            currentStep = mostVisibleIndex;
                            if (options.progress) {
                                options.progress(currentStep);
                            }
                            if (options.debug) {
                                console.log('Step changed to:', currentStep, 'Visibility:', maxVisibility);
                            }
                        }
                    }
                });
            },
            {
                threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
                rootMargin: '0px 0px -10% 0px'
            }
        );

        // Observe all steps
        steps.forEach(step => observer?.observe(step));
    });

    onDestroy(() => {
        if (observer) {
            observer.disconnect();
        }
    });

    return {
        get currentStep() {
            return currentStep;
        },
        get totalSteps() {
            return steps.length;
        },
        get stepVisibility() {
            return stepVisibility;
        }
    };
}

// Alternative scrollama-style API
export function createScroller(options: ScrollOptions) {
    return scroller(options);
}

