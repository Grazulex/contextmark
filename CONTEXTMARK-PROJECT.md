# ContextMark

> Your Claude Code context, versioned and portable.

## Vision

ContextMark est un outil CLI qui centralise, versionne et synchronise tes contextes Claude Code (CLAUDE.md, agents, commands, settings) entre tous tes projets et machines.

**Tagline** : "Stop copying CLAUDE.md. Start composing it."

---

## Le Problème

En tant que dev utilisant Claude Code sur 20+ repos actifs et 2 machines :

```
~/projects/
├── reposentinel/
│   └── CLAUDE.md  ← copié depuis backmark, modifié depuis
├── backmark/
│   └── CLAUDE.md  ← version "originale" mais laquelle ?
├── shipmark/
│   └── CLAUDE.md  ← version obsolète, oublié de mettre à jour
├── envmark/
│   └── CLAUDE.md  ← diverge des autres
├── nouveau-projet/
│   └── ???        ← tout refaire from scratch
└── ... (80+ autres repos)
```

**Les frustrations quotidiennes :**

- À chaque nouveau projet, recréer le contexte from scratch
- Copier-coller entre repos = divergence inévitable
- Mettre à jour une convention = le faire dans 20 repos manuellement
- Deux machines = double maintenance, oublis garantis
- Agents et commands éparpillés, jamais synchronisés
- Aucune modularité : un gros fichier CLAUDE.md monolithique

---

## La Solution ContextMark

### Principes Fondateurs

| Principe | Application |
|----------|-------------|
| **Modulaire** | Blocs de contexte réutilisables et composables |
| **Versionné** | Historique Git de tes conventions |
| **Portable** | Sync entre machines via Git |
| **Zero Lock-in** | Fichiers Markdown standards, pas de format propriétaire |
| **CLI-First** | Interface terminal élégante, zero UI web |

---

## Architecture

### Structure de la bibliothèque centrale

```
~/.contextmark/
├── config.yml                  # Configuration globale
│
├── blocks/                     # Blocs de contexte réutilisables
│   ├── laravel/
│   │   ├── base.md             # Conventions Laravel générales
│   │   ├── api.md              # REST API design
│   │   ├── eloquent.md         # Conventions Eloquent/DB
│   │   └── testing.md          # Pest + conventions tests
│   ├── packages/
│   │   ├── composer.md         # Dev de packages Composer
│   │   └── npm.md              # Dev de packages npm
│   ├── style/
│   │   ├── code.md             # Style de code perso
│   │   ├── git.md              # Conventions commits/branches
│   │   └── docs.md             # Style documentation
│   └── tools/
│       ├── docker.md           # Conventions Docker
│       └── ci.md               # CI/CD guidelines
│
├── profiles/                   # Combinaisons de blocs prédéfinies
│   ├── laravel-package.yml     # Pour tes packages Laravel
│   ├── laravel-saas.yml        # Pour apps SaaS
│   ├── cli-tool.yml            # Pour outils CLI
│   └── default.yml             # Profil par défaut
│
├── agents/                     # Agents réutilisables
│   ├── reviewer.md             # Code review
│   ├── refactor.md             # Refactoring assistant
│   ├── documenter.md           # Documentation generator
│   └── tester.md               # Test writer
│
├── commands/                   # Commands custom
│   ├── fix-style.md
│   ├── generate-tests.md
│   └── update-deps.md
│
└── global/                     # Contexte global (tous les projets)
    ├── CLAUDE.md               # S'applique PARTOUT
    ├── agents/                 # Agents disponibles partout
    │   └── quick-fix.md
    └── commands/               # Commands globales
        └── explain.md
```

### Structure d'un bloc

Fichier `~/.contextmark/blocks/laravel/base.md` :

```markdown
---
name: Laravel Base
description: Conventions Laravel générales
version: 1.3.0
tags: [laravel, php, backend]
---

## Laravel Conventions

### Architecture
- Follow Laravel conventions over custom patterns
- Use Form Requests for validation
- Keep controllers thin, use Actions or Services for business logic

### Eloquent
- Always define $fillable, never use $guarded = []
- Use scopes for reusable query logic
- Prefer Eloquent over raw queries

### Routing
- Use resource routes when possible
- Group routes by feature, not by type
- Always name your routes
```

### Structure d'un profil

Fichier `~/.contextmark/profiles/laravel-package.yml` :

