import { existsSync } from 'node:fs';
import matter from 'gray-matter';
import { listFiles, readFile, removeFile, writeFile } from '../lib/fs';
import { COMMANDS_DIR, getCommandPath } from '../lib/paths';

export interface CommandFrontmatter {
  name: string;
  description: string;
}

export interface ContextCommand {
  path: string;
  slug: string;
  frontmatter: CommandFrontmatter;
  content: string;
}

export function parseCommand(path: string): ContextCommand {
  const content = readFile(path);
  const parsed = matter(content);
  const slug = path.replace(COMMANDS_DIR + '/', '').replace('.md', '');

  return {
    path,
    slug,
    frontmatter: parsed.data as CommandFrontmatter,
    content: parsed.content.trim(),
  };
}

export function loadCommand(slug: string): ContextCommand {
  const path = getCommandPath(slug);

  if (!existsSync(path)) {
    throw new Error(`Command "${slug}" not found.`);
  }

  return parseCommand(path);
}

export function listAllCommands(): ContextCommand[] {
  const files = listFiles(COMMANDS_DIR, '.md');
  return files.map(parseCommand);
}

export function commandExists(slug: string): boolean {
  return existsSync(getCommandPath(slug));
}

export function createCommand(slug: string, name: string, description: string): ContextCommand {
  const path = getCommandPath(slug);

  const content = `---
name: ${name}
description: ${description}
---

# ${name}

<!-- Command instructions here -->

`;

  writeFile(path, content);
  return parseCommand(path);
}

export function deleteCommand(slug: string): void {
  const path = getCommandPath(slug);

  if (!existsSync(path)) {
    throw new Error(`Command "${slug}" not found.`);
  }

  removeFile(path);
}

export function getCommandContent(slug: string): string {
  const cmd = loadCommand(slug);
  return `---
name: ${cmd.frontmatter.name}
description: ${cmd.frontmatter.description}
---

${cmd.content}`;
}
