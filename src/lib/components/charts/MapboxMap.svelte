<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import mapboxgl from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';

  // Props for scrollytelling integration
  export let target:
    | 'turkey'
    | 'istanbul'
    | 'yenikapi'
    | 'ayrilikcesmesi'
    | 'atakoy'
    | 'guzelyali' = 'turkey';
  export let height: number = 500;

  // Incident dots props
  export let incidentPoints: GeoJSON.FeatureCollection | null = null;
  export let showIncidents: boolean = false;
  // Reveal first N incident dots (0 = hide all). Use a large number to show all.
  export let incidentRevealCount: number = 0;
  // Layer visibility controls
  export let showMarmarayLine: boolean = true;
  export let showMetroStations: boolean = false;
  export let showMetroLines: boolean = false;
  // Pulse highlights along metro lines (e.g., 22 incidents)
  export let showMetroPulse: boolean = false;
  export let pulseCount: number = 0;
  // External visibility hint to trigger resize when shown again
  export let visible: boolean = true;
  // Cinematic/3D toggles (safe defaults)
  export let cinematic: boolean = false;
  export let cinematicPitch: number = 50;
  export let cinematicBearing: number = 20;
  export let enable3DBuildings: boolean = false;
  // Station-anchored pulse defs (fixed positions on specific lines)
  export let metroAnchors: Array<{
    lineId: string;
    ratio: number;
    count: number;
    station?: string;
  }> | null = null;
  // Optional zoom override for flyTo
  export let overrideZoom: number | null = null;

  let mapContainer: HTMLDivElement;
  let map: mapboxgl.Map;
  let currentTarget: string;
  let mapLoaded = false;
  let rafId: number | null = null;
  let pulseState: any = null; // holds lines + pulses arrays OR anchor pulses
  let lastTime = 0;

  function applyOrientation(pitch: number, bearing: number, duration: number) {
    if (!map) return;
    if (map.isMoving()) {
      map.once('moveend', () =>
        map.easeTo({ pitch, bearing, duration, essential: true })
      );
    } else {
      map.easeTo({ pitch, bearing, duration, essential: true });
    }
  }

  // Map configurations for each step
  const mapConfigs: Record<
    string,
    {
      center: [number, number];
      zoom: number;
      bearing: number;
      pitch: number;
    }
  > = {
    turkey: {
      center: [35.2433, 38.9637] as [number, number], // Turkey center
      zoom: 6,
      bearing: 0,
      pitch: 0,
    },
    istanbul: {
      center: [28.9784, 41.0082] as [number, number], // Istanbul center
      zoom: 10,
      bearing: 0,
      pitch: 0,
    },
    yenikapi: {
      center: [28.9558, 41.0082] as [number, number], // Yenikapı center
      zoom: 14,
      bearing: 0,
      pitch: 0,
    },
    ayrilikcesmesi: {
      // Nominatim: 41.0001678, 29.0302593 (lat, lon)
      center: [29.03026, 41.00017] as [number, number],
      zoom: 15.2,
      bearing: 0,
      pitch: 0,
    },
    atakoy: {
      // Nominatim: 40.9802282, 28.8562265 (lat, lon) — Ataköy (Bakırköy) area near Marmaray alignment
      center: [28.85623, 40.98023] as [number, number],
      zoom: 17.5,
      bearing: 20,
      pitch: 45,
    },
    guzelyali: {
      // Nominatim: 40.8568284, 29.2836051 (lat, lon) — Pendik Güzelyalı
      center: [29.28361, 40.85683] as [number, number],
      zoom: 15.2,
      bearing: 0,
      pitch: 0,
    },
  };

  // Initialize Mapbox
  onMount(() => {
    // Set access token
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    // Create map with performance optimizations
    const safeTarget = mapConfigs[target] ? target : 'istanbul';
    map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/scrolli/cmf1kklzj008201secqsu0ckd',
      center: mapConfigs[safeTarget].center,
      zoom: mapConfigs[safeTarget].zoom,
      bearing: mapConfigs[safeTarget].bearing,
      pitch: mapConfigs[safeTarget].pitch,
      attributionControl: false,
      logoPosition: 'bottom-right',
      // Lock user interactions for smooth scrollytelling
      interactive: false,
      // Performance optimizations
      maxZoom: 18,
      minZoom: 3,
      maxPitch: 60,
      antialias: false, // Disable antialiasing for faster rendering
      preserveDrawingBuffer: false, // Better performance
      refreshExpiredTiles: false, // Don't refresh expired tiles
      fadeDuration: 0, // Disable fade animations for faster loading
      crossSourceCollisions: false, // Disable collision detection for performance
      localIdeographFontFamily: 'sans-serif', // Use system fonts for better performance
      transformRequest: (url, resourceType) => {
        // Optimize tile loading
        if (resourceType === 'Tile') {
          return {
            url: url + '&optimize=true',
          };
        }
        return { url };
      },
    });

    // Navigation controls disabled to avoid zoom/pan by user

    // Wait for map to load
    map.on('load', () => {
      console.log('Mapbox map loaded successfully');
      mapLoaded = true;

      // Check if we need to fly to a different target after loading
      if (currentTarget && currentTarget !== 'istanbul') {
        console.log(
          '🔄 Map loaded, checking if we need to fly to:',
          currentTarget
        );
        const safeTarget =
          mapConfigs[currentTarget] ? currentTarget : 'istanbul';
        const config = mapConfigs[safeTarget];

        // Fly to the correct target immediately
        map.flyTo({
          center: config.center,
          zoom: overrideZoom ?? config.zoom,
          bearing: config.bearing,
          pitch: config.pitch,
          duration: 0, // Instant jump to correct position
          essential: true,
        });
        console.log('✅ Post-load flyTo completed to:', safeTarget);
      }

      // Performance optimizations after map loads
      map.setMaxBounds([
        [-180, -85],
        [180, 85],
      ]); // Limit map bounds

      // Preload tiles for better performance
      const bounds = map.getBounds();
      map.resize(); // Force resize for better tile loading

      // Add 3D buildings layer (hidden by default)
      try {
        const labelLayerId = map
          .getStyle()
          .layers?.find(
            (l: any) => l.type === 'symbol' && l.layout?.['text-field']
          )?.id;
        if (!map.getLayer('3d-buildings')) {
          map.addLayer(
            {
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 15,
              layout: { visibility: 'none' },
              paint: {
                'fill-extrusion-color': '#d32f2f',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.6,
              },
            },
            labelLayerId || undefined
          );
        }
      } catch (e) {
        console.warn('3D buildings not available in style', e);
      }

      // Add Marmaray line overlay from local GeoJSON
      try {
        if (!map.getSource('metro-lines')) {
          map.addSource('metro-lines', {
            type: 'geojson',
            data: '/media-assets/maps/metro hatları.geojson',
          });
        }

        // Add a subtle white casing for contrast
        if (!map.getLayer('marmaray-line-casing')) {
          map.addLayer({
            id: 'marmaray-line-casing',
            type: 'line',
            source: 'metro-lines',
            paint: {
              'line-color': '#ffffff',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                6,
                2,
                10,
                4,
                12,
                6,
              ],
              'line-opacity': 0.9,
            },
            filter: ['==', ['get', 'PROJE_ASAMA'], 'Marmaray'],
          });
        }

        // The Marmaray line itself
        if (!map.getLayer('marmaray-line')) {
          map.addLayer({
            id: 'marmaray-line',
            type: 'line',
            source: 'metro-lines',
            paint: {
              'line-color': '#d32f2f',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                6,
                1.5,
                10,
                3,
                12,
                4.5,
              ],
              'line-opacity': 0.95,
              'line-join': 'round',
              'line-cap': 'round',
            },
            filter: ['==', ['get', 'PROJE_ASAMA'], 'Marmaray'],
          });
        }
      } catch (err) {
        console.error('Failed to add Marmaray overlay', err);
      }

      // Other metro/tram lines (colored by their own stroke property)
      try {
        if (!map.getLayer('metro-lines-other-casing')) {
          map.addLayer({
            id: 'metro-lines-other-casing',
            type: 'line',
            source: 'metro-lines',
            paint: {
              'line-color': '#ffffff',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                8,
                2.5,
                11,
                4,
                13,
                6,
              ],
              'line-opacity': 0.75,
            },
            layout: { visibility: 'none' },
            filter: ['!=', ['get', 'PROJE_ASAMA'], 'Marmaray'],
          });
        }
        if (!map.getLayer('metro-lines-other')) {
          map.addLayer({
            id: 'metro-lines-other',
            type: 'line',
            source: 'metro-lines',
            paint: {
              'line-color': [
                'case',
                ['has', 'stroke'],
                ['get', 'stroke'],
                '#1e88e5',
              ],
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                8,
                1.8,
                11,
                3.2,
                13,
                4.8,
              ],
              'line-opacity': 0.95,
              'line-join': 'round',
              'line-cap': 'round',
            },
            layout: { visibility: 'none' },
            filter: ['!=', ['get', 'PROJE_ASAMA'], 'Marmaray'],
          });
        }
      } catch (e) {
        console.error('Failed to add metro colored lines', e);
      }

      // Incident dots layer (empty initially; data/reactivity below)
      try {
        if (!map.getSource('marmaray-incidents')) {
          map.addSource('marmaray-incidents', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          } as any);
        }

        if (!map.getLayer('marmaray-incidents')) {
          map.addLayer({
            id: 'marmaray-incidents',
            type: 'circle',
            source: 'marmaray-incidents',
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                6,
                3,
                10,
                5,
                12,
                6.5,
              ],
              'circle-color': '#d32f2f',
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 1,
              'circle-opacity': 0.9,
              'circle-translate': [
                'coalesce',
                ['get', 'offset'],
                ['literal', [0, 0]],
              ],
              'circle-translate-anchor': 'viewport',
            },
            filter: ['<', ['get', 'index'], 0],
          });
        }
      } catch (e) {
        console.error('Failed to init incidents layer', e);
      }

      // Metro stations derived from lines (approximate positions)
      try {
        if (!map.getSource('metro-stations')) {
          map.addSource('metro-stations', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          } as any);
        }

        if (!map.getLayer('metro-stations')) {
          map.addLayer({
            id: 'metro-stations',
            type: 'circle',
            source: 'metro-stations',
            layout: { visibility: 'none' },
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                9,
                2.5,
                11,
                4,
                13,
                5.5,
              ],
              'circle-color': '#2e7d32',
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 1,
              'circle-opacity': 0.9,
            },
          });
        }

        // Build stations from the same geojson
        fetch('/media-assets/maps/metro hatları.geojson')
          .then((r) => r.json())
          .then((gj) => {
            const features: any[] = [];
            const toLen = (a: number[], b: number[]) => {
              const dx = a[0] - b[0];
              const dy = a[1] - b[1];
              return Math.hypot(dx, dy);
            };

            (gj.features || []).forEach((f: any) => {
              const props = f.properties || {};
              const n = Number(props.ISTASYON || props.stations || 0);
              // Skip Marmaray when deriving metro stations
              if (props.PROJE_ASAMA === 'Marmaray') return;
              if (f.geometry?.type !== 'MultiLineString' || !n || n <= 1)
                return;
              // Flatten coordinate arrays
              const lines: number[][][] = f.geometry.coordinates as any;
              const pts: number[][] = [];
              lines.forEach((seg) => seg.forEach((p) => pts.push(p)));
              if (pts.length < 2) return;
              // Total length
              let total = 0;
              for (let i = 1; i < pts.length; i++)
                total += toLen(pts[i], pts[i - 1]);
              if (total === 0) return;
              const step = total / (n - 1);
              let target = 0;
              let acc = 0;
              let i = 1;
              for (let k = 0; k < n; k++) {
                const tDist = step * k;
                // advance along polyline to reach tDist
                while (
                  i < pts.length &&
                  acc + toLen(pts[i], pts[i - 1]) < tDist
                ) {
                  acc += toLen(pts[i], pts[i - 1]);
                  i++;
                }
                if (i >= pts.length) {
                  const p = pts[pts.length - 1];
                  features.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: p },
                    properties: {},
                  });
                  continue;
                }
                const segLen = toLen(pts[i], pts[i - 1]);
                const remain = tDist - acc;
                const t = Math.max(
                  0,
                  Math.min(1, segLen ? remain / segLen : 0)
                );
                const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t;
                const y = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t;
                features.push({
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: [x, y] },
                  properties: {},
                });
              }
            });

            const src = map.getSource('metro-stations') as any;
            if (src && typeof src.setData === 'function') {
              src.setData({ type: 'FeatureCollection', features } as any);
            }
          })
          .catch((e) => console.error('Failed to build metro stations', e));
      } catch (e) {
        console.error('Failed to init metro stations', e);
      }

      // Metro pulse source/layer
      try {
        if (!map.getSource('metro-pulses')) {
          map.addSource('metro-pulses', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          } as any);
        }
        if (!map.getLayer('metro-pulses')) {
          map.addLayer({
            id: 'metro-pulses',
            type: 'circle',
            source: 'metro-pulses',
            layout: { visibility: 'none' },
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', 'phase'],
                0,
                2.5,
                0.5,
                5,
                1,
                2.5,
              ],
              'circle-color': '#ffeb3b',
              'circle-opacity': 0.95,
              'circle-stroke-color': '#000',
              'circle-stroke-width': 0.5,
            },
          });
        }
      } catch (e) {
        console.error('Failed to init metro pulses', e);
      }
    });

    // Optimize tile loading
    map.on('idle', () => {
      // Map is idle, tiles are loaded
      console.log('Map tiles loaded and idle');
    });

    // Handle tile loading errors gracefully
    map.on('error', (e) => {
      console.error('Mapbox error:', e);
    });

    // Handle map errors
    map.on('error', (e) => {
      console.error('Mapbox error:', e);
    });
  });

  // React to target changes (scrollytelling integration)
  $: if (map && target) {
    // Always update currentTarget when target changes
    if (currentTarget !== target) {
      console.log('🎯 Target changed:', { from: currentTarget, to: target });

      // Update current target
      currentTarget = target;

      // Get the target configuration
      const safeTarget = mapConfigs[target] ? target : 'istanbul';
      const config = mapConfigs[safeTarget];
      console.log('🗺️ Flying to:', safeTarget, config);
      console.log('📍 Coordinates:', config.center, 'Zoom:', config.zoom);
      console.log(
        '🔍 Override zoom:',
        overrideZoom,
        'Final zoom:',
        overrideZoom ?? config.zoom
      );

      // Only flyTo if map is loaded and ready
      if (mapLoaded) {
        try {
          // Fast, smooth transition to new view
          map.flyTo({
            center: config.center,
            zoom: overrideZoom ?? config.zoom,
            bearing: config.bearing,
            pitch: config.pitch,
            duration: 1000, // Faster transition
            essential: true,
            curve: 1.2, // Smoother curve
            speed: 1.5, // Faster speed
            easing: (t) => t * (2 - t), // Custom easing for smoother animation
          });
          console.log(
            '✅ flyTo called successfully with zoom:',
            overrideZoom ?? config.zoom
          );

          // Verify the flyTo actually worked
          setTimeout(() => {
            const newCenter = map.getCenter();
            const newZoom = map.getZoom();
            console.log('🗺️ New map position:', {
              center: newCenter,
              zoom: newZoom,
            });
            console.log('🎯 Expected position:', {
              center: config.center,
              zoom: overrideZoom ?? config.zoom,
            });
          }, 1100); // Check after animation completes
        } catch (error) {
          console.error('❌ flyTo failed:', error);
        }
      } else {
        console.log('⏳ Map not loaded yet, will flyTo when ready');
      }
    }
  }

  // Toggle cinematic pitch/bearing per prop
  $: if (map && mapLoaded) {
    try {
      if (cinematic) {
        applyOrientation(
          Math.max(0, Math.min(60, cinematicPitch)),
          cinematicBearing,
          700
        );
      } else {
        applyOrientation(0, 0, 600);
      }
    } catch {}
  }

  // Toggle 3D buildings layer visibility
  $: if (map && mapLoaded) {
    try {
      if (map.getLayer('3d-buildings')) {
        map.setLayoutProperty(
          '3d-buildings',
          'visibility',
          enable3DBuildings ? 'visible' : 'none'
        );
      }
    } catch {}
  }

  // Debug: Monitor overrideZoom changes
  $: if (map && mapLoaded && overrideZoom !== null) {
    console.log('🔍 Override zoom changed to:', overrideZoom);
    // If we have a current target and override zoom, force a flyTo
    if (currentTarget && mapConfigs[currentTarget]) {
      const config = mapConfigs[currentTarget];
      console.log('🔄 Force flyTo due to override zoom change:', {
        target: currentTarget,
        overrideZoom,
        config,
      });
      try {
        map.flyTo({
          center: config.center,
          zoom: overrideZoom,
          bearing: config.bearing,
          pitch: config.pitch,
          duration: 800,
          essential: true,
        });
        console.log(
          '✅ Force flyTo completed with override zoom:',
          overrideZoom
        );
      } catch (error) {
        console.error('❌ Force flyTo failed:', error);
      }
    }
  }

  // Cleanup
  onDestroy(() => {
    if (map) {
      try {
        if (map.getLayer('marmaray-incidents'))
          map.removeLayer('marmaray-incidents');
        if (map.getSource('marmaray-incidents'))
          map.removeSource('marmaray-incidents');
        if (map.getLayer('metro-stations')) map.removeLayer('metro-stations');
        if (map.getSource('metro-stations')) map.removeSource('metro-stations');
        if (map.getLayer('metro-lines-other'))
          map.removeLayer('metro-lines-other');
        if (map.getLayer('metro-lines-other-casing'))
          map.removeLayer('metro-lines-other-casing');
        if (map.getLayer('metro-pulses')) map.removeLayer('metro-pulses');
        if (map.getSource('metro-pulses')) map.removeSource('metro-pulses');
      } catch {}
      map.remove();
    }
    if (rafId) cancelAnimationFrame(rafId);
  });

  // Reactivity: update incidents data and visibility
  $: if (map && mapLoaded && incidentPoints) {
    const src = map.getSource('marmaray-incidents') as any;
    if (src && typeof src.setData === 'function') {
      src.setData(incidentPoints as any);
    }
  }

  $: if (map && mapLoaded) {
    try {
      const reveal =
        showIncidents ? Math.max(0, Math.floor(incidentRevealCount)) : 0;
      if (map.getLayer('marmaray-incidents')) {
        map.setFilter('marmaray-incidents', ['<', ['get', 'index'], reveal]);
      }
    } catch {}
  }

  // Toggle layer visibility based on props
  $: if (map && mapLoaded) {
    try {
      if (map.getLayer('marmaray-line')) {
        map.setLayoutProperty(
          'marmaray-line',
          'visibility',
          showMarmarayLine ? 'visible' : 'none'
        );
      }
      if (map.getLayer('marmaray-line-casing')) {
        map.setLayoutProperty(
          'marmaray-line-casing',
          'visibility',
          showMarmarayLine ? 'visible' : 'none'
        );
      }
      if (map.getLayer('metro-stations')) {
        map.setLayoutProperty(
          'metro-stations',
          'visibility',
          showMetroStations ? 'visible' : 'none'
        );
      }
      if (map.getLayer('metro-lines-other')) {
        map.setLayoutProperty(
          'metro-lines-other',
          'visibility',
          showMetroLines ? 'visible' : 'none'
        );
      }
      if (map.getLayer('metro-lines-other-casing')) {
        map.setLayoutProperty(
          'metro-lines-other-casing',
          'visibility',
          showMetroLines ? 'visible' : 'none'
        );
      }
      if (map.getLayer('marmaray-incidents')) {
        map.setLayoutProperty(
          'marmaray-incidents',
          'visibility',
          showIncidents ? 'visible' : 'none'
        );
      }
      if (map.getLayer('metro-pulses')) {
        map.setLayoutProperty(
          'metro-pulses',
          'visibility',
          showMetroPulse ? 'visible' : 'none'
        );
      }
    } catch {}
  }

  // Build and animate pulses along metro lines
  function buildPulseState(lineFeatures: any[], count: number) {
    // Flatten non-Marmaray lines into continuous point arrays
    const lines: number[][][] = [];
    for (const f of lineFeatures) {
      const props = f.properties || {};
      if (props.PROJE_ASAMA === 'Marmaray') continue;
      const coords = f.geometry?.coordinates || [];
      // MultiLineString: array of LineString arrays
      const pts: number[][] = [];
      for (const seg of coords) for (const p of seg) pts.push(p);
      if (pts.length > 1) lines.push(pts);
    }
    // Helper: segment length (planar approx)
    const segLen = (a: number[], b: number[]) =>
      Math.hypot(a[0] - b[0], a[1] - b[1]);
    const linesInfo = lines
      .map((pts) => {
        const lens: number[] = [0];
        let total = 0;
        for (let i = 1; i < pts.length; i++) {
          total += segLen(pts[i - 1], pts[i]);
          lens.push(total);
        }
        return { pts, lens, total };
      })
      .filter((d) => d.total > 0.0001);

    // Create pulses distributed across lines
    const pulses = [] as any[];
    for (let i = 0; i < count; i++) {
      const line = linesInfo[Math.floor(Math.random() * linesInfo.length)];
      const speed = 0.15 + Math.random() * 0.25; // units per second (deg)
      const pos = Math.random() * line.total;
      pulses.push({ line, pos, speed, phase: Math.random() });
    }
    return { linesInfo, pulses };
  }

  function stepPulses(dt: number) {
    if (!pulseState) return;
    if (pulseState.mode === 'anchors') return stepAnchors(dt);
    const { pulses } = pulseState;
    const feats: any[] = [];
    for (const p of pulses) {
      p.pos += p.speed * dt;
      if (p.pos > p.line.total) p.pos = 0;
      p.phase += dt * 0.8;
      if (p.phase > 1) p.phase -= 1;
      // locate point on line by distance
      const { pts, lens, total } = p.line;
      let i = 1;
      while (i < lens.length && lens[i] < p.pos) i++;
      const a = pts[i - 1];
      const b = pts[Math.min(i, pts.length - 1)];
      const segStart = lens[i - 1];
      const segTotal = Math.max(1e-9, lens[i] - lens[i - 1]);
      const t = Math.max(0, Math.min(1, (p.pos - segStart) / segTotal));
      const x = a[0] + (b[0] - a[0]) * t;
      const y = a[1] + (b[1] - a[1]) * t;
      feats.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [x, y] },
        properties: { phase: p.phase },
      });
    }
    const src = map.getSource('metro-pulses') as any;
    if (src && typeof src.setData === 'function') {
      src.setData({ type: 'FeatureCollection', features: feats } as any);
    }
  }

  function animatePulses(ts: number) {
    if (!mapLoaded || !showMetroPulse || pulseCount <= 0) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      return;
    }
    if (!lastTime) lastTime = ts;
    const dt = Math.min(0.05, Math.max(0, (ts - lastTime) / 1000));
    lastTime = ts;
    stepPulses(dt);
    rafId = requestAnimationFrame(animatePulses);
  }

  // Build anchor-based pulses
  function buildAnchorPulseState(
    gj: any,
    anchors: Array<{
      lineId: string;
      ratio: number;
      count: number;
      station?: string;
    }>
  ) {
    const features = gj.features || [];
    // Helper flatten a line feature
    const flatten = (f: any): number[][] => {
      const pts: number[][] = [];
      (f.geometry?.coordinates || []).forEach((seg: number[][]) =>
        seg.forEach((p: number[]) => pts.push(p))
      );
      return pts;
    };
    // Helper length arrays
    const lensOf = (pts: number[][]) => {
      const lens: number[] = [0];
      let total = 0;
      for (let i = 1; i < pts.length; i++) {
        total += Math.hypot(
          pts[i][0] - pts[i - 1][0],
          pts[i][1] - pts[i - 1][1]
        );
        lens.push(total);
      }
      return { lens, total };
    };

    const pulses: any[] = [];
    for (const a of anchors) {
      // find feature by lineId prefix inside PROJE_AD_KISA
      const f = features.find((ff: any) =>
        (ff.properties?.PROJE_AD_KISA || '')
          .toUpperCase()
          .includes(a.lineId.toUpperCase())
      );
      if (!f || f.geometry?.type !== 'MultiLineString') continue;
      const pts = flatten(f);
      if (pts.length < 2) continue;
      const { lens, total } = lensOf(pts);
      const d = Math.max(0, Math.min(1, a.ratio)) * total;
      // locate point by distance d
      let i = 1;
      while (i < lens.length && lens[i] < d) i++;
      const aPt = pts[i - 1];
      const bPt = pts[Math.min(i, pts.length - 1)];
      const segStart = lens[i - 1];
      const segTotal = Math.max(1e-9, lens[i] - lens[i - 1]);
      const t = Math.max(0, Math.min(1, (d - segStart) / segTotal));
      const x = aPt[0] + (bPt[0] - aPt[0]) * t;
      const y = aPt[1] + (bPt[1] - aPt[1]) * t;
      for (let k = 0; k < Math.max(1, a.count); k++) {
        pulses.push({ coord: [x, y], phase: Math.random() });
      }
    }
    return { mode: 'anchors', pulses };
  }

  function stepAnchors(dt: number) {
    if (!pulseState || pulseState.mode !== 'anchors') return;
    const feats: any[] = [];
    for (const p of pulseState.pulses) {
      p.phase += dt * 0.8;
      if (p.phase > 1) p.phase -= 1;
      feats.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: p.coord },
        properties: { phase: p.phase },
      });
    }
    const src = map.getSource('metro-pulses') as any;
    if (src && typeof src.setData === 'function') {
      src.setData({ type: 'FeatureCollection', features: feats } as any);
    }
  }

  // Build pulses when toggled on
  $: if (
    map &&
    mapLoaded &&
    showMetroPulse &&
    (pulseCount > 0 || (metroAnchors && metroAnchors.length))
  ) {
    try {
      // Use same metro-lines source data
      fetch('/media-assets/maps/metro hatları.geojson')
        .then((r) => r.json())
        .then((gj) => {
          if (metroAnchors && metroAnchors.length) {
            pulseState = buildAnchorPulseState(gj, metroAnchors);
          } else {
            pulseState = buildPulseState(
              (gj.features || []).filter(
                (f: any) => f.geometry?.type === 'MultiLineString'
              ),
              pulseCount
            );
          }
          lastTime = 0;
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(animatePulses);
        })
        .catch((e) => console.error('Failed to build pulses', e));
    } catch {}
  }

  // Stop pulses when hidden
  $: if (map && mapLoaded && !showMetroPulse) {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    const src = map.getSource('metro-pulses') as any;
    if (src && typeof src.setData === 'function') {
      src.setData({ type: 'FeatureCollection', features: [] } as any);
    }
  }

  // Ensure proper rendering when the map becomes visible again
  $: if (map && mapLoaded && visible) {
    try {
      map.resize();
    } catch {}
  }
</script>

<div class="mapbox-map" bind:this={mapContainer} style="height: {height}px;">
  <!-- Map will be rendered here by Mapbox GL -->
</div>

<style lang="scss">
  .mapbox-map {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    /* Performance optimizations */
    will-change: transform;
    transform: translateZ(0); /* Force hardware acceleration */
    backface-visibility: hidden;

    /* Ensure map takes full container space */
    :global(.mapboxgl-canvas) {
      width: 100% !important;
      height: 100% !important;
      /* Performance optimizations */
      image-rendering: optimizeSpeed;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
  }

  /* Custom Mapbox controls styling */
  :global(.mapboxgl-ctrl-group) {
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }

  :global(.mapboxgl-ctrl-zoom-in),
  :global(.mapboxgl-ctrl-zoom-out) {
    background: white;
    border: none;
    color: #374151;

    &:hover {
      background: #f3f4f6;
    }
  }
</style>
