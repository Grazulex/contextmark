import inquirer from 'inquirer';
import { blockExists, deleteBlock, loadBlock } from '../../core/block';
import { isLibraryInitialized } from '../../core/library';
import { listAllProfiles } from '../../core/profile';
import { colors, success, warning } from '../../utils/colors';
import { BlockNotFoundError, LibraryNotFoundError } from '../../utils/errors';

interface RemoveBlockOptions {
  force?: boolean;
}

export async function removeBlockCommand(slug: string, options: RemoveBlockOptions): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  if (!blockExists(slug)) {
    throw new BlockNotFoundError(slug);
  }

  // Check if block is used in any profile
  const profiles = listAllProfiles();
  const usedIn = profiles.filter((p) => p.config.blocks.includes(slug));

  if (usedIn.length > 0 && !options.force) {
    warning(`Block "${slug}" is used in ${usedIn.length} profile(s):`);
    for (const profile of usedIn) {
      console.log(`  - ${colors.brand(profile.slug)}`);
    }
    console.log();

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Remove anyway?',
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(colors.muted('Cancelled.'));
      return;
    }
  } else if (!options.force) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Remove block "${slug}"?`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(colors.muted('Cancelled.'));
      return;
    }
  }

  deleteBlock(slug);

  console.log();
  success(`Removed block "${slug}"`);
  console.log();
}
