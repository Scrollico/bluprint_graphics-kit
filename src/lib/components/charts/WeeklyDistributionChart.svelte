<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import type { CSVRow } from '$lib/utils/csvParser';
  import {
    ONS_COLORS,
    DATA_COLORS,
    TYPOGRAPHY,
    createColorScale,
    createBandScale,
    createLinearScale,
    createTooltip,
    showTooltip,
    hideTooltip,
    animateBars,
  } from '$lib/utils/chartUtils';

  export let data: CSVRow[] = [];
  export let width: number = 600;
  export let height: number = 400;
  export let title: string = 'Günlere Göre İntihar Vakaları';
  // Progress 0..1 to grow bars progressively
  export let barProgress: number = 1;

  let chartContainer: HTMLDivElement;
  let svg: any;
  let gSel: any = null;
  let xScaleRef: any = null;
  let yScaleRef: any = null;
  let chartDataRef: Array<{ day: string; cases: number }> = [];
  let chartHeightRef = 0;
  let tooltip: any = null;

  // Turkish day names in correct order
  const dayOrder = [
    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi',
    'Pazar',
  ];

  onMount(() => {
    if (data.length > 0) {
      createChart();
    }
    // Initialize tooltip
    tooltip = createTooltip();
  });

  $: if (data.length > 0 && chartContainer) {
    createChart();
  }

  // When barProgress changes, ensure we update the bars
  $: if (svg && barProgress !== undefined) {
    updateBars();
  }

  function createChart() {
    // Clear previous chart
    d3.select(chartContainer).selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 80, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    chartHeightRef = chartHeight;

    svg = d3
      .select(chartContainer)
      .append('svg')
      .attr('class', 'chart-svg')
      .attr('width', width)
      .attr('height', height)
      .style('font-family', TYPOGRAPHY.fontFamily)
      .style('font-size', TYPOGRAPHY.fontSizes.sm)
      .style('color', ONS_COLORS.text);

    // Add background
    svg
      .append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', ONS_COLORS.background);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    gSel = g;

    // Parse and sort data by day order
    const chartData = data
      .map((d) => ({
        day: d.Gün?.toString() || d.GUN?.toString() || d.day?.toString(),
        cases: +d.Vaka || +d.VAKA || +d.cases,
      }))
      .filter((d) => d.day && !isNaN(d.cases));

    // Sort by day order
    chartData.sort((a, b) => {
      const aIndex = dayOrder.indexOf(a.day);
      const bIndex = dayOrder.indexOf(b.day);
      return aIndex - bIndex;
    });

    if (chartData.length === 0) return;

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(chartData.map((d) => d.day))
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.cases) as number])
      .nice()
      .range([chartHeight, 0]);

    xScaleRef = xScale;
    yScaleRef = yScale;
    chartDataRef = chartData;

    // Color scale using ONS design system
    const colorScale = createColorScale(chartData.map((d) => d.day));

    // Add axes with unified styling
    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .style('font-family', TYPOGRAPHY.fontFamily)
      .style('font-size', TYPOGRAPHY.fontSizes.xs)
      .style('color', ONS_COLORS.textSecondary)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', TYPOGRAPHY.fontSizes.xs);

    g.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(yScale))
      .style('font-family', TYPOGRAPHY.fontFamily)
      .style('font-size', TYPOGRAPHY.fontSizes.xs)
      .style('color', ONS_COLORS.textSecondary)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -35)
      .attr('x', -chartHeight / 2)
      .attr('fill', ONS_COLORS.text)
      .style('text-anchor', 'middle')
      .style('font-size', TYPOGRAPHY.fontSizes.sm)
      .style('font-weight', TYPOGRAPHY.fontWeights.medium)
      .text('Vaka Sayısı');

    // Add bars (progressive height) - start with current progress
    const currentProgress = Math.max(0, Math.min(1, barProgress));
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.day) as number)
      .attr('width', xScale.bandwidth())
      .attr('y', (d) => yScale((d.cases || 0) * currentProgress))
      .attr('height', (d) => {
        const y = yScale((d.cases || 0) * currentProgress);
        return chartHeight - y;
      })
      .attr('fill', (d) => colorScale(d.day) as string)
      .attr('opacity', 0.8)
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 1);
        showTooltip(
          tooltip,
          `<strong>${d.day}</strong><br/>Vaka: ${d.cases}`,
          event.pageX,
          event.pageY
        );
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0.8);
        hideTooltip(tooltip);
      });

    // Add value labels on bars (fade in towards end)
    g.selectAll('.bar-label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d) => (xScale(d.day) as number) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale((d.cases || 0) * currentProgress) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', TYPOGRAPHY.fontSizes.xs)
      .style('font-weight', TYPOGRAPHY.fontWeights.semibold)
      .style('fill', ONS_COLORS.text)
      .style('opacity', currentProgress >= 0.95 ? 1 : 0)
      .text((d) => d.cases);

    // Add title with unified styling
    svg
      .append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .style('font-size', TYPOGRAPHY.fontSizes.lg)
      .style('font-weight', TYPOGRAPHY.fontWeights.semibold)
      .style('fill', ONS_COLORS.text)
      .style('font-family', TYPOGRAPHY.fontFamily)
      .text(title);
  }

  // Update bars when barProgress changes
  function updateBars() {
    if (!svg || !xScaleRef || !yScaleRef) return;
    const g = gSel || svg.select('g');
    if (!g) return;

    const chartH = chartHeightRef || Number(svg.attr('height')) || 0;
    const prog = Math.max(0, Math.min(1, barProgress));

    g.selectAll('rect.bar')
      .transition()
      .duration(150)
      .ease(d3.easeLinear)
      .attr('y', (d: any) => yScaleRef((d.cases || 0) * prog))
      .attr('height', (d: any) => chartH - yScaleRef((d.cases || 0) * prog));

    g.selectAll('text.bar-label')
      .transition()
      .duration(150)
      .attr('y', (d: any) => yScaleRef((d.cases || 0) * prog) - 5)
      .style('opacity', prog >= 0.95 ? 1 : 0);
  }

  // Re-run updates when these change
  $: {
    barProgress;
    svg;
    xScaleRef;
    yScaleRef;
    gSel;
    chartHeightRef;
    updateBars();
  }
</script>

<div bind:this={chartContainer} class="chart-container"></div>

<style>
  @import '../../styles/chart-design-system.scss';

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
</style>