```yaml
name: Laravel Package
description: Profile for developing Laravel/Composer packages

# Blocs à inclure (dans l'ordre)
blocks:
  - laravel/base
  - laravel/testing
  - packages/composer
  - style/code
  - style/git

# Agents à copier dans le projet
agents:
  - reviewer
  - tester

# Commands à copier
commands:
  - fix-style
  - generate-tests

# Overrides spécifiques au profil
settings:
  include_readme: true
  include_changelog: true
```

### Configuration globale

Fichier `~/.contextmark/config.yml` :

```yaml
# Profil par défaut si non spécifié
default_profile: laravel-package

# Sync configuration
sync:
  method: git  # git | none
  remote: git@github.com:jeanmarc/contextmark-library.git
  auto_pull: true  # Pull au démarrage de contextmark
  auto_push: false # Push manuel requis

# Préférences CLI
cli:
  colors: true
  confirm_destructive: true

# Contexte global activé
global:
  enabled: true
  
# Chemins custom (optionnel)
paths:
  library: ~/.contextmark  # Défaut
```

---

## Commandes CLI

### Gestion de la bibliothèque

```bash
# Initialiser la bibliothèque (première utilisation)
$ contextmark init-library
✓ Created ~/.contextmark/
✓ Created default config.yml
✓ Created example blocks and profiles
? Initialize as Git repo? [Y/n] Y
✓ Initialized Git repository

# Lister les blocs disponibles
$ contextmark blocks
┌───────────────────┬─────────────────────────────────┬─────────┐
│ Block             │ Description                     │ Version │
├───────────────────┼─────────────────────────────────┼─────────┤
│ laravel/base      │ Conventions Laravel générales   │ 1.3.0   │
│ laravel/testing   │ Pest + conventions tests        │ 1.1.0   │
│ laravel/api       │ REST API design                 │ 1.0.0   │
│ packages/composer │ Dev de packages Composer        │ 1.2.0   │
│ style/code        │ Style de code perso             │ 2.0.0   │
│ style/git         │ Conventions commits/branches    │ 1.0.0   │
└───────────────────┴─────────────────────────────────┴─────────┘

# Lister les profils
$ contextmark profiles
┌─────────────────┬────────────────────────────────┬────────────┐
│ Profile         │ Description                    │ Blocks     │
├─────────────────┼────────────────────────────────┼────────────┤
│ laravel-package │ For developing Laravel packages│ 5 blocks   │
│ laravel-saas    │ For SaaS applications          │ 6 blocks   │
│ cli-tool        │ For CLI tools                  │ 3 blocks   │
│ default         │ Minimal setup                  │ 2 blocks   │
└─────────────────┴────────────────────────────────┴────────────┘

# Créer un nouveau bloc
$ contextmark block create laravel/queues
✓ Created ~/.contextmark/blocks/laravel/queues.md
Opening in editor...

# Éditer un bloc existant
$ contextmark block edit laravel/base

# Supprimer un bloc
$ contextmark block remove laravel/queues
⚠ This block is used in 2 profiles: laravel-saas, default
Remove anyway? [y/N]
```

### Gestion des profils

```bash
# Créer un profil
$ contextmark profile create api-service
? Select blocks to include:
  ◉ laravel/base
  ◉ laravel/api
  ◯ laravel/testing
  ◉ style/code
✓ Created profile "api-service" with 3 blocks

# Voir le contenu d'un profil
$ contextmark profile show laravel-package

Profile: laravel-package
────────────────────────────────────────
Blocks (5):
  1. laravel/base      v1.3.0
  2. laravel/testing   v1.1.0
  3. packages/composer v1.2.0
  4. style/code        v2.0.0
  5. style/git         v1.0.0

Agents (2):
  - reviewer
  - tester

Commands (2):
  - fix-style
  - generate-tests

# Éditer un profil
$ contextmark profile edit laravel-package
```

### Initialisation de projets

```bash
# Initialiser un nouveau projet avec un profil
$ cd ~/projects/new-package
$ contextmark init
? Select profile: laravel-package
✓ Generated CLAUDE.md (5 blocks merged)
✓ Copied 2 agents to .claude/agents/
✓ Copied 2 commands to .claude/commands/
✓ Created .contextmark.yml (tracking file)

# Initialiser avec profil spécifié
$ contextmark init --profile=laravel-saas

# Initialiser avec blocs custom (sans profil)
$ contextmark init --blocks=laravel/base,style/code

# Preview sans écrire les fichiers
$ contextmark init --profile=laravel-package --dry-run
Would create:
  - CLAUDE.md (5 blocks, ~120 lines)
  - .claude/agents/reviewer.md
  - .claude/agents/tester.md
  - .claude/commands/fix-style.md
  - .claude/commands/generate-tests.md
  - .contextmark.yml
```

