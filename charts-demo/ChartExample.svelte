<script lang="ts">
  import { onMount } from 'svelte';

  // Sample data - in a real component, this would come from props or stores
  export let data: any[] = [];
  export let chartType: 'line' | 'pie' | 'bar' | 'radar' | 'funnel' = 'line';
  export let title: string = 'Chart';
  export let width: number = 600;
  export let height: number = 400;

  let chartContainer: HTMLDivElement;
  let chartInstance: any;

  // This is where you would integrate the chart generation
  // When using the MCP server, Cursor will generate the actual chart code
  onMount(() => {
    // Placeholder for chart initialization
    // The MCP server will generate the actual AntV chart code here
    console.log('Chart container ready for:', chartType);
    console.log('Data:', data);

    // Example: This is where the MCP-generated chart code would go
    renderChart();
  });

  function renderChart() {
    if (!chartContainer) return;

    // This function will be populated by the MCP server
    // when you ask Cursor to generate a specific chart
    chartContainer.innerHTML = `
      <div style="
        display: flex; 
        align-items: center; 
        justify-content: center; 
        height: ${height}px;
        border: 2px dashed #007acc;
        color: #666;
        font-family: monospace;
        flex-direction: column;
      ">
        <div>🎯 ${chartType.toUpperCase()} CHART</div>
        <div style="font-size: 12px; margin-top: 10px;">
          Ask Cursor: "Generate a ${chartType} chart for this component"
        </div>
      </div>
    `;
  }

  // Reactive statement to re-render when data changes
  $: if (data && chartContainer) {
    renderChart();
  }
</script>

<div class="chart-wrapper">
  <h3 class="chart-title">{title}</h3>
  <div
    bind:this={chartContainer}
    class="chart-container"
    style="width: {width}px; height: {height}px;"
  ></div>
  <div class="chart-info">
    <p><strong>Type:</strong> {chartType}</p>
    <p><strong>Data Points:</strong> {data.length}</p>
  </div>
</div>

<!--
Usage Example:

<ChartExample
  data={[
    {"time": "2025-01", "value": 512},
    {"time": "2025-02", "value": 1024},
    {"time": "2025-03", "value": 756}
  ]}
  chartType="line"
  title="Monthly Sales Trend"
  width={800}
  height={400}
/>

Instructions for Cursor Integration:
1. Open this component in Cursor
2. Ask: "Generate a line chart using AntV for the renderChart function"
3. Cursor will use the MCP server to create the actual chart code
4. The generated code will replace the placeholder in renderChart()
5. Import necessary AntV packages in your project

Example prompts for Cursor:
- "Create a line chart with smooth curves and hover tooltips"
- "Generate a responsive pie chart with custom colors"
- "Build a radar chart with animations and interactive legends"
- "Make a funnel chart with percentage labels"
-->

<style>
  .chart-wrapper {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
  }

  .chart-title {
    color: #333;
    border-bottom: 2px solid #007acc;
    padding-bottom: 10px;
    margin-bottom: 20px;
    margin-top: 0;
  }

  .chart-container {
    border-radius: 4px;
    overflow: hidden;
  }

  .chart-info {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #eee;
    font-size: 14px;
    color: #666;
  }

  .chart-info p {
    margin: 5px 0;
  }

  :global(.chart-container canvas),
  :global(.chart-container svg) {
    max-width: 100%;
    height: auto;
  }
</style>
