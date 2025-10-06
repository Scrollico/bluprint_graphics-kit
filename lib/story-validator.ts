/**
 * Story Validator - Comprehensive validation for story schemas
 * Prevents errors before compilation and provides helpful suggestions
 */

import type { StorySchema, StoryStep, ComponentName } from './story-schema.js';
import {
  componentRegistry,
  validateComponentProps,
} from './component-registry.js';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  type: 'schema' | 'component' | 'data' | 'logic';
  location: string;
  message: string;
  fix?: string;
}

export interface ValidationWarning {
  type: 'performance' | 'usability' | 'accessibility' | 'best-practice';
  location: string;
  message: string;
  suggestion?: string;
}

export interface ValidationSuggestion {
  type: 'improvement' | 'optimization' | 'feature';
  message: string;
  example?: any;
}

export class StoryValidator {
  validate(story: StorySchema): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    // Schema validation
    this.validateSchema(story, result);

    // Component validation
    this.validateComponents(story, result);

    // Data consistency validation
    this.validateDataConsistency(story, result);

    // UX and accessibility validation
    this.validateUserExperience(story, result);

    // Performance validation
    this.validatePerformance(story, result);

    result.valid = result.errors.length === 0;
    return result;
  }

  private validateSchema(story: StorySchema, result: ValidationResult): void {
    // Required meta fields
    if (!story.meta?.title) {
      result.errors.push({
        type: 'schema',
        location: 'meta.title',
        message: 'Story title is required',
        fix: 'Add: meta.title: "Your Story Title"',
      });
    }

    if (!story.meta?.authors || story.meta.authors.length === 0) {
      result.errors.push({
        type: 'schema',
        location: 'meta.authors',
        message: 'At least one author is required',
        fix: 'Add: meta.authors: ["Your Name"]',
      });
    }

    // Steps validation
    if (!story.steps || story.steps.length === 0) {
      result.errors.push({
        type: 'schema',
        location: 'steps',
        message: 'At least one story step is required',
        fix: 'Add at least one step with id, type, and content',
      });
      return;
    }

    // Validate individual steps
    story.steps.forEach((step, index) => {
      this.validateStep(step, index, result);
    });
  }

  private validateStep(
    step: StoryStep,
    index: number,
    result: ValidationResult
  ): void {
    const location = `steps[${index}]`;

    if (!step.id) {
      result.errors.push({
        type: 'schema',
        location: `${location}.id`,
        message: 'Step ID is required',
        fix: `Add: id: "${index + 1}.0"`,
      });
    } else {
      // Check for duplicate IDs
      // This would need to be done at the story level
    }

    if (!step.type) {
      result.errors.push({
        type: 'schema',
        location: `${location}.type`,
        message: 'Step type is required',
        fix: 'Add: type: "chart" | "text" | "map_action" | etc.',
      });
    }

    // Validate step type specific requirements
    if (step.type === 'chart' && !step.visual) {
      result.errors.push({
        type: 'logic',
        location: `${location}.visual`,
        message: 'Chart steps require a visual component',
        fix: 'Add: visual: { component: "ComponentName", ... }',
      });
    }

    if (step.type === 'map_action' && !step.visual?.state) {
      result.warnings.push({
        type: 'usability',
        location: `${location}.visual.state`,
        message: 'Map action steps should define state changes',
        suggestion:
          'Add: state: { zoom: {...} } or state: { highlight: {...} }',
      });
    }

    // Validate mapbox-style camera/layers hints if provided
    if (step.visual?.state?.camera) {
      const c = step.visual.state.camera as any;
      if (c.center && (!Array.isArray(c.center) || c.center.length !== 2)) {
        result.errors.push({
          type: 'schema',
          location: `${location}.visual.state.camera.center`,
          message: 'camera.center must be [lng, lat] array',
          fix: 'Provide center: [number, number]'
        });
      }
    }
  }

  private validateComponents(
    story: StorySchema,
    result: ValidationResult
  ): void {
    const usedComponents = new Set<ComponentName>();

    story.steps.forEach((step, index) => {
      if (step.visual?.component) {
        const component = step.visual.component;
        const location = `steps[${index}].visual`;

        // Check if component exists
        if (!componentRegistry[component]) {
          result.errors.push({
            type: 'component',
            location: `${location}.component`,
            message: `Unknown component: ${component}`,
            fix: `Available components: ${Object.keys(componentRegistry).join(', ')}`,
          });
          return;
        }

        usedComponents.add(component);

        // Validate component props
        if (step.visual.props) {
          const validation = validateComponentProps(
            component,
            step.visual.props
          );

          validation.errors.forEach((error) => {
            result.errors.push({
              type: 'component',
              location: `${location}.props`,
              message: error,
              fix: `Check component documentation for ${component}`,
            });
          });

          validation.warnings.forEach((warning) => {
            result.warnings.push({
              type: 'best-practice',
              location: `${location}.props`,
              message: warning,
            });
          });
        }

        // Validate component capabilities vs usage
        this.validateComponentUsage(component, step, index, result);
      }
    });

    // Suggest component alternatives if using basic components for advanced features
    this.suggestComponentUpgrades(usedComponents, result);
  }

  private validateComponentUsage(
    component: ComponentName,
    step: StoryStep,
    index: number,
    result: ValidationResult
  ): void {
    const info = componentRegistry[component];
    const location = `steps[${index}]`;

    // Check if trying to use unsupported capabilities
    if (step.visual?.state?.zoom && !info.capabilities.includes('zoom')) {
      result.warnings.push({
        type: 'usability',
        location: `${location}.visual.state.zoom`,
        message: `${component} may not support zoom functionality`,
        suggestion: `Consider using ZoomableMap or TurkeyMapChart instead`,
      });
    }

    if (
      step.visual?.state?.highlight &&
      !info.capabilities.includes('highlight')
    ) {
      result.warnings.push({
        type: 'usability',
        location: `${location}.visual.state.highlight`,
        message: `${component} may not support highlighting`,
        suggestion: `Consider using EuropeanMapChart or TurkeyMapChart instead`,
      });
    }

    // Check data format compatibility
    if (step.visual?.data && typeof step.visual.data === 'string') {
      const dataType = this.inferDataType(step.visual.data);
      if (dataType && dataType !== info.dataFormat) {
        result.warnings.push({
          type: 'performance',
          location: `${location}.visual.data`,
          message: `Data format mismatch: ${component} expects ${info.dataFormat}, got ${dataType}`,
          suggestion: `Consider data transformation or using a different component`,
        });
      }
    }
  }

  private validateDataConsistency(
    story: StorySchema,
    result: ValidationResult
  ): void {
    const dataFiles = new Set<string>();

    // Collect all data references
    story.steps.forEach((step, index) => {
      if (step.visual?.data && typeof step.visual.data === 'string') {
        dataFiles.add(step.visual.data);
      }
    });

    // Check for missing data definitions
    dataFiles.forEach((file) => {
      if (!story.data?.find((d) => d.source === file)) {
        result.warnings.push({
          type: 'best-practice',
          location: 'data',
          message: `Data file referenced but not defined in data sources: ${file}`,
          suggestion: `Add to data array: { id: "${file.replace(/\./g, '_')}", type: "csv|json|geojson", source: "${file}" }`,
        });
      }
    });
  }

  private validateUserExperience(
    story: StorySchema,
    result: ValidationResult
  ): void {
    // Check for intro step
    const hasIntro = story.steps.some((step) => step.type === 'intro');
    if (!hasIntro) {
      result.suggestions.push({
        type: 'improvement',
        message: 'Consider adding an intro step to set context for readers',
        example: {
          id: '0.0',
          type: 'intro',
          content: { headline: 'Story Title', text: 'Introduction...' },
        },
      });
    }

    // Check for conclusion
    const hasConclusion = story.steps.some(
      (step) => step.type === 'conclusion'
    );
    if (!hasConclusion) {
      result.suggestions.push({
        type: 'improvement',
        message: 'Consider adding a conclusion step to summarize key findings',
      });
    }

    // Check step content length
    story.steps.forEach((step, index) => {
      if (step.content?.text && step.content.text.length > 300) {
        result.warnings.push({
          type: 'usability',
          location: `steps[${index}].content.text`,
          message: 'Long text blocks may hurt readability on mobile',
          suggestion:
            'Consider breaking into multiple steps or shorter paragraphs',
        });
      }
    });

    // Check for missing alt text on visual elements
    story.steps.forEach((step, index) => {
      if (step.visual && !step.content?.text) {
        result.warnings.push({
          type: 'accessibility',
          location: `steps[${index}].content.text`,
          message:
            'Visual steps should have descriptive text for accessibility',
          suggestion: 'Add content.text describing what the visual shows',
        });
      }
    });
  }

  private validatePerformance(
    story: StorySchema,
    result: ValidationResult
  ): void {
    // Check for too many complex visuals
    const complexVisuals = story.steps.filter((step) => {
      const component = step.visual?.component;
      return component && ['Railroad3D', 'ZoomableMap'].includes(component);
    });

    if (complexVisuals.length > 3) {
      result.warnings.push({
        type: 'performance',
        location: 'steps',
        message:
          'Multiple complex 3D/interactive components may impact performance',
        suggestion: 'Consider lazy loading or simplifying some visualizations',
      });
    }

    // Check transition durations
    story.steps.forEach((step, index) => {
      if (step.transition?.duration && step.transition.duration > 3000) {
        result.warnings.push({
          type: 'usability',
          location: `steps[${index}].transition.duration`,
          message: 'Long transition durations may frustrate users',
          suggestion: 'Consider reducing to 1500ms or less',
        });
      }
    });
  }

  private suggestComponentUpgrades(
    usedComponents: Set<ComponentName>,
    result: ValidationResult
  ): void {
    // Suggest better alternatives
    if (
      usedComponents.has('TurkeyMap') &&
      !usedComponents.has('TurkeyMapChart')
    ) {
      result.suggestions.push({
        type: 'feature',
        message:
          'Consider using TurkeyMapChart instead of TurkeyMap for interactive features',
        example:
          'TurkeyMapChart supports zoom, highlighting, and data visualization',
      });
    }

    if (
      usedComponents.has('EuropeMapChart') &&
      !usedComponents.has('EuropeanMapChart')
    ) {
      result.suggestions.push({
        type: 'feature',
        message: 'EuropeanMapChart may offer more features than EuropeMapChart',
      });
    }
  }

  private inferDataType(filename: string): string | null {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'csv':
        return 'csv';
      case 'json':
        return 'json';
      case 'geojson':
        return 'geojson';
      default:
        return null;
    }
  }

  // Utility method for quick validation
  static validate(story: StorySchema): ValidationResult {
    const validator = new StoryValidator();
    return validator.validate(story);
  }
}

// Export convenience function
export function validateStory(story: StorySchema): ValidationResult {
  return StoryValidator.validate(story);
}
