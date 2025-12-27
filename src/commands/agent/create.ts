import inquirer from 'inquirer';
import { agentExists, createAgent } from '../../core/agent';
import { isLibraryInitialized } from '../../core/library';
import { colors, error, success, warning } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';

interface CreateAgentOptions {
  name?: string;
  description?: string;
}

export async function createAgentCommand(slug: string, options: CreateAgentOptions): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  // Validate slug
  if (!/^[a-z0-9-]+$/.test(slug)) {
    error('Agent slug must be kebab-case (e.g., code-reviewer)');
    process.exit(1);
  }

  // Check if already exists
  if (agentExists(slug)) {
    warning(`Agent "${slug}" already exists.`);
    console.log(`  Use ${colors.info(`contextmark agent edit ${slug}`)} to edit it.`);
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
        message: 'Agent display name:',
        default: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        when: !name,
      },
      {
        type: 'input',
        name: 'description',
        message: 'Agent description:',
        default: `${slug} agent`,
        when: !description,
      },
    ]);

    name = name || answers.name;
    description = description || answers.description;
  }

  // Create the agent
  const agent = createAgent(slug, name!, description!);

  console.log();
  success(`Created agent "${slug}"`);
  console.log(`  ${colors.muted('Location:')} ${agent.path}`);
  console.log();
  console.log(`  Edit with: ${colors.brand(`contextmark agent edit ${slug}`)}`);
  console.log();
}
