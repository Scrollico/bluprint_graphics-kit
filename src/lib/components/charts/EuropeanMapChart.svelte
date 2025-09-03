<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';

  export let data: Array<{ country: string; value: number }> = [];

  let chartContainer: HTMLElement;
  let chart: any;

  // European country data mapping with ISO codes
  const countryMapping = {
    AUT: { name: 'Austria', iso: 'AUT' },
    BEL: { name: 'Belgium', iso: 'BEL' },
    BGR: { name: 'Bulgaria', iso: 'BGR' },
    CHE: { name: 'Switzerland', iso: 'CHE' },
    CZE: { name: 'Czech Republic', iso: 'CZE' },
    DEU: { name: 'Germany', iso: 'DEU' },
    DNK: { name: 'Denmark', iso: 'DNK' },
    EST: { name: 'Estonia', iso: 'EST' },
    GRC: { name: 'Greece', iso: 'GRC' },
    ESP: { name: 'Spain', iso: 'ESP' },
    FIN: { name: 'Finland', iso: 'FIN' },
    FRA: { name: 'France', iso: 'FRA' },
    HRV: { name: 'Croatia', iso: 'HRV' },
    HUN: { name: 'Hungary', iso: 'HUN' },
    IRL: { name: 'Ireland', iso: 'IRL' },
    ITA: { name: 'Italy', iso: 'ITA' },
    LTU: { name: 'Lithuania', iso: 'LTU' },
    LUX: { name: 'Luxembourg', iso: 'LUX' },
    LVA: { name: 'Latvia', iso: 'LVA' },
    NLD: { name: 'Netherlands', iso: 'NLD' },
    NOR: { name: 'Norway', iso: 'NOR' },
    POL: { name: 'Poland', iso: 'POL' },
    PRT: { name: 'Portugal', iso: 'PRT' },
    ROU: { name: 'Romania', iso: 'ROU' },
    SWE: { name: 'Sweden', iso: 'SWE' },
    SVN: { name: 'Slovenia', iso: 'SVN' },
    SVK: { name: 'Slovakia', iso: 'SVK' },
  };

  onMount(async () => {
    if (!chartContainer || data.length === 0) return;

    // Clear previous chart
    d3.select(chartContainer).selectAll('*').remove();

    // Set up dimensions
    const width = chartContainer.clientWidth;
    const height = chartContainer.clientHeight;
    const margin = { top: 40, right: 20, bottom: 60, left: 20 };

    // Create SVG
    const svg = d3
      .select(chartContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#f8f9fa');

    // Transform data
    const transformedData = data.map((item) => ({
      country:
        countryMapping[item.country as keyof typeof countryMapping]?.name ||
        item.country,
      code: item.country,
      iso:
        countryMapping[item.country as keyof typeof countryMapping]?.iso ||
        item.country,
      value: item.value,
    }));

    const maxValue = d3.max(transformedData, (d) => d.value) || 1;
    const colorScale = d3
      .scaleSequential()
      .domain([0, maxValue])
      .interpolator(d3.interpolateBlues);

    // Create a circular layout for better visual appeal
    const radius = Math.min(width, height) / 3;
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate positions in a circle
    const angleStep = (2 * Math.PI) / transformedData.length;

    // Create country circles
    const countryGroups = svg
      .append('g')
      .selectAll('g')
      .data(transformedData)
      .enter()
      .append('g')
      .attr('transform', (d, i) => {
        const angle = i * angleStep - Math.PI / 2; // Start from top
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        return `translate(${x}, ${y})`;
      });

    // Add circle shapes
    const circleRadius = Math.min(30, radius / 4);
    countryGroups
      .append('circle')
      .attr('r', (d) => circleRadius * (0.5 + (d.value / maxValue) * 0.5))
      .attr('fill', (d) => colorScale(d.value))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('stroke', '#333').attr('stroke-width', 3);

        // Show tooltip
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'european-map-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0,0,0,0.9)')
          .style('color', 'white')
          .style('padding', '12px')
          .style('border-radius', '6px')
          .style('font-size', '14px')
          .style('font-weight', '500')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)')
          .style('border', '1px solid rgba(255,255,255,0.2)');

        tooltip
          .html(
            `
          <div style="text-align: center;">
            <div style="font-weight: bold; margin-bottom: 4px;">${d.country}</div>
            <div style="font-size: 18px; color: #4CAF50;">${d.value.toFixed(1)}</div>
          </div>
        `
          )
          .style('left', event.pageX + 15 + 'px')
          .style('top', event.pageY - 15 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke', '#fff').attr('stroke-width', 2);

        d3.selectAll('.european-map-tooltip').remove();
      });

    // Add country codes inside circles
    countryGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .style('pointer-events', 'none')
      .text((d) => d.code);

    // Add connecting lines from center
    svg
      .append('g')
      .selectAll('line')
      .data(transformedData)
      .enter()
      .append('line')
      .attr('x1', centerX)
      .attr('y1', centerY)
      .attr('x2', (d, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return centerX + Math.cos(angle) * radius;
      })
      .attr('y2', (d, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return centerY + Math.sin(angle) * radius;
      })
      .attr('stroke', '#ddd')
      .attr('stroke-width', 1)
      .style('opacity', 0.5);

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('European Countries Data Visualization');

    // Add subtitle
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text('Hover over countries to see detailed values');

    // Create legend
    const legendWidth = 250;
    const legendHeight = 25;
    const legendX = width - legendWidth - margin.right;
    const legendY = height - legendHeight - margin.bottom - 20;

    const legend = svg
      .append('g')
      .attr('transform', `translate(${legendX}, ${legendY})`);

    // Legend gradient
    const defs = svg.append('defs');
    const legendGradient = defs
      .append('linearGradient')
      .attr('id', 'europeanMapLegendGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    legendGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colorScale(0));

    legendGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorScale(maxValue));

    // Legend rectangle
    legend
      .append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('rx', 4)
      .style('fill', 'url(#europeanMapLegendGradient)')
      .style('stroke', '#ccc')
      .style('stroke-width', 1);

    // Legend scale
    const legendScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([0, legendWidth]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(6)
      .tickFormat(d3.format('.0f'))
      .tickSize(6);

    // Legend axis
    legend
      .append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#666');

    // Legend label
    legend
      .append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#333')
      .text('Value Scale');

    // Add some statistics
    const totalValue = d3.sum(transformedData, (d) => d.value);
    const avgValue = totalValue / transformedData.length;
    const maxCountry = d3.max(transformedData, (d) => d.value);
    const minCountry = d3.min(transformedData, (d) => d.value);

    // Stats box
    const statsBox = svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left}, ${height - margin.bottom - 80})`
      );

    statsBox
      .append('rect')
      .attr('width', 200)
      .attr('height', 60)
      .attr('rx', 6)
      .style('fill', 'rgba(255,255,255,0.9)')
      .style('stroke', '#ddd')
      .style('stroke-width', 1);

    // Stats text
    const stats = [
      { label: 'Total', value: totalValue.toFixed(1) },
      { label: 'Average', value: avgValue.toFixed(1) },
      { label: 'Max', value: maxCountry?.toFixed(1) || '0' },
      { label: 'Min', value: minCountry?.toFixed(1) || '0' },
    ];

    stats.forEach((stat, i) => {
      const x = 10 + (i % 2) * 95;
      const y = 20 + Math.floor(i / 2) * 25;

      statsBox
        .append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .text(stat.label + ':');

      statsBox
        .append('text')
        .attr('x', x + 35)
        .attr('y', y)
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(stat.value);
    });
  });

  onDestroy(() => {
    if (chartContainer) {
      d3.select(chartContainer).selectAll('*').remove();
    }
    d3.selectAll('.european-map-tooltip').remove();
  });
</script>

<div bind:this={chartContainer} class="european-map-chart"></div>

<style>
  .european-map-chart {
    width: 100%;
    height: 100%;
    min-height: 500px;
    background: #f8f9fa;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  :global(.european-map-tooltip) {
    transition: opacity 0.2s ease-in-out;
  }
</style>
