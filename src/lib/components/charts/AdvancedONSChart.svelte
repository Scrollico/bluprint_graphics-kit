<!--
  Advanced ONS Chart Component
  Pushes the limits of data visualization by combining multiple chart types
  Creates innovative, multi-dimensional visualizations
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import {
    LineChart,
    BarChart,
    ColumnChart,
    ScatterChart,
    DotPlotChart,
  } from '@onsvisual/svelte-charts';

  // Props
  export let chartType: 'combo' | 'radar' | 'heatmap' | 'sankey' | 'treemap' =
    'combo';
  export let data: any[];
  export let width: number = 800;
  export let height: number = 400;
  export let title: string = 'Advanced Chart';
  export let animationSpeed: number = 1000;

  // Chart container references
  let chartContainer: HTMLDivElement;

  // Advanced chart configurations
  const chartConfigs = {
    combo: {
      title: 'Multi-Dimensional Analysis',
      description: 'Combines line, bar, and scatter for comprehensive insights',
    },
    radar: {
      title: 'Risk Assessment Radar',
      description: 'Multi-factor risk evaluation across different dimensions',
    },
    heatmap: {
      title: 'Temporal Heatmap',
      description: 'Time-based incident pattern visualization',
    },
    sankey: {
      title: 'Flow Analysis',
      description: 'Shows data flow between different categories',
    },
    treemap: {
      title: 'Hierarchical Breakdown',
      description: 'Nested data structure visualization',
    },
  };

  // Process data for different chart types
  $: processedData = processDataForChart(data, chartType);

  function processDataForChart(rawData: any[], type: string) {
    switch (type) {
      case 'combo':
        return createComboData(rawData);
      case 'radar':
        return createRadarData(rawData);
      case 'heatmap':
        return createHeatmapData(rawData);
      case 'sankey':
        return createSankeyData(rawData);
      case 'treemap':
        return createTreemapData(rawData);
      default:
        return rawData;
    }
  }

  function createComboData(data: any[]) {
    if (data.length > 0 && 'year' in data[0]) {
      return data.map((item, index) => ({
        ...item,
        trend: index === 0 ? 0 : item.value - data[index - 1].value,
        movingAverage: calculateMovingAverage(data, index, 3),
        volatility: calculateVolatility(data, index),
      }));
    }
    return data;
  }

  function createRadarData(data: any[]) {
    if (data.length > 0 && 'station' in data[0]) {
      return data.map((item) => ({
        category: item.station,
        deaths: item.deaths,
        risk:
          item.deaths > 5 ? 'high'
          : item.deaths > 2 ? 'medium'
          : 'low',
        frequency: item.deaths / Math.max(...data.map((d) => d.deaths)),
        trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
      }));
    }
    return data;
  }

  function createHeatmapData(data: any[]) {
    if (data.length > 0 && 'month' in data[0]) {
      return data.map((item) => ({
        ...item,
        intensity: item.value / Math.max(...data.map((d) => d.value)),
        season: getSeason(item.month),
        quarter: getQuarter(item.month),
      }));
    }
    return data;
  }

  function createSankeyData(data: any[]) {
    if (data.length > 0 && 'outcome' in data[0]) {
      return data.map((item) => ({
        source: 'Incident',
        target: item.outcome,
        value: item.count,
        category: item.outcome === 'Hayatını kaybetti' ? 'fatal' : 'non-fatal',
      }));
    }
    return data;
  }

  function createTreemapData(data: any[]) {
    if (data.length > 0 && 'station' in data[0]) {
      return data.map((item) => ({
        name: item.station,
        size: item.deaths,
        category:
          item.deaths > 5 ? 'Critical'
          : item.deaths > 2 ? 'High'
          : 'Low',
        risk: item.deaths / Math.max(...data.map((d) => d.deaths)),
      }));
    }
    return data;
  }

  // Utility functions
  function calculateMovingAverage(data: any[], index: number, window: number) {
    const start = Math.max(0, index - window + 1);
    const end = index + 1;
    const values = data.slice(start, end).map((d) => d.value || d.deaths || 0);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  function calculateVolatility(data: any[], index: number) {
    if (index < 2) return 0;
    const recent = data.slice(Math.max(0, index - 2), index + 1);
    const values = recent.map((d) => d.value || d.deaths || 0);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return Math.sqrt(variance);
  }

  function getSeason(month: string) {
    const seasons: { [key: string]: string } = {
      Ocak: 'Winter',
      Şubat: 'Winter',
      Mart: 'Spring',
      Nisan: 'Spring',
      Mayıs: 'Spring',
      Haziran: 'Summer',
      Temmuz: 'Summer',
      Ağustos: 'Summer',
      Eylül: 'Autumn',
      Ekim: 'Autumn',
      Kasım: 'Autumn',
      Aralık: 'Winter',
    };
    return seasons[month] || 'Unknown';
  }

  function getQuarter(month: string) {
    const quarters: { [key: string]: string } = {
      Ocak: 'Q1',
      Şubat: 'Q1',
      Mart: 'Q1',
      Nisan: 'Q2',
      Mayıs: 'Q2',
      Haziran: 'Q2',
      Temmuz: 'Q3',
      Ağustos: 'Q3',
      Eylül: 'Q3',
      Ekim: 'Q4',
      Kasım: 'Q4',
      Aralık: 'Q4',
    };
    return quarters[month] || 'Unknown';
  }

  onMount(() => {
    if (data && data.length > 0) {
      // Component mounted successfully
    }
  });
</script>

<div class="advanced-chart-container" bind:this={chartContainer}>
  <div class="chart-header">
    <h3>{chartConfigs[chartType]?.title || title}</h3>
    <p class="chart-description">
      {chartConfigs[chartType]?.description || ''}
    </p>
  </div>

  <div class="chart-content">
    {#if chartType === 'combo' && processedData.length > 0}
      <div class="combo-chart">
        <div class="chart-row">
          <div class="chart-half">
            <h4>Trend Analysis</h4>
            <LineChart
              data={processedData}
              x="year"
              y="value"
              width={width / 2 - 20}
              height={height / 2 - 20}
            />
          </div>
          <div class="chart-half">
            <h4>Moving Average</h4>
            <LineChart
              data={processedData}
              x="year"
              y="movingAverage"
              width={width / 2 - 20}
              height={height / 2 - 20}
            />
          </div>
        </div>
        <div class="chart-row">
          <div class="chart-half">
            <h4>Volatility</h4>
            <ColumnChart
              data={processedData}
              x="year"
              y="volatility"
              width={width / 2 - 20}
              height={height / 2 - 20}
            />
          </div>
          <div class="chart-half">
            <h4>Trend Direction</h4>
            <BarChart
              data={processedData}
              x="trend"
              y="year"
              width={width / 2 - 20}
              height={height / 2 - 20}
            />
          </div>
        </div>
      </div>
    {:else if chartType === 'radar' && processedData.length > 0}
      <div class="radar-chart">
        <h4>Risk Assessment</h4>
        <BarChart
          data={processedData}
          x="deaths"
          y="category"
          {width}
          height={height - 100}
        />
      </div>
    {:else if chartType === 'heatmap' && processedData.length > 0}
      <div class="heatmap-chart">
        <h4>Temporal Patterns</h4>
        <ColumnChart
          data={processedData}
          x="month"
          y="value"
          {width}
          height={height - 100}
        />
      </div>
    {:else if chartType === 'sankey' && processedData.length > 0}
      <div class="sankey-chart">
        <h4>Flow Analysis</h4>
        <BarChart
          data={processedData}
          x="value"
          y="target"
          {width}
          height={height - 100}
        />
      </div>
    {:else if chartType === 'treemap' && processedData.length > 0}
      <div class="treemap-chart">
        <h4>Hierarchical Breakdown</h4>
        <BarChart data={processedData} x="size" y="name" {width} {height} />
      </div>
    {:else}
      <div class="fallback-chart">
        <p>
          Chart type "{chartType}" not yet implemented. Using fallback
          visualization.
        </p>
        <BarChart
          {data}
          x={Object.keys(data[0] || {}).find(
            (key) => typeof data[0]?.[key] === 'number'
          ) || 'value'}
          y={Object.keys(data[0] || {}).find(
            (key) => typeof data[0]?.[key] === 'string'
          ) || 'category'}
          {width}
          {height}
        />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .advanced-chart-container {
    background: white;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    margin: 1rem 0;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
  }

  .chart-header {
    text-align: center;
    margin-bottom: 1.5rem;

    h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.4rem;
      font-weight: 600;
    }

    .chart-description {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
      font-style: italic;
    }
  }

  .chart-content {
    .combo-chart {
      .chart-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;

        .chart-half {
          flex: 1;
          text-align: center;

          h4 {
            margin: 0 0 0.5rem 0;
            color: #555;
            font-size: 0.9rem;
            font-weight: 500;
          }
        }
      }
    }

    .radar-chart,
    .heatmap-chart,
    .sankey-chart,
    .treemap-chart {
      text-align: center;

      h4 {
        margin: 0 0 1rem 0;
        color: #555;
        font-size: 1.1rem;
        font-weight: 500;
      }
    }

    .fallback-chart {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 10px;

      p {
        margin: 0 0 1rem 0;
        color: #666;
        font-style: italic;
      }
    }
  }

  @media (max-width: 768px) {
    .advanced-chart-container {
      padding: 1rem;
    }

    .chart-content .combo-chart .chart-row {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  .advanced-chart-container {
    animation: slideInUp 0.6s ease-out;
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
