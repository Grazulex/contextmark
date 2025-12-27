import boxen from 'boxen';
import { initializeLibrary, isLibraryInitialized } from '../core/library';
import { LIBRARY_DIR } from '../lib/paths';
import { colors, error, icons, success, warning } from '../utils/colors';

interface InitLibraryOptions {
  force?: boolean;
}

export async function initLibraryCommand(options: InitLibraryOptions): Promise<void> {
  console.log();

  if (isLibraryInitialized() && !options.force) {
    warning('ContextMark library already initialized.');
    console.log(`  Location: ${colors.muted(LIBRARY_DIR)}`);
    console.log();
    console.log(`  Use ${colors.info('--force')} to reinitialize.`);
    console.log();
    return;
  }

  try {
    initializeLibrary();

    console.log(
      boxen(
        `${colors.brand.bold('ContextMark Library Initialized')}\n\n${icons.folder} Location: ${colors.muted(LIBRARY_DIR)}\n\nStructure created:\n  ${colors.muted('blocks/')}      ${colors.dim('- Reusable context blocks')}\n  ${colors.muted('profiles/')}    ${colors.dim('- Block combinations')}\n  ${colors.muted('agents/')}      ${colors.dim('- Reusable agents')}\n  ${colors.muted('commands/')}    ${colors.dim('- Custom commands')}\n  ${colors.muted('global/')}      ${colors.dim('- Global context')}\n  ${colors.muted('config.yml')}   ${colors.dim('- Configuration')}\n\n${colors.dim('Quick Start:')}\n  ${colors.brand('contextmark block create laravel/base')}\n  ${colors.brand('contextmark profile create my-profile')}\n  ${colors.brand('cd my-project && contextmark init')}`,
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: '#8B5CF6',
        }
      )
    );

    success('Library initialized successfully!');
    console.log();
  } catch (err) {
    error(`Failed to initialize library: ${(err as Error).message}`);
    process.exit(1);
  }
}
