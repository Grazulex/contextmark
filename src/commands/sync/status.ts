import { isLibraryInitialized } from '../../core/library';
import { getStatus, isGitRepo } from '../../core/sync';
import { LIBRARY_DIR } from '../../lib/paths';
import { colors, header, icons, info, warning } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';

export async function syncStatusCommand(): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  console.log();
  header('Sync Status');
  console.log();

  const status = getStatus();

  console.log(`${colors.bold('Library:')}  ${colors.muted(LIBRARY_DIR)}`);
  console.log();

  if (!status.isGitRepo) {
    warning('Library is not a Git repository.');
    console.log(`  Run ${colors.brand('contextmark sync setup <remote>')} to configure.`);
    console.log();
    return;
  }

  console.log(`${colors.bold('Git Repo:')} ${colors.success('Yes')}`);
  console.log(`${colors.bold('Branch:')}   ${colors.brand(status.branch || 'main')}`);

  if (status.hasRemote) {
    console.log(`${colors.bold('Remote:')}   ${colors.muted(status.remote!)}`);
    console.log();

    // Ahead/behind status
    if (status.ahead === 0 && status.behind === 0) {
      console.log(`${colors.success(icons.check)} Up to date with remote`);
    } else {
      if (status.ahead > 0) {
        console.log(`${colors.info(icons.arrowRight)} ${status.ahead} commit(s) ahead of remote`);
      }
      if (status.behind > 0) {
        console.log(`${colors.warning(icons.warning)} ${status.behind} commit(s) behind remote`);
      }
    }
  } else {
    console.log(`${colors.bold('Remote:')}   ${colors.warning('Not configured')}`);
    console.log();
    info(`Configure with: ${colors.brand('contextmark sync setup <remote-url>')}`);
  }

  // Uncommitted changes
  if (status.hasChanges) {
    console.log();
    console.log(`${colors.warning(icons.warning)} Uncommitted changes:`);
    for (const file of status.changedFiles.slice(0, 10)) {
      console.log(`  ${colors.muted(file)}`);
    }
    if (status.changedFiles.length > 10) {
      console.log(`  ${colors.muted(`... and ${status.changedFiles.length - 10} more`)}`);
    }
    console.log();
    info(`Commit with: ${colors.brand('contextmark sync push -m "message"')}`);
  }

  console.log();
}
