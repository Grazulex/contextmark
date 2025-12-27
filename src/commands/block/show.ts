import { loadBlock } from '../../core/block';
import { isLibraryInitialized } from '../../core/library';
import { colors, header } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';

export async function showBlockCommand(slug: string): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const block = loadBlock(slug);

  console.log();
  header(`Block: ${slug}`);
  console.log();

  console.log(`${colors.bold('Name:')}        ${block.frontmatter.name}`);
  console.log(`${colors.bold('Description:')} ${block.frontmatter.description}`);
  console.log(`${colors.bold('Version:')}     ${block.frontmatter.version}`);
  console.log(`${colors.bold('Tags:')}        ${block.frontmatter.tags?.join(', ') || 'none'}`);
  console.log(`${colors.bold('Hash:')}        ${colors.muted(block.hash)}`);
  console.log();

  console.log(colors.dim('─'.repeat(60)));
  console.log();
  console.log(block.content);
  console.log();
}
