<script lang="ts">
  import { LayerCake, Svg } from 'layercake';
  import { scaleBand, scaleLinear } from 'd3-scale';

  export let data: Array<{
    station: string;
    deaths: number;
  }> = [];

  export let title: string = 'İstasyonlara Göre Ölüm Sayısı';
  export let width: number = 800;
  export let height: number = 400;
  // 0 → 1 progress from scrollytelling step; bars animate with progress
  export let progress: number = 1;

  $: maxDeaths = Math.max(...data.map((d) => d.deaths));
  $: sortedData = [...data].sort((a, b) => b.deaths - a.deaths);
  const minBarLabelPx = 16; // avoid overlapping labels on short bars
</script>

<div class="layercake-chart">
  <h3>{title}</h3>
  <div class="chart-container">
    <LayerCake
      x="station"
      y="deaths"
      {data}
      {width}
      {height}
      padding={{ top: 20, right: 40, bottom: 60, left: 80 }}
    >
      <Svg>
        <!-- Bars -->
        {#each sortedData as d, i}
          {@const x = scaleBand()
            .domain(sortedData.map((d) => d.station))
            .range([0, width - 120])(d.station)}
          {@const barHeight = (d.deaths / maxDeaths) * (height - 80) * progress}
          {@const y = height - 60 - barHeight}

          <rect
            {x}
            {y}
            width={scaleBand()
              .domain(sortedData.map((d) => d.station))
              .bandwidth()}
            height={barHeight}
            fill="#e74c3c"
            opacity="0.8"
          />

          <!-- Value labels on bars -->
          {#if barHeight > minBarLabelPx}
            <text
              x={x +
                scaleBand()
                  .domain(sortedData.map((d) => d.station))
                  .bandwidth() /
                  2}
              y={y - 5}
              text-anchor="middle"
              font-size="12"
              fill="#2c3e50"
            >
              {d.deaths}
            </text>
          {/if}
        {/each}

        <!-- X-axis labels -->
        {#each sortedData as d, i}
          {@const x = scaleBand()
            .domain(sortedData.map((d) => d.station))
            .range([0, width - 120])(d.station)}
          <text
            x={x +
              scaleBand()
                .domain(sortedData.map((d) => d.station))
                .bandwidth() /
                2}
            y={height - 20}
            text-anchor="middle"
            font-size="11"
            fill="#2c3e50"
            transform="rotate(-45, {x +
              scaleBand()
                .domain(sortedData.map((d) => d.station))
                .bandwidth() /
                2}, {height - 20})"
          >
            {d.station}
          </text>
        {/each}
      </Svg>
    </LayerCake>
  </div>
</div>

<style lang="scss">
  .layercake-chart {
    width: 100%;
    max-width: 800px;
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
  }

  .chart-container {
    width: 100%;
    height: 400px;
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
      height: 300px;
    }
  }
</style>
