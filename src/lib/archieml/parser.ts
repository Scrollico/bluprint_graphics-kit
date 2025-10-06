/**
 * ArchieML Parser for Scrollytelling Stories
 * Converts ArchieML markup into structured story format
 */

import archieml from 'archieml';

export interface StoryStep {
  id: string;
  type: 'text' | 'map' | 'chart' | 'media' | 'intro' | 'conclusion';
  headline?: string;
  text?: string;
  media?: {
    type: 'image' | 'video' | 'embed';
    src: string;
    caption?: string;
  };
  map?: {
    center?: [number, number];
    zoom?: number;
    pitch?: number;
    bearing?: number;
    layers?: Array<{
      id: string;
      visibility: 'visible' | 'none';
      opacity?: number;
    }>;
    markers?: Array<{
      lng: number;
      lat: number;
      label?: string;
    }>;
  };
  chart?: {
    type: string;
    data: string; // path to data file
    props?: Record<string, any>;
  };
  component?: {
    name: string;
    props?: Record<string, any>;
  };
  transition?: {
    duration?: number;
    ease?: string;
  };
}

export interface ParsedStory {
  meta: {
    title: string;
    description?: string;
    authors?: string[];
    publishDate?: string;
  };
  steps: StoryStep[];
  layout?: {
    type: 'single-column' | 'two-column';
    sticky?: 'left' | 'right';
  };
  theme?: {
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
  };
}

export class ArchieMLParser {
  /**
   * Parse ArchieML text into structured story format
   */
  parse(archieMLText: string): ParsedStory {
    const parsed = archieml.load(archieMLText);
    
    console.log('ArchieML parsed result:', parsed); // Debug log
    
    // Extract metadata
    const meta = {
      title: parsed.title || 'Untitled Story',
      description: parsed.description,
      authors: this.parseAuthors(parsed.authors),
      publishDate: parsed.publishDate
    };

    // Extract layout configuration
    const layout = {
      type: (parsed.layout?.type || 'two-column') as 'single-column' | 'two-column',
      sticky: (parsed.layout?.sticky || 'right') as 'left' | 'right'
    };

    // Parse steps - handle different possible formats
    let steps: StoryStep[] = [];
    
    if (Array.isArray(parsed.steps)) {
      // Steps is already an array
      steps = this.parseSteps(parsed.steps);
    } else if (parsed.steps && typeof parsed.steps === 'object') {
      // Steps is an object with numeric keys - convert to array
      const stepsArray = Object.values(parsed.steps);
      steps = this.parseSteps(stepsArray);
    } else {
      // Fallback: try to extract steps from raw text
      console.log('Using fallback text parsing for steps');
      steps = this.extractStepsFromRawText(archieMLText);
    }

    // If we still don't have steps, the ArchieML format might be incorrect
    if (steps.length === 0) {
      console.warn('⚠️ No steps found. Make sure your ArchieML format is correct:');
      console.warn('Use [steps] to start, {} between steps, and [] to end');
    } else {
      console.log(`✅ Successfully parsed ${steps.length} steps`);
    }

    console.log('Final parsed steps:', steps); // Debug log

    // Extract theme if present
    const theme = parsed.theme || {};

    return {
      meta,
      steps,
      layout,
      theme
    };
  }

  /**
   * Parse authors from various formats
   */
  private parseAuthors(authors: any): string[] {
    if (!authors) return [];
    if (typeof authors === 'string') return [authors];
    if (Array.isArray(authors)) return authors;
    return [];
  }

