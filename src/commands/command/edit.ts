import { spawn } from 'node:child_process';
import { loadCommand } from '../../core/command';
import { isLibraryInitialized } from '../../core/library';
import { colors, info } from '../../utils/colors';
import { LibraryNotFoundError } from '../../utils/errors';

export async function editCommandCommand(slug: string): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const cmd = loadCommand(slug);
  const editor = process.env.EDITOR || process.env.VISUAL || 'nano';

  info(`Opening ${colors.brand(slug)} in ${colors.muted(editor)}...`);

  const child = spawn(editor, [cmd.path], { stdio: 'inherit' });

  child.on('error', (err) => {
    console.error(`Failed to open editor: ${err.message}`);
    console.log(`  You can manually edit: ${cmd.path}`);
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log();
      console.log(`${colors.success('✔')} Command saved.`);
    }
  });
}
