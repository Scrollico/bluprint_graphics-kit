#!/usr/bin/env node

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
  const yamlContent = fs.readFileSync(
    path.join(__dirname, 'story.yaml'),
    'utf8'
  );
  const storySchema = yaml.load(yamlContent);

  // Compile to Svelte
  const compiler = new StoryCompiler({ validation: true });
  const result = compiler.compile(storySchema);

  if (!result.success) {
    console.error('❌ Compilation failed:');
    result.errors.forEach((error) => console.error('  -', error));
    process.exit(1);
  }

  // Write generated files
  fs.writeFileSync(path.join(__dirname, '+page.svelte'), result.svelte);
  fs.writeFileSync(path.join(__dirname, '+layout.ts'), result.layout);

  if (result.warnings.length > 0) {
    console.warn('⚠️  Warnings:');
    result.warnings.forEach((warning) => console.warn('  -', warning));
  }

  console.log('✅ Story compiled successfully!');
  console.log('📁 Files generated:');
  console.log('   - +page.svelte');
  console.log('   - +layout.ts');
  console.log('🌐 Visit: http://localhost:5173/turkey-test');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
