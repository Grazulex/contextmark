import boxen from 'boxen';
import inquirer from 'inquirer';
import { previewClaudeMd, writeClaudeMd } from '../core/generator';
import { isLibraryInitialized } from '../core/library';
import { listAllProfiles } from '../core/profile';
import { isProjectInitialized } from '../lib/config';
import { colors, icons, success, warning } from '../utils/colors';
import { LibraryNotFoundError } from '../utils/errors';

interface InitOptions {
  profile?: string;
  blocks?: string;
  noGlobal?: boolean;
  dryRun?: boolean;
  force?: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
  if (!isLibraryInitialized()) {
    throw new LibraryNotFoundError();
  }

  const projectPath = process.cwd();

  // Check if already initialized
  if (isProjectInitialized(projectPath) && !options.force) {
    warning('Project already initialized with ContextMark.');
    console.log(`  Use ${colors.info('contextmark update')} to refresh.`);
    console.log(`  Use ${colors.info('--force')} to reinitialize.`);
    console.log();
    return;
  }

  // Get profile
  let profileSlug = options.profile;

  if (!profileSlug) {
    const profiles = listAllProfiles();

    if (profiles.length === 0) {
      console.error(colors.error('No profiles found. Create one first:'));
      console.log(`  ${colors.brand('contextmark profile create <name>')}`);
      process.exit(1);
    }

    const choices = profiles.map((p) => ({
      name: `${p.slug} - ${p.config.description} (${p.config.blocks.length} blocks)`,
      value: p.slug,
      short: p.slug,
    }));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'profile',
        message: 'Select profile:',
        choices,
      },
    ]);

    profileSlug = answers.profile;
  }

  // Dry run mode
  if (options.dryRun) {
    console.log();
    console.log(colors.bold('Preview (dry-run):'));
    console.log(colors.dim('─'.repeat(60)));
    console.log();

    const content = previewClaudeMd(profileSlug!, {
      includeGlobal: !options.noGlobal,
    });

    // Show truncated preview
    const lines = content.split('\n');
    const maxLines = 30;

    if (lines.length > maxLines) {
      console.log(lines.slice(0, maxLines).join('\n'));
      console.log(colors.muted(`\n... (${lines.length - maxLines} more lines)`));
    } else {
      console.log(content);
    }

    console.log();
    console.log(colors.dim('─'.repeat(60)));
    console.log(colors.muted('No files were written (dry-run mode).'));
    console.log();
    return;
  }

  // Generate files
  const localConfig = writeClaudeMd(projectPath, profileSlug!, {
    includeGlobal: !options.noGlobal,
    projectPath,
  });

  console.log();
  console.log(
    boxen(
      `${colors.brand.bold('Project Initialized')}\n\n${icons.check} Profile: ${colors.brand(profileSlug!)}\n${icons.check} Blocks: ${localConfig.blocks.length}\n\nFiles created:\n  ${colors.muted('CLAUDE.md')}         ${colors.dim('- Generated context')}\n  ${colors.muted('.contextmark.yml')}  ${colors.dim('- Tracking config')}\n\n${colors.dim('Next steps:')}\n  ${colors.brand('contextmark status')}  ${colors.dim('- Check for updates')}\n  ${colors.brand('contextmark update')}  ${colors.dim('- Apply updates')}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: '#8B5CF6',
      }
    )
  );

  success('Project initialized successfully!');
  console.log();
}
