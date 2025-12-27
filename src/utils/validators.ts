import { existsSync } from 'node:fs';

export function isValidBlockName(name: string): boolean {
  // Format: category/name (e.g., laravel/base)
  return /^[a-z0-9-]+\/[a-z0-9-]+$/.test(name);
}

export function isValidProfileName(name: string): boolean {
  // Format: kebab-case (e.g., laravel-package)
  return /^[a-z0-9-]+$/.test(name);
}

export function isValidVersion(version: string): boolean {
  // Semver format
  return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/.test(version);
}

export function directoryExists(path: string): boolean {
  return existsSync(path);
}

export function fileExists(path: string): boolean {
  return existsSync(path);
}

export function validateBlockSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: 'Block slug is required' };
  }

  if (!isValidBlockName(slug)) {
    return {
      valid: false,
      error: 'Block slug must be in format "category/name" (e.g., laravel/base)',
    };
  }

  return { valid: true };
}

export function validateProfileSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: 'Profile slug is required' };
  }

  if (!isValidProfileName(slug)) {
    return {
      valid: false,
      error: 'Profile slug must be kebab-case (e.g., laravel-package)',
    };
  }

  return { valid: true };
}
