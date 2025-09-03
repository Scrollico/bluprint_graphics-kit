#!/usr/bin/env node

/**
 * Create Structured Scrollytelling Story
 * Uses YAML-based story definitions to eliminate AI hallucination
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storyName = process.argv[2];
const templateType = process.argv[3] || 'turkey-map'; // Default template

if (!storyName) {
  console.error(
    'Usage: node create-structured-story.js <story-name> [template]'
  );
  console.error('');
  console.error('Examples:');
  console.error('  node create-structured-story.js my-story');
  console.error(
    '  node create-structured-story.js regional-analysis turkey-map'
  );
  console.error('  node create-structured-story.js europe-data europe-map');
  console.error('');
  console.error('Available templates:');
  console.error('  - turkey-map    : Turkey map with zoom functionality');
  console.error('  - europe-map    : European map with country highlighting');
  console.error('  - time-series   : Time-based chart analysis');
  console.error('  - custom        : Empty template for custom stories');
  process.exit(1);
}

const storyDir = path.join(__dirname, '..', 'pages', storyName);

// Create directory
if (!fs.existsSync(storyDir)) {
  fs.mkdirSync(storyDir, { recursive: true });
} else {
  console.warn(`⚠️  Directory already exists: pages/${storyName}/`);
}

// Story templates
const templates = {
  'turkey-map': {
    meta: {
      title: storyName
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      description: `A scrollytelling story about ${storyName.replace(/-/g, ' ')}`,
      authors: ['Your Name'],
      section: 'Graphics',
    },
    layout: {
      type: 'two-column',
      sticky: 'graphic',
      graphicPosition: 'left',
    },
    steps: [
      {
        id: '1.0',
        type: 'intro',
        content: {
          headline: storyName
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          text: 'Introduction to your story. Set the context here.',
        },
      },
      {
        id: '2.1',
        type: 'chart',
        content: {
          text: "Here's the overall view of Turkey showing regional data patterns.",
        },
        visual: {
          component: 'TurkeyMapChart',
          data: 'turkey.json',
          props: {
            width: 800,
            height: 600,
          },
        },
        transition: {
          duration: 1200,
          ease: 'cubicInOut',
        },
      },
      {
        id: '2.2',
        type: 'map_action',
        content: {
          text: "Now let's zoom into Istanbul to see the detailed breakdown.",
        },
        visual: {
          component: 'TurkeyMapChart',
          state: {
            zoom: {
              region: 'istanbul',
              coordinates: [28.9784, 41.0082],
              level: 8,
            },
          },
        },
        transition: {
          duration: 1500,
          ease: 'ease-out',
        },
      },
      {
        id: '3.0',
        type: 'conclusion',
        content: {
          headline: 'Key Findings',
          text: 'Summarize your main insights and conclusions here.',
        },
      },
    ],
  },

  'europe-map': {
    meta: {
      title: storyName
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      description: `European analysis: ${storyName.replace(/-/g, ' ')}`,
      authors: ['Your Name'],
      section: 'Graphics',
    },
    layout: {
      type: 'two-column',
      sticky: 'graphic',
      graphicPosition: 'left',
    },
    steps: [
      {
        id: '1.0',
        type: 'intro',
        content: {
          headline: 'European Analysis',
          text: 'Exploring patterns across European countries.',
        },
      },
      {
        id: '2.1',
        type: 'chart',
        content: {
          text: 'Overview of European countries showing regional variations.',
        },
        visual: {
          component: 'EuropeanMapChart',
          data: 'europe.geojson',
          props: {
            width: 900,
            height: 700,
          },
        },
      },
      {
        id: '2.2',
        type: 'map_action',
        content: {
          text: 'Highlighting specific countries of interest.',
        },
        visual: {
          component: 'EuropeanMapChart',
          state: {
            highlight: {
              countries: ['TUR', 'DEU', 'FRA'],
              intensity: 0.8,
            },
          },
        },
      },
    ],
  },

  'time-series': {
    meta: {
      title: storyName
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      description: `Time series analysis: ${storyName.replace(/-/g, ' ')}`,
      authors: ['Your Name'],
    },
    layout: {
      type: 'two-column',
      sticky: 'graphic',
    },
    steps: [
      {
        id: '1.0',
        type: 'intro',
        content: {
          headline: 'Temporal Analysis',
          text: 'Understanding trends over time.',
        },
      },
      {
        id: '2.1',
        type: 'chart',
        content: {
          text: 'The data shows clear trends over the time period.',
        },
        visual: {
          component: 'TimeChart',
          data: 'your-data.csv',
          props: {
            width: 800,
            height: 400,
            chartType: 'line',
          },
        },
      },
    ],
  },

  custom: {
    meta: {
      title: storyName
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      description: 'Custom story template',
      authors: ['Your Name'],
    },
    layout: {
      type: 'two-column',
      sticky: 'graphic',
    },
    steps: [
      {
        id: '1.0',
        type: 'intro',
        content: {
          headline: 'Your Story Title',
          text: 'Add your story content here.',
        },
      },
    ],
  },
};

const selectedTemplate = templates[templateType] || templates.custom;

// Generate YAML story definition
const yamlContent = yaml.dump(selectedTemplate, {
  indent: 2,
  lineWidth: -1,
  noRefs: true,
});

// Create story.yaml file
const yamlPath = path.join(storyDir, 'story.yaml');
fs.writeFileSync(yamlPath, yamlContent);

// Create compile script
const compileScript = `#!/usr/bin/env node

/**
 * Compile story from YAML to Svelte
 * Run this after editing story.yaml
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { StoryCompiler } from '../../../lib/story-compiler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Read YAML story definition
  const yamlContent = fs.readFileSync(path.join(__dirname, 'story.yaml'), 'utf8');
  const storySchema = yaml.load(yamlContent);
  
  // Compile to Svelte
  const compiler = new StoryCompiler({ validation: true });
  const result = compiler.compile(storySchema);
  
  if (!result.success) {
    console.error('❌ Compilation failed:');
    result.errors.forEach(error => console.error('  -', error));
    process.exit(1);
  }
  
  // Write generated files
  fs.writeFileSync(path.join(__dirname, '+page.svelte'), result.svelte);
  fs.writeFileSync(path.join(__dirname, '+layout.ts'), result.layout);
  
  if (result.warnings.length > 0) {
    console.warn('⚠️  Warnings:');
    result.warnings.forEach(warning => console.warn('  -', warning));
  }
  
  console.log('✅ Story compiled successfully!');
  console.log('📁 Files generated:');
  console.log('   - +page.svelte');
  console.log('   - +layout.ts');
  console.log('🌐 Visit: http://localhost:5173/${storyName}');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
`;

fs.writeFileSync(path.join(storyDir, 'compile.js'), compileScript);
fs.chmodSync(path.join(storyDir, 'compile.js'), '755');

// Initial compilation
try {
  const { StoryCompiler } = await import('../lib/story-compiler.js');
  const compiler = new StoryCompiler({ validation: true });
  const result = compiler.compile(selectedTemplate);

  if (result.success) {
    fs.writeFileSync(path.join(storyDir, '+page.svelte'), result.svelte);
    fs.writeFileSync(path.join(storyDir, '+layout.ts'), result.layout);
  } else {
    console.warn(
      '⚠️  Initial compilation had errors. Edit story.yaml and run ./compile.js'
    );
  }
} catch (error) {
  console.warn(
    '⚠️  Could not perform initial compilation. Run ./compile.js after editing story.yaml'
  );
}

// Success message
console.log('✅ Created structured scrollytelling story!');
console.log('');
console.log('📁 Created files:');
console.log(`   - pages/${storyName}/story.yaml`);
console.log(`   - pages/${storyName}/+page.svelte`);
console.log(`   - pages/${storyName}/+layout.ts`);
console.log(`   - pages/${storyName}/compile.js`);
console.log('');
console.log('🎯 What this solves:');
console.log('   ✅ No more AI hallucination');
console.log('   ✅ Crystal clear step definitions');
console.log('   ✅ Deterministic component mapping');
console.log('   ✅ Validated chart properties');
console.log('');
console.log('📝 Next steps:');
console.log(`   1. Edit pages/${storyName}/story.yaml`);
console.log(`   2. Run: cd pages/${storyName} && ./compile.js`);
console.log(`   3. Visit: http://localhost:5173/${storyName}`);
console.log('');
console.log('💡 Your exact example:');
console.log('   Step 2.1: "add turkey map" → component: "TurkeyMapChart"');
console.log('   Step 2.2: "zoom to istanbul" → state.zoom.region: "istanbul"');
console.log('');
console.log('🚀 No more ambiguity! Every command maps to exact code.');
