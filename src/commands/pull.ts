import inquirer from 'inquirer';
import ora from 'ora';
import { isLibraryInitialized } from '../core/library';
import {
  diffGlobal,
  diffProject,
  getProjectName,
  pullGlobal,
  pullProject,
} from '../core/project-sync';
import { getGlobalConfig } from '../lib/config';
import { colors, header, icons, info, success, warning } from '../utils/colors';
import { LibraryNotFoundError } from '../utils/errors';

interface PullOptions {
  global?: boolean;
  force?: boolean;
}

export async function pullCommand(options: PullOptions): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const projectPath = process.cwd();
  const config = getGlobalConfig();

  console.log();

  if (options.global) {
    await pullGlobalConfig(options.force ?? false, config.cli.confirm_destructive);
  } else {
    await pullProjectConfig(projectPath, options.force ?? false, config.cli.confirm_destructive);
  }

  console.log();
}

async function pullProjectConfig(
  projectPath: string,
  force: boolean,
  confirmDestructive: boolean
): Promise<void> {
  const projectName = getProjectName(projectPath);

  header(`Pull: ${projectName}`);
  console.log();

  // Check for differences first
  const diff = diffProject(projectPath);

  if (!diff.hasDiff && diff.identical.length === 0) {
    info(`Project "${projectName}" not found in library. Run 'contextmark push' first.`);
    return;
  }

  if (diff.hasDiff && !force && confirmDestructive) {
    // Show what will change
    if (diff.different.length > 0) {
      warning('Files that will be overwritten locally:');
      for (const file of diff.different) {
        console.log(`  ${colors.warning(icons.warning)} ${file}`);
      }
    }

    if (diff.libraryOnly.length > 0) {
      info('New files that will be added locally:');
      for (const file of diff.libraryOnly) {
        console.log(`  ${colors.success(icons.plus)} ${file}`);
      }
    }

    if (diff.localOnly.length > 0) {
      warning('Local files that will be removed (not in library):');
      for (const file of diff.localOnly) {
        console.log(`  ${colors.error(icons.minus)} ${file}`);
      }
    }

    console.log();

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Pull these changes from library?',
        default: true,
      },
    ]);

    if (!confirm) {
      info('Pull cancelled');
      return;
    }
  }

  const spinner = ora('Pulling from library...').start();

  try {
    const result = pullProject(projectPath);

    if (!result.success) {
      spinner.info(result.message);
    } else if (result.filesChanged.length === 0) {
      spinner.info('Already up to date');
    } else {
      spinner.succeed(result.message);
      console.log();

      for (const file of result.filesChanged) {
        console.log(`  ${colors.success(icons.check)} ${file}`);
      }
    }
  } catch (error) {
    spinner.fail('Pull failed');
    throw error;
  }
}

async function pullGlobalConfig(force: boolean, confirmDestructive: boolean): Promise<void> {
  header('Pull: Global Config (~/.claude/)');
  console.log();

  // Check for differences first
  const diff = diffGlobal();

  if (!diff.hasDiff && diff.identical.length === 0) {
    info("No global config found in library. Run 'contextmark push --global' first.");
    return;
  }

  if (diff.hasDiff && !force && confirmDestructive) {
    // Show what will change
    if (diff.different.length > 0) {
      warning('Files that will be overwritten locally:');
      for (const file of diff.different) {
        console.log(`  ${colors.warning(icons.warning)} ${file}`);
      }
    }

    if (diff.libraryOnly.length > 0) {
      info('New files that will be added locally:');
      for (const file of diff.libraryOnly) {
        console.log(`  ${colors.success(icons.plus)} ${file}`);
      }
    }

    if (diff.localOnly.length > 0) {
      warning('Local files that will be removed (not in library):');
      for (const file of diff.localOnly) {
        console.log(`  ${colors.error(icons.minus)} ${file}`);
      }
    }

    console.log();

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Pull these changes from library?',
        default: true,
      },
    ]);

    if (!confirm) {
      info('Pull cancelled');
      return;
    }
  }

  const spinner = ora('Pulling global config from library...').start();

  try {
    const result = pullGlobal();

    if (!result.success) {
      spinner.info(result.message);
    } else if (result.filesChanged.length === 0) {
      spinner.info('Already up to date');
    } else {
      spinner.succeed(result.message);
      console.log();

      for (const file of result.filesChanged) {
        console.log(`  ${colors.success(icons.check)} ${file}`);
      }
    }
  } catch (error) {
    spinner.fail('Pull failed');
    throw error;
  }
}
