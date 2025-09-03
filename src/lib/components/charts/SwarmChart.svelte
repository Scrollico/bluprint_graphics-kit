<script lang="ts">
  export let visibleCount: number = 1; // 1..29

  const TOTAL = 29;
  const WIDTH = 300;
  const HEIGHT = 300;
  const COLS = 10;
  const SPACING = 26;
  const R = 6;

  const startX = (WIDTH - COLS * SPACING) / 2 + SPACING / 2;
  const startY = (HEIGHT - Math.ceil(TOTAL / COLS) * SPACING) / 2 + SPACING / 2;
</script>

<div class="swarm-container">
  <div class="swarm-title">
    <h2>29 İnsan</h2>
    <p class="subtitle">Her nokta bir hayatı temsil ediyor</p>
  </div>

  <div class="swarm-visual">
    <svg width={WIDTH} height={HEIGHT} role="img" aria-label="Noktalar">
      {#each Array(TOTAL) as _, i}
        {#if i < visibleCount}
          <circle
            cx={startX + (i % COLS) * SPACING}
            cy={startY + Math.floor(i / COLS) * SPACING}
            r={R}
            fill="#000"
          />
        {/if}
      {/each}
    </svg>
  </div>

  <div class="swarm-counter">
    <span class="number">{Math.max(1, Math.min(visibleCount, TOTAL))}</span>
    <span class="label">kişi</span>
  </div>
</div>

<style lang="scss">
  .swarm-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 2rem;
    background: #fff;
    border-radius: 12px;
    color: #000;
    text-align: center;
    border: 1px solid #e5e7eb;
  }
  .swarm-title {
    margin-bottom: 1.25rem;
  }
  .swarm-title h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    color: #000;
  }
  .swarm-title .subtitle {
    font-size: 1rem;
    opacity: 0.7;
    margin: 0;
    color: #374151;
  }
  .swarm-visual {
    display: grid;
    place-items: center;
  }
  .swarm-counter {
    margin-top: 0.5rem;
  }
  .swarm-counter .number {
    font-size: 2rem;
    font-weight: 800;
    color: #000;
    display: block;
  }
  .swarm-counter .label {
    font-size: 1rem;
    opacity: 0.7;
    color: #374151;
  }
</style>
