import { loadLocalConfig, saveLocalConfig } from '../lib/config';
import { BlockReference, type LocalConfig } from '../types';
import { ProjectNotInitializedError } from '../utils/errors';
import { loadBlock } from './block';
import { loadProfile } from './profile';

export interface UpdateStatus {
  blockSlug: string;
  localVersion: string;
  libraryVersion: string;
  localHash: string;
  libraryHash: string;
  status: 'current' | 'outdated' | 'missing';
}

export function getProjectStatus(projectPath: string): UpdateStatus[] {
  const localConfig = loadLocalConfig(projectPath);

  if (!localConfig) {
    throw new ProjectNotInitializedError();
  }

  const statuses: UpdateStatus[] = [];

  for (const blockRef of localConfig.blocks) {
    try {
      const block = loadBlock(blockRef.name);

      const status: UpdateStatus = {
        blockSlug: blockRef.name,
        localVersion: blockRef.version,
        libraryVersion: block.frontmatter.version,
        localHash: blockRef.hash,
        libraryHash: block.hash,
        status: blockRef.hash === block.hash ? 'current' : 'outdated',
      };

      statuses.push(status);
    } catch {
      // Block doesn't exist in library anymore
      statuses.push({
        blockSlug: blockRef.name,
        localVersion: blockRef.version,
        libraryVersion: '-',
        localHash: blockRef.hash,
        libraryHash: '-',
        status: 'missing',
      });
    }
  }

  return statuses;
}

export function needsUpdate(projectPath: string): boolean {
  const statuses = getProjectStatus(projectPath);
  return statuses.some((s) => s.status !== 'current');
}

export function getOutdatedBlocks(projectPath: string): UpdateStatus[] {
  const statuses = getProjectStatus(projectPath);
  return statuses.filter((s) => s.status === 'outdated');
}

export function addBlockToProject(projectPath: string, blockSlug: string): LocalConfig {
  const localConfig = loadLocalConfig(projectPath);

  if (!localConfig) {
    throw new ProjectNotInitializedError();
  }

  // Check if block already exists
  if (localConfig.blocks.some((b) => b.name === blockSlug)) {
    return localConfig;
  }

  // Load the block
  const block = loadBlock(blockSlug);

  // Add to config
  localConfig.blocks.push({
    name: blockSlug,
    version: block.frontmatter.version,
    hash: block.hash,
  });

  localConfig.generated_at = new Date().toISOString();
  saveLocalConfig(projectPath, localConfig);

  return localConfig;
}

export function removeBlockFromProject(projectPath: string, blockSlug: string): LocalConfig {
  const localConfig = loadLocalConfig(projectPath);

  if (!localConfig) {
    throw new ProjectNotInitializedError();
  }

  localConfig.blocks = localConfig.blocks.filter((b) => b.name !== blockSlug);
  localConfig.generated_at = new Date().toISOString();
  saveLocalConfig(projectPath, localConfig);

  return localConfig;
}
