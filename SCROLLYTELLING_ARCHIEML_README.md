# Scrollytelling with ArchieML Integration

A sophisticated, markup-based scrollytelling system inspired by pudding.cool, with Google Docs integration via ArchieML.

## Features

✅ **ArchieML Parser** - Convert Google Docs to structured stories
✅ **Robust Scrollytelling Engine** - Deterministic step detection with debugging
✅ **Visual Editor Dashboard** - Manage steps, preview, and sync with Google Docs
✅ **Mapbox Integration** - Smooth, step-based map transitions
✅ **Component Registry** - Visual mapping of narrative steps to components

## Quick Start

### 1. Create Your Story in Google Docs

Use this ArchieML template:

```
title: Your Story Title
description: A brief description of your story
authors: Author Name
publishDate: 2025-01-01

layout.type: two-column
layout.sticky: right

[steps]

id: intro
type: intro
headline: Opening Statement
text: This is the opening paragraph of your story.

{}

id: map-1
type: map
headline: First Map View
text: Description of what we're looking at
map.center: [28.9784, 41.0082]
map.zoom: 12
map.pitch: 45

{}

id: chart-1
type: chart
headline: Data Visualization
text: Explanation of the data
chart.type: line
chart.data: path/to/data.csv

[]
```

### 2. Access the Story Editor

Navigate to `/story-editor` in your development environment.

### 3. Sync Your Google Doc

1. Make your Google Doc publicly viewable
2. Copy the document URL
3. Paste it in the editor and click "Sync"

### 4. Edit and Preview

- **Add/Remove Steps**: Use the + and × buttons
- **Reorder Steps**: Use the ↑↓ arrows
- **Edit Content**: Click any step to edit
- **Live Preview**: Toggle preview to see changes
- **Debug Mode**: Enable to see scroll positions and step boundaries

## System Architecture

### Core Components

1. **ArchieML Parser** (`src/lib/archieml/parser.ts`)

   - Converts ArchieML text to structured story format
   - Supports multiple step types: text, map, chart, media, intro, conclusion
   - Handles map configurations, media embeds, and transitions

2. **Google Docs Sync** (`src/lib/archieml/google-docs-sync.ts`)

   - Fetches content from Google Docs
   - Supports public documents (no auth required)
   - Local caching for performance

3. **Scrollytelling Engine** (`src/lib/scrollytelling/ScrollytellingEngine.svelte`)

   - Robust scroll detection with Intersection Observer
   - Debug panel with step minimap
   - Progress tracking and smooth transitions
   - Mobile-responsive two-column layout

4. **Mapbox Integration** (`src/lib/scrollytelling/MapboxScrolly.svelte`)

   - Deterministic map control based on steps
   - Smooth camera transitions
   - Layer visibility/opacity control
   - Marker support

5. **Story Editor** (`pages/story-editor/+page.svelte`)
   - Visual step management
   - Drag-and-drop reordering
   - Live preview with debug mode
   - Export to JSON

## Step Types

### Text Step

```
id: step-1
type: text
headline: Section Title
text: Your narrative content here
```

### Map Step

```
id: map-1
type: map
headline: Map Title
text: Description
map.center: [longitude, latitude]
map.zoom: 12
map.pitch: 45
map.bearing: 0
[map.layers]
id: layer-name
visibility: visible
opacity: 0.8
[]
```

### Chart Step

```
id: chart-1
type: chart
headline: Chart Title
text: Description
chart.type: line
chart.data: data/file.csv
```

### Media Step

```
id: media-1
type: media
headline: Media Title
text: Description
media.type: image
media.src: path/to/image.jpg
media.caption: Image caption
```

## Map Configuration

The Mapbox integration supports:

- **Camera Control**: center, zoom, pitch, bearing
- **Layer Management**: visibility and opacity per layer
- **Markers**: Add points of interest
- **Smooth Transitions**: Tweened animations between states

Example:

```javascript
map: {
  center: [28.9784, 41.0082],
  zoom: 14.5,
  pitch: 60,
  bearing: -20,
  layers: [
    { id: 'marmaray-line', visibility: 'none' },
    { id: 'metro-lines', visibility: 'visible', opacity: 1 }
  ],
  markers: [
    { lng: 28.9489, lat: 41.0138, label: 'Yenikapı' }
  ]
}
```

## Debug Features

Enable debug mode to see:

- Current active step
- Scroll progress percentage
- Container and viewport dimensions
- Step boundaries minimap
- Map state (center, zoom, pitch, bearing)
- Layer states

## Component Registry

The system includes a component registry for mapping story components:

```javascript
import {
  registry,
  defineComponent,
} from '$lib/scrollytelling/ComponentRegistry';

// Register a custom component
registry.register(
  defineComponent({
    name: 'CustomChart',
    component: CustomChartComponent,
    description: 'Interactive data visualization',
    category: 'chart',
    props: {
      data: { type: 'string', required: true },
      width: { type: 'number', default: 800 },
      height: { type: 'number', default: 400 },
    },
    capabilities: {
      animate: true,
      interact: true,
    },
  })
);
```

## Example Implementation

See `/story-example` for a complete implementation showing:

- Story structure
- Step transitions
- Map integration
- Debug controls
- Mobile responsiveness

## Troubleshooting

### Google Docs Sync Issues

- Ensure document is publicly viewable
- Check for CORS issues (uses proxy fallback)
- Verify ArchieML syntax

### Scroll Performance

- Enable debug mode to check step detection
- Adjust threshold and offset values
- Check for CSS conflicts

### Map Transitions

- Verify Mapbox token is set
- Check layer IDs exist in style
- Use debug panel to inspect state

## Future Enhancements

- [ ] Authentication for private Google Docs
- [ ] Real-time collaboration
- [ ] Advanced chart components
- [ ] 3D model support
- [ ] Animation timeline editor
- [ ] Multi-language support
- [ ] Analytics integration

## References

- [ArchieML Documentation](https://archieml.org/)
- [Pudding.cool Scrollytelling Guide](https://pudding.cool/process/how-to-implement-scrollytelling/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Svelte Motion](https://svelte.dev/docs/svelte-motion)
