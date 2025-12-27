import inquirer from 'inquirer';
import { listAllBlocks } from '../../core/block';
import { isLibraryInitialized } from '../../core/library';
import { createProfile, profileExists } from '../../core/profile';
import { colors, success, warning } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';
import { validateProfileSlug } from '../../utils/validators';

interface CreateProfileOptions {
  name?: string;
  description?: string;
}

export async function createProfileCommand(
  slug: string,
  options: CreateProfileOptions
): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  // Validate slug
  const validation = validateProfileSlug(slug);
  if (!validation.valid) {
    console.error(colors.error(validation.error!));
    process.exit(1);
  }

  // Check if already exists
  if (profileExists(slug)) {
    warning(`Profile "${slug}" already exists.`);
    console.log(`  Use ${colors.info(`contextmark profile edit ${slug}`)} to edit it.`);
    console.log();
    return;
  }

  // Get name and description
  let name = options.name;
  let description = options.description;

  const blocks = listAllBlocks();
  const blockChoices = blocks.map((b) => ({
    name: `${b.slug} (v${b.frontmatter.version})`,
    value: b.slug,
    short: b.slug,
  }));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Profile display name:',
      default: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      when: !name,
    },
    {
      type: 'input',
      name: 'description',
      message: 'Profile description:',
      default: `Profile for ${slug}`,
      when: !description,
    },
    {
      type: 'checkbox',
      name: 'blocks',
      message: 'Select blocks to include:',
      choices: blockChoices,
      when: blockChoices.length > 0,
    },
  ]);

  name = name || answers.name;
  description = description || answers.description;
  const selectedBlocks = answers.blocks || [];

  // Create the profile
  const profile = createProfile(slug, name!, description!, selectedBlocks);

  console.log();
  success(`Created profile "${slug}"`);
  console.log(`  ${colors.muted('Blocks:')} ${selectedBlocks.length}`);
  console.log(`  ${colors.muted('Location:')} ${profile.path}`);
  console.log();
  console.log(`  View with: ${colors.brand(`contextmark profile show ${slug}`)}`);
  console.log();
}
