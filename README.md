# Architecture Documentation with LikeC4

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

Documentation site with interactive C4 architecture diagrams and PlantUML support.

## Project Structure

```
/
├── uml/                    # PlantUML diagrams
├── c4/                     # LikeC4 C4 model definitions
│   ├── ecommerce/          # E-Commerce project
│   └── projekt-b/          # Projekt B (CRM)
└── astro_starlight/        # Astro Starlight documentation site
    ├── src/
    │   ├── content/docs/   # MDX documentation pages
    │   ├── components/     # Astro/React components
    │   └── pages/          # Dynamic pages (UML viewer)
    ├── public/             # Static assets
    ├── astro.config.mjs    # Astro configuration
    ├── package.json
    └── tsconfig.json
```

## Commands

All commands are run from the `astro_starlight/` directory:

```bash
cd astro_starlight

# Install dependencies
npm install

# Start development server (default: localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run Astro CLI commands
npm run astro -- --help
```

## Deployment

Automatic deployment to GitHub Pages on push to `main` branch.

Site URL: https://rpreissel.github.io/c4-astro/

## Learn More

- [Starlight Documentation](https://starlight.astro.build/)
- [Astro Documentation](https://docs.astro.build)
- [LikeC4 Documentation](https://likec4.dev/)
