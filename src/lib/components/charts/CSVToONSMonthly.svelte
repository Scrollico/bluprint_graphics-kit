<script lang="ts">
  import { onMount } from 'svelte';
  import ONSMonthlyChart from './ONSMonthlyChart.svelte';

  export let csvUrl: string;
  export let title = 'Aylara göre toplam vakalar';
  export let subtitle = '';
  export let width = 800;
  export let height = 400;

  type Row = { time: string; count: number };
  type Point = { month: string; value: number };

  const MONTHS_TR = [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ];
  const MONTH_INDEX: Record<string, number> = Object.fromEntries(
    MONTHS_TR.map((m, i) => [m.toLowerCase(), i])
  );

  let loading = true;
  let error = '';
  let points: Point[] = MONTHS_TR.map((m) => ({ month: m, value: 0 }));

  function parseCSV(text: string): Row[] {
    const cleaned = text.replace(/^\uFEFF/, '').replace(/\r/g, '');
    const lines = cleaned
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const out: Row[] = [];
    for (const line of lines) {
      if (/^Yıl\b/i.test(line)) continue; // header
      const parts = line.split(',');
      if (parts.length < 2) continue;
      const time = parts[0].trim();
      const count = parseInt(parts[1].trim(), 10);
      if (!time || Number.isNaN(count)) continue;
      out.push({ time, count });
    }
    return out;
  }

  function aggregate(rows: Row[]): Point[] {
    const totals = Array(12).fill(0);
    for (const r of rows) {
      const monthName = r.time.split(/\s+/)[0]?.toLowerCase();
      const idx = MONTH_INDEX[monthName];
      if (typeof idx === 'number') totals[idx] += r.count;
    }
    return MONTHS_TR.map((m, i) => ({ month: m, value: totals[i] }));
  }

  onMount(async () => {
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const rows = parseCSV(text);
      points = aggregate(rows);
    } catch (e: any) {
      error = e?.message || String(e);
    } finally {
      loading = false;
    }
  });
</script>

<div class="chart-panel">
  {#if loading}
    <div class="ons-loading">Yükleniyor…</div>
  {:else if error}
    <div class="ons-error">{error}</div>
  {:else}
    <ONSMonthlyChart {title} {subtitle} {width} {height} data={points} />
  {/if}
</div>

<style lang="scss">
  .ons-loading,
  .ons-error {
    background: var(--panel);
    border: 1px solid var(--grid);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    color: var(--ink);
    font-size: 0.95rem;
    font-family: var(--font-sans);
  }
  .ons-error {
    color: var(--accent);
    border-color: var(--accent);
  }
  @media (max-width: 900px) {
    :global(svg) {
      width: 100% !important;
      height: auto !important;
    }
  }
</style>
