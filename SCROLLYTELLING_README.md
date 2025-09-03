# Scrollytelling Setup for Bluprint Graphics Kit

This document explains how to use the scrollytelling functionality that has been added to your Bluprint graphics kit.

## 🎯 What's Been Added

### 1. Scroll Utility (`src/utils/scroll.ts`)

A lightweight scroll detection utility that replaces Scrollama functionality:

- Uses Intersection Observer API for performance
- Configurable offset and threshold
- Debug mode for development
- Clean Svelte integration

### 2. Scrollytelling Page (`pages/scrollytelling/+page.svelte`)

A complete scrollytelling example with:

- Sticky graphic pane on the left
- Scrollable text content on the right
- Step-based chart switching
- Responsive design

### 3. Chart Components

Three example chart components in `src/lib/components/charts/`:

- `IntroChart.svelte` - Bar chart showing digital transformation adoption
- `ZoomableMap.svelte` - Interactive world map with regions
- `DollarsBar.svelte` - Investment spending visualization

## 🚀 How to Use

### Basic Setup

1. **Visit the scrollytelling page:**

   ```
   http://localhost:5173/scrollytelling
   ```

2. **The page demonstrates:**
   - Scroll-driven chart switching
   - Sticky graphic pane
   - Responsive layout
   - Step-based storytelling

### Creating Your Own Scrollytelling Story

1. **Create a new page:**

   ```bash
   # Create a new directory in pages/
   mkdir pages/my-story
   ```

2. **Set up the scroll utility:**

   ```svelte
   <script>
     import { scroller } from '$utils/scroll';
     import { onMount } from 'svelte';

     let currentStep = 0;

     onMount(() => {
       scroller({
         step: '.step',
         offset: 0.8,
         progress: (i) => (currentStep = i),
         debug: true,
       });
     });
   </script>
   ```

3. **Structure your content:**
   ```svelte
   <div class="scrollytelling-container">
     <!-- Sticky graphic pane -->
     <div class="graphic-pane">
       {#if currentStep === 0}
         <YourChart1 />
       {:else if currentStep === 1}
         <YourChart2 />
       {/if}
     </div>

     <!-- Scrollable text -->
     <div class="text-content">
       <section class="step">
         <BodyText text="Your first step content..." />
       </section>

       <section class="step">
         <BodyText text="Your second step content..." />
       </section>
     </div>
   </div>
   ```

## 📊 Chart Components

### Creating Custom Charts

Each chart component should:

- Accept `width` and `height` props
- Be self-contained with its own styles
- Use responsive design principles
- Include proper accessibility features

Example structure:

```svelte
<script lang="ts">
  export let width: number | null = null;
  export let height: number | null = null;
</script>

<div class="your-chart" style="width: {width}px; height: {height}px;">
  <!-- Your chart content -->
</div>

<style lang="scss">
  .your-chart {
    /* Your styles */
  }
</style>
```

### Available Chart Types

1. **Static Charts** (like the examples)

   - Good for simple visualizations
   - Fast loading
   - Easy to customize

2. **Interactive Charts** (D3.js)

   ```bash
   pnpm add d3
   ```

   - Complex data visualizations
   - Animations and transitions
   - Real-time data updates

3. **Maps** (Mapbox GL)
   ```bash
   pnpm add mapbox-gl @types/mapbox-gl
   ```
   - Interactive maps
   - Zoom and pan functionality
   - Custom data layers

## 🎨 Styling

### CSS Grid Layout

The scrollytelling container uses CSS Grid:

```scss
.scrollytelling-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
```

### Sticky Graphic Pane

```scss
.graphic-pane {
  position: sticky;
  top: 2rem;
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Step Spacing

```scss
.step {
  margin-bottom: 100vh; // Creates scroll space between steps
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

## 📱 Responsive Design

The scrollytelling layout automatically adapts to mobile:

- Single column layout on small screens
- Reduced graphic pane height
- Adjusted step spacing

## 🔧 Configuration Options

### Scroll Utility Options

```typescript
interface ScrollOptions {
  step: string; // CSS selector for step elements
  offset?: number; // Trigger threshold (0-1, default: 0.8)
  progress?: (index: number) => void; // Callback function
  debug?: boolean; // Enable debug logging
}
```

### Performance Tips

1. **Use `onMount`** for scroll initialization
2. **Clean up observers** in `onDestroy`
3. **Debounce scroll events** for smooth performance
4. **Optimize images** and assets
5. **Use CSS transforms** for animations

## 🚀 Next Steps

### Adding D3.js Charts

1. Install D3: `pnpm add d3`
2. Create chart components with D3
3. Add animations and transitions
4. Handle responsive resizing

### Adding Mapbox Maps

1. Install Mapbox: `pnpm add mapbox-gl @types/mapbox-gl`
2. Get a Mapbox access token
3. Create map components
4. Add zoom/pan animations

### Adding Video Sequences

1. Use FFmpeg to create frame sequences
2. Create a sprite scroller component
3. Load frames based on scroll position
4. Optimize for performance

## 📚 Resources

- [Scrollama Documentation](https://github.com/russellgoldenberg/scrollama)
- [D3.js Documentation](https://d3js.org/)
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [Reuters Graphics Components](https://reuters-graphics.github.io/graphics-components/)

## 🐛 Troubleshooting

### Common Issues

1. **Charts not switching:**

   - Check that step elements have the correct class
   - Verify scroll utility is initialized
   - Check browser console for errors

2. **Performance issues:**

   - Optimize images and assets
   - Use CSS transforms instead of layout changes
   - Debounce scroll events

3. **Mobile layout issues:**
   - Test on various screen sizes
   - Adjust breakpoints in CSS
   - Consider mobile-first design

### Debug Mode

Enable debug mode to see scroll events in console:

```javascript
scroller({
  step: '.step',
  debug: true,
});
```

---

Happy scrollytelling! 🎉
