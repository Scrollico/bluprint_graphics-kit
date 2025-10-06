/**
 * Blueprint Registry - Chart Type Management System
 * Provides centralized chart definitions, capabilities, and configuration management
 */

import type { ChartType } from './components/charts/BlueprintChart.svelte';

// Chart capability definitions
export type ChartCapability =
  | 'responsive'
  | 'interactive'
  | 'animated'
  | 'zoomable'
  | 'filterable'
  | 'annotatable'
  | 'exportable'
  | 'accessible';

// Data format specifications
export type DataFormat =
  | 'array'           // Simple array of objects
  | 'time-series'     // Time-based data with dates
  | 'categorical'     // Category-based data
  | 'geographic'      // Geographic/GeoJSON data
  | 'hierarchical'    // Tree/nested data
  | 'network'         // Node-link data
  | 'tabular';        // CSV-like tabular data

// Chart metadata interface
export interface ChartMetadata {
  id: ChartType;
  name: string;
  description: string;
  category: 'bar' | 'line' | 'map' | 'specialized' | '3d';
  capabilities: ChartCapability[];
  dataFormats: DataFormat[];
  minWidth: number;
  minHeight: number;
  defaultWidth: number;
  defaultHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number; // width/height ratio
  dependencies?: string[]; // Required libraries or assets
}

// Data transformation interface
export interface DataTransformer<TInput = any, TOutput = any> {
  id: string;
  name: string;
  description: string;
  inputFormat: DataFormat;
  outputFormat: DataFormat;
  transform: (data: TInput, config?: Record<string, any>) => TOutput;
  validate: (data: TInput) => { valid: boolean; errors: string[] };
}

// Chart configuration interface
export interface ChartConfiguration {
  chartType: ChartType;
  dataTransformer?: string; // Transformer ID to use
  theme?: ChartTheme;
  responsive: {
    breakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
    scaling: 'fit' | 'scale' | 'overflow';
  };
  accessibility: {
    ariaLabel?: string;
    ariaDescription?: string;
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
    highContrast: boolean;
  };
  performance: {
    debounceMs: number;
    lazyLoad: boolean;
    preloadAssets: boolean;
  };
}

// Theme system
export interface ChartTheme {
  id: string;
  name: string;
  colors: {
    primary: string[];
    secondary: string[];
    neutral: string[];
    accent: string[];
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: number;
      medium: number;
      large: number;
    };
    fontWeight: {
      normal: number;
      bold: number;
    };
  };
  spacing: {
    padding: number;
    margin: number;
    gap: number;
  };
  borderRadius: number;
  shadows: string[];
}

// Chart registry class
export class BlueprintRegistry {
  private charts = new Map<ChartType, ChartMetadata>();
  private transformers = new Map<string, DataTransformer>();
  private themes = new Map<string, ChartTheme>();

  constructor() {
    this.initializeCharts();
    this.initializeTransformers();
    this.initializeThemes();
  }

  // Register a chart type
  registerChart(metadata: ChartMetadata): void {
    if (this.charts.has(metadata.id)) {
      console.warn(`Chart type '${metadata.id}' already registered. Overwriting.`);
    }
    this.charts.set(metadata.id, metadata);
  }

  // Get chart metadata
  getChart(type: ChartType): ChartMetadata | undefined {
    return this.charts.get(type);
  }

  // Get all registered chart types
  getAllCharts(): ChartMetadata[] {
    return Array.from(this.charts.values());
  }

  // Get charts by category
  getChartsByCategory(category: ChartMetadata['category']): ChartMetadata[] {
    return this.getAllCharts().filter(chart => chart.category === category);
  }

  // Get charts by capability
  getChartsByCapability(capability: ChartCapability): ChartMetadata[] {
    return this.getAllCharts().filter(chart =>
      chart.capabilities.includes(capability)
    );
  }

  // Register data transformer
  registerTransformer(transformer: DataTransformer): void {
    if (this.transformers.has(transformer.id)) {
      console.warn(`Transformer '${transformer.id}' already registered. Overwriting.`);
    }
    this.transformers.set(transformer.id, transformer);
  }

