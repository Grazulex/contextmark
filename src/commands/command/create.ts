import inquirer from 'inquirer';
import { commandExists, createCommand } from '../../core/command';
import { isLibraryInitialized } from '../../core/library';
import { colors, error, success, warning } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';

interface CreateCommandOptions {
  name?: string;
  description?: string;
}

export async function createCommandCommand(
  slug: string,
  options: CreateCommandOptions
): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  // Validate slug
  if (!/^[a-z0-9-]+$/.test(slug)) {
    error('Command slug must be kebab-case (e.g., deploy-app)');
    process.exit(1);
  }

  // Check if already exists
  if (commandExists(slug)) {
    warning(`Command "${slug}" already exists.`);
    console.log(`  Use ${colors.info(`contextmark command edit ${slug}`)} to edit it.`);
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
        message: 'Command display name:',
        default: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        when: !name,
      },
      {
        type: 'input',
        name: 'description',
        message: 'Command description:',
        default: `${slug} command`,
        when: !description,
      },
    ]);

    name = name || answers.name;
    description = description || answers.description;
  }

  // Create the command
  const cmd = createCommand(slug, name!, description!);

  console.log();
  success(`Created command "${slug}"`);
  console.log(`  ${colors.muted('Location:')} ${cmd.path}`);
  console.log();
  console.log(`  Edit with: ${colors.brand(`contextmark command edit ${slug}`)}`);
  console.log();
}
