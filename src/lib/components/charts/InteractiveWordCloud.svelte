<script lang="ts">
  import { onMount } from 'svelte';

  let {
    words = [],
    width = 1000,
    height = 400,
    minFrequency = 1,
    maxFrequency = 15,
  }: {
    words?: Array<{ text: string; frequency: number; color?: string }>;
    width?: number;
    height?: number;
    minFrequency?: number;
    maxFrequency?: number;
  } = $props();

  let frequencyThreshold = $state(1);
  let isDragging = $state(false);
  let dragStartX = $state(0);
  let container: HTMLDivElement;
  let trackEl: HTMLDivElement;
  let handleEl: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  // Marmaray's actual word data
  const defaultWords = [
    { text: 'üzücü', frequency: 19, color: '#dc2626' },
    { text: 'olay', frequency: 19, color: '#dc2626' },
    { text: 'sefer', frequency: 15, color: '#374151' },
    { text: 'aksaklık', frequency: 12, color: '#374151' },
    { text: 'intihar', frequency: 6, color: '#ef4444' },
    { text: 'yerleşik', frequency: 8, color: '#6b7280' },
    { text: 'istasyon', frequency: 10, color: '#6b7280' },
    { text: 'marmaray', frequency: 9, color: '#3b82f6' },
    { text: 'hat', frequency: 7, color: '#6b7280' },
    { text: 'çalışmalar', frequency: 5, color: '#6b7280' },
    { text: 'devam', frequency: 6, color: '#6b7280' },
    { text: 'etmektedir', frequency: 4, color: '#6b7280' },
    { text: 'durum', frequency: 5, color: '#6b7280' },
    { text: 'çalışma', frequency: 4, color: '#6b7280' },
    { text: 'etkinlik', frequency: 3, color: '#6b7280' },
    { text: 'planlanan', frequency: 3, color: '#6b7280' },
    { text: 'program', frequency: 3, color: '#6b7280' },
    { text: 'çerçevesinde', frequency: 3, color: '#6b7280' },
    { text: 'şirket', frequency: 2, color: '#9ca3af' },
    { text: 'müşterilerimiz', frequency: 2, color: '#9ca3af' },
    { text: 'hizmet', frequency: 2, color: '#9ca3af' },
    { text: 'ulaşım', frequency: 2, color: '#9ca3af' },
    { text: 'raylı', frequency: 2, color: '#9ca3af' },
    { text: 'sistem', frequency: 2, color: '#9ca3af' },
    { text: 'süreç', frequency: 2, color: '#9ca3af' },
    { text: 'teknik', frequency: 2, color: '#9ca3af' },
    { text: 'bakım', frequency: 2, color: '#9ca3af' },
    { text: 'onarım', frequency: 2, color: '#9ca3af' },
    { text: 'çalışmaları', frequency: 1, color: '#d1d5db' },
    { text: 'yapılmaktadır', frequency: 1, color: '#d1d5db' },
    { text: 'proje', frequency: 1, color: '#d1d5db' },
    { text: 'çalışmaları', frequency: 1, color: '#d1d5db' },
    { text: 'tamamlandı', frequency: 1, color: '#d1d5db' },
    { text: 'hizmete', frequency: 1, color: '#d1d5db' },
    { text: 'açıldı', frequency: 1, color: '#d1d5db' },
    { text: 'modern', frequency: 1, color: '#d1d5db' },
    { text: 'altyapı', frequency: 1, color: '#d1d5db' },
    { text: 'teknoloji', frequency: 1, color: '#d1d5db' },
  ];

  // Use provided words or default
  const wordData = words.length > 0 ? words : defaultWords;

  // Calculate positions for words with better spacing to prevent overlaps
  function calculateWordPositions() {
    const filteredWords = wordData.filter(
      (word) => word.frequency >= frequencyThreshold
    );
    const positions: Array<{
      word: any;
      x: number;
      y: number;
      size: number;
      opacity: number;
    }> = [];

    const centerX = width / 2;
    const centerY = height / 2 - 30; // Move bubble higher by shifting center up
    const maxRadius = Math.min(width, height) / 2 - 40; // slightly tighter margin to allow larger radius sweep
    const minRadius = 110; // start further from center for more separation

    // Sort by frequency for better positioning (larger words in center)
    const sortedWords = [...filteredWords].sort(
      (a, b) => b.frequency - a.frequency
    );

    sortedWords.forEach((word, index) => {
      const size = Math.max(12, Math.min(46, word.frequency * 2.2)); // slightly smaller to prevent overlaps

      // Create spiral pattern to prevent overlaps
      const angle = (index * 137.5 * Math.PI) / 180; // Golden angle for even distribution
      const radius =
        minRadius +
        (maxRadius - minRadius) * (index / Math.max(1, sortedWords.length - 1));

      // Add more controlled randomness and shift cloud left
      const randomOffset = (Math.random() - 0.5) * 40; // more spread
      const leftShift = -width * 0.18; // shift cloud to the left relative to width
      const x = Math.max(
        size / 2,
        Math.min(
          width - size / 2,
          centerX + leftShift + Math.cos(angle) * radius + randomOffset
        )
      );
      const y = Math.max(
        size / 2,
        Math.min(
          height - size / 2,
          centerY + Math.sin(angle) * radius + randomOffset
        )
      );

      positions.push({
        word,
        x,
        y,
        size,
        opacity: 1,
      });
    });

    return positions;
  }

  let wordPositions = $state(calculateWordPositions());

  // Track slider geometry so the handle stays within the track bounds
  let trackWidth = $state(0);
  let handleHalfWidth = $state(13); // measured handle radius (includes border)

  // Update positions when threshold changes
  $effect(() => {
    wordPositions = calculateWordPositions();
  });

  $effect(() => {
    trackWidth = trackEl?.clientWidth || 0;
  });

  $effect(() => {
    handleHalfWidth = (handleEl?.offsetWidth || 26) / 2;
  });

  // Handle mouse/touch events for dragging
  function handleMouseDown(event: MouseEvent) {
    isDragging = true;
    dragStartX = event.clientX;
    updateFrequencyFromPosition(event.clientX);
  }

  function handleMouseMove(event: MouseEvent) {
    if (isDragging) {
      updateFrequencyFromPosition(event.clientX);
    }
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleTouchStart(event: TouchEvent) {
    isDragging = true;
    dragStartX = event.touches[0].clientX;
    updateFrequencyFromPosition(event.touches[0].clientX);
  }

  function handleTouchMove(event: TouchEvent) {
    if (isDragging) {
      event.preventDefault();
      updateFrequencyFromPosition(event.touches[0].clientX);
    }
  }

  function handleTouchEnd() {
    isDragging = false;
  }

  function updateFrequencyFromPosition(clientX: number) {
    const rect = (trackEl || container)?.getBoundingClientRect?.();
    if (!rect) return;
    const relativeX = clientX - rect.left;
    const hw = handleHalfWidth || 0;
    const usableWidth = Math.max(1, rect.width - hw * 2);
    const clamped = Math.max(hw, Math.min(rect.width - hw, relativeX));
    const percentage = (clamped - hw) / usableWidth;
    frequencyThreshold = Math.round(
      minFrequency + (maxFrequency - minFrequency) * percentage
    );
  }

  function handleTrackKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      frequencyThreshold = Math.max(minFrequency, frequencyThreshold - 1);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      frequencyThreshold = Math.min(maxFrequency, frequencyThreshold + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      frequencyThreshold = minFrequency;
    } else if (event.key === 'End') {
      event.preventDefault();
      frequencyThreshold = maxFrequency;
    }
  }

  onMount(() => {
    // Add global mouse/touch event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    const resizeObserver = new ResizeObserver(() => {
      trackWidth = trackEl?.clientWidth || 0;
    });
    if (trackEl) resizeObserver.observe(trackEl);

    handleHalfWidth = (handleEl?.offsetWidth || 26) / 2;

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      resizeObserver.disconnect();
    };
  });

  // Calculate slider position - horizontal across the bottom
  const sliderRatio = $derived(() => {
    if (maxFrequency === minFrequency) return 0;
    const raw =
      (Number(frequencyThreshold) - Number(minFrequency)) /
      Math.max(1, Number(maxFrequency) - Number(minFrequency));
    return Math.max(0, Math.min(1, raw));
  });

  const sliderFillWidth = $derived(() => `${(sliderRatio() || 0) * 100}%`);

  const sliderHandleLeft = $derived(() => {
    const width = trackWidth || 0;
    if (width <= 0) return '0px';
    const hw = handleHalfWidth || 0;
    const usableWidth = Math.max(0, width - hw * 2);
    const px = hw + (sliderRatio() || 0) * usableWidth;
    return `${px}px`;
  });

  // Get filtered words count
  const filteredWordsCount = $derived(() => {
    return wordData.filter((word) => word.frequency >= frequencyThreshold)
      .length;
  });

  const totalWordsCount = wordData.length;
