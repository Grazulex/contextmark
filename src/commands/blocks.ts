import { listAllBlocks, listBlocksByCategory } from '../core/block';
import { isLibraryInitialized } from '../core/library';
import { colors, header, icons } from '../utils/colors';
import { LibraryNotFoundError } from '../utils/errors';

interface BlocksOptions {
  all?: boolean;
}

export async function blocksCommand(options: BlocksOptions): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  console.log();
  header('Available Blocks');
  console.log();

  if (options.all) {
    const blocks = listAllBlocks();

    if (blocks.length === 0) {
      console.log(colors.muted('  No blocks found. Create one with:'));
      console.log(`  ${colors.brand('contextmark block create <category/name>')}`);
      console.log();
      return;
    }

    // Table header
    console.log(
      colors.dim('┌───────────────────────┬─────────────────────────────────────┬─────────┐')
    );
    console.log(
      colors.dim('│') +
        colors.bold(' Block                 ') +
        colors.dim('│') +
        colors.bold(' Description                         ') +
        colors.dim('│') +
        colors.bold(' Version ') +
        colors.dim('│')
    );
    console.log(
      colors.dim('├───────────────────────┼─────────────────────────────────────┼─────────┤')
    );

    for (const block of blocks) {
      const slug = block.slug.padEnd(21);
      const desc = (block.frontmatter.description || '').substring(0, 35).padEnd(35);
      const version = block.frontmatter.version.padEnd(7);

      console.log(
        `${colors.dim('│')} ${colors.brand(slug)} ${colors.dim('│')} ${desc} ${colors.dim('│')} ${colors.muted(version)} ${colors.dim('│')}`
      );
    }

    console.log(
      colors.dim('└───────────────────────┴─────────────────────────────────────┴─────────┘')
    );
  } else {
    const categories = listBlocksByCategory();

    if (categories.length === 0) {
      console.log(colors.muted('  No blocks found. Create one with:'));
      console.log(`  ${colors.brand('contextmark block create <category/name>')}`);
      console.log();
      return;
    }

    for (const category of categories) {
      console.log(`${icons.folder} ${colors.bold(category.name)}/`);

      for (const block of category.blocks) {
        console.log(
          `   ${icons.file} ${colors.brand(block.slug.split('/')[1])}${colors.muted(` v${block.frontmatter.version}`)}${colors.dim(` - ${block.frontmatter.description || 'No description'}`)}`
        );
      }
      console.log();
    }
  }

  console.log();
}
