<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  /**
   * OccupationCanvas renders a performant canvas-based circle packing with zoom and color-picking.
   * Implementation follows the exact Visual Cinnamon pattern from index.html.
   * Data is loaded from `/media-assets/graphics-table/occupation/occupation.json`.
   */

  export let dataUrl: string =
    '/media-assets/graphics-table/occupation/occupation.json';
  export let showSearch: boolean = true;
  export let showLegend: boolean = true;
  export let showLabels: boolean = true;
  export let labelMinRadius: number = 22;
  export let highlightColor: string = '#e74c3c';

  let container: HTMLDivElement;
  let canvasEl: HTMLCanvasElement;
  let hiddenEl: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let hiddenCtx: CanvasRenderingContext2D | null = null;

  let width = 800;
  let height = 600;
  let centerX = 400;
  let centerY = 300;

  type Node = {
    name: string;
    ID?: string;
    size?: number;
    children?: Node[];
    // D3 computed properties
    x?: number;
    y?: number;
    r?: number;
    parent?: Node | null;
    depth?: number;
  };

  let root: Node | null = null;
  let focus: Node | null = null;
  let nodes: Node[] = [];
  let dataContainer: any = null; // D3 detached container
  let colToCircle: { [key: string]: any } = {};
  let nextCol = 1;
  let animating = false;
  let searchInput: HTMLInputElement;
  let searchHit: Node | null = null;
  let nameToNode: Map<string, Node> = new Map();
  let allNodes: Node[] = [];

  let rafId: number | null = null;
  let resizeObserver: ResizeObserver;

  // Load D3.js v3.5.6 and queue
  async function loadD3() {
    return new Promise((resolve) => {
      const script1 = document.createElement('script');
      script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js';
      script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'http://d3js.org/queue.v1.min.js';
        script2.onload = () => resolve(true);
        document.head.appendChild(script2);
      };
      document.head.appendChild(script1);
    });
  }

  async function loadData(url: string): Promise<Node> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);
    return (await res.json()) as Node;
  }

  function resize() {
    if (!container || !canvasEl || !hiddenEl) return;
    const rect = container.getBoundingClientRect();
    width = Math.max(350, Math.floor(rect.width)) - 20;
    height = window.innerWidth < 768 ? width : window.innerHeight - 20;

    centerX = width / 2;
    centerY = height / 2;

    // Set canvas sizes
    canvasEl.width = width;
    canvasEl.height = height;
    hiddenEl.width = width;
    hiddenEl.height = height;
    hiddenEl.style.display = 'none';

    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }
    if (hiddenCtx) {
      hiddenCtx.clearRect(0, 0, width, height);
    }
  }

  function genColor(): string {
    const ret: number[] = [];
    if (nextCol < 16777215) {
      ret.push(nextCol & 0xff); // R
      ret.push((nextCol & 0xff00) >> 8); // G
      ret.push((nextCol & 0xff0000) >> 16); // B
      nextCol += 100;
    }
    return `rgb(${ret.join(',')})`;
  }

  function drawCanvas(
    chosenContext: CanvasRenderingContext2D,
    hidden: boolean
  ) {
    // Clear canvas
    chosenContext.clearRect(0, 0, width, height);
    chosenContext.fillStyle = '#fff';
    chosenContext.fillRect(0, 0, width, height);

    if (!dataContainer) return;

    // Select our dummy nodes and draw the data to canvas
    const elements = dataContainer.selectAll('.node');
    elements.each(function (d: any) {
      const node = (window as any).d3.select(this);

      // If the hidden canvas was sent into this function
      // and it does not yet have a color, generate a unique one
      if (hidden) {
        if (node.attr('color') === null) {
          node.attr('color', genColor());
          colToCircle[node.attr('color')] = node;
        }
        chosenContext.fillStyle = node.attr('color');
      } else {
        chosenContext.fillStyle = node.attr('fill');
      }

      // Draw each circle
      chosenContext.beginPath();
      chosenContext.arc(
        centerX + +node.attr('cx'),
        centerY + +node.attr('cy'),
        node.attr('r'),
        0,
        2 * Math.PI,
        true
      );
      chosenContext.fill();
      chosenContext.closePath();

      // Labels
      if (!hidden && showLabels) {
        const r = +node.attr('r');
        if (r >= labelMinRadius) {
          const fill = node.attr('fill');
          const textColor = fill === 'white' ? '#111' : '#fff';
          const datum: any =
            (node as any).datum ?
              (node as any).datum()
            : (this as any).__data__;
          const name: string = datum?.name || '';
          const fontSize = Math.max(9, Math.min(18, r * 0.26));
          chosenContext.fillStyle = textColor;
          chosenContext.font = `${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
          chosenContext.textAlign = 'center';
          chosenContext.textBaseline = 'middle';
          const cx = centerX + +node.attr('cx');
          const cy = centerY + +node.attr('cy');
          const maxWidth = r * 1.6;
          if (chosenContext.measureText(name).width > maxWidth) {
            const parts = name.split(' ');
            const mid = Math.ceil(parts.length / 2);
            const l1 = parts.slice(0, mid).join(' ');
            const l2 = parts.slice(mid).join(' ');
            chosenContext.fillText(l1, cx, cy - fontSize * 0.55);
            if (l2) chosenContext.fillText(l2, cx, cy + fontSize * 0.55);
          } else {
            chosenContext.fillText(name, cx, cy);
          }
        }
      }
    });

    if (!hidden && searchHit) {
      const d3 = (window as any).d3;
      const node = dataContainer.selectAll('.node').filter(function (d: any) {
        return d === searchHit;
      });
      if (node.size()) {
        const cx = centerX + +node.attr('cx');
        const cy = centerY + +node.attr('cy');
        const r = +node.attr('r');
        chosenContext.beginPath();
        chosenContext.arc(
          cx,
          cy,
          r + Math.max(2, r * 0.06),
          0,
          2 * Math.PI,
          true
        );
        chosenContext.strokeStyle = highlightColor;
        chosenContext.lineWidth = Math.max(2, r * 0.06);
        chosenContext.stroke();
        chosenContext.closePath();
      }
    }
  }

  function zoomToCanvas(d: Node, duration: number = 2000) {
    focus = d;
    const v = [focus.x, focus.y, focus.r * 2.05];
    const diameter = Math.min(width * 0.9, height * 0.9);
    const k = diameter / v[2];

    animating = true;
    dataContainer
      .selectAll('.node')
      .transition()
      .duration(duration)
      .attr('cx', (d: any) => (d.x - v[0]) * k)
      .attr('cy', (d: any) => (d.y - v[1]) * k)
      .attr('r', (d: any) => d.r * k)
      .each('end', () => {
        animating = false;
      });
  }

  function animate() {
    drawCanvas(ctx!, false);
    if (animating) rafId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(animate);
  }

  function handleClick(e: MouseEvent) {
    if (!hiddenCtx) return;
    drawCanvas(hiddenCtx, true);

    const mouseX = e.layerX;
    const mouseY = e.layerY;

    const col = hiddenCtx.getImageData(mouseX, mouseY, 1, 1).data;
    const colString = `rgb(${col[0]},${col[1]},${col[2]})`;
    const node = colToCircle[colString];

    if (node) {
      const chosen = dataContainer.selectAll('#' + node.attr('id'))[0][0]
        .__data__;
      if (focus !== chosen) zoomToCanvas(chosen, 1000);
      else zoomToCanvas(root!, 1000);
      startAnimation();
    }
  }

  function normalizeName(s: string) {
    return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function buildIndexes() {
    nameToNode.clear();
    allNodes = nodes.slice();
    nodes.forEach((n) => {
      if (n && n.name) nameToNode.set(normalizeName(n.name), n);
    });
  }

  function findBestMatch(query: string): Node | null {
    const q = normalizeName(query);
    if (!q) return null;
    const exact = nameToNode.get(q);
    if (exact) return exact;
    const leaves = allNodes.filter(
      (n) => !n.children && n.name && normalizeName(n.name).includes(q)
    );
    if (leaves.length) return leaves[0];
    const groups = allNodes.filter(
      (n) => n.children && n.name && normalizeName(n.name).includes(q)
    );
    return groups.length ? groups[0] : null;
  }

  function handleSearchSubmit(e?: Event) {
    if (e) e.preventDefault();
    if (!searchInput) return;
    const q = searchInput.value;
    const node = findBestMatch(q);
    if (node) {
      searchHit = node;
      zoomToCanvas(node, 1000);
      startAnimation();
    }
  }

  function handleSearchClear() {
    if (searchInput) searchInput.value = '';
    searchHit = null;
    if (root) {
      zoomToCanvas(root, 800);
      startAnimation();
    }
  }

  onMount(async () => {
    ctx = canvasEl.getContext('2d');
    hiddenCtx = hiddenEl.getContext('2d');

    // Set initial canvas dimensions
    resize();

    try {
      // Load D3.js v3.5.6
      await loadD3();

      // Wait for D3 to be available
      await new Promise((resolve) => {
        const checkD3 = () => {
          if ((window as any).d3 && (window as any).queue) {
            resolve(true);
          } else {
            setTimeout(checkD3, 100);
          }
        };
        checkD3();
      });

      const d3 = (window as any).d3;
      const queue = (window as any).queue;

      // Load data using D3 queue
      queue()
        .defer(d3.json, dataUrl)
        .await((error: any, dataset: Node) => {
          if (error) throw error;

          root = dataset;
          focus = dataset;

          // Create detached container for D3 data binding
          const detachedContainer = document.createElement('custom');
          dataContainer = d3.select(detachedContainer);

          // Create color scale exactly as in original
          const colorCircle = d3.scale
            .ordinal()
            .domain([0, 1, 2, 3])
            .range(['#bfbfbf', '#838383', '#4c4c4c', '#1c1c1c']);

          const diameter = Math.min(width * 0.9, height * 0.9);
          const pack = d3.layout
            .pack()
            .padding(1)
            .size([diameter, diameter])
            .value((d: any) => d.size)
            .sort((d: any) => d.ID);

          nodes = pack.nodes(dataset);
          buildIndexes();

          // Create the circle packing as if it was a normal D3 thing
          const dataBinding = dataContainer
            .selectAll('.node')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('id', (d: any, i: number) => 'nodeCircle_' + i)
            .attr('class', (d: any) =>
              d.parent ?
                d.children ?
                  'node'
                : 'node node--leaf'
              : 'node node--root'
            )
            .attr('r', (d: any) => d.r)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('fill', (d: any) =>
              d.children ? colorCircle(d.depth) : 'white'
            );

          // First zoom to get the circles to the right location
          zoomToCanvas(root, 800);
          startAnimation();
        });

      // Setup resize observer
      resizeObserver = new ResizeObserver(() => {
        resize();
      });
      if (container) resizeObserver.observe(container);
    } catch (e) {
      console.error('Failed to init OccupationCanvas', e);
    }
  });

  onDestroy(() => {
    if (resizeObserver && container) resizeObserver.unobserve(container);
    if (rafId) cancelAnimationFrame(rafId);
  });
</script>

<div id="chart" bind:this={container}>
  {#if showSearch}
    <form
      class="occ-ui occ-search"
      on:submit|preventDefault={handleSearchSubmit}
    >
      <input
        bind:this={searchInput}
        type="search"
        placeholder="Find an occupation"
        aria-label="Search occupations"
      />
      <button type="submit" aria-label="Search">Go</button>
      <button
        type="button"
        on:click={handleSearchClear}
        aria-label="Clear search">Clear</button
      >
    </form>
  {/if}
  <canvas
    bind:this={canvasEl}
    id="canvas"
    class="occ-canvas"
    on:click={handleClick}
  ></canvas>
  <canvas bind:this={hiddenEl} id="hiddenCanvas" class="occ-canvas-hidden"
  ></canvas>
  {#if showLegend}
    <div class="occ-ui occ-legend" role="note">
      <div class="lg-title">Legend</div>
      <div class="lg-row">
        <span class="dot dot-white"></span> White = specific occupation
      </div>
      <div class="lg-row">
        <span class="dot dot-gray"></span> Gray shades = group levels
      </div>
      <div class="lg-row">Circle size ∝ employed (thousands)</div>
    </div>
  {/if}
</div>

<style lang="scss">
  #chart {
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
    padding: 0 16px;
    height: min(75vh, 800px);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .occ-canvas {
    display: block;
    width: 100%;
    height: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
  }

  .occ-canvas-hidden {
    display: none;
  }

  .occ-ui {
    position: absolute;
    z-index: 2;
    pointer-events: auto;
    font-size: 12px;
    font-family:
      system-ui,
      -apple-system,
      Segoe UI,
      Roboto,
      sans-serif;
  }
  .occ-search {
    top: 8px;
    left: 8px;
    display: flex;
    gap: 6px;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 6px;
    padding: 6px 8px;
  }
  .occ-search input {
    width: 200px;
    padding: 4px 6px;
  }
  .occ-search button {
    padding: 4px 8px;
  }

  .occ-legend {
    left: 8px;
    bottom: 8px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    padding: 8px 10px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }
  .occ-legend .lg-title {
    font-weight: 600;
    margin-bottom: 4px;
  }
  .occ-legend .lg-row {
    display: flex;
    align-items: center;
    gap: 6px;
    line-height: 1.3;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    border: 1px solid #999;
  }
  .dot-white {
    background: #fff;
  }
  .dot-gray {
    background: #aaa;
  }
</style>
