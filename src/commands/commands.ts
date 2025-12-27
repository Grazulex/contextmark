import Table from 'cli-table3';
import { listAllCommands } from '../core/command';
import { isLibraryInitialized } from '../core/library';
import { colors, header } from '../utils/colors';
import { LibraryNotFoundError } from '../utils/errors';

export async function commandsCommand(): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const commands = listAllCommands();

  console.log();
  header('Commands');
  console.log();

  if (commands.length === 0) {
    console.log(colors.muted('  No commands found.'));
    console.log();
    console.log(`  Create one with: ${colors.brand('contextmark command create <slug>')}`);
    console.log();
    return;
  }

  const table = new Table({
    head: [colors.bold('Slug'), colors.bold('Name'), colors.bold('Description')],
    style: { head: [], border: [] },
    chars: {
      top: '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      bottom: '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      left: '│',
      'left-mid': '├',
      mid: '─',
      'mid-mid': '┼',
      right: '│',
      'right-mid': '┤',
      middle: '│',
    },
  });

  for (const cmd of commands) {
    table.push([colors.brand(cmd.slug), cmd.frontmatter.name, colors.muted(cmd.frontmatter.description)]);
  }

  console.log(table.toString());
  console.log();
  console.log(colors.muted(`  ${commands.length} command(s) found`));
  console.log();
}
