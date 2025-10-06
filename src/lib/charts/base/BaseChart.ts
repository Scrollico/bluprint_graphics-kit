/**
 * BaseChart.ts - Abstract Base Class for All Blueprint Charts
 * Provides common functionality, styling, and lifecycle management
 */

import type { ChartConfig } from '../../blueprint-registry';
import type { ChartTheme } from '../../blueprint-registry';

export interface ChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  innerWidth: number;
  innerHeight: number;
}

export interface ChartProps<TData = any> {
  data: TData;
  config: ChartConfig;
  width: number;
  height: number;
  theme?: ChartTheme;
}

export abstract class BaseChart<TData = any> {
  protected data: TData;
  protected config: ChartConfig;
  protected dimensions: ChartDimensions;
  protected theme: ChartTheme;
  protected svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  protected container: HTMLElement;
  protected isDestroyed = false;

  constructor(
    container: HTMLElement,
    props: ChartProps<TData>
  ) {
    this.container = container;
    this.data = props.data;
    this.config = props.config;
    this.theme = props.theme || this.getDefaultTheme();

    // Initialize dimensions
    this.dimensions = this.calculateDimensions(props.width, props.height);

    this.initialize();
  }

  // Abstract methods that must be implemented by subclasses
  protected abstract initialize(): void;
  protected abstract render(): void;
  protected abstract updateData(newData: TData): void;
  protected abstract updateSize(width: number, height: number): void;

  // Common chart lifecycle methods
  public updateConfig(newConfig: ChartConfig): void {
    this.config = { ...this.config, ...newConfig };
    this.render();
  }

  public updateDimensions(width: number, height: number): void {
    this.dimensions = this.calculateDimensions(width, height);
    this.updateSize(width, height);
  }

  public destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // Clean up SVG
    if (this.svg) {
      this.svg.remove();
      this.svg = null;
    }

