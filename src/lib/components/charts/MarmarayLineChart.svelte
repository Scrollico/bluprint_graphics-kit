<script lang="ts">
  export let width: number = 800;
  export let height: number = 600;
  export let showIncidents: boolean = true;
  export let highlightStations: string[] = [];

  // Metro map colors - authentic transit map palette
  const marmarayLineColor = '#00A3DD'; // Istanbul Metro blue
  const incidentColor = '#E53E3E'; // Red for incidents
  const stationBorderColor = '#2D3748';
  const stationFillColor = '#FFFFFF';

  // Linear metro map layout - all stations on one line
  const marmarayStations = [
    { name: 'Halkalı', incidents: 0, position: 0 },
    { name: 'Bakırköy', incidents: 0, position: 1 },
    { name: 'Yeşilyurt', incidents: 1, position: 2 },
    { name: 'Ataköy', incidents: 1, position: 3 },
    { name: 'Yenikapı', incidents: 8, position: 4, interchange: true },
    { name: 'Üsküdar', incidents: 2, position: 5, interchange: true },
    { name: 'Ayrılık Çeşmesi', incidents: 5, position: 6, interchange: true },
    { name: 'Bostancı', incidents: 4, position: 7 },
    { name: 'Suadiye', incidents: 1, position: 8 },
    { name: 'Feneryolu', incidents: 2, position: 9 },
    { name: 'Güzelyalı', incidents: 1, position: 10 },
    { name: 'Tuzla', incidents: 1, position: 11 },
    { name: 'Darıca', incidents: 1, position: 12 },
  ];

  // Calculate station positions
  const lineStartX = 80;
  const lineEndX = 720;
  const lineY = 200;
  const stationSpacing =
    (lineEndX - lineStartX) / (marmarayStations.length - 1);

  function getStationX(position: number): number {
    return lineStartX + position * stationSpacing;
  }

  // Metro map incident indicators - subtle tick marks
  function getIncidentHeight(count: number): number {
    if (count === 0) return 0;
    if (count <= 2) return 15;
    if (count <= 4) return 25;
    if (count <= 6) return 35;
    return 45;
  }

  function getIncidentOpacity(count: number): number {
    if (count === 0) return 0;
    if (count <= 2) return 0.6;
    if (count <= 4) return 0.75;
    if (count <= 6) return 0.9;
    return 1;
  }

  // Provide staggered label offsets to avoid overlaps around the dense cluster
  function getLabelOffsetY(_station: { name: string; position: number }) {
    // Keep all station labels on the same baseline to avoid vertical jitter
    return 42;
  }

  // Interchange badge was removed; no offset calculations needed
</script>

