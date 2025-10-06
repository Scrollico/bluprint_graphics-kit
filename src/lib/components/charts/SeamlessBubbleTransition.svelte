<!--
  SeamlessBubbleTransition.svelte
  Creates a seamless fluid transition between GlobalSolutionsSwarm and EuropeanSuicideChart
  Bubbles physically fly from step 18.5 to step 19 positions
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import {
    chartTransition,
    type BubbleNode,
  } from '$lib/stores/chartTransition';

  export let isTransitioning = false;
  export let fromChartBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } = { x: 0, y: 0, width: 800, height: 420 };
  export let toChartBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } = { x: 0, y: 0, width: 600, height: 400 };
  export let europeanData: any[] = [];

  let svg: SVGElement;
  let transitionBubbles: d3.Selection<
    SVGCircleElement,
    BubbleNode,
    SVGElement,
    unknown
  >;
  let isAnimating = false;

  // Subscribe to transition state
  $: if (chartTransition) {
    chartTransition.subscribe((state) => {
      if (state.isTransitioning && state.toStep === 'step-19' && !isAnimating) {
        console.log(
          '🎬 Starting seamless bubble transition with',
          state.bubbles.length,
          'bubbles'
        );
        startSeamlessTransition(state.bubbles);
      }
    });
  }

  function startSeamlessTransition(bubbles: BubbleNode[]) {
    if (!svg || !bubbles.length || !europeanData.length) return;

    isAnimating = true;
    console.log('🎬 Creating seamless transition overlay');

    // Clear any existing transition bubbles
    d3.select(svg).selectAll('*').remove();

    // Create transition bubbles at source positions
    transitionBubbles = d3
      .select(svg)
      .selectAll('.transition-bubble')
      .data(bubbles)
      .enter()
      .append('circle')
      .attr('class', 'transition-bubble')
      .attr('cx', (d) => fromChartBounds.x + d.x)
      .attr('cy', (d) => fromChartBounds.y + d.y)
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => d.color)
      .attr('opacity', 0.9)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    // Calculate target positions for European chart
    const targetPositions = calculateTargetPositions(bubbles);

    console.log('🎬 Target positions calculated:', targetPositions.length);

    // Animate bubbles to target positions
    transitionBubbles
      .transition()
      .duration(2500) // Longer duration for smooth effect
      .ease(d3.easeCubicInOut)
      .attr('cx', (d, i) => targetPositions[i]?.x || 0)
      .attr('cy', (d, i) => targetPositions[i]?.y || 0)
      .attr('r', (d, i) => targetPositions[i]?.radius || 3)
      .attr('fill', (d, i) => targetPositions[i]?.color || d.color)
      .delay((d, i) => i * 20) // Staggered animation
      .on('end', function (d, i) {
        // Check if this is the last bubble to finish
        if (i === bubbles.length - 1) {
          console.log('🎬 Transition completed');
          setTimeout(() => {
            // Fade out transition bubbles
            d3.select(svg)
              .selectAll('.transition-bubble')
              .transition()
              .duration(500)
              .attr('opacity', 0)
              .remove();
            isAnimating = false;
          }, 300);
        }
      });
  }

  function calculateTargetPositions(bubbles: BubbleNode[]) {
    if (!europeanData.length) return [];

    // Sort European data by suicide numbers (like in EuropeanSuicideChart)
    const sortedData = [...europeanData]
      .sort((a, b) => b.SAYI - a.SAYI)
      .slice(0, 5);

    // Create scales for target positions (matching EuropeanSuicideChart)
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const innerWidth = toChartBounds.width - margin.left - margin.right;
    const innerHeight = toChartBounds.height - margin.top - margin.bottom;

    const xScale = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.ÜLKE))
      .range([0, innerWidth])
      .padding(0.3);

    const maxValue = d3.max(sortedData, (d) => d.SAYI) || 0;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([innerHeight, 0]);

    // Color scale for countries
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    return bubbles.map((bubble, index) => {
      // Distribute bubbles across countries
      const countryIndex = Math.floor(Math.random() * sortedData.length);
      const countryData = sortedData[countryIndex];

      const targetX =
        toChartBounds.x +
        margin.left +
        (xScale(countryData.ÜLKE) || 0) +
        xScale.bandwidth() / 2;
      const targetY =
        toChartBounds.y + margin.top + innerHeight - yScale(countryData.SAYI);

      return {
        x: targetX,
        y: targetY,
        radius: Math.max(3, Math.min(8, countryData.SAYI / 80)),
        color: colorScale(countryData.ÜLKE),
        country: countryData.ÜLKE,
      };
    });
  }
</script>

<!-- Transition overlay SVG -->
{#if isTransitioning}
  <svg
    bind:this={svg}
    class="seamless-transition-overlay"
    style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 1000;"
  ></svg>
{/if}

<style>
  .seamless-transition-overlay {
    pointer-events: none;
  }

  :global(.transition-bubble) {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
</style>
