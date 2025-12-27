import { spawn } from 'node:child_process';
import { loadBlock } from '../../core/block';
import { isLibraryInitialized } from '../../core/library';
import { colors, info } from '../../utils/colors';
import { BlockNotFoundError, LibraryNotFoundError } from '../../utils/errors';

export async function editBlockCommand(slug: string): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  try {
    const block = loadBlock(slug);

    // Get the editor from environment
    const editor = process.env.EDITOR || process.env.VISUAL || 'nano';

    info(`Opening ${colors.brand(slug)} in ${colors.muted(editor)}...`);

    // Open the editor
    const child = spawn(editor, [block.path], {
      stdio: 'inherit',
    });

    child.on('error', (err) => {
      console.error(`Failed to open editor: ${err.message}`);
      console.log(`  You can manually edit: ${block.path}`);
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log();
        console.log(`${colors.success('✔')} Block saved.`);
      }
    });
  } catch (err) {
    if (err instanceof BlockNotFoundError) {
      throw err;
    }
    throw err;
  }
}
