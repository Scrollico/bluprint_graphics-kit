<!-- European Suicide Statistics Map - Reuters-style visualization -->
<script lang="ts">
  import { onMount } from 'svelte';
  import mapboxgl from 'mapbox-gl';
  import { assets } from '$app/paths';

  export let data: Array<{
    country: string;
    average: number;
    coordinates?: [number, number];
  }> = [];

  export let title = 'Railway Suicide Rates in Europe';
  export let subtitle = 'Average annual incidents per country (2019-2023)';

  let mapContainer: HTMLDivElement;
  let map: mapboxgl.Map | null = null;

  // Mapbox configuration
  const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

  // Country coordinates for Europe
  const countryCoordinates: Record<string, [number, number]> = {
    Almanya: [10.4515, 51.1657], // Germany
    Fransa: [2.2137, 46.2276], // France
    Hollanda: [5.2913, 52.1326], // Netherlands
    Çekya: [15.4729, 49.8175], // Czech Republic
    İtalya: [12.5674, 41.8719], // Italy
    İspanya: [-3.7038, 40.4168], // Spain
    İsviçre: [8.2275, 46.8182], // Switzerland
    Macaristan: [19.5033, 47.1625], // Hungary
    Avusturya: [14.5501, 47.5162], // Austria
    Polonya: [19.1451, 51.9194], // Poland
    İsveç: [18.6435, 60.1282], // Sweden
    Slovakya: [19.699, 48.669], // Slovakia
    Finlandiya: [25.7482, 61.9241], // Finland
    Portekiz: [-8.2245, 39.3999], // Portugal
    Romanya: [24.9668, 45.9432], // Romania
    Türkiye: [35.2433, 38.9637], // Turkey (for comparison)
  };

  // Enhanced data with coordinates
  const enhancedData = data.map((d) => ({
    ...d,
    coordinates: countryCoordinates[d.country] || [0, 0],
  }));

  // Color scale for heatmap
  function getColor(value: number): string {
    if (value >= 700) return '#8B0000'; // Dark red
    if (value >= 500) return '#B22222'; // Firebrick
    if (value >= 300) return '#DC143C'; // Crimson
    if (value >= 200) return '#FF6347'; // Tomato
    if (value >= 150) return '#FF8C00'; // Dark orange
    if (value >= 100) return '#FFA500'; // Orange
    if (value >= 50) return '#FFD700'; // Gold
    return '#FFFFE0'; // Light yellow
  }

  // Get circle radius based on value
  function getRadius(value: number): number {
    const baseRadius = 10;
    const maxRadius = 40;
    const scaleFactor = Math.sqrt(value / 100);
    return Math.min(baseRadius + scaleFactor * 10, maxRadius);
  }

  onMount(() => {
    if (!MAPBOX_ACCESS_TOKEN || !mapContainer) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    // Initialize map centered on Europe
    map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [10, 50], // Center of Europe
      zoom: 3.5,
      pitch: 0,
      bearing: 0,
      interactive: true,
    });

    map.on('load', () => {
      if (!map) return;

      // Add circle markers for each country
      enhancedData.forEach((country) => {
        if (country.coordinates[0] === 0) return;

        // Create DOM element for marker
        const el = document.createElement('div');
        el.className = 'europe-marker';
        el.style.width = `${getRadius(country.average) * 2}px`;
        el.style.height = `${getRadius(country.average) * 2}px`;
        el.style.backgroundColor = getColor(country.average);
        el.style.border = '2px solid white';
        el.style.borderRadius = '50%';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.3s ease';

        // Add hover effect
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
          el.style.zIndex = '1000';
        });

        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.zIndex = 'auto';
        });

        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          className: 'europe-popup',
        }).setHTML(`
          <div class="popup-content">
            <h4>${country.country}</h4>
            <p class="value">${country.average.toFixed(1)}</p>
            <p class="label">Average annual incidents</p>
          </div>
        `);

        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat(country.coordinates as [number, number])
          .setPopup(popup)
          .addTo(map!);
      });

      // Add Turkey marker for comparison (with different style)
      const turkeyData = { country: 'Türkiye', average: 4.0 }; // Marmaray average
      const turkeyCoords = countryCoordinates['Türkiye'];

      const turkeyEl = document.createElement('div');
      turkeyEl.className = 'turkey-marker';
      turkeyEl.style.width = `${getRadius(turkeyData.average) * 2}px`;
      turkeyEl.style.height = `${getRadius(turkeyData.average) * 2}px`;
      turkeyEl.style.backgroundColor = '#2E7D32'; // Green for Turkey
      turkeyEl.style.border = '3px solid #1B5E20';
      turkeyEl.style.borderRadius = '50%';
      turkeyEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
      turkeyEl.style.cursor = 'pointer';

      const turkeyPopup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'turkey-popup',
      }).setHTML(`
        <div class="popup-content turkey">
          <h4>Türkiye (Marmaray)</h4>
          <p class="value">${turkeyData.average.toFixed(1)}</p>
          <p class="label">Average annual incidents</p>
          <p class="note">Significantly lower than EU average</p>
        </div>
      `);

      new mapboxgl.Marker(turkeyEl)
        .setLngLat(turkeyCoords)
        .setPopup(turkeyPopup)
        .addTo(map!);
    });

    return () => {
      if (map) {
        map.remove();
      }
    };
  });
