# 🚀 Marmaray Scrollytelling Guide

## What's Ready Now

✅ **D3 Swarm Chart**: Advanced dot matrix with force simulation for organic positioning
✅ **Step-by-step reveal**: Each scroll step shows more dots (1, 2, 3... up to 29)
✅ **Smooth animations**: D3 transitions with elastic easing
✅ **Interactive dots**: Hover effects and responsive interactions
✅ **Turkish content**: Your markdown loaded and split into scroll steps
✅ **Custom styling**: Dark theme with dramatic red dots

## How It Works

1. **First 29 steps**: Shows the D3 swarm chart with dots appearing one by one
2. **Steps 30-32**: Shows overview chart
3. **Steps 33-35**: Shows map visualization
4. **Steps 36-38**: Shows timeline chart
5. **After step 38**: Cycles through charts

## View Your Story

Visit: `http://localhost:3002/marmaray`

You'll see:

- 🔴 **D3 Swarm of red dots** - each represents one person
- 📊 **Counter** showing current number (1, 2, 3... up to 29)
- ⚡ **Smooth D3 animations** with elastic easing
- 🎯 **Force simulation** for organic dot positioning
- 📝 **Your content** scrolling on the right
- 🎨 **Dark theme** with dramatic styling

## D3 Features

- **Force Simulation**: Dots naturally arrange themselves using D3's physics engine
- **Staggered Animation**: Each dot appears with a 150ms delay for dramatic effect
- **Elastic Easing**: Smooth, bouncy animations using `d3.easeElasticOut`
- **Interactive Hover**: Dots grow and change color on hover
- **Collision Detection**: Dots avoid overlapping using force collision

## Customize Your Story

### 1. Control Step Breaks

Edit `project-files/stories/marmaray.md`:

- Add `---` on its own line where you want each scroll step
- I've already added many breaks for dramatic pacing

### 2. Change Header/Footer

- **Header**: Edit `src/lib/components/site/CustomHeader.svelte`
- **Footer**: Edit `src/lib/components/site/CustomFooter.svelte`

### 3. Modify D3 Swarm Chart

Edit `src/lib/components/charts/SwarmChart.svelte`:

- Change colors, sizes, animations
- Modify force simulation parameters
- Adjust timing and positioning
- Customize hover effects

### 4. Add More Charts

Create new chart components in `src/lib/components/charts/` and add them to the step mapping in `pages/marmaray/+page.svelte`

## Quick Customization Examples

### Change Swarm Colors

```scss
// In SwarmChart.svelte, change:
.attr('fill', '#ef4444') // Red dots
// To:
.attr('fill', '#3b82f6') // Blue dots
```

### Change Animation Speed

```javascript
// In SwarmChart.svelte, change:
.delay((d: any, i: number) => i * 150)
// To:
.delay((d: any, i: number) => i * 100) // Faster
```

### Modify Force Simulation

```javascript
// In SwarmChart.svelte, adjust:
.force('charge', d3.forceManyBody().strength(5))
.force('collide', d3.forceCollide().radius(15))
// To:
.force('charge', d3.forceManyBody().strength(10)) // Stronger attraction
.force('collide', d3.forceCollide().radius(20))   // Larger collision radius
```

### Change Step Timing

```javascript
// In pages/marmaray/+page.svelte, modify:
if (stepIndex < 29) return 'swarm';
// Change to:
if (stepIndex < 15) return 'swarm'; // Show swarm for fewer steps
```

## Next Steps

1. **Test the story**: Visit http://localhost:3002/marmaray
2. **Customize styling**: Modify colors, fonts, spacing
3. **Add more charts**: Create new D3 visualizations
4. **Fine-tune timing**: Adjust when charts appear
5. **Enhance animations**: Add more D3 effects

Your dramatic D3 swarm opening is ready! Each scroll reveals another dot until all 29 lives are represented with beautiful force simulation. 🎯
