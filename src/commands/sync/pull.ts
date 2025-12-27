import ora from 'ora';
import { isLibraryInitialized } from '../../core/library';
import { getStatus, hasUncommittedChanges, pull } from '../../core/sync';
import { colors, error, success, warning } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';

export async function syncPullCommand(): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const status = getStatus();

  if (!status.isGitRepo) {
    error('Library is not a Git repository.');
    console.log(`  Run ${colors.brand('contextmark sync setup <remote>')} first.`);
    console.log();
    return;
  }

  if (!status.hasRemote) {
    error('No remote configured.');
    console.log(`  Run ${colors.brand('contextmark sync setup <remote>')} first.`);
    console.log();
    return;
  }

  console.log();

  // Warn about uncommitted changes
  if (hasUncommittedChanges()) {
    warning('You have uncommitted changes.');
    console.log(`  Consider running ${colors.brand('contextmark sync push')} first.`);
    console.log();
  }

  // Check if there's anything to pull
  if (status.behind === 0) {
    success('Already up to date.');
    console.log();
    return;
  }

  // Pull
  const spinner = ora(`Pulling from ${status.remote}...`).start();

  try {
    pull();
    spinner.succeed(`Pulled ${status.behind} commit(s) from remote`);
    console.log();
  } catch (err) {
    spinner.fail('Failed to pull');
    error((err as Error).message);
    console.log();
  }
}
