<script lang="ts">
  import { onMount } from 'svelte';

  export let csvUrl: string;
  export let title = 'Aylara göre toplam vakalar';
  export let subtitle = '';

  type Row = { time: string; count: number };

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

  let rows: Row[] = [];
  let monthTotals: number[] = Array(12).fill(0);
  let maxVal = 0;
  let error = '';
  let loading = true;

  function parseCSV(text: string): Row[] {
    const cleaned = text.replace(/^\uFEFF/, '').replace(/\r/g, '');
    const lines = cleaned
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const out: Row[] = [];
    for (const line of lines) {
      if (!line) continue;
      if (/^Yıl\b/i.test(line)) continue; // header
      const parts = line.split(',');
      if (parts.length < 2) continue;
      const raw = parts[0].trim();
      const count = parseInt(parts[1].trim(), 10);
      if (!raw || Number.isNaN(count)) continue;
      out.push({ time: raw, count });
    }
    return out;
  }

  function aggregateByMonth(data: Row[]) {
    const totals = Array(12).fill(0);
    for (const r of data) {
      // Expect strings like "Eylül 2016"; robust split by space and take first token as month name
      const monthName = r.time.split(/\s+/)[0]?.toLowerCase();
      const idx = MONTH_INDEX[monthName];
      if (typeof idx === 'number') totals[idx] += r.count;
    }
    return totals;
  }

  function colorFor(value: number, max: number): string {
    if (max <= 0) return 'rgba(203, 213, 225, 0.6)';
    const t = Math.max(0, Math.min(1, value / max));
    // Red scale: low -> light, high -> strong
    const alpha = 0.18 + t * 0.72; // 0.18..0.9
    return `rgba(220, 38, 38, ${alpha.toFixed(3)})`;
  }

  onMount(async () => {
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      rows = parseCSV(text);
      monthTotals = aggregateByMonth(rows);
      maxVal = monthTotals.reduce((m, v) => Math.max(m, v), 0);
    } catch (e: any) {
      error = `Veri yükleme hatası: ${e?.message || e}`;
    } finally {
      loading = false;
    }
  });
</script>

<div class="month-heatmap">
  <div class="mh-header">
    <h3>{title}</h3>
    {#if subtitle}
      <p class="sub">{subtitle}</p>
    {/if}
  </div>

  {#if loading}
    <div class="mh-state">Yükleniyor…</div>
  {:else if error}
    <div class="mh-state error">{error}</div>
  {:else}
    <div class="mh-grid" role="list" aria-label="Aylara göre toplam vakalar">
      {#each MONTHS_TR as m, i}
        <div class="mh-cell" role="listitem">
          <div
            class="swatch"
            style="background-color: {colorFor(monthTotals[i], maxVal)}"
            aria-label={`${m}: ${monthTotals[i]} vaka`}
            title={`${m}: ${monthTotals[i]} vaka`}
          >
            <span class="value">{monthTotals[i]}</span>
          </div>
          <div class="label">{m}</div>
        </div>
      {/each}
    </div>

    <div class="mh-legend">
      <span>az</span>
      <div class="lg-bar">
        <span style="background: rgba(220, 38, 38, 0.18)"></span>
        <span style="background: rgba(220, 38, 38, 0.45)"></span>
        <span style="background: rgba(220, 38, 38, 0.75)"></span>
        <span style="background: rgba(220, 38, 38, 0.90)"></span>
      </div>
      <span>çok</span>
    </div>
  {/if}
</div>

<style lang="scss">
  .month-heatmap {
    width: 100%;
  }
  .mh-header {
    text-align: left;
    margin-bottom: 0.75rem;
    h3 {
      color: #1d4ed8;
      margin: 0;
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.01em;
    }
    .sub {
      margin: 0.25rem 0 0 0;
      color: #6b7280;
      font-size: 0.9rem;
    }
  }

  .mh-state {
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(203, 213, 225, 0.7);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    color: #334155;
  }
  .mh-state.error {
    color: #991b1b;
    border-color: rgba(239, 68, 68, 0.4);
  }

  .mh-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px 14px;
  }

  .mh-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .swatch {
    width: 100%;
    height: 56px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0f172a;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .swatch .value {
    font-size: 0.95rem;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
  }

  .label {
    font-size: 0.85rem;
    color: #475569;
    text-align: center;
  }

  .mh-legend {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #64748b;
    font-size: 0.8rem;
  }
  .lg-bar {
    display: flex;
    gap: 6px;
  }
  .lg-bar span {
    width: 28px;
    height: 8px;
    border-radius: 4px;
    display: inline-block;
  }

  @media (max-width: 900px) {
    .mh-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
</style>
