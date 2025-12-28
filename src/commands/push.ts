import inquirer from 'inquirer';
import ora from 'ora';
import { isLibraryInitialized } from '../core/library';
import {
  diffGlobal,
  diffProject,
  getProjectName,
  pushGlobal,
  pushProject,
} from '../core/project-sync';
import { getGlobalConfig } from '../lib/config';
import { colors, header, icons, info, success, warning } from '../utils/colors';
import { LibraryNotFoundError } from '../utils/errors';

interface PushOptions {
  global?: boolean;
  force?: boolean;
}

export async function pushCommand(options: PushOptions): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const projectPath = process.cwd();
  const config = getGlobalConfig();

  console.log();

  if (options.global) {
    await pushGlobalConfig(options.force ?? false, config.cli.confirm_destructive);
  } else {
    await pushProjectConfig(projectPath, options.force ?? false, config.cli.confirm_destructive);
  }

  console.log();
}

async function pushProjectConfig(
  projectPath: string,
  force: boolean,
  confirmDestructive: boolean
): Promise<void> {
  const projectName = getProjectName(projectPath);

  header(`Push: ${projectName}`);
  console.log();

  // Check for differences first
  const diff = diffProject(projectPath);

  if (diff.hasDiff && !force && confirmDestructive) {
    // Show what will change
    if (diff.different.length > 0) {
      warning('Files that will be overwritten in library:');
      for (const file of diff.different) {
        console.log(`  ${colors.warning(icons.warning)} ${file}`);
      }
    }

    if (diff.localOnly.length > 0) {
      info('New files that will be added to library:');
      for (const file of diff.localOnly) {
        console.log(`  ${colors.success(icons.plus)} ${file}`);
      }
    }

    console.log();

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Push these changes to library?',
        default: true,
      },
    ]);

    if (!confirm) {
      info('Push cancelled');
      return;
    }
  }

  const spinner = ora('Pushing to library...').start();

  try {
    const result = pushProject(projectPath);

    if (result.filesChanged.length === 0) {
      spinner.info(result.message);
    } else {
      spinner.succeed(result.message);
      console.log();

      for (const file of result.filesChanged) {
        console.log(`  ${colors.success(icons.check)} ${file}`);
      }
    }
  } catch (error) {
    spinner.fail('Push failed');
    throw error;
  }
}

async function pushGlobalConfig(force: boolean, confirmDestructive: boolean): Promise<void> {
  header('Push: Global Config (~/.claude/)');
  console.log();

  // Check for differences first
  const diff = diffGlobal();

  if (diff.hasDiff && !force && confirmDestructive) {
    // Show what will change
    if (diff.different.length > 0) {
      warning('Files that will be overwritten in library:');
      for (const file of diff.different) {
        console.log(`  ${colors.warning(icons.warning)} ${file}`);
      }
    }

    if (diff.localOnly.length > 0) {
      info('New files that will be added to library:');
      for (const file of diff.localOnly) {
        console.log(`  ${colors.success(icons.plus)} ${file}`);
      }
    }

    console.log();

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Push these changes to library?',
        default: true,
      },
    ]);

    if (!confirm) {
      info('Push cancelled');
      return;
    }
  }

  const spinner = ora('Pushing global config to library...').start();

  try {
    const result = pushGlobal();

    if (result.filesChanged.length === 0) {
      spinner.info(result.message);
    } else {
      spinner.succeed(result.message);
      console.log();

      for (const file of result.filesChanged) {
        console.log(`  ${colors.success(icons.check)} ${file}`);
      }
    }
  } catch (error) {
    spinner.fail('Push failed');
    throw error;
  }
}
