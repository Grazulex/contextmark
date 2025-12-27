import boxen from 'boxen';
import ora from 'ora';
import { loadBlock } from '../core/block';
import { writeClaudeMd } from '../core/generator';
import { isLibraryInitialized } from '../core/library';
import { getOutdatedBlocks, getProjectStatus } from '../core/tracking';
import { isProjectInitialized, loadLocalConfig } from '../lib/config';
import { colors, icons, info, success, warning } from '../utils/colors';
import { LibraryNotFoundError, ProjectNotInitializedError } from '../utils/errors';

interface UpdateOptions {
  all?: boolean;
  diff?: boolean;
  force?: boolean;
}

export async function updateCommand(options: UpdateOptions): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  if (options.all) {
    await updateAllProjects(options);
    return;
  }

  await updateCurrentProject(options);
}

async function updateCurrentProject(options: UpdateOptions): Promise<void> {
  const projectPath = process.cwd();

  if (!isProjectInitialized(projectPath)) {
    throw new ProjectNotInitializedError();
  }

  const localConfig = loadLocalConfig(projectPath);
  const statuses = getProjectStatus(projectPath);
  const outdated = statuses.filter((s) => s.status === 'outdated');

  if (outdated.length === 0 && !options.force) {
    console.log();
    success('All blocks are up to date!');
    console.log();
    return;
  }

  console.log();
  info(`Updating project with profile "${localConfig!.profile}"...`);
  console.log();

  // Show diff if requested
  if (options.diff && outdated.length > 0) {
    console.log(colors.bold('Changes to apply:'));
    console.log();
    for (const status of outdated) {
      console.log(
        `  ${icons.sync} ${colors.brand(status.blockSlug)}: ` +
          `${colors.muted(status.localVersion)} ${icons.arrow} ${colors.success(status.libraryVersion)}`
      );
    }
    console.log();
  }

  const spinner = ora('Regenerating CLAUDE.md...').start();

  try {
    writeClaudeMd(projectPath, localConfig!.profile, {
      projectPath,
    });

    spinner.succeed('CLAUDE.md updated');

    console.log();
    console.log(
      boxen(
        `${colors.brand.bold('Project Updated')}\n\n` +
          `${icons.check} Blocks updated: ${outdated.length}\n` +
          `${icons.check} Profile: ${colors.brand(localConfig!.profile)}`,
        {
          padding: 1,
          borderStyle: 'round',
          borderColor: '#8B5CF6',
        }
      )
    );

    // Show updated blocks
    if (outdated.length > 0) {
      console.log();
      for (const status of outdated) {
        console.log(
          `  ${colors.success(icons.success)} ${colors.brand(status.blockSlug)}: ` +
            `${colors.muted(status.localVersion)} ${icons.arrow} ${colors.success(status.libraryVersion)}`
        );
      }
    }

    console.log();
  } catch (err) {
    spinner.fail('Failed to update');
    throw err;
  }
}

async function updateAllProjects(options: UpdateOptions): Promise<void> {
  const { findAllProjects } = await import('../core/projects');

  const spinner = ora('Scanning for projects...').start();
  const projects = await findAllProjects();
  spinner.stop();

  if (projects.length === 0) {
    console.log();
    warning('No projects found with .contextmark.yml');
    console.log();
    return;
  }

  console.log();
  info(`Found ${projects.length} project(s)`);
  console.log();

  // Build summary table
  const summaries: Array<{
    path: string;
    profile: string;
    outdated: number;
    status: string;
  }> = [];

  for (const projectPath of projects) {
    try {
      const localConfig = loadLocalConfig(projectPath);
      const statuses = getProjectStatus(projectPath);
      const outdated = statuses.filter((s) => s.status === 'outdated');

      summaries.push({
        path: projectPath,
        profile: localConfig!.profile,
        outdated: outdated.length,
        status: outdated.length > 0 ? 'outdated' : 'current',
      });
    } catch {
      summaries.push({
        path: projectPath,
        profile: '?',
        outdated: 0,
        status: 'error',
      });
    }
  }

  // Display table
  console.log(colors.dim(`┌${'─'.repeat(50)}┬${'─'.repeat(15)}┬${'─'.repeat(12)}┐`));
  console.log(
    colors.dim('│') +
      colors.bold(' Project'.padEnd(50)) +
      colors.dim('│') +
      colors.bold(' Profile'.padEnd(15)) +
      colors.dim('│') +
      colors.bold(' Status'.padEnd(12)) +
      colors.dim('│')
  );
  console.log(colors.dim(`├${'─'.repeat(50)}┼${'─'.repeat(15)}┼${'─'.repeat(12)}┤`));

  for (const summary of summaries) {
    const shortPath = summary.path
      .replace(process.env.HOME || '', '~')
      .slice(0, 48)
      .padEnd(49);
    const profile = summary.profile.slice(0, 13).padEnd(14);
    let status: string;

    if (summary.status === 'current') {
      status = colors.success('✓ current  ');
    } else if (summary.status === 'outdated') {
      status = colors.warning(`⚠ ${summary.outdated} outdated`);
    } else {
      status = colors.error('✖ error    ');
    }

    console.log(
      `${colors.dim('│')} ${colors.brand(shortPath)}${colors.dim('│')} ${colors.muted(profile)}${colors.dim('│')} ${status}${colors.dim('│')}`
    );
  }

  console.log(colors.dim(`└${'─'.repeat(50)}┴${'─'.repeat(15)}┴${'─'.repeat(12)}┘`));

  const needsUpdate = summaries.filter((s) => s.status === 'outdated');

  if (needsUpdate.length === 0) {
    console.log();
    success('All projects are up to date!');
    console.log();
    return;
  }

  console.log();
  info(`Updating ${needsUpdate.length} project(s)...`);
  console.log();

  for (const summary of needsUpdate) {
    const spinner = ora(`Updating ${summary.path.replace(process.env.HOME || '', '~')}...`).start();

    try {
      const localConfig = loadLocalConfig(summary.path);
      writeClaudeMd(summary.path, localConfig!.profile, {
        projectPath: summary.path,
      });
      spinner.succeed(`Updated ${summary.path.replace(process.env.HOME || '', '~')}`);
    } catch (err) {
      spinner.fail(`Failed to update ${summary.path.replace(process.env.HOME || '', '~')}`);
    }
  }

  console.log();
  success(`Updated ${needsUpdate.length} project(s)`);
  console.log();
}
