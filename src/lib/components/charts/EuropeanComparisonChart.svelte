<script lang="ts">
  import { LayerCake, Svg } from 'layercake';
  import { scaleBand, scaleLinear } from 'd3-scale';

  export let data: Array<{
    country: string;
    average: number;
  }> = [];

  export let title: string = 'AB Ülkeleri Yıllık Ortalama İntihar Sayısı';
  export let width: number = 1000;
  export let height: number = 600;

  $: maxAvg = Math.max(...data.map((d) => d.average));
  $: topCountries = data.slice(0, 15); // Show top 15 countries
  $: sortedData = [...topCountries].sort((a, b) => b.average - a.average);
</script>

<div class="layercake-chart">
  <h3>{title}</h3>
  <div class="chart-container">
    <LayerCake
      x="country"
      y="average"
      {data}
      {width}
      {height}
      padding={{ top: 20, right: 40, bottom: 80, left: 120 }}
    >
      <Svg>
        <!-- Bars -->
        {#each sortedData as d, i}
          {@const x = scaleBand()
            .domain(sortedData.map((d) => d.country))
            .range([0, width - 160])(d.country)}
          {@const barHeight = (d.average / maxAvg) * (height - 100)}
          {@const y = height - 80 - barHeight}

          <rect
            {x}
            {y}
            width={scaleBand()
              .domain(sortedData.map((d) => d.country))
              .bandwidth()}
            height={barHeight}
            fill="#27ae60"
            opacity="0.8"
          />

          <!-- Value labels on bars -->
          <text
            x={x +
              scaleBand()
                .domain(sortedData.map((d) => d.country))
                .bandwidth() /
                2}
            y={y - 5}
            text-anchor="middle"
            font-size="11"
            fill="#2c3e50"
          >
            {d.average.toFixed(1)}
          </text>
        {/each}

        <!-- X-axis labels -->
        {#each sortedData as d, i}
          {@const x = scaleBand()
            .domain(sortedData.map((d) => d.country))
            .range([0, width - 160])(d.country)}
          <text
            x={x +
              scaleBand()
                .domain(sortedData.map((d) => d.country))
                .bandwidth() /
                2}
            y={height - 40}
            text-anchor="middle"
            font-size="10"
            fill="#2c3e50"
            transform="rotate(-45, {x +
              scaleBand()
                .domain(sortedData.map((d) => d.country))
                .bandwidth() /
                2}, {height - 40})"
          >
            {d.country}
          </text>
        {/each}
      </Svg>
    </LayerCake>
  </div>
</div>

<style>
  .layercake-chart {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .layercake-chart h3 {
    margin: 0 0 20px 0;
    color: #2c3e50;
    font-size: 18px;
    font-weight: 600;
  }

  .chart-container {
    width: 100%;
    height: 600px;
  }
</style>
