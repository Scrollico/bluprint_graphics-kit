<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';

  export let width: number = 0;
  export let height: number = 0;

  let chartContainer: HTMLDivElement;
  let svg: any;
  let turkeyData: any;
  let metroData: any;
  let projection: any;
  let path: any;
  let countryPaths: any;
  let metroPaths: any;

  onMount(async () => {
    try {
      width = window.innerWidth;
      height = window.innerHeight;

      // Load Turkey GeoJSON data
      const turkeyResponse = await fetch('/media-assets/maps/turkey.json');
      turkeyData = await turkeyResponse.json();

      // Load Metro lines GeoJSON data
      const metroResponse = await fetch(
        '/media-assets/maps/metro hatları.geojson'
      );
      metroData = await metroResponse.json();

      setupMap();
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  });

  function setupMap() {
    if (!chartContainer || !turkeyData || !metroData) return;
    d3.select(chartContainer).selectAll('*').remove();

    svg = d3
      .select(chartContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'transparent');

    // Create projection focused on Istanbul
    projection = d3
      .geoMercator()
      .center([29.0, 41.0]) // Istanbul coordinates
      .scale(8000) // Zoom level for Istanbul
      .translate([width / 2, height / 2]);

    path = d3.geoPath().projection(projection);
    const mapGroup = svg.append('g');

    // Draw Turkey regions (pale background)
    countryPaths = mapGroup
      .selectAll('.country')
      .data(turkeyData.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path)
      .attr('fill', '#f0f0f0') // Very pale background
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0.3);

    // Highlight Istanbul region
    const istanbulRegion = turkeyData.features.find(
      (f: any) =>
        f.properties?.name?.includes('İstanbul') ||
        f.properties?.NAME?.includes('İstanbul') ||
        f.properties?.ADM1_TR?.includes('İstanbul')
    );

    if (istanbulRegion) {
      mapGroup
        .append('path')
        .attr('d', path(istanbulRegion))
        .attr('fill', '#a0c4ff') // Light blue for Istanbul
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.8);
    }

    // Draw metro lines
    metroPaths = mapGroup
      .selectAll('.metro-line')
      .data(metroData.features)
      .enter()
      .append('path')
      .attr('class', 'metro-line')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#d32f2f') // Reuters red for metro lines
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');
  }

  $: if (width && height && turkeyData && metroData) {
    setupMap();
  }

  onDestroy(() => {
    if (svg) {
      svg.remove();
    }
  });
</script>

<div bind:this={chartContainer} class="istanbul-metro-map-container"></div>

<style lang="scss">
  .istanbul-metro-map-container {
    width: 100vw;
    height: 100vh;
    position: relative;
  }
</style>
