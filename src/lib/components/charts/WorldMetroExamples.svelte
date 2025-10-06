<!--
  World Metro Examples Component
  Displays interactive metro safety examples from Tokyo, London, Seoul, and Paris
  Shows different approaches to suicide prevention in metro systems
-->

<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  export let width = 800;
  export let height = 600;
  export let animationProgress = 0;
  export let currentStep = 'step-18.1';

  let svg: SVGSVGElement;
  let container: HTMLDivElement;

  // World metro examples data
  const metroExamples = [
    {
      id: 'tokyo',
      name: 'Tokyo',
      country: 'Japonya',
      color: '#e74c3c',
      x: 150,
      y: 150,
      features: [
        { name: 'Platform Kapıları', status: 'Uygulanıyor', impact: 'Yüksek' },
        {
          name: 'Mavi LED Işıklar',
          status: 'Uygulanıyor',
          impact: '%84 Azalma',
        },
        {
          name: 'Psikolojik Yönlendirme',
          status: 'Uygulanıyor',
          impact: 'Orta',
        },
      ],
      description: 'Teknoloji ve psikoloji birleşimi ile en kapsamlı yaklaşım',
    },
    {
      id: 'london',
      name: 'Londra',
      country: 'İngiltere',
      color: '#3498db',
      x: 400,
      y: 150,
      features: [
        { name: 'Platform Kapıları', status: 'Uygulanıyor', impact: 'Yüksek' },
        { name: 'Ray Altı Çukurlar', status: 'Uygulanıyor', impact: 'Yüksek' },
        { name: 'Personel Eğitimi', status: 'Uygulanıyor', impact: 'Orta' },
        { name: 'Güvenlik Kameraları', status: 'Uygulanıyor', impact: 'Orta' },
      ],
      description: 'Fiziksel ve eğitimsel çözümlerin birleşimi',
    },
    {
      id: 'seoul',
      name: 'Seul',
      country: 'Güney Kore',
      color: '#2ecc71',
      x: 150,
      y: 350,
      features: [
        {
          name: 'Tam Platform Kapı Sistemi',
          status: 'Uygulanıyor',
          impact: 'Yüksek',
        },
        { name: 'Beş Yıllık Planlar', status: 'Uygulanıyor', impact: 'Yüksek' },
        { name: 'Sosyal Destek Ağları', status: 'Uygulanıyor', impact: 'Orta' },
        {
          name: 'Teknoloji Entegrasyonu',
          status: 'Uygulanıyor',
          impact: 'Yüksek',
        },
      ],
      description: 'Tam kapalı sistem ve veri temelli yaklaşım',
    },
    {
      id: 'paris',
      name: 'Paris',
      country: 'Fransa',
      color: '#f39c12',
      x: 400,
      y: 350,
      features: [
        { name: 'Otomatik Sistemler', status: 'Uygulanıyor', impact: 'Yüksek' },
        { name: 'SOS Amitié', status: 'Uygulanıyor', impact: 'Yüksek' },
        { name: 'Sosyal Çalışma', status: 'Uygulanıyor', impact: 'Orta' },
        { name: 'Kültürel Yaklaşım', status: 'Uygulanıyor', impact: 'Orta' },
      ],
      description: 'Otomatik sistemler ve sosyal destek',
    },
  ];

  // Animation states
  let highlightedCity = '';
  let cityOpacity = 0;
  let featureOpacity = 0;
  let connectionOpacity = 0;

  // Get highlighted city based on current step
  $: {
    switch (currentStep) {
      case 'step-18.1':
        highlightedCity = 'tokyo';
        break;
      case 'step-18.2':
        highlightedCity = 'london';
        break;
      case 'step-18.3':
        highlightedCity = 'seoul';
        break;
      case 'step-18.4':
        highlightedCity = 'paris';
        break;
      default:
        highlightedCity = '';
    }
  }

  // Reactive statement to handle animation
  $: if (animationProgress > 0) {
    // Animate cities
    if (animationProgress > 0.1) {
      const cityProgress = Math.min(1, (animationProgress - 0.1) / 0.4);
      cityOpacity = cityProgress;
    }

    // Animate features
    if (animationProgress > 0.3) {
      const featureProgress = Math.min(1, (animationProgress - 0.3) / 0.4);
      featureOpacity = featureProgress;
    }

    // Animate connections
    if (animationProgress > 0.5) {
      const connectionProgress = Math.min(1, (animationProgress - 0.5) / 0.3);
      connectionOpacity = connectionProgress;
    }
  }

  // Reactive statement to update highlighting
  $: if (svg && currentStep) {
    updateHighlighting();
  }

  // Reactive statement to update animations
  $: if (svg && animationProgress !== undefined) {
    updateAnimations();
  }

  onMount(() => {
    if (svg) {
      renderChart();
    }
  });

  function updateHighlighting() {
    if (!svg) return;

    // Update city opacity based on highlighting
    d3.select(svg)
      .selectAll('.metro-city')
      .attr('opacity', (d: any) =>
        highlightedCity === d.id ? 1
        : highlightedCity ? 0.3
        : 1
      );

    // Update highlighting rings
    d3.select(svg)
      .selectAll('.highlight-ring')
      .attr('opacity', function () {
        const cityId = d3.select(this).attr('data-city-id');
        return highlightedCity === cityId ? 0.8 : 0;
      });
  }

  function updateAnimations() {
    if (!svg) return;

    // Update city opacity
    d3.select(svg).selectAll('.metro-city').attr('opacity', cityOpacity);

    // Update feature opacity
    d3.select(svg).selectAll('.feature-item').attr('opacity', featureOpacity);

    // Update connection opacity
    d3.select(svg)
      .selectAll('.connection-line')
      .attr('opacity', connectionOpacity);
  }

  function renderChart() {
    if (!svg) return;

    // Clear previous content
    d3.select(svg).selectAll('*').remove();

    // Create main group
    const g = d3
      .select(svg)
      .attr('width', width)
      .attr('height', height)
      .append('g');

    // Add title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '24px')
      .attr('font-weight', '700')
      .attr('fill', '#2c3e50')
      .text('Dünya Metro Güvenlik Örnekleri');

    // Draw connections between cities
    const connections = [
      { from: 'tokyo', to: 'london' },
      { from: 'london', to: 'seoul' },
      { from: 'seoul', to: 'paris' },
      { from: 'paris', to: 'tokyo' },
    ];

    connections.forEach((connection) => {
      const fromCity = metroExamples.find((c) => c.id === connection.from);
      const toCity = metroExamples.find((c) => c.id === connection.to);

      if (fromCity && toCity) {
        g.append('line')
          .attr('class', 'connection-line')
          .attr('x1', fromCity.x)
          .attr('y1', fromCity.y)
          .attr('x2', toCity.x)
          .attr('y2', toCity.y)
          .attr('stroke', '#bdc3c7')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .attr('opacity', connectionOpacity);
      }
    });

    // Draw cities
    const cities = g
      .selectAll('.metro-city')
      .data(metroExamples)
      .enter()
      .append('g')
      .attr('class', 'metro-city')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`);

    // Add city circles
    cities
      .append('circle')
      .attr('r', 60)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 4)
      .attr('opacity', cityOpacity);

    // Add city names
    cities
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('font-size', '16px')
      .attr('font-weight', '700')
      .attr('fill', '#fff')
      .attr('opacity', cityOpacity)
      .text((d) => d.name);

    // Add country names
    cities
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#fff')
      .attr('opacity', cityOpacity)
      .text((d) => d.country);

    // Add feature lists
    cities.each(function (d) {
      const cityGroup = d3.select(this);

      d.features.forEach((feature, i) => {
        const featureGroup = cityGroup
          .append('g')
          .attr('class', 'feature-item')
          .attr(
            'transform',
            `translate(${d.x > width / 2 ? -120 : 80}, ${-40 + i * 25})`
          );

        // Feature name
        featureGroup
          .append('text')
          .attr('font-size', '10px')
          .attr('font-weight', '600')
          .attr('fill', '#2c3e50')
          .attr('opacity', featureOpacity)
          .text(feature.name);

        // Feature status
        featureGroup
          .append('text')
          .attr('y', 12)
          .attr('font-size', '9px')
          .attr('font-weight', '500')
          .attr('fill', '#27ae60')
          .attr('opacity', featureOpacity)
          .text(feature.status);

        // Feature impact
        featureGroup
          .append('text')
          .attr('y', 24)
          .attr('font-size', '8px')
          .attr('font-weight', '400')
          .attr('fill', '#7f8c8d')
          .attr('opacity', featureOpacity)
          .text(feature.impact);
      });
    });

    // Add highlighting rings for all cities
    metroExamples.forEach((city) => {
      g.append('circle')
        .attr('class', 'highlight-ring')
        .attr('data-city-id', city.id)
        .attr('cx', city.x)
        .attr('cy', city.y)
        .attr('r', 70)
        .attr('fill', 'none')
        .attr('stroke', city.color)
        .attr('stroke-width', 4)
        .attr('stroke-dasharray', '8,4')
        .attr('opacity', 0);
    });
  }
</script>

<div bind:this={container} class="world-metro-container">
  <svg bind:this={svg}></svg>
</div>

<style>
  .world-metro-container {
    width: 100%;
    height: 100%;
    max-width: 800px;
    max-height: 600px;
    overflow: visible;
  }

  :global(.metro-city) {
    transition: opacity 0.3s ease;
  }

  :global(.metro-city circle) {
    transition: opacity 0.3s ease;
  }

  :global(.metro-city text) {
    transition: opacity 0.3s ease;
  }

  :global(.feature-item) {
    transition: opacity 0.3s ease;
  }

  :global(.connection-line) {
    transition: opacity 0.3s ease;
  }

  :global(.highlight-ring) {
    transition: opacity 0.3s ease;
  }
</style>
