<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import {
    chartTransition,
    type BubbleNode,
  } from '$lib/stores/chartTransition';

  export let data: any[] = [];
  export let width: number = 800;
  export let height: number = 500;
  export let title: string = 'European Railway Suicide Data';
  // Removed highlightCountry as it's not used for year-based data
  export let animationProgress: number = 1;

  let svg: SVGElement;
  let chartData: any[] = [];
  let chartRendered = false;
  let dataLocked = false; // Prevent data from changing once set
  let lastAnimationProgress = 0;
  let chartFullyAnimated = false;
  let renderTimeout: ReturnType<typeof setTimeout> | null = null; // Debounce renders

  // Handle transition from GlobalSolutionsSwarm
  $: if (chartTransition) {
    chartTransition.subscribe((state) => {
      if (state.isTransitioning && state.toStep === 'step-19') {
        console.log(
          '🎬 Starting transition from GlobalSolutionsSwarm to EuropeanSuicideChart'
        );
        console.log('🎬 Transition bubbles:', state.bubbles);
        // Start transition animation
        animateTransitionFromSolutions(state.bubbles);
      }
    });
  }

  // Animate transition from solution bubbles to country data
  function animateTransitionFromSolutions(solutionBubbles: BubbleNode[]) {
    if (!svg || !solutionBubbles.length || !chartData.length) return;

    console.log(
      '🎬 Transition function called with',
      solutionBubbles.length,
      'bubbles'
    );
    console.log('🎬 Chart data available:', chartData.length, 'countries');

    // Recreate scales for transition calculation
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3
      .scaleBand()
      .domain(chartData.map((d) => d.ÜLKE))
      .range([0, innerWidth])
      .padding(0.3);

    const maxValue = d3.max(chartData, (d) => d.SAYI) || 0;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([innerHeight, 0]);

    // Create transition bubbles that will morph into country data
    const transitionBubbles = solutionBubbles.map((bubble) => {
      // Distribute bubbles more evenly across countries
      const countryIndex = Math.floor(Math.random() * chartData.length);
      const countryData = chartData[countryIndex];

      return {
        ...bubble,
        targetX: (xScale(countryData.ÜLKE) || 0) + xScale.bandwidth() / 2,
        targetY: innerHeight - yScale(countryData.SAYI),
        targetRadius: Math.max(3, Math.min(8, countryData.SAYI / 80)),
        targetColor: colorScale(countryData.ÜLKE) as string,
        targetCountry: countryData.ÜLKE,
      };
    });

    console.log('🎬 Transition bubbles prepared:', transitionBubbles.length);

    // Clear any existing transition bubbles
    d3.select(svg).selectAll('[data-transition-id]').remove();

    // Create and animate transition bubbles
    transitionBubbles.forEach((bubble, index) => {
      // Create transition bubble
      d3.select(svg)
        .append('circle')
        .attr('data-transition-id', bubble.id)
        .attr('class', 'transition-bubble')
        .attr('cx', bubble.x)
        .attr('cy', bubble.y)
        .attr('r', bubble.radius)
        .attr('fill', bubble.color)
        .attr('opacity', 0.9)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1);

      // Animate to target position with smooth easing
      d3.select(svg)
        .select(`[data-transition-id="${bubble.id}"]`)
        .transition()
        .duration(2000) // Longer duration for smoother effect
        .delay(index * 30) // Staggered animation
        .ease(d3.easeCubicInOut) // Smooth easing
        .attr('cx', bubble.targetX)
        .attr('cy', bubble.targetY)
        .attr('r', bubble.targetRadius)
        .attr('fill', bubble.targetColor)
        .attr('opacity', 0.7)
        .on('end', function () {
          // After transition, fade out the transition bubble
          d3.select(this)
            .transition()
            .duration(500)
            .attr('opacity', 0)
            .remove();
        });
    });

    console.log('🎬 Transition animation started');
  }

  // Country flag data with real colors
  const countryFlags: Record<string, { colors: string[] }> = {
    AUT: { colors: ['#ed2939', '#ffffff', '#ed2939'] }, // Austria
    BEL: { colors: ['#000000', '#ffd700', '#ed2939'] }, // Belgium
    BGR: { colors: ['#ffffff', '#00966e', '#d62612'] }, // Bulgaria
    CHE: { colors: ['#ff0000'] }, // Switzerland
    CZE: { colors: ['#ffffff', '#d7141a'] }, // Czech Republic
    DEU: { colors: ['#000000', '#dd0000', '#ffce00'] }, // Germany
    DNK: { colors: ['#c60c30'] }, // Denmark
    EST: { colors: ['#0072ce', '#000000', '#ffffff'] }, // Estonia
    GRC: { colors: ['#0d5eaf'] }, // Greece
    ESP: { colors: ['#c60b1e', '#ffc400', '#c60b1e'] }, // Spain
    FIN: { colors: ['#003580'] }, // Finland
    FRA: { colors: ['#002395', '#ffffff', '#ed2939'] }, // France
    HRV: { colors: ['#ff0000', '#ffffff', '#0000ff'] }, // Croatia
    HUN: { colors: ['#ce2939', '#ffffff', '#477050'] }, // Hungary
    IRL: { colors: ['#169b62', '#ffffff', '#ff883e'] }, // Ireland
    ITA: { colors: ['#009246', '#ffffff', '#ce2b37'] }, // Italy
    LTU: { colors: ['#ffb000', '#006a44', '#c1272d'] }, // Lithuania
    LUX: { colors: ['#ed2939', '#ffffff', '#00a1de'] }, // Luxembourg
    LVA: { colors: ['#9e3039', '#ffffff', '#9e3039'] }, // Latvia
    NLD: { colors: ['#ae1c28', '#ffffff', '#21468b'] }, // Netherlands
    NOR: { colors: ['#ef2b2d'] }, // Norway
    POL: { colors: ['#ffffff', '#dc143c'] }, // Poland
    PRT: { colors: ['#046a38', '#ff0000'] }, // Portugal
    ROU: { colors: ['#002b7f', '#fcd116', '#ce1126'] }, // Romania
    SWE: { colors: ['#006aa7'] }, // Sweden
    SVN: { colors: ['#ffffff', '#0000ff', '#ff0000'] }, // Slovenia
    SVK: { colors: ['#ffffff', '#0b4ea2', '#ee1c25'] }, // Slovakia
  };

  function getCountryFlagData(countryCode: string) {
    return countryFlags[countryCode] || { colors: ['#cccccc'] };
  }

  // Color scale for countries
  const colorScale = d3
    .scaleOrdinal()
    .domain([
      'DEU',
      'FRA',
      'NLD',
      'ITA',
      'ESP',
      'CZE',
      'POL',
      'HUN',
      'ROU',
      'BGR',
    ])
    .range([
      '#d32f2f', // Germany - red
      '#1976d2', // France - blue
      '#388e3c', // Netherlands - green
      '#f57c00', // Italy - orange
      '#7b1fa2', // Spain - purple
      '#5d4037', // Czech - brown
      '#455a64', // Poland - dark blue
      '#e64a19', // Hungary - deep orange
      '#00695c', // Romania - teal
      '#bf360c', // Bulgaria - dark red
    ]);

  onMount(() => {
    if (data && data.length > 0 && !dataLocked) {
      console.log('🔍 RAW DATA RECEIVED:', data);
      console.log('🔍 FIRST ITEM:', data[0]);
      console.log('🔍 DATA LENGTH:', data.length);

      // Sort by suicide numbers and take only top 5 countries
      const sortedData = [...data].sort((a, b) => b.SAYI - a.SAYI);
      chartData = sortedData.slice(0, 5);
      dataLocked = true; // Lock the data to prevent changes
      console.log('📊 Top 5 countries by suicide numbers:', chartData);
      console.log('📊 Chart data structure:', chartData[0]);
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

  $: if (data && data.length > 0) {
    if (!dataLocked) {
      console.log('🔄 REACTIVE UPDATE - RAW DATA:', data);
      console.log('🔄 FIRST ITEM:', data[0]);

      // Sort by suicide numbers and take only top 5 countries
      const sortedData = [...data].sort((a, b) => b.SAYI - a.SAYI);
      chartData = sortedData.slice(0, 5);
      dataLocked = true; // Lock the data to prevent changes
      console.log('📊 Top 5 countries by suicide numbers:', chartData);
      console.log('📊 Chart data structure:', chartData[0]);
      console.log('🔒 DATA LOCKED - will not change during scroll');
    } else {
      console.log(
        '🔄 REACTIVE UPDATE - DATA ALREADY LOCKED, using existing chartData'
      );
    }

    if (svg && chartData.length > 0) {
      renderChart();
    }
  }

  // Only re-render if progress has increased or chart hasn't been rendered yet
  $: if (animationProgress > 0 && svg && chartData.length > 0) {
    // Mark as fully animated when progress reaches 95%
    if (animationProgress >= 0.95) {
      chartFullyAnimated = true;
    }

    // Only re-render if chart is not fully animated and needs updating
    if (
      !chartFullyAnimated &&
      (!chartRendered || animationProgress > lastAnimationProgress)
    ) {
      renderChart();
      chartRendered = true;
      lastAnimationProgress = animationProgress;
    }
  }

  function renderChart() {
    if (!svg || chartData.length === 0) return;

    // Debounce renders to improve performance
    if (renderTimeout) {
      clearTimeout(renderTimeout);
    }

    renderTimeout = setTimeout(() => {
      // Debug: Log the actual data being used
      console.log('EuropeanSuicideChart - Rendering with data:', chartData);
      console.log('Sample data point:', chartData[0]);

      // Clear previous content
      d3.select(svg).selectAll('*').remove();

      const margin = { top: 40, right: 40, bottom: 60, left: 80 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const g = d3
        .select(svg)
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Scales
      const xScale = d3
        .scaleBand()
        .domain(chartData.map((d) => d.ÜLKE))
        .range([0, innerWidth])
        .padding(0.3); // Increased padding for better separation

      const maxValue = d3.max(chartData, (d) => d.SAYI) || 0;
      const yScale = d3
        .scaleLinear()
        .domain([0, maxValue * 1.1]) // Add 10% padding to top for better visual
        .range([innerHeight, 0]);

      // Create particle swarm bars - each bar is made of many circles
      chartData.forEach((d, countryIndex) => {
        const barWidth = xScale.bandwidth();
        const barX = xScale(d.ÜLKE) || 0;
        const maxHeight = innerHeight - yScale(d.SAYI); // Use full data value, not affected by animation
        const barHeight = innerHeight - yScale(d.SAYI); // Use full data value, not affected by animation

        // Calculate number of particles based on data value - optimized for performance
        const particleCount = Math.max(
          10,
          Math.min(40, Math.floor(d.SAYI / 15))
        );

        // Create particles for this bar with proper separation
        for (let i = 0; i < particleCount; i++) {
          const particle = g
            .append('circle')
            .attr('class', 'particle-bar')
            .attr('data-country', d.ÜLKE)
            .attr('data-index', i);

          // Constrain particles to their country's column with clear separation
          const columnPadding = barWidth * 0.1; // 10% padding on each side
          const particleX =
            barX +
            columnPadding +
            Math.random() * (barWidth - columnPadding * 2);
          const particleY = innerHeight - Math.random() * barHeight; // This already uses the full barHeight

          // Random size (small, medium, large) - made bigger for better visibility
          const sizeRoll = Math.random();
          let particleRadius;
          if (sizeRoll < 0.3) {
            particleRadius = 3 + Math.random() * 1.5; // Small: 3-4.5px
          } else if (sizeRoll < 0.6) {
            particleRadius = 4.5 + Math.random() * 2; // Medium: 4.5-6.5px
          } else {
            particleRadius = 6 + Math.random() * 3; // Large: 6-9px
          }

          // Color with some variation
          const baseColor = colorScale(d.ÜLKE) as string;
          const colorVariation = Math.random() * 0.3 - 0.15; // ±15% brightness
          const variedColor =
            d3.color(baseColor)?.brighter(colorVariation)?.toString() ||
            baseColor;

          particle
            .attr('cx', particleX)
            .attr('cy', innerHeight) // Start at bottom
            .attr('r', 0) // Start with no radius
            .attr('fill', variedColor)
            .attr('opacity', 0) // Start completely invisible
            .attr('stroke', 'none') // Remove black borders completely
            .attr('stroke-width', 0);

          // Animate particle to its final position with smooth growth
          particle
            .transition()
            .duration(1200 + Math.random() * 600) // Longer duration for smoother effect
            .delay(countryIndex * 150 + i * 30) // Stagger animations more
            .ease(d3.easeCubicOut) // Smooth easing for natural feel
            .attr('cy', particleY)
            .attr('r', particleRadius) // Grow from 0 to final radius
            .attr('opacity', 0.8);

          // Disable floating animation for better performance
          // const floatAnimation = () => {
          //   const originalY = particleY;
          //   const floatRange = 1; // 1px floating range - more subtle
          //   const floatDuration = 3000 + Math.random() * 2000; // 3-5 seconds - slower

          //   const animateFloat = () => {
          //     particle
          //       .transition()
          //       .duration(floatDuration)
          //       .ease(d3.easeSinInOut)
          //       .attr('cy', originalY + (Math.random() - 0.5) * floatRange)
          //       .on('end', animateFloat);
          //   };

          //   animateFloat();
          // };

          // Start floating animation after initial animation completes
          // setTimeout(
          //   floatAnimation,
          //   800 + Math.random() * 400 + countryIndex * 100 + i * 20
          // );

          // Add hover effects
          particle
            .on('mouseover', function () {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('r', particleRadius * 1.5)
                .attr('opacity', 1);
            })
            .on('mouseout', function () {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('r', particleRadius)
                .attr('opacity', 0.8);
            });
        }
      });

      // Add value labels on bars - start hidden and animate with bars
      const labels = g
        .selectAll('.value-label')
        .data(chartData)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', (d: any) => (xScale(d.ÜLKE) || 0) + xScale.bandwidth() / 2)
        .attr('y', innerHeight) // Start at bottom
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .attr('fill', '#333')
        .attr('opacity', 0) // Start invisible
        .text((d: any) => {
          // Use the original data value, not affected by animation progress
          const value = Math.round(d.SAYI);
          console.log(`🏷️ Value label for ${d.ÜLKE}: ${value} (locked data)`);
          return value;
        });

      // Animate labels to appear with bars
      labels
        .transition()
        .duration(1200)
        .delay((d, i) => i * 150)
        .ease(d3.easeCubicOut) // Smooth easing for natural feel
        .attr('y', (d: any) => yScale(d.SAYI) - 5) // Use full data value, not affected by animation
        .attr('opacity', 1);

      // X-axis with country flag SVGs
      const xAxisGroup = g
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`);

      // Add country flag SVGs
      const countryIcons = xAxisGroup
        .selectAll('.country-flag')
        .data(chartData)
        .enter()
        .append('g')
        .attr('class', 'country-flag')
        .attr(
          'transform',
          (d) =>
            `translate(${(xScale(d.ÜLKE) || 0) + xScale.bandwidth() / 2}, 20)`
        );

      // Create country flag SVGs directly
      countryIcons.each(function (d) {
        const group = d3.select(this);
        const flagData = getCountryFlagData(d.ÜLKE);

        // Create flag background with subtle styling
        flagData.colors.forEach((color, index) => {
          const segmentWidth = 20 / flagData.colors.length;
          group
            .append('rect')
            .attr('x', -10 + index * segmentWidth)
            .attr('y', -8)
            .attr('width', segmentWidth)
            .attr('height', 16)
            .attr('fill', color)
            .attr('opacity', 0.85) // Make slightly pale
            .attr('stroke', '#ddd') // Subtle border
            .attr('stroke-width', 0.8);
        });

        // NO TEXT - removed as requested
      });

      // Y-axis
      g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale).tickFormat(d3.format('d')))
        .selectAll('text')
        .attr('font-size', '11px')
        .attr('fill', '#666');

      // Title
      g.append('text')
        .attr('class', 'chart-title')
        .attr('x', innerWidth / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', '600')
        .attr('fill', '#1a1a1a')
        .text(title);

      // Y-axis label
      g.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - innerHeight / 2)
        .attr('dy', '1em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .attr('fill', '#666')
        .text('Yıllık Ortalama İntihar Sayısı');
    }, 16); // 16ms timeout for 60fps performance
  }
</script>

<svg bind:this={svg}></svg>

<style>
  :global(.particle-bar) {
    cursor: pointer;
    transition:
      r 0.2s ease,
      opacity 0.2s ease;
  }

  :global(.particle-bar:hover) {
    filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.3));
  }

  :global(.bar) {
    transition: all 0.3s ease;
  }

  :global(.bar:hover) {
    opacity: 0.8;
    cursor: pointer;
  }
</style>
