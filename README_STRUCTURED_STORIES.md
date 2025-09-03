# 🎯 Structured Scrollytelling System

## The Problem This Solves

**AI Hallucination & Interpretation Issues**: When you tell an AI "Step 2.1 add turkey map, step 2.2 zoom in to istanbul", the AI has to interpret:

- What "add turkey map" means in your codebase
- Which component to use
- What props to pass
- How to implement the zoom functionality
- State management between steps

This creates ambiguity → hallucination → frustration.

## The Solution

**Structured Command System**: Instead of natural language that requires interpretation, you define your stories using a precise YAML schema that maps 1:1 to your component library.

### Before (AI Interpretation)

```
"Step 2.1 add turkey map, step 2.2 zoom in to istanbul"
```

❌ AI has to guess what you mean
❌ May use wrong component
❌ May not implement zoom correctly
❌ Results vary between runs

### After (Structured Commands)

```yaml
steps:
  - id: '2.1'
    type: 'chart'
    content:
      text: "Here's the overall view of Turkey."
    visual:
      component: 'TurkeyMapChart'
      data: 'turkey.json'
      props:
        width: 800
        height: 600

  - id: '2.2'
    type: 'map_action'
    content:
      text: "Now let's zoom into Istanbul."
    visual:
      component: 'TurkeyMapChart'
      state:
        zoom:
          region: 'istanbul'
          coordinates: [28.9784, 41.0082]
          level: 8
```

✅ Crystal clear component mapping
✅ Exact props and state
✅ Deterministic execution
✅ No hallucination possible

## Quick Start

### 1. Create a Structured Story

```bash
# Create Turkey map story (your exact example)
pnpm story:structured my-turkey-story turkey-map

# Or other templates
pnpm story:structured europe-analysis europe-map
pnpm story:structured time-trends time-series
```

### 2. Edit the Generated YAML

The script creates `pages/my-turkey-story/story.yaml`:

```yaml
meta:
  title: 'My Turkey Story'
  description: 'Regional analysis with zoom'
  authors: ['Your Name']

steps:
  - id: '2.1'
    type: 'chart'
    visual:
      component: 'TurkeyMapChart'
      # Exact props, no guessing

  - id: '2.2'
    type: 'map_action'
    visual:
      state:
        zoom:
          region: 'istanbul'
          # Exact coordinates
```

### 3. Compile to Svelte

```bash
cd pages/my-turkey-story
./compile.js
```

The compiler generates a complete Svelte component with:

- Proper imports for your components
- State management for step transitions
- Responsive layout
- Error handling

## Available Components

Your component library is fully mapped:

### Maps

- `TurkeyMapChart` - Interactive Turkey map with zoom/highlight
- `TurkeyMap` - Simple Turkey outline
- `EuropeanMapChart` - Interactive European map
- `EuropeMapChart` - Alternative Europe map
- `ZoomableMap` - Generic zoomable map
- `IstanbulMetroMap` - Metro system visualization

### Charts

- `TimeChart` - Time series visualization
- `SwarmChart` - Bee swarm distribution plots
- `DollarsBar` - Bar charts with currency formatting
- `MarmarayStationChart` - Station-specific data
- `IntroChart` - Story introduction visuals

### 3D/Specialized

- `Railroad3D` - Three.js 3D train visualization

## Component Capabilities

Each component has documented capabilities:

```yaml
visual:
  component: 'TurkeyMapChart'
  state:
    zoom: # ✅ Supported
      region: 'istanbul'
      coordinates: [28.9784, 41.0082]
      level: 8
    highlight: # ✅ Supported
      regions: ['istanbul']
      intensity: 0.8
    filter: # ✅ Supported
      field: 'population'
      operator: 'greater'
      value: 1000000
```

## Step Types

Crystal clear step definitions:

- `intro` - Story introduction with headline
- `text` - Text-only narrative step
- `chart` - Display visualization component
- `map_action` - Map state change (zoom, highlight, etc.)
- `data_update` - Update chart data/filtering
- `annotation` - Add callouts/annotations
- `comparison` - Side-by-side comparisons
- `conclusion` - Story wrap-up

## Validation & Error Prevention

The system validates your story before compilation:

```bash
✅ Story compiled successfully!
⚠️  Warnings:
  - TurkeyMap component may not support zoom functionality
  - Consider using TurkeyMapChart instead

❌ Compilation failed:
  - Unknown component: TurkeyChart
  - Available: TurkeyMapChart, TurkeyMap, ...
```

## Advanced Features

### State Management

```yaml
visual:
  component: 'TurkeyMapChart'
  state:
    zoom:
      region: 'istanbul'
    highlight:
      regions: ['istanbul', 'ankara']
      intensity: 0.9
    annotations:
      - id: 'callout1'
        position: { x: '50%', y: '30%' }
        content: 'Key insight here'
```

### Transitions

```yaml
transition:
  duration: 1500 # milliseconds
  ease: 'ease-out' # CSS easing
  delay: 200 # delay before start
```

### Layouts

```yaml
layout:
  type: 'two-column' # or "full-width", "centered"
  sticky: 'graphic' # sticky visual pane
  graphicPosition: 'left' # visual on left, text on right
```

### Data Sources

```yaml
data:
  - id: 'turkey_regions'
    type: 'json'
    source: 'turkey.json'
    transform:
      - type: 'filter'
        field: 'population'
        operator: 'greater'
        value: 100000
```

## Templates

### Turkey Map Template

Perfect for your use case - includes zoom to Istanbul:

```bash
pnpm story:structured regional-analysis turkey-map
```

### Europe Map Template

For European country analysis:

```bash
pnpm story:structured europe-trends europe-map
```

### Time Series Template

For temporal data stories:

```bash
pnpm story:structured incident-trends time-series
```

## Benefits

### ✅ No More AI Hallucination

- Deterministic component mapping
- Exact prop specification
- Validated state transitions

### ✅ Crystal Clear Commands

- Your "add turkey map" → `component: "TurkeyMapChart"`
- Your "zoom to istanbul" → `state.zoom.region: "istanbul"`
- No ambiguity or interpretation

### ✅ Comprehensive Validation

- Component existence checking
- Prop validation against component specs
- Capability verification (does component support zoom?)
- Data format compatibility
- UX best practices

### ✅ Developer Experience

- Auto-completion in editors with YAML schema
- Clear error messages with fix suggestions
- Live recompilation during development
- Version control friendly (YAML diffs)

### ✅ Collaboration Ready

- Designers can edit YAML without code knowledge
- Reviewable story definitions
- Template sharing across team

## Migration from Manual Stories

Convert existing scrollytelling stories:

1. Identify your current steps and components
2. Map to structured schema using templates
3. Validate and compile
4. Test in browser
5. Iterate on YAML (much faster than code)

## Next Steps

1. **Try it**: Create your Turkey map story with `pnpm story:structured`
2. **Customize**: Edit the YAML to match your exact needs
3. **Extend**: Add custom components to the registry
4. **Scale**: Use templates for consistent story patterns

This system eliminates the AI interpretation layer that was causing your frustration. Every command maps to exact code - no more hallucination, no more ambiguity.

**Your exact example now works perfectly every time**:

- Step 2.1: "add turkey map" → Deterministic `TurkeyMapChart` component
- Step 2.2: "zoom to istanbul" → Exact `state.zoom` configuration

🎯 **Crystal clear execution, every single time.**
