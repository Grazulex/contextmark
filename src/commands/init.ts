import { existsSync } from 'node:fs';
import boxen from 'boxen';
import inquirer from 'inquirer';
import ora from 'ora';
import { previewClaudeMd, writeClaudeMd } from '../core/generator';
import { isLibraryInitialized } from '../core/library';
import { listAllProfiles } from '../core/profile';
import { getProjectName, pushProject } from '../core/project-sync';
import { isProjectInitialized, saveLocalConfig } from '../lib/config';
import { getProjectClaudePath, getProjectConfigPath } from '../lib/paths';
import type { LocalConfig } from '../types';
import { colors, icons, info, success, warning } from '../utils/colors';
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
    console.log(`  Use ${colors.info('contextmark status')} to check sync status.`);
    console.log(`  Use ${colors.info('contextmark push')} to save to library.`);
    console.log(`  Use ${colors.info('contextmark pull')} to restore from library.`);
    console.log(`  Use ${colors.info('--force')} to reinitialize.`);
    console.log();
    return;
  }

  // If --profile is specified, use the legacy profile-based init
  if (options.profile) {
    await initWithProfile(projectPath, options);
    return;
  }

  // New simple mode: just register the project and optionally push to library
  await initSimple(projectPath, options);
}

async function initSimple(projectPath: string, options: InitOptions): Promise<void> {
  const projectName = getProjectName(projectPath);
  const claudeMdPath = getProjectClaudePath(projectPath);
  const hasClaudeMd = existsSync(claudeMdPath);

  console.log();
  console.log(colors.brand.bold('Initialize Project'));
  console.log();
  console.log(`  ${colors.bold('Project:')} ${colors.brand(projectName)}`);
  console.log(`  ${colors.bold('Path:')}    ${colors.muted(projectPath)}`);
  console.log();

  if (!hasClaudeMd) {
    info('No CLAUDE.md found in this project.');
    console.log();

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          {
            name: 'Create empty CLAUDE.md and register project',
            value: 'create',
          },
          {
            name: 'Use a profile to generate CLAUDE.md',
            value: 'profile',
          },
          {
            name: 'Cancel',
            value: 'cancel',
          },
        ],
      },
    ]);

    if (action === 'cancel') {
      info('Initialization cancelled.');
      return;
    }

    if (action === 'profile') {
      // Fallback to profile mode
      const profiles = listAllProfiles();
      if (profiles.length === 0) {
        console.error(colors.error('No profiles found. Create one first:'));
        console.log(`  ${colors.brand('contextmark profile create <name>')}`);
        process.exit(1);
      }

      const { profile } = await inquirer.prompt([
        {
          type: 'list',
          name: 'profile',
          message: 'Select profile:',
          choices: profiles.map((p) => ({
            name: `${p.slug} - ${p.config.description} (${p.config.blocks.length} blocks)`,
            value: p.slug,
          })),
        },
      ]);

      options.profile = profile;
      await initWithProfile(projectPath, options);
      return;
    }

    // Create empty CLAUDE.md
    if (action === 'create') {
      const { writeFileSync } = await import('node:fs');
      const emptyContent = `# ${projectName}

<!-- Add your project-specific Claude instructions here -->

`;
      writeFileSync(claudeMdPath, emptyContent, 'utf-8');
      success('Created empty CLAUDE.md');
    }
  }

  // Create local config
  const localConfig: LocalConfig = {
    project: projectName,
    profile: null,
    blocks: [],
    agents: [],
    commands: [],
    generated_at: new Date().toISOString(),
  };

  saveLocalConfig(projectPath, localConfig);

  // Ask if user wants to push to library
  const { pushToLibrary } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'pushToLibrary',
      message: 'Push config to library now?',
      default: true,
    },
  ]);

  if (pushToLibrary) {
    const spinner = ora('Pushing to library...').start();
    const result = pushProject(projectPath);
    spinner.succeed(result.message);

    if (result.filesChanged.length > 0) {
      for (const file of result.filesChanged) {
        console.log(`  ${colors.success(icons.check)} ${file}`);
      }
    }

    // Update last_push
    localConfig.last_push = new Date().toISOString();
    saveLocalConfig(projectPath, localConfig);
  }

  console.log();
  console.log(
    boxen(
      `${colors.brand.bold('Project Registered')}\n\n${icons.check} Project: ${colors.brand(projectName)}\n\nFiles created:\n  ${colors.muted('.contextmark.yml')}  ${colors.dim('- Tracking config')}\n\n${colors.dim('Commands:')}\n  ${colors.brand('contextmark push')}    ${colors.dim('- Save to library')}\n  ${colors.brand('contextmark pull')}    ${colors.dim('- Restore from library')}\n  ${colors.brand('contextmark diff')}    ${colors.dim('- Compare local vs library')}\n  ${colors.brand('contextmark status')}  ${colors.dim('- Check sync status')}`,
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

async function initWithProfile(projectPath: string, options: InitOptions): Promise<void> {
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
