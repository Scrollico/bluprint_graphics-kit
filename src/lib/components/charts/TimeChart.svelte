<script lang="ts">
  import { onMount } from 'svelte';

  export let data: Array<{
    time: string;
    count: number;
  }> = [];

  export let title: string = 'Yıllara göre Marmaray ölüm sayısı';
  // Optional sizing (accepted but not used by default)
  export let width: number | undefined = undefined;
  export let height: number | undefined = undefined;

  let container: HTMLElement;
  let isVisible = false;
  let animationProgress = 0;

  onMount(() => {
    console.log('🎯 TimeChart component mounted with data:', data);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible = true;
            // Smooth animation
            setTimeout(() => {
              animationProgress = 1;
            }, 200);
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
  $: scale = maxCount > 0 ? 100 / maxCount : 1;
</script>

<div class="reuters-chart-container" bind:this={container}>
  <div class="chart-header">
    <h4 class="chart-title">{title}</h4>
  </div>

  <div class="chart-body">
    <div class="bar-chart">
      {#each data as item, index}
        <div class="bar-container" style="animation-delay: {index * 0.15}s">
          <div class="bar-wrapper">
            <div
              class="bar"
              style="height: {isVisible ?
                item.count * scale * animationProgress
              : 0}%"
            ></div>
            <div class="bar-value">{item.count}</div>
          </div>
          <div class="bar-label">{item.time}</div>
        </div>
      {/each}
    </div>

    <div class="chart-baseline"></div>
  </div>
</div>

<style lang="scss">
  .reuters-chart-container {
    width: 100%;
    max-width: 800px;
    margin: 2rem auto;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .chart-header {
    padding: 1.5rem 2rem 1rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .chart-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
    font-family: 'Georgia', 'Times New Roman', serif;
    line-height: 1.3;
  }

  .chart-body {
    position: relative;
    padding: 2rem;
  }

  .bar-chart {
    display: flex;
    align-items: end;
    justify-content: space-between;
    height: 280px;
    gap: 0.5rem;
  }

  .bar-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0;
    animation: fadeInUp 0.8s ease-out forwards;
    max-width: 60px;
  }

  .bar-wrapper {
    position: relative;
    width: 100%;
    height: 240px;
    display: flex;
    flex-direction: column;
    justify-content: end;
    align-items: center;
  }

  .bar {
    width: 32px;
    background: #dc3545;
    border-radius: 4px 4px 0 0;
    transition: height 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: 0;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.2),
        transparent
      );
      border-radius: 2px 2px 0 0;
    }
  }

  .bar-value {
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.875rem;
    font-weight: 600;
    color: #1a1a1a;
    background: #ffffff;
    padding: 2px 6px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    white-space: nowrap;
    min-width: 20px;
    text-align: center;
  }

  .bar-label {
    margin-top: 0.75rem;
    font-size: 0.75rem;
    color: #666666;
    text-align: center;
    font-weight: 500;
    max-width: 100%;
    word-wrap: break-word;
    line-height: 1.2;
  }

  .chart-baseline {
    position: absolute;
    bottom: 2rem;
    left: 2rem;
    right: 2rem;
    height: 1px;
    background: #e0e0e0;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .reuters-chart-container {
      margin: 1rem auto;
      max-width: 100%;
    }

    .chart-header {
      padding: 1rem 1.5rem 0.75rem;
    }

    .chart-title {
      font-size: 1.1rem;
    }

    .chart-body {
      padding: 1.5rem 1rem;
    }

    .bar-chart {
      height: 200px;
      gap: 0.25rem;
    }

    .bar-container {
      max-width: 40px;
    }

    .bar {
      width: 24px;
    }

    .bar-wrapper {
      height: 160px;
    }

    .bar-value {
      font-size: 0.75rem;
      top: -24px;
      padding: 1px 4px;
    }

    .bar-label {
      font-size: 0.7rem;
      margin-top: 0.5rem;
    }
  }
</style>
