<script lang="ts">
  import type { PageData } from './$types';
  import { scroller } from '$utils/scroll';
  import { onMount, onDestroy } from 'svelte';
  import {
    AdScripts,
    SEO,
    SiteFooter,
    EmbedPreviewerLink,
    Theme,
    SiteHeadline,
    BodyText,
    EndNotes,
  } from '@reuters-graphics/graphics-components';
  import pkg from '$pkg';
  import { dev } from '$app/environment';
  import { assets } from '$app/paths';
  import { page } from '$app/state';
  import { isReutersApp, isReutersDotcom } from '$utils/env';
  import LogBlock from '$lib/components/dev/LogBlock.svelte';

  // Import chart components
  import MarmarayStationChart from '$lib/components/charts/MarmarayStationChart.svelte';
  import TimeChart from '$lib/components/charts/TimeChart.svelte';
  import CustomHeader from '$lib/components/site/CustomHeader.svelte';
  import MapboxMap from '$lib/components/charts/MapboxMap.svelte';
  import Railroad3D from '$lib/components/charts/Railroad3D.svelte';
  import EuropeMapChart from '$lib/components/charts/EuropeMapChart.svelte';
  import { sampleEuropeanData } from '$lib/utils/csvParser';
  import CSVTimeChart from '$lib/components/charts/CSVTimeChart.svelte';
  import CSVMonthHeatmap from '$lib/components/charts/CSVMonthHeatmap.svelte';

  // Styles
  import '@reuters-graphics/graphics-components/scss/main.scss';
  import '$lib/styles/global.scss';

  let { data }: { data: PageData } = $props();
  let content = $derived(data.content);

  let currentStep = $state(0);
  let scrollerInstance: any = null;

  let scrollProgress = 0; // Fine-grained scroll progress for current step → next step
  let throttleTimer: number | null = null;
  // Track scroll direction (for upward pre-reveal)
  let lastScrollY = 0;
  let scrollingUp = false;
  // Incident dots control
  let totalDeaths = 0;
  let incidentFeatures: any = { type: 'FeatureCollection', features: [] };
  let showIncidents = false;
  let incidentRevealCount = 0;
  // Derived progress: map exit is tied to the metro-text step (step-2-metro)
  // Fallback to step 3 until the DOM provides the index.
  let metroStepIndex = -1;
  let isMetroStep = $derived(currentStep === metroStepIndex);
  let isMapExit = $derived(
    metroStepIndex >= 0 ? currentStep === metroStepIndex : currentStep === 3
  );
  // Exit progress driven by the metro text step position within viewport
  // Starts at ~75% viewport height and completes by ~25%
  let exitProgressValue = 0;
  // Smooth easing for nicer motion (smoothstep)
  let mapExitProgress = $derived(
    isMapExit ?
      exitProgressValue * exitProgressValue * (3 - 2 * exitProgressValue)
    : 0
  );
  let mapExitTransform = $derived(`translateY(-${mapExitProgress * 100}vh)`);
  let mapExitOpacity = $derived(1 - mapExitProgress);
  // When scrolling up, the metro step might be in view before it becomes the active step.
  // Use a viewport-based hint to force-show the map as soon as the metro text enters the viewport.
  let forceMapShow = false;

  // Show map strictly by step index; disable pre-reveal state
  // Hide map on video steps (3, 4, 5) to show videos instead
  // Show map for steps 0-2, 7-9, and 16 (chart step)
  let showMap = $derived(
    (metroStepIndex >= 0 ? currentStep <= metroStepIndex : currentStep <= 2) ||
      (currentStep >= 7 && currentStep <= 9) ||
      currentStep === 16
  );

  // Reactive target for map based on current step
  let mapTarget:
    | 'istanbul'
    | 'yenikapi'
    | 'ayrilikcesmesi'
    | 'atakoy'
    | 'guzelyali' = 'istanbul';

  $effect(() => {
    const newTarget =
      currentStep === 0 ? 'istanbul'
      : currentStep === 1 ? 'istanbul'
      : currentStep === 2 ?
        scrollProgress > 0.5 ?
          'yenikapi'
        : 'istanbul'
      : currentStep === 3 ? 'yenikapi'
      : currentStep === 7 ? 'ayrilikcesmesi'
      : currentStep === 8 ? 'atakoy'
      : currentStep === 9 ? 'guzelyali'
      : currentStep === 16 ?
        'istanbul' // Step 16 shows monthly chart, keep map at Istanbul
      : 'istanbul';

    if (mapTarget !== newTarget) {
      console.log('🗺️ Map target changed:', {
        from: mapTarget,
        to: newTarget,
        currentStep,
      });
      mapTarget = newTarget;
    }
  });
  // Debug HUD toggle
  let showHUD = true;

  // Keyboard shortcut to toggle HUD (press 'h')
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'h' && !event.ctrlKey && !event.metaKey) {
      showHUD = !showHUD;
      event.preventDefault();
    }
  }

  // Named stages/steps for easy reference in the sticky HUD
  const stepNamesByIndex = [
    'step-00-intro', // 0
    'step-01-metro', // 1
    'step-02-reuters', // 2
    'step-03-video', // 3 ✅ Video: Marmaray station
    'step-04-video', // 4 ✅ Video: Metro line
    'step-05-video', // 5 ✅ Video: Safety measures
    'step-06-yearly-trend', // 6 ✅ Marmaray yıllara göre trend
    'step-07-map-ayrilikcesmesi', // 7
    'step-08-map-metro', // 8
    'step-09-map-darica-guzelyali', // 9
    'step-10-video-1', // 10 ✅ Video: Marmaray main
    'step-11-video-2', // 11
    'step-12-video-3', // 12
    'step-16-monthly-analysis', // 16 ✅ Monthly analysis with chart
  ];
  const currentStepName = $derived(
    stepNamesByIndex[currentStep] ?? `step-${currentStep}`
  );

  // Calculate smooth scroll progress between steps
  function updateScrollProgress() {
    if (typeof window === 'undefined') return;

    const steps = document.querySelectorAll('.step');
    if (steps.length < 2) return;

    // Resolve metro step index each call (robust to refresh/DOM changes)
    metroStepIndex = Array.from(steps).findIndex((el) =>
      (el as HTMLElement).classList.contains('step-2-metro')
    );

    // Measure progress between the CURRENT step and the NEXT step
    const curIndex = Math.max(0, Math.min(currentStep, steps.length - 1));
    const nextIndex = Math.min(curIndex + 1, steps.length - 1);
    const firstStep = steps[curIndex] as HTMLElement;
    const secondStep = steps[nextIndex] as HTMLElement;

    const firstRect = firstStep.getBoundingClientRect();
    const secondRect = secondStep.getBoundingClientRect();
    const vh = window.innerHeight;
    const centerY = vh * 0.5;

    // Distance of the viewport center to each step top
    const total = secondRect.top - firstRect.top || 1; // avoid divide-by-zero
    const progressed = centerY - firstRect.top;

    // Smooth 0..1 between first and second step based on viewport center
    const raw = progressed / total;
    const clamped = Math.max(0, Math.min(1, raw));

    if (!Number.isNaN(clamped)) {
      scrollProgress = clamped;
    }

    // Update map exit progress specifically for the metro step.
    // Begin when the metro text top is above ~75% of viewport, finish by ~25%.
    if (isMapExit) {
      const startY = vh * 0.75; // start exiting when step top moves above 75% viewport
      const endY = vh * 0.25; // fully exited by 25%
      const top = firstRect.top;
      const rawExit = (startY - top) / Math.max(1, startY - endY);
      exitProgressValue = Math.max(0, Math.min(1, rawExit));
    } else {
      exitProgressValue = 0;
    }

    // Enhanced viewport-based map show hint: maintain consistency between scroll directions
    if (metroStepIndex >= 0) {
      const metroEl = steps[metroStepIndex] as HTMLElement;
      const r = metroEl.getBoundingClientRect();
      // consider in-view if any part intersects within 5%..95% window
      const inView = r.top < vh * 0.95 && r.bottom > vh * 0.05;

      // Enhanced logic for smooth up/down transitions:
      // When scrolling up, also check if we're approaching the metro step from below
      const approachingFromBelow = scrollingUp && r.top < vh * 1.2; // show earlier when scrolling up
      // When scrolling down, show as we approach the metro step
      const approachingFromAbove = !scrollingUp && r.bottom > vh * -0.2; // show longer when scrolling down
      // Disable: avoid sudden map appearances
      forceMapShow = false;
    }

    // Control incident reveal: only on step 1
    if (currentStep === 1) {
      showIncidents = true;
      incidentRevealCount = Math.max(
        0,
        Math.round(scrollProgress * totalDeaths)
      );
    } else {
      showIncidents = false;
      incidentRevealCount = 0;
    }
  }

  scrollerInstance = scroller({
    step: '.step',
    offset: 0.3,
    progress: (i: number) => {
      currentStep = i;
      // Debug logging for step 10
      if (i === 10) {
        console.log('🎬 STEP 10 REACHED! Video should be visible');
        console.log('Current step:', i);
        console.log('Step name:', stepNamesByIndex[i] || `step-${i}`);
        console.log(
          'showMap:',
          metroStepIndex >= 0 ? currentStep <= metroStepIndex : currentStep <= 3
        );
      }
      // Also update scroll progress when step changes
      updateScrollProgress();
    },
  });

  // Throttled scroll handler
  function throttledScrollHandler() {
    if (throttleTimer) return;
    throttleTimer = requestAnimationFrame(() => {
      if (typeof window !== 'undefined') {
        const y = window.scrollY || window.pageYOffset || 0;
        scrollingUp = y < lastScrollY;
        lastScrollY = y;
      }
      updateScrollProgress();
      throttleTimer = null;
    });
  }

  // Add scroll listener for smooth progress
  onMount(() => {
    // Initial calculation
    setTimeout(updateScrollProgress, 100); // Delay to ensure DOM is ready
    setTimeout(updateScrollProgress, 250);
    setTimeout(updateScrollProgress, 250);

    window.addEventListener('scroll', throttledScrollHandler);
    window.addEventListener('resize', updateScrollProgress);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', throttledScrollHandler);
      window.removeEventListener('resize', updateScrollProgress);
    }
    if (throttleTimer) {
      cancelAnimationFrame(throttleTimer);
    }
  });

  // Marmaray story data
  const storyData = {
    seoTitle: "Marmaray'da Son 5 Yılda 29 İntihar Vakası",
    seoDescription:
      "2021'den bu yana Marmaray hattında 29 intihar ya da intihar girişimi yaşandı. Bunların 20'si ölümle sonuçlanırken, vakalar belirli duraklarda yoğunlaştı.",
    shareTitle: "Marmaray'da Son 5 Yılda 29 İntihar Vakası",
    shareDescription:
      "İstanbul'un iki yakasını birbirine bağlayan Marmaray hattında yaşanan intihar vakalarının analizi",
    shareImgPath: 'images/reuters-graphics.jpg',
    shareImgAlt: 'Marmaray istasyonu',
    hed: "Marmaray'da Son 5 Yılda 29 İntihar Vakası",
    section: 'İstanbul',
    sectionUrl: 'https://www.reuters.com/',
    authors: ['ALİ SAFA KORKUT'],
    publishTime: new Date().toISOString(),
    updateTime: '',
    endNotes: [
      {
        title: 'Metodoloji',
        text: 'Veriler açık kaynaklardan ve resmi duyurulardan derlenmiştir.',
      },
      {
        title: 'Kaynaklar',
        text: 'Marmaray resmi X hesabı, Metro İstanbul duyuruları, basın haberleri',
      },
    ],
  };

  // Chart data for different steps
  // Marmaray yıllara göre ölümler (deaths)
  const yearlyTrendData: Array<{ time: string; count: number }> = [
    { time: '2021', count: 1 },
    { time: '2022', count: 3 },
    { time: '2023', count: 4 },
    { time: '2024', count: 9 },
    { time: '2025', count: 3 },
  ];

  // Monthly data for step 16
  const monthlyTrendData: Array<{ time: string; count: number }> = [
    { time: 'Ocak 2024', count: 1 },
    { time: 'Şubat 2024', count: 1 },
    { time: 'Mart 2024', count: 1 },
    { time: 'Nisan 2024', count: 1 },
    { time: 'Mayıs 2024', count: 2 },
    { time: 'Haziran 2024', count: 0 },
    { time: 'Temmuz 2024', count: 0 },
    { time: 'Ağustos 2024', count: 1 },
    { time: 'Eylül 2024', count: 0 },
    { time: 'Ekim 2024', count: 1 },
    { time: 'Kasım 2024', count: 3 },
    { time: 'Aralık 2024', count: 2 },
  ];
  const yearlyData = [
    { year: 2021, attempts: 2, deaths: 1 },
    { year: 2022, attempts: 3, deaths: 3 },
    { year: 2023, attempts: 7, deaths: 4 },
    { year: 2024, attempts: 13, deaths: 9 },
    { year: 2025, attempts: 4, deaths: 3 },
  ];

  const stationData = [
    { station: 'Yenikapı', deaths: 6, attempts: 8 },
    { station: 'Bostancı', deaths: 3, attempts: 5 },
    { station: 'Ayrılık Çeşmesi', deaths: 3, attempts: 4 },
    { station: 'Üsküdar', deaths: 2, attempts: 3 },
    { station: 'Ataköy', deaths: 1, attempts: 2 },
    { station: 'Güzelyalı', deaths: 1, attempts: 1 },
    { station: 'Darıca', deaths: 1, attempts: 1 },
    { station: 'Diğer', deaths: 3, attempts: 5 },
  ];

  // Metro death incidents by station (counts) with approximate placement along lines
  const metroIncidentAnchors = [
    { station: 'Yenikapı', lineId: 'M2', ratio: 0.02, count: 2 },
    { station: 'Vezneciler', lineId: 'M2', ratio: 0.12, count: 1 },
    { station: 'Taksim', lineId: 'M2', ratio: 0.33, count: 6 },
    { station: 'Mecidiyeköy/Şişli', lineId: 'M2', ratio: 0.5, count: 4 },
    { station: '4. Levent', lineId: 'M2', ratio: 0.66, count: 1 },
    { station: 'İTÜ', lineId: 'M2', ratio: 0.84, count: 1 },
    { station: 'Darüşşafaka', lineId: 'M2', ratio: 0.92, count: 1 },
    { station: 'Pazartekke', lineId: 'T1', ratio: 0.65, count: 1 },
    { station: 'Küçükpazar', lineId: 'T5', ratio: 0.1, count: 1 },
    { station: 'Terazidere', lineId: 'M1A', ratio: 0.45, count: 1 },
    { station: 'Siteler', lineId: 'M3', ratio: 0.6, count: 1 },
    { station: 'Yenimahalle', lineId: 'M3', ratio: 0.3, count: 1 },
    // { station: 'Bilinmiyor', lineId: 'M2', ratio: 0.3, count: 1 }, // intentionally omitted
  ];

  // Approximate Marmaray station coordinates (lng, lat)
  const stationCoords: Record<string, [number, number]> = {
    Yenikapı: [28.9558, 41.0082],
    Bostancı: [29.0936, 40.9715],
    'Ayrılık Çeşmesi': [29.023, 41.009],
    Üsküdar: [29.015, 41.025],
    Ataköy: [28.875, 40.982],
    Güzelyalı: [29.297, 40.848],
    Darıca: [29.393, 40.787],
  };

  function buildIncidentPoints() {
    const features: any[] = [];
    let idx = 0;
    totalDeaths = 0;
    for (const s of stationData) {
      if (s.station === 'Diğer') continue; // skip aggregate bucket
      const coord = stationCoords[s.station];
      if (!coord) continue;
      for (let i = 0; i < (s.deaths || 0); i++) {
        // radial jitter around station to separate dots (in pixels)
        const angle = (i / Math.max(1, s.deaths)) * Math.PI * 2;
        const r = 6 + (i % 3) * 2; // px
        const offset: [number, number] = [
          Math.round(Math.cos(angle) * r),
          Math.round(Math.sin(angle) * r),
        ];
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: coord },
          properties: { station: s.station, index: idx++, offset },
        });
        totalDeaths += 1;
      }
    }
    incidentFeatures = { type: 'FeatureCollection', features } as any;
  }

  buildIncidentPoints();

  const timeData = [
    { time: 'Sabah (06:00-11:59)', count: 12 },
    { time: 'Öğle (12:00-16:59)', count: 9 },
    { time: 'Akşam (17:00-20:59)', count: 5 },
    { time: 'Gece (21:00-05:59)', count: 3 },
  ];

  const dayData = [
    { day: 'Pazartesi', count: 6 },
    { day: 'Salı', count: 6 },
    { day: 'Çarşamba', count: 2 },
    { day: 'Perşembe', count: 4 },
    { day: 'Cuma', count: 2 },
    { day: 'Cumartesi', count: 9 },
    { day: 'Pazar', count: 0 },
  ];