    // Clean up any event listeners or timers
    this.cleanup();
  }

  // Protected helper methods
  protected calculateDimensions(width: number, height: number): ChartDimensions {
    const margin = {
      top: this.config.margins?.top || 20,
      right: this.config.margins?.right || 20,
      bottom: this.config.margins?.bottom || 40,
      left: this.config.margins?.left || 60
    };

    return {
      width,
      height,
      margin,
      innerWidth: width - margin.left - margin.right,
      innerHeight: height - margin.top - margin.bottom
    };
  }

  protected createSVG(): d3.Selection<SVGSVGElement, unknown, null, undefined> {
    // Remove existing SVG if it exists
    d3.select(this.container).select('svg').remove();

    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.dimensions.width)
      .attr('height', this.dimensions.height)
      .attr('class', 'blueprint-chart-svg')
      .style('font-family', this.theme.typography.fontFamily)
      .style('font-size', `${this.theme.typography.fontSize.medium}px`);

    // Add defs for gradients, patterns, etc.
    this.addSVGDefs();

    // Create main group
    this.svg.append('g')
      .attr('class', 'chart-main')
      .attr('transform', `translate(${this.dimensions.margin.left},${this.dimensions.margin.top})`);

    return this.svg;
  }

  protected addSVGDefs(): void {
    if (!this.svg) return;

    const defs = this.svg.append('defs');

    // Add color gradients
    if (this.config.colors && this.config.colors.length > 0) {
      this.config.colors.forEach((color, index) => {
        const gradient = defs.append('linearGradient')
          .attr('id', `gradient-${index}`)
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '0%')
          .attr('y2', '100%');

        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', color)
          .attr('stop-opacity', 0.8);

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', color)
          .attr('stop-opacity', 0.4);
      });
    }

    // Add drop shadows
    this.theme.shadows.forEach((shadow, index) => {
      defs.append('filter')
        .attr('id', `shadow-${index}`)
        .html(`
          <feDropShadow dx="0" dy="${index + 1}" stdDeviation="${(index + 1) * 2}"
                        flood-color="rgba(0,0,0,0.2)"/>
        `);
    });
  }

  protected getColor(index: number): string {
    if (!this.config.colors || this.config.colors.length === 0) {
      return this.theme.colors.primary[index % this.theme.colors.primary.length];
    }
    return this.config.colors[index % this.config.colors.length];
  }

  protected getDefaultTheme(): ChartTheme {
    return {
      id: 'default',
      name: 'Default Theme',
      colors: {
        primary: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'],
        secondary: ['#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5'],
        neutral: ['#f7f7f7', '#e5e5e5', '#cccccc', '#999999', '#666666'],
        accent: ['#003f5c', '#58508d', '#bc5090', '#ff6361', '#ffa600']
      },
      typography: {
        fontFamily: '"Reuters Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: {
          small: 12,
          medium: 14,
          large: 16
        },
        fontWeight: {
          normal: 400,
          bold: 600
        }
      },
      spacing: {
        padding: 16,
        margin: 8,
        gap: 12
      },
      borderRadius: 4,
      shadows: [
        '0 1px 3px rgba(0, 0, 0, 0.1)',
        '0 4px 6px rgba(0, 0, 0, 0.1)',
        '0 10px 15px rgba(0, 0, 0, 0.1)'
      ]
    };
  }

  protected addAccessibility(): void {
    if (!this.svg) return;

    // Add ARIA labels and descriptions
    this.svg.attr('role', 'img')
      .attr('aria-label', this.config.ariaLabel || 'Data visualization chart')
      .attr('aria-describedby', this.config.ariaDescription ? 'chart-description' : undefined);

    // Add description element if provided
    if (this.config.ariaDescription) {
      this.svg.append('desc')
        .attr('id', 'chart-description')
        .text(this.config.ariaDescription);
    }
  }

  protected addResponsiveBehavior(): void {
    if (!this.svg) return;

    // Add viewBox for responsive scaling
    this.svg.attr('viewBox', `0 0 ${this.dimensions.width} ${this.dimensions.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
  }

  protected handleResize(): void {
    if (this.isDestroyed) return;

    const rect = this.container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this.updateDimensions(rect.width, rect.height);
    }
  }

  // Animation helpers
  protected animateElement(
    selection: d3.Selection<any, any, any, any>,
    duration: number = 750,
    ease: (t: number) => number = d3.easeCubicInOut
  ): d3.Selection<any, any, any, any> {
    return selection
      .transition()
      .duration(duration)
      .ease(ease);
  }

  // Tooltip helpers
  protected createTooltip(): d3.Selection<HTMLDivElement, unknown, HTMLElement, any> {
    // Remove existing tooltip
    d3.select(this.container).select('.chart-tooltip').remove();

    return d3.select(this.container)
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', `${this.theme.spacing.padding / 2}px ${this.theme.spacing.padding}px`)
      .style('border-radius', `${this.theme.borderRadius}px`)
      .style('font-size', `${this.theme.typography.fontSize.small}px`)
      .style('font-family', this.theme.typography.fontFamily)
      .style('z-index', '1000')
      .style('box-shadow', this.theme.shadows[1]);
  }

  protected showTooltip(
    tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
    content: string,
    x: number,
    y: number
  ): void {
    tooltip
      .style('left', `${x + 10}px`)
      .style('top', `${y - 10}px`)
      .html(content)
      .transition()
      .duration(200)
      .style('opacity', 1);
  }

  protected hideTooltip(
    tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>
  ): void {
    tooltip
      .transition()
      .duration(200)
      .style('opacity', 0)
      .on('end', function() {
        d3.select(this).style('left', '-9999px');
      });
  }

  // Override in subclasses for cleanup
  protected cleanup(): void {
    // Default cleanup - override in subclasses
  }

  // Public API methods
  public getSVG(): d3.Selection<SVGSVGElement, unknown, null, undefined> | null {
    return this.svg;
  }

  public getDimensions(): ChartDimensions {
    return { ...this.dimensions };
  }

  public getConfig(): ChartConfig {
    return { ...this.config };
  }

  public getTheme(): ChartTheme {
    return { ...this.theme };
  }

  public isResponsive(): boolean {
    return this.config.responsive?.scaling === 'fit';
  }
}

// Type guard for D3
declare global {
  interface Window {
    d3: typeof d3;
  }
}

// Ensure D3 is available
if (typeof window !== 'undefined' && !window.d3) {
  // In a real implementation, you'd import D3 properly
  console.warn('D3.js not found. Please ensure D3 is loaded before using Blueprint charts.');
}

