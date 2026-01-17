#!/usr/bin/env node
/**
 * PlantUML SVG Generator
 *
 * Generiert SVG-Dateien aus .puml Quellen via Remote PlantUML-Server.
 * Wird beim Build verwendet. Für Dev-Mode nutzt Astro den Vite-Plugin-Watcher.
 *
 * Verwendung:
 *   node scripts/generate-uml.mjs
 *
 * Umgebungsvariablen:
 *   PLANTUML_SERVER_URL - PlantUML Server (Default: https://www.plantuml.com/plantuml/svg)
 */

import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generateSvg,
  findPumlFiles,
  getUmlDir,
  getOutputDir,
  SERVER_URL,
} from '../src/lib/plantuml.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UML_DIR = getUmlDir(__dirname);
const OUTPUT_DIR = getOutputDir(__dirname);

/**
 * Alle .puml Dateien verarbeiten
 */
async function generateAll() {
  console.log(`Fetching from: ${SERVER_URL}`);

  const files = await findPumlFiles(UML_DIR);

  if (files.length === 0) {
    console.log('No .puml files found');
    return;
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  const results = await Promise.allSettled(
    files.map((f) => generateSvg(f.fullPath, f.relativePath, OUTPUT_DIR))
  );

  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length > 0) {
    console.error(`\nFailed to generate ${failed.length} diagram(s):`);
    failed.forEach((r) => console.error(`  - ${r.reason.message}`));
  }

  console.log(
    `\nGenerated ${results.length - failed.length}/${files.length} diagrams`
  );
}

// Main
await generateAll();
