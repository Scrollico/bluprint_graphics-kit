<!--
  MetroMonthlyChart.svelte
  Particle swarm visualization for Metro Istanbul monthly suicide data
  Style: Matches EuropeanSuicideChart with particle columns per month
-->

<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  export let data: any[] = [];
  export let width: number = 600;
  export let height: number = 400;
  export let title: string = "Metro İstanbul'da aylara göre vakalar";
  export let animationProgress: number = 1;

  let svg: SVGElement;
  let chartData: any[] = [];
  let chartRendered = false;
  let dataLocked = false; // Prevent data from changing once set
  let lastAnimationProgress = 0;
  let chartFullyAnimated = false;
  let renderTimeout: ReturnType<typeof setTimeout> | null = null; // Debounce renders

  // Color scale for months
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // Process data on mount and when data changes
  onMount(() => {
    if (data && data.length > 0 && !dataLocked) {
      console.log('🔍 METRO RAW DATA RECEIVED:', data);
      console.log('🔍 FIRST ITEM:', data[0]);
      console.log('🔍 DATA LENGTH:', data.length);

      // Process and sort data by date, filtering from Kasım 2020 onwards
      const processedData = data
        .map((item) => ({
          month: item.Yıl, // e.g., "Eylül 2016"
          cases: item.Vaka,
          sortDate: parseMonthYear(item.Yıl),
        }))
        .filter((item) => item.sortDate >= parseMonthYear('Kasım 2020')) // Filter from Kasım 2020
        .sort((a, b) => a.sortDate - b.sortDate);

      chartData = processedData;
      dataLocked = true;
      console.log('📊 Processed metro data (from Kasım 2020):', chartData);
      console.log('📊 Filtered data length:', chartData.length);
      console.log('🔒 DATA LOCKED - will not change during scroll');
      renderChart();
    }

    // Cleanup on destroy
    return () => {
      if (renderTimeout) {
        clearTimeout(renderTimeout);
        renderTimeout = null;
      }
    };
  });

  // Reactive statement for data changes
  $: if (data && data.length > 0) {
    if (!dataLocked) {
      console.log('🔄 METRO REACTIVE UPDATE - RAW DATA:', data);

      // Process and sort data by date, filtering from Kasım 2020 onwards
      const processedData = data
        .map((item) => ({
          month: item.Yıl,
          cases: item.Vaka,
          sortDate: parseMonthYear(item.Yıl),
        }))
        .filter((item) => item.sortDate >= parseMonthYear('Kasım 2020')) // Filter from Kasım 2020
        .sort((a, b) => a.sortDate - b.sortDate);

      chartData = processedData;
      dataLocked = true;
      console.log('📊 Processed metro data (from Kasım 2020):', chartData);
      console.log('📊 Filtered data length:', chartData.length);
      console.log('🔒 DATA LOCKED - will not change during scroll');
    } else {
      console.log('🔄 METRO REACTIVE UPDATE - DATA ALREADY LOCKED');
    }

    if (svg && chartData.length > 0) {
      renderChart();
    }
  }

  // Parse month-year string to sortable date
  function parseMonthYear(monthYear: string): number {
    const months: Record<string, number> = {
      Ocak: 1,
      Şubat: 2,
      Mart: 3,
      Nisan: 4,
      Mayıs: 5,
      Haziran: 6,
      Temmuz: 7,
      Ağustos: 8,
      Eylül: 9,
      Ekim: 10,
      Kasım: 11,
      Aralık: 12,
    };

    const parts = monthYear.split(' ');
    if (parts.length === 2) {
      const month = months[parts[0]];
      const year = parseInt(parts[1]);
      return year * 12 + month;
    }
    return 0;
  }

  function renderChart() {
    if (!svg || chartData.length === 0) return;

    // Debounce renders to improve performance
    if (renderTimeout) {
      clearTimeout(renderTimeout);
    }

    renderTimeout = setTimeout(() => {
      // Clear previous chart
      d3.select(svg).selectAll('*').remove();

      // Set up dimensions and margins
      const margin = { top: 40, right: 40, bottom: 80, left: 80 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Create scales
      const xScale = d3
        .scaleBand()
        .domain(chartData.map((d) => d.month))
        .range([0, innerWidth])
        .padding(0.3);

      const maxValue = d3.max(chartData, (d) => d.cases) || 0;
      const yScale = d3
        .scaleLinear()
        .domain([0, maxValue * 1.1])
        .range([innerHeight, 0]);

      // Create SVG group for chart content
      const chartGroup = d3
        .select(svg)
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      // Add title
      chartGroup
        .append('text')
        .attr('class', 'chart-title')
        .attr('x', innerWidth / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(title);

      // Create particle columns for each month
      chartData.forEach((d, monthIndex) => {
        const barWidth = xScale.bandwidth();
        const barX = xScale(d.month) || 0;
        const maxHeight = innerHeight - yScale(d.cases);
        const barHeight = innerHeight - yScale(d.cases);

        // Calculate particle count based on cases
        const particleCount = Math.max(
          5,
          Math.min(25, Math.floor(d.cases * 15))
        );

        // Create particles for this month
        for (let i = 0; i < particleCount; i++) {
          const particle = chartGroup
            .append('circle')
            .attr('class', 'particle')
            .attr(
              'cx',
              barX + barWidth / 2 + (Math.random() - 0.5) * barWidth * 0.6
            )
            .attr(
              'cy',
              innerHeight - Math.random() * barHeight * animationProgress
            )
            .attr('r', 0) // Start with radius 0
            .attr('fill', colorScale(d.month))
            .attr('opacity', 0); // Start invisible

          // Animate particle appearance
          particle
            .transition()
            .duration(1200)
            .delay(i * 100 + monthIndex * 200)
            .ease(d3.easeCubicOut)
            .attr('r', Math.max(2, Math.min(6, d.cases * 2)))
            .attr('opacity', 0.8 * animationProgress);
        }

        // Add month labels (rotated)
        chartGroup
          .append('text')
          .attr('class', 'month-label')
          .attr('x', barX + barWidth / 2)
          .attr('y', innerHeight + 20)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#666')
          .attr(
            'transform',
            `rotate(-45, ${barX + barWidth / 2}, ${innerHeight + 20})`
          )
          .text(d.month);

        // Add value labels above columns
        chartGroup
          .append('text')
          .attr('class', 'value-label')
          .attr('x', barX + barWidth / 2)
          .attr('y', yScale(d.cases) - 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', '#333')
          .attr('opacity', 0) // Start invisible
          .text(Math.round(d.cases))
          .transition()
          .duration(1200)
          .delay(monthIndex * 200 + 800)
          .ease(d3.easeCubicOut)
          .attr('opacity', animationProgress);
      });

      // Add Y-axis
      const yAxis = d3
        .axisLeft(yScale)
        .tickFormat(d3.format('d'))
        .ticks(Math.min(5, maxValue + 1));

      chartGroup
        .append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .selectAll('text')
        .attr('font-size', '11px')
        .attr('fill', '#666');

      // Add Y-axis label
      chartGroup
        .append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - innerHeight / 2)
        .attr('dy', '1em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text('Vaka Sayısı');

      chartRendered = true;
      console.log('🎨 Metro chart rendered successfully');
    }, 16); // 16ms timeout for 60fps performance
  }
</script>

<svg bind:this={svg} class="metro-monthly-chart"></svg>

<style>
  .metro-monthly-chart {
    display: block;
    margin: 0 auto;
  }

  :global(.metro-monthly-chart .particle) {
    transition: opacity 0.3s ease;
  }

  :global(.metro-monthly-chart .month-label) {
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }

  :global(.metro-monthly-chart .value-label) {
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }

  :global(.metro-monthly-chart .y-axis) {
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }

  :global(.metro-monthly-chart .y-axis-label) {
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }

  :global(.metro-monthly-chart .chart-title) {
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }
</style>
