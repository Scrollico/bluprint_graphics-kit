/**
 * Story Schema for Structured Scrollytelling
 * Eliminates AI hallucination by providing deterministic story definitions
 */

export interface StorySchema {
  meta: StoryMeta;
  steps: StoryStep[];
  data?: StoryDataSource[];
  layout?: StoryLayout;
}

export interface StoryMeta {
  title: string;
  description: string;
  authors: string[];
  publishDate?: string;
  section?: string;
  sectionUrl?: string;
  shareImage?: string;
  shareImageAlt?: string;
}

export interface StoryStep {
  id: string;
  type: StepType;
  content?: StoryContent;
  visual?: StoryVisual;
  transition?: StoryTransition;
  layout?: StepLayout;
}

export type StepType = 
  | 'intro'           // Introduction with title/byline
  | 'text'            // Text-only step
  | 'chart'           // Show chart/visualization
  | 'map_action'      // Map zoom, highlight, etc.
  | 'data_update'     // Update chart data
  | 'annotation'      // Add annotations/callouts
  | 'comparison'      // Side-by-side comparison
  | 'conclusion';     // Wrap-up/conclusion

export interface StoryContent {
  text?: string;
  headline?: string;
  subheadline?: string;
  quote?: {
    text: string;
    attribution?: string;
  };
  callout?: {
    text: string;
    type: 'info' | 'warning' | 'highlight';
  };
}

export interface StoryVisual {
  component: ComponentName;
  props?: Record<string, any>;
  data?: string | object; // File path or inline data
  state?: VisualState;
  annotations?: Annotation[];
}

// Available chart components from your lib/components/charts/
export type ComponentName =
  | 'TurkeyMapChart'
  | 'TurkeyMap' 
  | 'EuropeanMapChart'
  | 'EuropeMapChart'
  | 'IstanbulMetroMap'
  | 'MarmarayStationChart'
  | 'ZoomableMap'
  | 'SwarmChart'
  | 'TimeChart'
  | 'IntroChart'
  | 'DollarsBar'
  | 'Railroad3D';

export interface VisualState {
  // Map-specific states
  zoom?: {
    region?: string;
    coordinates?: [number, number];
    level?: number;
  };
  highlight?: {
    countries?: string[];
    regions?: string[];
    intensity?: number;
  };
  filter?: {
    field: string;
    value: any;
    operator?: 'equals' | 'contains' | 'greater' | 'less';
  };
  // Chart-specific states  
  focus?: {
    dataPoint?: number;
    category?: string;
    range?: [number, number];
  };
}

export interface Annotation {
  id: string;
  type: 'arrow' | 'circle' | 'rectangle' | 'text';
  position: {
    x: number | string;
    y: number | string;
  };
  content?: string;
  style?: {
    color?: string;
    size?: number;
    opacity?: number;
  };
}

export interface StoryTransition {
  duration?: number; // milliseconds
  ease?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubicInOut';
  delay?: number;
  type?: 'fade' | 'slide' | 'zoom' | 'none';
}

export interface StoryLayout {
  type: 'two-column' | 'full-width' | 'centered';
  sticky?: 'graphic' | 'text' | 'none';
  graphicPosition?: 'left' | 'right';
}

export interface StepLayout {
  override?: StoryLayout;
  spacing?: 'compact' | 'normal' | 'spacious';
  background?: string;
  fullscreen?: boolean;
}

export interface StoryDataSource {
  id: string;
  type: 'csv' | 'json' | 'geojson' | 'api';
  source: string; // file path or URL
  transform?: DataTransform[];
}

export interface DataTransform {
  type: 'filter' | 'sort' | 'group' | 'calculate' | 'rename';
  field?: string;
  value?: any;
  operation?: string;
  newField?: string;
}

// Example story schema for your Turkey map example
export const exampleStory: StorySchema = {
  meta: {
    title: "Understanding Regional Data",
    description: "A story about geographic patterns",
    authors: ["Your Name"]
  },
  steps: [
    {
      id: "1.0",
      type: "intro",
      content: {
        headline: "Regional Analysis",
        text: "Let's explore the geographic distribution of data across Turkey."
      },
      layout: {
        type: "centered"
      }
    },
    {
      id: "2.1", 
      type: "chart",
      content: {
        text: "Here's the overall view of Turkey showing regional data patterns."
      },
      visual: {
        component: "TurkeyMapChart",
        data: "turkey.json",
        props: {
          width: 800,
          height: 600
        }
      },
      transition: {
        duration: 1200,
        ease: "cubicInOut"
      }
    },
    {
      id: "2.2",
      type: "map_action", 
      content: {
        text: "Now let's zoom into Istanbul to see the detailed breakdown."
      },
      visual: {
        component: "TurkeyMapChart", // Same component, different state
        state: {
          zoom: {
            region: "istanbul",
            coordinates: [28.9784, 41.0082],
            level: 8
          }
        }
      },
      transition: {
        duration: 1500,
        ease: "ease-out"
      }
    }
  ],
  layout: {
    type: "two-column",
    sticky: "graphic",
    graphicPosition: "left"
  }
};

// Validation functions
export function validateStorySchema(story: StorySchema): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!story.meta?.title) errors.push("Story title is required");
  if (!story.steps || story.steps.length === 0) errors.push("At least one step is required");
  
  // Validate steps
  story.steps.forEach((step, index) => {
    if (!step.id) errors.push(`Step ${index} missing id`);
    if (!step.type) errors.push(`Step ${step.id || index} missing type`);
    
    if (step.visual?.component) {
      const validComponents: ComponentName[] = [
        'TurkeyMapChart', 'TurkeyMap', 'EuropeanMapChart', 'EuropeMapChart',
        'IstanbulMetroMap', 'MarmarayStationChart', 'ZoomableMap', 
        'SwarmChart', 'TimeChart', 'IntroChart', 'DollarsBar', 'Railroad3D'
      ];
      
      if (!validComponents.includes(step.visual.component)) {
        errors.push(`Invalid component: ${step.visual.component}`);
      }
    }
  });
  
  return { valid: errors.length === 0, errors };
}