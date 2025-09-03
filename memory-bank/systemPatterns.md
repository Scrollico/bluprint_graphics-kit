# System Patterns - Bluprint Graphics Kit

## Architecture Overview

The Bluprint Graphics Kit follows a component-based architecture built on SvelteKit, designed for creating interactive data stories with scroll-driven narratives.

## Core Architecture Patterns

### 1. Component-Based Architecture

#### Layout Containers (Structural Building Blocks)

- **FullWidthSection**: 100% width, edge-to-edge viewport
- **TwoColumnGrid**: Custom width splits (65/35, 50/50)
- **CenteredBlock**: Max-width centered content
- **FloatSideBlock**: ~200-400px floating blocks
- **StickyScrollBlock**: Custom width with sticky positioning

#### Content Components

- **HeroImage**: Large visual for section/story open
- **MapViz**: Data-driven maps with stations/lines/points
- **TimeSeriesChart**: Timeline, bar/line graphs
- **PersonPortrait**: Images for notable people
- **TestimonialQuote**: Large styled quotes
- **FactBox**: Short stats/facts
- **CallToAction**: Summary buttons/help banners
- **Infographic**: Rich multi-data visuals
- **EmbeddedMedia**: Video, audio, social posts

### 2. Scrollytelling Framework

#### Scroll-Driven State Management

```typescript
// Scroll state management
let current = 0;
scroller({
  step: '.step',
  offset: 0.8,
  progress: (i) => (current = i),
});
```

#### Step-Based Content Structure

- Each narrative step is a `<section class="step">`
- Steps trigger visual state changes
- Smooth transitions between states
- Responsive design across devices

### 3. Data Visualization Patterns

#### Chart Component Pattern

```typescript
// Reusable chart components
interface ChartProps {
  data: any[];
  width: number;
  height: number;
  colorScale?: string[];
}
```

#### Map Visualization Pattern

```typescript
// Interactive map components
interface MapProps {
  geojsonData: any;
  center: [number, number];
  zoom: number;
  highlightCountries?: string[];
}
```

### 4. Responsive Design Patterns

#### Mobile-First Approach

- All components stack on mobile
- FloatSideBlock appears above/below host paragraph
- Touch-friendly interactions
- Optimized performance for mobile devices

#### Breakpoint System

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Key Design Patterns

### 1. Container-Component Pattern

Always assign components to parent containers:

- "Place FactBox in FloatSideBlock, float right"
- "Add MapViz in TwoColumnGrid left column"
- "Use HeroImage in FullWidthSection"

### 2. Named Layout Patterns

Standard "recipes" of containers + components:

- **HeroLaunch**: FullWidthSection > HeroImage
- **MapStory**: TwoColumnGrid > MapViz Left, StoryText Right
- **TimelineBreak**: FullWidthSection > TimeSeriesChart
- **CharacterFocus**: TwoColumnGrid > PersonPortrait Left, Incident Right
- **QuotePause**: CenteredBlock > TestimonialQuote
- **ScrollPinned**: StickyScrollBlock > Sticky Media, Scrolling Text
- **FactScatter**: FloatSideBlock > FactBox within paragraph
- **FinalAction**: FullWidthSection/CenteredBlock > CallToAction

### 3. Animation Patterns

#### Scroll-Driven Animations

```typescript
// Smooth transitions based on scroll position
function updateVisualization(progress: number) {
  const easedProgress = easeInOutCubic(progress);
  // Update visual state based on eased progress
}
```

#### Staggered Animations

```typescript
// Sequential element animations
elements.forEach((element, index) => {
  element.style.animationDelay = `${index * 0.1}s`;
});
```

### 4. Data Flow Patterns

#### Props Down, Events Up

- Parent components pass data via props
- Child components emit events for state changes
- Centralized state management for complex interactions

#### Reactive Data Binding

```typescript
// Svelte reactive statements
$: chartData = processData(rawData);
$: chartConfig = createChartConfig(chartData);
```

## File Organization Patterns

### 1. Page Structure

```
pages/
├── +page.svelte          # Main story page
├── +page.ts              # Page data loading
├── story-name/
│   ├── +page.svelte      # Story-specific page
│   └── +page.ts          # Story data
```

### 2. Component Organization

```
src/lib/
├── components/
│   ├── charts/           # Chart components
│   ├── maps/             # Map components
│   └── ui/               # UI components
├── data/                 # Data files (CSV, JSON, GeoJSON)
├── styles/               # Global styles
└── utils/                # Utility functions
```

### 3. Asset Organization

```
assets/
├── images/               # Static images
├── videos/               # Video files
├── 3d/                   # 3D models (GLB/GLTF)
└── data/                 # Data assets
```

## Performance Patterns

### 1. Lazy Loading

- Components load only when needed
- Images use lazy loading
- Video frames load progressively

### 2. Asset Optimization

- Images compressed and optimized
- Video converted to frame sequences
- 3D models optimized for web

### 3. Code Splitting

- Vite automatically chunks code
- Components split by route
- Dynamic imports for heavy components

## Accessibility Patterns

### 1. Screen Reader Support

- Proper ARIA labels
- Semantic HTML structure
- Keyboard navigation support

### 2. Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable animations for motion-sensitive users */
}
```

### 3. Color Contrast

- WCAG AA compliant color combinations
- High contrast mode support
- Color-blind friendly palettes
