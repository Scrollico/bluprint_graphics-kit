<!--
  LineAreaChart.svelte - Placeholder for Line/Area Chart
-->

<script lang="ts">
  export let data: any[] = [];
  export let config: any = {};
  export let width: number = 800;
  export let height: number = 400;

  let container: HTMLDivElement;
</script>

<div bind:this={container} style="width: {width}px; height: {height}px;">
  <div
    style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px;"
  >
    <div style="text-align: center; color: #6b7280;">
      <div style="font-size: 24px; margin-bottom: 8px;">📈</div>
      <div style="font-weight: 600;">Line/Area Chart</div>
      <div style="font-size: 14px; margin-top: 4px;">Coming Soon</div>
    </div>
  </div>
</div>
