<script lang="ts">
  /**
   * FullWidthBody.svelte
   * Reusable centered body layout for narrative breaks independent of two-column scrollytelling.
   */
  export let content: string;
  export let headline: string | null = null;
  export let kicker: string | null = null;
  export let byline: string | null = null;
  export let maxWidth: number = 760;
  export let align: 'center' | 'left' = 'center';
  export let topPadding: string = '8rem';
  export let bottomPadding: string = '8rem';
  export let muted: boolean = false;
  export let background: 'transparent' | 'solid' = 'transparent';
</script>

<section
  class="fullwidth-body {background === 'solid' ? 'solid' : ''} {muted ? 'muted'
  : ''}"
  role="region"
>
  <div
    class="inner"
    style="max-width: {maxWidth}px; padding-top: {topPadding}; padding-bottom: {bottomPadding};"
  >
    {#if kicker}
      <div class="kicker">{kicker}</div>
    {/if}
    {#if headline}
      <h2
        class="headline"
        class:left={align === 'left'}
        class:center={align === 'center'}
      >
        {headline}
      </h2>
    {/if}
    {#if byline}
      <div class="byline">{byline}</div>
    {/if}
    <div
      class="body"
      class:left={align === 'left'}
      class:center={align === 'center'}
    >
      {@html content}
    </div>
  </div>
</section>

<style lang="scss">
  .fullwidth-body {
    width: 100%;
    margin: 0;
    background: transparent;
    display: block;
  }
  .fullwidth-body.solid {
    background: #fff;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  .inner {
    margin: 0 auto;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .kicker {
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 0.5rem;
    text-align: center;
  }
  .headline {
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    line-height: 1.25;
    margin: 0 0 1rem 0;
    text-align: center;
  }
  .headline.left {
    text-align: left;
  }
  .headline.center {
    text-align: center;
  }
  .byline {
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .body {
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    font-size: 20px;
    line-height: 1.75;
    color: #1f2937;
    text-align: center;
  }
  .body.left {
    text-align: left;
  }
  .body.center {
    text-align: center;
  }
  .muted .body {
    color: #374151;
  }

  @media (max-width: 768px) {
    .headline {
      font-size: 26px;
    }
    .body {
      font-size: 18px;
      line-height: 1.7;
    }
  }
</style>
