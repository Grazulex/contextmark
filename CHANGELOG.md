# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-12-27

### Features

- **Update Command**: Update CLAUDE.md with latest block versions
- **Update --all**: Update all known projects at once
- **Sync Status**: Show library Git synchronization status
- **Sync Push**: Commit and push library changes to remote
- **Sync Pull**: Pull library changes from remote
- **Sync Setup**: Configure remote Git repository for library
- **README.md**: Complete documentation in mark ecosystem style

### Technical

- Project discovery via find command
- Git operations via child_process
- Support for multiple projects tracking

## [0.1.0] - 2025-12-27

### Features

- **CLI Structure**: Commander.js-based CLI with colored output (violet #8B5CF6)
- **init-library**: Initialize ~/.contextmark with full directory structure
- **Blocks Management**: Create, edit, show, remove context blocks
- **Profiles Management**: Create, show, edit, remove block combinations
- **Project Init**: Generate CLAUDE.md from selected profile
- **Status Command**: Check for block updates with version tracking
- **Tracking**: .contextmark.yml for project configuration

### Technical

- TypeScript with ESM modules
- Biome for linting/formatting
- Vitest for testing (setup ready)
- gray-matter for frontmatter parsing
- YAML for configuration files
