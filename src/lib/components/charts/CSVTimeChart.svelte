<script lang="ts">
  import { onMount } from 'svelte';
  import TimeChart from './TimeChart.svelte';

  export let csvUrl: string;
  export let title: string = 'Aylara göre vakalar';

  type Item = { time: string; count: number };
  let data: Item[] = [];
  let errorMsg = '';
  let loading = true;

  function parseCSV(text: string): Item[] {
    // Normalize BOM and line endings
    const cleaned = text.replace(/^\uFEFF/, '').replace(/\r/g, '');
    const lines = cleaned
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const out: Item[] = [];
    for (const line of lines) {
      if (!line) continue;
      if (/^Yıl\b/i.test(line)) continue; // header in Turkish
      const parts = line.split(',');
      if (parts.length < 2) continue;
      const time = parts[0].trim();
      const countStr = parts[1].trim();
      const count = parseInt(countStr, 10);
      if (!time || Number.isNaN(count)) continue;
      out.push({ time, count });
    }
    return out;
  }

  onMount(async () => {
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      data = parseCSV(text);
    } catch (e: any) {
      errorMsg = `CSV yüklenemedi: ${e?.message || e}`;
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="csv-chart loading">Yükleniyor…</div>
{:else if errorMsg}
  <div class="csv-chart error">{errorMsg}</div>
{:else}
  <div class="csv-chart">
    <TimeChart {data} {title} />
  </div>
{/if}

<style lang="scss">
  .csv-chart {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .csv-chart.loading,
  .csv-chart.error {
    color: #374151;
    background: rgba(255, 255, 255, 0.6);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.95rem;
  }
</style>
