<script lang="ts">
  import { onMount } from 'svelte';
  import { scroller } from '$utils/scroll';
  import {
    SEO,
    SiteHeader,
    SiteFooter,
    Theme,
    SiteHeadline,
    BodyText,
    EndNotes,
  } from '@reuters-graphics/graphics-components';
  import { assets } from '$app/paths';
  import { page } from '$app/state';
  import pkg from '$pkg';

  // Import chart components
  import IntroChart from '$lib/components/charts/IntroChart.svelte';
  import ZoomableMap from '$lib/components/charts/ZoomableMap.svelte';
  import DollarsBar from '$lib/components/charts/DollarsBar.svelte';
  import EuropeanMapChart from '$lib/components/charts/EuropeanMapChart.svelte';
  import { sampleEuropeanData } from '$lib/utils/csvParser';

  // Styles
  import '@reuters-graphics/graphics-components/scss/main.scss';
  import '$lib/styles/global.scss';

  let currentStep = $state(0);
  let scrollerInstance: any;

  onMount(() => {
    scrollerInstance = scroller({
      step: '.step',
      offset: 0.8,
      progress: (i) => (currentStep = i),
      debug: true,
    });
  });

  // Sample data for the story
  const storyData = {
    seoTitle: 'Interactive Scrollytelling Story',
    seoDescription: 'A demonstration of scroll-driven data visualization',
    shareTitle: 'Scroll-Driven Data Story',
    shareDescription: 'Experience data through scrolling',
    shareImgPath: 'images/reuters-graphics.jpg',
    shareImgAlt: 'Data visualization preview',
    hed: 'The Rise of Digital Transformation',
    section: 'Technology',
    sectionUrl: 'https://www.reuters.com/technology/',
    authors: ['Data Team'],
    publishTime: new Date().toISOString(),
    updateTime: '',
    endNotes: [
      {
        title: 'Methodology',
        text: 'Data analysis based on industry reports and market research',
      },
      {
        title: 'Sources',
        text: 'Industry reports, market data, expert interviews',
      },
    ],
  };
</script>

<SEO
  baseUrl={import.meta.env.BASE_URL}
  pageUrl={page.url}
  seoTitle={storyData.seoTitle}
  seoDescription={storyData.seoDescription}
  shareTitle={storyData.shareTitle}
  shareDescription={storyData.shareDescription}
  shareImgPath={`${assets}/${storyData.shareImgPath}`}
  shareImgAlt={storyData.shareImgAlt}
  publishTime={pkg?.reuters?.graphic?.published}
  updateTime={pkg?.reuters?.graphic?.updated}
  authors={pkg?.reuters?.graphic?.authors}
/>

