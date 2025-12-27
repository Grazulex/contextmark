import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { LOCAL_CONFIG_FILE } from '../lib/paths';

export async function findAllProjects(): Promise<string[]> {
  const home = homedir();
  const projects: string[] = [];

  try {
    // Use find to locate all .contextmark.yml files
    const result = execSync(
      `find "${home}" -name "${LOCAL_CONFIG_FILE}" -type f 2>/dev/null | head -100`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    const files = result.trim().split('\n').filter(Boolean);

    for (const file of files) {
      // Get the directory containing the config file
      const projectPath = file.replace(`/${LOCAL_CONFIG_FILE}`, '');

      // Skip if it's inside .contextmark library
      if (projectPath.includes('.contextmark')) {
        continue;
      }

      // Verify the directory exists
      if (existsSync(projectPath)) {
        projects.push(projectPath);
      }
    }
  } catch {
    // find command failed or timed out, return empty
  }

  return projects;
}

export function getProjectName(projectPath: string): string {
  return projectPath.split('/').pop() || projectPath;
}

export function shortenPath(path: string): string {
  const home = homedir();
  return path.replace(home, '~');
}
