// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import { LikeC4VitePlugin } from 'likec4/vite-plugin';
import { watch } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { generateSvg, findPumlFiles, getUmlDir, getOutputDir } from './src/lib/plantuml.mjs';

const UML_DIR = getUmlDir(import.meta.dirname, '../uml');
const OUTPUT_DIR = getOutputDir(import.meta.dirname, './public/uml-generated');

/**
 * Vite-Plugin für PlantUML:
 * - Build: Generiert alle SVGs vor dem Build (buildStart)
 * - Dev: Überwacht uml-Ordner und regeneriert SVGs bei Änderungen (configureServer)
 * @returns {import('vite').Plugin}
 */
function umlPlugin() {
  let svgsGenerated = false;
  
  return {
    name: 'uml-plugin',

    // BUILD: Alle SVGs vor dem Build generieren (nur einmal)
    async buildStart() {
      if (svgsGenerated) return;
      svgsGenerated = true;
      
      console.log('[uml-plugin] Generiere SVGs für Build...');
      
      const files = await findPumlFiles(UML_DIR);
      
      if (files.length === 0) {
        console.log('[uml-plugin] Keine .puml-Dateien gefunden');
        return;
      }
      
      await mkdir(OUTPUT_DIR, { recursive: true });
      
      const results = await Promise.allSettled(
        files.map(f => generateSvg(f.fullPath, f.relativePath, OUTPUT_DIR))
      );
      
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error(`[uml-plugin] ${failed.length} Fehler beim Generieren:`);
        failed.forEach(r => console.error(`  - ${r.reason.message}`));
      }
      
      console.log(`[uml-plugin] ${results.length - failed.length}/${files.length} SVGs generiert`);
    },

    // DEV: Datei-Watcher für Hot-Reload
    configureServer(server) {
      // Verwende Node.js fs.watch direkt (funktioniert außerhalb des Projekt-Roots)
      console.log(`[uml-watch] Überwache: ${UML_DIR}`);
      
      const watcher = watch(UML_DIR, { recursive: true }, async (eventType, filename) => {
        if (!filename?.endsWith('.puml')) return;
        
        console.log(`[uml-watch] Datei geändert: ${filename}`);
        
        const fullPath = join(UML_DIR, filename);
        
        try {
          // SVG regenerieren
          await generateSvg(fullPath, filename, OUTPUT_DIR, { silent: true });
          console.log(`[uml-watch] SVG generiert: ${filename.replace(/\.puml$/, '.svg')}`);
          
          // Browser-Reload auslösen
          server.ws.send({ type: 'full-reload' });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(`[uml-watch] Fehler: ${message}`);
        }
      });

      // Cleanup bei Server-Stop
      server.httpServer?.on('close', () => {
        watcher.close();
      });
    },
  };
}

// https://astro.build/config
export default defineConfig({
	// GitHub Pages configuration
	site: 'https://rpreissel.github.io',
	base: '/c4-astro',

	integrations: [
		starlight({
			title: 'Architecture Docs',
			customCss: ['./src/styles/custom.css'],
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
					link: '/uml/',
				},
			],
		}),
		react(),
	],

	vite: {
		plugins: [
			LikeC4VitePlugin({
				workspace: '../likec4',
			}),
			umlPlugin(),
		],
	},
});
