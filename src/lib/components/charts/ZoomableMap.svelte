<script lang="ts">
  export let width: number | null = null;
  export let height: number | null = null;
</script>

<div class="zoomable-map" style="width: {width}px; height: {height}px;">
  <div class="map-container">
    <div class="map-visual">
      <div class="world-map">
        <div class="region north-america">
          <div class="pulse-dot"></div>
          <span class="region-label">North America</span>
        </div>
        <div class="region europe">
          <div class="pulse-dot"></div>
          <span class="region-label">Europe</span>
        </div>
        <div class="region asia">
          <div class="pulse-dot"></div>
          <span class="region-label">Asia Pacific</span>
        </div>
      </div>
    </div>
    <div class="map-legend">
      <h3>Global Digital Adoption</h3>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-dot high"></div>
          <span>High Adoption (>80%)</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot medium"></div>
          <span>Medium Adoption (50-80%)</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot low"></div>
          <span>Low Adoption (&lt;50%)</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .zoomable-map {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    border-radius: 12px;
    padding: 2rem;
    color: white;
    min-height: 400px;
    /* Ensure map fits within container */
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  .map-container {
    text-align: center;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .map-visual {
    /* Prevent overflow */
    overflow: hidden;
  }

  .world-map {
    position: relative;
    width: 300px;
    height: 200px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
    /* Ensure map doesn't overflow container */
    max-width: 100%;
  }

  .region {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  .north-america {
    top: 20%;
    left: 20%;
  }

  .europe {
    top: 30%;
    right: 30%;
  }

  .asia {
    bottom: 30%;
    right: 20%;
  }

  .pulse-dot {
    width: 12px;
    height: 12px;
    background: #e74c3c;
    border-radius: 50%;
    margin-bottom: 0.5rem;
    animation: pulse 2s infinite;
  }

  .region-label {
    font-size: 0.8rem;
    font-weight: 600;
    text-align: center;
    /* Prevent text overflow */
    white-space: nowrap;
  }

  .map-legend {
    text-align: left;
    margin-top: 2rem;

    h3 {
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
      /* Prevent text overflow */
      white-space: normal;
      word-wrap: break-word;
    }
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
    font-size: 0.9rem;
    /* Prevent text overflow */
    white-space: normal;
    word-wrap: break-word;
  }

  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;

    &.high {
      background: #e74c3c;
    }

    &.medium {
      background: #f39c12;
    }

    &.low {
      background: #27ae60;
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .zoomable-map {
      padding: 1rem;
      min-height: 300px;
    }

    .world-map {
      width: 250px;
      height: 150px;
    }

    .region-label {
      font-size: 0.7rem;
    }

    .map-legend h3 {
      font-size: 1rem;
    }

    .legend-item {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    .world-map {
      width: 200px;
      height: 120px;
    }

    .region-label {
      font-size: 0.6rem;
    }

    .legend-item {
      font-size: 0.7rem;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
    }
  }
</style>
