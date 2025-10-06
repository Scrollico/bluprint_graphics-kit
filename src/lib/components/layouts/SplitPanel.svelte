<!--
  Split Panel Layout Component
  Image/Graphic + Text side-by-side layout
-->
<script lang="ts">
  export let imageSrc: string;
  export let imageAlt: string = '';
  export let imageCaption: string = '';
  export let title: string = '';
  export let text: string = '';
  export let reverse: boolean = false; // Image on right, text on left
  export let loading: 'lazy' | 'eager' = 'lazy';
</script>

<div class="split-panel-container {reverse ? 'reverse' : ''}">
  <div class="split-panel-image">
    <img src={imageSrc} alt={imageAlt} {loading} />
    {#if imageCaption}
      <div class="image-caption">
        {imageCaption}
      </div>
    {/if}
  </div>
  <div class="split-panel-text">
    {#if title}
      <h3>{title}</h3>
    {/if}
    {#if text}
      <div class="text-content">
        {@html text}
      </div>
    {/if}
  </div>
</div>

<style>
  .split-panel-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    max-width: 1200px;
    width: 100%;
    align-items: center;
  }

  .split-panel-container.reverse {
    grid-template-areas: 'text image';
  }

  .split-panel-container.reverse .split-panel-text {
    grid-area: text;
    order: 1;
  }

  .split-panel-container.reverse .split-panel-image {
    grid-area: image;
    order: 2;
  }

  .split-panel-image {
    position: relative;
  }

  .split-panel-image img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .image-caption {
    font-size: 0.9rem;
    color: #666;
    margin-top: 1rem;
    text-align: center;
  }

  .split-panel-text h3 {
    font-size: 2rem;
    font-weight: 400;
    margin-bottom: 1.5rem;
    line-height: 1.2;
  }

  .split-panel-text p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    line-height: 1.7;
  }

  .text-content :global(p) {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    line-height: 1.7;
  }

  .text-content :global(p:last-child) {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    .split-panel-container {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .split-panel-container.reverse {
      grid-template-areas: initial;
    }

    .split-panel-container.reverse .split-panel-text,
    .split-panel-container.reverse .split-panel-image {
      order: initial;
    }
  }
</style>