<div class="marmaray-metro-map" style="width: {width}px; height: {height}px;">
  <svg width="100%" height="100%" viewBox="0 0 800 400">
    <defs>
      <!-- Metro map styling gradients -->
      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop
          offset="0%"
          style="stop-color: {marmarayLineColor}; stop-opacity: 1"
        />
        <stop offset="50%" style="stop-color: #0095CC; stop-opacity: 1" />
        <stop
          offset="100%"
          style="stop-color: {marmarayLineColor}; stop-opacity: 1"
        />
      </linearGradient>

      <!-- Station shadow -->
      <filter id="stationShadow">
        <feDropShadow
          dx="1"
          dy="1"
          stdDeviation="2"
          flood-color="#000"
          flood-opacity="0.2"
        />
      </filter>
    </defs>

    <g transform="translate(40, 40)">
      <!-- Route Line Header -->
      <g class="route-header">
        <rect
          x="0"
          y="20"
          width="30"
          height="15"
          fill={marmarayLineColor}
          rx="3"
        />
        <text
          x="40"
          y="32"
          font-family="'Helvetica Neue', Arial, sans-serif"
          font-size="16"
          font-weight="700"
          fill="#1A202C"
          letter-spacing="-0.5px"
        >
          MARMARAY HATTı
        </text>
        <text
          x="40"
          y="50"
          font-family="'Helvetica Neue', Arial, sans-serif"
          font-size="11"
          font-weight="400"
          fill="#4A5568"
          letter-spacing="0.2px"
        >
          Halkalı ↔ Darıca
        </text>
      </g>

      <!-- Main Metro Line -->
      <line
        x1={lineStartX}
        y1={lineY}
        x2={lineEndX}
        y2={lineY}
        stroke="url(#lineGradient)"
        stroke-width="8"
        stroke-linecap="round"
      />

      <!-- Terminal caps -->
      <circle cx={lineStartX} cy={lineY} r="6" fill={marmarayLineColor} />
      <circle cx={lineEndX} cy={lineY} r="6" fill={marmarayLineColor} />

      <!-- Stations -->
      {#each marmarayStations as station, i}
        <g class="metro-station" data-station={station.name}>
          <!-- Incident indicator (red tick above station) -->
          {#if showIncidents && station.incidents > 0}
            <line
              x1={getStationX(station.position)}
              y1={lineY - 25}
              x2={getStationX(station.position)}
              y2={lineY - 25 - getIncidentHeight(station.incidents)}
              stroke={incidentColor}
              stroke-width="4"
              opacity={getIncidentOpacity(station.incidents)}
              stroke-linecap="round"
              class="incident-indicator"
              class:dimmed={highlightStations.length > 0 &&
                !highlightStations.includes(station.name)}
            />
            <!-- Incident count -->
            <text
              x={getStationX(station.position)}
              y={lineY - 25 - getIncidentHeight(station.incidents) - 8}
              text-anchor="middle"
              font-family="'Helvetica Neue', Arial, sans-serif"
              font-size="9"
              font-weight="700"
              fill={incidentColor}
              class="incident-count"
              class:dimmed={highlightStations.length > 0 &&
                !highlightStations.includes(station.name)}
            >
              {station.incidents}
            </text>
          {/if}

          <!-- Interchange station (double circle) -->
          {#if station.interchange}
            <circle
              cx={getStationX(station.position)}
              cy={lineY}
              r="12"
              fill={stationFillColor}
              stroke={stationBorderColor}
              stroke-width="3"
              filter="url(#stationShadow)"
              class="station-circle"
              class:dimmed={highlightStations.length > 0 &&
                !highlightStations.includes(station.name)}
              class:highlighted={highlightStations.includes(station.name)}
            />
            <circle
              cx={getStationX(station.position)}
              cy={lineY}
              r="8"
              fill="none"
              stroke={marmarayLineColor}
              stroke-width="2"
              class="inner-circle"
              class:dimmed={highlightStations.length > 0 &&
                !highlightStations.includes(station.name)}
            />
          {:else}
            <!-- Regular station -->
            <circle
              cx={getStationX(station.position)}
              cy={lineY}
              r="8"
              fill={stationFillColor}
              stroke={stationBorderColor}
              stroke-width="2.5"
              filter="url(#stationShadow)"
              class="station-circle"
              class:dimmed={highlightStations.length > 0 &&
                !highlightStations.includes(station.name)}
              class:highlighted={highlightStations.includes(station.name)}
            />
          {/if}

          <!-- Station name -->
          <!-- Station label: handle dense cluster and long names -->
          {#if station.name === 'Ayrılık Çeşmesi'}
            <text
              x={getStationX(station.position)}
              y={lineY + getLabelOffsetY(station) - 6}
              text-anchor="middle"
              font-family="'Helvetica Neue', Arial, sans-serif"
              font-size="9"
              font-weight="500"
              fill="#2D3748"
              class="station-label"
              class:dimmed={highlightStations.length > 0 &&
                !highlightStations.includes(station.name)}
              class:highlighted-text={highlightStations.includes(station.name)}
            >
              <tspan x={getStationX(station.position)} dy="0">Ayrılık</tspan>
              <tspan x={getStationX(station.position)} dy="12">Çeşmesi</tspan>
            </text>
          {:else}
            <text
              x={getStationX(station.position)}
              y={lineY + getLabelOffsetY(station)}
              text-anchor="middle"
              font-family="'Helvetica Neue', Arial, sans-serif"
              font-size="10"
              font-weight="500"
              fill="#2D3748"
              class="station-label"
              class:dimmed={highlightStations.length > 0 &&
                !highlightStations.includes(station.name)}
              class:highlighted-text={highlightStations.includes(station.name)}
            >
              {station.name}
            </text>
          {/if}

          <!-- Interchange badges removed by request -->
        </g>
      {/each}

      <!-- Metro Map Legend -->
      <g class="metro-legend" transform="translate(0, 300)">
        <rect
          x="0"
          y="0"
          width="720"
          height="50"
          fill="#F7FAFC"
          stroke="#E2E8F0"
          stroke-width="1"
          rx="8"
        />

        <!-- Legend Title -->
        <text
          x="15"
          y="20"
          font-family="'Helvetica Neue', Arial, sans-serif"
          font-size="12"
          font-weight="600"
          fill="#2D3748"
        >
          İntihar Vakası Göstergesi:
        </text>

        <!-- Legend Items -->
        <g transform="translate(15, 30)">
          <!-- No incidents -->
          <circle
            cx="10"
            cy="0"
            r="5"
            fill={stationFillColor}
            stroke={stationBorderColor}
            stroke-width="1.5"
          />
          <text
            x="25"
            y="4"
            font-family="'Helvetica Neue', Arial, sans-serif"
            font-size="9"
            fill="#4A5568">Vaka yok</text
          >

          <!-- Low incidents -->
          <line
            x1="80"
            y1="-8"
            x2="80"
            y2="8"
            stroke={incidentColor}
            stroke-width="3"
            opacity="0.6"
            stroke-linecap="round"
          />
          <text
            x="95"
            y="4"
            font-family="'Helvetica Neue', Arial, sans-serif"
            font-size="9"
            fill="#4A5568">1-2 vaka</text
          >

          <!-- Medium incidents -->
          <line
            x1="160"
            y1="-15"
            x2="160"
            y2="15"
            stroke={incidentColor}
            stroke-width="3"
            opacity="0.8"
            stroke-linecap="round"
          />
          <text
            x="175"
            y="4"
            font-family="'Helvetica Neue', Arial, sans-serif"
            font-size="9"
            fill="#4A5568">3-4 vaka</text
          >

          <!-- High incidents -->
          <line
            x1="240"
            y1="-22"
            x2="240"
            y2="22"
            stroke={incidentColor}
            stroke-width="4"
            opacity="1"
            stroke-linecap="round"
          />
          <text
            x="255"
            y="4"
            font-family="'Helvetica Neue', Arial, sans-serif"
            font-size="9"
            fill="#4A5568">5+ vaka</text
          >

          <!-- Interchange -->
          <circle
            cx="330"
            cy="0"
            r="8"
            fill={stationFillColor}
            stroke={stationBorderColor}
            stroke-width="2"
          />
          <circle
            cx="330"
            cy="0"
            r="5"
            fill="none"
            stroke={marmarayLineColor}
            stroke-width="1.5"
          />
          <text
            x="345"
            y="4"
            font-family="'Helvetica Neue', Arial, sans-serif"
            font-size="9"
            fill="#4A5568">Aktarma istasyonu</text
          >
        </g>
      </g>
    </g>
  </svg>
</div>

<style>
  .marmaray-metro-map {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border-radius: 0;
    box-shadow: none;
    border: none;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }

  /* Metro station interactions */
  :global(.metro-station) {
    cursor: default;
    pointer-events: none; /* disable hover to prevent flicker in scrollytelling */
  }

  :global(.station-circle) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Disable hover grow to avoid perceived flicker */
  /* :global(.metro-station:hover .station-circle) { */
  /*   transform: scale(1.2); */
  /*   stroke-width: 3; */
  /* } */

  /* Dimmed stations fade into background */
  :global(.station-circle.dimmed),
  :global(.inner-circle.dimmed) {
    opacity: 0.25;
    transition: opacity 0.6s ease;
  }

  :global(.station-label.dimmed),
  :global(.incident-indicator.dimmed),
  :global(.incident-count.dimmed),
  :global(.interchange-label.dimmed) {
    opacity: 0.3;
    transition: opacity 0.6s ease;
  }

  /* Highlighted stations remain prominent */
  :global(.station-circle.highlighted) {
    transition: all 0.3s ease;
  }

  /* Station labels */
  :global(.station-label) {
    transition: all 0.3s ease;
    user-select: none;
  }

  /* :global(.metro-station:hover .station-label) { */
  /*   font-weight: 700; */
  /*   fill: #1a202c; */
  /* } */

  :global(.highlighted-text) {
    font-weight: 600 !important;
    fill: #2d3748 !important;
  }

  /* Incident indicators */
  :global(.incident-indicator) {
    transition: all 0.3s ease;
  }

  /* :global(.metro-station:hover .incident-indicator) { */
  /*   stroke-width: 5; */
  /*   opacity: 1 !important; */
  /* } */

  :global(.incident-count) {
    transition: all 0.3s ease;
    user-select: none;
  }

  /* :global(.metro-station:hover .incident-count) { */
  /*   font-weight: 900; */
  /*   font-size: 11px; */
  /* } */

  /* Interchange badges removed */

  /* Metro legend */
  :global(.metro-legend) {
    user-select: none;
  }

  :global(.metro-legend rect) {
    transition: all 0.3s ease;
  }

  :global(.metro-legend:hover rect) {
    fill: #edf2f7;
    stroke: #cbd5e0;
  }

  /* Route header */
  :global(.route-header) {
    user-select: none;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .marmaray-metro-map {
      margin: 0 1rem;
    }

    :global(.station-label) {
      font-size: 8px !important;
    }

    :global(.incident-count) {
      font-size: 8px !important;
    }

    :global(.route-header text) {
      font-size: 14px !important;
    }
  }
</style>