</script>

<div class="interactive-word-cloud" bind:this={container}>
  <!-- Word cloud visualization -->
  <div class="word-cloud-container">
    <svg {width} {height} class="word-cloud-svg">
      {#each wordPositions as { word, x, y, size, opacity }}
        <text
          {x}
          {y}
          font-size={size}
          fill={word.color || '#374151'}
          text-anchor="middle"
          dominant-baseline="middle"
          class="word-text"
          style="opacity: {opacity};"
        >
          {word.text}
        </text>
      {/each}
    </svg>

    <!-- Horizontal frequency bar slider -->
    <div class="frequency-bar-container">
      <div
        class="frequency-bar-track"
        bind:this={trackEl}
        onmousedown={handleMouseDown}
        ontouchstart={handleTouchStart}
        role="slider"
        tabindex="0"
        aria-valuemin={minFrequency}
        aria-valuemax={maxFrequency}
        aria-valuenow={frequencyThreshold}
        onkeydown={handleTrackKeyDown}
        aria-label="Kelime frekans eşiği"
      >
        <div class="frequency-bar-fill" style="width: {sliderFillWidth};"></div>
        <div
          class="frequency-bar-handle"
          style="left: {sliderHandleLeft};"
          bind:this={handleEl}
          onmousedown={handleMouseDown}
          ontouchstart={handleTouchStart}
          role="slider"
          tabindex="0"
          aria-label="Kelime frekans eşiği"
          aria-valuemin={minFrequency}
          aria-valuemax={maxFrequency}
          aria-valuenow={frequencyThreshold}
        >
          <div class="frequency-value">{frequencyThreshold}+</div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .interactive-word-cloud {
    background: transparent; /* naked */
    border-radius: 0;
    padding: 0;
    border: none;
    position: relative;
    margin: 0;
    overflow: visible; /* Ensure nothing gets cropped */
  }

  .word-cloud-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .word-cloud-header h4 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #dc2626;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .stats {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: #6b7280;
  }

  .stat {
    background: #f3f4f6;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: 500;
  }

  .word-cloud-container {
    position: relative;
    height: 400px;
    margin: 0;
    overflow: visible; /* Allow draggable line to extend beyond container */
    border: none;
    border-radius: 0;
    background: transparent;
  }

  .word-cloud-svg {
    width: 100%;
    height: 100%;
  }

  .word-text {
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-weight: 600;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
    user-select: none;
  }

  .word-text:hover {
    transform: scale(1.1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  .frequency-bar-container {
    position: absolute;
    bottom: -6px; /* push the line a bit down */
    left: 20px;
    right: 20px;
    height: 40px;
    z-index: 10;
  }

  .frequency-bar-track {
    position: relative;
    width: 100%;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    cursor: pointer;
  }

  .frequency-bar-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%);
    border-radius: 4px;
    transition: width 0.1s ease;
  }

  .frequency-bar-handle {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    background: #dc2626;
    border: 3px solid white;
    border-radius: 50%;
    cursor: grab;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  .frequency-bar-handle:active {
    cursor: grabbing;
    transform: translateY(-50%) scale(1.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .frequency-value {
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    background: #dc2626;
    color: white;
    padding: 0.2rem 0.4rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    white-space: nowrap;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .instructions {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
    text-align: center;
    color: #6b7280;
    font-size: 0.9rem;
    background: rgba(248, 250, 252, 0.5);
    border-radius: 8px;
    padding: 1rem;
  }

  .instructions p {
    margin: 0.25rem 0;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .interactive-word-cloud {
      padding: 1rem;
      margin: 0.5rem 0;
    }

    .word-cloud-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
      margin-bottom: 1rem;
    }

    .stats {
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .word-cloud-container {
      height: 300px;
      margin: 1rem 0;
      border-radius: 6px;
    }

    .word-cloud-svg {
      width: 100%;
      height: 100%;
    }

    .line-handle {
      width: 36px;
      height: 36px;
      border-width: 2px;
    }

    .line-indicator {
      height: 16px;
    }

    .line-label {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      top: -28px;
      border-width: 1px;
    }

    .instructions {
      font-size: 0.8rem;
      margin-top: 1rem;
    }

    .instructions p {
      margin: 0.25rem 0;
    }
  }

  /* Extra small screens */
  @media (max-width: 480px) {
    .word-cloud-container {
      height: 250px;
    }

    .line-handle {
      width: 32px;
      height: 32px;
    }

    .line-label {
      font-size: 0.7rem;
      padding: 0.2rem 0.4rem;
    }

    .interactive-word-cloud {
      padding: 0.75rem;
    }
  }

  /* Animation for words appearing/disappearing */
  @keyframes wordFadeIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes wordFadeOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.8);
    }
  }

  .word-text {
    animation: wordFadeIn 0.5s ease-out;
  }
</style>
