<script lang="ts">
  import { onMount } from 'svelte';

  export let data: Array<{
    time: string;
    count: number;
  }> = [];

  export let title: string = 'Yıllara göre Marmaray ölüm sayısı';

  let container: HTMLElement;
  let isVisible = false;

  onMount(() => {
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

  $: maxCount = Math.max(...data.map((d) => d.count));
  $: colors = [
    '#d32f2f',
    '#ff9800',
    '#4caf50',
    '#2196f3',
    '#9c27b0',
    '#607d8b',
  ];
</script>

<div class="time-chart" bind:this={container}>
  <div class="chart-header">
    <h3>{title}</h3>
  </div>

  <div class="chart-container">
    {#each data as item, index}
      <div class="time-segment" style="animation-delay: {index * 0.2}s">
        <div class="segment-bar">
          <div
            class="bar"
            style="height: {(item.count / maxCount) *
              150}px; background: {colors[index % colors.length]}"
          ></div>
        </div>
        <div class="time-info">
          <div class="time-label">{item.time}</div>
          <div class="count">{item.count}</div>
        </div>
      </div>
    {/each}
  </div>

  <div class="chart-footer">
    <p>En yüksek ölüm sayısı: {maxCount}</p>
  </div>
</div>

<style lang="scss">
  .time-chart {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }

  .chart-header {
    text-align: center;
    margin-bottom: 2rem;

    h3 {
      color: #1976d2;
      margin: 0;
      font-size: 1.5rem;
    }
  }

  .chart-container {
    display: flex;
    justify-content: space-around;
    align-items: end;
    height: 200px;
    padding: 0 1rem;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: #e0e0e0;
    }
  }

  .time-segment {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.8s ease-out forwards;

    .segment-bar {
      position: relative;
      width: 40px;
      height: 150px;
      display: flex;
      align-items: end;
    }

    .bar {
      width: 100%;
      border-radius: 4px 4px 0 0;
      transition: all 0.3s ease;
      position: relative;
    }

    .time-info {
      text-align: center;
      min-width: 80px;

      .time-label {
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 0.25rem;
        font-weight: 500;
      }

      .count {
        font-size: 1.2rem;
        font-weight: 700;
        color: #333;
      }
    }
  }

  .chart-footer {
    text-align: center;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e0e0e0;

    p {
      color: #666;
      font-size: 0.9rem;
      margin: 0;
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .time-chart {
      padding: 0.5rem;
    }

    .chart-container {
      height: 150px;
      padding: 0 0.5rem;
    }

    .time-segment {
      .segment-bar {
        width: 30px;
        height: 120px;
      }

      .time-info {
        min-width: 60px;

        .time-label {
          font-size: 0.7rem;
        }

        .count {
          font-size: 1rem;
        }
      }
    }
  }
</style>
