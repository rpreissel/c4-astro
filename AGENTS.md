# AGENTS.md - Coding Agent Guidelines

This file provides guidelines for AI coding agents working in this repository.

## Project Overview

This is an **Astro Starlight** documentation site with **LikeC4** architecture diagrams.
It uses React components to render interactive C4 model diagrams.

**Tech Stack:**
- Astro 5.x with Starlight theme
- React 19.x for diagram components
- LikeC4 for C4 model diagrams
- TypeScript (strict mode)
- Deployed to GitHub Pages

## Build & Development Commands

```bash
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

# Type checking (Astro-specific)
npx astro check
```

**Note:** There are no test or lint scripts configured. The project relies on TypeScript for type checking.

## Project Structure

```
src/
├── assets/              # Static assets (images, etc.)
├── components/          # Astro/React components
│   ├── LikeC4ViewEcommerce.astro   # E-Commerce project diagrams
│   └── LikeC4ViewProjektB.astro    # Projekt B diagrams
├── content/
│   └── docs/            # MDX documentation pages
├── likec4/              # LikeC4 model definitions
│   ├── ecommerce/       # E-Commerce C4 model
│   │   ├── likec4.config.json
│   │   ├── spec.c4      # Element/relationship specifications
│   │   ├── model.c4     # Architecture model
│   │   └── views.c4     # View definitions
│   └── projekt-b/       # Projekt B C4 model
│       ├── likec4.config.json
│       ├── spec.c4
│       ├── model.c4
│       └── views.c4
└── content.config.ts    # Astro content configuration
```

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode (extends `astro/tsconfigs/strict`)
- Prefer explicit types over `any` (use `as any` only for LikeC4 prop compatibility)
- Use `as const` for literal types in destructuring defaults
- Document props with JSDoc comments including `@default` values

### Astro Components (.astro)

```astro
---
// Frontmatter: imports and logic
import { Component } from 'package'

interface Props {
  /** Description with @default value */
  propName?: Type
}

const { propName = defaultValue } = Astro.props
---

<!-- Template -->
<div class="container">
  <Component prop={propName} client:only="react" />
</div>

<style>
  /* Scoped styles */
  .container { }
</style>
```

### MDX Documentation Pages

```mdx
---
title: Page Title
description: Page description for SEO
---

import Component from '../../../components/Component.astro'

Content here...

<Component prop="value" />
```

### LikeC4 Model Files (.c4)

- `spec.c4`: Define element types, relationship types, tags
- `model.c4`: Define actors, systems, containers, components, relationships
- `views.c4`: Define views with include/exclude predicates

```c4
// spec.c4 - Element specifications
specification {
  element actor {
    style {
      shape person
      color amber
    }
  }
}

// model.c4 - Architecture model
model {
  user = actor 'User' {
    description 'End user'
  }
  system = system 'System' {
    container webapp = container 'Web App' { }
  }
  user -> webapp 'Uses'
}

// views.c4 - View definitions
views {
  view index {
    title 'System Context'
    include *
  }
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Astro components | PascalCase | `LikeC4ViewEcommerce.astro` |
| MDX files | kebab-case | `system-context.mdx` |
| C4 elements | camelCase | `webApp`, `orderService` |
| C4 views | camelCase | `checkoutSequence` |
| CSS classes | kebab-case | `likec4-container` |

### Imports

- Use relative paths for local imports: `../../../components/`
- Use virtual modules for LikeC4: `likec4:react/project-name`
- Group imports: external packages first, then local modules

## Multi-Project LikeC4 Setup

Each project needs:
1. Separate folder in `src/likec4/{project-name}/`
2. `likec4.config.json` with `"name": "project-name"`
3. Separate Astro component importing from `likec4:react/{project-name}`

## Configuration Files

- `astro.config.mjs`: Astro + Starlight + LikeC4 Vite plugin config
- `tsconfig.json`: TypeScript config with LikeC4 types
- `.github/workflows/deploy.yml`: GitHub Pages deployment

## Sidebar Configuration

Update sidebar in `astro.config.mjs`:
```js
sidebar: [
  {
    label: 'Section Name',
    items: [
      { label: 'Page Title', slug: 'path/to-page' },
    ],
  },
]
```

## Common Tasks

### Add new documentation page
1. Create `.mdx` file in `src/content/docs/`
2. Import LikeC4View component
3. Add to sidebar in `astro.config.mjs`

### Add new C4 view
1. Define view in `src/likec4/{project}/views.c4`
2. Reference viewId in MDX: `<LikeC4View viewId="viewName" />`

### Add new C4 project
1. Create folder `src/likec4/{project-name}/`
2. Add `likec4.config.json`, `spec.c4`, `model.c4`, `views.c4`
3. Create Astro component `LikeC4View{ProjectName}.astro`
4. Import from `likec4:react/{project-name}`

## Deployment

Automatic deployment to GitHub Pages on push to `main` branch.
Site URL: https://rpreissel.github.io/c4-astro/
