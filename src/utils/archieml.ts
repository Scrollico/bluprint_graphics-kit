/**
 * ArchieML → StorySchema parser utilities
 * Minimal adapter to map GDoc/RNGS ArchieML JSON into our StorySchema
 */
import type { StorySchema, StoryStep } from '../../lib/story-schema.js';

type ArchieJSON = Record<string, any>;

export function parseArchieMLToStorySchema(doc: ArchieJSON): StorySchema {
  // Expecting a top-level shape like:
  // { meta: {...}, steps: [...], data?: [...], layout?: {...} }
  // Keep this minimal and predictable
  const meta = doc.meta || {
    title: doc.title || 'Untitled',
    description: doc.description || '',
    authors: doc.authors || ['Unknown'],
  };

  const steps: StoryStep[] = Array.isArray(doc.steps) ? doc.steps : [];

  return {
    meta,
    steps,
    data: doc.data || [],
    layout: doc.layout || { type: 'two-column', sticky: 'graphic', graphicPosition: 'left' },
  };
}

/**
 * Normalize camera/layers convenience fields embedded in step blocks
 */
export function normalizeMapChapters(story: StorySchema): StorySchema {
  const steps = story.steps.map((s) => {
    if (s.visual?.state) return s;
    // Support convenience chapter fields on steps
    const chapter = (s as any).chapter as any;
    if (!chapter) return s;

    const camera = chapter.location ? {
      center: chapter.location.center as [number, number] | undefined,
      zoom: chapter.location.zoom as number | undefined,
      pitch: chapter.location.pitch as number | undefined,
      bearing: chapter.location.bearing as number | undefined,
      padding: chapter.location.padding as any,
    } : undefined;

    const layers = Array.isArray(chapter.layers)
      ? chapter.layers.map((l: any) => ({ id: String(l.id), visibility: l.visibility, opacity: l.opacity }))
      : undefined;

    return {
      ...s,
      visual: {
        ...(s.visual || { component: 'TurkeyMapChart' }),
        state: {
          ...(s.visual?.state || {}),
          camera,
          layers,
        },
      },
    };
  });

  return { ...story, steps };
}


