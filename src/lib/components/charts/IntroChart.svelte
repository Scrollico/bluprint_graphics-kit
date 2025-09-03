<script lang="ts">
  export let width: number | null = null;
  export let height: number | null = null;
</script>

<div class="intro-chart" style="width: {width}px; height: {height}px;">
  <div class="chart-content">
    <h2>Digital Transformation Overview</h2>
    <div class="chart-visual">
      <div class="bar" style="height: 60%;">
        <span class="label">2020</span>
        <span class="value">60%</span>
      </div>
      <div class="bar" style="height: 85%;">
        <span class="label">2023</span>
        <span class="value">85%</span>
      </div>
      <div class="bar" style="height: 95%;">
        <span class="label">2024</span>
        <span class="value">95%</span>
      </div>
    </div>
    <p class="caption">
      Percentage of companies with digital transformation initiatives
    </p>
  </div>
</div>

<style lang="scss">
  .intro-chart {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    }
  }

  .chart-visual {
    display: flex;
    align-items: end;
    justify-content: center;
    gap: 2rem;
    margin: 2rem 0;
    height: 200px;
    /* Prevent overflow */
    width: 100%;
    overflow: hidden;
  }

  .bar {
    width: 60px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px 4px 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 0.5rem 0;
    position: relative;
    transition: all 0.3s ease;
    /* Ensure bars don't overflow container */
    max-height: 100%;

    &:hover {
      background: rgba(255, 255, 255, 1);
      transform: scale(1.05);
    }
  }

  .label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
    /* Prevent text overflow */
    white-space: nowrap;
  }

  .value {
    font-size: 1.2rem;
    font-weight: 700;
    color: #333;
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
    .intro-chart {
      padding: 1rem;
      min-height: 300px;
    }

    .chart-content h2 {
      font-size: 1.2rem;
      margin: 0 0 1rem 0;
    }

    .chart-visual {
      gap: 1rem;
      height: 150px;
    }

    .bar {
      width: 40px;
    }

    .label,
    .value {
      font-size: 0.7rem;
    }
  }

  @media (max-width: 480px) {
    .chart-visual {
      gap: 0.5rem;
      height: 120px;
    }

    .bar {
      width: 30px;
    }

    .label,
    .value {
      font-size: 0.6rem;
    }
  }
</style>
