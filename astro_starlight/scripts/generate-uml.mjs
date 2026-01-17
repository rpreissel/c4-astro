#!/usr/bin/env node
/**
 * PlantUML SVG Generator
 *
 * Generiert SVG-Dateien aus .puml Quellen via Remote PlantUML-Server.
 *
 * Verwendung:
 *   node scripts/generate-uml.mjs          # Einmalige Generierung
 *   node scripts/generate-uml.mjs --watch  # Mit File-Watcher (Dev-Mode)
 *
 * Umgebungsvariablen:
 *   PLANTUML_SERVER_URL - PlantUML Server (Default: https://www.plantuml.com/plantuml/svg)
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { watch } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import plantumlEncoder from 'plantuml-encoder';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UML_DIR = join(__dirname, '..', '..', 'uml');
const OUTPUT_DIR = join(__dirname, '..', 'public', 'uml-generated');
const SERVER_URL =
  process.env.PLANTUML_SERVER_URL || 'https://www.plantuml.com/plantuml/svg';

/**
 * Rekursiv alle .puml Dateien im Verzeichnis finden
 */
async function findPumlFiles(dir, baseDir = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findPumlFiles(fullPath, baseDir)));
    } else if (entry.name.endsWith('.puml')) {
      files.push({
        fullPath,
        relativePath: fullPath.slice(baseDir.length + 1),
      });
    }
  }

  return files;
}

/**
 * SVG für eine einzelne .puml Datei generieren
 */
async function generateSvg(pumlPath, relativePath) {
  const content = await readFile(pumlPath, 'utf-8');
  const encoded = plantumlEncoder.encode(content);
  const url = `${SERVER_URL}/${encoded}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${relativePath}: ${response.status}`);
  }

  const svg = await response.text();
  const outputPath = join(OUTPUT_DIR, relativePath.replace(/\.puml$/, '.svg'));

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, svg);

  console.log(`Generated: ${relativePath.replace(/\.puml$/, '.svg')}`);
}

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
    files.map((f) => generateSvg(f.fullPath, f.relativePath))
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

/**
 * File-Watcher für Dev-Mode starten
 */
function startWatcher() {
  console.log(`\nWatching ${UML_DIR} for changes...`);
  console.log('Press Ctrl+C to stop\n');

  watch(UML_DIR, { recursive: true }, async (eventType, filename) => {
    if (!filename?.endsWith('.puml')) return;

    // Debounce: Warte kurz, da manche Editoren mehrere Events feuern
    await new Promise((resolve) => setTimeout(resolve, 100));

    const fullPath = join(UML_DIR, filename);

    try {
      await generateSvg(fullPath, filename);
    } catch (err) {
      console.error(`Error regenerating ${filename}: ${err.message}`);
    }
  });
}

// Main
await generateAll();

if (process.argv.includes('--watch')) {
  startWatcher();
}
