import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import matter from 'gray-matter';
import { listFiles, readFile, removeFile, writeFile } from '../lib/fs';
import { AGENTS_DIR, getAgentPath } from '../lib/paths';

export interface AgentFrontmatter {
  name: string;
  description: string;
}

export interface Agent {
  path: string;
  slug: string;
  frontmatter: AgentFrontmatter;
  content: string;
}

export function parseAgent(path: string): Agent {
  const content = readFile(path);
  const parsed = matter(content);
  const slug = path.replace(AGENTS_DIR + '/', '').replace('.md', '');

  return {
    path,
    slug,
    frontmatter: parsed.data as AgentFrontmatter,
    content: parsed.content.trim(),
  };
}

export function loadAgent(slug: string): Agent {
  const path = getAgentPath(slug);

  if (!existsSync(path)) {
    throw new Error(`Agent "${slug}" not found.`);
  }

  return parseAgent(path);
}

export function listAllAgents(): Agent[] {
  const files = listFiles(AGENTS_DIR, '.md');
  return files.map(parseAgent);
}

export function agentExists(slug: string): boolean {
  return existsSync(getAgentPath(slug));
}

export function createAgent(slug: string, name: string, description: string): Agent {
  const path = getAgentPath(slug);

  const content = `---
name: ${name}
description: ${description}
---

# ${name}

<!-- Agent instructions here -->

`;

  writeFile(path, content);
  return parseAgent(path);
}

export function deleteAgent(slug: string): void {
  const path = getAgentPath(slug);

  if (!existsSync(path)) {
    throw new Error(`Agent "${slug}" not found.`);
  }

  removeFile(path);
}

export function getAgentContent(slug: string): string {
  const agent = loadAgent(slug);
  return `---
name: ${agent.frontmatter.name}
description: ${agent.frontmatter.description}
---

${agent.content}`;
}