<Theme base="light">
  <SiteHeader />

  <div class="scrollytelling-container">
    <!-- Sticky graphic pane -->
    <div class="graphic-pane">
      {#if currentStep === 0}
        <IntroChart />
      {:else if currentStep === 1}
        <ZoomableMap />
      {:else if currentStep === 2}
        <DollarsBar />
      {:else if currentStep === 4}
        <EuropeanMapChart data={sampleEuropeanData} />
        <!-- Debug overlay -->
        <div
          style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 5px 10px; font-size: 12px; border-radius: 5px; font-family: monospace; z-index: 1000;"
        >
          Step: {currentStep} | European Map Chart
        </div>
      {:else if currentStep === 6}
        <div class="placeholder-chart">
          <h3>Step {currentStep}</h3>
          <p>Chart will appear here</p>
        </div>
      {:else if currentStep === 8}
        <div class="video-container full-width">
          <video
            src="/media-assets/video/kling_20250822_Image_to_Video_An_illustr_1216_0 (5).mp4"
            controls
            autoplay
            muted
            style="width: 100%; height: 100%; object-fit: cover;"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      {:else}
        <div class="placeholder-chart">
          <h3>Step {currentStep}</h3>
          <p>Chart will appear here</p>
        </div>
      {/if}
    </div>

    <!-- Scrollable text content -->
    <div class="text-content">
      <SiteHeadline
        hed={storyData.hed}
        section={storyData.section}
        sectionUrl={storyData.sectionUrl}
        authors={storyData.authors}
        publishTime={storyData.publishTime}
        updateTime={storyData.updateTime}
      />

      <section class="step">
        <BodyText
          text="Digital transformation has accelerated dramatically in recent years. Companies across all industries are investing heavily in technology to stay competitive in an increasingly digital world."
        />
      </section>

      <section class="step">
        <BodyText
          text="The pandemic served as a catalyst, forcing organizations to rapidly adopt digital solutions. Remote work, e-commerce, and digital services became essential overnight."
        />
      </section>

      <section class="step">
        <BodyText
          text="Investment in digital transformation reached unprecedented levels, with companies spending billions on cloud infrastructure, automation, and digital tools."
        />
      </section>

      <section class="step">
        <BodyText
          text="The impact of digital transformation varies significantly across European countries. This interactive map shows the distribution of digital adoption rates and technological infrastructure across different European regions, highlighting both the digital divide and the opportunities for growth."
        />
      </section>

      <section class="step centered-body">
        <div class="story-container">
          <p>
            Zira 2021 ile 2025 yılları arasında Marmaray istasyonlarında,
            kayıtlara geçen en az 29 intihar ya da intihar girişimi yaşandı. Bu
            olayların hepsi, yolcuların gözü önünde, kamusal alanın en görünür
            yerinde gerçekleşti ve birçoğu ölümle sonuçlandı. Öyle ki bazı
            istasyonlar adeta bu ölümlerin merkezine dönüştü.
          </p>
          <p>
            Yenikapı, Ayrılık Çeşmesi ve Bostancı, en fazla ölümün yaşandığı
            duraklar olurken, vakalar en çok haftanın başında ve sabah
            saatlerinde meydana geldi.
          </p>
          <p>
            Ancak tüm bunlara rağmen kamuoyunun bu vakalardan haberdar olması
            ise çoğu zaman mümkün olmadı. Çünkü Marmaray yönetimi, bu olayları
            ya yalnızca “üzücü bir olay” diye duyurdu ya da hiç duyurmadı bile.
          </p>
        </div>
      </section>

      <section class="step">
        <BodyText
          text="Check out this video demonstration of our digital transformation process in action."
        />
      </section>

      <section class="step">
        <BodyText
          text="The impact of digital transformation varies significantly across European countries. This map shows the distribution of digital adoption rates across different regions, highlighting the digital divide within Europe."
        />
      </section>

      <section class="step">
        <BodyText
          text="This video showcases the power of AI-driven visualization in modern storytelling."
        />
      </section>

      <EndNotes notes={storyData.endNotes} />
    </div>
  </div>

  <SiteFooter />
</Theme>

<style lang="scss">
  .scrollytelling-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    min-height: 100vh;
  }

  .graphic-pane {
    position: sticky;
    top: 2rem;
    height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-radius: 8px;
    overflow: hidden;
    z-index: 1;
  }

  .text-content {
    padding: 2rem 0;
    /* Ensure text content doesn't overlap with graphic */
    position: relative;
    z-index: 2;
  }

  .step {
    margin-bottom: 100vh;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    /* Prevent text overflow issues */
    overflow: hidden;
  }

  /* Centered Reuters-like body container for Step 4 */
  .centered-body {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .centered-body .story-container {
    max-width: 720px;
    margin: 0 auto;
    font-size: 1.125rem; /* ~18px */
    line-height: 1.8;
    color: #1e1e1e;
  }

  .centered-body p {
    margin: 1.25rem 0;
  }

  .placeholder-chart {
    text-align: center;
    color: #666;

    h3 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
  }

  /* Enhanced mobile responsiveness */
  @media (max-width: 768px) {
    .scrollytelling-container {
      grid-template-columns: 1fr;
      gap: 0.5rem;
      padding: 0 1rem;
    }

    .graphic-pane {
      position: relative;
      height: 45vh;
      top: 0;
      margin-bottom: 1rem;
      border-radius: 12px;
      overflow: hidden;
    }

    .step {
      margin-bottom: 50vh;
      padding: 1.5rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .centered-body .story-container {
      max-width: 90%;
      font-size: 1rem;
      line-height: 1.7;
    }

    .video-container {
      border-radius: 12px;
      overflow: hidden;
    }

    .video-container.full-width {
      border-radius: 0;
      overflow: visible;
      width: 100vw;
      margin-left: calc(-50vw + 50%);
      position: relative;
      left: 50%;
      transform: translateX(-50%);
    }

    .placeholder-chart {
      padding: 1rem;

      h3 {
        font-size: 1.5rem;
      }

      p {
        font-size: 0.9rem;
      }
    }
  }

  /* Tablet optimization */
  @media (max-width: 1024px) and (min-width: 769px) {
    .scrollytelling-container {
      gap: 2rem;
      padding: 0 1.5rem;
    }

    .graphic-pane {
      height: 65vh;
    }

    .step {
      padding: 2rem;
    }
  }

  /* Small mobile devices */
  @media (max-width: 480px) {
    .scrollytelling-container {
      padding: 0 0.75rem;
      gap: 0.25rem;
    }

    .graphic-pane {
      height: 40vh;
      margin-bottom: 0.5rem;
    }

    .step {
      padding: 1rem;
      margin-bottom: 45vh;
    }

    .placeholder-chart {
      padding: 0.75rem;

      h3 {
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
      }

      p {
        font-size: 0.85rem;
      }
    }
  }

  /* Large screens optimization */
  @media (min-width: 1400px) {
    .scrollytelling-container {
      max-width: 1600px;
      gap: 3rem;
    }

    .graphic-pane {
      height: 85vh;
    }
  }
</style>
