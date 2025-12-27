import inquirer from 'inquirer';
import { agentExists, deleteAgent } from '../../core/agent';
import { isLibraryInitialized } from '../../core/library';
import { colors, success } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';

interface RemoveAgentOptions {
  force?: boolean;
}

export async function removeAgentCommand(slug: string, options: RemoveAgentOptions): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  if (!agentExists(slug)) {
    throw new Error(`Agent "${slug}" not found.`);
  }

  if (!options.force) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Remove agent "${slug}"?`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(colors.muted('Cancelled.'));
      return;
    }
  }

  deleteAgent(slug);

  console.log();
  success(`Removed agent "${slug}"`);
  console.log();
}
