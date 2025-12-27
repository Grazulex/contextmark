#!/usr/bin/env node

import boxen from 'boxen';
import { Command } from 'commander';
import { addAgentCommand } from './commands/add-agent';
import { addCommandCommand } from './commands/add-command';
import { registerAgentCommands } from './commands/agent';
import { agentsCommand } from './commands/agents';
import { registerBlockCommands } from './commands/block';
import { blocksCommand } from './commands/blocks';
import { registerCommandCommands } from './commands/command';
import { commandsCommand } from './commands/commands';
import { initCommand } from './commands/init';
import { initLibraryCommand } from './commands/init-library';
import { registerProfileCommands } from './commands/profile';
import { profilesCommand } from './commands/profiles';
import { statusCommand } from './commands/status';
import { registerSyncCommands } from './commands/sync';
import { updateCommand } from './commands/update';
import { colors } from './utils/colors';
import { handleError } from './utils/errors';

const VERSION = '1.0.1';

function banner(): string {
  return boxen(
    `${
      colors.brand.bold('ContextMark') + colors.dim(` v${VERSION}`)
    }\n\n${colors.muted('Your Claude Code context, versioned and portable.')}\n${colors.dim('Stop copying CLAUDE.md. Start composing it.')}`,
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: '#8B5CF6',
    }
  );
}

function examples(): string {
  return `
${colors.bold('Examples:')}
  ${colors.dim('# Initialize the library (first time)')}
  $ contextmark init-library

  ${colors.dim('# Create and manage blocks')}
  $ contextmark block create laravel/base
  $ contextmark blocks

  ${colors.dim('# Create and manage profiles')}
  $ contextmark profile create my-profile
  $ contextmark profiles

  ${colors.dim('# Initialize a project')}
  $ cd my-project
  $ contextmark init --profile my-profile

  ${colors.dim('# Check for updates')}
  $ contextmark status

${colors.bold('Documentation:')}
  ${colors.brand('https://contextmark.tech')}
`;
}

const program = new Command();

program
  .name('contextmark')
  .description('Your Claude Code context, versioned and portable')
  .version(VERSION, '-v, --version', 'Show version')
  .configureOutput({
    outputError: (str, write) => write(colors.error(str)),
  })
  .addHelpText('beforeAll', banner())
  .addHelpText('after', examples());

// Init library command
program
  .command('init-library')
  .description('Initialize the ContextMark library (~/.contextmark)')
  .option('-f, --force', 'Reinitialize even if already exists')
  .action(async (options) => {
    try {
      await initLibraryCommand(options);
    } catch (err) {
      handleError(err);
    }
  });

// Init project command
program
  .command('init')
  .description('Initialize a project with a profile')
  .option('-p, --profile <profile>', 'Profile to use')
  .option('-b, --blocks <blocks>', 'Comma-separated list of blocks (without profile)')
  .option('--no-global', 'Exclude global context')
  .option('--dry-run', 'Preview without writing files')
  .option('-f, --force', 'Reinitialize even if already initialized')
  .action(async (options) => {
    try {
      await initCommand(options);
    } catch (err) {
      handleError(err);
    }
  });

// Blocks command
program
  .command('blocks')
  .description('List available blocks')
  .option('-a, --all', 'Show as flat table')
  .action(async (options) => {
    try {
      await blocksCommand(options);
    } catch (err) {
      handleError(err);
    }
  });

// Profiles command
program
  .command('profiles')
  .description('List available profiles')
  .action(async () => {
    try {
      await profilesCommand();
    } catch (err) {
      handleError(err);
    }
  });

// Status command
program
  .command('status')
  .description('Show project status and check for updates')
  .action(async () => {
    try {
      await statusCommand();
    } catch (err) {
      handleError(err);
    }
  });

// Update command
program
  .command('update')
  .description('Update CLAUDE.md with latest blocks')
  .option('-a, --all', 'Update all known projects')
  .option('-d, --diff', 'Show changes before applying')
  .option('-f, --force', 'Force update even if up to date')
  .action(async (options) => {
    try {
      await updateCommand(options);
    } catch (err) {
      handleError(err);
    }
  });

// Agents command
program
  .command('agents')
  .description('List available agents')
  .action(async () => {
    try {
      await agentsCommand();
    } catch (err) {
      handleError(err);
    }
  });

// Commands command
program
  .command('commands')
  .description('List available commands')
  .action(async () => {
    try {
      await commandsCommand();
    } catch (err) {
      handleError(err);
    }
  });

// Add agent to project
program
  .command('add-agent <slug>')
  .description('Add an agent to the current project')
  .action(async (slug) => {
    try {
      await addAgentCommand(slug);
    } catch (err) {
      handleError(err);
    }
  });

// Add command to project
program
  .command('add-command <slug>')
  .description('Add a command to the current project')
  .action(async (slug) => {
    try {
      await addCommandCommand(slug);
    } catch (err) {
      handleError(err);
    }
  });

// Register sub-commands
registerBlockCommands(program);
registerProfileCommands(program);
registerSyncCommands(program);
registerAgentCommands(program);
registerCommandCommands(program);

// Error handling
program.exitOverride((err) => {
  if (err.code === 'commander.helpDisplayed') {
    process.exit(0);
  }
  if (err.code === 'commander.version') {
    process.exit(0);
  }
  handleError(err);
});

// Parse
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
