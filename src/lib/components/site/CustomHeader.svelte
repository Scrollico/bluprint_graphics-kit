<script lang="ts">
  export let navLinks: { label: string; href: string }[] = [
    { label: 'Keşfet', href: '#' },
    { label: 'Alara AI', href: '#' },
    { label: 'Business', href: '#' },
  ];
  export let subscribeLink: string = '#';
  export let currentLang: string = 'tr'; // 'tr' or 'global'

  let isMenuOpen = false;

  function setLang(lang: string) {
    currentLang = lang;
    console.log('Language set to:', currentLang);
  }

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function closeMenu() {
    isMenuOpen = false;
  }
</script>

<header class="custom-header">
  <div class="container">
    <div class="left-section">
      <a href="/" class="brand-logo">
        <img
          src="/images/branding/Primary-alternative.png"
          alt="Scrolli"
          class="logo-image"
        />
        <div class="brand-text">
          <span class="brand-name">Scrolli</span>
          <span class="brand-subtitle">Graphics</span>
        </div>
      </a>
    </div>

    <!-- Desktop Navigation -->
    <nav class="center-section desktop-nav">
      {#each navLinks as link}
        <a href={link.href} class="nav-link">
          {link.label}
        </a>
      {/each}
    </nav>

    <div class="right-section desktop-nav">
      <button
        class="subscribe-btn"
        onclick={() => (window.location.href = subscribeLink)}
      >
        <svg
          class="arrow-icon"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Subscribe
      </button>
      <div class="lang-toggle">
        <button
          class="lang-chip {currentLang === 'tr' ? 'active' : ''}"
          onclick={() => setLang('tr')}
        >
          tr
        </button>
        <button
          class="lang-chip {currentLang === 'global' ? 'active' : ''}"
          onclick={() => setLang('global')}
        >
          Global
        </button>
      </div>
    </div>

    <!-- Mobile Hamburger Button -->
    <button
      class="hamburger-btn mobile-only"
      onclick={toggleMenu}
      aria-label="Toggle mobile menu"
    >
      <span class="hamburger-line" class:open={isMenuOpen}></span>
      <span class="hamburger-line" class:open={isMenuOpen}></span>
      <span class="hamburger-line" class:open={isMenuOpen}></span>
    </button>
  </div>

  <!-- Mobile Menu -->
  <div class="mobile-menu" class:open={isMenuOpen}>
    <div class="mobile-menu-content">
      <nav class="mobile-nav">
        {#each navLinks as link}
          <a href={link.href} class="mobile-nav-link" onclick={closeMenu}>
            {link.label}
          </a>
        {/each}
      </nav>

      <div class="mobile-actions">
        <button
          class="mobile-subscribe-btn"
          onclick={() => {
            window.location.href = subscribeLink;
            closeMenu();
          }}
        >
          <svg
            class="arrow-icon"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Subscribe
        </button>

        <div class="mobile-lang-toggle">
          <button
            class="mobile-lang-chip {currentLang === 'tr' ? 'active' : ''}"
            onclick={() => setLang('tr')}
          >
            tr
          </button>
          <button
            class="mobile-lang-chip {currentLang === 'global' ? 'active' : ''}"
            onclick={() => setLang('global')}
          >
            Global
          </button>
        </div>
      </div>
    </div>
  </div>
</header>

<style lang="scss">
  .custom-header {
    position: sticky;
    top: 0;
    z-index: 100000; /* above all story overlays */
    /* Make header visually transparent with a very subtle gradient */
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.85) 0%,
      rgba(255, 255, 255, 0.45) 55%,
      rgba(255, 255, 255, 0) 100%
    );
    color: #333;
    border-bottom: 0; /* remove solid divider for transparency */
    box-shadow: none; /* remove drop shadow for cleaner transparent look */
    padding: 0; /* compact */
    height: auto; /* natural height */
    backdrop-filter: none; /* keep clean; adjust if readability needed */
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 0.5rem; /* Reduced side padding from 1rem to 0.5rem */
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 0.25rem;
  }

  .left-section {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .brand-logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: inherit;
    gap: 0.5rem;

    .logo-image {
      height: 24px;
      width: auto;
      object-fit: contain;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .brand-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: #9ca3af;
      letter-spacing: -0.02em;
      font-family:
        'Reuters',
        -apple-system,
        BlinkMacSystemFont,
        sans-serif;
      line-height: 1;
    }

    .brand-subtitle {
      font-size: 0.75rem;
      color: #6b7280;
      font-weight: 400;
      font-family:
        'Reuters',
        -apple-system,
        BlinkMacSystemFont,
        sans-serif;
    }
  }

  .center-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    justify-self: center;
  }

  .nav-link {
    color: #374151;
    text-decoration: none;
    font-size: 1rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: color 0.2s ease;
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;

    &:hover {
      color: #1f2937;
    }
  }

  .right-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-self: end;
  }

  .subscribe-btn {
    background: #fbbf24;
    color: #1f2937;
    border: 0;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;

    &:hover {
      background: #f59e0b;
      transform: translateY(-1px);
    }

    .arrow-icon {
      flex-shrink: 0;
      width: 14px;
      height: 14px;
    }
  }

  .lang-toggle {
    display: flex;
    gap: 0.25rem;
  }

  .lang-chip {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 0.375rem 0.75rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    transition: all 0.2s ease;
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;

    &:hover {
      background: #e5e7eb;
    }

    &.active {
      background: #8b5cf6;
      color: #fff;
      border-color: #8b5cf6;
    }
  }

  // Hide/show elements based on screen size
  .desktop-nav {
    display: flex;
  }

  .mobile-only {
    display: none;
  }

  .mobile-menu {
    display: none; // Hidden by default on desktop
  }

  // Hamburger button
  .hamburger-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    display: none; // Hidden by default on desktop
    flex-direction: column;
    gap: 4px;

    .hamburger-line {
      width: 20px;
      height: 2px;
      background: #374151;
      border-radius: 1px;
      transition: all 0.3s ease;

      &.open:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
      }

      &.open:nth-child(2) {
        opacity: 0;
      }

      &.open:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
      }
    }
  }

  // Mobile menu
  .mobile-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;

    &.open {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
    }
  }

  .mobile-menu-content {
    padding: 1.5rem 1rem;
  }

  .mobile-nav {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .mobile-nav-link {
    color: #374151;
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 500;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f3f4f6;
    transition: color 0.2s ease;
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;

    &:hover {
      color: #1f2937;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .mobile-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .mobile-subscribe-btn {
    background: #fbbf24;
    color: #1f2937;
    border: 0;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    width: 100%;
    justify-content: center;

    &:hover {
      background: #f59e0b;
    }
  }

  .mobile-lang-toggle {
    display: flex;
    gap: 0.5rem;
  }

  .mobile-lang-chip {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
    transition: all 0.2s ease;
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;

    &:hover {
      background: #e5e7eb;
    }

    &.active {
      background: #8b5cf6;
      color: #fff;
      border-color: #8b5cf6;
    }
  }

  @media (max-width: 768px) {
    .custom-header {
      padding: 0; /* Removed all padding for mobile as well */
    }

    .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1rem;
    }

    .desktop-nav {
      display: none;
    }

    .mobile-only {
      display: flex;
    }

    .mobile-menu {
      display: block; // Show on mobile
    }

    .hamburger-btn {
      display: flex; // Show hamburger on mobile
    }

    .left-section {
      justify-content: flex-start;
    }

    .brand-logo {
      .logo-image {
        height: 24px;
      }

      .brand-name {
        font-size: 1.1rem;
      }

      .brand-subtitle {
        font-size: 0.75rem;
      }
    }
  }
</style>
