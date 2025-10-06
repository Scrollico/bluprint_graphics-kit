/**
 * Component Registry - Maps story schema components to actual Svelte components
 * This eliminates ambiguity in AI interpretation by providing exact mappings
 */

import type { ComponentName } from './story-schema.js';
import type { SvelteComponent } from 'svelte';

// Dynamic imports for all chart components
const componentModules = {
  TurkeyMapChart: () => import('$lib/components/charts/TurkeyMapChart.svelte'),
  TurkeyMap: () => import('$lib/components/charts/TurkeyMap.svelte'),
  EuropeanMapChart: () =>
    import('$lib/components/charts/EuropeanMapChart.svelte'),
  EuropeMapChart: () => import('$lib/components/charts/EuropeMapChart.svelte'),
  IstanbulMetroMap: () =>
    import('$lib/components/charts/IstanbulMetroMap.svelte'),
  MarmarayStationChart: () =>
    import('$lib/components/charts/MarmarayStationChart.svelte'),
  ZoomableMap: () => import('$lib/components/charts/ZoomableMap.svelte'),
  SwarmChart: () => import('$lib/components/charts/SwarmChart.svelte'),
  TimeChart: () => import('$lib/components/charts/TimeChart.svelte'),
  IntroChart: () => import('$lib/components/charts/IntroChart.svelte'),
  DollarsBar: () => import('$lib/components/charts/DollarsBar.svelte'),
  Railroad3D: () => import('$lib/components/charts/Railroad3D.svelte'),
};

// Component metadata for validation and auto-completion
export interface ComponentInfo {
  name: ComponentName;
  description: string;
  category: 'map' | 'chart' | '3d' | 'specialized';
  requiredProps: string[];
  optionalProps: string[];
  dataFormat: 'csv' | 'json' | 'geojson' | 'array';
  capabilities: ComponentCapability[];
  examples: ComponentExample[];
}

export type ComponentCapability =
  | 'zoom'
  | 'highlight'
  | 'filter'
  | 'annotate'
  | 'animate'
  | 'interact'
  | '3d_render'
  | 'responsive';

export interface ComponentExample {
  title: string;
  description: string;
  props: Record<string, any>;
  data?: any;
}

