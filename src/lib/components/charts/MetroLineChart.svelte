<!--
  MetroLineChart.svelte
  Purpose: Layercake bar chart showing suicide incidents by metro line
  Usage: Displays M1, M2, M3, M4, M5, M6, M7 lines with incident counts
-->

<script lang="ts">
  import { LayerCake, Svg, Html } from 'layercake';
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { derived } from 'svelte/store';

  export let title: string = 'Metro Hatlarına Göre İntihar Vakaları';
  export let width: number = 800;
  export let height: number = 500;
  export let progress: number = 1;

  // Metro line data
  const metroLineData = [
    { line: 'M2 (Yenikapı-Hacıosman)', incidents: 16, color: '#e74c3c' },
    {
      line: 'M1 (Yenikapı-Atatürk Havalimanı)',
      incidents: 3,
      color: '#3498db',
    },
    { line: 'M3 (Kirazlı-Başakşehir)', incidents: 2, color: '#2ecc71' },
    { line: 'M4 (Kadıköy-Tavşantepe)', incidents: 1, color: '#f39c12' },
    { line: 'M5 (Üsküdar-Çekmeköy)', incidents: 0, color: '#9b59b6' },
    { line: 'M6 (Levent-Boğaziçi)', incidents: 0, color: '#1abc9c' },
    { line: 'M7 (Mecidiyeköy-Mahmutbey)', incidents: 0, color: '#34495e' },
  ];

  const maxIncidents = Math.max(...metroLineData.map((d) => d.incidents));
  const minBarLabelPx = 20; // Minimum bar height to show label
</script>

<div class="layercake-chart metro-line-chart">
  <LayerCake
    padding={{ top: 60, right: 40, bottom: 80, left: 120 }}
    x={[0, width - 160]}
    y={[height - 140, 20]}
    data={metroLineData}
  >
    <Svg>
      <!-- Chart title -->
      <text x={width / 2} y={30} text-anchor="middle" class="chart-title">
        {title}
      </text>

      <!-- Bars -->
      {#each metroLineData as d, i}
        {@const x = scaleBand()
          .domain(metroLineData.map((d) => d.line))
          .range([0, width - 160])(d.line)}
        {@const barHeight =
          (d.incidents / maxIncidents) * (height - 140) * progress}
        {@const y = height - 80 - barHeight}
        {@const barWidth = ((width - 160) / metroLineData.length) * 0.8}

        <rect
          x={x + barWidth * 0.1}
          {y}
          width={barWidth * 0.8}
          height={barHeight}
          fill={d.color}
          opacity={0.8}
          class="metro-bar"
        />

        <!-- Value labels (only if bar is tall enough) -->
        {#if barHeight > minBarLabelPx}
          <text
            x={x + barWidth / 2}
            y={y - 5}
            text-anchor="middle"
            class="value-label"
          >
            {d.incidents}
          </text>
        {/if}

        <!-- Line labels (rotated) -->
        <text
          x={x + barWidth / 2}
          y={height - 20}
          text-anchor="middle"
          class="line-label"
          transform="rotate(-45, {x + barWidth / 2}, {height - 20})"
        >
          {d.line}
        </text>
      {/each}

      <!-- Y-axis -->
      <line
        x1={0}
        y1={20}
        x2={0}
        y2={height - 80}
        stroke="#666"
        stroke-width="1"
      />

      <!-- Y-axis labels -->
      {#each Array.from({ length: 6 }, (_, i) => i) as i}
        {@const value = Math.round((maxIncidents / 5) * i)}
        {@const y = height - 80 - (i / 5) * (height - 140)}
        <text x={-10} y={y + 5} text-anchor="end" class="axis-label">
          {value}
        </text>
        <line x1={-5} y1={y} x2={0} y2={y} stroke="#666" stroke-width="1" />
      {/each}
    </Svg>
  </LayerCake>
</div>

<style>
  .layercake-chart {
    background: transparent;
    box-shadow: none;
    font-family:
      'DIN Pro',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      sans-serif;
  }

  .chart-title {
    font-size: 18px;
    font-weight: 600;
    fill: #333;
  }

  .metro-bar {
    transition: all 0.3s ease;
  }

  .metro-bar:hover {
    opacity: 1;
  }

  .value-label {
    font-size: 12px;
    font-weight: 600;
    fill: #333;
  }

  .line-label {
    font-size: 10px;
    fill: #666;
  }

  .axis-label {
    font-size: 11px;
    fill: #666;
  }
</style>
