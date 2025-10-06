/**
 * Story Page Generator
 * Generates actual scrollytelling pages from parsed stories
 */

import type { ParsedStory } from '../archieml/parser';

export class StoryPageGenerator {
  /**
   * Generate a complete Svelte page for the story
   */
  generatePage(story: ParsedStory, options: { 
    mapboxToken?: string; 
    debug?: boolean; 
    includePreview?: boolean; 
  } = {}): string {
    const { mapboxToken = '', debug = false, includePreview = false } = options;

    return `<script lang="ts">
  /**
   * Generated Scrollytelling Story: ${story.meta.title}
   * ${story.meta.description || ''}
   * Generated on: ${new Date().toISOString()}
   */
  import { onMount } from 'svelte';
  import ScrollytellingEngine from '$lib/scrollytelling/ScrollytellingEngine.svelte';
  import MapboxScrolly from '$lib/scrollytelling/MapboxScrolly.svelte';
  import type { ParsedStory } from '$lib/archieml/parser';

  // Story data
  const story: ParsedStory = ${JSON.stringify(story, null, 2)};

  const mapboxToken = '${mapboxToken}' || import.meta.env.VITE_MAPBOX_TOKEN || '';
  let debugMode = ${debug};

  // Handle step transitions
  function handleStepEnter(event: CustomEvent) {
    const { index, step, direction } = event.detail;
    console.log('Step entered:', { index, step: step.id, direction });
  }

  function handleStepExit(event: CustomEvent) {
    const { index, step, direction } = event.detail;
    console.log('Step exited:', { index, step: step.id, direction });
  }

  function handleProgress(event: CustomEvent) {
    const { progress } = event.detail;
    // Could update analytics or other tracking
  }

  // Export story data for sharing
  function exportStory() {
    const blob = new Blob([JSON.stringify(story, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`\${story.meta.title.replace(/\\s+/g, '-').toLowerCase()}.json\`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<svelte:head>
  <title>{story.meta.title}</title>
  <meta name="description" content={story.meta.description || ''} />
  <meta name="author" content={story.meta.authors?.join(', ') || ''} />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content={story.meta.title} />
  <meta property="og:description" content={story.meta.description || ''} />
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content={story.meta.title} />
  <meta property="twitter:description" content={story.meta.description || ''} />
</svelte:head>

<div class="story-container">
  ${includePreview ? `
  <div class="story-controls">
    <button 
      class="debug-toggle"
      on:click={() => debugMode = !debugMode}
    >
      Debug: {debugMode ? 'ON' : 'OFF'}
    </button>
    <button class="export-btn" on:click={exportStory}>
      Export Story
    </button>
  </div>
  ` : ''}

  <ScrollytellingEngine
    steps={story.steps}
    debug={debugMode}
    on:stepenter={handleStepEnter}
    on:stepexit={handleStepExit}
    on:progress={handleProgress}
    let:currentStep
    let:currentStepIndex
    let:progress
  >
    <div slot="step" let:step let:active>
      <div class="step-content" class:active>
        {#if step.headline}
          <h2>{step.headline}</h2>
        {/if}
        {#if step.text}
          <p>{step.text}</p>
        {/if}
        {#if step.type === 'intro'}
          <div class="intro-decoration"></div>
        {/if}
        {#if step.type === 'conclusion'}
          <div class="conclusion-cta">
            <button>Learn More</button>
          </div>
        {/if}
        {#if step.media}
          <div class="media-content">
            {#if step.media.type === 'image'}
              <img src={step.media.src} alt={step.media.caption || ''} />
            {:else if step.media.type === 'video'}
              <video controls>
                <source src={step.media.src} />
              </video>
            {/if}
            {#if step.media.caption}
              <p class="media-caption">{step.media.caption}</p>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <div slot="graphic" class="graphic-container">
      {#if currentStep?.type === 'map' && mapboxToken && currentStep.map}
        <MapboxScrolly
          {mapboxToken}
          {currentStep}
          debug={debugMode}
        />
      {:else if currentStep?.type === 'chart' && currentStep.chart}
        <div class="chart-container">
          <h3>Chart: {currentStep.chart.type}</h3>
          <p>Data: {currentStep.chart.data}</p>
          <!-- Real chart component would go here -->
          <div class="chart-placeholder">
            Chart visualization would render here
          </div>
        </div>
      {:else if currentStep?.type === 'media' && currentStep.media}
        <div class="media-container">
          {#if currentStep.media.type === 'image'}
            <img src={currentStep.media.src} alt={currentStep.media.caption || ''} />
          {:else if currentStep.media.type === 'video'}
            <video controls autoplay muted>
              <source src={currentStep.media.src} />
            </video>
          {:else}
            <iframe src={currentStep.media.src} title="Embedded content"></iframe>
          {/if}
        </div>
      {:else}
        <div class="default-graphic">
          <div class="step-indicator">
            Step {Math.max(0, currentStepIndex) + 1} of {story.steps.length}
          </div>
          <div class="progress-ring">
            <svg viewBox="0 0 100 100" width="120" height="120">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e0e0e0"
                stroke-width="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#0066cc"
                stroke-width="8"
                stroke-dasharray={\`\${progress * 283} 283\`}
                stroke-dashoffset="0"
                transform="rotate(-90 50 50)"
                style="transition: stroke-dasharray 0.3s ease"
              />
            </svg>
          </div>
          {#if story.meta.title}
            <h3 class="story-title">{story.meta.title}</h3>
          {/if}
        </div>
      {/if}
    </div>
  </ScrollytellingEngine>

  <footer class="story-footer">
    <div class="story-meta">
      {#if story.meta.authors?.length}
        <p class="authors">By {story.meta.authors.join(', ')}</p>
      {/if}
      {#if story.meta.publishDate}
        <p class="publish-date">Published {story.meta.publishDate}</p>
      {/if}
    </div>
  </footer>
</div>

<style>
  .story-container {
    min-height: 100vh;
    background: ${story.theme?.colors?.background || '#fafafa'};
    color: ${story.theme?.colors?.primary || '#1a1a1a'};
    font-family: ${story.theme?.fonts?.body || 'Inter, sans-serif'};
  }

  .story-controls {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1000;
    display: flex;
    gap: 0.5rem;
  }

  .debug-toggle,
  .export-btn {
    padding: 0.5rem 1rem;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .step-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    transform: translateY(20px);
    opacity: 0;
  }

  .step-content.active {
    transform: translateY(0);
    opacity: 1;
  }

  .step-content h2 {
    margin: 0 0 1rem 0;
    font-size: 2rem;
    line-height: 1.2;
    font-family: ${story.theme?.fonts?.heading || 'Inter, sans-serif'};
  }

  .step-content p {
    margin: 0;
    font-size: 1.125rem;
    line-height: 1.6;
    color: #333;
  }

  .intro-decoration {
    margin-top: 1rem;
    height: 4px;
    width: 80px;
    background: ${story.theme?.colors?.accent || '#0066cc'};
    border-radius: 2px;
  }

  .conclusion-cta {
    margin-top: 1.5rem;
  }

  .conclusion-cta button {
    padding: 0.75rem 2rem;
    background: ${story.theme?.colors?.accent || '#0066cc'};
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .conclusion-cta button:hover {
    opacity: 0.9;
  }

  .media-content {
    margin-top: 1rem;
  }

  .media-content img,
  .media-content video {
    width: 100%;
    height: auto;
    border-radius: 4px;
  }

  .media-caption {
    font-size: 0.875rem;
    color: #666;
    margin-top: 0.5rem;
    font-style: italic;
  }

  .graphic-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chart-container,
  .media-container {
    background: white;
    padding: 3rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 90%;
    max-height: 90%;
  }

  .chart-placeholder {
    width: 100%;
    height: 300px;
    background: #f0f0f0;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1rem;
    color: #666;
  }

  .media-container img,
  .media-container video,
  .media-container iframe {
    width: 100%;
    height: auto;
    max-height: 70vh;
  }

  .default-graphic {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    text-align: center;
  }

  .step-indicator {
    font-size: 1.25rem;
    font-weight: 500;
    color: #666;
  }

  .story-title {
    font-size: 1.5rem;
    margin: 0;
    color: ${story.theme?.colors?.primary || '#1a1a1a'};
  }

  .story-footer {
    background: white;
    padding: 2rem;
    text-align: center;
    border-top: 1px solid #eee;
  }

  .story-meta p {
    margin: 0.5rem 0;
    color: #666;
    font-size: 0.875rem;
  }

  .authors {
    font-weight: 500;
  }

  /* Mobile styles */
  @media (max-width: 767px) {
    .graphic-container {
      height: 50vh;
      margin-bottom: 2rem;
    }

    .step-content h2 {
      font-size: 1.5rem;
    }

    .step-content p {
      font-size: 1rem;
    }

    .story-controls {
      position: relative;
      top: auto;
      left: auto;
      margin: 1rem;
      justify-content: center;
    }
  }
</style>`;
  }

  /**
   * Generate story URL slug
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Generate story metadata
   */
  generateMetadata(story: ParsedStory) {
    return {
      slug: this.generateSlug(story.meta.title),
      title: story.meta.title,
      description: story.meta.description,
      authors: story.meta.authors,
      publishDate: story.meta.publishDate,
      stepCount: story.steps.length,
      hasMapSteps: story.steps.some(step => step.type === 'map'),
      hasChartSteps: story.steps.some(step => step.type === 'chart'),
      hasMediaSteps: story.steps.some(step => step.type === 'media'),
      generatedAt: new Date().toISOString()
    };
  }
}
