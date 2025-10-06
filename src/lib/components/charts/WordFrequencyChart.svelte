<script lang="ts">
  import { LayerCake, Svg } from 'layercake';
  import { scaleBand, scaleLinear } from 'd3-scale';

  export let data: Array<{
    word: string;
    frequency: number;
  }> = [];

  export let title: string = "Marmaray'ın En Sık Kullandığı Kelimeler";
  export let width: number = 800;
  export let height: number = 500;
  export let progress: number = 1;

  $: maxFreq = Math.max(...data.map((d) => d.frequency));
  $: topWords = data.slice(0, 15); // Show top 15 words
  $: sortedData = [...topWords].sort((a, b) => b.frequency - a.frequency);
  const minBarLabelPx = 14;
</script>

<div class="layercake-chart">
  <h3>{title}</h3>
  <div class="chart-container">
    <LayerCake
      x="word"
      y="frequency"
      {data}
      {width}
      {height}
      padding={{ top: 20, right: 40, bottom: 80, left: 100 }}
    >
      <Svg>
        <!-- Bars -->
        {#each sortedData as d, i}
          {@const x = scaleBand()
            .domain(sortedData.map((d) => d.word))
            .range([0, width - 140])(d.word)}
          {@const barHeight =
            (d.frequency / maxFreq) * (height - 100) * progress}
          {@const y = height - 80 - barHeight}

          <rect
            {x}
            {y}
            width={scaleBand()
              .domain(sortedData.map((d) => d.word))
              .bandwidth()}
            height={barHeight}
            fill="#9b59b6"
            opacity="0.8"
          />

          <!-- Value labels on bars -->
          {#if barHeight > minBarLabelPx}
            <text
              x={x +
                scaleBand()
                  .domain(sortedData.map((d) => d.word))
                  .bandwidth() /
                  2}
              y={y - 5}
              text-anchor="middle"
              font-size="11"
              fill="#2c3e50"
            >
              {d.frequency}
            </text>
          {/if}
        {/each}

        <!-- X-axis labels -->
        {#each sortedData as d, i}
          {@const x = scaleBand()
            .domain(sortedData.map((d) => d.word))
            .range([0, width - 140])(d.word)}
          <text
            x={x +
              scaleBand()
                .domain(sortedData.map((d) => d.word))
                .bandwidth() /
                2}
            y={height - 40}
            text-anchor="middle"
            font-size="10"
            fill="#2c3e50"
            transform="rotate(-45, {x +
              scaleBand()
                .domain(sortedData.map((d) => d.word))
                .bandwidth() /
                2}, {height - 40})"
          >
            {d.word}
          </text>
        {/each}
      </Svg>
    </LayerCake>
  </div>
</div>

<style lang="scss">
  .layercake-chart {
    width: 100%;
    max-width: 900px;
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
    height: 500px;
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
      height: 400px;
    }
  }
</style>
