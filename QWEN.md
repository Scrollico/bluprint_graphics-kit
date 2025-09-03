# Qwen Context for Reuters Graphics Kit

## Project Overview

This is the Reuters Graphics Kit, a rig for creating graphics pages and embeds for Reuters graphics and news applications. It's built with SvelteKit and uses modern web technologies for creating interactive data visualizations and stories.

## Key Technologies

- **Framework**: SvelteKit 5
- **Language**: TypeScript
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Styling**: Sass/CSS with PostCSS
- **Visualization Libraries**: D3.js, Mapbox GL, Three.js
- **UI Components**: @reuters-graphics/graphics-components

## Project Structure

- `/pages` - Main pages and stories (SvelteKit routing)
- `/src` - Shared components, utilities, and core functionality
- `/lib` - Reusable library components
- `/scripts` - Development and build scripts
- `/docs` - Documentation and guides
- `/examples` - Example implementations
- `/charts-demo` - Chart component demonstrations

## Core Capabilities

1. **Scrollytelling Framework** - Scroll-driven narrative experiences
2. **Interactive Maps** - Geographic visualizations with Mapbox GL
3. **Data Visualizations** - Charts and graphs using D3.js
4. **3D Graphics** - Three.js integration for immersive experiences
5. **Responsive Design** - Mobile-first approach for all components
6. **Embed Creation** - Tools for creating reusable embeds
7. **Data Handling** - Utilities for processing and managing data

## Development Commands

- `pnpm start` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run tests
- `pnpm lint` - Lint code
- `pnpm format` - Format code with Prettier

## Current Focus

The team is currently working on the Marmaray story, an interactive data story about suicide incidents on Istanbul's Marmaray metro system. This involves:

- Scroll-driven narrative implementation
- Interactive maps and data visualizations
- Mobile-responsive design
- Handling sensitive content appropriately

## Best Practices

- Use Svelte 5 syntax for all components
- Follow Reuters graphics style guidelines
- Maintain accessibility standards (WCAG compliance)
- Optimize for performance, especially with large datasets
- Implement responsive design for all components
- Document complex implementations in the development guide

## Key Documentation

- [Development Guide](DEVELOPMENT_GUIDE.md) - Comprehensive technical documentation
- [Marmaray Guide](MARMARAY_GUIDE.md) - Specific documentation for current project
- [Scrollytelling README](SCROLLYTELLING_README.md) - Framework implementation details

## Component Library

Most UI components come from the `@reuters-graphics/graphics-components` library. Always refer to the component documentation when implementing new features.

## Memory Bank Context

Additional context and active development information can be found in the `memory-bank/` directory:

- `activeContext.md` - Current work focus and decisions
- `techContext.md` - Technical implementation details
- `systemPatterns.md` - System architecture patterns
