<script lang="ts">
  import type { PageData } from './$types';
  import {
    AdScripts,
    SEO,
    SiteFooter,
    EmbedPreviewerLink,
    Theme,
  } from '@reuters-graphics/graphics-components';
  import pkg from '$pkg';
  import { dev } from '$app/environment';
  import { assets } from '$app/paths';
  import { page } from '$app/state';
  import { isReutersApp, isReutersDotcom } from '$utils/env';
  import CustomHeader from '$lib/components/site/CustomHeader.svelte';

  // Styles
  import '@reuters-graphics/graphics-components/scss/main.scss';
  import '$lib/styles/global.scss';

  let { data }: { data: PageData } = $props();
  let content = $derived(data.content);

  // Page data
  const pageData = {
    seoTitle: 'Bluprint Graphics - Interactive Data Stories',
    seoDescription:
      'Explore interactive data visualizations and scrollytelling stories',
    shareTitle: 'Bluprint Graphics',
    shareDescription: 'Interactive data stories and visualizations',
    shareImgPath: 'images/branding/Primary-alternative.png',
    shareImgAlt: 'Bluprint Graphics Logo',
  };
</script>

{#if isReutersDotcom(page.url)}
  <AdScripts />
{/if}

<SEO
  baseUrl={import.meta.env.BASE_URL}
  pageUrl={page.url}
  seoTitle={pageData.seoTitle}
  seoDescription={pageData.seoDescription}
  shareTitle={pageData.shareTitle}
  shareDescription={pageData.shareDescription}
  shareImgPath={`${assets}/${pageData.shareImgPath}`}
  shareImgAlt={pageData.shareImgAlt}
  publishTime={pkg?.reuters?.graphic?.published}
  updateTime={pkg?.reuters?.graphic?.updated}
  authors={pkg?.reuters?.graphic?.authors}
/>

<Theme base="light">
  <!-- Custom header -->
  <CustomHeader
    logoPath={`${assets}/images/branding/Primary-alternative.png`}
    brandName="Bluprint Graphics"
    navLinks={[
      { label: 'Discover', href: '#' },
      { label: 'News', href: '#' },
      { label: 'Scrolli Media', href: '#' },
    ]}
    subscribeLink="#"
    currentLang="tr"
  />

  <!-- Main content area -->
  <div class="main-content">
    <div class="hero-section">
      <h1>Welcome to Bluprint Graphics</h1>
      <p>Interactive data stories and visualizations</p>

      <div class="navigation-cards">
        <a href="/scrollytelling" class="nav-card">
          <h3>European Map Story</h3>
          <p>Interactive European map with zoom and pitch animations</p>
        </a>

        <a href="/scrollytelling" class="nav-card">
          <h3>Scrollytelling Demo</h3>
          <p>Basic scrollytelling example</p>
        </a>

        <a href="/marmaray" class="nav-card">
          <h3>Marmaray Story</h3>
          <p>Marmaray transportation story</p>
        </a>
      </div>
    </div>
  </div>

  {#if !isReutersApp(page.url)}
    <SiteFooter />
  {:else}
    <EmbedPreviewerLink />
  {/if}
</Theme>

<style lang="scss">
  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 2rem;
    min-height: 80vh;
  }

  .hero-section {
    text-align: center;
    margin-bottom: 4rem;

    h1 {
      font-size: 3rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    p {
      font-size: 1.25rem;
      color: #6b7280;
      margin-bottom: 3rem;
    }
  }

  .navigation-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
  }

  .nav-card {
    display: block;
    padding: 2rem;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: #d1d5db;
    }

    h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.75rem;
    }

    p {
      color: #6b7280;
      line-height: 1.5;
      margin: 0;
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .main-content {
      padding: 2rem 1rem;
    }

    .hero-section {
      h1 {
        font-size: 2rem;
      }

      p {
        font-size: 1.1rem;
      }
    }

    .navigation-cards {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .nav-card {
      padding: 1.5rem;

      h3 {
        font-size: 1.25rem;
      }
    }
  }
</style>