### Fichier de tracking projet

Fichier `.contextmark.yml` (généré dans chaque projet) :

```yaml
# Auto-generated by ContextMark - do not edit manually
profile: laravel-package
blocks:
  - name: laravel/base
    version: 1.3.0
    hash: a1b2c3d4
  - name: laravel/testing
    version: 1.1.0
    hash: e5f6g7h8
  - name: packages/composer
    version: 1.2.0
    hash: i9j0k1l2
  - name: style/code
    version: 2.0.0
    hash: m3n4o5p6
  - name: style/git
    version: 1.0.0
    hash: q7r8s9t0
agents:
  - reviewer
  - tester
commands:
  - fix-style
  - generate-tests
generated_at: 2025-01-15T10:30:00Z
```

### Mise à jour des projets

```bash
# Vérifier si le projet est à jour
$ contextmark status
Project: backmark
Profile: laravel-package

┌───────────────────┬─────────┬─────────┬────────┐
│ Block             │ Local   │ Library │ Status │
├───────────────────┼─────────┼─────────┼────────┤
│ laravel/base      │ 1.3.0   │ 1.4.0   │ ⚠ outdated │
│ laravel/testing   │ 1.1.0   │ 1.1.0   │ ✓ current  │
│ packages/composer │ 1.2.0   │ 1.2.0   │ ✓ current  │
│ style/code        │ 2.0.0   │ 2.1.0   │ ⚠ outdated │
│ style/git         │ 1.0.0   │ 1.0.0   │ ✓ current  │
└───────────────────┴─────────┴─────────┴────────┘

2 blocks need updating. Run `contextmark update` to apply.

# Mettre à jour le projet
$ contextmark update
Updating CLAUDE.md...
  ⟳ laravel/base: 1.3.0 → 1.4.0
  ⟳ style/code: 2.0.0 → 2.1.0
✓ CLAUDE.md updated

# Mettre à jour avec preview des changements
$ contextmark update --diff
Changes in laravel/base (1.3.0 → 1.4.0):
  + Added section on Laravel 12 conventions
  ~ Modified Eloquent best practices

Apply changes? [Y/n]

# Mettre à jour tous les projets connus
$ contextmark update --all
Scanning projects...
Found 23 projects with .contextmark.yml

┌─────────────────┬─────────┬───────────────┐
│ Project         │ Profile │ Status        │
├─────────────────┼─────────┼───────────────┤
│ backmark        │ laravel │ 2 outdated    │
│ shipmark        │ laravel │ 2 outdated    │
│ envmark         │ laravel │ ✓ current     │
│ reposentinel    │ saas    │ 3 outdated    │
│ ...             │ ...     │ ...           │
└─────────────────┴─────────┴───────────────┘

Update all? [Y/n]
```

### Ajout/retrait de blocs dans un projet

```bash
# Ajouter un bloc à un projet existant
$ contextmark add laravel/api
✓ Added block "laravel/api" to CLAUDE.md
✓ Updated .contextmark.yml

# Retirer un bloc
$ contextmark remove laravel/api
✓ Removed block "laravel/api" from CLAUDE.md
✓ Updated .contextmark.yml

# Ajouter un agent
$ contextmark add-agent documenter
✓ Copied documenter.md to .claude/agents/

# Ajouter une command
$ contextmark add-command update-deps
✓ Copied update-deps.md to .claude/commands/
```

### Contexte global

```bash
# Éditer le contexte global
$ contextmark global edit
Opening ~/.contextmark/global/CLAUDE.md...

# Voir le contexte global
$ contextmark global show

Global Context
────────────────────────────────────────
CLAUDE.md: 45 lines
Agents: 1 (quick-fix)
Commands: 1 (explain)

This context applies to ALL projects.

# Ajouter un agent global
$ contextmark global add-agent quick-fix

# Désactiver temporairement le global pour un projet
$ contextmark init --no-global
```

### Synchronisation entre machines

