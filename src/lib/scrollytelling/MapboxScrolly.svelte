<script lang="ts">
  /**
   * Mapbox Scrollytelling Component
   * Deterministic map control based on story steps
   */
  import { onMount, onDestroy } from 'svelte';
  import mapboxgl from 'mapbox-gl';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import type { StoryStep } from '../archieml/parser';

  export let mapboxToken: string;
  export let currentStep: StoryStep | null = null;
  export let style = 'mapbox://styles/mapbox/light-v11';
  export let debug = false;
  export let draggable: boolean = false;

  let container: HTMLElement;
  let map: mapboxgl.Map;
  let markers: mapboxgl.Marker[] = [];

  // Animated values
  let animatedLng = tweened(0, { duration: 1500, easing: cubicOut });
  let animatedLat = tweened(0, { duration: 1500, easing: cubicOut });
  let animatedZoom = tweened(10, { duration: 1500, easing: cubicOut });
  let animatedPitch = tweened(0, { duration: 1500, easing: cubicOut });
  let animatedBearing = tweened(0, { duration: 1500, easing: cubicOut });

  // Track layer states
  let layerStates = new Map<string, { visibility: string; opacity: number }>();

  onMount(() => {
    mapboxgl.accessToken = mapboxToken;

    map = new mapboxgl.Map({
      container,
      style,
      center: [0, 0],
      zoom: 2,
      pitch: 0,
      bearing: 0,
      interactive: draggable,
    });

    if (!draggable) {
      map.scrollZoom.disable();
      map.boxZoom.disable();
      map.dragRotate.disable();
      map.dragPan.disable();
      map.keyboard.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();
    }

    map.on('load', () => {
      // Apply initial step if available
      if (currentStep?.map) {
        applyMapConfig(currentStep.map, false);
      }
    });

    // Subscribe to animated values
    const unsubscribers = [
      animatedLng.subscribe((lng) => updateMapPosition()),
      animatedLat.subscribe((lat) => updateMapPosition()),
      animatedZoom.subscribe((zoom) => updateMapPosition()),
      animatedPitch.subscribe((pitch) => updateMapPosition()),
      animatedBearing.subscribe((bearing) => updateMapPosition()),
    ];

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      map?.remove();
    };
  });

  // React to step changes
  $: if (map && currentStep?.map) {
    applyMapConfig(currentStep.map, true);
  }

  // Handle null currentStep gracefully
  $: if (map && !currentStep) {
    // Keep current map state when no step is active
    console.log('No active step, maintaining current map state');
  }

  function applyMapConfig(
    config: NonNullable<StoryStep['map']>,
    animate = true
  ) {
    if (!map) {
      console.warn('⚠️ Map not available for applyMapConfig');
      return;
    }

    try {
      // Update camera position
      if (config.center) {
        // Validate center coordinates
        if (!Array.isArray(config.center) || config.center.length !== 2) {
          console.error('❌ Invalid center coordinates:', config.center);
          return;
        }

        if (animate) {
          animatedLng.set(config.center[0]);
          animatedLat.set(config.center[1]);
        } else {
          animatedLng.set(config.center[0], { duration: 0 });
          animatedLat.set(config.center[1], { duration: 0 });
        }
      }

      if (config.zoom !== undefined) {
        // Validate zoom level
        if (
          typeof config.zoom !== 'number' ||
          config.zoom < 0 ||
          config.zoom > 22
        ) {
          console.error('❌ Invalid zoom level:', config.zoom);
          return;
        }

        if (animate) {
          animatedZoom.set(config.zoom);
        } else {
          animatedZoom.set(config.zoom, { duration: 0 });
        }
      }

      if (config.pitch !== undefined) {
        // Validate pitch
        if (
          typeof config.pitch !== 'number' ||
          config.pitch < 0 ||
          config.pitch > 85
        ) {
          console.error('❌ Invalid pitch value:', config.pitch);
          return;
        }

        if (animate) {
          animatedPitch.set(config.pitch);
        } else {
          animatedPitch.set(config.pitch, { duration: 0 });
        }
      }

      if (config.bearing !== undefined) {
        // Validate bearing
        if (
          typeof config.bearing !== 'number' ||
          config.bearing < -180 ||
          config.bearing > 180
        ) {
          console.error('❌ Invalid bearing value:', config.bearing);
          return;
        }

        if (animate) {
          animatedBearing.set(config.bearing);
        } else {
          animatedBearing.set(config.bearing, { duration: 0 });
        }
      }

      // NEW: toggle conventional layers by semantic flags
      toggleSemanticLayers(config);

      // Update layers
      if (config.layers) {
        config.layers.forEach((layerConfig) => {
          updateLayer(layerConfig);
        });
      }

      // Update markers
      if (config.markers) {
        updateMarkers(config.markers);
      }
    } catch (error) {
      console.error('❌ Error in applyMapConfig:', error);
    }
  }

  /**
   * Toggle common layer groups using semantic booleans from config
   * Expected layer ids present in style:
   * - marmaray-line
   * - marmaray-stations
   * - metro-lines
   * - metro-stations
   */
  function toggleSemanticLayers(config: any) {
    const safelySetVisibility = (id: string, visible: boolean) => {
      if (!map.getLayer(id)) return;
      map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
    };

    if (config.showMarmarayLine !== undefined) {
      safelySetVisibility('marmaray-line', !!config.showMarmarayLine);
      safelySetVisibility('marmaray-stations', !!config.showMarmarayLine);
    }

    if (config.showStations !== undefined) {
      safelySetVisibility('marmaray-stations', !!config.showStations);
    }

    if (config.showMetroLines !== undefined) {
      safelySetVisibility('metro-lines', !!config.showMetroLines);
      safelySetVisibility('metro-stations', !!config.showMetroLines);
    }

    if (config.showIncidentPoints !== undefined) {
      safelySetVisibility('incident-points', !!config.showIncidentPoints);
    }
  }

  function updateMapPosition() {
    if (!map) return;

    map.jumpTo({
      center: [$animatedLng, $animatedLat],
      zoom: $animatedZoom,
      pitch: $animatedPitch,
      bearing: $animatedBearing,
    });
  }

  function updateLayer(layerConfig: {
    id: string;
    visibility?: string;
    opacity?: number;
  }) {
    if (!map || !map.getLayer(layerConfig.id)) return;

    const currentState = layerStates.get(layerConfig.id) || {
      visibility: 'visible',
      opacity: 1,
    };
    const newState = { ...currentState };

    if (layerConfig.visibility !== undefined) {
      map.setLayoutProperty(
        layerConfig.id,
        'visibility',
        layerConfig.visibility as 'visible' | 'none'
      );
      newState.visibility = layerConfig.visibility;
    }

    if (layerConfig.opacity !== undefined) {
      // Apply opacity to paint properties that support it
      const layer = map.getLayer(layerConfig.id);
      if (layer) {
        const paintProps = [
          'fill-opacity',
          'line-opacity',
          'circle-opacity',
          'text-opacity',
          'raster-opacity',
        ];
        paintProps.forEach((prop) => {
          try {
            map.setPaintProperty(
              layerConfig.id,
              prop as any,
              layerConfig.opacity
            );
          } catch (e) {
            // Property might not exist for this layer type
          }
        });
      }
      newState.opacity = layerConfig.opacity;
    }

    layerStates.set(layerConfig.id, newState);
  }

  function updateMarkers(
    markerConfigs: NonNullable<StoryStep['map']>['markers']
  ) {
    // Clear existing markers
    markers.forEach((marker) => marker.remove());
    markers = [];

    // Add new markers
    if (!markerConfigs) return;

    markerConfigs.forEach((config) => {
      const el = document.createElement('div');
      el.className = 'story-marker';
      if (config.label) {
        el.textContent = config.label;
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([config.lng, config.lat])
        .addTo(map);

      markers.push(marker);
    });
  }

  // Debug information
  $: debugInfo = {
    step: currentStep?.id || 'none',
    center: [$animatedLng.toFixed(4), $animatedLat.toFixed(4)],
    zoom: $animatedZoom.toFixed(2),
    pitch: $animatedPitch.toFixed(1),
    bearing: $animatedBearing.toFixed(1),
    layers: Array.from(layerStates.entries()),
  };
</script>

<div class="mapbox-container" class:debug-mode={debug}>
  <div bind:this={container} class="map"></div>

  {#if debug}
    <div class="map-debug">
      <h4>Map State</h4>
      <dl>
        <dt>Step:</dt>
        <dd>{debugInfo.step}</dd>

        <dt>Center:</dt>
        <dd>{debugInfo.center.join(', ')}</dd>

        <dt>Zoom:</dt>
        <dd>{debugInfo.zoom}</dd>

        <dt>Pitch:</dt>
        <dd>{debugInfo.pitch}°</dd>

        <dt>Bearing:</dt>
        <dd>{debugInfo.bearing}°</dd>

        {#if debugInfo.layers.length > 0}
          <dt>Layers:</dt>
          <dd>
            {#each debugInfo.layers as [id, state]}
              <div class="layer-state">
                {id}: {state.visibility} (opacity: {state.opacity})
              </div>
            {/each}
          </dd>
        {/if}
      </dl>
    </div>
  {/if}
</div>

<style>
  .mapbox-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .map {
    width: 100%;
    height: 100%;
  }

  :global(.story-marker) {
    background-color: #ff4444;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    transform: translate(-50%, -100%);
    margin-bottom: 8px;
  }

  :global(.story-marker::after) {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid #ff4444;
  }

  .map-debug {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 11px;
    font-family: monospace;
    max-width: 250px;
  }

  .map-debug h4 {
    margin: 0 0 0.5rem 0;
    font-size: 12px;
  }

  .map-debug dl {
    margin: 0;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.2rem 0.5rem;
  }

  .map-debug dt {
    font-weight: bold;
  }

  .map-debug dd {
    margin: 0;
  }

  .layer-state {
    font-size: 10px;
    margin: 0.1rem 0;
  }
</style>
