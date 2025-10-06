<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { dev } from '$app/environment';
  import mapboxgl from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';

  // Props for scrollytelling integration
  export let target:
    | 'turkey'
    | 'istanbul'
    | 'yenikapi'
    | 'ayrilikcesmesi'
    | 'atakoy'
    | 'guzelyali'
    | 'darica'
    | 'guzelyali-darica'
    | 'nyc'
    | 'texas'
    | 'test-from'
    | 'test-to' = 'turkey';
  export let height: number = 500;
  export let stroke: string = '#64748b';
  export let strokeWidth: number = 1.2;
  export let fill: string = '#e2e8f0';
  export let highlightStations: boolean = true;
  export let showTitle: boolean = false;
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
  export let enable3DBuildings: boolean = false;
  // Station-anchored pulse defs (fixed positions on specific lines)
  export let metroAnchors: Array<{
    lineId: string;
    ratio: number;
    count: number;
    station?: string;
  }> | null = null;

  // Optional viewport padding for scrollytelling composition (Mapbox flyTo padding)
  export let cameraPadding: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  } | null = null;
  // Optional focus offset in pixels [x, y] where positive x shifts target leftwards visually
  export let focusOffset: [number, number] | null = null;
  // Show named focus points for critical steps (7–9)
  export let showFocusPoints: boolean = false;
  // Optional zoom override for flyTo
  export let overrideZoom: number | null = null;
  // Disable user interactivity for scrollytelling
  export let interactive: boolean = false;
  // Optional static placeholder to show instantly while tiles load
  export let placeholderUrl: string | null = null;

  let mapContainer: HTMLDivElement;
  let map: mapboxgl.Map;
  let currentTarget: string | null = null;
  let pendingTarget: string | null = null;
  let mapLoaded = false;
  let rafId: number | null = null;
  let pulseState: any = null; // holds lines + pulses arrays OR anchor pulses
  let lastTime = 0;
  let lastVisible = false;
  let geocoderLoaded = false;

  function getCam() {
    if (!map) return null;
    const c = map.getCenter();
    return {
      center: [Number(c.lng.toFixed(5)), Number(c.lat.toFixed(5))],
      zoom: Number(map.getZoom().toFixed(2)),
      bearing: Number(map.getBearing().toFixed(2)),
      pitch: Number(map.getPitch().toFixed(2)),
    };
  }

  // Simplified map configurations - focus on the 3 main stations
  const mapConfigs: Record<
    string,
    {
      center: [number, number];
      zoom: number;
      bearing: number;
      pitch: number;
    }
  > = {
    // Country overview
    turkey: {
      center: [35.2, 39.0] as [number, number],
      zoom: 4.6,
      bearing: 0,
      pitch: 60,
    },
    // Default overview
    istanbul: {
      center: [28.9784, 41.0082] as [number, number],
      zoom: 11,
      bearing: 0,
      pitch: 60,
    },
    // Ayrılık Çeşmesi Station - Asian side
    ayrilikcesmesi: {
      center: [29.029972, 41.000371] as [number, number],
      zoom: 16,
      bearing: 0,
      pitch: 60,
    },
    // Yenikapı Station - European side
    yenikapi: {
      center: [28.955, 41.005] as [number, number],
      zoom: 16,
      bearing: 0,
      pitch: 60,
    },
    // Ataköy Station - European side
    atakoy: {
      center: [28.5122, 40.5847] as [number, number],
      zoom: 16,
      bearing: 0,
      pitch: 60,
    },
    // Güzelyalı Station - Asian side (moderate zoom for split screen)
    guzelyali: {
      center: [29.1551, 40.9236] as [number, number],
      zoom: 16,
      bearing: 0,
      pitch: 60,
    },
    // Darıca Station - Asian side (moderate zoom for split screen)
    darica: {
      center: [29.385, 40.769] as [number, number],
      zoom: 16,
      bearing: 0,
      pitch: 60,
    },
    // Split view showing both Güzelyalı and Darıca stations
    'guzelyali-darica': {
      center: [29.175, 40.915] as [number, number], // Center between both stations
      zoom: 13, // Wider zoom to show both stations
      bearing: 0,
      pitch: 60,
    },
    // Intermediate waypoints for smoother transitions
    'istanbul-overview': {
      center: [28.9784, 41.0082] as [number, number],
      zoom: 9, // Wider overview for transitions
      bearing: 0,
      pitch: 45,
    },
    'asian-side-overview': {
      center: [29.2, 40.9] as [number, number],
      zoom: 10,
      bearing: 0,
      pitch: 50,
    },
    'european-side-overview': {
      center: [28.7, 40.8] as [number, number],
      zoom: 10,
      bearing: 0,
      pitch: 50,
    },
    // Debug targets for testing flyTo functionality
    nyc: {
      center: [-74.006, 40.7128] as [number, number], // New York City
      zoom: 12,
      bearing: 0,
      pitch: 60,
    },
    texas: {
      center: [-99.9018, 31.9686] as [number, number], // Texas center
      zoom: 6,
      bearing: 0,
      pitch: 60,
    },
  };

  // Initialize Mapbox
  onMount(() => {
    // Set access token
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
    if (!mapboxgl.accessToken) {
      console.warn(
        '[MapboxMap] Missing VITE_MAPBOX_TOKEN; map will not render.'
      );
      return;
    }

    // Create map with performance optimizations
    const init = () => {
      const safeTarget = mapConfigs && mapConfigs[target] ? target : 'istanbul';
      map = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/scrolli/cmf6orzz701s801sdbjovdh6x',
        center: mapConfigs[safeTarget].center,
        zoom: mapConfigs[safeTarget].zoom,
        bearing: mapConfigs[safeTarget].bearing,
        pitch: mapConfigs[safeTarget].pitch,
        attributionControl: false,
        logoPosition: 'bottom-right',
        // Enable or disable interactions (we disable for scrollytelling)
        interactive: interactive,
        // Performance optimizations
        maxZoom: 18,
        minZoom: 3,
        maxPitch: 60,
        renderWorldCopies: false,
        antialias: false, // Disable antialiasing for faster rendering
        preserveDrawingBuffer: false, // Better performance
        refreshExpiredTiles: false, // Don't refresh expired tiles
        fadeDuration: 0, // Disable fade animations for faster loading
        crossSourceCollisions: true,
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
      // Track the map's initial target so we know the camera state
      currentTarget = safeTarget;
    };

    // Initialize immediately to avoid any cases where idle callback
    // might be delayed or unavailable in the runtime.
    init();

    // Mark loaded on early style events as a fallback for cases when 'load' is delayed
    try {
      map.once('styledata', () => {
        if (!mapLoaded) {
          mapLoaded = true;
        }
      });
      map.once('render', () => {
        if (!mapLoaded) {
          mapLoaded = true;
        }
      });
    } catch {}

    // Navigation controls disabled to avoid zoom/pan by user

    // Wait for map to load
    map.on('load', () => {
      console.log('Mapbox map loaded successfully');
      mapLoaded = true;

      // Execute any queued target once the map finishes loading
      if (pendingTarget && mapConfigs[pendingTarget]) {
        console.log('🔄 Map loaded, applying pending target:', pendingTarget);
        flyToTarget(pendingTarget);
        pendingTarget = null;
      }

      // Defer non-critical work to idle to speed first paint
      map.once('idle', () => {
        // Performance optimizations after map is idle
        try {
          map.setMaxBounds([
            [-180, -85],
            [180, 85],
          ]);
          map.resize();
        } catch {}

        // Add 3D buildings layer (hidden by default)
        try {
          const styleObj: any = map.getStyle();
          const labelLayerId = styleObj.layers?.find(
            (l: any) => l.type === 'symbol' && l.layout?.['text-field']
          )?.id;

          // Try to discover an existing source that serves the 'building' source-layer
          let buildingSourceId = styleObj.layers?.find(
            (l: any) => l['source-layer'] === 'building' && l.source
          )?.source as string | undefined;

          // If none found, define a standard Mapbox composite source pointing to Streets v8
          if (!buildingSourceId) {
            if (!map.getSource('composite')) {
              try {
                map.addSource('composite', {
                  type: 'vector',
                  url: 'mapbox://mapbox.mapbox-streets-v8',
                } as any);
              } catch (err) {
                console.warn(
                  'Failed to add composite source for buildings',
                  err
                );
              }
            }
            if (map.getSource('composite')) {
              buildingSourceId = 'composite';
            }
          }

          if (!buildingSourceId) {
            console.warn(
              '3D buildings skipped: no building source-layer present and composite could not be added'
            );
          } else if (!map.getLayer('3d-buildings')) {
            map.addLayer(
              {
                id: '3d-buildings',
                source: buildingSourceId,
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
    });

    // Lazily load Mapbox Geocoder plugin from CDN and add a search control
    (async () => {
      try {
        if ((window as any).MapboxGeocoder) {
          geocoderLoaded = true;
        } else {
          // Inject CSS
          const cssId = 'mapbox-geocoder-css';
          if (!document.getElementById(cssId)) {
            const link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.href =
              'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1/mapbox-gl-geocoder.css';
            document.head.appendChild(link);
          }
          // Inject JS
          await new Promise<void>((resolve, reject) => {
            const scriptId = 'mapbox-geocoder-js';
            if (document.getElementById(scriptId)) return resolve();
            const s = document.createElement('script');
            s.id = scriptId;
            s.src =
              'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1/mapbox-gl-geocoder.min.js';
            s.async = true;
            s.onload = () => resolve();
            s.onerror = () =>
              reject(new Error('Failed to load Mapbox Geocoder'));
            document.body.appendChild(s);
          });
          geocoderLoaded = true;
        }
        if (geocoderLoaded && mapboxgl && map) {
          const Geocoder = (window as any).MapboxGeocoder;
          const geocoder = new Geocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl,
            marker: false,
            collapsed: true,
            placeholder: 'Search places…',
          });
          try {
            map.addControl(geocoder, 'top-left');
          } catch {}
        }
      } catch (e) {
        console.warn('Geocoder unavailable:', e);
      }
    })();

    // Optimize tile loading
    map.on('idle', () => {
      // Map is idle, tiles are loaded
      console.log('🟢 Map idle. Camera:', getCam());
    });

    // Handle tile loading errors gracefully
    map.on('error', (e) => {
      console.error('❌ Mapbox error:', e);
    });

    // Handle map errors
    map.on('error', (e) => {
      console.error('❌ Mapbox error:', e);
    });

    map.on('movestart', () => {
      console.log('🚀 movestart. From:', getCam());
      // Optimize performance during transitions
      try {
        // Temporarily reduce quality during movement for smoother transitions
        map.setRenderWorldCopies(false);
        map.setMaxZoom(16); // Limit zoom during transitions
      } catch {}
    });

    map.on('moveend', () => {
      console.log('🏁 moveend. To:', getCam());
      // Restore full quality after transition
      try {
        map.setMaxZoom(18); // Restore full zoom capability
        map.setRenderWorldCopies(false);
      } catch {}
    });

    // Handle transition start/end for better performance
    map.on('flystart', () => {
      console.log('✈️ Fly transition started');
      // Disable heavy layers during transitions
      try {
        if (map.getLayer('3d-buildings')) {
          map.setLayoutProperty('3d-buildings', 'visibility', 'none');
        }
      } catch {}
    });

    map.on('flyend', () => {
      console.log('✈️ Fly transition completed');
      // Re-enable layers after transition
      try {
        if (map.getLayer('3d-buildings') && enable3DBuildings) {
          map.setLayoutProperty('3d-buildings', 'visibility', 'visible');
        }
      } catch {}
    });
    // expose for manual debugging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__marmarayMap = map;
  });

  // Track target prop changes
  $: console.log(
    '[MapboxMap] target prop changed to:',
    target,
    'mapLoaded:',
    mapLoaded,
    'map exists:',
    !!map
  );

  // Enhanced flyTo with smooth transitions and intermediate waypoints
  function calculateTransitionDuration(fromConfig: any, toConfig: any): number {
    if (!fromConfig || !toConfig) return 1500;

    // Calculate distance between centers
    const distance = Math.hypot(
      toConfig.center[0] - fromConfig.center[0],
      toConfig.center[1] - fromConfig.center[1]
    );

    // Calculate zoom difference
    const zoomDiff = Math.abs(toConfig.zoom - fromConfig.zoom);

    // Base duration on distance and zoom change
    const baseDuration = 1200;
    const distanceFactor = Math.min(distance * 200, 2000);
    const zoomFactor = zoomDiff * 300;

    return Math.min(baseDuration + distanceFactor + zoomFactor, 3000);
  }

  function getIntermediateWaypoint(fromConfig: any, toConfig: any): any {
    if (!fromConfig || !toConfig) return null;

    // For large transitions, add an intermediate waypoint
    const distance = Math.hypot(
      toConfig.center[0] - fromConfig.center[0],
      toConfig.center[1] - fromConfig.center[1]
    );

    if (distance > 3) {
      // Medium to large geographic distance
      // Use predefined waypoints for better transitions
      const fromLat = fromConfig.center[1];
      const toLat = toConfig.center[1];
      const fromLng = fromConfig.center[0];
      const toLng = toConfig.center[0];

      // Determine if we're crossing between Asian and European sides
      const isCrossingSides =
        (fromLng < 29.0 && toLng > 29.0) || (fromLng > 29.0 && toLng < 29.0);

      if (isCrossingSides) {
        // Use Istanbul overview for cross-Bosphorus transitions
        return mapConfigs['istanbul-overview'];
      } else if (fromLat > 40.8 && toLat > 40.8) {
        // Both on Asian side
        return mapConfigs['asian-side-overview'];
      } else if (fromLat < 40.8 && toLat < 40.8) {
        // Both on European side
        return mapConfigs['european-side-overview'];
      } else {
        // General overview
        return {
          center: [
            (fromConfig.center[0] + toConfig.center[0]) / 2,
            (fromConfig.center[1] + toConfig.center[1]) / 2,
          ],
          zoom: Math.min(fromConfig.zoom, toConfig.zoom) - 2,
          bearing: 0,
          pitch: 45,
        };
      }
    }

    return null;
  }

  // Track active transitions to prevent race conditions
  let activeTransition: NodeJS.Timeout | null = null;
  let isTransitioning = false;
  let lastFlyToTime = 0;
  const FLYTO_THROTTLE_MS = 100; // Minimum time between flyto calls

  function flyToTarget(nextTarget: string) {
    if (!map || !mapLoaded) return;

    const safeTarget = mapConfigs[nextTarget] ? nextTarget : 'istanbul';
    if (currentTarget === safeTarget) return;

    // Throttle rapid successive calls
    const now = Date.now();
    if (now - lastFlyToTime < FLYTO_THROTTLE_MS) {
      console.log('⚠️ FlyTo call throttled, too frequent');
      return;
    }
    lastFlyToTime = now;

    // Prevent multiple simultaneous transitions
    if (isTransitioning) {
      console.log('⚠️ Transition already in progress, queuing:', safeTarget);
      return;
    }

    const fromConfig = currentTarget ? mapConfigs[currentTarget] : null;
    const toConfig = mapConfigs[safeTarget] || mapConfigs['istanbul'];
    if (!toConfig) {
      console.error('❌ Invalid map configuration for target:', safeTarget);
      return;
    }

    // Validate configuration parameters
    if (!Array.isArray(toConfig.center) || toConfig.center.length !== 2) {
      console.error('❌ Invalid center coordinates for target:', safeTarget);
      return;
    }

    if (
      typeof toConfig.zoom !== 'number' ||
      toConfig.zoom < 0 ||
      toConfig.zoom > 22
    ) {
      console.error('❌ Invalid zoom level for target:', safeTarget);
      return;
    }

    try {
      isTransitioning = true;
      const duration = calculateTransitionDuration(fromConfig, toConfig);
      const waypoint = getIntermediateWaypoint(fromConfig, toConfig);

      // Clear any existing transition timeout
      if (activeTransition) {
        clearTimeout(activeTransition);
        activeTransition = null;
      }

      if (waypoint) {
        console.log('🔄 Using intermediate waypoint for smooth transition');

        // First transition to waypoint
        map.flyTo({
          center: waypoint.center,
          zoom: waypoint.zoom,
          bearing: waypoint.bearing,
          pitch: waypoint.pitch,
          duration: duration * 0.4,
          essential: true,
          easing: (t: number) => t * (2 - t),
        });

        // Second transition to final destination
        activeTransition = setTimeout(() => {
          try {
            map.flyTo({
              center: toConfig.center,
              zoom: toConfig.zoom,
              bearing: toConfig.bearing,
              pitch: toConfig.pitch,
              duration: duration * 0.6,
              essential: true,
              easing: (t: number) => t * t * (3 - 2 * t),
            });

            // Reset transition state after second transition
            setTimeout(() => {
              isTransitioning = false;
              activeTransition = null;
            }, duration * 0.6);
          } catch (error) {
            console.error('❌ Error in second flyTo transition:', error);
            isTransitioning = false;
            activeTransition = null;
          }
        }, duration * 0.4);
      } else {
        // Single transition
        map.flyTo({
          center: toConfig.center,
          zoom: toConfig.zoom,
          bearing: toConfig.bearing,
          pitch: toConfig.pitch,
          duration,
          essential: true,
          easing: (t: number) => t * t * (3 - 2 * t),
        });

        // Reset transition state after single transition
        setTimeout(() => {
          isTransitioning = false;
          activeTransition = null;
        }, duration);
      }

      console.log(
        '✅ Enhanced FlyTo command sent to:',
        safeTarget,
        'Duration:',
        duration
      );
      currentTarget = safeTarget;
    } catch (error) {
      console.error('❌ Error in flyToTarget:', error);
      isTransitioning = false;
      activeTransition = null;
    }
  }

  // React to target changes (scrollytelling integration)
  $: if (map && target) {
    const desiredTarget = mapConfigs[target] ? target : 'istanbul';

    console.log(
      '[MapboxMap] target prop observed:',
      desiredTarget,
      'mapLoaded:',
      mapLoaded,
      'currentTarget:',
      currentTarget
    );

    if (!mapLoaded) {
      if (pendingTarget !== desiredTarget) {
        console.log('⏳ Map not loaded yet, queuing target:', desiredTarget);
        pendingTarget = desiredTarget;
      }
    } else if (currentTarget !== desiredTarget) {
      flyToTarget(desiredTarget);
      pendingTarget = null;
    }
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

  // When the map becomes visible again (e.g., user scrolls back),
  // re-assert the current camera so the view is restored reliably.
  $: if (map && mapLoaded) {
    if (visible && !lastVisible) {
      try {
        const safeTarget =
          currentTarget && mapConfigs[currentTarget] ?
            currentTarget
          : 'istanbul';
        const cfg = mapConfigs[safeTarget];
        map.flyTo({
          center: cfg.center,
          zoom: cfg.zoom,
          bearing: cfg.bearing,
          pitch: cfg.pitch,
          duration: 400,
          essential: true,
        });
      } catch {}
    }
    lastVisible = !!visible;
  }

  // Cleanup
  onDestroy(() => {
    // Clear any active transitions to prevent memory leaks
    if (activeTransition) {
      clearTimeout(activeTransition);
      activeTransition = null;
    }
    isTransitioning = false;

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

<div
  class="mapbox-map {mapLoaded ? 'loaded' : ''}"
  bind:this={mapContainer}
  style="height: {height}px;"
>
  {#if placeholderUrl && !mapLoaded}
    <img class="map-placeholder" src={placeholderUrl} alt="" />
  {/if}
  <!-- Mapbox GL canvas renders here -->

  <!-- Left legend overlay -->
  <div class="map-legend">
    <div class="legend-title">Gösterge</div>
    <div class="legend-item">
      <span class="swatch swatch-marmaray"></span>
      Marmaray hattı
    </div>
    <div class="legend-item">
      <span class="swatch swatch-other"></span>
      Diğer metro/tram hatları
    </div>
    <div class="legend-item">
      <span class="dot dot-station"></span>
      İstasyonlar
    </div>
    <div class="legend-item">
      <span class="dot dot-incident"></span>
      Vaka noktaları
    </div>
  </div>
</div>

<style lang="scss">
  .mapbox-map {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
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
      opacity: 0.999; /* ensure visible even if 'load' is delayed */
      transition: opacity 0.15s ease-out;
    }
    &.loaded :global(.mapboxgl-canvas) {
      opacity: 1;
    }
  }

  .map-placeholder {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
    filter: saturate(0.98) contrast(1.02);
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

  /* Legend overlay */
  .map-legend {
    position: absolute;
    left: 12px;
    bottom: 12px; /* bottom-left to avoid overlapping geocoder */
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 12px;
    color: #1f2937;
    z-index: 5;
    backdrop-filter: blur(4px);
    min-width: 180px;
  }
  .legend-title {
    font-weight: 700;
    margin-bottom: 6px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px 0;
  }
  .swatch {
    display: inline-block;
    width: 18px;
    height: 4px;
    border-radius: 2px;
  }
  .swatch-marmaray {
    background: #d32f2f;
  }
  .swatch-other {
    background: #1e88e5;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    border: 1px solid #fff;
  }
  .dot-station {
    background: #2e7d32;
  }
  .dot-incident {
    background: #d32f2f;
  }
</style>
