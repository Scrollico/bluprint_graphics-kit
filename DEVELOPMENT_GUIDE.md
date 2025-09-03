# Bluprint Graphics Kit - Development Guide & Capabilities

## Overview

This document serves as a comprehensive guide for all the capabilities, techniques, and components we've developed for the Bluprint Graphics Kit. It documents our learnings, implementations, and best practices for creating interactive data stories and visualizations.

## Table of Contents

1. [Core Technologies](#core-technologies)
2. [Map Visualizations](#map-visualizations)
3. [Scrollytelling Framework](#scrollytelling-framework)
4. [Chart Components](#chart-components)
5. [3D & Video Integration](#3d--video-integration)
6. [Data Handling](#data-handling)
7. [Animation & Transitions](#animation--transitions)
8. [Component Architecture](#component-architecture)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Core Technologies

### Framework & Build Tools

- **SvelteKit**: Main framework for building interactive stories
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **pnpm**: Package manager (faster than npm)

### Key Libraries

- **D3.js**: Data visualization and manipulation
- **d3-geo**: Geographic projections and transformations
- **d3-transition**: Smooth animations and transitions
- **Scrollama**: Scroll-driven interactions
- **Mapbox GL**: Interactive maps (when needed)

### Development Environment

- **Node.js LTS**: Required for development
- **FFmpeg**: Video processing and frame extraction
- **Visual Studio Code**: Recommended IDE with Svelte extensions

---

## Map Visualizations

### GeoJSON Integration

We can load and render GeoJSON data for geographic visualizations:

```typescript
// Loading GeoJSON data
const geojsonResponse = await fetch('/src/lib/data/europe.geojson');
const geojsonData = await geojsonResponse.json();

// Creating projection
const projection = d3
  .geoMercator()
  .fitSize([width, height], geojsonData)
  .precision(100);

// Path generator
const path = d3.geoPath().projection(projection);
```

### Interactive Map Features

#### 1. Country Highlighting

- Smooth color transitions for highlighting specific countries
- Pale effect for non-highlighted countries
- Configurable highlight colors and intensities

```typescript
function updateMapColors() {
  countryPaths.attr('fill', (d: any) => {
    const value = data.find(
      (item) => item.country === d.properties.ISO3
    )?.value;
    if (value) {
      const originalColor = d3.color(colorScale(value));
      if (originalColor) {
        if (isHighlighted) {
          return originalColor.toString();
        } else {
          const paleIntensity = 0.75;
          const paleColor = d3.interpolate(
            originalColor,
            d3.color('#f8f8f8')!
          )(paleIntensity);
          return d3.interpolate(originalColor, paleColor)(animState).toString();
        }
      }
    }
    return d3
      .interpolate(d3.color('#e0e0e0')!, d3.color('#f8f8f8')!)(animState)
      .toString();
  });
}
```

#### 2. Zoom Functionality

- Zoom to specific countries or regions
- Smooth transitions with D3
- Configurable zoom levels and positioning

```typescript
function zoomToCountryRegion(countryCode: string) {
  const countryFeature = geojsonData.features.find(
    (f: any) => f.properties.ISO3 === countryCode
  );

  if (countryFeature) {
    const targetExtent: [[number, number], [number, number]] = [
      [0, 0],
      [width * 0.7, height],
    ];
    const newProjection = d3
      .geoMercator()
      .fitExtent(targetExtent, countryFeature as any)
      .precision(100);

    projection = newProjection;
    path = d3.geoPath().projection(projection);

    countryPaths
      .transition()
      .duration(1200)
      .ease(d3.easeCubicInOut)
      .attr('d', path);
  }
}
```

#### 3. Pitch/Rotation Effects

- 3D perspective transformations
- CSS transforms for pitch effects
- Smooth transitions between different angles

```typescript
function applyPitchAngle(angle: number) {
  if (angle > 0) {
    const transform = `perspective(1500px) rotateX(${angle}deg) scale(0.85)`;
    svg
      .select('g')
      .transition()
      .duration(1200)
      .ease(d3.easeCubicInOut)
      .style('transform', transform);
  } else {
    const transform = `perspective(1000px) rotateX(0deg) scale(1)`;
    svg
      .select('g')
      .transition()
      .duration(1200)
      .ease(d3.easeCubicInOut)
      .style('transform', transform);
  }
}
```

#### 4. Fullwidth Map Display

- Maps that cover the entire viewport
- Responsive design considerations
- Background removal and text overlap prevention

---

## Scrollytelling Framework

### Scroll-Driven Interactions

We use Scrollama for scroll-based animations and state management:

```typescript
import { scroller } from '$lib/scroll';

let currentStep = 0;

onMount(() => {
  scroller({
    step: '.step',
    offset: 0.8,
    progress: (i) => (currentStep = i),
  });
});
```

### Step-Based Content Management

- Each scroll step corresponds to a specific visual state
- Smooth transitions between steps
- Reactive updates based on scroll position

### Layout Patterns

We follow specific layout patterns for scrollytelling:

1. **FullWidthSection**: Edge-to-edge content
2. **TwoColumnGrid**: Side-by-side content
3. **CenteredBlock**: Focused content
4. **FloatSideBlock**: Floating content
5. **StickyScrollBlock**: Sticky visual with scrolling text

---

## Chart Components

### D3-Based Charts

We can create various chart types using D3.js:

- **Bar Charts**: For categorical data comparisons
- **Line Charts**: For time series data
- **Scatter Plots**: For correlation analysis
- **Area Charts**: For cumulative data
- **Custom Visualizations**: Tailored to specific data needs

### Chart Features

- **Responsive Design**: Charts adapt to container size
- **Interactive Elements**: Hover effects, tooltips
- **Smooth Animations**: Transitions between data states
- **Data Binding**: Reactive updates based on data changes

### Example Chart Structure

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let data: any[] = [];
  export let width: number = 600;
  export let height: number = 400;

  let chartContainer: HTMLDivElement;

  onMount(() => {
    // Chart initialization
    const svg = d3
      .select(chartContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Chart logic here
  });
</script>

<div bind:this={chartContainer} class="chart-container"></div>
```

---

## 3D & Video Integration

### 3D Models

- **GLB/GLTF Support**: Load and display 3D models
- **Three.js Integration**: For complex 3D scenes
- **Model Positioning**: Control model placement and orientation

### Video Integration

- **Video Sprites**: Frame-by-frame video playback
- **FFmpeg Processing**: Convert videos to image sequences
- **Scroll-Synchronized Video**: Video playback tied to scroll position

### Video Processing Workflow

```bash
# Convert video to image sequence
ffmpeg -i original.mp4 -vf fps=12,scale=1280:-1 output/frame_%04d.jpg
```

---

## Data Handling

### CSV Parsing

We can parse and transform CSV data for visualizations:

```typescript
// CSV Parser utility
export function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map((line) => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index]?.trim();
    });
    return obj;
  });
}
```

### Data Transformation

- **Data Cleaning**: Remove invalid entries
- **Type Conversion**: Convert strings to numbers
- **Aggregation**: Group and summarize data
- **Filtering**: Select relevant data subsets

### Sample Data Structure

```typescript
interface CountryData {
  country: string;
  value: number;
  category?: string;
}

const sampleData: CountryData[] = [
  { country: 'DEU', value: 765.7 },
  { country: 'FRA', value: 543.2 },
  { country: 'ITA', value: 432.1 },
];
```

---

## Animation & Transitions

### Smooth Animations

We use D3 transitions for smooth, performant animations:

```typescript
// Basic transition
element.transition().duration(1200).ease(d3.easeCubicInOut).attr('d', newPath);

// Custom easing functions
function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}
```

### Animation States

- **RequestAnimationFrame**: For 60fps animations
- **State Management**: Track animation progress
- **Interpolation**: Smooth value transitions

### Transition Types

1. **Color Transitions**: Smooth color changes
2. **Position Transitions**: Element movement
3. **Scale Transitions**: Size changes
4. **Opacity Transitions**: Fade effects

---

## Component Architecture

### Svelte Component Structure

```svelte
<script lang="ts">
  // Props
  export let data: any[] = [];
  export let title: string = '';
  export let subtitle: string = '';

  // Reactive variables
  let chartContainer: HTMLDivElement;
  let currentState = 0;

  // Lifecycle
  onMount(() => {
    // Initialization
  });

  onDestroy(() => {
    // Cleanup
  });

  // Reactive statements
  $: if (data && chartContainer) {
    updateChart();
  }
</script>

<div bind:this={chartContainer} class="chart-container">
  <!-- Chart content -->
</div>

<style>
  .chart-container {
    width: 100%;
    height: 100%;
  }
</style>
```

### Component Communication

- **Props**: Pass data and configuration
- **Events**: Emit changes to parent components
- **Stores**: Share state across components

### Reusable Components

We've built several reusable components:

- `EuropeMapChart.svelte`: Interactive European map
- `TurkeyMap.svelte`: Turkey-specific map
- `TimeSeriesChart.svelte`: Time-based charts
- `BarChart.svelte`: Bar chart component

---

## Best Practices

### Performance Optimization

1. **Debounce Scroll Events**: Prevent excessive updates
2. **Use RequestAnimationFrame**: For smooth animations
3. **Lazy Load Assets**: Load images and data on demand
4. **Optimize D3 Selections**: Cache selections when possible

### Code Organization

1. **Separate Concerns**: Keep logic, presentation, and data separate
2. **Type Safety**: Use TypeScript interfaces
3. **Error Handling**: Graceful fallbacks for missing data
4. **Documentation**: Comment complex logic

### Accessibility

1. **ARIA Labels**: Screen reader support
2. **Keyboard Navigation**: Keyboard-accessible interactions
3. **Color Contrast**: Ensure readable text
4. **Reduced Motion**: Respect user preferences

### Responsive Design

1. **Flexible Layouts**: Adapt to different screen sizes
2. **Touch Interactions**: Mobile-friendly interactions
3. **Performance**: Optimize for mobile devices

---

## Troubleshooting

### Common Issues

#### 1. Map Not Rendering

- Check GeoJSON data format
- Verify projection setup
- Ensure container has dimensions

#### 2. Animations Not Smooth

- Use D3 transitions instead of CSS
- Check for conflicting animations
- Verify easing functions

#### 3. Scroll Interactions Not Working

- Check Scrollama setup
- Verify step selectors
- Ensure proper event handling

#### 4. Performance Issues

- Optimize D3 selections
- Reduce DOM manipulations
- Use efficient data structures

### Debugging Tools

- **Console Logging**: Track component state
- **Browser DevTools**: Inspect DOM and performance
- **D3 Debugging**: Use D3's built-in debugging

### Testing Checklist

- [ ] Component renders correctly
- [ ] Props update properly
- [ ] Animations are smooth
- [ ] Responsive on different screens
- [ ] Accessibility features work
- [ ] Performance is acceptable

---

## Future Enhancements

### Planned Features

1. **More Chart Types**: Additional D3 visualizations
2. **Advanced Animations**: Complex transition sequences
3. **Data Sources**: Real-time data integration
4. **Export Options**: PDF and image export
5. **Collaboration**: Multi-user editing

### Technical Improvements

1. **WebGL Integration**: For complex 3D scenes
2. **Web Workers**: For heavy computations
3. **Service Workers**: For offline support
4. **PWA Features**: App-like experience

---

## Conclusion

This guide documents our comprehensive toolkit for creating interactive data stories. We have successfully implemented:

- ✅ Interactive map visualizations with zoom, pitch, and highlighting
- ✅ Smooth scrollytelling framework with scroll-driven animations
- ✅ D3-based chart components with responsive design
- ✅ 3D model and video integration
- ✅ Robust data handling and CSV parsing
- ✅ Performance-optimized animations and transitions
- ✅ Component-based architecture with TypeScript
- ✅ Accessibility and responsive design considerations

This foundation enables us to create sophisticated, interactive data stories that rival professional newsroom graphics while maintaining code quality and performance.

---

_Last Updated: [Current Date]_
_Version: 1.0_
