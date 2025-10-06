<!--
  Statistic Callout Component
  Large number/stat with optional context
-->
<script lang="ts">
  export let number: string;
  export let label: string;
  export let context: string = '';
  export let color: string = '#d32f2f';
  export let size: 'small' | 'medium' | 'large' = 'large';
</script>

<div class="statistic-callout-container">
  <div class="statistic-main">
    <div class="statistic-number size-{size}" style="color: {color}">
      {number}
    </div>
    <div class="statistic-label">
      {label}
    </div>
  </div>
  {#if context}
    <div class="statistic-context">
      <p>{context}</p>
    </div>
  {/if}
</div>

<style>
  .statistic-callout-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 3rem;
    background: #f8f9fa;
    border-radius: 16px;
    text-align: center;
  }

  .statistic-main {
    text-align: center;
  }

  .statistic-number {
    font-weight: 200;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .statistic-number.size-small {
    font-size: 3rem;
  }

  .statistic-number.size-medium {
    font-size: 4rem;
  }

  .statistic-number.size-large {
    font-size: 5rem;
  }

  .statistic-label {
    font-size: 1.3rem;
    font-weight: 500;
    color: #333;
    max-width: 400px;
  }

  .statistic-context p {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #555;
    max-width: 500px;
    margin: 0;
  }

  @media (max-width: 768px) {
    .statistic-callout-container {
      padding: 2rem;
    }

    .statistic-number.size-large {
      font-size: 4rem;
    }

    .statistic-number.size-medium {
      font-size: 3rem;
    }

    .statistic-number.size-small {
      font-size: 2.5rem;
    }

    .statistic-label {
      font-size: 1.1rem;
    }

    .statistic-context p {
      font-size: 1rem;
    }
  }
</style>
