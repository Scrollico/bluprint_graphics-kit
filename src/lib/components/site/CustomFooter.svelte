<script lang="ts">
  export let links: { label: string; href: string }[] = [];
  export let copyright: string = `© ${new Date().getFullYear()} Your Brand`;
</script>

<footer class="custom-footer">
  <div class="container">
    <nav class="links">
      {#each links as link}
        <a href={link.href} target="_blank" rel="noopener noreferrer"
          >{link.label}</a
        >
      {/each}
    </nav>
    <div class="copy">{copyright}</div>
  </div>
</footer>

<style lang="scss">
  .custom-footer {
    margin-top: 4rem;
    background: #0b1220;
    color: #cbd5e1;
    border-top: 1px solid rgba(203, 213, 225, 0.15);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.25rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .links {
    display: flex;
    gap: 1rem;

    a {
      color: #cbd5e1;
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: #fff;
      }
    }
  }

  .copy {
    font-size: 0.9rem;
  }
</style>
