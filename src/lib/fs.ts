import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';

export function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

export function ensureParentDir(filePath: string): void {
  const dir = dirname(filePath);
  ensureDir(dir);
}

export function listFiles(dir: string, extension?: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile()) {
      if (!extension || entry.name.endsWith(extension)) {
        files.push(join(dir, entry.name));
      }
    }
  }

  return files;
}

export function listDirs(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  const dirs: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      dirs.push(join(dir, entry.name));
    }
  }

  return dirs;
}

export function listFilesRecursive(dir: string, extension?: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath, extension));
    } else if (entry.isFile()) {
      if (!extension || entry.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

export function readFile(path: string): string {
  return readFileSync(path, 'utf-8');
}

export function writeFile(path: string, content: string): void {
  ensureParentDir(path);
  writeFileSync(path, content, 'utf-8');
}

export function copyFile(src: string, dest: string): void {
  ensureParentDir(dest);
  copyFileSync(src, dest);
}

export function removeFile(path: string): void {
  if (existsSync(path)) {
    rmSync(path);
  }
}

export function removeDir(path: string): void {
  if (existsSync(path)) {
    rmSync(path, { recursive: true });
  }
}

export function getFileName(path: string): string {
  return basename(path, extname(path));
}

export function getExtension(path: string): string {
  return extname(path);
}
