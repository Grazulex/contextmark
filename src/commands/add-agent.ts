import fs from 'node:fs';
import path from 'node:path';
import { listAllAgents, loadAgent } from '../core/agent';
import { isLibraryInitialized } from '../core/library';
import { isProjectInitialized, loadLocalConfig, saveLocalConfig } from '../lib/config';
import { colors, error, success, warning } from '../utils/colors';
import { LibraryNotFoundError, ProjectNotInitializedError } from '../utils/errors';

export async function addAgentCommand(slug: string): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const projectPath = process.cwd();

  if (!isProjectInitialized(projectPath)) {
    throw new ProjectNotInitializedError();
  }

  // Check if agent exists
  const agents = listAllAgents();
  const agentSlugs = agents.map((a) => a.slug);

  if (!agentSlugs.includes(slug)) {
    error(`Agent "${slug}" not found in library.`);
    console.log();
    console.log('Available agents:');
    for (const a of agents) {
      console.log(`  ${colors.brand(a.slug)} - ${a.frontmatter.name}`);
    }
    console.log();
    return;
  }

  // Get project config
  const config = loadLocalConfig(projectPath);

  if (!config) {
    throw new ProjectNotInitializedError();
  }

  // Check if already added
  if (config.agents?.includes(slug)) {
    warning(`Agent "${slug}" is already in this project.`);
    return;
  }

  // Copy agent file to project .claude/skills/
  const agent = loadAgent(slug);
  const skillsDir = path.join(projectPath, '.claude', 'skills');
  const destPath = path.join(skillsDir, `${slug}.md`);

  // Ensure skills directory exists
  fs.mkdirSync(skillsDir, { recursive: true });

  // Copy agent content
  fs.copyFileSync(agent.path, destPath);

  // Update project config
  config.agents = [...(config.agents || []), slug];
  config.generated_at = new Date().toISOString();
  saveLocalConfig(projectPath, config);

  console.log();
  success(`Added agent "${slug}" to project`);
  console.log(`  ${colors.muted('Location:')} ${destPath}`);
  console.log();
}