// Component registry with full metadata
export const componentRegistry: Record<ComponentName, ComponentInfo> = {
  TurkeyMapChart: {
    name: 'TurkeyMapChart',
    description: 'Interactive map of Turkey with regional data visualization',
    category: 'map',
    requiredProps: [],
    optionalProps: ['data', 'width', 'height', 'colorScheme'],
    dataFormat: 'json',
    capabilities: ['zoom', 'highlight', 'filter', 'animate', 'responsive'],
    examples: [
      {
        title: 'Basic Turkey Map',
        description: 'Shows Turkey with basic regional coloring',
        props: { width: 800, height: 600 },
        data: 'turkey.json',
      },
      {
        title: 'Zoomed to Istanbul',
        description: 'Turkey map zoomed into Istanbul region',
        props: { width: 800, height: 600, zoomRegion: 'istanbul' },
      },
    ],
  },

  TurkeyMap: {
    name: 'TurkeyMap',
    description: 'Simplified Turkey map component',
    category: 'map',
    requiredProps: [],
    optionalProps: ['width', 'height'],
    dataFormat: 'geojson',
    capabilities: ['responsive'],
    examples: [
      {
        title: 'Simple Turkey Outline',
        description: 'Basic Turkey map outline',
        props: { width: 600, height: 400 },
      },
    ],
  },

  EuropeanMapChart: {
    name: 'EuropeanMapChart',
    description: 'Interactive European map with country-level data',
    category: 'map',
    requiredProps: [],
    optionalProps: ['data', 'width', 'height', 'highlightCountries'],
    dataFormat: 'json',
    capabilities: ['zoom', 'highlight', 'filter', 'animate', 'responsive'],
    examples: [
      {
        title: 'EU Countries Data',
        description: 'European map showing data by country',
        props: { width: 900, height: 700 },
        data: 'europe.geojson',
      },
      {
        title: 'Highlight Specific Countries',
        description: 'Highlight Turkey and neighboring countries',
        props: {
          width: 900,
          height: 700,
          highlightCountries: ['TUR', 'GRC', 'BGR'],
        },
      },
    ],
  },

  EuropeMapChart: {
    name: 'EuropeMapChart',
    description: 'Alternative European map component',
    category: 'map',
    requiredProps: [],
    optionalProps: ['data', 'width', 'height'],
    dataFormat: 'geojson',
    capabilities: ['zoom', 'highlight', 'responsive'],
    examples: [
      {
        title: 'Europe Overview',
        description: 'General European map',
        props: { width: 800, height: 600 },
      },
    ],
  },

  IstanbulMetroMap: {
    name: 'IstanbulMetroMap',
    description: 'Istanbul metro system visualization',
    category: 'specialized',
    requiredProps: [],
    optionalProps: ['data', 'highlightLine', 'showStations'],
    dataFormat: 'json',
    capabilities: ['highlight', 'filter', 'interact'],
    examples: [
      {
        title: 'Metro Lines Overview',
        description: 'All Istanbul metro lines',
        props: { showStations: true },
      },
      {
        title: 'Highlight M2 Line',
        description: 'Highlight specific metro line',
        props: { highlightLine: 'M2', showStations: true },
      },
    ],
  },

  MarmarayStationChart: {
    name: 'MarmarayStationChart',
    description: 'Marmaray train line with station data',
    category: 'specialized',
    requiredProps: [],
    optionalProps: ['data', 'highlightStations', 'showIncidents'],
    dataFormat: 'csv',
    capabilities: ['highlight', 'filter', 'annotate'],
    examples: [
      {
        title: 'Station Incident Data',
        description: 'Shows incidents by station',
        props: { showIncidents: true },
      },
    ],
  },

  ZoomableMap: {
    name: 'ZoomableMap',
    description: 'Generic zoomable map component',
    category: 'map',
    requiredProps: ['data'],
    optionalProps: ['width', 'height', 'initialZoom'],
    dataFormat: 'geojson',
    capabilities: ['zoom', 'interact', 'responsive'],
    examples: [
      {
        title: 'Zoomable Turkey',
        description: 'Turkey map with zoom controls',
        props: { width: 800, height: 600, initialZoom: 1 },
      },
    ],
  },

  SwarmChart: {
    name: 'SwarmChart',
    description: 'Bee swarm plot for distribution visualization',
    category: 'chart',
    requiredProps: ['data'],
    optionalProps: ['width', 'height', 'colorField', 'sizeField'],
    dataFormat: 'array',
    capabilities: ['filter', 'animate', 'interact'],
    examples: [
      {
        title: 'Value Distribution',
        description: 'Shows distribution of values as bee swarm',
        props: { width: 600, height: 400 },
      },
    ],
  },

  TimeChart: {
    name: 'TimeChart',
    description: 'Time series line/area chart',
    category: 'chart',
    requiredProps: ['data'],
    optionalProps: ['width', 'height', 'chartType', 'dateField', 'valueField'],
    dataFormat: 'csv',
    capabilities: ['filter', 'animate', 'annotate'],
    examples: [
      {
        title: 'Incidents Over Time',
        description: 'Shows incidents by month/year',
        props: {
          width: 800,
          height: 400,
          chartType: 'line',
          dateField: 'date',
          valueField: 'count',
        },
      },
    ],
  },

  IntroChart: {
    name: 'IntroChart',
    description: 'Introductory visualization component',
    category: 'chart',
    requiredProps: [],
    optionalProps: ['title', 'subtitle', 'backgroundImage'],
    dataFormat: 'json',
    capabilities: ['animate'],
    examples: [
      {
        title: 'Story Introduction',
        description: 'Opening visual for story',
        props: {
          title: 'Your Story Title',
          subtitle: 'Data visualization story',
        },
      },
    ],
  },

  DollarsBar: {
    name: 'DollarsBar',
    description: 'Bar chart with currency formatting',
    category: 'chart',
    requiredProps: ['data'],
    optionalProps: ['width', 'height', 'currency', 'orientation'],
    dataFormat: 'array',
    capabilities: ['animate', 'interact'],
    examples: [
      {
        title: 'Financial Data',
        description: 'Shows monetary values as bars',
        props: {
          width: 600,
          height: 400,
          currency: 'TRY',
          orientation: 'vertical',
        },
      },
    ],
  },

  Railroad3D: {
    name: 'Railroad3D',
    description: '3D railroad/train visualization using Three.js',
    category: '3d',
    requiredProps: [],
    optionalProps: ['modelPath', 'cameraPosition', 'lighting'],
    dataFormat: 'json',
    capabilities: ['3d_render', 'animate', 'interact'],
    examples: [
      {
        title: '3D Train Model',
        description: 'Interactive 3D railroad visualization',
        props: {
          modelPath: '/statics/3d/uploads_files_3685451_railroad.glb',
          cameraPosition: [0, 5, 10],
        },
      },
    ],
  },

  // Blueprint Charts - New unified chart system
  BlueprintChart: {
    name: 'BlueprintChart',
    description: 'Universal chart component supporting multiple chart types with consistent styling',
    category: 'chart',
    requiredProps: ['type'],
    optionalProps: ['data', 'config', 'width', 'height', 'responsive', 'loading', 'error'],
    dataFormat: 'array',
    capabilities: ['responsive', 'interactive', 'animated', 'accessible', 'exportable'],
    examples: [
      {
        title: 'Categorical Bar Chart',
        description: 'Simple bar chart for categorical data',
        props: {
          type: 'categorical-bar',
          data: [
            { category: 'A', value: 10 },
            { category: 'B', value: 20 },
            { category: 'C', value: 15 }
          ],
          width: 600,
          height: 400
        },
      },
      {
        title: 'Line Chart with Time Series',
        description: 'Time series line chart',
        props: {
          type: 'line-area',
          data: [
            { date: '2023-01-01', value: 100 },
            { date: '2023-02-01', value: 120 },
            { date: '2023-03-01', value: 110 }
          ],
          width: 800,
          height: 400
        },
      },
      {
        title: 'Parliament Chart',
        description: 'Circular chart for parliamentary representation',
        props: {
          type: 'parliament',
          data: [
            { party: 'Party A', seats: 150, color: '#1f77b4' },
            { party: 'Party B', seats: 120, color: '#ff7f0e' },
            { party: 'Party C', seats: 80, color: '#2ca02c' }
          ],
          width: 600,
          height: 600
        },
      },
    ],
  },
};

