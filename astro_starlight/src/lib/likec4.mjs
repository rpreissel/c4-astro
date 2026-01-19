/**
 * LikeC4 Utility Functions
 * 
 * Wrapper around the LikeC4 Model API for use in Astro static site generation.
 * Used by:
 * - src/pages/c4/index.astro (Overview page)
 * - src/pages/c4/[...slug].astro (Detail pages)
 */

import { LikeC4 } from 'likec4';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Cache for LikeC4 instance (only load once during build)
 * @type {LikeC4 | null}
 */
let _likec4Instance = null;

/**
 * Loads LikeC4 workspace (cached)
 * @param {string} workspacePath - Absolute path to the c4 workspace directory
 * @returns {Promise<LikeC4>}
 */
export async function getLikeC4Instance(workspacePath) {
  if (!_likec4Instance) {
    _likec4Instance = await LikeC4.fromWorkspace(workspacePath, {
      logger: false,
      graphviz: 'wasm'
    });
  }
  return _likec4Instance;
}

/**
 * Returns all C4 project IDs from the workspace
 * @param {string} workspacePath - Absolute path to the c4 workspace directory
 * @returns {Promise<string[]>} Array of project IDs (e.g. ['ecommerce', 'projekt-b'])
 */
export async function findC4Projects(workspacePath) {
  const likec4 = await getLikeC4Instance(workspacePath);
  return likec4.projects();
}

/**
 * Returns all views from a specific project
 * @param {string} workspacePath - Absolute path to the c4 workspace directory
 * @param {string} projectId - Project ID (e.g. 'ecommerce')
 * @returns {Promise<Array<{id: string, title: string, description: string | null, type: string, mode: string | null, folderPath: string, viewPath: string}>>}
 */
export async function getProjectViews(workspacePath, projectId) {
  const likec4 = await getLikeC4Instance(workspacePath);
  const model = await likec4.layoutedModel(projectId);
  const views = Array.from(model.views());
  
  return views.map(view => ({
    id: view.id,
    title: view.title || view.id,
    description: view.description?.isEmpty 
      ? null 
      : view.description?.$source?.txt || null,
    type: view._type,           // 'element' | 'dynamic' | 'deployment'
    mode: view.mode || null,    // 'diagram' | 'sequence' (only for dynamic views)
    folderPath: view.folder.path || '',  // folder path (e.g. 'abc' or '')
    viewPath: view.viewPath     // full path including title (e.g. 'abc/Container Diagram')
  }));
}

/**
 * Finds MDX/MD files that reference a specific C4 view
 * Searches for patterns like: <C4ViewEcommerce viewId="index" /> or <C4View viewId="index" />
 * 
 * @typedef {Object} DiagramReference
 * @property {string} filePath - Relative path to the MDX/MD file
 * @property {string} title - Title of the page (from frontmatter)
 * @property {string} slug - URL slug for the page
 * 
 * @param {string} projectName - Project name (e.g. 'ecommerce')
 * @param {string} viewId - View ID (e.g. 'index')
 * @param {string} docsDir - Absolute path to the docs directory
 * @returns {Promise<DiagramReference[]>}
 */
export async function findC4ViewReferences(projectName, viewId, docsDir) {
  const references = [];
  
  // Component names: ecommerce -> C4ViewEcommerce, or generic C4View
  const componentNames = [
    `C4View${capitalize(projectName)}`,
    'C4View' // Generic alias (if someone uses this)
  ];
  
  // Create regex patterns for all possible component names
  const patterns = componentNames.map(name => 
    new RegExp(
      `<${name}[^>]*\\sviewId=["'\`{]+"?${escapeRegex(viewId)}["'\`}]+`,
      'g'
    )
  );
  
  await scanDocsDir(docsDir, docsDir, references, patterns);
  return references;
}

/**
 * Recursively scan docs directory for MDX/MD files
 * @param {string} dir 
 * @param {string} baseDir 
 * @param {DiagramReference[]} references 
 * @param {RegExp[]} patterns 
 */
async function scanDocsDir(dir, baseDir, references, patterns) {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await scanDocsDir(fullPath, baseDir, references, patterns);
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      const content = await readFile(fullPath, 'utf-8');
      
      // Check if any pattern matches
      const hasMatch = patterns.some(regex => {
        const match = regex.test(content);
        regex.lastIndex = 0; // Reset regex
        return match;
      });
      
      if (hasMatch) {
        // Extract title from frontmatter
        const titleMatch = content.match(/^---[\s\S]*?title:\s*['"]?([^'"\n]+)['"]?[\s\S]*?---/);
        const title = titleMatch ? titleMatch[1].trim() : entry.name.replace(/\.mdx?$/, '');
        
        // Calculate slug (relative path without extension)
        const relativePath = fullPath.slice(baseDir.length + 1);
        const slug = relativePath
          .replace(/\.mdx?$/, '')
          .replace(/\/index$/, '')  // index.mdx -> directory slug
          .replace(/\\/g, '/');     // normalize Windows paths
        
        references.push({
          filePath: relativePath,
          title,
          slug,
        });
      }
    }
  }
}

/**
 * Capitalize first letter of a string
 * @param {string} str 
 * @returns {string}
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generates the component name for a given project ID
 * Converts kebab-case project IDs to PascalCase component names
 * 
 * @param {string} projectId - Project ID (e.g. 'ecommerce', 'projekt-b')
 * @returns {string} Component name (e.g. 'C4ViewEcommerce', 'C4ViewProjektB')
 * 
 * @example
 * getComponentName('ecommerce') // 'C4ViewEcommerce'
 * getComponentName('projekt-b') // 'C4ViewProjektB'
 */
export function getComponentName(projectId) {
  // Split by hyphens and capitalize each part, then join
  const pascalCase = projectId
    .split('-')
    .map(part => capitalize(part))
    .join('');
  return `C4View${pascalCase}`;
}

/**
 * Escape special regex characters
 * @param {string} str 
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
