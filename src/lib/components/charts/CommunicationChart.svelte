<script lang="ts">
  import { LayerCake, Svg } from 'layercake';
  import { scaleBand, scaleLinear } from 'd3-scale';

  export let data: Array<{
    action: string;
    count: number;
  }> = [];

  export let title: string = "Marmaray'ın Duyuru Pratikleri";
  export let width: number = 600;
  export let height: number = 300;
  export let progress: number = 1;

  $: maxCount = Math.max(...data.map((d) => d.count));
  $: sortedData = [...data].sort((a, b) => b.count - a.count);
  const minBarLabelPx = 16;
</script>

<div class="layercake-chart">
  <h3>{title}</h3>
  <div class="chart-container">
    <LayerCake
      x="action"
      y="count"
      {data}
      {width}
      {height}
      padding={{ top: 20, right: 40, bottom: 60, left: 100 }}
    >
      <Svg>
        <!-- Bars -->
        {#each sortedData as d, i}
          {@const x = scaleBand()
            .domain(sortedData.map((d) => d.action))
            .range([0, width - 140])(d.action)}
          {@const barHeight = (d.count / maxCount) * (height - 80) * progress}
          {@const y = height - 60 - barHeight}

          <rect
            {x}
            {y}
            width={scaleBand()
              .domain(sortedData.map((d) => d.action))
              .bandwidth()}
            height={barHeight}
            fill="#3498db"
            opacity="0.8"
          />

          <!-- Value labels on bars -->
          {#if barHeight > minBarLabelPx}
            <text
              x={x +
                scaleBand()
                  .domain(sortedData.map((d) => d.action))
                  .bandwidth() /
                  2}
              y={y - 5}
              text-anchor="middle"
              font-size="12"
              fill="#2c3e50"
            >
              {d.count}
            </text>
          {/if}
        {/each}

        <!-- X-axis labels -->
        {#each sortedData as d, i}
          {@const x = scaleBand()
            .domain(sortedData.map((d) => d.action))
            .range([0, width - 140])(d.action)}
          <text
            x={x +
              scaleBand()
                .domain(sortedData.map((d) => d.action))
                .bandwidth() /
                2}
            y={height - 20}
            text-anchor="middle"
            font-size="11"
            fill="#2c3e50"
            transform="rotate(-45, {x +
              scaleBand()
                .domain(sortedData.map((d) => d.action))
                .bandwidth() /
                2}, {height - 20})"
          >
            {d.action}
          </text>
        {/each}
      </Svg>
    </LayerCake>
  </div>
</div>

<style lang="scss">
  .layercake-chart {
    width: 100%;
    max-width: 700px;
    margin: 2rem auto;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 1.5rem 2rem;
  }

  .layercake-chart h3 {
    margin: 0 0 1rem 0;
    color: #1a1a1a;
    font-size: 1.25rem;
    font-weight: 600;
    font-family: 'Georgia', 'Times New Roman', serif;
    line-height: 1.3;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #f0f0f0;
    text-align: center;
  }

  .chart-container {
    width: 100%;
    height: 300px;
    margin-top: 1rem;
  }

  @media (max-width: 768px) {
    .layercake-chart {
      margin: 1rem auto;
      padding: 1rem 1.5rem;
      max-width: 100%;
    }

    .layercake-chart h3 {
      font-size: 1.1rem;
    }

    .chart-container {
      height: 250px;
    }
  }
</style>
