import { existsSync } from 'node:fs';
import { isLibraryInitialized } from '../core/library';
import { getProjectName, getProjectSyncStatus, listLibraryProjects } from '../core/project-sync';
import { getProjectStatus } from '../core/tracking';
import { isProjectInitialized, loadLocalConfig } from '../lib/config';
import { getLibraryProjectDir } from '../lib/paths';
import { colors, header, icons, info, success, warning } from '../utils/colors';
import { LibraryNotFoundError, ProjectNotInitializedError } from '../utils/errors';

interface StatusOptions {
  global?: boolean;
  all?: boolean;
}

export async function statusCommand(options: StatusOptions): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  console.log();

  if (options.all) {
    await showAllProjectsStatus();
    return;
  }

  if (options.global) {
    await showGlobalStatus();
    return;
  }

  const projectPath = process.cwd();

  if (!isProjectInitialized(projectPath)) {
    throw new ProjectNotInitializedError();
  }

  await showProjectStatus(projectPath);
}

async function showProjectStatus(projectPath: string): Promise<void> {
  const localConfig = loadLocalConfig(projectPath);
  const projectName = getProjectName(projectPath);

  header(`Status: ${projectName}`);
  console.log();

  // Show basic info
  console.log(`${colors.bold('Project:')}    ${colors.brand(localConfig!.project || projectName)}`);
  console.log(
    `${colors.bold('Profile:')}    ${localConfig!.profile ? colors.brand(localConfig!.profile) : colors.muted('none (simple mode)')}`
  );
  console.log(`${colors.bold('Generated:')} ${colors.muted(localConfig!.generated_at)}`);

  if (localConfig!.last_push) {
    console.log(`${colors.bold('Last push:')} ${colors.muted(localConfig!.last_push)}`);
  }
  if (localConfig!.last_pull) {
    console.log(`${colors.bold('Last pull:')} ${colors.muted(localConfig!.last_pull)}`);
  }
  console.log();

  // Check if project is in library
  const libProjectDir = getLibraryProjectDir(projectName);
  const existsInLibrary = existsSync(libProjectDir);

  if (!existsInLibrary) {
    warning('Project not yet in library');
    console.log(`  Run ${colors.brand('contextmark push')} to save to library.`);
    console.log();
    return;
  }

  // Show sync status
  const syncStatus = getProjectSyncStatus(projectPath);

  if (syncStatus.hasDiff && syncStatus.diff) {
    const diff = syncStatus.diff;

    // Table header
    console.log(colors.dim('┌─────────────────────────────────────┬────────────┐'));
    console.log(
      colors.dim('│') +
        colors.bold(' File                                ') +
        colors.dim('│') +
        colors.bold(' Status     ') +
        colors.dim('│')
    );
    console.log(colors.dim('├─────────────────────────────────────┼────────────┤'));

    // Different files
    for (const file of diff.different) {
      const fileName = file.padEnd(35);
      const status = colors.warning(`${icons.warning} modified`);
      console.log(`${colors.dim('│')} ${fileName} ${colors.dim('│')} ${status} ${colors.dim('│')}`);
    }

    // Local only files
    for (const file of diff.localOnly) {
      const fileName = file.padEnd(35);
      const status = colors.info(`${icons.plus} local    `);
      console.log(`${colors.dim('│')} ${fileName} ${colors.dim('│')} ${status} ${colors.dim('│')}`);
    }

    // Library only files
    for (const file of diff.libraryOnly) {
      const fileName = file.padEnd(35);
      const status = colors.error(`${icons.minus} library  `);
      console.log(`${colors.dim('│')} ${fileName} ${colors.dim('│')} ${status} ${colors.dim('│')}`);
    }

    // Identical files
    for (const file of diff.identical) {
      const fileName = file.padEnd(35);
      const status = colors.success(`${icons.check} synced   `);
      console.log(
        `${colors.dim('│')} ${colors.dim(fileName)} ${colors.dim('│')} ${status} ${colors.dim('│')}`
      );
    }

    console.log(colors.dim('└─────────────────────────────────────┴────────────┘'));
    console.log();

    warning('Local and library are out of sync');
    console.log(`  ${colors.brand('contextmark push')}  - to update library with local changes`);
    console.log(`  ${colors.brand('contextmark pull')}  - to update local with library changes`);
    console.log(`  ${colors.brand('contextmark diff')}  - to see detailed differences`);
  } else {
    success('Local and library are in sync!');
  }

  // If profile mode, also show block status
  if (localConfig!.profile && localConfig!.blocks.length > 0) {
    console.log();
    console.log(colors.bold('Block Status:'));

    const statuses = getProjectStatus(projectPath);

    // Table header
    console.log(colors.dim('┌───────────────────────┬─────────┬─────────┬────────────┐'));
    console.log(
      colors.dim('│') +
        colors.bold(' Block                 ') +
        colors.dim('│') +
        colors.bold(' Local   ') +
        colors.dim('│') +
        colors.bold(' Library ') +
        colors.dim('│') +
        colors.bold(' Status     ') +
        colors.dim('│')
    );
    console.log(colors.dim('├───────────────────────┼─────────┼─────────┼────────────┤'));

    for (const status of statuses) {
      const slug = status.blockSlug.padEnd(21);
      const local = status.localVersion.padEnd(7);
      const library = status.libraryVersion.padEnd(7);

      let statusStr: string;
      switch (status.status) {
        case 'current':
          statusStr = colors.success(`${icons.check} current  `);
          break;
        case 'outdated':
          statusStr = colors.warning(`${icons.warning} outdated `);
          break;
        case 'missing':
          statusStr = colors.error(`${icons.cross} missing  `);
          break;
      }

      console.log(
        `${colors.dim('│')} ${colors.brand(slug)} ${colors.dim('│')} ${colors.muted(local)} ${colors.dim('│')} ${colors.muted(library)} ${colors.dim('│')} ${statusStr}${colors.dim('│')}`
      );
    }

    console.log(colors.dim('└───────────────────────┴─────────┴─────────┴────────────┘'));

    const outdated = statuses.filter((s) => s.status === 'outdated');
    const missing = statuses.filter((s) => s.status === 'missing');

    if (outdated.length > 0) {
      console.log();
      console.log(
        colors.warning(
          `${outdated.length} block(s) need updating. Run ${colors.brand('contextmark update')} to apply.`
        )
      );
    }

    if (missing.length > 0) {
      console.log(colors.error(`${missing.length} block(s) missing from library.`));
    }
  }

  console.log();
}