```bash
# Pousser les changements vers le remote
$ contextmark sync push
Pushing to git@github.com:jeanmarc/contextmark-library.git...
✓ 3 commits pushed

# Récupérer les changements
$ contextmark sync pull
Pulling from remote...
✓ Updated 2 blocks
✓ Added 1 new profile

# Status de la sync
$ contextmark sync status
Local:  3 commits ahead, 0 behind
Remote: git@github.com:jeanmarc/contextmark-library.git

# Configurer le remote (première fois)
$ contextmark sync setup git@github.com:jeanmarc/contextmark-library.git
✓ Remote configured
✓ Initial push completed
```

### Agents & Commands

```bash
# Lister les agents disponibles
$ contextmark agents
┌─────────────┬─────────────────────────────────┬────────┐
│ Agent       │ Description                     │ Scope  │
├─────────────┼─────────────────────────────────┼────────┤
│ reviewer    │ Code review assistant           │ library│
│ refactor    │ Refactoring helper              │ library│
│ documenter  │ Documentation generator         │ library│
│ tester      │ Test writer                     │ library│
│ quick-fix   │ Quick fixes and hotfixes        │ global │
└─────────────┴─────────────────────────────────┴────────┘

# Créer un nouvel agent
$ contextmark agent create debugger
✓ Created ~/.contextmark/agents/debugger.md
Opening in editor...

# Lister les commands
$ contextmark commands
┌───────────────┬─────────────────────────────────┐
│ Command       │ Description                     │
├───────────────┼─────────────────────────────────┤
│ fix-style     │ Fix code style issues           │
│ generate-tests│ Generate tests for file         │
│ update-deps   │ Update dependencies             │
│ explain       │ Explain code (global)           │
└───────────────┴─────────────────────────────────┘
```

---

## Workflow Typique

### Nouveau projet

```bash
# 1. Créer le projet
$ mkdir ~/projects/new-saas && cd ~/projects/new-saas
$ laravel new . --pest

# 2. Initialiser le contexte Claude Code
$ contextmark init --profile=laravel-saas
✓ Generated CLAUDE.md
✓ Copied agents and commands
✓ Ready for Claude Code!

# 3. Commencer à coder avec Claude Code
$ claude
```

### Maintenance quotidienne

```bash
# Sur PC1 : Tu modifies un bloc
$ contextmark block edit laravel/base
# ... édition ...
$ contextmark sync push

# Sur PC2 : Tu récupères les changements
$ contextmark sync pull
$ contextmark update --all  # Met à jour tous tes projets
```

### Évolution d'un projet

```bash
# Le projet évolue, tu as besoin d'un nouveau bloc
$ cd ~/projects/my-saas
$ contextmark add laravel/queues
$ contextmark add-agent worker-expert
```

---

## Structure générée dans un projet

Après `contextmark init --profile=laravel-package` :

```
my-project/
├── CLAUDE.md              # Contexte généré (blocs fusionnés)
├── .contextmark.yml       # Tracking (profile, versions, hashes)
└── .claude/
    ├── agents/
    │   ├── reviewer.md
    │   └── tester.md
    ├── commands/
    │   ├── fix-style.md
    │   └── generate-tests.md
    └── settings.json      # Si défini dans le profil
```

### Contenu du CLAUDE.md généré

```markdown
<!-- Generated by ContextMark - Profile: laravel-package -->
<!-- Do not edit manually. Use `contextmark update` to refresh. -->
<!-- Blocks: laravel/base@1.3.0, laravel/testing@1.1.0, packages/composer@1.2.0, style/code@2.0.0, style/git@1.0.0 -->

# Project Context

## Laravel Conventions

[Contenu de laravel/base.md]

---

## Testing Conventions

[Contenu de laravel/testing.md]

---

## Package Development

[Contenu de packages/composer.md]

---

## Code Style

[Contenu de style/code.md]

---

## Git Conventions

[Contenu de style/git.md]
```

---

## Roadmap

### v0.1.0 — Foundation (2 semaines)

- [ ] Structure CLI avec Symfony Console ou Laravel Zero
- [ ] Commande `init-library` — créer ~/.contextmark
- [ ] Commande `blocks` — lister les blocs
- [ ] Commande `block create/edit` — gérer les blocs
- [ ] Commande `profiles` — lister les profils
- [ ] Commande `init` — initialiser un projet
- [ ] Génération du CLAUDE.md depuis profil
- [ ] Fichier .contextmark.yml de tracking

### v0.2.0 — Updates & Sync (1.5 semaines)

- [ ] Commande `status` — vérifier si projet à jour
- [ ] Commande `update` — mettre à jour un projet
- [ ] Commande `update --all` — tous les projets
- [ ] Versioning des blocs (semver dans frontmatter)
- [ ] Hash de contenu pour détection de changements
- [ ] Commande `sync push/pull` — synchronisation Git

