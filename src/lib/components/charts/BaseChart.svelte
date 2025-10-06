<!--
  BaseChart.svelte - Unified Chart Base Component
  Provides consistent styling, colors, typography, and behavior for all charts
  Based on ONS Charts design system principles
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import type { CSVRow } from '$lib/utils/csvParser';

  // Chart configuration interface
  interface ChartConfig {
    // Layout and sizing
    width?: number;
    height?: number;
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };

    // Colors and theming
    colors?: string[];
    colorScheme?: 'default' | 'monochrome' | 'diverging' | 'sequential';
    backgroundColor?: string;

    // Typography
    fontFamily?: string;
    fontSize?: number;
    fontColor?: string;

    // Chart elements
    showTitle?: boolean;
    showSubtitle?: boolean;
    showCaption?: boolean;
    showLegend?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;

    // Animation
    animationDuration?: number;
    animationEasing?: string;

    // Accessibility
    ariaLabel?: string;
    ariaDescription?: string;
  }

  // Props
  export let data: CSVRow[] = [];
  export let title: string = '';
  export let subtitle: string = '';
  export let caption: string = '';
  export let config: ChartConfig = {};
  export let loading: boolean = false;
  export let error: string | null = null;

  // Chart container reference
  let chartContainer: HTMLDivElement;
  let svg: any;
  let chartWidth: number;
  let chartHeight: number;
  let isMounted = false;

  // Default configuration
  const defaultConfig: ChartConfig = {
    width: 800,
    height: 400,
    margins: { top: 40, right: 20, bottom: 40, left: 60 },
    colors: [
      '#1d70b8', // ONS Blue
      '#d4351c', // ONS Red
      '#00703c', // ONS Green
      '#f47738', // ONS Orange
      '#28a197', // ONS Teal
      '#912b88', // ONS Purple
      '#f499be', // ONS Pink
      '#b58840', // ONS Brown
    ],
    colorScheme: 'default',
    backgroundColor: '#ffffff',
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    fontColor: '#0b0c0c',
    showTitle: true,
    showSubtitle: false,
    showCaption: false,
    showLegend: false,
    showGrid: true,
    showTooltip: true,
    animationDuration: 300,
    animationEasing: 'ease-in-out',
    ariaLabel: 'Data visualization',
    ariaDescription: 'Interactive chart showing data trends',
  };

  // Merged configuration
  $: mergedConfig = { ...defaultConfig, ...config };

  // Color scale
  $: colorScale = d3.scaleOrdinal(mergedConfig.colors);

  // Chart dimensions
  $: chartWidth =
    mergedConfig.width! -
    mergedConfig.margins!.left -
    mergedConfig.margins!.right;
  $: chartHeight =
    mergedConfig.height! -
    mergedConfig.margins!.top -
    mergedConfig.margins!.bottom;

  onMount(() => {
    isMounted = true;
    if (data.length > 0 && !loading && !error) {
      createChart();
    }
  });

  onDestroy(() => {
    if (svg) {
      svg.remove();
    }
  });

  // Reactive chart creation
  $: if (isMounted && data.length > 0 && !loading && !error) {
    createChart();
  }

  function createChart() {
    if (!chartContainer || !data.length) return;

    // Clear previous chart
    d3.select(chartContainer).selectAll('*').remove();

    // Create SVG
    svg = d3
      .select(chartContainer)
      .append('svg')
      .attr('class', 'chart-svg')
      .attr('width', mergedConfig.width)
      .attr('height', mergedConfig.height)
      .attr('aria-label', mergedConfig.ariaLabel)
      .attr('aria-description', mergedConfig.ariaDescription)
      .style('font-family', mergedConfig.fontFamily)
      .style('font-size', `${mergedConfig.fontSize}px`)
      .style('color', mergedConfig.fontColor);

    // Add background
    svg
      .append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', mergedConfig.backgroundColor);

    // Create main chart group
    const g = svg
      .append('g')
      .attr(
        'transform',
        `translate(${mergedConfig.margins!.left}, ${mergedConfig.margins!.top})`
      );

    // Add title
    if (mergedConfig.showTitle && title) {
      svg
        .append('text')
        .attr('class', 'chart-title')
        .attr('x', mergedConfig.width! / 2)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', '600')
        .style('fill', '#0b0c0c')
        .text(title);
    }

    // Add subtitle
    if (mergedConfig.showSubtitle && subtitle) {
      svg
        .append('text')
        .attr('class', 'chart-subtitle')
        .attr('x', mergedConfig.width! / 2)
        .attr('y', 45)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#505a5f')
        .text(subtitle);
    }

    // Add caption
    if (mergedConfig.showCaption && caption) {
      svg
        .append('text')
        .attr('class', 'chart-caption')
        .attr('x', mergedConfig.margins!.left)
        .attr('y', mergedConfig.height! - 10)
        .style('font-size', '12px')
        .style('fill', '#626a6e')
        .text(caption);
    }

    // Store chart group for child components
    g.attr('class', 'chart-main');

    // Dispatch chart ready event
    const event = new CustomEvent('chartReady', {
      detail: { svg, g, config: mergedConfig, data },
    });
    chartContainer.dispatchEvent(event);
  }

  // Utility functions for child components
  export function getSvg() {
    return svg;
  }

  export function getChartGroup() {
    return svg?.select('.chart-main');
  }

  export function getColorScale() {
    return colorScale;
  }

  export function getDimensions() {
    return { width: chartWidth, height: chartHeight };
  }

  export function getMargins() {
    return mergedConfig.margins!;
  }
</script>

<div
  bind:this={chartContainer}
  class="chart-container"
  class:loading
  class:error
>
  {#if loading}
    <div class="chart-loading">
      <div>Loading chart...</div>
    </div>
  {:else if error}
    <div class="chart-error">
      <div>Error: {error}</div>
    </div>
  {:else if !data.length}
    <div class="chart-no-data">
      <div>No data available</div>
    </div>
  {/if}
</div>

<style>
  .chart-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
    border-radius: 0;
    box-shadow: none;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      sans-serif;
  }

  .chart-container.loading {
    background: #f8f9fa;
  }

  .chart-container.error {
    background: #fef2f2;
    border: 1px solid #fecaca;
  }

  .chart-loading,
  .chart-error,
  .chart-no-data {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 14px;
    text-align: center;
  }

  .chart-loading {
    color: #505a5f;
  }

  .chart-error {
    color: #d4351c;
  }

  .chart-no-data {
    color: #626a6e;
  }
</style>
