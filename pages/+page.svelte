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
    seoTitle: 'Bluprint Graphics - Interactive Data Stories & Scrollytelling',
    seoDescription:
      'Professional interactive data visualizations, scrollytelling stories, and news graphics. Explore our collection of Reuters-style data journalism.',
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
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>Bluprint Graphics</h1>
        <p class="hero-subtitle">
          Professional interactive data stories, scrollytelling narratives, and
          Reuters-style news graphics
        </p>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">12+</span>
            <span class="stat-label">Interactive Stories</span>
          </div>
          <div class="stat">
            <span class="stat-number">5</span>
            <span class="stat-label">Map Visualizations</span>
          </div>
          <div class="stat">
            <span class="stat-number">100%</span>
            <span class="stat-label">Mobile Optimized</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Stories Section -->
    <section class="featured-section">
      <h2>Featured Stories</h2>
      <div class="featured-grid">
        <div class="featured-card primary">
          <div class="card-image">
            <div class="placeholder-image map-placeholder"></div>
          </div>
          <div class="card-content">
            <span class="card-category">Transportation</span>
            <h3>Marmaray: A Story of Urban Transportation</h3>
            <p>
              An in-depth look at Istanbul's rail system, featuring interactive
              maps, data visualizations, and compelling narrative storytelling.
            </p>
            <a href="/marmaray" class="card-link">Explore Story →</a>
          </div>
        </div>

        <div class="featured-card">
          <div class="card-image">
            <div class="placeholder-image europe-placeholder"></div>
          </div>
          <div class="card-content">
            <span class="card-category">Data Visualization</span>
            <h3>European Map Storytelling</h3>
            <p>
              Interactive European map with smooth zoom animations and
              data-driven insights.
            </p>
            <a href="/scrollytelling" class="card-link">View Story →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Story Categories -->
    <section class="categories-section">
      <h2>Story Categories</h2>
      <div class="categories-grid">
        <a href="/mapbox-clone" class="category-card">
          <div class="category-icon">🗺️</div>
          <h3>Mapbox Clone</h3>
          <p>
            Direct clone of Mapbox storytelling template with native Mapbox GL
            JS integration
          </p>
        </a>

        <a href="/map-storytelling" class="category-card">
          <div class="category-icon">📖</div>
          <h3>Map Storytelling</h3>
          <p>Clean scrollytelling based on Mapbox storytelling template</p>
        </a>

        <a href="/map-test" class="category-card">
          <div class="category-icon">🧪</div>
          <h3>Map Testing</h3>
          <p>Simple map testing without complex scrollytelling logic</p>
        </a>

        <a href="/demos" class="category-card">
          <div class="category-icon">🎨</div>
          <h3>Demos & Examples</h3>
          <p>Collection of demonstration pages and interactive examples</p>
        </a>
      </div>
    </section>

    <!-- Technology Stack -->
    <section class="tech-section">
      <h2>Built With Modern Technology</h2>
      <div class="tech-grid">
        <div class="tech-item">
          <div class="tech-icon">⚡</div>
          <h4>SvelteKit</h4>
          <p>Fast, modern web framework</p>
        </div>
        <div class="tech-item">
          <div class="tech-icon">🗺️</div>
          <h4>Mapbox GL JS</h4>
          <p>Interactive map visualizations</p>
        </div>
        <div class="tech-item">
          <div class="tech-icon">📊</div>
          <h4>D3.js</h4>
          <p>Data-driven visualizations</p>
        </div>
        <div class="tech-item">
          <div class="tech-icon">🎭</div>
          <h4>Scrollytelling</h4>
          <p>Narrative-driven interactions</p>
        </div>
      </div>
    </section>
  </div>

  {#if !isReutersApp(page.url)}
    <SiteFooter />
  {:else}
    <EmbedPreviewerLink />
  {/if}
</Theme>

<style lang="scss">
  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  /* Hero Section */
  .hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 6rem 0;
    text-align: center;
    margin: 0 -2rem 4rem -2rem;

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    h1 {
      font-size: 4rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      line-height: 1.1;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .hero-subtitle {
      font-size: 1.4rem;
      margin-bottom: 3rem;
      opacity: 0.95;
      line-height: 1.6;
      font-weight: 300;
    }

    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 4rem;
      margin-top: 3rem;

      .stat {
        text-align: center;

        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1rem;
          opacity: 0.9;
          font-weight: 300;
        }
      }
    }
  }

  /* Featured Section */
  .featured-section {
    margin-bottom: 6rem;

    h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      text-align: center;
      margin-bottom: 3rem;
    }

    .featured-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;

      .featured-card {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;

        &:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        &.primary {
          .card-image {
            height: 200px;
          }
        }

        .card-image {
          height: 150px;
          background: linear-gradient(45deg, #f3f4f6, #e5e7eb);

          .placeholder-image {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            opacity: 0.6;
          }

          .map-placeholder {
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
            font-size: 4rem;
          }

          .europe-placeholder {
            background: linear-gradient(135deg, #059669, #0d9488);
            color: white;
            font-size: 4rem;
          }
        }

        .card-content {
          padding: 2rem;

          .card-category {
            display: inline-block;
            background: #f3f4f6;
            color: #6b7280;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 1rem;
          }

          h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1rem;
            line-height: 1.3;
          }

          p {
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 1.5rem;
          }

          .card-link {
            color: #4f46e5;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;

            &:hover {
              color: #3730a3;
            }
          }
        }
      }
    }
  }

  /* Categories Section */
  .categories-section {
    margin-bottom: 6rem;

    h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      text-align: center;
      margin-bottom: 3rem;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;

      .category-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 2rem;
        text-decoration: none;
        color: inherit;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: #d1d5db;
        }

        .category-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        p {
          color: #6b7280;
          line-height: 1.5;
          margin: 0;
          font-size: 0.95rem;
        }
      }
    }
  }

  /* Technology Section */
  .tech-section {
    background: #f8fafc;
    padding: 4rem 0;
    margin: 0 -2rem -2rem -2rem;
    border-radius: 20px 20px 0 0;

    h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      text-align: center;
      margin-bottom: 3rem;
    }

    .tech-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      max-width: 800px;
      margin: 0 auto;
      padding: 0 2rem;

      .tech-item {
        text-align: center;
        padding: 1.5rem;

        .tech-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        h4 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        p {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0;
        }
      }
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .main-content {
      padding: 0 1rem;
    }

    .hero-section {
      padding: 4rem 0;
      margin: 0 -1rem 3rem -1rem;

      h1 {
        font-size: 2.5rem;
      }

      .hero-subtitle {
        font-size: 1.2rem;
      }

      .hero-stats {
        gap: 2rem;

        .stat {
          .stat-number {
            font-size: 2rem;
          }
        }
      }
    }

    .featured-section {
      margin-bottom: 4rem;

      h2 {
        font-size: 2rem;
      }

      .featured-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    .categories-section {
      margin-bottom: 4rem;

      h2 {
        font-size: 2rem;
      }

      .categories-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    .tech-section {
      margin: 0 -1rem -1rem -1rem;
      padding: 3rem 0;

      h2 {
        font-size: 2rem;
      }

      .tech-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        padding: 0 1rem;
      }
    }
  }

  @media (max-width: 480px) {
    .hero-stats {
      flex-direction: column;
      gap: 1.5rem !important;
    }

    .tech-grid {
      grid-template-columns: 1fr !important;
    }
  }
</style>
