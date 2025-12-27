import { blockExists, loadBlock } from '../../core/block';
import { isLibraryInitialized } from '../../core/library';
import { loadProfile } from '../../core/profile';
import { colors, header, icons } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';

export async function showProfileCommand(slug: string): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const profile = loadProfile(slug);

  console.log();
  header(`Profile: ${slug}`);
  console.log();

  console.log(`${colors.bold('Name:')}        ${profile.config.name}`);
  console.log(`${colors.bold('Description:')} ${profile.config.description}`);
  console.log();

  // Blocks
  console.log(colors.bold(`Blocks (${profile.config.blocks.length}):`));
  if (profile.config.blocks.length === 0) {
    console.log(colors.muted('  No blocks'));
  } else {
    for (let i = 0; i < profile.config.blocks.length; i++) {
      const blockSlug = profile.config.blocks[i];
      let version = '?';
      let status = colors.warning('missing');

      if (blockExists(blockSlug)) {
        const block = loadBlock(blockSlug);
        version = block.frontmatter.version;
        status = colors.success('ok');
      }

      console.log(
        `  ${i + 1}. ${colors.brand(blockSlug)} ${colors.muted(`v${version}`)} ${status}`
      );
    }
  }

  console.log();

  // Agents
  if (profile.config.agents && profile.config.agents.length > 0) {
    console.log(colors.bold(`Agents (${profile.config.agents.length}):`));
    for (const agent of profile.config.agents) {
      console.log(`  ${icons.bullet} ${agent}`);
    }
    console.log();
  }

  // Commands
  if (profile.config.commands && profile.config.commands.length > 0) {
    console.log(colors.bold(`Commands (${profile.config.commands.length}):`));
    for (const command of profile.config.commands) {
      console.log(`  ${icons.bullet} ${command}`);
    }
    console.log();
  }
}
