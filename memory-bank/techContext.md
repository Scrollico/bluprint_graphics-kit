# Technical Context - Bluprint Graphics Kit

## Technology Stack

### Core Framework

- **SvelteKit**: Full-stack framework for building web applications
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **pnpm**: Fast, disk space efficient package manager

### Visualization Libraries

- **D3.js**: Data visualization and manipulation
- **d3-geo**: Geographic projections and transformations
- **d3-transition**: Smooth animations and transitions
- **Mapbox GL**: Interactive maps and geographic data
- **Scrollama**: Scroll-driven interactions and animations

### Styling and UI

- **SCSS**: Advanced CSS with variables, mixins, and nesting
- **PostCSS**: CSS processing and optimization
- **Autoprefixer**: Automatic vendor prefixing
- **Graphics Components**: Reuters graphics component library

### Development Tools

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Svelte Check**: TypeScript checking for Svelte
- **Vitest**: Unit testing framework
- **Lefthook**: Git hooks for pre-commit checks

### Publishing and Deployment

- **Graphics Publisher**: Reuters publishing pipeline integration
- **RNGs-IO**: Story management and synchronization
- **GitHub Actions**: CI/CD automation
- **Netlify/Vercel**: Static site hosting

## Development Environment Setup

### Prerequisites

- **Node.js**: LTS version (20.18 or higher)
- **pnpm**: Package manager (`npm install -g pnpm`)
- **Git**: Version control
- **FFmpeg**: Video processing (for frame extraction)
- **Visual Studio Code**: Recommended IDE with Svelte extensions

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# Build for production
pnpm build

# Run tests
pnpm test

# Lint and format code
pnpm lint
pnpm format
```

### Environment Variables

```env
# Mapbox access token for interactive maps
VITE_MAPBOX_TOKEN=your_mapbox_token_here

# Reuters publishing configuration
REUTERS_API_KEY=your_api_key_here
REUTERS_API_SECRET=your_api_secret_here

# Development settings
NODE_ENV=development
VITE_DEV_MODE=true
```

## Project Structure

### Key Directories

```
bluprint_graphics-kit/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable components
│   │   ├── data/          # Data files (CSV, JSON, GeoJSON)
│   │   ├── styles/        # Global styles
│   │   └── utils/         # Utility functions
│   ├── pages/             # SvelteKit pages
│   └── template.html      # HTML template
├── pages/                 # Story pages
├── assets/                # Static assets
├── media-assets/          # Media files
├── dist/                  # Build output
└── memory-bank/           # Project documentation
```

### Configuration Files

- **svelte.config.js**: SvelteKit configuration
- **vite.config.ts**: Vite build configuration
- **tsconfig.json**: TypeScript configuration
- **package.json**: Dependencies and scripts
- **.bluprintrc**: Project-specific configuration

## Technical Constraints

### Performance Requirements

- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Browser Support

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile**: iOS Safari, Chrome Mobile

### File Size Limits

- **JavaScript Bundle**: < 500KB gzipped
- **CSS Bundle**: < 100KB gzipped
- **Images**: Optimized for web (WebP preferred)
- **Videos**: Compressed and optimized
- **3D Models**: < 10MB (optimized for web)

### Data Constraints

- **CSV Files**: < 10MB
- **JSON Files**: < 5MB
- **GeoJSON Files**: < 20MB
- **Real-time Data**: Limited to polling (no WebSocket)

## Build and Deployment

### Build Process

1. **Type Checking**: Svelte Check validates TypeScript
2. **Linting**: ESLint checks code quality
3. **Formatting**: Prettier formats code
4. **Asset Optimization**: Images, videos, and 3D models optimized
5. **Bundle Generation**: Vite creates optimized bundles
6. **Static Generation**: SvelteKit generates static files

### Publishing Pipeline

1. **Local Development**: `pnpm start` for local preview
2. **Preview Build**: `pnpm preview` for staging
3. **Story Sync**: `pnpm stories:sync` for RNGs-IO integration
4. **Publishing**: `pnpm pub` for production deployment

### Deployment Options

- **Reuters Graphics Server**: Primary publishing platform
- **GitHub Pages**: Static hosting for demos
- **Netlify**: Custom domain hosting
- **Vercel**: Alternative static hosting

## Security Considerations

### Data Security

- No sensitive data in client-side code
- API keys stored in environment variables
- Data validation on both client and server
- CORS configuration for external APIs

### Content Security

- CSP headers for XSS protection
- Sanitized user inputs
- Secure external resource loading
- HTTPS enforcement in production

## Monitoring and Analytics

### Performance Monitoring

- Core Web Vitals tracking
- Bundle size monitoring
- Load time analytics
- Error tracking and reporting

### User Analytics

- Story engagement metrics
- Scroll depth tracking
- Interaction analytics
- Device and browser statistics

## Troubleshooting

### Common Issues

1. **Build Failures**: Check TypeScript errors and missing dependencies
2. **Performance Issues**: Optimize images and reduce bundle size
3. **Map Loading**: Verify Mapbox token and network connectivity
4. **Video Playback**: Check video format and compression
5. **Mobile Issues**: Test responsive design and touch interactions

### Debug Tools

- **Browser DevTools**: Performance and debugging
- **Svelte DevTools**: Component debugging
- **Vite DevTools**: Build and dependency analysis
- **Network Tab**: API and asset loading issues
