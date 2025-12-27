import { loadCommand } from '../../core/command';
import { isLibraryInitialized } from '../../core/library';
import { colors, header } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';

export async function showCommandCommand(slug: string): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const cmd = loadCommand(slug);

  console.log();
  header(`Command: ${slug}`);
  console.log();

  console.log(`${colors.bold('Name:')}        ${cmd.frontmatter.name}`);
  console.log(`${colors.bold('Description:')} ${cmd.frontmatter.description}`);
  console.log();

  console.log(colors.dim('─'.repeat(60)));
  console.log();
  console.log(cmd.content);
  console.log();
}
