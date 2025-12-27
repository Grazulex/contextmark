import { execSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadGlobalConfig, saveGlobalConfig } from '../lib/config';
import { LIBRARY_DIR } from '../lib/paths';

export interface SyncStatus {
  isGitRepo: boolean;
  hasRemote: boolean;
  remote?: string;
  branch?: string;
  ahead: number;
  behind: number;
  hasChanges: boolean;
  changedFiles: string[];
}

export function isGitRepo(): boolean {
  return existsSync(join(LIBRARY_DIR, '.git'));
}

export function initGitRepo(): void {
  execSync('git init', { cwd: LIBRARY_DIR, stdio: 'pipe' });
}

export function getRemote(): string | null {
  if (!isGitRepo()) return null;

  try {
    const result = execSync('git remote get-url origin', {
      cwd: LIBRARY_DIR,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.trim() || null;
  } catch {
    return null;
  }
}

export function setRemote(url: string): void {
  if (!isGitRepo()) {
    initGitRepo();
  }

  const existingRemote = getRemote();
  if (existingRemote) {
    execSync(`git remote set-url origin "${url}"`, { cwd: LIBRARY_DIR, stdio: 'pipe' });
  } else {
    execSync(`git remote add origin "${url}"`, { cwd: LIBRARY_DIR, stdio: 'pipe' });
  }

  // Update config
  const config = loadGlobalConfig();
  if (config) {
    config.sync.remote = url;
    config.sync.method = 'git';
    saveGlobalConfig(config);
  }
}

export function getCurrentBranch(): string {
  try {
    const result = execSync('git branch --show-current', {
      cwd: LIBRARY_DIR,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.trim() || 'main';
  } catch {
    return 'main';
  }
}

export function getStatus(): SyncStatus {
  const status: SyncStatus = {
    isGitRepo: isGitRepo(),
    hasRemote: false,
    ahead: 0,
    behind: 0,
    hasChanges: false,
    changedFiles: [],
  };

  if (!status.isGitRepo) {
    return status;
  }

  status.remote = getRemote() || undefined;
  status.hasRemote = !!status.remote;
  status.branch = getCurrentBranch();

  // Check for uncommitted changes
  try {
    const changes = execSync('git status --porcelain', {
      cwd: LIBRARY_DIR,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    status.changedFiles = changes.trim().split('\n').filter(Boolean);
    status.hasChanges = status.changedFiles.length > 0;
  } catch {
    // Ignore
  }

  // Check ahead/behind
  if (status.hasRemote) {
    try {
      // Fetch first to get accurate count
      execSync('git fetch origin --quiet', {
        cwd: LIBRARY_DIR,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 10000,
      });

      const result = execSync(`git rev-list --left-right --count origin/${status.branch}...HEAD`, {
        cwd: LIBRARY_DIR,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const [behind, ahead] = result.trim().split(/\s+/).map(Number);
      status.behind = behind || 0;
      status.ahead = ahead || 0;
    } catch {
      // Remote might not exist yet or fetch failed
    }
  }

  return status;
}

export function commitChanges(message: string): void {
  execSync('git add -A', { cwd: LIBRARY_DIR, stdio: 'pipe' });
  execSync(`git commit -m "${message}"`, { cwd: LIBRARY_DIR, stdio: 'pipe' });
}

export function push(): void {
  const branch = getCurrentBranch();
  execSync(`git push -u origin ${branch}`, { cwd: LIBRARY_DIR, stdio: 'pipe' });
}

export function pull(): void {
  const branch = getCurrentBranch();
  execSync(`git pull origin ${branch}`, { cwd: LIBRARY_DIR, stdio: 'pipe' });
}

export function hasUncommittedChanges(): boolean {
  try {
    const result = execSync('git status --porcelain', {
      cwd: LIBRARY_DIR,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}
