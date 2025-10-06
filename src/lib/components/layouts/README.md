# Reuters-Style Scrollytelling Layout System

A modular layout system inspired by Reuters Graphics storytelling, featuring 8 different layout components for data-driven narratives.

## Components Overview

### 1. SplitPanel

Side-by-side image and text layout for visual storytelling.

```svelte
<SplitPanel
  imageSrc="/path/to/image.jpg"
  imageAlt="Description"
  imageCaption="Optional caption"
  title="Section Title"
  text="<p>Content here</p>"
  reverse={false}
/>
```

### 2. FullscreenVisual

Large image/graphic with optional overlay text.

```svelte
<FullscreenVisual
  imageSrc="/path/to/image.jpg"
  imageAlt="Description"
  overlayTitle="Heat Index: 115°F"
  overlayText="Maximum recorded temperature"
  height="80vh"
/>
```

### 3. StatisticCallout

Large number/stat with context text.

```svelte
<StatisticCallout
  number="1.2M"
  label="People in federal and state prisons"
  context="More than 1.2 million Americans are incarcerated..."
  color="#d32f2f"
  size="large"
/>
```

### 4. PullQuote

Large, stylized quote with citation.

```svelte
<PullQuote
  quote="The heat was so intense..."
  citation="— Former correctional officer"
  size="large"
  accentColor="#d32f2f"
/>
```

### 5. SectionTitle

Full-width section breaks for major topic changes.

```svelte
<SectionTitle
  title="The Heat is On"
  subtitle="Inside America's most dangerous prisons"
  background="linear-gradient(135deg, #1a1a1a 0%, #333 100%)"
  textColor="white"
/>
```

## Usage in Stories

### Import Components

```svelte
<script>
  import {
    SplitPanel,
    FullscreenVisual,
    StatisticCallout,
    PullQuote,
    SectionTitle,
  } from '$lib/components/layouts';
</script>
```

### Example Story Structure

```svelte
<!-- Section Introduction -->
<SectionTitle title="The Crisis" subtitle="Understanding the scale" />

<!-- Key Statistics -->
<StatisticCallout number="40%" label="Increase in heat-related emergencies" />

<!-- Visual Evidence -->
<FullscreenVisual
  imageSrc="/heat-map.jpg"
  overlayTitle="Heat Index: 115°F"
  overlayText="Maximum recorded temperature"
/>

<!-- Detailed Analysis -->
<SplitPanel
  imageSrc="/prison-facility.jpg"
  title="Built for Security, Not Comfort"
  text="<p>Federal prisons were designed decades ago...</p>"
/>

<!-- Human Impact -->
<PullQuote
  quote="The heat was so intense that concrete walls radiated warmth like a furnace"
  citation="— Former correctional officer"
/>
```

## CSS Classes

### Base Classes

- `.layout-step` - Base styling for all layout steps
- `.layout-system-container` - Main container for layout system

### Component Classes

- `.split-panel-container` - Split panel wrapper
- `.fullscreen-visual-container` - Fullscreen visual wrapper
- `.statistic-callout-container` - Statistic callout wrapper
- `.pull-quote-container` - Pull quote wrapper
- `.section-title-container` - Section title wrapper

## Responsive Design

All components are mobile-responsive with appropriate breakpoints:

- **Desktop**: Full layouts as designed
- **Tablet**: Adjusted spacing and sizing
- **Mobile**: Stacked layouts, reduced text sizes, touch-friendly sizing

## Customization

### Colors

- Primary accent: `#d32f2f` (Reuters red)
- Text: `#333` (dark gray)
- Background: `#f8f9fa` (light gray)

### Typography

- Headings: Helvetica Neue, 300 weight
- Body text: Helvetica Neue, 400 weight
- Quotes: Georgia serif for quotation marks

## Browser Support

- Modern browsers with CSS Grid support
- Mobile Safari, Chrome, Firefox, Edge
- Progressive enhancement for older browsers

## Performance

- Lazy loading for images
- Minimal JavaScript footprint
- CSS-only animations where possible
- Optimized for Core Web Vitals
