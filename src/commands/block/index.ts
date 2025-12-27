import type { Command } from 'commander';
import { createBlockCommand } from './create';
import { editBlockCommand } from './edit';
import { removeBlockCommand } from './remove';
import { showBlockCommand } from './show';

export function registerBlockCommands(program: Command): void {
  const block = program.command('block').description('Manage context blocks');

  block
    .command('create <slug>')
    .description('Create a new block (e.g., laravel/base)')
    .option('-n, --name <name>', 'Block display name')
    .option('-d, --description <desc>', 'Block description')
    .action(createBlockCommand);

  block
    .command('edit <slug>')
    .description('Edit a block in your default editor')
    .action(editBlockCommand);

  block.command('show <slug>').description('Show block content').action(showBlockCommand);

  block
    .command('remove <slug>')
    .alias('rm')
    .description('Remove a block')
    .option('-f, --force', 'Skip confirmation')
    .action(removeBlockCommand);
}
