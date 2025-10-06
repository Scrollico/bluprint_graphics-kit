<script lang="ts">
  import { onMount } from 'svelte';

  export let data: Array<{
    station: string;
    deaths: number;
    attempts: number;
  }> = [];

  export let activeIndex: number = 0;

  let container: HTMLElement;
  let isVisible = false;

  onMount(() => {
    console.log('🎯 MarmarayStationChart component mounted with data:', data);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible = true;
          }
        });
      },
      { threshold: 0.1 }
    );

    if (container) {
      observer.observe(container);
    }

    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  });

  $: maxAttempts = Math.max(...data.map((d) => d.attempts));
  $: maxDeaths = Math.max(...data.map((d) => d.deaths));
</script>

<div class="marmaray-chart" bind:this={container}>
  <div class="chart-header">
    <h3>Marmaray İstasyonları</h3>
    <p>İntihar vakalarının istasyonlara göre dağılımı</p>
  </div>

  <div class="stations-container">
    {#each data as station, index}
      <div
        class="station-item {index === activeIndex ? 'active' : ''}"
        style="animation-delay: {index * 0.1}s"
      >
        <div class="station-info">
          <div class="station-name">{station.station}</div>
          <div class="station-stats">
            <span class="stat deaths">{station.deaths} ölüm</span>
            <span class="stat attempts">{station.attempts} girişim</span>
          </div>
        </div>

        <div class="station-bars">
          <div class="bar-group">
            <div
              class="bar deaths"
              style="width: {(station.deaths / maxDeaths) * 100}%"
            ></div>
            <div
              class="bar attempts"
              style="width: {(station.attempts / maxAttempts) * 100}%"
            ></div>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="legend">
    <div class="legend-item">
      <span class="legend-color deaths"></span>
      <span class="legend-label">Ölüm</span>
    </div>
    <div class="legend-item">
      <span class="legend-color attempts"></span>
      <span class="legend-label">Girişim</span>
    </div>
  </div>
</div>

<style lang="scss">
  .marmaray-chart {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    padding: 0;
  }

  .chart-header {
    text-align: center;
    margin-bottom: 0;

    h3 {
      color: #1976d2;
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
    }

    p {
      color: #666;
      margin: 0;
      font-size: 0.9rem;
    }
  }

  .stations-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .station-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateX(-20px);
    animation: slideIn 0.6s ease-out forwards;

    &.active {
      background: #eef6ff;
      box-shadow: 0 4px 16px rgba(25, 118, 210, 0.12);
      transform: translateX(0) scale(1.02);
    }

    &:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
  }

  .station-info {
    min-width: 150px;

    .station-name {
      font-weight: 600;
      color: #1976d2;
      margin-bottom: 0.25rem;
      font-size: 1rem;
    }

    .station-stats {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .stat {
        font-size: 0.8rem;
        color: #666;

        &.deaths {
          color: #d32f2f;
          font-weight: 500;
        }

        &.attempts {
          color: #ff9800;
          font-weight: 500;
        }
      }
    }
  }

  .station-bars {
    flex: 1;
    max-width: 200px;

    .bar-group {
      display: flex;
      gap: 0.25rem;
      height: 20px;

      .bar {
        height: 100%;
        border-radius: 4px;
        transition: all 0.3s ease;

        &.deaths {
          background: #d32f2f;
        }

        &.attempts {
          background: #ff9800;
        }
      }
    }
  }

  .legend {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 0;
    padding-top: 1rem;
    border-top: 1px solid #e0e0e0;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 4px;

        &.deaths {
          background: #d32f2f;
        }

        &.attempts {
          background: #ff9800;
        }
      }

      .legend-label {
        font-size: 0.9rem;
        color: #666;
        font-weight: 500;
      }
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (max-width: 768px) {
    .marmaray-chart {
      padding: 0.5rem;
    }

    .station-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .station-info {
      min-width: auto;
      width: 100%;
    }

    .station-bars {
      max-width: 100%;
      width: 100%;
    }

    .legend {
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }
  }
</style>
