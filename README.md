<div align="center">

<img src="assets/logo.png" alt="ContextMark Logo" width="120" height="120">

# ContextMark

### Your Claude Code Context, Versioned and Portable
**Stop copying CLAUDE.md. Start syncing it.**

[![npm version](https://img.shields.io/npm/v/@grazulex/contextmark.svg?style=flat-square&logo=npm&color=cb3837)](https://www.npmjs.com/package/@grazulex/contextmark)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Documentation](https://img.shields.io/badge/📚-Documentation-8B5CF6?style=flat-square)](https://contextmark.tech)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**Synchronize your Claude Code contexts (CLAUDE.md, rules, skills) across all your projects and machines - like EnvMark for your AI contexts.**

[Quick Start](#-quick-start) • [Documentation](https://contextmark.tech) • [Why ContextMark?](#-why-contextmark)

</div>

---

## 🚀 The Problem

Managing Claude Code contexts across 20+ repositories and 2 machines:

```
~/projects/
├── reposentinel/
│   └── CLAUDE.md  ← copied from backmark, modified since
├── backmark/
│   └── CLAUDE.md  ← "original" version but which one?
├── shipmark/
│   └── CLAUDE.md  ← outdated, forgot to update
├── new-project/
│   └── ???        ← start from scratch again
└── ~/.claude/
    ├── CLAUDE.md  ← global config, only on this machine
    └── rules/     ← lost if machine dies
```

**Daily frustrations:**
- Global config (`~/.claude/`) only exists on this machine
- Copy-paste between repos = inevitable divergence
- Two machines = double maintenance, guaranteed drift
- No backup of your carefully crafted Claude instructions

---

## ⚡ Quick Start

```bash
# Install globally
npm install -g @grazulex/contextmark

# Initialize your context library
contextmark init-library

# Save your global Claude config to the library
contextmark push --global

# Register and save a project
cd ~/projects/my-project
contextmark init
contextmark push

# Sync to Git remote (backup + cross-machine sync)
contextmark sync setup git@github.com:user/claude-configs.git
contextmark sync push
```

**On another machine:**
```bash
contextmark init-library
contextmark sync setup git@github.com:user/claude-configs.git
contextmark sync pull
contextmark pull --global   # Restore your global config
```

**→ [Complete Getting Started Guide](https://contextmark.tech/getting-started.html)**

---

## ✨ Why ContextMark?

<table>
<tr>
<td width="50%">

### 🔄 Simple Push/Pull
Like EnvMark for your Claude configs:
- `push` saves to library
- `pull` restores from library
- `diff` shows changes

</td>
<td width="50%">

### 🌐 Cross-Machine Sync
Git-based synchronization keeps your library in sync across all your development machines.

</td>
</tr>
<tr>
<td>

### 📁 Complete Backup
Back up everything:
- `~/.claude/CLAUDE.md`
- `~/.claude/rules/*`
- `~/.claude/skills/*`
- Per-project configs

</td>
<td>

### 📝 Zero Lock-in
Standard Markdown and YAML files. No proprietary formats. Your context will be readable forever.

</td>
</tr>
</table>

---

## 🛠 Commands

### Simple Mode (Recommended)

```bash
# Global config (~/.claude/)
contextmark push --global       # Save to library
contextmark pull --global       # Restore from library
contextmark diff --global       # Compare

# Per-project config
cd ~/projects/my-project
contextmark init                # Register project
contextmark push                # Save to library
contextmark pull                # Restore from library
contextmark diff                # Compare
contextmark status              # Check sync status

# Sync with Git remote
contextmark sync setup <url>    # Configure remote
contextmark sync push           # Push to remote
contextmark sync pull           # Pull from remote
contextmark sync status         # Check remote status
```

### Advanced Mode (Optional)

For power users managing 50+ projects with shared conventions:

```bash
# Create reusable blocks
contextmark block create laravel/base
contextmark blocks

# Create profiles (combinations of blocks)
contextmark profile create my-stack
contextmark profiles

# Initialize project with profile (generates CLAUDE.md)
contextmark init --profile my-stack
contextmark status              # Check for block updates
contextmark update              # Update from blocks
```

---

## 📁 Library Structure

```
~/.contextmark/
├── config.yml              # Global configuration
├── global/                 # Your ~/.claude/ backup
│   ├── CLAUDE.md
│   ├── rules/
│   │   ├── backmark.md
│   │   └── git-commits.md
│   └── skills/
│       └── backmark/
├── projects/               # Per-project configs
│   ├── my-app/
│   │   └── CLAUDE.md
│   └── another-project/
│       └── CLAUDE.md
├── blocks/                 # [Advanced] Reusable blocks
├── profiles/               # [Advanced] Block combinations
├── agents/                 # [Advanced] Reusable agents
└── commands/               # [Advanced] Custom commands
```

---

## 🔧 Configuration

### Global Config (`~/.contextmark/config.yml`)

```yaml
default_profile: default

sync:
  method: git
  remote: git@github.com:user/claude-configs.git
  auto_pull: true
  auto_push: false

cli:
  colors: true
  confirm_destructive: true

global:
  enabled: true
```

### Project Config (`.contextmark.yml`)

```yaml
project: my-project
profile: null              # null = simple mode, or profile name
blocks: []
generated_at: 2025-01-15T10:30:00Z
last_push: 2025-01-15T10:35:00Z
```

---

## 🌟 Part of the Mark Ecosystem

| Tool | Purpose |
|------|---------|
| [**Backmark**](https://backmark.tech) | AI-powered task management |
| [**Stackmark**](https://stackmark.tech) | Docker environment management |
| [**Shipmark**](https://shipmark.tech) | Release and versioning automation |
| [**EnvMark**](https://envmark.tech) | Environment variable management |
| [**ContextMark**](https://contextmark.tech) | Claude Code context management |

---

## 📄 License

MIT © [Jean-Marc Strauven](https://github.com/Grazulex)

---

<div align="center">

**[Documentation](https://contextmark.tech)** • **[Report Bug](https://github.com/Grazulex/contextmark/issues)** • **[Request Feature](https://github.com/Grazulex/contextmark/issues)**

Made with 💜 for the Claude Code community

</div>
