<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import type { CSVRow } from '$lib/utils/csvParser';

  export let data: CSVRow[] = [];
  export let width: number = 600;
  export let height: number = 400;
  export let title: string = 'Yıllara Göre İntihar Vakaları';
  export let lineProgress: number = 1;
  // Optional highlight for a specific year (e.g., 2023 on step 7.1)
  export let highlightYear: number | null = null;
  export let highlightRadius: number = 10;
  export let dotRadius: number = 5;

  let chartContainer: HTMLDivElement;
  let svg: any;
  let linePathSel: any = null;
  let dotsSel: any = null;
  // Keep references to scales and data for annotation updates
  let xScaleRef: any = null;
  let yScaleRef: any = null;
  let chartDataRef: Array<{ year: number; cases: number }> = [];

  onMount(() => {
    if (data.length > 0) {
      createChart();
    }
  });

  $: if (data.length > 0 && chartContainer) {
    createChart();
  }

  $: if (svg && lineProgress !== undefined) {
    updateLineAnimation();
  }

  function createChart() {
    // Clear previous chart
    d3.select(chartContainer).selectAll('*').remove();

    console.log('Creating chart with data:', data);
    console.log('Line progress:', lineProgress);

    const margin = { top: 40, right: 30, bottom: 60, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    svg = d3
      .select(chartContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse data
    const chartData = data
      .map((d) => ({
        year: +d.Yıl || +d.YIL || +d.year,
        cases: +d.Vaka || +d.VAKA || +d.cases,
      }))
      .filter((d) => !isNaN(d.year) && !isNaN(d.cases));

    console.log('Parsed chart data:', chartData);

    if (chartData.length === 0) {
      console.log('No valid chart data found');
      return;
    }

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(chartData, (d) => d.year) as [number, number])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.cases) as number])
      .nice()
      .range([chartHeight, 0]);

    // Save refs for later updates
    xScaleRef = xScale;
    yScaleRef = yScale;
    chartDataRef = chartData;

    // Line generator
    const line = d3
      .line<(typeof chartData)[0]>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.cases))
      .curve(d3.curveCardinal);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .append('text')
      .attr('x', chartWidth / 2)
      .attr('y', 40)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Yıl');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -35)
      .attr('x', -chartHeight / 2)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Vaka Sayısı');

    // Add line with animation support
    linePathSel = g
      .append('path')
      .datum(chartData)
      .attr('class', 'trend-line')
      .attr('fill', 'none')
      .attr('stroke', '#d32f2f')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Get the total length of the path for animation
    const totalLength = linePathSel.node()?.getTotalLength?.() || 0;
    console.log('Line path created, total length:', totalLength);
    console.log('Line path data:', line(chartData));

    // Set up the line for animation
    linePathSel.attr('stroke-dasharray', totalLength + ' ' + totalLength);

    // For animated charts (lineProgress < 1), start with line hidden
    // For non-animated charts (lineProgress = 1), show line immediately
    if (lineProgress >= 1) {
      linePathSel.attr('stroke-dashoffset', 0);
    } else {
      linePathSel.attr('stroke-dashoffset', totalLength);
    }

    // Add dots with progressive visibility
    dotsSel = g
      .selectAll('.dot')
      .data(chartData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.year))
      .attr('cy', (d) => yScale(d.cases))
      .attr('r', (d) =>
        highlightYear != null && d.year === highlightYear ?
          highlightRadius
        : dotRadius
      )
      .attr('fill', '#d32f2f')
      .attr('stroke', (d) =>
        highlightYear != null && d.year === highlightYear ? '#b91c1c' : 'none'
      )
      .attr('stroke-width', (d) =>
        highlightYear != null && d.year === highlightYear ? 1.5 : 0
      )
      .attr('opacity', lineProgress >= 1 ? 1 : 0)
      .on('mouseover', function (event, d) {
        // Tooltip
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'chart-tooltip')
          .style('opacity', 0)
          .style('position', 'absolute')
          .style('background', 'rgba(0,0,0,0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none');

        tooltip.transition().duration(200).style('opacity', 1);

        tooltip
          .html(`<strong>${d.year}</strong><br/>Vaka: ${d.cases}`)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', function () {
        d3.selectAll('.chart-tooltip').remove();
      });

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#1a1a1a')
      .text(title);
  }

  function updateLineAnimation() {
    if (!svg) return;

    console.log('Updating line animation, progress:', lineProgress);

    const g = svg.select('g');
    // Prefer stored selection; fallback to class selector
    const linePath =
      linePathSel && linePathSel.node() ?
        linePathSel
      : g.select('path.trend-line');
    const dots = g.selectAll('.dot');

    if (linePath.empty()) {
      console.log('Line path is empty, cannot animate');
      return;
    }

    const totalLength = linePath.node().getTotalLength();
    const offset = totalLength - totalLength * lineProgress;

    console.log('Total length:', totalLength, 'Offset:', offset);

    // Animate the line progressively
    console.log('Setting stroke-dashoffset to:', offset);
    linePath.interrupt().attr('stroke-dashoffset', offset);

    // Show dots progressively
    dots.each(function (d, i) {
      const dotProgress = (i + 1) / dots.size();
      const dot = d3.select(this);

      if (lineProgress >= 1) {
        // For non-animated charts, show all dots immediately
        dot.attr('opacity', 1);
      } else if (lineProgress >= dotProgress * 0.8) {
        // For animated charts, show dots progressively
        dot.transition().duration(200).attr('opacity', 1);
      } else {
        dot.attr('opacity', 0);
      }
    });
  }

  function updateHighlight() {
    if (!svg) return;
    const g = svg.select('g');
    const dots = g.selectAll('.dot');
    dots
      .attr('r', (d: any) =>
        highlightYear != null && d.year === highlightYear ?
          highlightRadius
        : dotRadius
      )
      .attr('stroke', (d: any) =>
        highlightYear != null && d.year === highlightYear ? '#b91c1c' : 'none'
      )
      .attr('stroke-width', (d: any) =>
        highlightYear != null && d.year === highlightYear ? 1.5 : 0
      );

    // Draw/update a red box annotation around the highlighted year
    const annoSel = g
      .selectAll('.highlight-anno')
      .data(highlightYear != null ? [highlightYear] : []);

    annoSel.exit().remove();

    annoSel
      .enter()
      .append('rect')
      .attr('class', 'highlight-anno')
      .attr('fill', 'rgba(0,0,0,0)')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('rx', 4)
      .attr('ry', 4)
      .merge(annoSel as any)
      .each(function (d: number) {
        if (!xScaleRef || !yScaleRef || !chartDataRef?.length) return;
        const point = chartDataRef.find((p) => p.year === d);
        if (!point) return;
        const cx = xScaleRef(point.year);
        const cy = yScaleRef(point.cases);
        const pad = Math.max(highlightRadius, dotRadius) + 6;
        d3.select(this)
          .attr('x', cx - pad)
          .attr('y', cy - pad)
          .attr('width', pad * 2)
          .attr('height', pad * 2);
      });
  }

  $: if (svg) {
    updateHighlight();
  }
</script>

<div bind:this={chartContainer} class="chart-container"></div>

<style>
  .chart-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :global(.chart-tooltip) {
    pointer-events: none;
    z-index: 1000;
  }
</style>
