<script lang="ts">
  /**
   * Robust Scrollytelling Engine
   * Handles scroll events, step detection, and debugging
   */
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import type { StoryStep } from '../archieml/parser';

  export let steps: StoryStep[] = [];
  export let debug = false;
  export let threshold = 0.5;
  export let offset = 0.5;
  export let progress = true;

  const dispatch = createEventDispatcher();

  let container: HTMLElement;
  let progressBar: HTMLElement;
  let stepElements: HTMLElement[] = [];
  let currentStepIndex = -1;
  let scrollProgress = tweened(0, {
    duration: 300,
    easing: cubicOut,
  });

  // Draggable progress dot state
  let isDragging = false;
  let dragStartX = 0;
  let dragStartProgress = 0;

  // Debug state
  let debugInfo = {
    scrollY: 0,
    containerTop: 0,
    containerHeight: 0,
    viewportHeight: 0,
    activeStep: -1,
    stepProgress: 0,
    stepBounds: [] as Array<{ top: number; bottom: number; height: number }>,
  };

  // Intersection Observer for step detection
  let observer: IntersectionObserver;

  onMount(() => {
    setupObserver();
    updateDebugInfo();

    // Initial position check
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    };
  });

  function setupObserver() {
    const options = {
      root: null,
      rootMargin: `${-window.innerHeight * (1 - offset)}px 0px ${-window.innerHeight * offset}px 0px`,
      threshold: Array.from({ length: 101 }, (_, i) => i / 100),
    };

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = stepElements.indexOf(entry.target as HTMLElement);
        if (index === -1) return;

        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          if (currentStepIndex !== index) {
            setActiveStep(index);
          }
        }
      });

      // Update scroll progress
      updateScrollProgress();
    }, options);

    stepElements.forEach((el) => observer.observe(el));
  }

  function setActiveStep(index: number) {
    const previousIndex = currentStepIndex;
    currentStepIndex = index;

    dispatch('stepenter', {
      index,
      step: steps[index],
      direction: index > previousIndex ? 'down' : 'up',
      previousIndex,
    });

    if (previousIndex !== -1) {
      dispatch('stepexit', {
        index: previousIndex,
        step: steps[previousIndex],
        direction: index > previousIndex ? 'down' : 'up',
        nextIndex: index,
      });
    }

    updateDebugInfo();
  }

  function handleScroll() {
    updateScrollProgress();
    updateDebugInfo();

    // Check for step boundaries manually for precise control
    const scrollY = window.scrollY;
    const viewportCenter = scrollY + window.innerHeight * offset;

    for (let i = 0; i < stepElements.length; i++) {
      const el = stepElements[i];
      const rect = el.getBoundingClientRect();
      const top = rect.top + scrollY;
      const bottom = top + rect.height;

      if (viewportCenter >= top && viewportCenter <= bottom) {
        if (currentStepIndex !== i) {
          setActiveStep(i);
        }
        break;
      }
    }
  }

  function updateScrollProgress() {
    if (!container) return;

    // Container-level progress (0..1 over the whole scrollytelling block)
    const rect = container.getBoundingClientRect();
    const totalHeight = rect.height - window.innerHeight;
    const currentScroll = -rect.top;
    const containerProgress = Math.max(
      0,
      Math.min(1, totalHeight > 0 ? currentScroll / totalHeight : 0)
    );

    scrollProgress.set(containerProgress);
    dispatch('progress', { progress: containerProgress });

    // Active step local progress (0..1 as the step passes the viewport offset line)
    if (currentStepIndex >= 0 && stepElements[currentStepIndex]) {
      const stepEl = stepElements[currentStepIndex];
      const r = stepEl.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const anchor = vh * offset; // same line we use for activation

      // 0 when step top is at or below the anchor; 1 when step bottom is above the anchor
      const range = Math.max(1, r.height);
      const raw = (anchor - r.top) / range;
      const stepProgress = Math.max(0, Math.min(1, raw));

      dispatch('stepprogress', {
        index: currentStepIndex,
        step: steps[currentStepIndex],
        progress: stepProgress,
      });
    }
  }

  function handleResize() {
    observer?.disconnect();
    setupObserver();
    updateDebugInfo();
  }

  function updateDebugInfo() {
    if (!debug || !container) return;

    const rect = container.getBoundingClientRect();
    debugInfo = {
      scrollY: window.scrollY,
      containerTop: rect.top + window.scrollY,
      containerHeight: rect.height,
      viewportHeight: window.innerHeight,
      activeStep: currentStepIndex,
      stepProgress: $scrollProgress,
      stepBounds: stepElements.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          top: r.top + window.scrollY,
          bottom: r.bottom + window.scrollY,
          height: r.height,
        };
      }),
    };
  }

  function scrollToStep(index: number) {
    if (!stepElements[index]) return;

    const el = stepElements[index];
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const targetY = top - window.innerHeight * (1 - offset) + rect.height / 2;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  }

  // Draggable progress dot handlers
  function handleDotMouseDown(event: MouseEvent) {
    event.preventDefault();
    console.log('Mouse down on progress dot', event.clientX);
    startDrag(event.clientX);
  }

  function handleDotTouchStart(event: TouchEvent) {
    event.preventDefault();
    if (event.touches.length > 0) {
      startDrag(event.touches[0].clientX);
    }
  }

  function startDrag(clientX: number) {
    if (!progressBar || !progress) return;

    console.log('Starting drag', { clientX, progressBar, progress });
    isDragging = true;
    dragStartX = clientX;
    dragStartProgress = $scrollProgress;

    // Add event listeners with passive: false to ensure preventDefault works
    document.addEventListener('mousemove', handleDrag, { passive: false });
    document.addEventListener('mouseup', handleDragEnd, { passive: false });
    document.addEventListener('touchmove', handleTouchDrag, { passive: false });
    document.addEventListener('touchend', handleDragEnd, { passive: false });
  }

  function handleDrag(event: MouseEvent) {
    if (!isDragging) return;
    event.preventDefault();
    console.log('Dragging', event.clientX);
    updateProgressFromDrag(event.clientX);
  }

  function handleTouchDrag(event: TouchEvent) {
    if (!isDragging) return;
    event.preventDefault();
    if (event.touches.length > 0) {
      updateProgressFromDrag(event.touches[0].clientX);
    }
  }

  function updateProgressFromDrag(clientX: number) {
    if (!progressBar || !progress) return;

    const rect = progressBar.getBoundingClientRect();
    const deltaX = clientX - dragStartX;
    const progressDelta = deltaX / rect.width;
    const newProgress = Math.max(
      0,
      Math.min(1, dragStartProgress + progressDelta)
    );

    // Update scroll position based on progress
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const totalHeight = containerRect.height - window.innerHeight;
      const targetScrollY = container.offsetTop + newProgress * totalHeight;
      window.scrollTo({ top: targetScrollY, behavior: 'auto' });
    }

    // Update the progress dot position immediately for visual feedback
    scrollProgress.set(newProgress);
  }

  function handleDragEnd() {
    isDragging = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleTouchDrag);
    document.removeEventListener('touchend', handleDragEnd);
  }

  // Expose methods for external control
  export function getCurrentStep() {
    return steps[currentStepIndex];
  }

  export function getCurrentStepIndex() {
    return currentStepIndex;
  }

  export function getProgress() {
    return $scrollProgress;
  }

  export function goToStep(index: number) {
    scrollToStep(index);
  }
