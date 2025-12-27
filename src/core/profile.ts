import { existsSync } from 'node:fs';
import YAML from 'yaml';
import { listFiles, readFile, removeFile, writeFile } from '../lib/fs';
import { PROFILES_DIR, getProfilePath } from '../lib/paths';
import type { Profile, ProfileConfig } from '../types';
import { ProfileNotFoundError } from '../utils/errors';

export function getProfileSlug(path: string): string {
  // Extract slug from path: ~/.contextmark/profiles/laravel-package.yml -> laravel-package
  return path.replace(`${PROFILES_DIR}/`, '').replace('.yml', '');
}

export function parseProfile(path: string): Profile {
  const content = readFile(path);
  const config = YAML.parse(content) as ProfileConfig;

  return {
    path,
    slug: getProfileSlug(path),
    config,
  };
}

export function loadProfile(slug: string): Profile {
  const path = getProfilePath(slug);

  if (!existsSync(path)) {
    throw new ProfileNotFoundError(slug);
  }

  return parseProfile(path);
}

export function listAllProfiles(): Profile[] {
  const files = listFiles(PROFILES_DIR, '.yml');
  return files.map(parseProfile);
}

export function profileExists(slug: string): boolean {
  return existsSync(getProfilePath(slug));
}

export function createProfile(
  slug: string,
  name: string,
  description: string,
  blocks: string[] = []
): Profile {
  const path = getProfilePath(slug);

  const config: ProfileConfig = {
    name,
    description,
    blocks,
    agents: [],
    commands: [],
  };

  writeFile(path, YAML.stringify(config));
  return parseProfile(path);
}

export function updateProfile(slug: string, config: ProfileConfig): Profile {
  const path = getProfilePath(slug);

  if (!existsSync(path)) {
    throw new ProfileNotFoundError(slug);
  }

  writeFile(path, YAML.stringify(config));
  return parseProfile(path);
}

export function deleteProfile(slug: string): void {
  const path = getProfilePath(slug);

  if (!existsSync(path)) {
    throw new ProfileNotFoundError(slug);
  }

  removeFile(path);
}

export function addBlockToProfile(profileSlug: string, blockSlug: string): Profile {
  const profile = loadProfile(profileSlug);

  if (!profile.config.blocks.includes(blockSlug)) {
    profile.config.blocks.push(blockSlug);
    return updateProfile(profileSlug, profile.config);
  }

  return profile;
}

export function removeBlockFromProfile(profileSlug: string, blockSlug: string): Profile {
  const profile = loadProfile(profileSlug);
  profile.config.blocks = profile.config.blocks.filter((b) => b !== blockSlug);
  return updateProfile(profileSlug, profile.config);
}
