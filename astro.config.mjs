// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import { LikeC4VitePlugin } from 'likec4/vite-plugin';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Vite-Plugin das bei Änderungen im uml-Ordner den Server neu startet
 * @returns {import('vite').Plugin}
 */
function umlWatchPlugin() {
  return {
    name: 'uml-watch',
    configureServer(server) {
      // Überwache den uml-Ordner für neue/gelöschte/geänderte Dateien
      server.watcher.add('./uml/**/*.puml');
      
      /** @param {string} path @param {string} action */
      const handlePumlChange = (path, action) => {
        if (path.endsWith('.puml')) {
          console.log(`[uml-watch] Datei ${action}: ${path}`);
          server.restart();
        }
      };
      
      server.watcher.on('add', (path) => handlePumlChange(path, 'hinzugefügt'));
      server.watcher.on('unlink', (path) => handlePumlChange(path, 'gelöscht'));
      server.watcher.on('change', (path) => handlePumlChange(path, 'geändert'));
    },
  };
}

/**
 * Generiert Sidebar-Einträge aus einem Verzeichnis mit .puml-Dateien
 * @param {string} dir - Verzeichnis zum Scannen
 * @param {string} [baseDir] - Basis-Verzeichnis für relative Pfade
 * @param {string} [urlBase] - Basis-URL für Links
 */
function generateUmlSidebar(dir, baseDir = dir, urlBase = '/uml') {
  const entries = readdirSync(dir, { withFileTypes: true });
  /** @type {any[]} */
  const items = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const subItems = generateUmlSidebar(fullPath, baseDir, urlBase);
      if (subItems.length > 0) {
        items.push({
          label: entry.name,
          items: subItems,
        });
      }
    } else if (entry.name.endsWith('.puml')) {
      // Normalisiere baseDir für korrekten Replace
      const normalizedBaseDir = baseDir.replace(/^\.\//, '');
      const relativePath = fullPath
        .replace(normalizedBaseDir + '/', '')
        .replace(/\.puml$/, '');
      items.push({
        label: entry.name.replace('.puml', ''),
        link: `${urlBase}/${relativePath}`,
      });
    }
  }
  
  // Alphabetische Sortierung (Ordner und Dateien gemischt)
  items.sort((a, b) => a.label.localeCompare(b.label));
  
  return items;
}

const umlSidebarItems = generateUmlSidebar('./uml');

// https://astro.build/config
export default defineConfig({
	// GitHub Pages configuration
	site: 'https://rpreissel.github.io',
	base: '/c4-astro',

	integrations: [
		starlight({
			title: 'Architecture Docs',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/rpreissel/c4-astro' },
			],
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ label: 'Getting Started', slug: 'guides/example' },
					],
				},
			{
				label: 'E-Commerce',
				items: [
					{ label: 'System Context', slug: 'architecture/system-context' },
					{ label: 'Containers', slug: 'architecture/containers' },
					{ label: 'Components', slug: 'architecture/components' },
					{ label: 'Order Flow', slug: 'architecture/order-flow' },
					{ label: 'Checkout Sequence', slug: 'architecture/checkout-sequence' },
				],
			},
			{
				label: 'Projekt B - CRM',
				items: [
					{ label: 'CRM Overview', slug: 'projekt-b' },
				],
			},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
				{
					label: 'UML',
					items: umlSidebarItems,
				},
			],
		}),
		react(),
	],

	vite: {
		plugins: [
			LikeC4VitePlugin({
				workspace: './src/likec4',
			}),
			umlWatchPlugin(),
		],
	},
});
