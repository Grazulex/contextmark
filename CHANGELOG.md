# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0](https://github.com/Grazulex/contextmark/releases/tag/v2.0.0) (2025-12-28)

### Features

- simplify workflow with push/pull commands ([d401846](https://github.com/Grazulex/contextmark/commit/d4018461449a3df0a8374915ac8d5c618f7dd290))

### Chores

- **release:** bump version to 2.0.0 ([a04c6fc](https://github.com/Grazulex/contextmark/commit/a04c6fc7288d9433ecd42eba63830db63f568ccf))
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
