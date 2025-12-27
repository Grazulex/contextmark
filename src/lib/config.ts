import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import YAML from 'yaml';
import { DEFAULT_GLOBAL_CONFIG, type GlobalConfig, type LocalConfig } from '../types';
import { CONFIG_FILE, LIBRARY_DIR, getProjectConfigPath } from './paths';

export function loadGlobalConfig(): GlobalConfig | null {
  if (!existsSync(CONFIG_FILE)) {
    return null;
  }

  try {
    const content = readFileSync(CONFIG_FILE, 'utf-8');
    return YAML.parse(content) as GlobalConfig;
  } catch {
    return null;
  }
}

export function saveGlobalConfig(config: GlobalConfig): void {
  const dir = dirname(CONFIG_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const content = YAML.stringify(config);
  writeFileSync(CONFIG_FILE, content, 'utf-8');
}

export function getGlobalConfig(): GlobalConfig {
  return loadGlobalConfig() ?? DEFAULT_GLOBAL_CONFIG;
}

export function loadLocalConfig(projectPath: string): LocalConfig | null {
  const configPath = getProjectConfigPath(projectPath);

  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return YAML.parse(content) as LocalConfig;
  } catch {
    return null;
  }
}

export function saveLocalConfig(projectPath: string, config: LocalConfig): void {
  const configPath = getProjectConfigPath(projectPath);
  const content = YAML.stringify(config);
  writeFileSync(configPath, content, 'utf-8');
}

export function isLibraryInitialized(): boolean {
  return existsSync(LIBRARY_DIR) && existsSync(CONFIG_FILE);
}

export function isProjectInitialized(projectPath: string): boolean {
  return existsSync(getProjectConfigPath(projectPath));
}
