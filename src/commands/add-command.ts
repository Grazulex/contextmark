import fs from 'node:fs';
import path from 'node:path';
import { listAllCommands, loadCommand } from '../core/command';
import { isLibraryInitialized } from '../core/library';
import { isProjectInitialized, loadLocalConfig, saveLocalConfig } from '../lib/config';
import { colors, error, success, warning } from '../utils/colors';
import { LibraryNotFoundError, ProjectNotInitializedError } from '../utils/errors';

export async function addCommandCommand(slug: string): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const projectPath = process.cwd();

  if (!isProjectInitialized(projectPath)) {
    throw new ProjectNotInitializedError();
  }

  // Check if command exists
  const commands = listAllCommands();
  const commandSlugs = commands.map((c) => c.slug);

  if (!commandSlugs.includes(slug)) {
    error(`Command "${slug}" not found in library.`);
    console.log();
    console.log('Available commands:');
    for (const c of commands) {
      console.log(`  ${colors.brand(c.slug)} - ${c.frontmatter.name}`);
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
  if (config.commands?.includes(slug)) {
    warning(`Command "${slug}" is already in this project.`);
    return;
  }

  // Copy command file to project .claude/commands/
  const cmd = loadCommand(slug);
  const commandsDir = path.join(projectPath, '.claude', 'commands');
  const destPath = path.join(commandsDir, `${slug}.md`);

  // Ensure commands directory exists
  fs.mkdirSync(commandsDir, { recursive: true });

  // Copy command content
  fs.copyFileSync(cmd.path, destPath);

  // Update project config
  config.commands = [...(config.commands || []), slug];
  config.generated_at = new Date().toISOString();
  saveLocalConfig(projectPath, config);

  console.log();
  success(`Added command "${slug}" to project`);
  console.log(`  ${colors.muted('Location:')} ${destPath}`);
  console.log();
}
