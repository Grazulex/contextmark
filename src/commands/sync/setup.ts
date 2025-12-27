import ora from 'ora';
import { isLibraryInitialized } from '../../core/library';
import { commitChanges, getRemote, initGitRepo, isGitRepo, push, setRemote } from '../../core/sync';
import { colors, info, success } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';

export async function syncSetupCommand(remote: string): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  console.log();

  // Initialize Git if needed
  if (!isGitRepo()) {
    const spinner = ora('Initializing Git repository...').start();
    try {
      initGitRepo();
      spinner.succeed('Git repository initialized');
    } catch (err) {
      spinner.fail('Failed to initialize Git repository');
      throw err;
    }
  }

  // Set remote
  const existingRemote = getRemote();
  const spinner = ora(existingRemote ? 'Updating remote...' : 'Adding remote...').start();

  try {
    setRemote(remote);
    spinner.succeed(`Remote configured: ${colors.muted(remote)}`);
  } catch (err) {
    spinner.fail('Failed to configure remote');
    throw err;
  }

  // Initial commit if there are no commits
  try {
    const hasCommits = require('node:child_process').execSync('git rev-parse HEAD', {
      cwd: `${require('node:os').homedir()}/.contextmark`,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch {
    // No commits yet, create initial commit
    const commitSpinner = ora('Creating initial commit...').start();
    try {
      commitChanges('Initial context library');
      commitSpinner.succeed('Initial commit created');
    } catch (err) {
      commitSpinner.fail('Failed to create initial commit');
      throw err;
    }

    // Push
    const pushSpinner = ora('Pushing to remote...').start();
    try {
      push();
      pushSpinner.succeed('Pushed to remote');
    } catch (err) {
      pushSpinner.fail('Failed to push (you may need to create the remote repository first)');
      info(`Create the repository at ${remote} and run ${colors.brand('contextmark sync push')}`);
    }
  }

  console.log();
  success('Sync configured successfully!');
  console.log();
  console.log(`  ${colors.dim('Push changes:')} ${colors.brand('contextmark sync push')}`);
  console.log(`  ${colors.dim('Pull changes:')} ${colors.brand('contextmark sync pull')}`);
  console.log(`  ${colors.dim('Check status:')} ${colors.brand('contextmark sync status')}`);
  console.log();
}
