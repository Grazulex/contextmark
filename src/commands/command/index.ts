import type { Command } from 'commander';
import { createCommandCommand } from './create';
import { editCommandCommand } from './edit';
import { removeCommandCommand } from './remove';
import { showCommandCommand } from './show';

export function registerCommandCommands(program: Command): void {
  const command = program.command('command').description('Manage commands');

  command
    .command('create <slug>')
    .description('Create a new command')
    .option('-n, --name <name>', 'Command display name')
    .option('-d, --description <desc>', 'Command description')
    .action(createCommandCommand);

  command
    .command('show <slug>')
    .description('Show command content')
    .action(showCommandCommand);

  command
    .command('edit <slug>')
    .description('Edit a command in your default editor')
    .action(editCommandCommand);

  command
    .command('remove <slug>')
    .alias('rm')
    .description('Remove a command')
    .option('-f, --force', 'Skip confirmation')
    .action(removeCommandCommand);
}