// Utility functions
export async function loadComponent(
  componentName: ComponentName
): Promise<typeof SvelteComponent | null> {
  try {
    const module = await componentModules[componentName]();
    return module.default;
  } catch (error) {
    console.error(`Failed to load component: ${componentName}`, error);
    return null;
  }
}

export function getComponentsByCategory(
  category: ComponentInfo['category']
): ComponentName[] {
  return Object.entries(componentRegistry)
    .filter(([_, info]) => info.category === category)
    .map(([name]) => name as ComponentName);
}

export function getComponentsByCapability(
  capability: ComponentCapability
): ComponentName[] {
  return Object.entries(componentRegistry)
    .filter(([_, info]) => info.capabilities.includes(capability))
    .map(([name]) => name as ComponentName);
}

export function validateComponentProps(
  componentName: ComponentName,
  props: Record<string, any>
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const info = componentRegistry[componentName];
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!info) {
    errors.push(`Unknown component: ${componentName}`);
    return { valid: false, errors, warnings };
  }

  // Check required props
  info.requiredProps.forEach((prop) => {
    if (!(prop in props)) {
      errors.push(`Missing required prop: ${prop}`);
    }
  });

  // Check for unknown props
  Object.keys(props).forEach((prop) => {
    if (
      !info.requiredProps.includes(prop) &&
      !info.optionalProps.includes(prop)
    ) {
      warnings.push(`Unknown prop: ${prop}. May be ignored.`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

// Export available components for AI/autocomplete
export const availableComponents = Object.keys(
  componentRegistry
) as ComponentName[];
