import { isLibraryInitialized } from '../core/library';
import { getProjectStatus, needsUpdate } from '../core/tracking';
import { isProjectInitialized, loadLocalConfig } from '../lib/config';
import { colors, header, icons } from '../utils/colors';
import { LibraryNotFoundError, ProjectNotInitializedError } from '../utils/errors';

export async function statusCommand(): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const projectPath = process.cwd();

  if (!isProjectInitialized(projectPath)) {
    throw new ProjectNotInitializedError();
  }

  const localConfig = loadLocalConfig(projectPath);
  const statuses = getProjectStatus(projectPath);

  console.log();
  header('Project Status');
  console.log();

  console.log(`${colors.bold('Profile:')}     ${colors.brand(localConfig!.profile)}`);
  console.log(`${colors.bold('Generated:')}   ${colors.muted(localConfig!.generated_at)}`);
  console.log();

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

  console.log();

  const outdated = statuses.filter((s) => s.status === 'outdated');
  const missing = statuses.filter((s) => s.status === 'missing');

  if (outdated.length > 0) {
    console.log(
      colors.warning(
        `${outdated.length} block(s) need updating. Run ${colors.brand('contextmark update')} to apply.`
      )
    );
  }

  if (missing.length > 0) {
    console.log(colors.error(`${missing.length} block(s) missing from library.`));
  }

  if (outdated.length === 0 && missing.length === 0) {
    console.log(colors.success('All blocks are up to date!'));
  }

  console.log();
}
