import { isLibraryInitialized } from '../core/library';
import { type DiffResult, diffGlobal, diffProject, getProjectName } from '../core/project-sync';
import { colors, header, icons, info, success } from '../utils/colors';
import { LibraryNotFoundError } from '../utils/errors';

interface DiffOptions {
  global?: boolean;
}

export async function diffCommand(options: DiffOptions): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const projectPath = process.cwd();

  console.log();

  if (options.global) {
    displayGlobalDiff();
  } else {
    displayProjectDiff(projectPath);
  }

  console.log();
}

function displayProjectDiff(projectPath: string): void {
  const projectName = getProjectName(projectPath);

  header(`Diff: ${projectName}`);
  console.log();
  console.log(`${colors.muted('Comparing:')} local ${colors.dim('↔')} library`);
  console.log();

  const diff = diffProject(projectPath);

  if (!diff.hasDiff && diff.identical.length === 0) {
    info(`Project "${projectName}" not found in library.`);
    console.log();
    console.log(`Run ${colors.brand('contextmark push')} to save your config to library.`);
    return;
  }

  displayDiffResult(diff);
}

function displayGlobalDiff(): void {
  header('Diff: Global Config (~/.claude/)');
  console.log();
  console.log(`${colors.muted('Comparing:')} ~/.claude/ ${colors.dim('↔')} library/global/`);
  console.log();

  const diff = diffGlobal();

  if (!diff.hasDiff && diff.identical.length === 0) {
    info('No global config found in library.');
    console.log();
    console.log(`Run ${colors.brand('contextmark push --global')} to save your config to library.`);
    return;
  }

  displayDiffResult(diff);
}

function displayDiffResult(diff: DiffResult): void {
  if (!diff.hasDiff) {
    success('No differences found. Local and library are in sync.');
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

  // Identical files (optional, show as dim)
  for (const file of diff.identical) {
    const fileName = file.padEnd(35);
    const status = colors.success(`${icons.check} synced   `);
    console.log(
      `${colors.dim('│')} ${colors.dim(fileName)} ${colors.dim('│')} ${status} ${colors.dim('│')}`
    );
  }

  console.log(colors.dim('└─────────────────────────────────────┴────────────┘'));

  // Summary
  console.log();
  const changes = diff.different.length + diff.localOnly.length + diff.libraryOnly.length;

  if (diff.different.length > 0) {
    console.log(colors.warning(`  ${diff.different.length} file(s) modified`));
  }
  if (diff.localOnly.length > 0) {
    console.log(colors.info(`  ${diff.localOnly.length} file(s) only in local`));
  }
  if (diff.libraryOnly.length > 0) {
    console.log(colors.error(`  ${diff.libraryOnly.length} file(s) only in library`));
  }
  if (diff.identical.length > 0) {
    console.log(colors.success(`  ${diff.identical.length} file(s) in sync`));
  }

  console.log();
  console.log(colors.muted('Use:'));
  console.log(
    colors.muted(`  ${colors.brand('contextmark push')}  - to update library with local changes`)
  );
  console.log(
    colors.muted(`  ${colors.brand('contextmark pull')}  - to update local with library changes`)
  );
}