async function showGlobalStatus(): Promise<void> {
  header('Status: Global Config (~/.claude/)');
  console.log();

  const { diffGlobal } = await import('../core/project-sync');
  const diff = diffGlobal();

  if (!diff.hasDiff && diff.identical.length === 0) {
    info('No global config found in library.');
    console.log(`  Run ${colors.brand('contextmark push --global')} to save your config.`);
    console.log();
    return;
  }

  if (!diff.hasDiff) {
    success('Global config is in sync with library!');
    console.log();
    return;
  }

  // Table header
  console.log(colors.dim('┌─────────────────────────────────────┬────────────┐'));
  console.log(
    colors.dim('│') +
      colors.bold(' File                                ') +
      colors.dim('│') +
      colors.bold(' Status     ') +
      colors.dim('│')
  );
  console.log(colors.dim('├─────────────────────────────────────┼────────────┤'));

  for (const file of diff.different) {
    const fileName = file.padEnd(35);
    const status = colors.warning(`${icons.warning} modified`);
    console.log(`${colors.dim('│')} ${fileName} ${colors.dim('│')} ${status} ${colors.dim('│')}`);
  }

  for (const file of diff.localOnly) {
    const fileName = file.padEnd(35);
    const status = colors.info(`${icons.plus} local    `);
    console.log(`${colors.dim('│')} ${fileName} ${colors.dim('│')} ${status} ${colors.dim('│')}`);
  }

  for (const file of diff.libraryOnly) {
    const fileName = file.padEnd(35);
    const status = colors.error(`${icons.minus} library  `);
    console.log(`${colors.dim('│')} ${fileName} ${colors.dim('│')} ${status} ${colors.dim('│')}`);
  }

  for (const file of diff.identical) {
    const fileName = file.padEnd(35);
    const status = colors.success(`${icons.check} synced   `);
    console.log(
      `${colors.dim('│')} ${colors.dim(fileName)} ${colors.dim('│')} ${status} ${colors.dim('│')}`
    );
  }

  console.log(colors.dim('└─────────────────────────────────────┴────────────┘'));
  console.log();

  warning('Global config is out of sync with library');
  console.log(`  ${colors.brand('contextmark push --global')}  - to update library`);
  console.log(`  ${colors.brand('contextmark pull --global')}  - to update local`);
  console.log();
}

async function showAllProjectsStatus(): Promise<void> {
  header('Status: All Projects');
  console.log();

  const projects = listLibraryProjects();

  if (projects.length === 0) {
    info('No projects in library yet.');
    console.log(`  Run ${colors.brand('contextmark init')} in a project to get started.`);
    console.log();
    return;
  }

  // Table header
  console.log(colors.dim('┌─────────────────────────────┬────────────┐'));
  console.log(
    colors.dim('│') +
      colors.bold(' Project                     ') +
      colors.dim('│') +
      colors.bold(' In Library') +
      colors.dim('│')
  );
  console.log(colors.dim('├─────────────────────────────┼────────────┤'));

  for (const project of projects) {
    const projectName = project.padEnd(27);
    const status = colors.success(`${icons.check} yes     `);
    console.log(
      `${colors.dim('│')} ${colors.brand(projectName)} ${colors.dim('│')} ${status} ${colors.dim('│')}`
    );
  }

  console.log(colors.dim('└─────────────────────────────┴────────────┘'));
  console.log();

  info(`${projects.length} project(s) in library`);
  console.log();
}
