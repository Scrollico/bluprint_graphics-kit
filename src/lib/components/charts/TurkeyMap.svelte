<script lang="ts">
  import { geoMercator, geoPath, geoCentroid } from 'd3-geo';
  import { select } from 'd3-selection';
  import { transition } from 'd3-transition';
  import { easeLinear } from 'd3-ease';
  import turkey from '../../../../media-assets/maps/turkey.json';

  export let height: number = 320;
  export let fill: string = '#e2e8f0';
  export let stroke: string = '#64748b';
  export let strokeWidth: number = 1;
  // NEW: target view. 'turkey' => overview, 'istanbul' => zoomed, 'yenikapi' => specific station
  export let target: 'turkey' | 'istanbul' | 'yenikapi' = 'turkey';
  export let highlightStations: boolean = false;
  export let showTitle: boolean = true;

  let svgElement: SVGSVGElement;
  let containerWidth: number = 800;
  let width: number = 800;

  // Animation state 0..1 (0=Turkey, 1=Istanbul, 2=Yenikapı)
  let anim = 0;
  let raf: number | null = null;

  // Istanbul metro suicide locations (approximate coordinates)
  const metroStations = [
    { name: 'Yenikapı', lat: 40.9994, lon: 28.9503, deaths: 6 },
    { name: 'Bostancı', lat: 40.9632, lon: 29.1013, deaths: 3 },
    { name: 'Ayrılık Çeşmesi', lat: 40.9907, lon: 29.0178, deaths: 3 },
    { name: 'Üsküdar', lat: 41.0214, lon: 29.008, deaths: 2 },
    { name: 'Ataköy', lat: 40.9737, lon: 28.857, deaths: 1 },
  ];

  function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animateTo(value: number, duration = 2000) {
    if (raf) cancelAnimationFrame(raf);
    const start = performance.now();
    const from = anim;
    const to = Math.max(0, Math.min(2, value)); // Max value is now 2 for Yenikapı

    console.log('animateTo called:', { from, to, duration });

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      anim = from + (to - from) * easeInOutCubic(t);
      if (Math.abs(anim - to) < 0.01) {
        anim = to; // Ensure we reach the target exactly
      }
      renderMap();
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  // React to external target changes - DISABLED ANIMATIONS
  $: if (svgElement) {
    // Keep map static - no animations
    anim = 0; // Always show Turkey view
    renderMap();
  }

  function renderMap() {
    if (!svgElement) return;

    console.log('renderMap called - static Turkey view');

    const svg = select(svgElement);
    svg.selectAll('*').remove();

    // Always show Turkey view - no animations, smaller size for full visibility
    const mapWidth = width * 0.5; // Make map 50% of container width
    const mapHeight = height * 0.5; // Make map 50% of container height
    const projection = geoMercator().fitSize(
      [mapWidth, mapHeight],
      turkey as any
    );

    const pathGenerator = geoPath().projection(projection);

    // Draw Turkey map backdrop with smooth opacity transition
    const mapOpacity = 0.9 - anim * 0.6;
    svg
      .selectAll('path')
      .data(turkey.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator as any)
      .attr('fill', fill)
      .attr('stroke', stroke)
      .attr('stroke-width', strokeWidth)
      .attr('opacity', mapOpacity)
      .style('transition', 'opacity 0.3s ease-in-out');

    // (Removed dotted arrow indicator)

    // Stations — appear as we zoom in with smooth transitions
    if (highlightStations && anim > 0.3) {
      const stationOpacity = Math.max(0, Math.min(1, (anim - 0.3) / 0.4));
      const stations = svg
        .selectAll('.station')
        .data(metroStations)
        .enter()
        .append('g')
        .attr('class', 'station')
        .style('opacity', stationOpacity)
        .style('transition', 'opacity 0.4s ease-in-out');

      stations
        .append('circle')
        .attr('cx', (d) => {
          const coords = projection([d.lon, d.lat]);
          return coords ? coords[0] : 0;
        })
        .attr('cy', (d) => {
          const coords = projection([d.lon, d.lat]);
          return coords ? coords[1] : 0;
        })
        .attr('r', (d) => {
          // Yenikapı gets special treatment when zoomed in
          if (d.name === 'Yenikapı' && anim > 1.5) {
            return 12; // Larger when focused
          }
          return 6;
        })
        .attr('fill', (d) => {
          // Yenikapı gets different color when focused
          if (d.name === 'Yenikapı' && anim > 1.5) {
            return '#991b1b'; // Darker red
          }
          return '#dc2626';
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('transition', 'r 0.3s ease-in-out');

      if (anim > 0.85) {
        stations
          .append('text')
          .attr('x', (d) => {
            const coords = projection([d.lon, d.lat]);
            return coords ? coords[0] + 20 : 20;
          })
          .attr('y', (d) => {
            const coords = projection([d.lon, d.lat]);
            return coords ? coords[1] + 5 : 5;
          })
          .text((d) => {
            if (d.name === 'Yenikapı' && anim > 1.5) {
              return `${d.name} (9 vaka)`; // Emphasize the 9 cases
            }
            return `${d.name} (${d.deaths} vaka)`;
          })
          .attr('font-size', (d) => {
            if (d.name === 'Yenikapı' && anim > 1.5) {
              return '14px'; // Larger text for Yenikapı
            }
            return '12px';
          })
          .attr('fill', '#374151')
          .attr('font-weight', '600')
          .attr('text-shadow', '1px 1px 2px rgba(255,255,255,0.8)')
          .style('transition', 'font-size 0.3s ease-in-out');
      }

      // D3.js Progressive Metro Line Animation - Step 3
      if (anim > 1.5) {
        const lineOpacity = Math.max(0, Math.min(1, (anim - 1.5) / 0.3));

        // Metro route connecting stations in order
        const metroRoute: [number, number][] = [
          [28.857, 40.9737], // Ataköy
          [28.9503, 40.9994], // Yenikapı
          [29.0178, 40.9907], // Ayrılık Çeşmesi
          [29.008, 41.0214], // Üsküdar
          [29.1013, 40.9632], // Bostancı
        ];

        // Create smooth curved path with bezier curves
        const pathData = metroRoute
          .map((coord, i) => {
            const proj = projection(coord);
            if (!proj) return null;

            if (i === 0) {
              return `M ${proj[0]} ${proj[1]}`;
            } else if (i === 1) {
              // First curve to Yenikapı
              const prevProj = projection(metroRoute[i - 1]);
              if (!prevProj) return null;
              const controlX = (prevProj[0] + proj[0]) / 2;
              const controlY = prevProj[1] - 20;
              return `Q ${controlX} ${controlY} ${proj[0]} ${proj[1]}`;
            } else if (i === 2) {
              // Curve to Ayrılık Çeşmesi
              const prevProj = projection(metroRoute[i - 1]);
              if (!prevProj) return null;
              const controlX = (prevProj[0] + proj[0]) / 2;
              const controlY = prevProj[1] + 15;
              return `Q ${controlX} ${controlY} ${proj[0]} ${proj[1]}`;
            } else if (i === 3) {
              // Curve to Üsküdar
              const prevProj = projection(metroRoute[i - 1]);
              if (!prevProj) return null;
              const controlX = (prevProj[0] + proj[0]) / 2;
              const controlY = prevProj[1] - 10;
              return `Q ${controlX} ${controlY} ${proj[0]} ${proj[1]}`;
            } else {
              // Final curve to Bostancı
              const prevProj = projection(metroRoute[i - 1]);
              if (!prevProj) return null;
              const controlX = (prevProj[0] + proj[0]) / 2;
              const controlY = prevProj[1] + 25;
              return `Q ${controlX} ${controlY} ${proj[0]} ${proj[1]}`;
            }
          })
          .filter(Boolean)
          .join(' ');

        // Create the metro line path element
        const metroLine = svg
          .append('path')
          .attr('class', 'wapo-metro-line')
          .attr('d', pathData)
          .attr('stroke', '#dc2626')
          .attr('stroke-width', 3)
          .attr('fill', 'none')
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .style('opacity', 0);

        // Get the total length of the path for progressive drawing
        const pathLength = metroLine.node().getTotalLength();

        // Set initial stroke-dasharray to hide the line
        metroLine
          .attr('stroke-dasharray', `${pathLength} ${pathLength}`)
          .attr('stroke-dashoffset', pathLength);

        // Animate line appearance
        setTimeout(() => {
          metroLine.style('opacity', lineOpacity);

          // D3.js progressive line drawing animation
          metroLine
            .transition()
            .duration(8000) // 8 seconds for the line to draw
            .ease(easeLinear)
            .attr('stroke-dashoffset', 0);
        }, 500);

        // Create train dot that follows the path
        const trainDot = svg
          .append('circle')
          .attr('class', 'wapo-train-dot')
          .attr('r', 4)
          .attr('fill', '#dc2626')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .style('opacity', 0);

        // Animate train dot appearance and movement
        setTimeout(() => {
          trainDot.style('opacity', lineOpacity);

          // D3.js train movement along the path
          trainDot
            .transition()
            .duration(8000) // Same duration as line drawing
            .ease(easeLinear)
            .tween('moveAlongPath', function () {
              return function (t) {
                const p = metroLine.node().getPointAtLength(t * pathLength);
                select(this).attr('cx', p.x).attr('cy', p.y);
              };
            });
        }, 1000);

        // Station connection dots with staggered appearance
        metroRoute.forEach((coord, i) => {
          const proj = projection(coord);
          if (!proj) return;

          const connectionDot = svg
            .append('circle')
            .attr('class', 'wapo-connection-dot')
            .attr('cx', proj[0])
            .attr('cy', proj[1])
            .attr('r', 2)
            .attr('fill', '#dc2626')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1)
            .style('opacity', 0);

          // Staggered appearance of connection dots
          setTimeout(
            () => {
              connectionDot
                .transition()
                .duration(500)
                .style('opacity', lineOpacity);
            },
            1500 + i * 1000
          ); // Each dot appears as the line reaches it
        });
      }
    }
  }

  // Ensure re-render on size changes
  $: if (svgElement && containerWidth && height) {
    width = containerWidth;
    renderMap();
  }
</script>

<div class="turkey-map" bind:clientWidth={containerWidth}>
  {#if showTitle}
    <h3 style="text-align: center; margin-bottom: 1rem; color: #374151;">
      {#if anim < 0.3}
        Türkiye Haritası
      {:else if anim < 0.8}
        İstanbul'a Yaklaşım
      {:else if anim < 1.5}
        İstanbul Metro İstasyonları
      {:else}
        Yenikapı İstasyonu
      {/if}
    </h3>
  {/if}
  <svg
    bind:this={svgElement}
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    style="width: 100%; height: {height}px; display: flex; justify-content: center; align-items: center;"
  ></svg>
</div>

<style lang="scss">
  .turkey-map {
    width: 100%;
    margin: 0 auto 2rem auto;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Progressive Line Drawing - From Ataköy to Bostancı */
  @keyframes wapoMetroDraw {
    0% {
      stroke-dasharray: 0, 2000;
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dasharray: 2000, 2000;
      stroke-dashoffset: 0;
    }
  }

  @keyframes wapoTrainMove {
    /* Start at Ataköy - line begins drawing */
    0% {
      offset-distance: 0%;
      opacity: 1;
    }
    /* Line reaches Yenikapı */
    25% {
      offset-distance: 25%;
      opacity: 1;
    }
    /* Line reaches Ayrılık Çeşmesi */
    50% {
      offset-distance: 50%;
      opacity: 1;
    }
    /* Line reaches Üsküdar */
    75% {
      offset-distance: 75%;
      opacity: 1;
    }
    /* Line reaches Bostancı */
    100% {
      offset-distance: 100%;
      opacity: 1;
    }
  }

  /* Elegant transitions */
  .wapo-metro-line {
    filter: drop-shadow(0 2px 4px rgba(220, 38, 38, 0.3));
  }

  .wapo-train-dot {
    filter: drop-shadow(0 1px 3px rgba(220, 38, 38, 0.4));
  }

  .wapo-connection-dot {
    filter: drop-shadow(0 1px 2px rgba(220, 38, 38, 0.3));
  }
</style>
