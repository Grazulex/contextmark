# Changelog

All notable changes to this project will be documented in this file.

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
