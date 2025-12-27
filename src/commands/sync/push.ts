import ora from 'ora';
import { isLibraryInitialized } from '../../core/library';
import { commitChanges, getStatus, hasUncommittedChanges, push } from '../../core/sync';
import { colors, error, success, warning } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';

interface PushOptions {
  message?: string;
}

export async function syncPushCommand(options: PushOptions): Promise<void> {
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

  // Commit if there are changes
  if (hasUncommittedChanges()) {
    const message = options.message || 'Update context library';
    const spinner = ora('Committing changes...').start();

    try {
      commitChanges(message);
      spinner.succeed(`Committed: "${message}"`);
    } catch (err) {
      spinner.fail('Failed to commit');
      error((err as Error).message);
      return;
    }
  }

  // Check if there's anything to push
  const newStatus = getStatus();
  if (newStatus.ahead === 0) {
    success('Nothing to push. Already up to date.');
    console.log();
    return;
  }

  // Push
  const spinner = ora(`Pushing to ${status.remote}...`).start();

  try {
    push();
    spinner.succeed(`Pushed ${newStatus.ahead} commit(s) to remote`);
    console.log();
  } catch (err) {
    spinner.fail('Failed to push');
    error((err as Error).message);
    console.log();
  }
}
