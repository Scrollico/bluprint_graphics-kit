<!--
  CategoricalBarChart.svelte - High-quality bar chart implementation
  Features precise styling, responsive design, and smooth animations
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { BaseChart } from '../../../charts/base/BaseChart';
  // ChartConfig interface - inline definition for now
  interface ChartConfig {
    margins?: { top: number; right: number; bottom: number; left: number };
    colors?: string[];
    showXAxis?: boolean;
    showYAxis?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    animationDuration?: number;
    barPadding?: number;
    [key: string]: any;
  }
  import * as d3 from 'd3';

  // Props with precise typing
  export let data: Array<{
    category: string;
    value: number;
    [key: string]: any;
  }> = [];
  export let config: ChartConfig = {};
  export let width: number = 600;
  export let height: number = 400;

  // Internal state
  let chartContainer: HTMLDivElement;
  let chartInstance: BaseChart | null = null;
  let isInitialized = false;

  // Scales and data processing
  let xScale: d3.ScaleBand<string>;
  let yScale: d3.ScaleLinear<number, number>;
  let colorScale: d3.ScaleOrdinal<string, string>;

  // Chart configuration with defaults
  $: mergedConfig = {
    margins: { top: 20, right: 20, bottom: 60, left: 80 },
    colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'],
    showXAxis: true,
    showYAxis: true,
    orientation: 'vertical',
    barPadding: 0.1,
    animationDuration: 750,
    ...config,
  };

  // Reactive updates
  $: if (isInitialized && (data || config || width || height)) {
    updateChart();
  }

  onMount(() => {
    initializeChart();
  });

  onDestroy(() => {
    if (chartInstance) {
      chartInstance.destroy();
    }
  });

  function initializeChart() {
    if (!chartContainer || !data?.length) return;

    try {
      // Create SVG with precise dimensions
      const svg = d3
        .select(chartContainer)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'categorical-bar-chart-svg')
        .style('font-family', 'system-ui, -apple-system, sans-serif');

      // Calculate inner dimensions with precise margins
      const margin = mergedConfig.margins;
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Create main group
      const g = svg
        .append('g')
        .attr('class', 'chart-main')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Setup scales with precise domain and range
      setupScales(innerWidth, innerHeight);

      // Add axes with proper styling
      addAxes(g, innerWidth, innerHeight);

      // Add bars with smooth animations
      addBars(g);

      // Add accessibility features
      addAccessibility(svg);

      // Add responsive behavior
      addResponsiveBehavior(svg);

      isInitialized = true;

      console.log('✅ CategoricalBarChart initialized', {
        data: data.length,
        width,
        height,
      });
    } catch (error) {
      console.error('❌ CategoricalBarChart initialization failed:', error);
    }
  }

  function setupScales(innerWidth: number, innerHeight: number) {
    // X scale for categories
    xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.category))
      .range([0, innerWidth])
      .padding(mergedConfig.barPadding);

    // Y scale for values
    const maxValue = d3.max(data, (d) => d.value) || 0;
    yScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% padding
      .range([innerHeight, 0]);

    // Color scale
    colorScale = d3
      .scaleOrdinal<string, string>()
      .domain(data.map((d) => d.category))
      .range(mergedConfig.colors);
  }

  function addAxes(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    innerWidth: number,
    innerHeight: number
  ) {
    if (mergedConfig.showXAxis) {
      const xAxis = g
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .style('font-size', '12px')
        .style('color', '#666666');

      // Style axis lines and ticks
      xAxis
        .select('.domain')
        .style('stroke', '#cccccc')
        .style('stroke-width', '1px');

      xAxis
        .selectAll('.tick line')
        .style('stroke', '#cccccc')
        .style('stroke-width', '1px');

      xAxis
        .selectAll('.tick text')
        .style('fill', '#666666')
        .style('text-anchor', 'middle')
        .style('font-weight', '500');
    }

    if (mergedConfig.showYAxis) {
      const yAxis = g
        .append('g')
        .attr('class', 'y-axis')
        .call(
          d3
            .axisLeft(yScale)
            .ticks(5)
            .tickFormat((d) => d.toLocaleString())
        )
        .style('font-size', '12px')
        .style('color', '#666666');

      // Style axis lines and ticks
      yAxis
        .select('.domain')
        .style('stroke', '#cccccc')
        .style('stroke-width', '1px');

      yAxis
        .selectAll('.tick line')
        .style('stroke', '#cccccc')
        .style('stroke-width', '1px');

      yAxis
        .selectAll('.tick text')
        .style('fill', '#666666')
        .style('font-weight', '500');
    }

    // Add axis labels
    if (mergedConfig.xAxisLabel) {
      g.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', '600')
        .style('fill', '#333333')
        .text(mergedConfig.xAxisLabel);
    }

    if (mergedConfig.yAxisLabel) {
      g.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -60)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', '600')
        .style('fill', '#333333')
        .text(mergedConfig.yAxisLabel);
    }
  }

  function addBars(g: d3.Selection<SVGGElement, unknown, null, undefined>) {
    // Add bars with smooth enter/update/exit animations
    const bars = g.selectAll('.bar').data(data, (d: any) => d.category);

    // Enter selection
    bars
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.category) || 0)
      .attr('y', (d) => yScale(0)) // Start from bottom
      .attr('width', xScale.bandwidth())
      .attr('height', 0) // Start with zero height
      .attr('fill', (d) => colorScale(d.category))
      .attr('rx', 2) // Rounded corners
      .attr('ry', 2)
      .style('opacity', 0)
      .transition()
      .duration(mergedConfig.animationDuration)
      .delay((d, i) => i * 50) // Staggered animation
      .attr('y', (d) => yScale(d.value))
      .attr('height', (d) => yScale(0) - yScale(d.value))
      .style('opacity', 1);

    // Update selection
    bars
      .transition()
      .duration(mergedConfig.animationDuration)
      .attr('x', (d) => xScale(d.category) || 0)
      .attr('y', (d) => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => yScale(0) - yScale(d.value))
      .attr('fill', (d) => colorScale(d.category));

    // Exit selection
    bars
      .exit()
      .transition()
      .duration(mergedConfig.animationDuration / 2)
      .style('opacity', 0)
      .attr('height', 0)
      .remove();

    // Add value labels on bars
    const labels = g.selectAll('.bar-label').data(data, (d: any) => d.category);

    labels
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d) => (xScale(d.category) || 0) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.value) - 8)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', '#333333')
      .style('opacity', 0)
      .text((d) => d.value.toLocaleString())
      .transition()
      .duration(mergedConfig.animationDuration)
      .delay((d, i) => i * 50 + mergedConfig.animationDuration / 2)
      .style('opacity', 1);

    labels
      .transition()
      .duration(mergedConfig.animationDuration)
      .attr('x', (d) => (xScale(d.category) || 0) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.value) - 8)
      .text((d) => d.value.toLocaleString());

    labels
      .exit()
      .transition()
      .duration(mergedConfig.animationDuration / 2)
      .style('opacity', 0)
      .remove();
  }

  function addAccessibility(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ) {
    // Add ARIA attributes
    svg
      .attr('role', 'img')
      .attr('aria-label', 'Categorical bar chart showing data by category');

    // Add descriptive text
    svg
      .append('desc')
      .text(
        `Bar chart displaying ${data.length} categories with values ranging from ${d3.min(data, (d) => d.value)} to ${d3.max(data, (d) => d.value)}`
      );

    // Add title
    svg.append('title').text('Categorical Bar Chart');
  }

  function addResponsiveBehavior(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ) {
    // Add viewBox for responsive scaling
    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
  }

  function updateChart() {
    if (!isInitialized || !chartContainer) return;

    // Clear existing chart
    d3.select(chartContainer).select('svg').remove();

    // Reinitialize
    initializeChart();
  }

  // Public API for parent component
  export function updateSize(newWidth: number, newHeight: number) {
    width = newWidth;
    height = newHeight;
    updateChart();
  }

  export function updateConfig(newConfig: ChartConfig) {
    config = { ...config, ...newConfig };
    mergedConfig = { ...mergedConfig, ...config };
    updateChart();
  }
