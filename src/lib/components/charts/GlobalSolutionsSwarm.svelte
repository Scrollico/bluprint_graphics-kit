<!--
  GlobalSolutionsSwarm.svelte
  Pure SVG + D3 force simulation for Global Examples (STEP 18.1–18.5)
  Pattern: Ipsos-style swarmytelling with scene-based clustering
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import {
    chartTransition,
    type BubbleNode,
  } from '$lib/stores/chartTransition';
  import type { GlobalSolutionRow } from '$lib/utils/csvParser';

  export let width = 900;
  export let height = 420;
  export let stepId: string = 'step-18.1';
  export let data: GlobalSolutionRow[] = [];
  export let cityFilter: string | null = null; // null => all cities
  export let highlightedCity: string | null = null; // city to highlight

  let svgEl: SVGSVGElement;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let simulation: d3.Simulation<Node, undefined>;

  // Country color palette
  const COUNTRY_COLORS: Record<string, string> = {
    Tokyo: '#e74c3c', // Japan Red
    London: '#2c3e50', // UK Dark Blue
    Seoul: '#3498db', // Korea Blue
    Paris: '#9b59b6', // France Purple
  };

  const COUNTRY_NAMES: Record<string, string> = {
    Tokyo: 'Tokyo',
    London: 'Londra',
    Seoul: 'Seul',
    Paris: 'Paris',
  };

  type MeasureType = 'door' | 'pit' | 'led' | 'training' | 'helpline';

  type Node = {
    id: number;
    type: MeasureType;
    city: string;
    x: number;
    y: number;
    vx?: number;
    vy?: number;
    radius: number;
  };

  let nodes: Node[] = [];
  let labelRects: Array<{
    city: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }> = [];

  // Three-tiered size system (üç kademeli)
  // Small, Medium, Large categories with clear size gaps
  const SIZE_CONFIG: Record<MeasureType, { base: number; variation: number }> =
    {
      door: { base: 9, variation: 1.5 }, // LARGE - Platform Doors (most important)
      pit: { base: 2, variation: 0.5 }, // SMALL - Suicide Pits (least visible)
      led: { base: 5, variation: 1 }, // MEDIUM - Blue LED
      training: { base: 9, variation: 1.5 }, // LARGE - Staff Training (important)
      helpline: { base: 5, variation: 1 }, // MEDIUM - Helpline
    };

  // Multi-centroid layout: cluster per country for clearer structure
  function getCountryCenters(w: number, h: number) {
    const padX = 80;
    const padY = 60;
    const innerW = w - padX * 2;
    const innerH = h - padY * 2;
    const columns = 2;
    const rows = 2;
    const cellW = innerW / columns;
    const cellH = innerH / rows;
    const order: string[] = ['Tokyo', 'London', 'Seoul', 'Paris'];
    const centers: Record<
      string,
      { x: number; y: number; col: number; row: number }
    > = {} as any;
    order.forEach((city, i) => {
      const row = Math.floor(i / columns);
      const col = i % columns;
      const cx = padX + col * cellW + cellW / 2;
      const cy =
        padY +
        row * cellH +
        cellH / 2 +
        (row === rows - 1 && order.length < columns * rows ? 20 : 0);
      centers[city] = { x: cx, y: cy, col, row };
    });
    return centers;
  }
  let COUNTRY_CENTERS = getCountryCenters(width, height);

  // Estimate label bounding boxes for simple collision avoidance with dots
  function computeLabelRects(): Array<{
    city: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }> {
    const rects: Array<{
      city: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }> = [];
    const pad = 10; // extra safety around text
    Object.keys(COUNTRY_NAMES).forEach((city) => {
      const center = COUNTRY_CENTERS[city];
      const label = COUNTRY_NAMES[city];
      // crude width estimate: ~6.8px per character at 12px font
      const w = Math.max(60, label.length * 6.8);
      const h = 16; // font-size 12px -> bbox ~16px high
      const cx = center.x;
      const cy = center.y - 50; // keep in sync with render offset below
      rects.push({
        city: city,
        x1: cx - w / 2 - pad,
        y1: cy - h / 2 - pad,
        x2: cx + w / 2 + pad,
        y2: cy + h / 2 + pad,
      });
    });
    return rects;
  }

  const sceneNames: Record<string, string> = {
    'step-18.1': 'Genel Bakış',
    'step-18.2': 'Tokyo',
    'step-18.3': 'Londra',
    'step-18.4': 'Seul',
    'step-18.5': 'Paris',
  };

  type SceneKey = keyof typeof sceneNames;

  function resolveSceneKey(id: string | undefined | null): SceneKey {
    if (!id) return 'step-18.1';
    if (id && id in sceneNames) return id as SceneKey;
    const remapped = id.replace(/^step-18-(\d)$/, 'step-18.$1');
    if (remapped in sceneNames) return remapped as SceneKey;
    return 'step-18.1';
  }

  // Prepare bubbles for transition to European chart
  function prepareTransitionBubbles(): BubbleNode[] {
    return nodes.map((node) => ({
      id: `solution-${node.id}`,
      x: node.x,
      y: node.y,
      radius: node.radius,
      color: COUNTRY_COLORS[node.city] || '#95a5a6',
      type: 'solution' as const,
      data: { measureType: node.type, label: COUNTRY_NAMES[node.city] },
    }));
  }

  // Handle transition to step 19
  $: if (stepId === 'step-18.5') {
    // Prepare for transition when reaching the last step
    const bubbles = prepareTransitionBubbles();
    console.log(
      '🎬 GlobalSolutionsSwarm preparing transition bubbles:',
      bubbles.length
    );
    chartTransition.update((state) => ({
      ...state,
      bubbles: bubbles, // Replace instead of append to avoid duplicates
    }));
  }

  function buildNodesFromData(rows: GlobalSolutionRow[]): Node[] {
    // Filter to only show the 4 main cities
    const allowedCities = ['Tokyo', 'London', 'Seoul', 'Paris'];
    const filtered = rows.filter((row) => allowedCities.includes(row.city));

    // Expand each row into many micro-nodes to create a dense swarm
    // Base nodes per row; scaled by absolute change (bigger improvement → more nodes)
    const BASE_PER_ROW = 24;
    const nodesOut: Node[] = [];
    let nid = 0;
    filtered.forEach((r) => {
      const mag = Math.min(100, Math.abs(Number(r.change) || 0));
      const scale = 0.8 + mag / 100; // 0.8–1.8
      const count = Math.max(8, Math.round(BASE_PER_ROW * scale));
      for (let k = 0; k < count; k++) {
        nodesOut.push({
          id: nid++,
          type: r.type as MeasureType,
          city: r.city,
          x: Math.random() * width,
          y: Math.random() * height,
          radius: calculateNodeRadius(r.type as MeasureType),
        });
      }
    });
    return nodesOut;
  }

  function calculateNodeRadius(type: MeasureType): number {
    const config = SIZE_CONFIG[type];

    // Create mixed sizes within each type with subtle differences
    // 30% chance for each size tier regardless of type
    const sizeRoll = Math.random();
    let targetSize: number;

    if (sizeRoll < 0.3) {
      // Small tier - subtle
      targetSize = 3 + Math.random() * 1; // 3-4px
    } else if (sizeRoll < 0.6) {
      // Medium tier - subtle
      targetSize = 4.5 + Math.random() * 1; // 4.5-5.5px
    } else {
      // Large tier - subtle
      targetSize = 6 + Math.random() * 1.5; // 6-7.5px
    }

    return Math.max(1, targetSize);
  }

  function assignData(sceneKey: SceneKey) {
    nodes = buildNodesFromData(data);
  }

  function setupSimulation() {
    simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        'x',
        d3
          .forceX<Node>((d) => COUNTRY_CENTERS[d.city]?.x || width / 2)
          .strength(0.2)
      )
      .force(
        'y',
        d3
          .forceY<Node>((d) => (COUNTRY_CENTERS[d.city]?.y || height / 2) + 8)
          .strength(0.22)
      )
      .force(
        'collide',
        d3.forceCollide<Node>((d) => d.radius + 0.8).iterations(2)
      )
      // Soft push away from label rectangles so dots don't overlap titles
      .force('label-avoid', labelAvoidForce(0.4))
      .alphaDecay(0.03)
      .velocityDecay(0.2)
      .on('tick', tick);
  }

  // Custom force: gently push nodes out of label rectangles
  function labelAvoidForce(strength = 0.4) {
    return function (alpha: number) {
      if (!labelRects.length) return;
      for (const node of nodes) {
        const rect = labelRects.find((r) => r.city === node.city);
        if (!rect) continue;
        const nx = node.x;
        const ny = node.y;
        if (nx >= rect.x1 && nx <= rect.x2 && ny >= rect.y1 && ny <= rect.y2) {
          // push downwards out of the label area (labels sit above clusters)
          const dyBelow = rect.y2 - ny + 1;
          node.vy = (node.vy || 0) + (dyBelow * strength * alpha) / 8;
        }
      }
    } as unknown as d3.Force<Node, undefined>;
  }

  function tick() {
    if (!svg) return;

    svg
      .selectAll<SVGCircleElement, Node>('circle.dot')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => COUNTRY_COLORS[d.city] || '#95a5a6')
      .attr('opacity', (d) => {
        if (highlightedCity && d.city !== highlightedCity) return 0.3;
        return 0.85;
      });
  }

  function renderSVG() {
    if (!svgEl) return;

    svg = d3.select(svgEl);
    svg.selectAll('*').remove(); // Clear

    // Set viewBox for responsive scaling
    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Background (transparent)
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .attr('class', 'bg');

    // Recompute centers on render for current size
    COUNTRY_CENTERS = getCountryCenters(width, height);
    labelRects = computeLabelRects();

    // Title
    const currentSceneName = sceneNames[resolveSceneKey(stepId)];
    svg
      .append('text')
      .attr('x', 20)
      .attr('y', 28)
      .attr('class', 'title')
      .attr('fill', '#2c3e50')
      .attr('font-size', '16px')
      .attr('font-weight', '600')
      .text(`${currentSceneName} – Küresel Önlemler`);

    // Group labels (country names per cluster)
    const labels = svg.append('g').attr('class', 'group-labels');
    Object.keys(COUNTRY_NAMES).forEach((city) => {
      const c = COUNTRY_CENTERS[city];
      if (!c) return;
      labels
        .append('text')
        .attr('x', c.x)
        .attr('y', c.y - 50)
        .attr('text-anchor', 'middle')
        .attr('fill', COUNTRY_COLORS[city] || '#5b6770')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text(COUNTRY_NAMES[city]);
    });

    // Circles (data join)
    svg
      .selectAll('circle.dot')
      .data(nodes, (d: any) => d.id)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('r', (d) => d.radius)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('fill', (d) => COUNTRY_COLORS[d.city] || '#95a5a6')
      .attr('opacity', (d) => {
        if (highlightedCity && d.city !== highlightedCity) return 0.3;
        return 0.85;
      })
      .style('transition', 'fill 0.3s ease, opacity 0.3s ease');

    // No legend - country names are shown directly on the swarms
  }

  function updateScene() {
    const sceneKey = resolveSceneKey(stepId);
    console.log('updateScene called:', {
      stepId,
      sceneKey,
      cityFilter,
      highlightedCity,
    });
    assignData(sceneKey);

    // Update title
    if (svg) {
      const currentSceneName = sceneNames[sceneKey];
      svg.select('text.title').text(`${currentSceneName} – Küresel Önlemler`);
    }

    // Restart simulation with energy
    if (simulation) {
      simulation.alpha(0.5).restart();
    }
  }

  // React to stepId changes
  $: if (stepId && simulation) {
    updateScene();
  }

  // React to highlightedCity changes for opacity only
  $: if (highlightedCity !== undefined && svg) {
    // Update opacity of existing circles
    svg.selectAll('circle.dot').attr('opacity', (d: any) => {
      if (highlightedCity && d.city !== highlightedCity) return 0.3;
      return 0.85;
    });
  }

  onMount(() => {
    console.log('GlobalSolutionsSwarm onMount:', {
      dataLength: data.length,
      stepId,
      cityFilter,
      highlightedCity,
    });
    nodes = buildNodesFromData(data);
    console.log('Initial nodes generated:', nodes.length);
    setupSimulation();
    renderSVG();
  });

  onDestroy(() => {
    if (simulation) {
      simulation.stop();
    }
  });
</script>

<div class="swarm-wrap" style="width: {width}px; height: {height}px;">
  <svg bind:this={svgEl} class="swarm-svg"></svg>
</div>

<style>
  .swarm-wrap {
    width: 100%;
    display: block;
    position: relative;
    overflow: hidden;
    border-radius: 0;
    box-shadow: none;
    background: transparent;
  }

  .swarm-svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  :global(.swarm-svg circle.dot) {
    cursor: pointer;
    transition:
      r 0.2s ease,
      opacity 0.2s ease;
  }

  :global(.swarm-svg circle.dot:hover) {
    r: calc(var(--base-radius, 4px) * 1.5);
    opacity: 1;
  }
</style>
