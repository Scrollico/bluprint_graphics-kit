<!--
  Fullscreen Visual Layout Component
  Large image/graphic with optional overlay
-->
<script lang="ts">
  export let imageSrc: string;
  export let imageAlt: string = '';
  export let overlayTitle: string = '';
  export let overlayText: string = '';
  export let height: string = '80vh';
  export let loading: 'lazy' | 'eager' = 'lazy';
</script>

<div class="fullscreen-visual-container" style="height: {height}">
  <div class="fullscreen-image">
    <img src={imageSrc} alt={imageAlt} {loading} />
  </div>
  {#if overlayTitle || overlayText}
    <div class="visual-overlay">
      <div class="overlay-content">
        {#if overlayTitle}
          <h3>{overlayTitle}</h3>
        {/if}
        {#if overlayText}
          <p>{overlayText}</p>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .fullscreen-visual-container {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
  }

  .fullscreen-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .visual-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    padding: 3rem 2rem;
  }

  .overlay-content h3 {
    color: white;
    font-size: 2.5rem;
    font-weight: 300;
    margin-bottom: 0.5rem;
  }

  .overlay-content p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.1rem;
    margin: 0;
  }

  @media (max-width: 768px) {
    .visual-overlay {
      padding: 2rem 1rem;
    }

    .overlay-content h3 {
      font-size: 2rem;
    }

    .overlay-content p {
      font-size: 1rem;
    }
  }
</style>