</script>

{#if isReutersDotcom(page.url)}
  <AdScripts />
{/if}

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
  <!-- Replace Reuters header with minimal custom header -->
  <CustomHeader
    navLinks={[
      { label: 'Discover', href: '#' },
      { label: 'News', href: '#' },
      { label: 'Scrolli Media', href: '#' },
    ]}
    subscribeLink="#"
    currentLang="tr"
  />

  <!-- Step Banner in Header - Debug overlay removed -->

  <!-- 3D Railroad Model as background element for step 5 only -->
  {#if false}
    <!-- 3D background removed as requested -->
  {/if}

  <!-- Debug HUD outside container -->
  {#if showHUD}
    <div class="debug-hud">
      <div><strong>DEBUG</strong> (press 'h' to toggle)</div>
      <div>step: {currentStep}</div>
      <div>metroStepIndex: {metroStepIndex}</div>
      <div>scrollingUp: {scrollingUp ? '↑' : '↓'}</div>
      <div>forceMapShow: {forceMapShow ? 'true' : 'false'}</div>
      <div>showMap: {showMap ? 'true' : 'false'}</div>
    </div>
  {/if}

  <div class="scrollytelling-container" onkeydown={handleKeydown} tabindex="0">
    <!-- Sticky graphic pane -->
    <div class="graphic-pane">
      <!-- Step name display -->
      <div class="step-name-display">
        {currentStepName}
      </div>
      <!-- Smooth map transitions: Turkey → Istanbul → Yenikapı (always mounted) -->
      <div
        class="fullwidth-map-container"
        aria-hidden={!showMap}
        style:transform={showMap ? 'translateY(0)' : 'translateY(-100vh)'}
        style:opacity={showMap ? 1 : 0}
        style:pointer-events={showMap ? 'auto' : 'none'}
      >
        <MapboxMap
          height={1000}
          target={mapTarget}
          incidentPoints={currentStep >= 7 && currentStep <= 9 ?
            null
          : incidentFeatures}
          showIncidents={isMetroStep && showIncidents}
          {incidentRevealCount}
          showMarmarayLine={currentStep >= 7 && currentStep <= 9 ?
            true
          : !isMetroStep}
          showMetroStations={currentStep === 8 ||
            (isMetroStep && currentStep < 7)}
          showMetroLines={currentStep === 8 || (isMetroStep && currentStep < 7)}
          showMetroPulse={isMetroStep && currentStep < 7}
          pulseCount={22}
          metroAnchors={currentStep === 8 ? metroIncidentAnchors
          : isMetroStep ? metroIncidentAnchors
          : null}
          overrideZoom={currentStep === 7 ? 15.2
          : currentStep === 8 ? 17.5
          : currentStep === 9 ? 15
          : isMetroStep && scrollProgress < 0.5 ? 12
          : null}
          cinematic={currentStep === 8}
          cinematicPitch={currentStep === 8 ? 45 : 0}
          cinematicBearing={currentStep === 8 ? 20 : 0}
          enable3DBuildings={currentStep === 8}
          visible={showMap}
        />
      </div>

      {#if currentStep === 6}
        <!-- Step 6: Chart overlay (text box is in scrolling column) -->
        <div
          class="chart-only-pane"
          role="group"
          aria-label="Yıllara göre Marmaray vaka sayısı grafiği"
        >
          <TimeChart
            data={yearlyTrendData}
            title="Yıllara göre Marmaray vaka sayısı"
          />
          <div class="chart-annotations">
            <div class="badge">
              <span class="label">2023</span>
              <span class="value"
                >Ölümler: {yearlyData.find((d) => d.year === 2023)
                  ?.deaths}</span
              >
            </div>
            <div class="badge highlight">
              <span class="label">2024</span>
              <span class="value"
                >Ölümler: {yearlyData.find((d) => d.year === 2024)
                  ?.deaths}</span
              >
            </div>
          </div>
        </div>
      {/if}

      {#if currentStep === 3}
        <!-- Step 3 - Video: Marmaray station activity -->
        <div class="video-wrapper">
          <div class="video-inner">
            <video
              class="rg-video"
              autoplay
              muted
              playsinline
              loop
              preload="auto"
              style="width: 100%; height: auto; background: black;"
              onloadstart={() =>
                console.log('Video loading started for step 3')}
              oncanplay={() => console.log('Video can play for step 3')}
              onerror={(e) => console.log('Video error for step 3:', e)}
            >
              <source src="/media-assets/video/step-1.mp4" type="video/mp4" />
              <source src="/media-assets/video/step-1.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>

            <div class="volume-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value="0"
                class="volume-slider"
                oninput={(e) => {
                  const target = e.target as HTMLInputElement;
                  const video = target
                    .closest('.video-inner')
                    ?.querySelector('.rg-video') as HTMLVideoElement;
                  if (video) {
                    video.muted = target.value === '0';
                    video.volume = parseFloat(target.value);
                  }
                }}
              />
            </div>
          </div>
        </div>
      {/if}

      {#if currentStep === 4}
        <!-- Step 4 - Video: Metro line visualization -->
        <div class="video-wrapper">
          <div class="video-inner">
            <video
              class="rg-video"
              autoplay
              muted
              playsinline
              loop
              preload="metadata"
              style="width: 100%; height: auto; background: black;"
              onloadstart={() =>
                console.log('Video loading started for step 4')}
              oncanplay={() => console.log('Video can play for step 4')}
              onerror={(e) => console.log('Video error for step 4:', e)}
            >
              <source src="/media-assets/video/step-2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div class="volume-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value="0"
                class="volume-slider"
                oninput={(e) => {
                  const target = e.target as HTMLInputElement;
                  const video = target
                    .closest('.video-inner')
                    ?.querySelector('.rg-video') as HTMLVideoElement;
                  if (video) {
                    video.muted = target.value === '0';
                    video.volume = parseFloat(target.value);
                  }
                }}
              />
            </div>
          </div>
        </div>
      {/if}

      {#if currentStep === 5}
        <!-- Step 5 - Video: Safety measures and platform features -->
        <div class="video-wrapper">
          <div class="video-inner">
            <video
              class="rg-video"
              autoplay
              muted
              playsinline
              loop
              preload="metadata"
              style="width: 100%; height: auto; background: black;"
              onloadstart={() =>
                console.log('Video loading started for step 5')}
              onerror={(e) => console.log('Video error for step 5:', e)}
            >
              <source src="/media-assets/video/step-3.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div class="volume-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value="0"
                class="volume-slider"
                oninput={(e) => {
                  const target = e.target as HTMLInputElement;
                  const video = target
                    .closest('.video-inner')
                    ?.querySelector('.rg-video') as HTMLVideoElement;
                  if (video) {
                    video.muted = target.value === '0';
                    video.volume = parseFloat(target.value);
                  }
                }}
              />
            </div>
          </div>
        </div>
      {/if}

      {#if currentStep === 10}
        <!-- Step 10: Metro aylara göre vakalar (CSV tabanlı chart) -->
        {#key currentStep}
          <div
            class="chart-only-pane"
            role="group"
            aria-label="Metro aylara göre vakalar grafiği"
          >
            <div class="chart-card">
              <CSVMonthHeatmap
                csvUrl={encodeURI(
                  `${assets}/media-assets/graphics-table/metro aylara göre intihar vakaları.csv`
                )}
                title="Metro: aylara göre toplam vakalar"
                subtitle="Koyu renk daha çok vakayı gösterir"
              />
            </div>
          </div>
        {/key}
      {/if}

      {#if currentStep >= 12 && currentStep <= 15}
        <!-- Yenikapı story with map focused on Yenikapı -->
        <MapboxMap height={500} target="yenikapi" />
      {/if}

      {#if currentStep === 16}
        <!-- Step 16: Monthly analysis chart -->
        <div
          class="chart-only-pane"
          role="group"
          aria-label="Aylara göre Marmaray intihar vakaları grafiği"
        >
          <TimeChart
            data={monthlyTrendData}
            title="Aylara göre Marmaray intihar vakaları"
          />
        </div>
      {/if}

      {#if currentStep === 17}
        <MarmarayStationChart
          data={stationData}
          activeIndex={currentStep - 17}
        />
      {:else if currentStep === 18}
        <TimeChart data={timeData} title="Gün İçinde Vaka Dağılımı" />
      {:else if currentStep === 19}
        <TimeChart
          data={dayData.map((d) => ({ time: d.day, count: d.count }))}
          title="Haftanın Günlerine Göre Dağılım"
        />
      {:else if currentStep === 20}
        <div class="comparison-chart">
          <h3>Marmaray vs Metro İstasyonları</h3>
          <div class="comparison-container">
            <div class="comparison-item">
              <h4>Marmaray (2021-2025)</h4>
              <div class="stats">
                <div class="stat">
                  <span class="number">29</span>
                  <span class="label">Toplam Girişim</span>
                </div>
                <div class="stat">
                  <span class="number">20</span>
                  <span class="label">Ölüm</span>
                </div>
                <div class="stat">
                  <span class="number">%69</span>
                  <span class="label">Ölüm Oranı</span>
                </div>
              </div>
            </div>
            <div class="comparison-item">
              <h4>Metro (2016-2025)</h4>
              <div class="stats">
                <div class="stat">
                  <span class="number">22</span>
                  <span class="label">Toplam Girişim</span>
                </div>
                <div class="stat">
                  <span class="number">6</span>
                  <span class="label">Ölüm</span>
                </div>
                <div class="stat">
                  <span class="number">%27</span>
                  <span class="label">Ölüm Oranı</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Scrollable text content -->
    <div class="text-content">
      <!-- Header section with all text elements properly grouped and aligned -->
      <div class="story-header">
        <div class="headline-container">
          <SiteHeadline
            hed={storyData.hed}
            section={storyData.section}
            sectionUrl={storyData.sectionUrl}
            authors={storyData.authors}
            publishTime={storyData.publishTime}
            updateTime={storyData.updateTime}
          />
        </div>

        <div class="intro-text">
          Editör Notu: İstanbul'un iki yakasını birbirine bağlayan Marmaray
          hattı, her gün milyonlarca yolcuyu taşıyor. Ancak aynı hat, son beş
          yılda başka bir yolculuğun da sessiz bir tanığı oldu: Ölüm
          yolculuklarının. konusunu ele almakta ve yaşamlarına son vermiş
          kişilerle ilgili ayrıntılar içermektedir. Eğer intihar düşünceleri
          yaşıyorsanız veya tanıdığınız birinin bu durumda olabileceğinden
          endişe ediyorsanız, yardım kaynakları mevcuttur.
        </div>
      </div>

      <!-- Large spacer to push content down -->
      <div class="large-spacer"></div>

      <!-- Story content steps -->
      <section class="step">
        <BodyText
          text="İstanbul'un iki yakasını birbirine bağlayan Marmaray hattı, her gün milyonlarca yolcuyu taşıyor. Ancak aynı hat, son beş yılda başka bir yolculuğun da sessiz bir tanığı oldu: Ölüm yolculuklarının."
        />
      </section>

      <section class="step step-2-metro">
        <BodyText
          text="Metro istasyonlarında da durum farklı değil. 2016'dan beri çeşitli metro istasyonlarda 22 intihar girişimi yaşandı. Veriler, intihar vakalarının her yıl katlanarak arttığını gösterirken vakaların genellikle sabah saatlerinde yaşandığına işaret ediyor."
        />
      </section>

      <!-- Reuters-like plain text block following the map -->
      <section class="step reuters-text-block">
        <div class="reuters-text-inner">
          <p>
            İstanbul'un raylı sistemlerinde yaşanan bu vakalar, yalnızca sayısal
            bir artış değil; aynı zamanda toplumsal, ekonomik ve psikolojik
            dinamiklerin bir bileşkesi. Sabah saatlerindeki yoğunluk ve aktarma
            merkezlerinde toplanan akış, olayların görünürlüğünü ve etkisini
            artırıyor.
          </p>
          <p>
            Ancak veriler, doğru müdahale ve altyapı yatırımlarıyla bu
            trajedilerin azaltılabileceğini gösteriyor. Platform ekran kapıları,
            kriz müdahale ekipleri ve erken uyarı sistemleri — dünyanın birçok
            kentinde etkili sonuçlar üretiyor.
          </p>
        </div>
      </section>

      <!-- Video narrative text steps with white styling -->
      <section class="step video-sequence-step video-1">
        <div class="video-narrative-text">
          <h3>Marmaray İstasyonu</h3>
          <p>
            Tarih, 30 Ekim 2021. Soğuk bir sonbahar akşamı, saat 18.18.
            Marmaray, her zamanki Halkalı-Gebze seferini yapmak üzere raylarda
            ilerliyordu. Ancak o gün her zamanki rutinini yapan sadece o
            değildi. Bir yurttaş da yorucu bir günün ardından iş çıkış saatinde,
            evine gitmek üzere Marmaray Bostancı istasyonuna doğru yürüyordu.
          </p>
        </div>
      </section>

      <section class="step video-sequence-step video-2">
        <div class="video-narrative-text">
          <h3>Metro Hatları</h3>
          <p>
            Marmaray treni Suadiye istasyonundan ayrıldığı sırada o yurttaş da
            Bostancı istasyonundaki turnikelere İstanbulkartı'nı okutup perona
            doğru ilerlemeye başladı. Yaklaşık bir dakikalık bekleyişin ardından
            trenin ışıkları göründü. Hızla yaklaşan treni gören yurttaş, sakin
            adımlarla sarı çizgiye doğru ilermeye başladı.
          </p>
        </div>
      </section>

      <section class="step video-sequence-step video-3">
        <div class="video-narrative-text">
          <h3>Güvenlik Önlemleri</h3>
          <p>
            Tren tam yavaşlamaya başlayacaktı ki, peronun en ucunda, trenle
            peronun kesiştiği noktada bekleyen yurttaş, trenin hız kaybetmesine
            fırsat vermeden attı kendini raylara doğru. Önce trene çarptı,
            ardından da çarpmanın etkisiyle ileri savrularak trenin altında
            kaldı.
          </p>
        </div>
      </section>

      <!-- Scrolling text box for yearly trend (Step 6) -->
      <section class="step yearly-trend-text">
        <div class="video-narrative-text">
          <h3>İntihar vakaları katlanarak artıyor</h3>
          <p>
            2023'te de intihar girişimi sayısı 2022'ye kıyasla iki kattan fazla
            artarak yediye çıktı. Bu girişimlerin dördü başarıya(!) ulaştı ve
            intihara kalkışanlar yaşamını yitirdi. Üçünün akıbeti hakkında ise
            bir açıklama yapılmadı.
          </p>
          <p>
            Tarihler 2024'ü gösterdiğindeyse intihar girişimi sayısı bir önceki
            yıla kıyasla yine yaklaşık iki kat arttı. O yıl toplam 13 intihar
            girişimi yaşandı ve bu girişimlerin dokuzu ölümle sonuçlandı. Üç
            kişi ağır yaralanırken, bir kişinin durumu hakkında ise bir bilgi
            paylaşılmadı.
          </p>
        </div>
      </section>

      <!-- Step 7: Yenikapı map focus -->
      <section class="step step-7-text">
        <div class="video-narrative-text">
          <h3>30 Mart – Ayrılık Çeşmesi</h3>
          <p>
            30 Mart’ta Ayrılık Çeşmesi istasyonunda yaşanan vakada intihara
            kalkışan kişinin akıbeti bilinmiyor.
          </p>
        </div>
      </section>

      <!-- Step 8: Metro map focus -->
      <section class="step step-8-text">
        <div class="video-narrative-text">
          <h3>23 Haziran – Ataköy</h3>
          <p>
            23 Haziran’da Ataköy istasyonunda yaşanan vaka ölümle sonuçlandı.
          </p>
        </div>
      </section>

      <!-- Step 9: Darıca & Güzelyalı map focus -->
      <section class="step step-9-text">
        <div class="video-narrative-text">
          <h3>9 Ağustos – Güzelyalı ve Darıca</h3>
          <p>
            9 Ağustos’ta Güzelyalı ve Darıca duraklarında benzer vakalar meydana
            geldi.
          </p>
        </div>
      </section>

      <!-- Step 16: Monthly analysis -->
      <section class="step step-16-monthly">
        <div class="video-narrative-text">
          <h3>2024'te neredeyse her ay bir intihar vakası yaşandı</h3>
          <p>
            İntihar vakalarının aylara göre dağılımındaysa 2024 yılı öne çıktı.
            Zira 2024'te, özellikle yılın ilk beş ayında düzenli olarak her ay
            en az bir intihar vakası yaşandı. Yıl genelinde 12 ayın dokuzu
            intihar girişimlerine sahne olurken; sadece Haziran, Temmuz ve Eylül
            ayları herhangi bir intihar vakasının yaşanmadığı aylar oldu.
          </p>
          <p>
            Mayıs ve Aralık, hem devamındaki yıllarda da tekrar etmeleri hem de
            vaka sayıları bakımından en fazla intihar vakasının yaşandığı aylar
            olarak öne çıktı.
          </p>
          <p>
            2023 ve 2024'ün Mayıs aylarında toplamda dört vaka yaşanırken, 2023
            Mayıs'ındaki her iki intihar girişimi de ölümle sonuçlandı. 2024
            Mayıs'ta ise bir vaka ölümle son buldu, diğeri ağır yaralanmayla
            bitti.
          </p>
        </div>
      </section>
    </div>
  </div>

  <!-- Text boxes now appear in graphic-pane for steps 3, 4, 5 -->
  <!-- Videos moved to step 10 only -->
</Theme>

<style lang="scss">
  /* Story header layout - clean and focused */
  .story-header {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 100%;
    margin-bottom: 5rem;
    padding: 3rem 0;
    /* Debug borders removed */
  }

  .istanbul-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 1rem;
    text-align: right;
  }

  .headline-container {
    width: 100%;
    text-align: right;
    margin-bottom: 1.5rem;
    /* Debug borders removed */
  }

  .intro-text {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #333;
    text-align: right !important;
    max-width: 600px;
    margin-left: auto;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* Force override for intro-text */
  .story-header .intro-text {
    text-align: right !important;
  }

  /* Even more specific override */
  .story-header .intro-text,
  .story-header .intro-text * {
    text-align: right !important;
  }

  /* Above the fold content styling */
  .above-fold-content {
    margin-top: 3rem;
    margin-bottom: 2rem;
    padding: 2rem;
    background: rgba(248, 249, 250, 0.8);
    border-radius: 12px;
    border: 1px solid rgba(222, 226, 230, 0.5);
    max-width: 600px;
    margin-left: auto;
  }

  .above-fold-text {
    font-size: 1.2rem;
    line-height: 1.7;
    color: #1a1a1a;
    text-align: right !important;
    margin: 0;
    font-weight: 400;
  }

  /* Large spacer to push content down */
  .large-spacer {
    height: 100vh;
    min-height: 100vh;
    width: 100%;
    /* Pushes the Marmaray text box much further down */
  }

  /* Ensure all text content is right-aligned */
  .text-content {
    text-align: right;
  }

  .text-content :global(.body-text) {
    text-align: right;
  }

  /* Force SiteHeadline component to be right-aligned */
  .headline-container :global(*) {
    text-align: right !important;
    text-align-last: right !important;
  }

  /* Force all elements in the story header to be right-aligned */
  .story-header :global(*) {
    text-align: right !important;
    text-align-last: right !important;
  }

  /* Override any auto-margin classes that center content */
  .story-header :global(.fmx-auto),
  .story-header :global([class*='fmx-auto']),
  .story-header :global([class*='mx-auto']),
  .story-header :global([class*='margin-auto']),
  .story-header :global(.article-block),
  .story-header :global(.headline-container) {
    margin-left: 0 !important;
    margin-right: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: none !important;
  }

  /* Force the SiteHeadline component to take full width */
  .headline-container :global(.article-block),
  .headline-container :global(.fmx-auto),
  .headline-container :global([class*='fmx-auto']) {
    margin-left: 0 !important;
    margin-right: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: none !important;
  }

  /* Specific overrides for common elements */
  .story-header :global(h1),
  .story-header :global(h2),
  .story-header :global(h3),
  .story-header :global(h4),
  .story-header :global(h5),
  .story-header :global(h6),
  .story-header :global(p),
  .story-header :global(div),
  .story-header :global(span),
  .story-header :global(a) {
    text-align: right !important;
    text-align-last: right !important;
  }

  .scrollytelling-container {
    width: 100%;
    margin: 0;
    padding: 0;
    position: relative;
    z-index: 10;
  }

  /* Debug HUD */
  .debug-hud {
    position: fixed !important;
    top: 80px !important;
    right: 8px !important;
    background: rgba(0, 0, 0, 0.95) !important;
    color: #fff !important;
    padding: 16px 20px !important;
    border-radius: 12px !important;
    font-size: 13px !important;
    line-height: 1.5 !important;
    z-index: 999999 !important;
    pointer-events: none !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    backdrop-filter: blur(8px) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
    max-width: 280px !important;
  }

  /* Flow-based layout - no grid, no sticky positioning */
  .text-content {
    width: 100%;
    position: relative;
    padding: 0;
    margin: 0;
  }

  /* Add proper spacing between text steps */
  .step {
    margin-bottom: 100vh;
    padding: 3rem 0;
  }

  .step-2-metro {
    margin-bottom: 100vh;
  }

  .step-3-centered-text {
    margin-bottom: 100vh;
  }

  /* Graphic pane becomes a regular block element */
  .graphic-pane {
    width: 100%;
    position: relative;
    margin-bottom: 100vh; /* Much more space for scrollytelling steps */
  }

  .graphic-pane {
    position: fixed;
    top: 6rem;
    height: 85vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border-radius: 0;
    overflow: visible;
    box-shadow: none;
    transition: all 0.3s ease;
    z-index: 10;
  }

  /* Step name display */
  .step-name-display {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-family: monospace;
    z-index: 100;
    pointer-events: none;
  }

  /* Fullscreen map container - no cropping, full viewport coverage */
  .fullwidth-map-container {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    margin: 0;
    border-radius: 0;
    overflow: visible;
    z-index: 5;
  }

  /* Ensure full viewport background coverage */
  .fullwidth-map-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: transparent;
    z-index: -1;
  }

  /* Ensure map is properly sized and centered */
  .fullwidth-map-container :global(.turkey-map) {
    width: 100% !important;
    height: 100% !important;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem;
  }

  .fullwidth-map-container :global(svg) {
    max-width: 50% !important;
    max-height: 50% !important;
    width: auto !important;
    height: auto !important;
  }

  /* Animated Metro Line */
  .animated-metro-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  /* Metro line animation */
  @keyframes metroMove {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: -30;
    }
  }

  /* Metro dot animation */
  @keyframes metroDot {
    0% {
      transform: translateX(0) translateY(0);
    }
    25% {
      transform: translateX(200px) translateY(-50px);
    }
    50% {
      transform: translateX(400px) translateY(-20px);
    }
    75% {
      transform: translateX(600px) translateY(-40px);
    }
    100% {
      transform: translateX(800px) translateY(0);
    }
  }

  /* Ensure the map itself takes full container space */
  .fullwidth-map-container :global(svg) {
    width: 100% !important;
    height: 100% !important;
    max-width: none !important;
    max-height: none !important;
  }

  .fullwidth-map-container :global(.map-container) {
    width: 100% !important;
    height: 100% !important;
    max-width: none !important;
    max-height: none !important;
  }

  /* Title and Editor's Note Container */
  .title-editor-note-container {
    display: flex;
    flex-direction: column;
    align-items: stretch; /* children take container width */
    gap: 0.75rem;
    margin: 0 auto 2rem auto; /* center the whole block */
    width: fit-content; /* shrink to headline width */
    max-width: 100%;
    text-align: right !important;

    /* Force SiteHeadline to be right-aligned */
    :global(.site-headline) {
      text-align: right !important;
      width: 100%;
    }

    :global(.site-headline h1) {
      text-align: right !important;
    }

    :global(.site-headline .hed) {
      text-align: right !important;
    }

    :global(.site-headline .section) {
      text-align: right !important;
    }

    :global(.site-headline .authors) {
      text-align: right !important;
    }

    :global(.site-headline .publish-time) {
      text-align: right !important;
    }
  }

  /* Fullscreen map for steps 1 and 2 */
  .graphic-pane.fullscreen-map {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 5;
    background: transparent;
  }

  /* Fullscreen video pane (under the text column, same layer as map) */
  .fullscreen-video-pane {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 4; /* just under debug overlay; same layer as map */
    transition: opacity 300ms ease;
    background: #000;
    pointer-events: none;
  }

  .fullscreen-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Reuters-like plain text block after the map */
  .reuters-text-block {
    background: none !important;
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 auto 8rem auto !important;
    text-align: center !important;
    width: 100% !important;
    max-width: none !important;
    min-height: 80vh;
  }

  .reuters-text-inner {
    /* Constrain width and nudge slightly to the right without overflowing */
    max-width: 680px;
    width: min(680px, 92vw);
    margin: 0 auto;
    transform: translateX(150px);
    font-family:
      'Georgia', 'Times New Roman', serif; /* Reuters-style serif font */
    font-size: 1.1rem; /* Slightly larger for better readability */
    line-height: 1.8; /* Enhanced line spacing */
    color: #1a1a1a;
    text-align: center !important;
    direction: ltr;
    padding: 2rem; /* Add padding for better spacing */
  }

  /* Force child elements to center align within the Reuters block */
  .reuters-text-block .reuters-text-inner *,
  .reuters-text-block .reuters-text-inner p,
  .reuters-text-block .reuters-text-inner div {
    text-align: center !important;
  }

  /* Enhanced paragraph styling for Reuters look */
  .reuters-text-block .reuters-text-inner p {
    margin-bottom: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.01em;
    text-rendering: optimizeLegibility;
  }

  .reuters-text-block .reuters-text-inner p:last-child {
    margin-bottom: 0;
  }

  /* Fullscreen video wrapper */
  .fullscreen-video-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    z-index: 20; /* ensure above maps/graphics */
  }

  .fullscreen-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #000;
    z-index: 21;
  }

  /* Debug HUD */
  .sticky-hud {
    position: fixed;
    top: 0.5rem;
    left: 0.5rem;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
  }

  /* Viewport-fixed video layer kept below header; header remains interactable */
  .video-viewport {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 5; /* lower than header/sticky UI */
    background: #000;
  }

  /* Completely hide video controls */
  .fullscreen-video::-webkit-media-controls {
    display: none !important;
  }

  .fullscreen-video::-webkit-media-controls-panel {
    display: none !important;
  }

  .fullscreen-video::-webkit-media-controls-play-button {
    display: none !important;
  }

  .fullscreen-video::-webkit-media-controls-start-playback-button {
    display: none !important;
  }

  .video-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
    border-radius: 16px;
    z-index: 1000;
  }

  /* Inner box wraps the rendered video size so overlays align exactly */
  .video-inner {
    position: relative;
    display: inline-block;
    width: 60%;
    max-width: 800px;
    max-height: 85%;
    z-index: 1001;
  }

  .rg-video {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 0;
    box-shadow: none;
  }

  .video-controls {
    position: absolute;
    right: 0.75rem;
    bottom: 0.75rem;
    display: flex;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.5);
    padding: 0.35rem 0.45rem;
    border-radius: 999px;
    backdrop-filter: blur(2px);
    z-index: 7;
    pointer-events: auto;
  }

  .control-btn {
    appearance: none;
    border: 0;
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    transition: background 0.2s ease;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .video-caption {
    position: absolute;
    left: 1rem;
    bottom: 1rem;
    background: transparent;
    color: #fff !important;
    padding: 0.25rem 0.5rem;
    border-radius: 0;
    max-width: 80%;
    z-index: 6; /* above controls */
    pointer-events: none; /* avoid capturing clicks */
    backdrop-filter: none;

    h2 {
      margin: 0 0 0.25rem 0;
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #fff !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
    }

    p {
      margin: 0;
      font-size: 1rem;
      opacity: 1;
      color: #fff !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
      line-height: 1.4;
    }
  }

  /* Volume control styling */
  .volume-control {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    background: rgba(0, 0, 0, 0.7);
    padding: 0.5rem;
    border-radius: 8px;
    backdrop-filter: blur(8px);
    z-index: 7;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: auto;
  }

  .video-inner:hover .volume-control {
    opacity: 1;
  }

  .volume-slider {
    width: 80px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .volume-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .text-content {
    padding: 0; /* remove extra padding/gutter to avoid offset */
    text-align: right;
    /* Ensure text content doesn't overlap with graphic */
    position: relative;
    z-index: 20;
    min-height: 100vh;

    /* Natural text alignment */
    :global(*) {
      text-align: left !important;
    }

    /* SiteHeadline alignment */
    :global(.site-headline) {
      text-align: left !important;
    }

    :global(.site-headline h1) {
      text-align: left !important;
    }

    :global(.site-headline .hed) {
      text-align: left !important;
    }

    /* BodyText components alignment */
    :global(.body-text) {
      text-align: left !important;
    }

    :global(.body-text p) {
      text-align: left !important;
    }

    /* Headings alignment */
    :global(h1),
    :global(h2),
    :global(h3),
    :global(h4),
    :global(h5),
    :global(h6) {
      text-align: left !important;
    }

    /* Paragraphs alignment */
    :global(p) {
      text-align: left !important;
    }

    /* Divs alignment */
    :global(div) {
      text-align: left !important;
    }
  }

  /* Global override for all text alignment */
  :global(.text-content *) {
    text-align: right !important;
  }

  :global(.text-content h1),
  :global(.text-content h2),
  :global(.text-content h3),
  :global(.text-content h4),
  :global(.text-content h5),
  :global(.text-content h6),
  :global(.text-content p),
  :global(.text-content div),
  :global(.text-content span) {
    text-align: right !important;
  }

  /* OVERRIDE: Center the Reuters plain text block within .text-content */
  :global(.text-content .reuters-text-block),
  :global(.text-content .reuters-text-block *),
  :global(.text-content .reuters-text-block .reuters-text-inner),
  :global(.text-content .reuters-text-block .reuters-text-inner *) {
    text-align: center !important;
  }

  /* Ensure the Reuters block is horizontally centered despite generic .step rules */
  .reuters-text-block {
    /* Full-row container that never exceeds viewport */
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box;
    overflow-x: hidden;
    /* Robust centering independent of margins */
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  /* Specific override for Reuters graphics components */
  :global(.site-headline),
  :global(.site-headline *),
  :global(.body-text),
  :global(.body-text *) {
    text-align: right !important;
  }

  /* Clean step-by-step layout */
  .step {
    margin-bottom: 100vh; /* Much more space for proper scrollytelling */
    padding: 2.5rem 3rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    max-width: 600px;
    margin-left: auto;
    margin-right: 0; /* align to the right */
    text-align: left;
    position: relative;

    /* Clean text styling */
    :global(.body-text) {
      color: #1a1a1a !important;
      text-shadow: none;
      text-align: left !important;
      max-width: none !important;
      width: 100% !important;
      background: transparent !important;
      backdrop-filter: none !important;
      padding: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      border: none !important;
    }

    :global(.body-text p) {
      color: #1a1a1a !important;
      font-weight: 400;
      line-height: 1.7;
      font-size: 1.1rem;
      text-shadow: none;
      text-align: left !important;
      max-width: none !important;
      width: 100% !important;
      margin-bottom: 1.5rem !important;
    }

    :global(.body-text p:last-child) {
      margin-bottom: 0 !important;
    }
  }

  /* Remove card look for any step using textbox-only */
  .textbox-step {
    background: none !important;
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    max-width: none !important;
  }

  /* Remove outer card look for yearly trend scrolling step */
  .yearly-trend-text {
    background: none !important;
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    max-width: none !important;
  }

  /* Remove outer card/shadow for 7.x text steps to avoid double-box look */
  .step-7-text,
  .step-8-text,
  .step-9-text,
  .step-16-monthly {
    background: none !important;
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    max-width: none !important;
  }

  /* Slightly reduce opacity to match desired look */
  .yearly-trend-text .video-narrative-text {
    background: rgba(255, 255, 255, 0.9);
  }

  /* Simple flow-based positioning */
  .text-content .step {
    position: relative;
    width: 100%;
  }

  /* Reuters-style step 0 styling */
  .step-0-reuters {
    background: none !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
    border: none !important;
    padding: 2rem 0 !important;
    margin: 0 0 4rem 0 !important; /* tighter gap under headline */
    width: 100%;
    max-width: none !important; /* allow full width for headline */
  }

  .reuters-intro-text {
    font-family: 'Georgia', serif;
    font-size: 18px;
    line-height: 1.6;
    color: #1a1a1a;
    margin: 0;
    padding: 0;
    text-align: right;
    font-weight: 400;
    max-width: 600px;
  }

  .warning-visual-nyt {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }

  // Yearly chart styles
  .yearly-chart {
    width: 100%;

    h3 {
      text-align: center;
      margin-bottom: 3.75rem; /* more space to avoid any overlap */
      color: #333;
      font-size: 1.8rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.3;
    }

    .chart-container {
      display: flex;
      justify-content: space-around;
      align-items: end;
      height: 220px;
      padding: 1rem 1rem 0 1rem; /* top padding to keep bars clear of title */
      margin-top: 0.5rem;
      margin-bottom: 2rem;
    }

    .bar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;

      .bar {
        width: 30px;
        border-radius: 6px 6px 0 0;
        animation: growBar 1s ease-out forwards;
        opacity: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .label {
        font-weight: 600;
        color: #333;
        font-size: 0.95rem;
        margin-top: 0.5rem;
      }
    }

    .legend {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 2rem;
      padding: 1.5rem;
      background: rgba(248, 250, 252, 0.8);
      border-radius: 12px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        font-weight: 500;

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

          &.deaths {
            background: #d32f2f;
          }
          &.attempts {
            background: #ff9800;
          }
        }
      }
    }
  }

  @keyframes growBar {
    from {
      height: 0;
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  // Comparison chart styles
  .comparison-chart {
    width: 100%;

    h3 {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
      font-size: 1.8rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .comparison-container {
      display: flex;
      gap: 2rem;
      margin-top: 2rem;

      .comparison-item {
        flex: 1;
        padding: 0;
        background: transparent;
        border-radius: 0;
        box-shadow: none;
        border: 0;
        transition: all 0.3s ease;

        &:hover {
          transform: none;
          box-shadow: none;
        }

        h4 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #333;
          font-size: 1.2rem;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;

          .stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;

            .number {
              font-size: 2rem;
              font-weight: 700;
              color: #d32f2f;
              line-height: 1;
              margin-bottom: 0.25rem;
            }

            .label {
              font-size: 0.9rem;
              color: #666;
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  // Conclusion visual styles
  .conclusion-visual {
    width: 100%;

    .solution-cards {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .solution-card {
        padding: 0;
        background: transparent;
        border-radius: 0;
        box-shadow: none;
        border-left: 0;
        border: 0;
        transition: all 0.3s ease;

        &:hover {
          transform: none;
          box-shadow: none;
        }

        h4 {
          color: #4caf50;
          margin-bottom: 0.5rem;
          font-size: 1.3rem;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        p {
          color: #666;
          margin: 0;
          line-height: 1.5;
          font-size: 0.95rem;
        }
      }
    }
  }

  /* Enhanced mobile responsiveness */
  @media (max-width: 768px) {
    .scrollytelling-container {
      grid-template-columns: 1fr;
      gap: 0.5rem;
      padding: 0 1rem;
      max-width: 100%;
    }

    .graphic-pane {
      position: right;
      height: 50vh;
      top: 0;
      margin-bottom: 1rem;
      border-radius: 12px;
      overflow: hidden;
    }

    /* Mobile step name display */
    .step-name-display {
      top: 0.5rem;
      left: 0.5rem;
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
    }

    /* Mobile fullscreen map container */
    .fullwidth-map-container {
      width: 100vw;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      overflow: visible;
    }

    /* Mobile full viewport background coverage */
    .fullwidth-map-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #f8f9fa;
      z-index: -1;
    }

    /* Mobile map sizing */
    .fullwidth-map-container :global(svg) {
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
    }

    .fullwidth-map-container :global(.map-container) {
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
    }

    /* Mobile Title and Editor's Note Container */
    .title-editor-note-container {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
      margin-bottom: 1rem;
      width: 100%;
    }

    /* Fullscreen map adjustments for mobile */
    .graphic-pane.fullscreen-map {
      position: relative;
      width: 100%;
      height: 40vh;
      top: 0;
      left: 0;
      z-index: 1;
    }

    .text-content {
      padding: 1rem 0;
      position: relative;
      z-index: 20;
      text-align: right !important;

      /* Force all text elements to be right-aligned on mobile */
      :global(*) {
        text-align: right !important;
      }

      /* Force SiteHeadline to be right-aligned */
      :global(.site-headline) {
        text-align: right !important;
      }

      :global(.site-headline h1) {
        text-align: right !important;
      }

      :global(.site-headline .hed) {
        text-align: right !important;
      }

      /* Force BodyText components to be right-aligned */
      :global(.body-text) {
        text-align: right !important;
      }

      :global(.body-text p) {
        text-align: right !important;
      }

      /* Force all headings to be right-aligned */
      :global(h1),
      :global(h2),
      :global(h3),
      :global(h4),
      :global(h5),
      :global(h6) {
        text-align: right !important;
      }

      /* Force all paragraphs to be right-aligned */
      :global(p) {
        text-align: right !important;
      }

      /* Force all divs to be right-aligned */
      :global(div) {
        text-align: right !important;
      }
    }

    .text-content .step {
      margin-bottom: 15rem; /* Much more space on mobile for scrollytelling */
      padding: 2rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      width: 90%;
      max-width: 500px;
      margin-left: auto;
      margin-right: 0;
      text-align: left;
    }

    /* Enhanced mobile text readability for fullscreen steps */
    .step:nth-child(3),
    .step:nth-child(4),
    .step:nth-child(8) {
      :global(.body-text) {
        background: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(15px);
        padding: 1.5rem;
        border-radius: 12px;
        margin: 1rem 0;
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
    }

    .comparison-container {
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Infrastructure Diagram */
    .infrastructure-diagram {
      padding: 2rem;
      text-align: center;

      h3 {
        color: #333;
        margin-bottom: 2rem;
        font-size: 1.5rem;
      }

      .diagram-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        align-items: center;
      }

      .tunnel-section {
        .tunnel-visual {
          width: 200px;
          height: 60px;
          background: linear-gradient(
            90deg,
            #e2e8f0 0%,
            #64748b 50%,
            #e2e8f0 100%
          );
          border-radius: 30px;
          margin: 0 auto 1rem;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 180px;
            height: 40px;
            background: #1e293b;
            border-radius: 20px;
          }
        }

        p {
          color: #64748b;
          font-weight: 500;
        }
      }

      .stats-section {
        display: flex;
        gap: 2rem;

        .stat {
          text-align: center;

          .number {
            display: block;
            font-size: 2rem;
            font-weight: bold;
            color: #1e293b;
          }

          .label {
            font-size: 0.9rem;
            color: #64748b;
          }
        }
      }
    }

    /* Simple centered body text */
    .step-4-body-text,
    .centered-body-step {
      text-align: center !important;
      background: rgba(255, 255, 255, 0.98) !important;
      padding: 2rem !important;
      margin: 8rem auto 12rem auto !important; /* Much more spacing for scrollytelling */
      max-width: 600px !important;
    }

    .step-4-body-text :global(.body-text),
    .centered-body-step :global(.body-text) {
      text-align: center !important;
    }

    .step-4-body-text :global(.body-text p),
    .centered-body-step :global(.body-text p) {
      text-align: center !important;
      font-size: 1.2rem !important;
      line-height: 1.8 !important;
    }

    .fullscreen-body-text {
      width: 100%;
      padding: 0;
    }

    .centered-body-content {
      max-width: 760px;
      margin: 0 auto;
    }

    /* Centered Body Text for Step 4 */
    .centered-body-text {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100vw;
      min-height: 50vh; /* don't force full viewport height */
      position: relative;
      z-index: 15;
      text-align: center;

      .centered-content {
        max-width: 800px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(15px);
        padding: 3rem;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.4);

        :global(.body-text) {
          margin-bottom: 2rem;
          text-align: center !important;
        }

        :global(.body-text p) {
          color: #1a1a1a !important;
          font-weight: 500;
          line-height: 1.6;
          font-size: 1.1rem;
          text-align: center !important;
        }

        :global(.body-text:last-child) {
          margin-bottom: 0;
        }
      }
    }

    /* Flat, centered variant for generic use */
    .flat-body {
      grid-column: 1 / -1;
      width: 100vw;
      margin: 20vh calc(50% - 50vw);
      background: transparent;
      border: 0;
      box-shadow: none;
      padding: 0;
    }

    /* System Analysis */
    .system-analysis {
      padding: 2rem;
      text-align: center;

      h3 {
        color: #333;
        margin-bottom: 2rem;
        font-size: 1.5rem;
      }

      .analysis-content {
        display: flex;
        justify-content: space-around;
        gap: 2rem;
        flex-wrap: wrap;
      }

      .metric {
        text-align: center;

        .metric-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #dc2626, #ef4444);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);

          .metric-number {
            color: white;
            font-size: 1.5rem;
            font-weight: bold;
          }
        }

        p {
          color: #64748b;
          font-weight: 500;
          font-size: 0.9rem;
        }
      }
    }

    /* Invisible step to drive scroll for centered narrative (Step 5) */
    .step-5-driver {
      height: 70vh !important; /* spacing and trigger */
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
    }

    /* Invisible driver for yearly trend (Step 6) */
    .step-6-driver {
      height: 70vh !important;
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
    }

    /* Mobile video wrapper adjustments */
    .video-inner {
      width: 95%;
      max-width: none;
    }

    .video-controls {
      right: 0.5rem;
      bottom: 0.5rem;
      padding: 0.25rem 0.35rem;
    }

    .control-btn {
      width: 36px;
      height: 36px;
    }

    .video-caption {
      left: 0.75rem;
      bottom: 0.75rem;
      max-width: 70%;

      h2 {
        font-size: 1rem;
      }

      p {
        font-size: 0.85rem;
      }
    }

    .volume-control {
      right: 0.75rem;
      bottom: 0.75rem;
      padding: 0.4rem;
    }

    .volume-slider {
      width: 60px;
    }
  }

  /* Extra small screens */
  @media (max-width: 480px) {
    .scrollytelling-container {
      padding: 0 0.75rem;
      gap: 0.25rem;
    }

    .graphic-pane {
      height: 45vh;
      margin-bottom: 0.5rem;
    }

    .step:not(.step-4-body-text):not(.centered-body-step) {
      margin-bottom: 100vh; /* extra space on small screens */
      padding: 1.5rem;
    }

    .text-content {
      padding: 0.5rem 0;
    }

    /* Improve touch targets on mobile */
    .control-btn {
      width: 40px;
      height: 40px;
      font-size: 16px;
    }

    .video-caption {
      left: 0.5rem;
      bottom: 0.5rem;
      max-width: 65%;

      h2 {
        font-size: 0.9rem;
      }

      p {
        font-size: 0.8rem;
      }
    }
  }

  /* Large screens optimization */
  @media (min-width: 1400px) {
    .scrollytelling-container {
      max-width: 1600px;
      gap: 5rem;
    }

    .graphic-pane {
      height: 90vh;
    }
  }

  /* (removed) section divider styles */

  /* Chart-only pane inside sticky graphic area */
  .chart-only-pane {
    width: min(50vw, 700px);
    margin-left: 2vw;
    margin-right: auto; /* anchor to left */
    background: none;
    padding: 0;
  }

  /* Prevent overlap on medium screens */
  @media (max-width: 1200px) {
    .chart-only-pane {
      width: min(58vw, 680px);
      margin-left: 2vw;
    }
  }

  @media (max-width: 900px) {
    .chart-only-pane {
      width: min(92vw, 700px);
      margin: 0 auto;
    }
  }

  /* Text box styling - matching video wrapper appearance */
  .text-box-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
    border-radius: 16px;
    z-index: 1000;
  }

  .text-box-inner {
    position: relative;
    display: inline-block;
    width: 60%;
    max-width: 800px;
    max-height: 85%;
    z-index: 1001;
    background: rgba(0, 0, 0, 0.9);
    border-radius: 16px;
    padding: 2rem;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .narrative-text {
    color: #fff;
    text-align: left;

    h3 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
    }

    p {
      margin: 0;
      font-size: 1.1rem;
      line-height: 1.7;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
      font-weight: 400;
    }
  }

  /* Mobile responsive text box adjustments */
  @media (max-width: 768px) {
    .text-box-inner {
      width: 95%;
      max-width: none;
      padding: 1.5rem;
    }

    .narrative-text {
      h3 {
        font-size: 1.3rem;
        margin-bottom: 0.75rem;
      }

      p {
        font-size: 1rem;
        line-height: 1.6;
      }
    }
  }

  @media (max-width: 480px) {
    .text-box-inner {
      width: 95%;
      padding: 1rem;
    }

    .narrative-text {
      h3 {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
      }

      p {
        font-size: 0.95rem;
        line-height: 1.5;
      }
    }
  }
</style>
