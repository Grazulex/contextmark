import type { Command } from 'commander';
import { syncPullCommand } from './pull';
import { syncPushCommand } from './push';
import { syncSetupCommand } from './setup';
import { syncStatusCommand } from './status';

export function registerSyncCommands(program: Command): void {
  const sync = program.command('sync').description('Synchronize library with remote Git');

  sync.command('status').description('Show sync status').action(syncStatusCommand);

  sync
    .command('push')
    .description('Push library changes to remote')
    .option('-m, --message <message>', 'Commit message')
    .action(syncPushCommand);

  sync.command('pull').description('Pull library changes from remote').action(syncPullCommand);

  sync
    .command('setup <remote>')
    .description('Configure remote Git repository')
    .action(syncSetupCommand);
}
