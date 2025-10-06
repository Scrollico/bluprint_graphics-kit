/*
 * Chart Utilities
 * Common functions and utilities for creating consistent charts
 * Based on ONS Charts design system principles
 */

import * as d3 from 'd3';
import type { CSVRow } from './csvParser';

// =============================================================================
// COLOR UTILITIES
// =============================================================================

// ONS Color Palette
export const ONS_COLORS = {
  primary: '#1d70b8',
  primaryDark: '#0b0c0c',
  primaryLight: '#5694ca',
  secondary: '#d4351c',
  secondaryLight: '#f47738',
  accent: '#00703c',
  accentLight: '#28a197',
  text: '#0b0c0c',
  textSecondary: '#505a5f',
  textMuted: '#626a6e',
  background: '#ffffff',
  border: '#b1b4b6',
  grid: '#f3f2f1',
  success: '#00703c',
  warning: '#f47738',
  error: '#d4351c',
  info: '#1d70b8'
} as const;

// Data Colors (Sequential)
export const DATA_COLORS = [
  '#1d70b8', // Primary data
  '#d4351c', // Secondary data
  '#00703c', // Tertiary data
  '#f47738', // Quaternary data
  '#28a197', // Quinary data
  '#912b88', // Senary data
  '#f499be', // Septenary data
  '#b58840'  // Octonary data
] as const;

// Color Schemes
export const COLOR_SCHEMES = {
  default: DATA_COLORS,
  monochrome: ['#1d70b8', '#5694ca', '#8bb3d9', '#b8d4e6'],
  diverging: ['#d4351c', '#f47738', '#1d70b8', '#00703c'],
  sequential: ['#f3f2f1', '#d4d4d4', '#b1b4b6', '#626a6e', '#0b0c0c']
} as const;

// =============================================================================
// TYPOGRAPHY UTILITIES
// =============================================================================

export const TYPOGRAPHY = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem' // 30px
  },
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
} as const;

// =============================================================================
// CHART DIMENSIONS
// =============================================================================

export const CHART_DIMENSIONS = {
  default: { width: 800, height: 400 },
  small: { width: 400, height: 300 },
  large: { width: 1200, height: 600 },
  margins: { top: 40, right: 20, bottom: 40, left: 60 }
} as const;

// =============================================================================
// SCALE UTILITIES
// =============================================================================

export function createColorScale(domain: string[], scheme: keyof typeof COLOR_SCHEMES = 'default') {
  return d3.scaleOrdinal(COLOR_SCHEMES[scheme]).domain(domain);
}

export function createLinearScale(domain: [number, number], range: [number, number]) {
  return d3.scaleLinear().domain(domain).range(range);
}

export function createBandScale(domain: string[], range: [number, number], padding = 0.1) {
  return d3.scaleBand().domain(domain).range(range).padding(padding);
}

export function createTimeScale(domain: [Date, Date], range: [number, number]) {
  return d3.scaleTime().domain(domain).range(range);
}

// =============================================================================
// AXIS UTILITIES
// =============================================================================

export function createXAxis(scale: any, height: number, config: any = {}) {
  const axis = d3.axisBottom(scale);
  
  if (config.tickFormat) {
    axis.tickFormat(config.tickFormat);
  }
  
  if (config.ticks) {
    axis.ticks(config.ticks);
  }
  
  return axis;
}

export function createYAxis(scale: any, width: number, config: any = {}) {
  const axis = d3.axisLeft(scale);
  
  if (config.tickFormat) {
    axis.tickFormat(config.tickFormat);
  }
  
  if (config.ticks) {
    axis.ticks(config.ticks);
  }
  
  return axis;
}

export function addAxis(svg: any, axis: any, transform: string, className: string = '') {
  return svg.append('g')
    .attr('class', `axis ${className}`)
    .attr('transform', transform)
    .call(axis)
    .style('font-family', TYPOGRAPHY.fontFamily)
    .style('font-size', TYPOGRAPHY.fontSizes.sm)
    .style('color', ONS_COLORS.textSecondary);
}

// =============================================================================
// GRID UTILITIES
// =============================================================================

export function addGridLines(svg: any, xScale: any, yScale: any, width: number, height: number) {
  // Vertical grid lines
  svg.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale)
      .tickSize(-height)
      .tickFormat(() => '')
    )
    .style('stroke', ONS_COLORS.grid)
    .style('stroke-width', 1)
    .style('stroke-dasharray', '2,2');

  // Horizontal grid lines
  svg.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(yScale)
      .tickSize(-width)
      .tickFormat(() => '')
    )
    .style('stroke', ONS_COLORS.grid)
    .style('stroke-width', 1)
    .style('stroke-dasharray', '2,2');
}