</script>

<div class="europe-map-container">
  <div class="map-header">
    <h3>{title}</h3>
    {#if subtitle}
      <p class="subtitle">{subtitle}</p>
    {/if}
  </div>

  <div class="map-wrapper">
    <div bind:this={mapContainer} class="map"></div>

    <!-- Legend -->
    <div class="map-legend">
      <h4>Annual Incidents</h4>
      <div class="legend-items">
        <div class="legend-item">
          <div class="color-box" style="background-color: #8B0000"></div>
          <span>700+</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #DC143C"></div>
          <span>300-699</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #FF8C00"></div>
          <span>100-299</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #FFD700"></div>
          <span>50-99</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #FFFFE0"></div>
          <span>&lt;50</span>
        </div>
        <div class="legend-item special">
          <div class="color-box" style="background-color: #2E7D32"></div>
          <span>Türkiye</span>
        </div>
      </div>
    </div>

    <!-- Key insights -->
    <div class="insights-box">
      <h4>Key Findings</h4>
      <ul>
        <li>
          <strong>Germany</strong> leads with 765.7 average annual incidents
        </li>
        <li>
          <strong>Turkey (Marmaray)</strong> has significantly lower rates at ~4
          per year
        </li>
        <li>Western European countries show higher incident rates overall</li>
      </ul>
    </div>
  </div>
</div>

<style lang="scss">
  .europe-map-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .map-header {
    padding: 1.5rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-bottom: 1px solid #e0e0e0;

    h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a1a;
      font-family: 'Reuters Headline', Georgia, serif;
    }

    .subtitle {
      margin: 0.5rem 0 0;
      font-size: 0.95rem;
      color: #666;
      font-style: italic;
    }
  }

  .map-wrapper {
    position: relative;
    flex: 1;
    min-height: 600px;
  }

  .map {
    width: 100%;
    height: 100%;
    min-height: 600px;
  }

  .map-legend {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    h4 {
      margin: 0 0 0.75rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .legend-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #666;

      &.special {
        padding-top: 0.5rem;
        border-top: 1px solid #e0e0e0;
        margin-top: 0.25rem;
      }

      .color-box {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1px solid rgba(0, 0, 0, 0.2);
      }
    }
  }

  .insights-box {
    position: absolute;
    bottom: 20px;
    left: 20px;
    max-width: 350px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    h4 {
      margin: 0 0 0.75rem;
      font-size: 1rem;
      font-weight: 600;
      color: #333;
    }

    ul {
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        padding: 0.5rem 0;
        font-size: 0.9rem;
        color: #666;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        strong {
          color: #333;
          font-weight: 600;
        }
      }
    }
  }

  // Popup styles
  :global(.europe-popup) {
    .mapboxgl-popup-content {
      padding: 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .popup-content {
      padding: 1rem;
      background: white;

      h4 {
        margin: 0 0 0.5rem;
        font-size: 1.1rem;
        font-weight: 600;
        color: #333;
      }

      .value {
        margin: 0;
        font-size: 2rem;
        font-weight: 700;
        color: #dc143c;
      }

      .label {
        margin: 0.25rem 0 0;
        font-size: 0.85rem;
        color: #666;
      }

      &.turkey {
        .value {
          color: #2e7d32;
        }

        .note {
          margin: 0.5rem 0 0;
          font-size: 0.8rem;
          color: #2e7d32;
          font-weight: 600;
        }
      }
    }
  }

  :global(.turkey-popup) {
    .mapboxgl-popup-content {
      border: 2px solid #2e7d32;
    }
  }

  // Responsive
  @media (max-width: 768px) {
    .map-legend {
      top: 10px;
      right: 10px;
      padding: 0.75rem;

      h4 {
        font-size: 0.8rem;
      }

      .legend-item {
        font-size: 0.75rem;

        .color-box {
          width: 16px;
          height: 16px;
        }
      }
    }

    .insights-box {
      bottom: 10px;
      left: 10px;
      max-width: 280px;
      padding: 0.75rem;

      h4 {
        font-size: 0.9rem;
      }

      ul li {
        font-size: 0.8rem;
        padding: 0.4rem 0;
      }
    }
  }
</style>
