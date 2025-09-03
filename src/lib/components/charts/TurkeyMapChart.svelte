<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';

  export let width: number = 0;
  export let height: number = 0;
  /**
   * Zoom level for the map:
   * 0 = Full Turkey view
   * 0.5 = Halfway zoomed in (between Turkey and Istanbul)
   * 1 = Fully zoomed into Istanbul
   */
  export let zoomLevel: number = 0; // 0 = full Turkey, 1 = full Istanbul zoom
  export let showMetroLines: boolean = false;

  // Computed properties based on zoomLevel
  $: zoomToIstanbul = zoomLevel > 0;
  $: istanbulZoomIntensity = Math.min(1, zoomLevel * 2); // Gradual zoom effect

  let chartContainer: HTMLDivElement;
  let svg: any;
  let turkeyData: any;
  let metroData: any;
  let projection: any;
  let path: any;
  let countryPaths: any;
  let metroPaths: any;
  let istanbulHighlight: any;
  let mapGroup: any;
  let borderRect: any;

  onMount(() => {
    console.log('🚀 TurkeyMapChart onMount started');

    // Initialize width and height from window if not already set
    if (!width || !height) {
      width = window.innerWidth;
      height = window.innerHeight;
    }
    console.log('📏 Window dimensions:', { width, height });

    // Load data and setup map
    const loadData = async () => {
      try {
        // Load Turkey GeoJSON data
        console.log('📥 Loading Turkey data...');
        const turkeyResponse = await fetch(
          '/bluprint_graphics-kit/media-assets/maps/turkey-provinces.json'
        );
        turkeyData = await turkeyResponse.json();
        console.log(
          '✅ Turkey data loaded:',
          turkeyData.features?.length,
          'features'
        );

        // Load Metro lines GeoJSON data
        console.log('📥 Loading Metro data...');
        const metroResponse = await fetch(
          '/bluprint_graphics-kit/media-assets/maps/metro hatları.geojson'
        );
        metroData = await metroResponse.json();
        console.log(
          '✅ Metro data loaded:',
          metroData.features?.length,
          'features'
        );

        console.log('🔧 Calling setupMap...');
        setupMap();
      } catch (error) {
        console.error('❌ Error loading map data:', error);
      }
    };

    loadData();

    // Add resize event listener
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      setupMap();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  function setupMap() {
    if (!chartContainer || !turkeyData) {
      console.log('❌ setupMap failed - missing:', {
        chartContainer: !!chartContainer,
        turkeyData: !!turkeyData,
      });
      return;
    }

    console.log('🔧 setupMap called, zoomLevel:', zoomLevel);

    d3.select(chartContainer).selectAll('*').remove();

    svg = d3
      .select(chartContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('display', 'block')
      .style('background', 'transparent');

    console.log('📐 SVG created with dimensions:', { width, height });
    console.log('📦 chartContainer:', chartContainer);
    console.log('🎨 SVG element:', svg.node());

    // Create projection based on zoom level
    if (zoomLevel > 0) {
      // For zoomed view, use a fixed projection centered on Istanbul
      projection = d3
        .geoMercator()
        .center([29.0, 41.0])
        .scale(4000 + 8000 * zoomLevel)
        .translate([width / 2, height / 2]);
      console.log(
        '🔍 Zoomed projection created, scale:',
        4000 + 8000 * zoomLevel
      );
    } else {
      // Fit the entire country nicely within the viewport
      const geojson = {
        type: 'FeatureCollection',
        features: turkeyData.features,
      } as any;

      projection = d3.geoMercator().fitExtent(
        [
          [0, 0],
          [Math.max(1, width), Math.max(1, height)],
        ],
        geojson
      );
      console.log(
        '🔍 Full Turkey projection created, scale:',
        projection.scale()
      );
    }

    path = d3.geoPath().projection(projection);
    mapGroup = svg.append('g');

    // Draw Turkey regions with styles based on zoom level
    const fill = zoomLevel > 0 ? '#f0f0f0' : '#a0c4ff';
    const stroke = zoomLevel > 0 ? '#e0e0e0' : '#ffffff';
    const strokeWidth = zoomLevel > 0 ? 0.5 : 1;
    const strokeOpacity = zoomLevel > 0 ? 0.3 : 0.8;

    countryPaths = mapGroup
      .selectAll('.country')
      .data(turkeyData.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path)
      .attr('fill', (d: any) => {
        // Highlight Istanbul when zoomed
        if (zoomLevel > 0 && d.properties?.name === 'Istanbul') {
          return '#ff6b6b';
        }
        return fill;
      })
      .attr('stroke', stroke)
      .attr('stroke-width', strokeWidth)
      .attr('stroke-opacity', strokeOpacity)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill', '#ff9999');
      })
      .on('mouseout', function (event, d: any) {
        d3.select(this).attr('fill', (d: any) => {
          if (zoomLevel > 0 && d.properties?.name === 'Istanbul') {
            return '#ff6b6b';
          }
          return fill;
        });
      });

    console.log('✅ Map paths drawn:', countryPaths.size(), 'paths');

    // Add metro lines if needed
    if (zoomLevel > 0 && showMetroLines && metroData) {
      metroPaths = mapGroup
        .selectAll('.metro-line')
        .data(metroData.features)
        .enter()
        .append('path')
        .attr('class', 'metro-line')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', '#d32f2f')
        .attr('stroke-width', 3)
        .attr('stroke-opacity', 0.8)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');

      console.log('✅ Metro lines drawn:', metroPaths.size(), 'lines');
    }
  }

  // Reactive updates for smooth transitions
  $: if (zoomLevel !== undefined && turkeyData) {
    console.log('🔄 Reactive update triggered, zoomLevel:', zoomLevel);
    updateMap();
  }

  function updateMap() {
    if (!svg || !turkeyData) return;

    console.log('🔄 updateMap called, zoomLevel:', zoomLevel);

    // Force a complete redraw with new projection
    if (mapGroup) {
      mapGroup.remove();
    }

    // Create new map group
    mapGroup = svg.append('g');

    if (zoomLevel > 0) {
      // For zoomed view, use a fixed projection centered on Istanbul
      projection = d3
        .geoMercator()
        .center([29.0, 41.0])
        .scale(4000 + 8000 * zoomLevel)
        .translate([width / 2, height / 2]);
      console.log(
        '🔍 Zoomed projection created in updateMap, scale:',
        4000 + 8000 * zoomLevel
      );
    } else {
      // Create projection for full Turkey
      projection = d3
        .geoMercator()
        .fitExtent(
          [
            [0, 0],
            [Math.max(1, width), Math.max(1, height)],
          ],
          {
            type: 'FeatureCollection',
            features: turkeyData.features,
          } as any
        )
        .precision(100);
      console.log(
        '🔍 Full Turkey projection created in updateMap, scale:',
        projection.scale()
      );
    }

    path = d3.geoPath().projection(projection);

    // Draw Turkey regions with styling based on zoom level
    const fill = zoomLevel > 0 ? '#f0f0f0' : '#a0c4ff';
    const stroke = zoomLevel > 0 ? '#e0e0e0' : '#ffffff';
    const strokeWidth = zoomLevel > 0 ? 0.5 : 1;
    const strokeOpacity = zoomLevel > 0 ? 0.3 : 0.8;

    countryPaths = mapGroup
      .selectAll('.country')
      .data(turkeyData.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path)
      .attr('fill', (d: any) => {
        // Highlight Istanbul when zoomed
        if (zoomLevel > 0 && d.properties?.name === 'Istanbul') {
          return '#ff6b6b';
        }
        return fill;
      })
      .attr('stroke', stroke)
      .attr('stroke-width', strokeWidth)
      .attr('stroke-opacity', strokeOpacity)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d: any) {
        d3.select(this).attr('fill', '#ff9999');
      })
      .on('mouseout', function (event, d: any) {
        d3.select(this).attr('fill', (d: any) => {
          if (zoomLevel > 0 && d.properties?.name === 'Istanbul') {
            return '#ff6b6b';
          }
          return fill;
        });
      });

    console.log('✅ Map paths drawn:', countryPaths.size(), 'paths');

    // Add metro lines if needed
    if (zoomLevel > 0 && showMetroLines && metroData) {
      metroPaths = mapGroup
        .selectAll('.metro-line')
        .data(metroData.features)
        .enter()
        .append('path')
        .attr('class', 'metro-line')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', '#d32f2f')
        .attr('stroke-width', 3)
        .attr('stroke-opacity', 0.8)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');

      console.log('✅ Metro lines drawn:', metroPaths.size(), 'lines');
    }
  }

  $: if (width && height && turkeyData) {
    console.log('🔄 Reactive statement triggered:', {
      width,
      height,
      turkeyDataLoaded: !!turkeyData,
    });
    setupMap();
  }

  onDestroy(() => {
    if (svg) {
      svg.remove();
    }
  });
</script>

<div bind:this={chartContainer} class="turkey-map-container"></div>

<style lang="scss">
  .turkey-map-container {
    width: 100vw;
    height: calc(100vh - 80px); /* Match graphic-pane height */
    position: relative;

    svg {
      width: 100%;
      height: 100%;
    }
  }
</style>