</script>

<div
  class="scrollytelling-container"
  bind:this={container}
  class:debug-mode={debug}
>
  <div class="steps-container">
    {#each steps as step, i}
      <section
        class="step"
        class:active={currentStepIndex === i}
        bind:this={stepElements[i]}
        data-step-id={step.id}
        data-step-index={i}
      >
        <slot name="step" {step} index={i} active={currentStepIndex === i}>
          <div class="step-content">
            {#if step.headline}
              <h2>{step.headline}</h2>
            {/if}
            {#if step.text}
              <p>{step.text}</p>
            {/if}
          </div>
        </slot>
      </section>
    {/each}
  </div>

  <div class="sticky-container">
    <slot
      name="graphic"
      currentStep={currentStepIndex >= 0 && currentStepIndex < steps.length ?
        steps[currentStepIndex]
      : null}
      {currentStepIndex}
      progress={$scrollProgress}
    >
      <!-- Default graphic placeholder -->
      <div class="graphic-placeholder">
        <p>Step {Math.max(0, currentStepIndex) + 1} of {steps.length}</p>
      </div>
    </slot>
  </div>

  {#if progress}
    <div class="progress-bar" bind:this={progressBar}>
      <div class="progress-fill" style="width: {$scrollProgress * 100}%"></div>
      <div
        class="progress-dot"
        style="left: {$scrollProgress * 100}%"
        role="slider"
        tabindex="0"
        aria-label="Story progress"
        aria-valuenow={Math.round($scrollProgress * 100)}
        aria-valuemin="0"
        aria-valuemax="100"
        on:mousedown={handleDotMouseDown}
        on:touchstart={handleDotTouchStart}
      ></div>
    </div>
  {/if}

  {#if debug}
    <div class="debug-panel">
      <h3>Scrollytelling Debug</h3>
      <dl>
        <dt>Active Step:</dt>
        <dd>
          {debugInfo.activeStep} ({steps[debugInfo.activeStep]?.id || 'none'})
        </dd>

        <dt>Scroll Progress:</dt>
        <dd>{(debugInfo.stepProgress * 100).toFixed(1)}%</dd>

        <dt>Scroll Y:</dt>
        <dd>{debugInfo.scrollY.toFixed(0)}px</dd>

        <dt>Container:</dt>
        <dd>
          {debugInfo.containerTop.toFixed(0)}px top, {debugInfo.containerHeight.toFixed(
            0
          )}px height
        </dd>

        <dt>Viewport:</dt>
        <dd>{debugInfo.viewportHeight}px</dd>
      </dl>

      <div class="step-minimap">
        {#each debugInfo.stepBounds as bounds, i}
          <button
            class="minimap-step"
            class:active={i === debugInfo.activeStep}
            style="height: {(bounds.height / debugInfo.containerHeight) * 100}%"
            on:click={() => scrollToStep(i)}
            title="Go to step {i + 1}"
          >
            {i}
          </button>
        {/each}
      </div>

      <div class="debug-controls">
        <button
          on:click={() => scrollToStep(Math.max(0, currentStepIndex - 1))}
        >
          Previous
        </button>
        <button
          on:click={() =>
            scrollToStep(Math.min(steps.length - 1, currentStepIndex + 1))}
        >
          Next
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .scrollytelling-container {
    position: relative;
    width: 100%;
  }

  .steps-container {
    position: relative;
    z-index: 10;
    max-width: 40rem;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .step {
    min-height: 100vh;
    display: flex;
    align-items: center;
    opacity: 0.3;
    transition: opacity 0.3s ease-out;
  }

  .step.active {
    opacity: 1;
  }

  .step-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .sticky-container {
    position: sticky;
    top: 0;
    height: 100vh;
    width: 100%;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .sticky-container :global(*) {
    pointer-events: auto;
  }

  .graphic-placeholder {
    background: #f0f0f0;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
  }

  .progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: rgba(0, 0, 0, 0.1);
    z-index: 100;
    cursor: pointer;
  }

  .progress-fill {
    height: 100%;
    background: #0066cc;
    transition: width 0.1s ease-out;
  }

  .progress-dot {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    background: #dc2626;
    border: 2px solid white;
    border-radius: 50%;
    cursor: grab;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.1s ease-out;
  }

  .progress-dot:hover {
    transform: translate(-50%, -50%) scale(1.2);
  }

  .progress-dot:active {
    cursor: grabbing;
    transform: translate(-50%, -50%) scale(1.1);
  }

  /* Debug styles */
  .debug-panel {
    position: fixed;
    right: 1rem;
    top: 1rem;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    font-size: 12px;
    font-family: monospace;
    z-index: 1000;
    max-width: 300px;
  }

  .debug-panel h3 {
    margin: 0 0 0.5rem 0;
    font-size: 14px;
  }

  .debug-panel dl {
    margin: 0;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.25rem 0.5rem;
  }

  .debug-panel dt {
    font-weight: bold;
    text-align: right;
  }

  .debug-panel dd {
    margin: 0;
  }

  .step-minimap {
    margin-top: 1rem;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }

  .minimap-step {
    position: absolute;
    width: 100%;
    background: rgba(255, 255, 255, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.5);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    transition: all 0.2s;
    color: white;
    padding: 0;
  }

  .minimap-step:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  .minimap-step.active {
    background: #0066cc;
    border-color: #0066cc;
  }

  .debug-controls {
    margin-top: 1rem;
    display: flex;
    gap: 0.5rem;
  }

  .debug-controls button {
    flex: 1;
    padding: 0.25rem 0.5rem;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }

  .debug-controls button:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Two-column layout */
  @media (min-width: 768px) {
    .scrollytelling-container {
      display: flex;
      flex-direction: row-reverse;
    }

    .steps-container {
      flex: 1;
      margin: 0;
    }

    .sticky-container {
      flex: 1;
      margin-right: 1rem;
    }
  }
</style>
