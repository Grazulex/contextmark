import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import matter from 'gray-matter';
import { listDirs, listFilesRecursive, readFile, removeFile, writeFile } from '../lib/fs';
import { BLOCKS_DIR, getBlockPath } from '../lib/paths';
import type { Block, BlockCategory, BlockFrontmatter } from '../types';
import { BlockNotFoundError } from '../utils/errors';

export function getBlockSlug(path: string): string {
  // Extract slug from path: ~/.contextmark/blocks/laravel/base.md -> laravel/base
  const relative = path.replace(`${BLOCKS_DIR}/`, '').replace('.md', '');
  return relative;
}

export function parseBlock(path: string): Block {
  const content = readFile(path);
  const parsed = matter(content);

  const frontmatter = parsed.data as BlockFrontmatter;
  const blockContent = parsed.content.trim();
  const hash = createHash('md5').update(content).digest('hex').substring(0, 8);

  return {
    path,
    slug: getBlockSlug(path),
    frontmatter,
    content: blockContent,
    hash,
  };
}

export function loadBlock(slug: string): Block {
  const path = getBlockPath(slug);

  if (!existsSync(path)) {
    throw new BlockNotFoundError(slug);
  }

  return parseBlock(path);
}

export function listAllBlocks(): Block[] {
  const files = listFilesRecursive(BLOCKS_DIR, '.md');
  return files.map(parseBlock);
}

export function listBlocksByCategory(): BlockCategory[] {
  const categories: BlockCategory[] = [];
  const dirs = listDirs(BLOCKS_DIR);

  for (const dir of dirs) {
    const categoryName = dir.split('/').pop()!;
    const files = listFilesRecursive(dir, '.md');
    const blocks = files.map(parseBlock);

    if (blocks.length > 0) {
      categories.push({
        name: categoryName,
        blocks,
      });
    }
  }

  return categories;
}

export function blockExists(slug: string): boolean {
  return existsSync(getBlockPath(slug));
}

export function createBlock(slug: string, name: string, description: string): Block {
  const path = getBlockPath(slug);

  const content = `---
name: ${name}
description: ${description}
version: 1.0.0
tags: []
---

## ${name}

<!-- Add your content here -->

`;

  writeFile(path, content);
  return parseBlock(path);
}

export function updateBlockContent(slug: string, content: string): Block {
  const path = getBlockPath(slug);

  if (!existsSync(path)) {
    throw new BlockNotFoundError(slug);
  }

  writeFile(path, content);
  return parseBlock(path);
}

export function deleteBlock(slug: string): void {
  const path = getBlockPath(slug);

  if (!existsSync(path)) {
    throw new BlockNotFoundError(slug);
  }

  removeFile(path);
}

export function getBlockContent(slug: string): string {
  const block = loadBlock(slug);
  return block.content;
}