</script>

<!-- Main chart container with precise styling -->
<div
  bind:this={chartContainer}
  class="categorical-bar-chart-container"
  style="width: {width}px; height: {height}px;"
>
  <!-- Chart will be rendered here by D3 -->
</div>

<!-- High-quality SCSS with precise styling -->
<style lang="scss">
  .categorical-bar-chart-container {
    position: relative;
    margin: 0;
    padding: 0;
    border-radius: 4px;
    overflow: hidden;

    .categorical-bar-chart-svg {
      display: block;
      margin: 0 auto;
      background: transparent;

      .bar {
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover {
          opacity: 0.8;
          filter: brightness(1.1);
        }
      }

      .bar-label {
        pointer-events: none;
        user-select: none;
      }

      .x-axis-label,
      .y-axis-label {
        fill: #333333;
        font-weight: 600;
      }
    }
  }

  // Responsive text sizing
  @media (max-width: 768px) {
    .bar-label {
      font-size: 10px !important;
    }

    .x-axis-label,
    .y-axis-label {
      font-size: 12px !important;
    }
  }

  // High contrast mode
  @media (prefers-contrast: high) {
    .bar {
      stroke: #000000 !important;
      stroke-width: 1px !important;
    }

    .bar-label {
      fill: #000000 !important;
      font-weight: 700 !important;
    }
  }

  // Reduced motion
  @media (prefers-reduced-motion: reduce) {
    .bar {
      transition: none !important;
    }
  }

  // Print styles
  @media print {
    .bar {
      stroke: #000000 !important;
      stroke-width: 0.5px !important;
    }

    .bar-label {
      fill: #000000 !important;
      font-size: 8px !important;
    }
  }
</style>
