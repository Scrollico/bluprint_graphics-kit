<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let data: Array<{ x: string | number; y: number }> = [];
  export let width: number = 600;
  export let height: number = 300;
  export let margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40,
  };

  let svg: SVGSVGElement;
  let container: HTMLDivElement;

  onMount(() => {
    if (!data.length) return;

    // Clear any existing content
    d3.select(svg).selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.x.toString()))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.y) || 0])
      .range([innerHeight, 0])
      .nice();

    // Create SVG group
    const g = d3
      .select(svg)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style('font-size', '12px')
      .style('color', '#666');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .style('font-size', '12px')
      .style('color', '#666');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .style('stroke', '#f0f0f0')
      .style('stroke-width', 1)
      .style('opacity', 0.3)
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      );

    // Add bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.x.toString()) || 0)
      .attr('y', (d) => yScale(d.y))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => innerHeight - yScale(d.y))
      .attr('fill', '#1f2937')
      .attr('rx', 2); // Slight rounding for modern look
  });
</script>

<div class="minimal-bar-chart" bind:this={container}>
  <svg bind:this={svg}></svg>
</div>

<style>
  .minimal-bar-chart {
    width: 100%;
    height: auto;
  }

  .minimal-bar-chart svg {
    width: 100%;
    height: 100%;
  }

  /* Remove default axis styling */
  .minimal-bar-chart :global(.domain) {
    stroke: #ddd;
    stroke-width: 1;
  }

  .minimal-bar-chart :global(.tick line) {
    stroke: #ddd;
    stroke-width: 1;
  }

  .minimal-bar-chart :global(.tick text) {
    fill: #666;
    font-size: 12px;
  }
</style>
