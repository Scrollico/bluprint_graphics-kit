<!-- Export as default for easier importing -->
<svelte:options accessors />

<!--
  BlueprintChart.svelte - Universal Chart Component
  A robust, high-quality wrapper for all chart types with precise styling and responsive design
-->

<script context="module" lang="ts">
  // Chart type definitions
  export type ChartType =
    | 'categorical-bar'
    | 'line-area'
    | 'parliament'
    | 'county-map'
    | 'state-cartogram'
    | 'spike-map'
    | 'globetrotter';

  // Chart configuration interface
  export interface ChartConfig {
    // Layout and sizing
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    padding?: number;

    // Colors and theming
    colors?: string[];
    colorScheme?: 'default' | 'monochrome' | 'diverging' | 'sequential';
    backgroundColor?: string;

    // Typography
    fontFamily?: string;
    fontSize?: number;
    fontColor?: string;

    // Axis configuration
    showXAxis?: boolean;
    showYAxis?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;

    // Chart-specific options (extends based on chart type)
    [key: string]: any;
  }
</script>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { dev } from '$app/environment';

  // Props with precise typing
  export let type: ChartType;
  export let data: any[] | object;
  export let config: ChartConfig = {};
  export let width: number = 800;
  export let height: number = 600;
  export let responsive: boolean = true;
  export let loading: boolean = false;
  export let error: string | null = null;

  // Internal state
  let chartContainer: HTMLDivElement;
  let chartInstance: any = null;
  let isMounted = false;
  let resizeObserver: ResizeObserver | null = null;

  // Default configurations
  const defaultMargins = { top: 20, right: 20, bottom: 40, left: 60 };
  const defaultColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];

  // Component lifecycle
  onMount(() => {
    isMounted = true;
    initializeChart();

    if (responsive) {
      setupResizeObserver();
    }
  });

  onDestroy(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    if (chartInstance && typeof chartInstance.destroy === 'function') {
      chartInstance.destroy();
    }
  });

  // Initialize chart based on type
  async function initializeChart() {
    if (!isMounted || !chartContainer) return;

    try {
      // Dynamic import based on chart type
      let ChartClass;

      switch (type) {
        case 'categorical-bar':
          ChartClass = (await import('./blueprint/CategoricalBarChart.svelte'))
            .default;
          break;
        case 'line-area':
          ChartClass = (await import('./blueprint/LineAreaChart.svelte'))
            .default;
          break;
        case 'parliament':
          ChartClass = (await import('./blueprint/ParliamentChart.svelte'))
            .default;
          break;
        case 'county-map':
          ChartClass = (await import('./blueprint/CountyMapChart.svelte'))
            .default;
          break;
        case 'state-cartogram':
          ChartClass = (await import('./blueprint/StateCartogramChart.svelte'))
            .default;
          break;
        case 'spike-map':
          ChartClass = (await import('./blueprint/SpikeMapChart.svelte'))
            .default;
          break;
        case 'globetrotter':
          ChartClass = (await import('./blueprint/GlobetrotterChart.svelte'))
            .default;
          break;
        default:
          throw new Error(`Unsupported chart type: ${type}`);
      }

      // Merge configurations
      const mergedConfig: ChartConfig = {
        margins: { ...defaultMargins, ...config.margins },
        colors: config.colors || defaultColors,
        colorScheme: config.colorScheme || 'default',
        showXAxis: config.showXAxis !== false,
        showYAxis: config.showYAxis !== false,
        ...config,
      };

      // Create chart instance
      chartInstance = new ChartClass({
        target: chartContainer,
        props: {
          data,
          config: mergedConfig,
          width,
          height,
        },
      });

      if (dev) {
        console.log(`✅ BlueprintChart: ${type} initialized`, {
          data,
          config: mergedConfig,
        });
      }
    } catch (err) {
      console.error(`❌ BlueprintChart initialization failed:`, err);
      error =
        err instanceof Error ? err.message : 'Chart initialization failed';
    }
  }

  // Setup responsive behavior
  function setupResizeObserver() {
    if (!chartContainer) return;

    resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const { width: newWidth, height: newHeight } = entries[0].contentRect;

        // Debounced update to prevent excessive re-renders
        if (
          Math.abs(newWidth - width) > 10 ||
          Math.abs(newHeight - height) > 10
        ) {
          width = Math.max(320, newWidth);
          height = Math.max(240, newHeight);

          if (chartInstance && typeof chartInstance.updateSize === 'function') {
            chartInstance.updateSize(width, height);
          }
        }
      }
    });

    resizeObserver.observe(chartContainer);
  }

  // Reactive updates
  $: if (isMounted && (type || data || config || width || height)) {
    initializeChart();
  }

  $: if (
    chartInstance &&
    config &&
    typeof chartInstance.updateConfig === 'function'
  ) {
    chartInstance.updateConfig(config);
  }
