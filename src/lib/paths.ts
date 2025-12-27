import { homedir } from 'node:os';
import { join } from 'node:path';

// Library paths
export const LIBRARY_DIR = join(homedir(), '.contextmark');
export const BLOCKS_DIR = join(LIBRARY_DIR, 'blocks');
export const PROFILES_DIR = join(LIBRARY_DIR, 'profiles');
export const AGENTS_DIR = join(LIBRARY_DIR, 'agents');
export const COMMANDS_DIR = join(LIBRARY_DIR, 'commands');
export const GLOBAL_DIR = join(LIBRARY_DIR, 'global');
export const CONFIG_FILE = join(LIBRARY_DIR, 'config.yml');

// Project paths
export const LOCAL_CONFIG_FILE = '.contextmark.yml';
export const CLAUDE_MD_FILE = 'CLAUDE.md';
export const CLAUDE_DIR = '.claude';

export function getLibraryPath(...segments: string[]): string {
  return join(LIBRARY_DIR, ...segments);
}

export function getBlockPath(slug: string): string {
  return join(BLOCKS_DIR, `${slug}.md`);
}

export function getProfilePath(slug: string): string {
  return join(PROFILES_DIR, `${slug}.yml`);
}

export function getAgentPath(name: string): string {
  return join(AGENTS_DIR, `${name}.md`);
}

export function getCommandPath(name: string): string {
  return join(COMMANDS_DIR, `${name}.md`);
}

export function getProjectClaudePath(projectPath: string): string {
  return join(projectPath, CLAUDE_MD_FILE);
}

export function getProjectConfigPath(projectPath: string): string {
  return join(projectPath, LOCAL_CONFIG_FILE);
}

export function getProjectClaudeDir(projectPath: string): string {
  return join(projectPath, CLAUDE_DIR);
}
