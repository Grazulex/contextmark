import { isLibraryInitialized } from '../core/library';
import { listAllProfiles } from '../core/profile';
import { colors, header } from '../utils/colors';
import { LibraryNotFoundError } from '../utils/errors';

export async function profilesCommand(): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  console.log();
  header('Available Profiles');
  console.log();

  const profiles = listAllProfiles();

  if (profiles.length === 0) {
    console.log(colors.muted('  No profiles found. Create one with:'));
    console.log(`  ${colors.brand('contextmark profile create <name>')}`);
    console.log();
    return;
  }

  // Table header
  console.log(
    colors.dim('┌──────────────────────┬─────────────────────────────────────┬────────────┐')
  );
  console.log(
    colors.dim('│') +
      colors.bold(' Profile              ') +
      colors.dim('│') +
      colors.bold(' Description                         ') +
      colors.dim('│') +
      colors.bold(' Blocks     ') +
      colors.dim('│')
  );
  console.log(
    colors.dim('├──────────────────────┼─────────────────────────────────────┼────────────┤')
  );

  for (const profile of profiles) {
    const slug = profile.slug.padEnd(20);
    const desc = (profile.config.description || '').substring(0, 35).padEnd(35);
    const blocksCount = `${profile.config.blocks.length} blocks`.padEnd(10);

    console.log(
      `${colors.dim('│')} ${colors.brand(slug)} ${colors.dim('│')} ${desc} ${colors.dim('│')} ${colors.muted(blocksCount)} ${colors.dim('│')}`
    );
  }

  console.log(
    colors.dim('└──────────────────────┴─────────────────────────────────────┴────────────┘')
  );

  console.log();
}
