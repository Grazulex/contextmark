import inquirer from 'inquirer';
import { commandExists, deleteCommand } from '../../core/command';
import { isLibraryInitialized } from '../../core/library';
import { colors, success } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';

interface RemoveCommandOptions {
  force?: boolean;
}

export async function removeCommandCommand(slug: string, options: RemoveCommandOptions): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  if (!commandExists(slug)) {
    throw new Error(`Command "${slug}" not found.`);
  }

  if (!options.force) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Remove command "${slug}"?`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(colors.muted('Cancelled.'));
      return;
    }
  }

  deleteCommand(slug);

  console.log();
  success(`Removed command "${slug}"`);
  console.log();
}
