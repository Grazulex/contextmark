import { dirname } from 'node:path';
import inquirer from 'inquirer';
import { blockExists, createBlock } from '../../core/block';
import { isLibraryInitialized } from '../../core/library';
import { ensureDir } from '../../lib/fs';
import { BLOCKS_DIR, getBlockPath } from '../../lib/paths';
import { colors, error, success, warning } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';
import { validateBlockSlug } from '../../utils/validators';

interface CreateBlockOptions {
  name?: string;
  description?: string;
}

export async function createBlockCommand(slug: string, options: CreateBlockOptions): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  // Validate slug
  const validation = validateBlockSlug(slug);
  if (!validation.valid) {
    error(validation.error!);
    process.exit(1);
  }

  // Check if already exists
  if (blockExists(slug)) {
    warning(`Block "${slug}" already exists.`);
    console.log(`  Use ${colors.info(`contextmark block edit ${slug}`)} to edit it.`);
    console.log();
    return;
  }

  // Get name and description
  let name = options.name;
  let description = options.description;

  if (!name || !description) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Block display name:',
        default: slug
          .split('/')
          .pop()
          ?.replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        when: !name,
      },
      {
        type: 'input',
        name: 'description',
        message: 'Block description:',
        default: `Conventions for ${slug.split('/')[0]}`,
        when: !description,
      },
    ]);

    name = name || answers.name;
    description = description || answers.description;
  }

  // Ensure category directory exists
  const blockPath = getBlockPath(slug);
  ensureDir(dirname(blockPath));

  // Create the block
  const block = createBlock(slug, name!, description!);

  console.log();
  success(`Created block "${slug}"`);
  console.log(`  ${colors.muted('Location:')} ${block.path}`);
  console.log();
  console.log(`  Edit with: ${colors.brand(`contextmark block edit ${slug}`)}`);
  console.log();
}
