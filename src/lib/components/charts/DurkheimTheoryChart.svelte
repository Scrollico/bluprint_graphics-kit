<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let width = 600;
  export let height = 400;
  export let animationProgress = 0;
  export let currentStep = 'step-20';
  export const hideTitle = false;

  let svg: SVGSVGElement;
  let container: HTMLDivElement;

  // Durkheim theory data with better spacing
  const theoryData = [
    {
      id: 'egoistic',
      name: 'Egoistic',
      description: 'Yüksek bireyselleşme, düşük sosyal bağlar',
      examples: 'Almanya, Fransa',
      color: '#d32f2f',
      x: 120,
      y: 120,
      connections: ['anomic'],
    },
    {
      id: 'anomic',
      name: 'Anomic',
      description: 'Sosyal düzenin bozulması, norm çatışması',
      examples: 'İtalya, İspanya',
      color: '#1976d2',
      x: 300,
      y: 80,
      connections: ['egoistic', 'altruistic'],
    },
    {
      id: 'altruistic',
      name: 'Altruistic',
      description: 'Güçlü grup bağları, kolektif değerler',
      examples: 'Doğu Avrupa ülkeleri',
      color: '#388e3c',
      x: 480,
      y: 120,
      connections: ['anomic'],
    },
    {
      id: 'fatalistic',
      name: 'Fatalistic',
      description: 'Aşırı kontrol, umutsuzluk',
      examples: 'Türkiye (Marmaray örneği)',
      color: '#f57c00',
      x: 300,
      y: 250,
      connections: [],
    },
  ];

  // Animation states
  let highlightedNode = '';
  let connectionOpacity = 0;
  let nodeOpacity = 0;
  let textOpacity = 0;

  // Get highlighted node and connections based on current step
  let activeConnections: string[] = [];

  $: {
    switch (currentStep) {
      case 'step-21':
        highlightedNode = 'egoistic';
        activeConnections = ['egoistic-anomic'];
        break;
      case 'step-22':
        highlightedNode = 'anomic';
        activeConnections = ['egoistic-anomic', 'anomic-altruistic'];
        break;
      case 'step-23':
        highlightedNode = 'altruistic';
        activeConnections = ['anomic-altruistic'];
        break;
      case 'step-24':
        highlightedNode = 'fatalistic';
        activeConnections = ['fatalistic-anomic']; // Connect fatalistic to anomic
        break;
      case 'step-25':
        highlightedNode = 'fatalistic';
        activeConnections = ['fatalistic-anomic', 'fatalistic-egoistic']; // Show multiple connections
        break;
      default:
        highlightedNode = '';
        activeConnections = [];
    }
  }

  // Reactive statement to handle animation
  $: if (animationProgress > 0) {
    // Animate connections first - start much earlier
    if (animationProgress < 0.2) {
      connectionOpacity = (animationProgress / 0.2) * 0.6;
    } else {
      connectionOpacity = 0.6;
    }

    // Animate nodes with fade-in - start much earlier
    if (animationProgress > 0.05) {
      const nodeProgress = Math.min(1, (animationProgress - 0.05) / 0.3);
      nodeOpacity = nodeProgress;
    }

    // Animate text - start earlier too
    if (animationProgress > 0.15) {
      const textProgress = Math.min(1, (animationProgress - 0.15) / 0.25);
      textOpacity = textProgress;
    }
  }

  // Reactive statement to update highlighting without full re-render
  $: if (svg && currentStep) {
    updateHighlighting();
  }

  // Reactive statement to update animations without full re-render
  $: if (svg && animationProgress !== undefined) {
    updateAnimations();
  }

  onMount(() => {
    if (!svg) return;
    renderChart();
  });

  function updateHighlighting() {
    if (!svg) return;

    // Update node opacity based on highlighting
    d3.select(svg)
      .selectAll('.theory-node circle')
      .attr('opacity', (d: any) =>
        highlightedNode === d.id ? 1
        : highlightedNode ? 0.3
        : 1
      );

    // Update highlighting rings visibility (don't remove/add, just show/hide)
    d3.select(svg)
      .selectAll('.highlight-ring')
      .attr('opacity', function () {
        const nodeId = d3.select(this).attr('data-node-id');
        return highlightedNode === nodeId ? 0.8 : 0;
      });

    // Clear existing connections
    d3.select(svg).select('.connections-group').selectAll('*').remove();

    // Draw new connections with smooth animation
    if (activeConnections.length > 0) {
      const connectionsGroup = d3.select(svg).select('.connections-group');

      activeConnections.forEach((connectionId) => {
        const connection = getConnectionData(connectionId);
        if (connection) {
          const fromNode = theoryData.find((n) => n.id === connection.from);
          const toNode = theoryData.find((n) => n.id === connection.to);

          if (fromNode && toNode) {
            // Create path for smooth drawing animation
            const path = connectionsGroup
              .append('path')
              .attr('class', 'connection-path')
              .attr('data-connection-id', connectionId)
              .attr('fill', 'none')
              .attr('stroke', '#666')
              .attr('stroke-width', 3)
              .attr('opacity', 0);

            // Create the path data
            const pathData = `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;
            path.attr('d', pathData);

            // Get the total length for animation
            const totalLength = path.node()!.getTotalLength();

            // Animate the path drawing
            path
              .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
              .attr('stroke-dashoffset', totalLength)
              .transition()
              .duration(800)
              .ease(d3.easeCubicInOut)
              .attr('opacity', 0.8)
              .attr('stroke-dashoffset', 0);
          }
        }
      });
    }
  }

  function getConnectionData(connectionId: string) {
    const connections = [
      { from: 'egoistic', to: 'anomic', id: 'egoistic-anomic' },
      { from: 'anomic', to: 'altruistic', id: 'anomic-altruistic' },
      { from: 'fatalistic', to: 'anomic', id: 'fatalistic-anomic' },
      { from: 'fatalistic', to: 'egoistic', id: 'fatalistic-egoistic' },
    ];
    return connections.find((c) => c.id === connectionId);
  }

  function updateAnimations() {
    if (!svg) return;

    // Update connection opacity
    d3.select(svg)
      .selectAll('.connection-line')
      .attr('opacity', connectionOpacity);

    // Update node opacity (no transform scaling)
    d3.select(svg)
      .selectAll('.theory-node circle')
      .attr('opacity', nodeOpacity);

    // Update text opacity
    d3.select(svg)
      .selectAll('.description-text, .example-text')
      .attr('opacity', textOpacity);
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
      .attr('font-size', '18px')
      .attr('font-weight', '600')
      .attr('fill', '#1a1a1a')
      .text('Durkheim İntihar Teorisi');

    // Create connection paths container (initially empty - no lines shown)
    const connectionsGroup = g.append('g').attr('class', 'connections-group');

    // Draw nodes
    const nodes = g
      .selectAll('.theory-node')
      .data(theoryData)
      .enter()
      .append('g')
      .attr('class', 'theory-node')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`);

    // Add circles
    nodes
      .append('circle')
      .attr('r', 40)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('opacity', nodeOpacity);

    // Add node labels
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#fff')
      .attr('opacity', nodeOpacity)
      .text((d) => d.name);

    // Add descriptions with better positioning
    nodes
      .append('text')
      .attr('class', 'description-text')
      .attr('x', 0)
      .attr('y', 70)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .attr('font-weight', '500')
      .attr('opacity', textOpacity)
      .text((d) => d.description)
      .call(wrap, 140);

    // Add examples with better positioning
    nodes
      .append('text')
      .attr('class', 'example-text')
      .attr('x', 0)
      .attr('y', 95)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .attr('font-style', 'italic')
      .attr('opacity', textOpacity)
      .text((d) => d.examples);

    // Create highlighting rings for all nodes (initially hidden)
    theoryData.forEach((node) => {
      g.append('circle')
        .attr('class', 'highlight-ring')
        .attr('data-node-id', node.id)
        .attr('cx', node.x)
        .attr('cy', node.y)
        .attr('r', 50)
        .attr('fill', 'none')
        .attr('stroke', node.color)
        .attr('stroke-width', 3)
        .attr('opacity', 0)
        .style('animation', 'pulse 2s infinite');
    });
  }

  // Text wrapping function
  function wrap(text: any, width: number) {
    text.each(function () {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      let word;
      let line: string[] = [];
      let lineNumber = 0;
      const lineHeight = 1.1;
      const y = text.attr('y') || '0';
      const dy = parseFloat(text.attr('dy') || '0');
      let tspan = text
        .text(null)
        .append('tspan')
        .attr('x', 0)
        .attr('y', y)
        .attr('dy', dy + 'em');

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node()!.getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text
            .append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', ++lineNumber * lineHeight + dy + 'em')
            .text(word);
        }
      }
    });
  }
</script>

<div bind:this={container} class="durkheim-chart-container">
  <svg bind:this={svg} class="durkheim-svg"></svg>
</div>

<style>
  .durkheim-chart-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border-radius: 0;
    padding: 0;
    overflow: hidden;
  }

  .durkheim-svg {
    width: 100%;
    height: 100%;
    max-width: 600px;
    max-height: 400px;
    overflow: visible;
  }

  :global(.theory-node) {
    transition: opacity 0.3s ease;
  }

  :global(.theory-node circle) {
    transition: opacity 0.3s ease;
  }

  :global(.theory-node text) {
    transition: opacity 0.3s ease;
  }

  :global(.description-text) {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.3;
    word-spacing: 0.1em;
  }

  :global(.example-text) {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.2;
  }

  :global(.connection-path) {
    transition: opacity 0.3s ease;
  }

  :global(.highlight-ring) {
    transition: opacity 0.3s ease;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.4;
    }
    100% {
      transform: scale(1);
      opacity: 0.8;
    }
  }
</style>
