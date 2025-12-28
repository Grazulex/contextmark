import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { copyFile, ensureDir, listFilesRecursive, readFile, removeDir, writeFile } from '../lib/fs';
import {
  CLAUDE_MD_FILE,
  GLOBAL_DIR,
  PROJECTS_DIR,
  USER_CLAUDE_DIR,
  USER_CLAUDE_MD,
  USER_CLAUDE_RULES,
  USER_CLAUDE_SKILLS,
  getLibraryGlobalClaudeMd,
  getLibraryGlobalRules,
  getLibraryGlobalSkills,
  getLibraryProjectClaudeDir,
  getLibraryProjectClaudeMd,
  getLibraryProjectDir,
  getProjectClaudeDir,
  getProjectClaudePath,
} from '../lib/paths';

export interface SyncResult {
  success: boolean;
  filesChanged: string[];
  message: string;
}

export interface DiffResult {
  hasDiff: boolean;
  localOnly: string[];
  libraryOnly: string[];
  different: string[];
  identical: string[];
}

export function getProjectName(projectPath: string): string {
  // Try to get project name from package.json or composer.json
  const packageJsonPath = join(projectPath, 'package.json');
  const composerJsonPath = join(projectPath, 'composer.json');

  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(readFile(packageJsonPath));
      if (pkg.name) {
        // Handle scoped packages (@scope/name -> name)
        const name = pkg.name.includes('/') ? pkg.name.split('/')[1] : pkg.name;
        return name;
      }
    } catch {
      // Ignore parse errors
    }
  }

  if (existsSync(composerJsonPath)) {
    try {
      const composer = JSON.parse(readFile(composerJsonPath));
      if (composer.name) {
        // Handle vendor/name format
        const name = composer.name.includes('/') ? composer.name.split('/')[1] : composer.name;
        return name;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Fallback to directory name
  return basename(projectPath);
}

// === PUSH ===

export function pushProject(projectPath: string): SyncResult {
  const projectName = getProjectName(projectPath);
  const localClaudeMd = getProjectClaudePath(projectPath);
  const localClaudeDir = getProjectClaudeDir(projectPath);
  const libProjectDir = getLibraryProjectDir(projectName);
  const libClaudeMd = getLibraryProjectClaudeMd(projectName);
  const libClaudeDir = getLibraryProjectClaudeDir(projectName);

  const filesChanged: string[] = [];

  // Ensure library project directory exists
  ensureDir(libProjectDir);

  // Push CLAUDE.md if exists
  if (existsSync(localClaudeMd)) {
    const localContent = readFile(localClaudeMd);
    writeFile(libClaudeMd, localContent);
    filesChanged.push(CLAUDE_MD_FILE);
  }

  // Push .claude/ directory if exists
  if (existsSync(localClaudeDir)) {
    // Remove existing .claude in library
    if (existsSync(libClaudeDir)) {
      removeDir(libClaudeDir);
    }
    ensureDir(libClaudeDir);

    // Copy all files
    const files = listFilesRecursive(localClaudeDir);
    for (const file of files) {
      const relativePath = file.substring(localClaudeDir.length + 1);
      const destPath = join(libClaudeDir, relativePath);
      copyFile(file, destPath);
      filesChanged.push(`.claude/${relativePath}`);
    }
  }

  if (filesChanged.length === 0) {
    return {
      success: true,
      filesChanged: [],
      message: 'No files to push (no CLAUDE.md or .claude/ found)',
    };
  }

  return {
    success: true,
    filesChanged,
    message: `Pushed ${filesChanged.length} file(s) to library`,
  };
}

export function pushGlobal(): SyncResult {
  const filesChanged: string[] = [];

  // Ensure global directory exists
  ensureDir(GLOBAL_DIR);

  // Push ~/.claude/CLAUDE.md if exists
  if (existsSync(USER_CLAUDE_MD)) {
    const content = readFile(USER_CLAUDE_MD);
    writeFile(getLibraryGlobalClaudeMd(), content);
    filesChanged.push('CLAUDE.md');
  }

  // Push ~/.claude/rules/ if exists
  if (existsSync(USER_CLAUDE_RULES)) {
    const libRulesDir = getLibraryGlobalRules();
    if (existsSync(libRulesDir)) {
      removeDir(libRulesDir);
    }
    ensureDir(libRulesDir);

    const files = listFilesRecursive(USER_CLAUDE_RULES);
    for (const file of files) {
      const relativePath = file.substring(USER_CLAUDE_RULES.length + 1);
      const destPath = join(libRulesDir, relativePath);
      copyFile(file, destPath);
      filesChanged.push(`rules/${relativePath}`);
    }
  }

  // Push ~/.claude/skills/ if exists
  if (existsSync(USER_CLAUDE_SKILLS)) {
    const libSkillsDir = getLibraryGlobalSkills();
    if (existsSync(libSkillsDir)) {
      removeDir(libSkillsDir);
    }
    ensureDir(libSkillsDir);

    const files = listFilesRecursive(USER_CLAUDE_SKILLS);
    for (const file of files) {
      const relativePath = file.substring(USER_CLAUDE_SKILLS.length + 1);
      const destPath = join(libSkillsDir, relativePath);
      copyFile(file, destPath);
      filesChanged.push(`skills/${relativePath}`);
    }
  }

  if (filesChanged.length === 0) {
    return {
      success: true,
      filesChanged: [],
      message: 'No global config found in ~/.claude/',
    };
  }

  return {
    success: true,
    filesChanged,
    message: `Pushed ${filesChanged.length} global file(s) to library`,
  };
}

// === PULL ===

export function pullProject(projectPath: string): SyncResult {
  const projectName = getProjectName(projectPath);
  const localClaudeMd = getProjectClaudePath(projectPath);
  const localClaudeDir = getProjectClaudeDir(projectPath);
  const libClaudeMd = getLibraryProjectClaudeMd(projectName);
  const libClaudeDir = getLibraryProjectClaudeDir(projectName);

  const filesChanged: string[] = [];

  // Check if project exists in library
  if (!existsSync(getLibraryProjectDir(projectName))) {
    return {
      success: false,
      filesChanged: [],
      message: `Project "${projectName}" not found in library. Run 'contextmark push' first.`,
    };
  }

  // Pull CLAUDE.md if exists in library
  if (existsSync(libClaudeMd)) {
    const content = readFile(libClaudeMd);
    writeFile(localClaudeMd, content);
    filesChanged.push(CLAUDE_MD_FILE);
  }

  // Pull .claude/ directory if exists in library
  if (existsSync(libClaudeDir)) {
    // Remove existing .claude locally
    if (existsSync(localClaudeDir)) {
      removeDir(localClaudeDir);
    }
    ensureDir(localClaudeDir);

    // Copy all files
    const files = listFilesRecursive(libClaudeDir);
    for (const file of files) {
      const relativePath = file.substring(libClaudeDir.length + 1);
      const destPath = join(localClaudeDir, relativePath);
      copyFile(file, destPath);
      filesChanged.push(`.claude/${relativePath}`);
    }
  }

  if (filesChanged.length === 0) {
    return {
      success: true,
      filesChanged: [],
      message: 'No files to pull from library',
    };
  }

  return {
    success: true,
    filesChanged,
    message: `Pulled ${filesChanged.length} file(s) from library`,
  };
}

export function pullGlobal(): SyncResult {
  const filesChanged: string[] = [];

  // Ensure ~/.claude/ directory exists
  ensureDir(USER_CLAUDE_DIR);

  // Pull CLAUDE.md if exists in library
  const libClaudeMd = getLibraryGlobalClaudeMd();
  if (existsSync(libClaudeMd)) {
    const content = readFile(libClaudeMd);
    writeFile(USER_CLAUDE_MD, content);
    filesChanged.push('CLAUDE.md');
  }

  // Pull rules/ if exists in library
  const libRulesDir = getLibraryGlobalRules();
  if (existsSync(libRulesDir)) {
    if (existsSync(USER_CLAUDE_RULES)) {
      removeDir(USER_CLAUDE_RULES);
    }
    ensureDir(USER_CLAUDE_RULES);

    const files = listFilesRecursive(libRulesDir);
    for (const file of files) {
      const relativePath = file.substring(libRulesDir.length + 1);
      const destPath = join(USER_CLAUDE_RULES, relativePath);
      copyFile(file, destPath);
      filesChanged.push(`rules/${relativePath}`);
    }
  }

  // Pull skills/ if exists in library
  const libSkillsDir = getLibraryGlobalSkills();
  if (existsSync(libSkillsDir)) {
    if (existsSync(USER_CLAUDE_SKILLS)) {
      removeDir(USER_CLAUDE_SKILLS);
    }
    ensureDir(USER_CLAUDE_SKILLS);

    const files = listFilesRecursive(libSkillsDir);
    for (const file of files) {
      const relativePath = file.substring(libSkillsDir.length + 1);
      const destPath = join(USER_CLAUDE_SKILLS, relativePath);
      copyFile(file, destPath);
      filesChanged.push(`skills/${relativePath}`);
    }
  }

  if (filesChanged.length === 0) {
    return {
      success: false,
      filesChanged: [],
      message: "No global config found in library. Run 'contextmark push --global' first.",
    };
  }

  return {
    success: true,
    filesChanged,
    message: `Pulled ${filesChanged.length} global file(s) from library`,
  };
}

// === DIFF ===

function compareFiles(file1: string, file2: string): boolean {
  if (!existsSync(file1) || !existsSync(file2)) {
    return false;
  }
  const content1 = readFile(file1);
  const content2 = readFile(file2);
  return content1 === content2;
}

function getRelativeFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files = listFilesRecursive(dir);
  return files.map((f) => f.substring(dir.length + 1));
}

export function diffProject(projectPath: string): DiffResult {
  const projectName = getProjectName(projectPath);
  const localClaudeMd = getProjectClaudePath(projectPath);
  const localClaudeDir = getProjectClaudeDir(projectPath);
  const libClaudeMd = getLibraryProjectClaudeMd(projectName);
  const libClaudeDir = getLibraryProjectClaudeDir(projectName);

  const localOnly: string[] = [];
  const libraryOnly: string[] = [];
  const different: string[] = [];
  const identical: string[] = [];

  // Compare CLAUDE.md
  const localHasClaudeMd = existsSync(localClaudeMd);
  const libHasClaudeMd = existsSync(libClaudeMd);

  if (localHasClaudeMd && libHasClaudeMd) {
    if (compareFiles(localClaudeMd, libClaudeMd)) {
      identical.push(CLAUDE_MD_FILE);
    } else {
      different.push(CLAUDE_MD_FILE);
    }
  } else if (localHasClaudeMd) {
    localOnly.push(CLAUDE_MD_FILE);
  } else if (libHasClaudeMd) {
    libraryOnly.push(CLAUDE_MD_FILE);
  }

  // Compare .claude/ directories
  const localFiles = getRelativeFiles(localClaudeDir);
  const libFiles = getRelativeFiles(libClaudeDir);

  const allFiles = new Set([...localFiles, ...libFiles]);

  for (const file of allFiles) {
    const localFile = join(localClaudeDir, file);
    const libFile = join(libClaudeDir, file);
    const displayName = `.claude/${file}`;

    const localExists = existsSync(localFile);
    const libExists = existsSync(libFile);

    if (localExists && libExists) {
      if (compareFiles(localFile, libFile)) {
        identical.push(displayName);
      } else {
        different.push(displayName);
      }
    } else if (localExists) {
      localOnly.push(displayName);
    } else if (libExists) {
      libraryOnly.push(displayName);
    }
  }

  return {
    hasDiff: localOnly.length > 0 || libraryOnly.length > 0 || different.length > 0,
    localOnly,
    libraryOnly,
    different,
    identical,
  };
}

export function diffGlobal(): DiffResult {
  const localOnly: string[] = [];
  const libraryOnly: string[] = [];
  const different: string[] = [];
  const identical: string[] = [];

  // Compare CLAUDE.md
  const libClaudeMd = getLibraryGlobalClaudeMd();
  const localHasClaudeMd = existsSync(USER_CLAUDE_MD);
  const libHasClaudeMd = existsSync(libClaudeMd);

  if (localHasClaudeMd && libHasClaudeMd) {
    if (compareFiles(USER_CLAUDE_MD, libClaudeMd)) {
      identical.push('CLAUDE.md');
    } else {
      different.push('CLAUDE.md');
    }
  } else if (localHasClaudeMd) {
    localOnly.push('CLAUDE.md');
  } else if (libHasClaudeMd) {
    libraryOnly.push('CLAUDE.md');
  }

  // Compare rules/
  const libRulesDir = getLibraryGlobalRules();
  const localRulesFiles = getRelativeFiles(USER_CLAUDE_RULES);
  const libRulesFiles = getRelativeFiles(libRulesDir);
  const allRulesFiles = new Set([...localRulesFiles, ...libRulesFiles]);

  for (const file of allRulesFiles) {
    const localFile = join(USER_CLAUDE_RULES, file);
    const libFile = join(libRulesDir, file);
    const displayName = `rules/${file}`;

    const localExists = existsSync(localFile);
    const libExists = existsSync(libFile);

    if (localExists && libExists) {
      if (compareFiles(localFile, libFile)) {
        identical.push(displayName);
      } else {
        different.push(displayName);
      }
    } else if (localExists) {
      localOnly.push(displayName);
    } else if (libExists) {
      libraryOnly.push(displayName);
    }
  }

  // Compare skills/
  const libSkillsDir = getLibraryGlobalSkills();
  const localSkillsFiles = getRelativeFiles(USER_CLAUDE_SKILLS);
  const libSkillsFiles = getRelativeFiles(libSkillsDir);
  const allSkillsFiles = new Set([...localSkillsFiles, ...libSkillsFiles]);

  for (const file of allSkillsFiles) {
    const localFile = join(USER_CLAUDE_SKILLS, file);
    const libFile = join(libSkillsDir, file);
    const displayName = `skills/${file}`;

    const localExists = existsSync(localFile);
    const libExists = existsSync(libFile);

    if (localExists && libExists) {
      if (compareFiles(localFile, libFile)) {
        identical.push(displayName);
      } else {
        different.push(displayName);
      }
    } else if (localExists) {
      localOnly.push(displayName);
    } else if (libExists) {
      libraryOnly.push(displayName);
    }
  }

  return {
    hasDiff: localOnly.length > 0 || libraryOnly.length > 0 || different.length > 0,
    localOnly,
    libraryOnly,
    different,
    identical,
  };
}

// === STATUS ===

export interface ProjectSyncStatus {
  projectName: string;
  existsInLibrary: boolean;
  hasDiff: boolean;
  diff?: DiffResult;
}

export function getProjectSyncStatus(projectPath: string): ProjectSyncStatus {
  const projectName = getProjectName(projectPath);
  const libProjectDir = getLibraryProjectDir(projectName);
  const existsInLibrary = existsSync(libProjectDir);

  if (!existsInLibrary) {
    return {
      projectName,
      existsInLibrary: false,
      hasDiff: false,
    };
  }

  const diff = diffProject(projectPath);

  return {
    projectName,
    existsInLibrary: true,
    hasDiff: diff.hasDiff,
    diff,
  };
}

// === LIST PROJECTS ===

export function listLibraryProjects(): string[] {
  if (!existsSync(PROJECTS_DIR)) {
    return [];
  }

  const entries = require('node:fs').readdirSync(PROJECTS_DIR, { withFileTypes: true });
  return entries
    .filter((entry: { isDirectory: () => boolean }) => entry.isDirectory())
    .map((entry: { name: string }) => entry.name);
}
