<!--
  Pull Quote Component
  Large, stylized quote with citation
-->
<script lang="ts">
  export let quote: string;
  export let citation: string = '';
  export let size: 'small' | 'medium' | 'large' = 'large';
  export let accentColor: string = '#d32f2f';
</script>

<div class="pull-quote-container">
  <blockquote class="pull-quote size-{size}">
    <p>{quote}</p>
    {#if citation}
      <cite class="pull-quote-citation">
        {citation}
      </cite>
    {/if}
  </blockquote>
</div>

<style>
  .pull-quote-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }

  .pull-quote {
    font-weight: 300;
    line-height: 1.4;
    margin: 0 0 2rem 0;
    position: relative;
    text-align: center;
    max-width: 800px;
  }

  .pull-quote::before {
    content: '"';
    font-family: Georgia, serif;
    position: absolute;
    top: -0.5rem;
    left: -2rem;
    color: var(--accent-color, #d32f2f);
  }

  .pull-quote.size-small {
    font-size: 1.6rem;
  }

  .pull-quote.size-small::before {
    font-size: 3rem;
  }

  .pull-quote.size-medium {
    font-size: 2rem;
  }

  .pull-quote.size-medium::before {
    font-size: 4rem;
  }

  .pull-quote.size-large {
    font-size: 2.5rem;
  }

  .pull-quote.size-large::before {
    font-size: 5rem;
  }

  .pull-quote-citation {
    font-size: 1rem;
    color: #666;
    font-style: normal;
    margin-top: 2rem;
    display: block;
  }

  @media (max-width: 768px) {
    .pull-quote-container {
      padding: 1rem;
    }

    .pull-quote.size-large {
      font-size: 2rem;
    }

    .pull-quote.size-large::before {
      font-size: 4rem;
    }

    .pull-quote.size-medium {
      font-size: 1.6rem;
    }

    .pull-quote.size-medium::before {
      font-size: 3rem;
    }
  }
</style>
