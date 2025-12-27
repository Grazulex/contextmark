import inquirer from 'inquirer';
import { isLibraryInitialized } from '../../core/library';
import { deleteProfile, profileExists } from '../../core/profile';
import { colors, success } from '../../utils/colors';
import { LibraryNotFoundError, ProfileNotFoundError } from '../../utils/errors';

interface RemoveProfileOptions {
  force?: boolean;
}

export async function removeProfileCommand(
  slug: string,
  options: RemoveProfileOptions
): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  if (!profileExists(slug)) {
    throw new ProfileNotFoundError(slug);
  }

  if (!options.force) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Remove profile "${slug}"?`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(colors.muted('Cancelled.'));
      return;
    }
  }

  deleteProfile(slug);

  console.log();
  success(`Removed profile "${slug}"`);
  console.log();
}
