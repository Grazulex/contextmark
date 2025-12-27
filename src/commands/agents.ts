import { listAllAgents } from '../core/agent';
import { isLibraryInitialized } from '../core/library';
import { colors, header, icons } from '../utils/colors';
import { LibraryNotFoundError } from '../utils/errors';

export async function agentsCommand(): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  console.log();
  header('Available Agents');
  console.log();

  const agents = listAllAgents();

  if (agents.length === 0) {
    console.log(colors.muted('  No agents found. Create one with:'));
    console.log(`  ${colors.brand('contextmark agent create <name>')}`);
    console.log();
    return;
  }

  // Table header
  console.log(colors.dim('┌────────────────────────┬────────────────────────────────────────────┐'));
  console.log(
    colors.dim('│') +
      colors.bold(' Agent                  ') +
      colors.dim('│') +
      colors.bold(' Description                                ') +
      colors.dim('│')
  );
  console.log(colors.dim('├────────────────────────┼────────────────────────────────────────────┤'));

  for (const agent of agents) {
    const slug = agent.slug.padEnd(22);
    const desc = (agent.frontmatter.description || '').substring(0, 42).padEnd(42);

    console.log(
      colors.dim('│') +
        ` ${colors.brand(slug)} ` +
        colors.dim('│') +
        ` ${colors.muted(desc)} ` +
        colors.dim('│')
    );
  }

  console.log(colors.dim('└────────────────────────┴────────────────────────────────────────────┘'));
  console.log();
}