</script>

<!-- Main container with precise styling -->
<div
  class="blueprint-chart-container"
  class:responsive
  class:loading
  class:error={!!error}
>
  <!-- Chart viewport -->
  <div
    bind:this={chartContainer}
    class="chart-viewport"
    style="
      width: {responsive ? '100%' : width + 'px'};
      height: {responsive ? 'auto' : height + 'px'};
      min-height: {responsive ? '400px' : 'auto'};
    "
  >
    <!-- Loading state -->
    {#if loading}
      <div class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading chart...</p>
      </div>
    {/if}

    <!-- Error state -->
    {#if error}
      <div class="error-overlay">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">Chart Error</h3>
        <p class="error-message">{error}</p>
        <button class="error-retry" on:click={() => initializeChart()}>
          Retry
        </button>
      </div>
    {/if}
  </div>

  <!-- Chart metadata (hidden by default, shown on hover in dev mode) -->
  {#if dev}
    <div class="chart-metadata">
      <small
        >Type: {type} | Size: {width}×{height} | Data: {Array.isArray(data) ?
          data.length
        : 'object'}</small
      >
    </div>
  {/if}
</div>

<!-- High-quality SCSS with precise spacing and responsive design -->
<style lang="scss">
  .blueprint-chart-container {
    position: relative;
    display: block;
    margin: 0;
    padding: 0;
    border-radius: 8px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    &.responsive {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    &.loading {
      .chart-viewport {
        opacity: 0.7;
        pointer-events: none;
      }
    }

    &.error {
      .chart-viewport {
        opacity: 0.5;
      }
    }
  }

  .chart-viewport {
    position: relative;
    margin: 0;
    padding: 16px;
    background: transparent;
    border-radius: 6px;
    overflow: hidden;

    // Ensure proper aspect ratio for responsive charts
    &::before {
      content: '';
      display: block;
      padding-bottom: 62.5%; // 5:8 aspect ratio
    }
  }

  .loading-overlay,
  .error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px);
    z-index: 10;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
  }

  .error-overlay {
    padding: 24px;
    text-align: center;
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .error-title {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #ef4444;
  }

  .error-message {
    margin: 0 0 20px 0;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.5;
    max-width: 300px;
  }

  .error-retry {
    padding: 8px 16px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: #2563eb;
    }

    &:active {
      transform: translateY(1px);
    }
  }

  .chart-metadata {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    z-index: 5;

    .blueprint-chart-container:hover & {
      opacity: 1;
    }
  }

  // Responsive breakpoints with precise sizing
  @media (max-width: 768px) {
    .blueprint-chart-container {
      margin: 0 8px;
      border-radius: 4px;

      &.responsive {
        .chart-viewport {
          padding: 12px;

          &::before {
            padding-bottom: 75%; // 4:3 aspect ratio on mobile
          }
        }
      }
    }

    .error-overlay {
      padding: 16px;
    }

    .error-title {
      font-size: 16px;
    }

    .error-message {
      font-size: 13px;
    }
  }

  @media (max-width: 480px) {
    .blueprint-chart-container {
      margin: 0 4px;
    }

    .chart-viewport {
      padding: 8px;

      &::before {
        padding-bottom: 100%; // 1:1 aspect ratio on very small screens
      }
    }

    .loading-text,
    .error-message {
      font-size: 12px;
    }
  }

  // High contrast mode support
  @media (prefers-contrast: high) {
    .blueprint-chart-container {
      border: 2px solid #000000;
    }

    .error-retry {
      border: 2px solid #000000;
    }
  }

  // Reduced motion support
  @media (prefers-reduced-motion: reduce) {
    .blueprint-chart-container,
    .error-retry {
      transition: none;
    }

    .loading-spinner {
      animation: none;
    }
  }
</style>
