import type { Command } from 'commander';
import { createAgentCommand } from './create';
import { editAgentCommand } from './edit';
import { removeAgentCommand } from './remove';
import { showAgentCommand } from './show';

export function registerAgentCommands(program: Command): void {
  const agent = program.command('agent').description('Manage agents');

  agent
    .command('create <slug>')
    .description('Create a new agent')
    .option('-n, --name <name>', 'Agent display name')
    .option('-d, --description <desc>', 'Agent description')
    .action(createAgentCommand);

  agent.command('show <slug>').description('Show agent content').action(showAgentCommand);

  agent
    .command('edit <slug>')
    .description('Edit an agent in your default editor')
    .action(editAgentCommand);

  agent
    .command('remove <slug>')
    .alias('rm')
    .description('Remove an agent')
    .option('-f, --force', 'Skip confirmation')
    .action(removeAgentCommand);
}
