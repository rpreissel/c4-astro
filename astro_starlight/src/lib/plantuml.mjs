/**
 * Gemeinsame PlantUML Utility-Funktionen
 *
 * Wird verwendet von:
 * - astro.config.mjs (Vite-Plugin für Dev-Mode)
 * - scripts/generate-uml.mjs (Build-Script)
 * - src/pages/uml/[...slug].astro (Statische Seiten)
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import plantumlEncoder from 'plantuml-encoder';

/** PlantUML Server URL */
export const SERVER_URL =
  process.env.PLANTUML_SERVER_URL || 'https://www.plantuml.com/plantuml/svg';

/**
 * Berechnet UML_DIR relativ zu einer Datei
 * @param {string} basePath - import.meta.dirname oder __dirname der aufrufenden Datei
 * @param {string} relativePath - Relativer Pfad zum uml-Verzeichnis
 */
export function getUmlDir(basePath, relativePath = '../../uml') {
  return join(basePath, relativePath);
}

/**
 * Berechnet OUTPUT_DIR relativ zu einer Datei
 * @param {string} basePath - import.meta.dirname oder __dirname der aufrufenden Datei
 * @param {string} relativePath - Relativer Pfad zum Output-Verzeichnis
 */
export function getOutputDir(basePath, relativePath = '../public/uml-generated') {
  return join(basePath, relativePath);
}

/**
 * Generiert eine SVG-Datei aus einer .puml-Datei
 * @param {string} pumlPath - Absoluter Pfad zur .puml-Datei
 * @param {string} relativePath - Relativer Pfad (z.B. "ordnerA/file2.puml")
 * @param {string} outputDir - Zielverzeichnis für SVG-Dateien
 * @param {Object} [options] - Optionale Einstellungen
 * @param {boolean} [options.silent] - Keine Console-Ausgabe
 * @returns {Promise<string>} - Pfad zur generierten SVG-Datei
 */
export async function generateSvg(pumlPath, relativePath, outputDir, options = {}) {
  const content = await readFile(pumlPath, 'utf-8');
  const encoded = plantumlEncoder.encode(content);
  const url = `${SERVER_URL}/${encoded}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${relativePath}: ${response.status}`);
  }

  const svg = await response.text();
  const outputPath = join(outputDir, relativePath.replace(/\.puml$/, '.svg'));

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, svg);

  if (!options.silent) {
    console.log(`Generated: ${relativePath.replace(/\.puml$/, '.svg')}`);
  }

  return outputPath;
}

/**
 * @typedef {Object} PumlFile
 * @property {string} fullPath - Absoluter Pfad zur Datei
 * @property {string} relativePath - Relativer Pfad vom Basisverzeichnis
 * @property {string} [content] - Optionaler Dateiinhalt
 */

/**
 * Rekursiv alle .puml Dateien im Verzeichnis finden
 * @param {string} dir - Zu durchsuchendes Verzeichnis
 * @param {string} [baseDir] - Basisverzeichnis für relative Pfade
 * @param {Object} [options] - Optionale Einstellungen
 * @param {boolean} [options.includeContent] - Dateiinhalt mitlesen
 * @returns {Promise<PumlFile[]>}
 */
export async function findPumlFiles(dir, baseDir = dir, options = {}) {
  const entries = await readdir(dir, { withFileTypes: true });
  /** @type {PumlFile[]} */
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findPumlFiles(fullPath, baseDir, options)));
    } else if (entry.name.endsWith('.puml')) {
      /** @type {PumlFile} */
      const file = {
        fullPath,
        relativePath: fullPath.slice(baseDir.length + 1),
      };
      if (options.includeContent) {
        file.content = await readFile(fullPath, 'utf-8');
      }
      files.push(file);
    }
  }

  return files;
}
