<!--
  Simple Layout System Test
-->

<script lang="ts">
  let message = 'Layout System is working!';
</script>

<svelte:head>
  <title>Layout System Test</title>
</svelte:head>

<div class="test-container">
  <h1>{message}</h1>
  <p>This is a simple test to see if the layout system page loads.</p>
</div>

<style>
  .test-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  .test-container h1 {
    color: #d32f2f;
    font-size: 2rem;
    margin-bottom: 1rem;
  }
</style>
