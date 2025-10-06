/**
 * Component Registry for Scrollytelling
 * Maps component names to implementations and provides visual mapping
 */

import type { ComponentType, SvelteComponent } from 'svelte';

export interface ComponentDefinition {
  name: string;
  component: ComponentType<SvelteComponent>;
  description: string;
  category: 'map' | 'chart' | 'media' | 'text' | 'custom';
  props?: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    default?: any;
    description?: string;
  }>;
  capabilities?: {
    zoom?: boolean;
    pan?: boolean;
    highlight?: boolean;
    animate?: boolean;
    interact?: boolean;
  };
  thumbnail?: string;
}

export class ComponentRegistry {
  private components = new Map<string, ComponentDefinition>();

  /**
   * Register a component
   */
  register(definition: ComponentDefinition): void {
    this.components.set(definition.name, definition);
  }

  /**
   * Get component by name
   */
  get(name: string): ComponentDefinition | undefined {
    return this.components.get(name);
  }

  /**
   * Get all components
   */
  getAll(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  /**
   * Get components by category
   */
  getByCategory(category: ComponentDefinition['category']): ComponentDefinition[] {
    return this.getAll().filter(c => c.category === category);
  }

  /**
   * Get components with specific capability
   */
  getByCapability(capability: keyof NonNullable<ComponentDefinition['capabilities']>): ComponentDefinition[] {
    return this.getAll().filter(c => c.capabilities?.[capability]);
  }

  /**
   * Generate visual map of components
   */
  generateVisualMap(): Record<string, ComponentDefinition[]> {
    const map: Record<string, ComponentDefinition[]> = {
      map: [],
      chart: [],
      media: [],
      text: [],
      custom: []
    };

    this.getAll().forEach(component => {
      map[component.category].push(component);
    });

    return map;
  }

  /**
   * Validate component props
   */
  validateProps(componentName: string, props: Record<string, any>): { valid: boolean; errors: string[] } {
    const definition = this.get(componentName);
    if (!definition) {
      return { valid: false, errors: [`Component '${componentName}' not found`] };
    }

    const errors: string[] = [];
    const propDefs = definition.props || {};

    // Check required props
    Object.entries(propDefs).forEach(([propName, propDef]) => {
      if (propDef.required && !(propName in props)) {
        errors.push(`Missing required prop '${propName}'`);
      }
    });

    // Validate prop types
    Object.entries(props).forEach(([propName, value]) => {
      const propDef = propDefs[propName];
      if (!propDef) {
        // Allow extra props but warn
        console.warn(`Unknown prop '${propName}' for component '${componentName}'`);
        return;
      }

      const valueType = Array.isArray(value) ? 'array' : typeof value;
      if (valueType !== propDef.type) {
        errors.push(`Invalid type for prop '${propName}': expected ${propDef.type}, got ${valueType}`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Create component instance
   */
  createInstance(componentName: string, props: Record<string, any>): SvelteComponent | null {
    const definition = this.get(componentName);
    if (!definition) {
      console.error(`Component '${componentName}' not found`);
      return null;
    }

    const validation = this.validateProps(componentName, props);
    if (!validation.valid) {
      console.error('Component validation failed:', validation.errors);
      return null;
    }

    // Apply defaults
    const finalProps = { ...props };
    if (definition.props) {
      Object.entries(definition.props).forEach(([propName, propDef]) => {
        if (!(propName in finalProps) && 'default' in propDef) {
          finalProps[propName] = propDef.default;
        }
      });
    }

    // Note: Actual instantiation would happen in Svelte component
    // This returns the component type and props for use in dynamic components
    return { component: definition.component, props: finalProps } as any;
  }
}

// Create default registry instance
export const registry = new ComponentRegistry();

/**
 * Helper function to define components with type safety
 */
export function defineComponent<T extends Record<string, any>>(
  definition: Omit<ComponentDefinition, 'props'> & {
    props?: {
      [K in keyof T]: {
        type: T[K] extends string ? 'string' 
             : T[K] extends number ? 'number'
             : T[K] extends boolean ? 'boolean'
             : T[K] extends any[] ? 'array'
             : 'object';
        required?: boolean;
        default?: T[K];
        description?: string;
      }
    }
  }
): ComponentDefinition {
  return definition as ComponentDefinition;
}

/**
 * Component mapping visualization data
 */
export interface ComponentMap {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  connections: string[];
}

/**
 * Generate component relationship map for visualization
 */
export function generateComponentMap(registry: ComponentRegistry): ComponentMap[] {
  const components = registry.getAll();
  const map: ComponentMap[] = [];
  
  // Simple grid layout by category
  const categories = ['map', 'chart', 'media', 'text', 'custom'];
  const categoryPositions = new Map<string, { x: number; y: number; count: number }>();
  
  categories.forEach((cat, i) => {
    categoryPositions.set(cat, { x: i * 200, y: 0, count: 0 });
  });

  components.forEach(comp => {
    const pos = categoryPositions.get(comp.category)!;
    map.push({
      id: comp.name,
      name: comp.name,
      category: comp.category,
      x: pos.x,
      y: pos.y + pos.count * 100,
      connections: [] // Could be populated based on component relationships
    });
    pos.count++;
  });

  return map;
}
