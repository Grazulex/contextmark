import { existsSync } from 'node:fs';
import YAML from 'yaml';
import { saveGlobalConfig } from '../lib/config';
import { ensureDir, writeFile } from '../lib/fs';
import {
  AGENTS_DIR,
  BLOCKS_DIR,
  COMMANDS_DIR,
  CONFIG_FILE,
  GLOBAL_DIR,
  LIBRARY_DIR,
  PROFILES_DIR,
  PROJECTS_DIR,
} from '../lib/paths';
import { DEFAULT_GLOBAL_CONFIG } from '../types';

export function isLibraryInitialized(): boolean {
  return existsSync(LIBRARY_DIR) && existsSync(CONFIG_FILE);
}

export function initializeLibrary(): void {
  // Create directory structure
  ensureDir(LIBRARY_DIR);
  ensureDir(BLOCKS_DIR);
  ensureDir(PROFILES_DIR);
  ensureDir(AGENTS_DIR);
  ensureDir(COMMANDS_DIR);
  ensureDir(GLOBAL_DIR);
  ensureDir(PROJECTS_DIR);

  // Create subdirectories for blocks
  ensureDir(`${BLOCKS_DIR}/laravel`);
  ensureDir(`${BLOCKS_DIR}/style`);
  ensureDir(`${BLOCKS_DIR}/tools`);

  // Save default config
  saveGlobalConfig(DEFAULT_GLOBAL_CONFIG);

  // Create example block
  createExampleBlock();

  // Create example profile
  createExampleProfile();

  // Create global CLAUDE.md placeholder
  createGlobalClaudeMd();
}

function createExampleBlock(): void {
  const content = `---
name: Style - Code
description: Personal code style conventions
version: 1.0.0
tags: [style, conventions]
---

## Code Style

### General Principles
- Write clear, readable code
- Prefer explicit over implicit
- Keep functions small and focused
- Use meaningful variable names

### Comments
- Only add comments where the logic isn't self-evident
- Avoid obvious comments
- Document the "why", not the "what"

### Error Handling
- Handle errors at the appropriate level
- Provide meaningful error messages
- Don't swallow exceptions silently
`;

  writeFile(`${BLOCKS_DIR}/style/code.md`, content);
}

function createExampleProfile(): void {
  const profile = {
    name: 'Default',
    description: 'Minimal default profile',
    blocks: ['style/code'],
    agents: [],
    commands: [],
  };

  writeFile(`${PROFILES_DIR}/default.yml`, YAML.stringify(profile));
}

function createGlobalClaudeMd(): void {
  const content = `# Global Context

This context applies to ALL projects.

## My Preferences

<!-- Add your global preferences here -->

`;

  writeFile(`${GLOBAL_DIR}/CLAUDE.md`, content);
}
