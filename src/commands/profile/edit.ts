import { spawn } from 'node:child_process';
import { isLibraryInitialized } from '../../core/library';
import { loadProfile } from '../../core/profile';
import { colors, info } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';

export async function editProfileCommand(slug: string): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const profile = loadProfile(slug);

  // Get the editor from environment
  const editor = process.env.EDITOR || process.env.VISUAL || 'nano';

  info(`Opening ${colors.brand(slug)} in ${colors.muted(editor)}...`);

  // Open the editor
  const child = spawn(editor, [profile.path], {
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    console.error(`Failed to open editor: ${err.message}`);
    console.log(`  You can manually edit: ${profile.path}`);
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log();
      console.log(`${colors.success('✔')} Profile saved.`);
    }
  });
}
