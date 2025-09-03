<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';

  export let data: Array<{ country: string; value: number }> = [];
  export let title: string = 'European Countries Data';
  export let subtitle: string = 'Hover over countries to see detailed values';
  export let highlightCountry: string | null = null;
  export let zoomToCountry: string | null = null;
  export let pitchAngle: number = 0;

  let chartContainer: HTMLElement;
  let chart: any;

  // Animation state for smooth transitions (0 = normal, 1 = highlighted)
  let animState = 0;
  let raf: number | null = null;

  function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Extra smooth easing for gentle pale transitions
  function easeInOutQuart(t: number) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }

  function animateTo(value: number, duration = 1500) {
    if (raf) cancelAnimationFrame(raf);
    const start = performance.now();
    const from = animState;
    const to = Math.max(0, Math.min(1, value));

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      animState = from + (to - from) * easeInOutQuart(t);
      updateMapColors();
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  // React to external highlightCountry changes
  $: if (chartContainer) {
    if (highlightCountry) {
      animateTo(1);
    } else {
      animateTo(0);
    }
  }

  // React to zoom changes
  $: if (
    chartContainer &&
    zoomToCountry &&
    svg &&
    countryPaths &&
    geojsonData
  ) {
    console.log('✅ Triggering zoom to:', zoomToCountry);
    console.log('Required elements ready:', {
      svg: !!svg,
      geojsonData: !!geojsonData,
      countryPaths: !!countryPaths,
    });
    // Add a small delay to ensure everything is ready
    setTimeout(() => {
      zoomToCountryRegion(zoomToCountry);
    }, 100);
  }

  // React to pitch changes
  $: if (
    chartContainer &&
    pitchAngle !== undefined &&
    svg &&
    countryPaths &&
    geojsonData
  ) {
    console.log('🎭 Applying pitch angle:', pitchAngle);
    applyPitchAngle(pitchAngle);
  }

  // React to title and subtitle changes
  $: if (svg) {
    updateTitleAndSubtitle();
  }

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

  let svg: any;
  let countryPaths: any;
  let countryValueMap: Map<string, number>;
  let colorScale: any;
  let transformedData: any[];
  let geojsonData: any;
  let projection: any;
  let path: any;
  let width: number;
  let height: number;

  function updateMapColors() {
    if (!countryPaths || !countryValueMap || !colorScale) return;

    countryPaths.attr('fill', (d: any) => {
      const value = countryValueMap.get(d.properties.ISO3);
      const isHighlighted =
        highlightCountry && d.properties.ISO3 === highlightCountry;

      if (value) {
        const originalColor = d3.color(colorScale(value));
        if (originalColor) {
          if (isHighlighted) {
            // Keep highlighted country at full intensity
            return originalColor.toString();
          } else {
            // Smoother pale effect - more gradual transition
            const paleIntensity = 0.75; // How pale (0.75 = 75% towards white)
            const paleColor = d3.interpolate(
              originalColor,
              d3.color('#f8f8f8')!
            )(paleIntensity);

            // Use the already smooth animState from easeInOutQuart
            return d3
              .interpolate(originalColor, paleColor)(animState)
              .toString();
          }
        }
      }

      // Smoother transition for countries without data
      return d3
        .interpolate(d3.color('#e0e0e0')!, d3.color('#f8f8f8')!)(animState)
        .toString();
    });

    // Update stroke for highlighted countries - smoother transitions
    countryPaths
      .attr('stroke', (d: any) => {
        const isHighlighted =
          highlightCountry && d.properties.ISO3 === highlightCountry;
        return isHighlighted && animState > 0.4 ? '#333' : '#fff';
      })
      .attr('stroke-width', (d: any) => {
        const isHighlighted =
          highlightCountry && d.properties.ISO3 === highlightCountry;
        return isHighlighted && animState > 0.4 ? 2 : 0.5;
      });
  }

  function zoomToCountryRegion(countryCode: string) {
    console.log('🎯 Zooming to country:', countryCode);

    if (!svg || !geojsonData || !countryPaths) {
      console.error('❌ Missing required elements for zoom:', {
        svg: !!svg,
        geojsonData: !!geojsonData,
        countryPaths: !!countryPaths,
      });
      return;
    }

    // Log available country codes for debugging
    const availableCodes = geojsonData.features
      .map((f: any) => f.properties.ISO3)
      .filter(Boolean);
    console.log('🌍 Available country ISO3 codes:', availableCodes);
    console.log('🔍 Looking for country code:', countryCode);

    // Also log all country names and their ISO codes for better debugging
    console.log(
      '🗺️ All countries in GeoJSON:',
      geojsonData.features.map((f: any) => ({
        name: f.properties.NAME,
        iso3: f.properties.ISO3,
        adm0_a3: f.properties.ADM0_A3,
      }))
    );

    // Find the country feature - try multiple property names
    let countryFeature = geojsonData.features.find(
      (f: any) => f.properties.ISO3 === countryCode
    );

    // Fallback: try ADM0_A3 property if ISO3 not found
    if (!countryFeature) {
      countryFeature = geojsonData.features.find(
        (f: any) => f.properties.ADM0_A3 === countryCode
      );
    }

    // Fallback: try NAME property if still not found
    if (!countryFeature) {
      const countryName =
        countryMapping[countryCode as keyof typeof countryMapping]?.name;
      if (countryName) {
        countryFeature = geojsonData.features.find(
          (f: any) => f.properties.NAME === countryName
        );
      }
    }

    if (!countryFeature) {
      console.error('❌ Country feature not found for code:', countryCode);
      console.log(
        '🔧 Available features:',
        geojsonData.features.map((f: any) => ({
          name: f.properties.NAME,
          iso3: f.properties.ISO3,
          adm0_a3: f.properties.ADM0_A3,
        }))
      );
      return;
    }

    console.log('Found country feature:', countryFeature);

    // Create a new projection that fits Germany on the left 70% of screen
    const targetExtent: [[number, number], [number, number]] = [
      [0, 0],
      [width * 0.7, height],
    ];
    const newProjection = d3
      .geoMercator()
      .fitExtent(targetExtent, countryFeature as any)
      .precision(100);

    console.log(
      'New projection center/scale:',
      newProjection.center(),
      newProjection.scale()
    );

    // Create a new path generator with the new projection
    const newPath = d3.geoPath().projection(newProjection);

    // Directly update the projection and path references
    projection = newProjection;
    path = newPath;

    // Animate the transition to the new zoom level
    const duration = 1200;

    countryPaths
      .transition()
      .duration(duration)
      .ease(d3.easeCubicInOut)
      .attr('d', newPath);

    console.log('✅ Zoom transition started for', countryCode);
    console.log('🎯 New projection center:', newProjection.center());
    console.log('🎯 New projection scale:', newProjection.scale());
  }

  function applyPitchAngle(angle: number) {
    console.log('🎭 Applying pitch angle:', angle, 'degrees');

    if (!svg || !countryPaths || !geojsonData) {
      console.error('❌ Missing required elements for pitch:', {
        svg: !!svg,
        countryPaths: !!countryPaths,
        geojsonData: !!geojsonData,
      });
      return;
    }

    // When pitching, also zoom out to show more context
    if (angle > 0) {
      // Find Germany for the zoom-out effect
      const countryFeature = geojsonData.features.find(
        (f: any) => f.properties.ISO3 === 'DEU'
      );

      if (countryFeature) {
        // Create a zoomed-out projection that shows Germany and surrounding countries
        const targetExtent: [[number, number], [number, number]] = [
          [0, 0],
          [width * 0.9, height * 0.9], // Use 90% of screen instead of 70%
        ];
        const zoomedOutProjection = d3
          .geoMercator()
          .fitExtent(targetExtent, countryFeature as any)
          .scale(projection.scale() * 0.7) // Scale down to 70% for zoom-out effect
          .precision(100);

        const zoomedOutPath = d3.geoPath().projection(zoomedOutProjection);

        // Update the projection references
        projection = zoomedOutProjection;
        path = zoomedOutPath;

        // Apply both zoom-out and pitch transformations
        const transform = `perspective(1500px) rotateX(${angle}deg) scale(0.85)`;

        try {
          // Apply both path update and pitch transformation
          countryPaths
            .transition()
            .duration(1200)
            .ease(d3.easeCubicInOut)
            .attr('d', zoomedOutPath);

          svg
            .select('g')
            .transition()
            .duration(1200)
            .ease(d3.easeCubicInOut)
            .style('transform', transform);

          console.log(
            '✅ Zoom-out and pitch transformation applied successfully'
          );
        } catch (error) {
          console.error('❌ Error applying transformations:', error);
        }
      }
    } else {
      // Reset to normal view when angle is 0
      const transform = `perspective(1000px) rotateX(0deg) scale(1)`;

      try {
        svg
          .select('g')
          .transition()
          .duration(1200)
          .ease(d3.easeCubicInOut)
          .style('transform', transform);

        console.log('✅ Pitch reset applied successfully');
      } catch (error) {
        console.error('❌ Error resetting pitch:', error);
      }
    }
  }

  function updateTitleAndSubtitle() {
    if (!svg) return;

    // Update title text
    svg.select('.title-text').text(title);

    // Update subtitle text
    svg.select('.subtitle-text').text(subtitle);
  }

  onMount(async () => {
    console.log('🚀 EuropeMapChart mounted with data:', data);
    console.log('📦 Props received:', {
      title,
      subtitle,
      highlightCountry,
      zoomToCountry,
      pitchAngle,
    });

    if (!chartContainer) {
      console.error('Chart container not found');
      return;
    }
    if (data.length === 0) {
      console.error('No data provided to EuropeMapChart');
      return;
    }

    try {
      // Load GeoJSON data
      const geojsonResponse = await fetch('/src/lib/data/europe.geojson');
      geojsonData = await geojsonResponse.json();

      // Clear previous chart
      d3.select(chartContainer).selectAll('*').remove();

      // Set up dimensions - full screen
      width = window.innerWidth;
      height = window.innerHeight;
      const margin = { top: 20, right: 20, bottom: 20, left: 20 };

      // Create SVG - store reference
      svg = d3
        .select(chartContainer)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'transparent');

      // Create a projection for Europe
      projection = d3
        .geoMercator()
        .fitSize(
          [
            width - margin.left - margin.right,
            height - margin.top - margin.bottom,
          ],
          geojsonData
        )
        .precision(100);

      // Create path generator
      path = d3.geoPath().projection(projection);

      // Transform data to match GeoJSON ISO codes - store reference
      transformedData = data.map((item) => ({
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
      colorScale = d3
        .scaleSequential()
        .domain([0, maxValue])
        .interpolator(d3.interpolateBlues);

      // Create a map of country codes to values - store reference
      countryValueMap = new Map();
      transformedData.forEach((d) => {
        countryValueMap.set(d.iso, d.value);
      });

      // Draw countries - store reference
      countryPaths = svg
        .append('g')
        .selectAll('path')
        .data(geojsonData.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', (d: any) => {
          const value = countryValueMap.get(d.properties.ISO3);
          return value ? colorScale(value) : '#e0e0e0';
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d: any) {
          const isHighlighted =
            highlightCountry && d.properties.ISO3 === highlightCountry;

          if (highlightCountry && !isHighlighted) {
            // In highlight mode, only allow interaction with highlighted country
            return;
          }

          d3.select(this).attr('stroke', '#333').attr('stroke-width', 2);

          const value = countryValueMap.get(d.properties.ISO3);
          if (value) {
            // Show tooltip
            const tooltip = d3
              .select('body')
              .append('div')
              .attr('class', 'europe-map-tooltip')
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
                  <div style="font-weight: bold; margin-bottom: 4px;">${d.properties.NAME}</div>
                  <div style="font-size: 18px; color: #4CAF50;">${value.toFixed(1)}</div>
                </div>
              `
              )
              .style('left', event.pageX + 15 + 'px')
              .style('top', event.pageY - 15 + 'px');
          }
        })
        .on('mouseout', function () {
          const datum = d3.select(this).datum() as any;
          const isHighlighted =
            highlightCountry && datum.properties.ISO3 === highlightCountry;
          d3.select(this)
            .attr('stroke', isHighlighted && animState > 0.5 ? '#333' : '#fff')
            .attr('stroke-width', isHighlighted && animState > 0.5 ? 2 : 0.5);
          d3.selectAll('.europe-map-tooltip').remove();
        });

      // Add title with background for better visibility
      const titleGroup = svg.append('g');

      // Title background
      titleGroup
        .append('rect')
        .attr('x', width / 2 - 200)
        .attr('y', 10)
        .attr('width', 400)
        .attr('height', 50)
        .attr('rx', 8)
        .style('fill', 'rgba(255,255,255,0.9)')
        .style('stroke', '#ddd')
        .style('stroke-width', 1);

      // Title text
      titleGroup
        .append('text')
        .attr('class', 'title-text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(title);

      // Subtitle text
      titleGroup
        .append('text')
        .attr('class', 'subtitle-text')
        .attr('x', width / 2)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#666')
        .text(subtitle);

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
        .attr('id', 'europeMapLegendGradient')
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
        .style('fill', 'url(#europeMapLegendGradient)')
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
          .style('transition', 'opacity 0.8s ease-in-out')
          .text(stat.label + ':');

        statsBox
          .append('text')
          .attr('x', x + 35)
          .attr('y', y)
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('fill', '#333')
          .style('transition', 'opacity 0.8s ease-in-out')
          .text(stat.value);
      });

      console.log('✅ EuropeMapChart setup complete. Elements ready:', {
        svg: !!svg,
        countryPaths: !!countryPaths,
        geojsonData: !!geojsonData,
        projection: !!projection,
        path: !!path,
      });
    } catch (error) {
      console.error('Error loading Europe map:', error);
      // Show error message
      const width = window.innerWidth;
      const height = window.innerHeight;
      const svg = d3
        .select(chartContainer)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'rgba(0,0,0,0.8)');

      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('fill', 'white')
        .text('Error loading map data');
    }
  });

  onDestroy(() => {
    if (chartContainer) {
      d3.select(chartContainer).selectAll('*').remove();
    }
    d3.selectAll('.europe-map-tooltip').remove();
    if (raf) cancelAnimationFrame(raf);
  });
</script>

<div bind:this={chartContainer} class="europe-map-chart">
  {#if data.length === 0}
    <div
      style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 16px;"
    >
      Loading European map data...
    </div>
  {/if}
</div>

<style>
  .europe-map-chart {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    background: transparent;
    z-index: 1000;
  }

  :global(.europe-map-tooltip) {
    transition: opacity 0.2s ease-in-out;
  }
</style>