// =============================================================================
// TOOLTIP UTILITIES
// =============================================================================

export function createTooltip() {
  return d3.select('body')
    .append('div')
    .attr('class', 'chart-tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.9)')
    .style('color', 'white')
    .style('padding', '8px 12px')
    .style('border-radius', '4px')
    .style('font-size', TYPOGRAPHY.fontSizes.xs)
    .style('font-weight', TYPOGRAPHY.fontWeights.medium)
    .style('line-height', TYPOGRAPHY.lineHeights.tight)
    .style('pointer-events', 'none')
    .style('z-index', '1000')
    .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.3)')
    .style('opacity', 0);
}

export function showTooltip(tooltip: any, content: string, x: number, y: number) {
  tooltip
    .html(content)
    .style('left', `${x + 10}px`)
    .style('top', `${y - 28}px`)
    .transition()
    .duration(200)
    .style('opacity', 1);
}

export function hideTooltip(tooltip: any) {
  tooltip
    .transition()
    .duration(200)
    .style('opacity', 0);
}

// =============================================================================
// ANIMATION UTILITIES
// =============================================================================

export function createTransition(duration = 300, easing = 'ease-in-out') {
  return d3.transition()
    .duration(duration)
    .ease(d3.ease(easing));
}

export function animateBars(selection: any, duration = 300) {
  return selection
    .transition()
    .duration(duration)
    .ease(d3.ease('ease-out'));
}

export function animateLines(selection: any, duration = 300) {
  return selection
    .transition()
    .duration(duration)
    .ease(d3.ease('ease-in-out'));
}

// =============================================================================
// DATA PROCESSING UTILITIES
// =============================================================================

export function processDataForChart(data: CSVRow[], chartType: string) {
  switch (chartType) {
    case 'bar':
      return processBarData(data);
    case 'line':
      return processLineData(data);
    case 'pie':
      return processPieData(data);
    case 'scatter':
      return processScatterData(data);
    default:
      return data;
  }
}

function processBarData(data: CSVRow[]) {
  return data.map(d => ({
    category: d[Object.keys(d)[0]],
    value: Number(d[Object.keys(d)[1]]) || 0
  }));
}

function processLineData(data: CSVRow[]) {
  return data.map(d => ({
    x: d[Object.keys(d)[0]],
    y: Number(d[Object.keys(d)[1]]) || 0
  }));
}

function processPieData(data: CSVRow[]) {
  return data.map(d => ({
    label: d[Object.keys(d)[0]],
    value: Number(d[Object.keys(d)[1]]) || 0
  }));
}

function processScatterData(data: CSVRow[]) {
  return data.map(d => ({
    x: Number(d[Object.keys(d)[0]]) || 0,
    y: Number(d[Object.keys(d)[1]]) || 0,
    label: d[Object.keys(d)[2]] || ''
  }));
}

// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================

export function addAccessibilityFeatures(svg: any, title: string, description: string) {
  svg.attr('role', 'img')
     .attr('aria-label', title)
     .attr('aria-description', description);
}

export function addKeyboardNavigation(svg: any, focusableElements: any[]) {
  focusableElements.forEach((element, index) => {
    element.attr('tabindex', 0)
           .attr('role', 'button')
           .attr('aria-label', `Data point ${index + 1}`);
  });
}

// =============================================================================
// RESPONSIVE UTILITIES
// =============================================================================

export function getResponsiveDimensions(containerWidth: number, aspectRatio = 2) {
  const maxWidth = Math.min(containerWidth, 1200);
  const width = Math.max(maxWidth, 300);
  const height = width / aspectRatio;
  
  return { width, height };
}

export function addResponsiveBehavior(svg: any, container: HTMLElement) {
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const { width } = entry.contentRect;
      const { width: newWidth, height: newHeight } = getResponsiveDimensions(width);
      
      svg.attr('width', newWidth)
         .attr('height', newHeight);
    }
  });
  
  resizeObserver.observe(container);
  
  return () => resizeObserver.disconnect();
}

// =============================================================================
// EXPORT UTILITIES
// =============================================================================

export function exportChartAsSVG(svg: any, filename: string = 'chart.svg') {
  const svgData = new XMLSerializer().serializeToString(svg.node());
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

export function exportChartAsPNG(svg: any, filename: string = 'chart.png', scale = 2) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const svgData = new XMLSerializer().serializeToString(svg.node());
  
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    ctx?.scale(scale, scale);
    ctx?.drawImage(img, 0, 0);
    
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  };
  
  img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
}

