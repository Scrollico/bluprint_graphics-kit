<script lang="ts">
  import { reducedMotion, setReducedMotion } from '../../stores/reducedMotion';
  import { get } from 'svelte/store';

  export let label = 'Motion';

  function toggle() {
    const current = get(reducedMotion);
    setReducedMotion(!current);
  }
</script>

<button
  type="button"
  class="motion-toggle"
  aria-pressed={$reducedMotion}
  on:click={toggle}
>
  {label}: {$reducedMotion ? 'Reduced' : 'Enhanced'}
  <span class="dot" aria-hidden="true"></span>
  <span class="sr-only">Toggle motion preference</span>
</button>

<style>
  .motion-toggle {
    appearance: none;
    background: var(--color-bg, #0f0f10);
    color: var(--color-fg, #fff);
    border: 1px solid
      color-mix(in oklab, var(--color-fg, #fff) 20%, transparent);
    border-radius: 9999px;
    padding: 0.4rem 0.75rem;
    font: inherit;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  .motion-toggle .dot {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 9999px;
    background: currentColor;
    opacity: 0.6;
  }
  .motion-toggle[aria-pressed='true'] .dot {
    opacity: 1;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
