<script lang="ts">
  import { LayerCake, Svg } from 'layercake';
  import { arc, pie } from 'd3-shape';
  import { scaleOrdinal } from 'd3-scale';

  export let data: Array<{
    outcome: string;
    count: number;
  }> = [];

  export let title: string = 'Vakaların Akıbeti';
  export let width: number = 400;
  export let height: number = 400;
  export let progress: number = 1; // pie grows in radius with progress

  const colors = scaleOrdinal()
    .domain(['Hayatını kaybetti', 'Bilinmiyor', 'Ağır yaralı'])
    .range(['#e74c3c', '#95a5a6', '#f39c12']);

  $: pieData = pie<{ outcome: string; count: number }>().value((d) => d.count)(
    data
  );
  $: radius = (Math.min(width, height) / 2 - 40) * progress;
  $: arcGenerator = arc().innerRadius(0).outerRadius(radius);
</script>

<div class="layercake-chart">
  <h3>{title}</h3>
  <div class="chart-container">
    <LayerCake
      {data}
      {width}
      {height}
      padding={{ top: 20, right: 20, bottom: 20, left: 20 }}
    >
      <Svg>
        <g transform="translate({width / 2}, {height / 2})">
          {#each pieData as d, i}
            <path
              d={arcGenerator(d as any) || ''}
              fill={colors(d.data.outcome) as string}
              stroke="white"
              stroke-width="2"
            />

            <!-- Labels -->
            {@const centroid = arcGenerator.centroid(d as any)}
            <text
              x={centroid[0]}
              y={centroid[1]}
              text-anchor="middle"
              font-size="12"
              fill="white"
              font-weight="bold"
            >
              {d.data.count}
            </text>
          {/each}
        </g>

        <!-- Legend -->
        <g transform="translate({width - 150}, 20)">
          {#each data as d, i}
            <rect
              x="0"
              y={i * 25}
              width="15"
              height="15"
              fill={colors(d.outcome) as string}
            />
            <text x="20" y={i * 25 + 12} font-size="12" fill="#2c3e50">
              {d.outcome}: {d.count}
            </text>
          {/each}
        </g>
      </Svg>
    </LayerCake>
  </div>
</div>

<style lang="scss">
  .layercake-chart {
    width: 100%;
    max-width: 600px;
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
