import { error } from './colors';

export class ContextMarkError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ContextMarkError';
  }
}

export class LibraryNotFoundError extends ContextMarkError {
  constructor() {
    super(
      'ContextMark library not found. Run `contextmark init-library` first.',
      'LIBRARY_NOT_FOUND'
    );
  }
}

export class BlockNotFoundError extends ContextMarkError {
  constructor(blockName: string) {
    super(`Block "${blockName}" not found.`, 'BLOCK_NOT_FOUND');
  }
}

export class ProfileNotFoundError extends ContextMarkError {
  constructor(profileName: string) {
    super(`Profile "${profileName}" not found.`, 'PROFILE_NOT_FOUND');
  }
}

export class ProjectNotInitializedError extends ContextMarkError {
  constructor() {
    super('Project not initialized. Run `contextmark init` first.', 'PROJECT_NOT_INITIALIZED');
  }
}

export function handleError(err: unknown): void {
  if (err instanceof ContextMarkError) {
    error(`Error: ${err.message}`);
    if (process.env.DEBUG && err.code) {
      console.error(`Code: ${err.code}`);
    }
  } else if (err instanceof Error) {
    error(`Unexpected error: ${err.message}`);
    if (process.env.DEBUG) {
      console.error(err.stack);
    }
  } else {
    error('An unknown error occurred');
  }
  process.exit(1);
}
