import type { Command } from 'commander';
import { createProfileCommand } from './create';
import { editProfileCommand } from './edit';
import { removeProfileCommand } from './remove';
import { showProfileCommand } from './show';

export function registerProfileCommands(program: Command): void {
  const profile = program.command('profile').description('Manage profiles');

  profile
    .command('create <slug>')
    .description('Create a new profile')
    .option('-n, --name <name>', 'Profile display name')
    .option('-d, --description <desc>', 'Profile description')
    .action(createProfileCommand);

  profile.command('show <slug>').description('Show profile details').action(showProfileCommand);

  profile
    .command('edit <slug>')
    .description('Edit a profile in your default editor')
    .action(editProfileCommand);

  profile
    .command('remove <slug>')
    .alias('rm')
    .description('Remove a profile')
    .option('-f, --force', 'Skip confirmation')
    .action(removeProfileCommand);
}
