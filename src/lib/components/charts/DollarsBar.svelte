<script lang="ts">
  export let width: number | null = null;
  export let height: number | null = null;
</script>

<div class="dollars-bar" style="width: {width}px; height: {height}px;">
  <div class="chart-content">
    <h2>Investment in Digital Transformation</h2>
    <div class="chart-visual">
      <div class="bar-group">
        <div class="bar" style="height: 40%;">
          <span class="value">$1.2T</span>
        </div>
        <span class="label">2020</span>
      </div>
      <div class="bar-group">
        <div class="bar" style="height: 65%;">
          <span class="value">$1.8T</span>
        </div>
        <span class="label">2022</span>
      </div>
      <div class="bar-group">
        <div class="bar" style="height: 85%;">
          <span class="value">$2.4T</span>
        </div>
        <span class="label">2024</span>
      </div>
      <div class="bar-group">
        <div class="bar" style="height: 100%;">
          <span class="value">$3.1T</span>
        </div>
        <span class="label">2026</span>
      </div>
    </div>
    <p class="caption">
      Global spending on digital transformation (trillions USD)
    </p>
  </div>
</div>

<style lang="scss">
  .dollars-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    border-radius: 12px;
    padding: 2rem;
    color: white;
    text-align: center;
    min-height: 400px;
    /* Ensure chart fits within container */
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  .chart-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    h2 {
      margin: 0 0 2rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      /* Prevent text overflow */
      white-space: normal;
      word-wrap: break-word;
    }
  }

  .chart-visual {
    display: flex;
    align-items: end;
    justify-content: center;
    gap: 1.5rem;
    margin: 2rem 0;
    height: 250px;
    /* Prevent overflow */
    width: 100%;
    overflow: hidden;
  }

  .bar-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .bar {
    width: 50px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px 4px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease;
    min-height: 40px;
    /* Ensure bars don't overflow container */
    max-height: 100%;

    &:hover {
      background: rgba(255, 255, 255, 1);
      transform: scale(1.05);
    }
  }

  .value {
    font-size: 0.9rem;
    font-weight: 700;
    color: #333;
    position: absolute;
    top: -25px;
    /* Prevent text overflow */
    white-space: nowrap;
  }

  .label {
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    /* Prevent text overflow */
    white-space: nowrap;
  }

  .caption {
    font-size: 0.9rem;
    opacity: 0.9;
    margin: 0;
    /* Prevent text overflow */
    white-space: normal;
    word-wrap: break-word;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .dollars-bar {
      padding: 1rem;
      min-height: 300px;
    }

    .chart-content h2 {
      font-size: 1.2rem;
      margin: 0 0 1rem 0;
    }

    .chart-visual {
      gap: 1rem;
      height: 200px;
    }

    .bar {
      width: 40px;
    }

    .value,
    .label {
      font-size: 0.7rem;
    }
  }

  @media (max-width: 480px) {
    .chart-visual {
      gap: 0.5rem;
      height: 150px;
    }

    .bar {
      width: 30px;
    }

    .value,
    .label {
      font-size: 0.6rem;
    }
  }
</style>