  // Get data transformer
  getTransformer(id: string): DataTransformer | undefined {
    return this.transformers.get(id);
  }

  // Register theme
  registerTheme(theme: ChartTheme): void {
    if (this.themes.has(theme.id)) {
      console.warn(`Theme '${theme.id}' already registered. Overwriting.`);
    }
    this.themes.set(theme.id, theme);
  }

  // Get theme
  getTheme(id: string): ChartTheme | undefined {
    return this.themes.get(id);
  }

  // Validate chart configuration
  validateConfiguration(type: ChartType, config: Partial<ChartConfiguration>): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const chart = this.getChart(type);

    if (!chart) {
      errors.push(`Unknown chart type: ${type}`);
      return { valid: false, errors, warnings };
    }

    // Validate data transformer if specified
    if (config.dataTransformer && !this.getTransformer(config.dataTransformer)) {
      errors.push(`Unknown data transformer: ${config.dataTransformer}`);
    }

    // Validate theme if specified
    if (config.theme?.id && !this.getTheme(config.theme.id)) {
      warnings.push(`Unknown theme: ${config.theme.id}. Using default theme.`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  // Get recommended configuration for a chart type
  getRecommendedConfig(type: ChartType): ChartConfiguration {
    const chart = this.getChart(type);
    if (!chart) {
      throw new Error(`Unknown chart type: ${type}`);
    }

    return {
      chartType: type,
      responsive: {
        breakpoints: {
          mobile: 480,
          tablet: 768,
          desktop: 1024
        },
        scaling: 'fit'
      },
      accessibility: {
        keyboardNavigation: true,
        screenReaderSupport: true,
        highContrast: false
      },
      performance: {
        debounceMs: 250,
        lazyLoad: true,
        preloadAssets: false
      }
    };
  }

  // Initialize default charts
  private initializeCharts(): void {
    const defaultCharts: ChartMetadata[] = [
      {
        id: 'categorical-bar',
        name: 'Categorical Bar Chart',
        description: 'Horizontal or vertical bars for categorical data comparison',
        category: 'bar',
        capabilities: ['responsive', 'interactive', 'animated', 'accessible'],
        dataFormats: ['categorical', 'array'],
        minWidth: 300,
        minHeight: 200,
        defaultWidth: 600,
        defaultHeight: 400,
        aspectRatio: 1.5
      },
      {
        id: 'line-area',
        name: 'Line/Area Chart',
        description: 'Time series visualization with lines and filled areas',
        category: 'line',
        capabilities: ['responsive', 'interactive', 'animated', 'zoomable', 'accessible'],
        dataFormats: ['time-series', 'array'],
        minWidth: 400,
        minHeight: 250,
        defaultWidth: 800,
        defaultHeight: 400,
        aspectRatio: 2
      },
      {
        id: 'parliament',
        name: 'Parliament Chart',
        description: 'Circular representation of parliamentary seats',
        category: 'specialized',
        capabilities: ['responsive', 'interactive', 'animated', 'accessible'],
        dataFormats: ['categorical', 'array'],
        minWidth: 300,
        minHeight: 300,
        defaultWidth: 600,
        defaultHeight: 600,
        aspectRatio: 1
      },
      {
        id: 'county-map',
        name: 'U.S. County Map',
        description: 'Choropleth map of U.S. counties with data visualization',
        category: 'map',
        capabilities: ['responsive', 'interactive', 'zoomable', 'filterable', 'accessible'],
        dataFormats: ['geographic', 'tabular'],
        minWidth: 400,
        minHeight: 300,
        defaultWidth: 800,
        defaultHeight: 600,
        aspectRatio: 1.33,
        dependencies: ['mapbox-gl']
      },
      {
        id: 'state-cartogram',
        name: 'State Cartogram',
        description: 'U.S. states sized by data values with custom layouts',
        category: 'map',
        capabilities: ['responsive', 'interactive', 'animated', 'accessible'],
        dataFormats: ['geographic', 'tabular'],
        minWidth: 400,
        minHeight: 300,
        defaultWidth: 800,
        defaultHeight: 600,
        aspectRatio: 1.33
      },
      {
        id: 'spike-map',
        name: 'Spike Map',
        description: '3D spikes on geographic locations with interactive tooltips',
        category: 'map',
        capabilities: ['responsive', 'interactive', 'animated', 'zoomable'],
        dataFormats: ['geographic', 'tabular'],
        minWidth: 400,
        minHeight: 300,
        defaultWidth: 800,
        defaultHeight: 600,
        aspectRatio: 1.33,
        dependencies: ['three.js']
      },
      {
        id: 'globetrotter',
        name: 'Globetrotter',
        description: 'Interactive 3D globe with markers and smooth rotations',
        category: '3d',
        capabilities: ['interactive', 'animated', 'zoomable'],
        dataFormats: ['geographic', 'tabular'],
        minWidth: 300,
        minHeight: 300,
        defaultWidth: 600,
        defaultHeight: 600,
        aspectRatio: 1,
        dependencies: ['three.js']
      }
    ];

    defaultCharts.forEach(chart => this.registerChart(chart));
  }

  // Initialize default transformers
  private initializeTransformers(): void {
    const defaultTransformers: DataTransformer[] = [
      {
        id: 'csv-to-array',
        name: 'CSV to Array',
        description: 'Convert CSV string to typed array objects',
        inputFormat: 'tabular',
        outputFormat: 'array',
        transform: (data: string, config?: any) => {
          // Simple CSV parser - in production, use a robust CSV library
          const lines = data.trim().split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj: any = {};
            headers.forEach((header, i) => {
              obj[header] = values[i] || '';
            });
            return obj;
          });
        },
        validate: (data: string) => {
          const errors: string[] = [];
          if (typeof data !== 'string') {
            errors.push('Input must be a CSV string');
          }
          if (!data.trim()) {
            errors.push('CSV data cannot be empty');
          }
          return { valid: errors.length === 0, errors };
        }
      },
      {
        id: 'array-to-time-series',
        name: 'Array to Time Series',
        description: 'Convert array to time series format with date parsing',
        inputFormat: 'array',
        outputFormat: 'time-series',
        transform: (data: any[], config?: any) => {
          const dateField = config?.dateField || 'date';
          const valueField = config?.valueField || 'value';

          return data.map(item => ({
            date: new Date(item[dateField]),
            value: Number(item[valueField]),
            ...item
          })).sort((a, b) => a.date.getTime() - b.date.getTime());
        },
        validate: (data: any[]) => {
          const errors: string[] = [];
          if (!Array.isArray(data)) {
            errors.push('Input must be an array');
          }
          if (data.length === 0) {
            errors.push('Array cannot be empty');
          }
          return { valid: errors.length === 0, errors };
        }
      }
    ];

    defaultTransformers.forEach(transformer => this.registerTransformer(transformer));
  }

