import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const distDir = './dist';

function fixImportsInFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const fileDir = dirname(filePath);

  // Fix relative imports to add .js extension or /index.js for directories
  const importRegex = /(from\s+['"])(\.[^'"]+)(['"])/g;
  content = content.replace(importRegex, (match, p1, p2, p3) => {
    if (p2.endsWith('.js') || p2.endsWith('.json')) {
      return match;
    }

    // Resolve the path relative to the current file
    const resolvedPath = resolve(fileDir, p2);

    // Check if it's a directory (has index.js)
    if (existsSync(resolvedPath) && statSync(resolvedPath).isDirectory()) {
      return `${p1}${p2}/index.js${p3}`;
    }

    // It's a file, just add .js
    return `${p1}${p2}.js${p3}`;
  });

  // Fix dynamic imports
  const dynamicImportRegex = /(import\s*\(\s*['"])(\.[^'"]+)(['"]\s*\))/g;
  content = content.replace(dynamicImportRegex, (match, p1, p2, p3) => {
    if (p2.endsWith('.js') || p2.endsWith('.json')) {
      return match;
    }

    const resolvedPath = resolve(fileDir, p2);

    if (existsSync(resolvedPath) && statSync(resolvedPath).isDirectory()) {
      return `${p1}${p2}/index.js${p3}`;
    }

    return `${p1}${p2}.js${p3}`;
  });

  writeFileSync(filePath, content);
}

function processDirectory(dir) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.endsWith('.js')) {
      fixImportsInFile(fullPath);
    }
  }
}

console.log('Fixing imports in dist/...');
processDirectory(distDir);
console.log('Done!');
