<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  export let data: Array<{ month: string; value: number }> = [];
  export let width = 800;
  export let height = 400;
  export let title = '';
  let svg: SVGSVGElement;
  let chartContainer: HTMLDivElement;

  onMount(() => {
    console.log('🎯 ONSMonthlyChart component mounted with data:', data);
    drawChart();
  });

  // Reactive statement to redraw chart when data changes
  $: if (data && data.length > 0 && svg) {
    drawChart();
  }

  function drawChart() {
    if (!svg || !data || data.length === 0) return;

    // Clear previous chart
    d3.select(svg).selectAll('*').remove();

    // Set margins and dimensions
    const margin = { top: 40, right: 30, bottom: 70, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group element
    const g = d3
      .select(svg)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) as number])
      .nice()
      .range([innerHeight, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    // Add X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('dx', '0em')
      .attr('dy', '1em');

    // Add Y axis
    g.append('g').attr('class', 'y-axis').call(yAxis);

    // Add bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.month) as number)
      .attr('width', xScale.bandwidth())
      .attr('y', (d) => yScale(d.value))
      .attr('height', (d) => innerHeight - yScale(d.value))
      .attr('fill', 'var(--series)')
      .attr('rx', 4);

    // Add value labels on bars
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', (d) => (xScale(d.month) as number) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.value) - 5)
      .attr('text-anchor', 'middle')
      .text((d) => (d.value > 0 ? d.value : ''));

    // Add title
    if (title) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(title);
    }

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - innerHeight / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Vaka Sayısı');

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .text('Aylar');
  }
</script>

<div class="ons-chart-container chart-panel" bind:this={chartContainer}>
  <svg
    bind:this={svg}
    {width}
    {height}
    role="img"
    aria-labelledby="chart-title"
  >
    <title id="chart-title">{title}</title>
  </svg>
</div>

<style lang="scss">
  .ons-chart-container {
    --axis: var(--muted-ink);
    --fg: var(--ink);
    --series: var(--accent);
    --grid: var(--grid);
    font-family: var(--font-sans);
    padding: 1rem 1.25rem;

    svg {
      width: 100%;
      height: auto;
      background: transparent;
    }

    :global(text) {
      font-family: var(--font-sans);
      fill: var(--fg);
    }

    :global(.axis path),
    :global(.axis line) {
      stroke: var(--axis);
      opacity: 0.6;
      shape-rendering: crispEdges;
    }

    :global(.grid line) {
      stroke: var(--grid);
      shape-rendering: crispEdges;
    }

    :global(.bar) {
      fill: var(--series);
      rx: 8px;
    }

    :global(.label) {
      font-size: 12px;
      font-weight: bold;
      fill: var(--fg);
    }

    :global(.tooltip) {
      background: var(--panel);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 10px;
      box-shadow: var(--shadow);
      color: var(--ink);
      font-family: var(--font-sans);
    }
  }
</style>