  // Initialize default themes
  private initializeThemes(): void {
    const defaultThemes: ChartTheme[] = [
      {
        id: 'reuters-default',
        name: 'Reuters Default',
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
      },
      {
        id: 'high-contrast',
        name: 'High Contrast',
        colors: {
          primary: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'],
          secondary: ['#333333', '#666666', '#999999', '#cccccc', '#ffffff'],
          neutral: ['#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0', '#b0b0b0'],
          accent: ['#000000', '#333333', '#666666', '#999999', '#cccccc']
        },
        typography: {
          fontFamily: 'system-ui, sans-serif',
          fontSize: {
            small: 14,
            medium: 16,
            large: 18
          },
          fontWeight: {
            normal: 400,
            bold: 700
          }
        },
        spacing: {
          padding: 20,
          margin: 12,
          gap: 16
        },
        borderRadius: 0,
        shadows: [
          '0 2px 4px rgba(0, 0, 0, 0.3)',
          '0 6px 8px rgba(0, 0, 0, 0.3)',
          '0 12px 16px rgba(0, 0, 0, 0.3)'
        ]
      }
    ];

    defaultThemes.forEach(theme => this.registerTheme(theme));
  }
}

// Export singleton instance
export const blueprintRegistry = new BlueprintRegistry();

// Export types for external use
export type { ChartType, ChartCapability, DataFormat, ChartMetadata, DataTransformer, ChartConfiguration, ChartTheme };