### v0.3.0 — Agents & Commands (1 semaine)

- [ ] Commande `agents` — lister les agents
- [ ] Commande `agent create` — créer un agent
- [ ] Commande `add-agent` — ajouter à un projet
- [ ] Idem pour commands
- [ ] Copie des agents/commands lors de `init`

### v0.4.0 — Global Context (1 semaine)

- [ ] Structure ~/.contextmark/global/
- [ ] Commande `global edit/show`
- [ ] Merge du global dans le CLAUDE.md généré
- [ ] Option `--no-global` pour init
- [ ] Agents et commands globaux

### v0.5.0 — Polish & DX (1 semaine)

- [ ] Commande `add/remove` — blocs individuels
- [ ] Commande `diff` — voir les changements avant update
- [ ] Autocomplétion bash/zsh
- [ ] Colored output et spinners
- [ ] Messages d'erreur clairs

### v1.0.0 — Production Ready (1 semaine)

- [ ] Documentation complète
- [ ] Tests unitaires et d'intégration
- [ ] Installation via Composer global ou binaire
- [ ] README avec GIFs de démo
- [ ] Publication

---

## Stack Technique

### Option A : Laravel Zero (recommandé)

```bash
# Installation
composer global require jeanmarc/contextmark

# Ou via Phive/PHAR
phive install contextmark
```

**Avantages :**
- Écosystème que tu maîtrises
- Prompts, file system, process intégrés
- Tests avec Pest

### Option B : Go

**Avantages :**
- Binaire unique, pas de dépendance PHP
- Distribution simplifiée

**Inconvénient :**
- Courbe d'apprentissage

### Recommandation

Laravel Zero. Tu restes dans ton écosystème, tu codes vite, et la distribution via Composer global est simple pour les devs PHP/Laravel (ta cible).

---

## Différenciation

| Aspect | Copier-coller | Dotfiles | ContextMark |
|--------|---------------|----------|-------------|
| Modularité | ✗ | ✗ | ✓ Blocs composables |
| Versioning | ✗ | ✓ | ✓ Avec tracking par projet |
| Sync machines | ✗ | ✓ | ✓ Intégré |
| Mise à jour projets | ✗ Manuelle | ✗ | ✓ `update --all` |
| Spécifique Claude Code | N/A | ✗ | ✓ |
| Profils réutilisables | ✗ | ✗ | ✓ |
| Agents/Commands | ✗ | ✗ | ✓ |

---

## Estimation Effort

| Phase | Durée | Heures estimées |
|-------|-------|-----------------|
| v0.1.0 Foundation | 2 semaines | 15-20h |
| v0.2.0 Updates & Sync | 1.5 semaines | 12-15h |
| v0.3.0 Agents & Commands | 1 semaine | 8-10h |
| v0.4.0 Global Context | 1 semaine | 8-10h |
| v0.5.0 Polish | 1 semaine | 6-8h |
| v1.0.0 Release | 1 semaine | 5-8h |
| **Total** | **~8 semaines** | **~55-70h** |

---

## Risques & Mitigations

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Claude Code change son format | Moyenne | Abstraction interne, adaptation facile |
| Marché trop niche | Moyenne | Accepté — tu es ton propre user #1 |
| Sync conflicts | Faible | Git gère ça, docs claires |
| Adoption lente | Moyenne | Contenu marketing ciblé Claude Code users |

---

## Prochaines Actions

1. [ ] Créer le repo `jeanmarc/contextmark`
2. [ ] Setup Laravel Zero
3. [ ] Implémenter `init-library` et structure de base
4. [ ] Implémenter `blocks` et `block create`
5. [ ] Implémenter `init` avec génération CLAUDE.md
6. [ ] Tester sur tes propres repos
7. [ ] Itérer basé sur ton usage réel

---

## Évolutions Futures (Post v1.0)

- **Templates de blocs** : Blocs communautaires (laravel-official, spatie-style, etc.)
- **Import/Export** : Partager des profils entre devs
- **Multi-tools** : Support Cursor, Copilot, Windsurf (v2.0 éventuellement)
- **GUI optionnelle** : TUI avec navigation (si demandée)
- **Marketplace** : Partage de blocs/profils entre la communauté

---

*Document créé le : 2025-01-XX*
*Auteur : Jean-Marc*
*Statut : Draft v1*
