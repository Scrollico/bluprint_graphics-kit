<!--
  Section Title Component
  Full-width section breaks for major topic changes
-->
<script lang="ts">
  export let title: string;
  export let subtitle: string = '';
  export let background: string =
    'linear-gradient(135deg, #1a1a1a 0%, #333 100%)';
  export let textColor: string = 'white';
  export let height: string = '100vh';
</script>

<div
  class="section-title-container"
  style="background: {background}; color: {textColor}; min-height: {height}"
>
  <div class="section-title-content">
    <h2>{title}</h2>
    {#if subtitle}
      <p>{subtitle}</p>
    {/if}
  </div>
</div>

<style>
  .section-title-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .section-title-content {
    text-align: center;
    max-width: 800px;
    z-index: 2;
  }

  .section-title-content h2 {
    font-size: 3rem;
    font-weight: 300;
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .section-title-content p {
    font-size: 1.3rem;
    opacity: 0.8;
    margin: 0;
    font-weight: 400;
  }

  @media (max-width: 768px) {
    .section-title-content h2 {
      font-size: 2.5rem;
    }

    .section-title-content p {
      font-size: 1.1rem;
    }
  }
</style>