  /**
   * Parse step array from ArchieML
   */
  private parseSteps(stepsData: any[]): StoryStep[] {
    if (!Array.isArray(stepsData)) return [];

    return stepsData.map((step, index) => {
      const parsedStep: StoryStep = {
        id: step.id || `step-${index + 1}`,
        type: this.determineStepType(step),
        headline: step.headline,
        text: step.text
      };

      // Parse media
      if (step.media) {
        parsedStep.media = this.parseMedia(step.media);
      }

      // Parse map configuration - handle both nested and flattened formats
      const mapConfig = this.parseMapFromStep(step);
      if (mapConfig && Object.keys(mapConfig).length > 0) {
        parsedStep.map = mapConfig;
      }

      // Parse chart configuration
      if (step.chart) {
        parsedStep.chart = this.parseChart(step.chart);
      }

      // Parse custom component
      if (step.component) {
        parsedStep.component = {
          name: step.component.name || step.component,
          props: step.component.props || {}
        };
      }

      // Parse transition
      if (step.transition) {
        parsedStep.transition = {
          duration: step.transition.duration || 800,
          ease: step.transition.ease || 'ease-out'
        };
      }

      return parsedStep;
    });
  }

  /**
   * Extract steps from raw ArchieML text as fallback
   */
  private extractStepsFromRawText(text: string): StoryStep[] {
    const steps: StoryStep[] = [];
    const lines = text.split('\n');
    let currentStep: Partial<StoryStep> | null = null;
    let inStepsSection = false;
    let hasValidStepsFormat = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === '[steps]') {
        inStepsSection = true;
        hasValidStepsFormat = true;
        continue;
      }

      if (line === '[]' && inStepsSection) {
        if (currentStep && currentStep.id) {
          steps.push(currentStep as StoryStep);
        }
        break;
      }

      if (line === '{}' && currentStep && currentStep.id) {
        steps.push(currentStep as StoryStep);
        currentStep = null;
        continue;
      }

