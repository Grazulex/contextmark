import { loadAgent } from '../../core/agent';
import { isLibraryInitialized } from '../../core/library';
import { colors, header } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';

export async function showAgentCommand(slug: string): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const agent = loadAgent(slug);

  console.log();
  header(`Agent: ${slug}`);
  console.log();

  console.log(`${colors.bold('Name:')}        ${agent.frontmatter.name}`);
  console.log(`${colors.bold('Description:')} ${agent.frontmatter.description}`);
  console.log();

  console.log(colors.dim('─'.repeat(60)));
  console.log();
  console.log(agent.content);
  console.log();
}
