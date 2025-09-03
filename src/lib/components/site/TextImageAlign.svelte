<script lang="ts">
  export let imageUrl: string = '';
  export let imageAlt: string = '';
  export let headline: string = '';
  export let byline: string = '';
  export let date: string = '';
  export let section: string = '';
</script>

<div class="text-image-container">
  <div class="text-content">
    <div class="section">{section}</div>
    <h1 class="headline">{headline}</h1>
    <div class="byline">{byline}</div>
    <div class="date">{date}</div>
  </div>
  <div class="image-container">
    {#if imageUrl}
      <img src={imageUrl} alt={imageAlt} class="aligned-image" />
    {/if}
  </div>
</div>

<style lang="scss">
  .text-image-container {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 768px) {
      flex-direction: column;
      padding: 1rem;
    }
  }

  .text-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section {
    font-size: 1rem;
    font-weight: 600;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .headline {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    line-height: 1.2;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  .byline {
    font-size: 1.2rem;
    font-weight: 600;
    color: #4b5563;
  }

  .date {
    font-size: 1rem;
    color: #6b7280;
    margin-bottom: 1rem;
  }

  .image-container {
    flex: 1;
    display: flex;
    justify-content: flex-end;

    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  .aligned-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
</style>