      if (inStepsSection && line.startsWith('id:')) {
        if (currentStep && currentStep.id) {
          steps.push(currentStep as StoryStep);
        }
        currentStep = {
          id: line.substring(3).trim(),
          type: 'text'
        };
      } else if (currentStep && line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();

        this.parseStepProperty(currentStep, key.trim(), value);
      }
    }

    // If we don't have proper [steps] format, return empty array
    if (!hasValidStepsFormat) {
      console.warn('❌ Invalid ArchieML format: Missing [steps] section');
      console.warn('Please use proper ArchieML format:');
      console.warn('');
      console.warn('[steps]');
      console.warn('id: step1');
      console.warn('type: intro');
      console.warn('headline: Your headline');
      console.warn('text: Your content here');
      console.warn('{}');
      console.warn('id: step2');
      console.warn('type: map');
      console.warn('headline: Map view');
      console.warn('map.center: [28.9784, 41.0082]');
      console.warn('map.zoom: 12');
      console.warn('[]');
      console.warn('');
      return [];
    }

    return steps;
  }

  /**
   * Parse individual step property from raw text
   */
  private parseStepProperty(step: Partial<StoryStep>, key: string, value: string): void {
    switch (key) {
      case 'type':
        step.type = value as StoryStep['type'];
        break;
      case 'headline':
        step.headline = value;
        break;
      case 'text':
        step.text = value;
        break;
      case 'map.center':
        if (!step.map) step.map = {};
        try {
          step.map.center = JSON.parse(value);
        } catch (e) {
          // Handle string format like "[28.9784, 41.0082]"
          const coords = value.replace(/[\[\]]/g, '').split(',').map(s => parseFloat(s.trim()));
          if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            step.map.center = coords as [number, number];
          }
        }
        break;
      case 'map.zoom':
        if (!step.map) step.map = {};
        step.map.zoom = parseFloat(value);
        break;
      case 'map.pitch':
        if (!step.map) step.map = {};
        step.map.pitch = parseFloat(value);
        break;
      case 'map.bearing':
        if (!step.map) step.map = {};
        step.map.bearing = parseFloat(value);
        break;
      case 'chart.type':
        if (!step.chart) step.chart = { type: 'auto', data: '' };
        step.chart.type = value;
        break;
      case 'chart.data':
        if (!step.chart) step.chart = { type: 'auto', data: '' };
        step.chart.data = value;
        break;
    }
  }

  /**
   * Determine step type based on content
   */
  private determineStepType(step: any): StoryStep['type'] {
    if (step.type) return step.type;
    if (step.map) return 'map';
    if (step.chart) return 'chart';
    if (step.media) return 'media';
    if (step.intro === true) return 'intro';
    if (step.conclusion === true) return 'conclusion';
    return 'text';
  }

  /**
   * Parse media configuration
   */
  private parseMedia(media: any): StoryStep['media'] {
    if (typeof media === 'string') {
      return {
        type: this.detectMediaType(media),
        src: media
      };
    }
    
    return {
      type: media.type || this.detectMediaType(media.src),
      src: media.src,
      caption: media.caption
    };
  }

  /**
   * Detect media type from URL
   */
  private detectMediaType(src: string): 'image' | 'video' | 'embed' {
    if (src.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) return 'image';
    if (src.match(/\.(mp4|webm|mov)$/i)) return 'video';
    return 'embed';
  }

  /**
   * Parse map configuration from step (handles both nested and flattened formats)
   */
  private parseMapFromStep(step: any): StoryStep['map'] | null {
    const parsed: StoryStep['map'] = {};

    // Handle nested map object
    if (step.map) {
      return this.parseMap(step.map);
    }

    // Handle flattened map properties from ArchieML
    let hasMapData = false;

    if (step['map.center']) {
      try {
        parsed.center = JSON.parse(step['map.center']);
        hasMapData = true;
      } catch (e) {
        // Handle string format like "[28.9784, 41.0082]"
        const coords = step['map.center'].replace(/[\[\]]/g, '').split(',').map((s: string) => parseFloat(s.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          parsed.center = coords as [number, number];
          hasMapData = true;
        }
      }
    }

    if (step['map.zoom'] !== undefined) {
      parsed.zoom = parseFloat(step['map.zoom']);
      hasMapData = true;
    }

    if (step['map.pitch'] !== undefined) {
      parsed.pitch = parseFloat(step['map.pitch']);
      hasMapData = true;
    }

    if (step['map.bearing'] !== undefined) {
      parsed.bearing = parseFloat(step['map.bearing']);
      hasMapData = true;
    }

    // Handle layers and markers if present
    if (step['map.layers']) {
      parsed.layers = Array.isArray(step['map.layers']) ? step['map.layers'] : [step['map.layers']];
      hasMapData = true;
    }

    if (step['map.markers']) {
      parsed.markers = Array.isArray(step['map.markers']) ? step['map.markers'] : [step['map.markers']];
      hasMapData = true;
    }

    return hasMapData ? parsed : null;
  }

  /**
   * Parse map configuration (legacy method for nested objects)
   */
  private parseMap(map: any): StoryStep['map'] {
    const parsed: StoryStep['map'] = {};

    if (map.center) {
      parsed.center = Array.isArray(map.center) ? map.center : [map.center.lng, map.center.lat];
    }

    if (map.zoom !== undefined) parsed.zoom = map.zoom;
    if (map.pitch !== undefined) parsed.pitch = map.pitch;
    if (map.bearing !== undefined) parsed.bearing = map.bearing;

    if (map.layers) {
      parsed.layers = Array.isArray(map.layers) ? map.layers : [map.layers];
    }

    if (map.markers) {
      parsed.markers = Array.isArray(map.markers) ? map.markers : [map.markers];
    }

    return parsed;
  }

  /**
   * Parse chart configuration
   */
  private parseChart(chart: any): StoryStep['chart'] {
    if (typeof chart === 'string') {
      return {
        type: 'auto',
        data: chart
      };
    }

    return {
      type: chart.type || 'auto',
      data: chart.data,
      props: chart.props || {}
    };
  }
}

/**
 * Create ArchieML template for Google Docs
 */
export function createArchieMLTemplate(): string {
  return `title: Your Story Title
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

{}

id: conclusion
type: conclusion
headline: Final Thoughts
text: Concluding paragraph

[]

theme.colors.primary: #1a1a1a
theme.colors.accent: #0066cc
`;
}
