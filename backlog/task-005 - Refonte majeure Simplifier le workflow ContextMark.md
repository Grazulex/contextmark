---
id: 5
title: 'Refonte majeure: Simplifier le workflow ContextMark'
status: In Progress
priority: critical
assignees:
  - '@claude'
labels:
  - refactoring
  - v2.0.0
subtasks: []
dependencies: []
blocked_by: []
created_date: '2025-12-28T10:57:22.745Z'
updated_date: '2025-12-28T11:09:57.474Z'
changelog:
  - timestamp: '2025-12-28T10:57:22.745Z'
    action: created
    details: Task created
    user: system
  - timestamp: '2025-12-28T10:57:46.878Z'
    action: modified
    details: Task updated
    user: AI
  - timestamp: '2025-12-28T10:58:01.186Z'
    action: modified
    details: Task updated
    user: user
  - timestamp: '2025-12-28T10:58:01.868Z'
    action: modified
    details: Task updated
    user: user
  - timestamp: '2025-12-28T10:58:02.551Z'
    action: modified
    details: Task updated
    user: user
  - timestamp: '2025-12-28T10:58:03.852Z'
    action: modified
    details: Task updated
    user: user
  - timestamp: '2025-12-28T10:58:04.551Z'
    action: modified
    details: Task updated
    user: user
  - timestamp: '2025-12-28T10:58:05.233Z'
    action: modified
    details: Task updated
    user: user
  - timestamp: '2025-12-28T10:58:05.945Z'
    action: modified
    details: Task updated
    user: user
  - timestamp: '2025-12-28T10:58:06.605Z'
    action: modified
    details: Task updated
    user: user
  - timestamp: '2025-12-28T10:58:07.299Z'
    action: modified
    details: Task updated
    user: user
  - timestamp: '2025-12-28T10:58:14.209Z'
    action: modified
    details: Task updated
    user: user
  - timestamp: '2025-12-28T10:58:15.001Z'
    action: updated
    details: 'status: To Do → In Progress'
    user: user
  - timestamp: '2025-12-28T10:58:40.767Z'
    action: modified
    details: Task updated
    user: AI
  - timestamp: '2025-12-28T11:09:57.474Z'
    action: modified
    details: Task updated
    user: AI
acceptance_criteria:
  - text: contextmark push copie le CLAUDE.md local vers la library
    checked: false
  - text: contextmark pull copie depuis la library vers le local
    checked: false
  - text: contextmark diff affiche les différences local vs library
    checked: false
  - text: contextmark init sans --profile copie la config existante
    checked: false
  - text: contextmark init --profile utilise un profil (comportement legacy)
    checked: false
  - text: Détection et warning en cas de conflit (fichiers différents)
    checked: false
  - text: Structure projects/ dans ~/.contextmark/
    checked: false
  - text: npm run build réussit sans erreur
    checked: false
  - text: npm run check réussit sans erreur
    checked: false
  - text: Flag global fonctionne pour push/pull/diff sur ~/.claude/
    checked: false
ai_plan: >-
  ## Plan d'implémentation


  ### Objectif

  Refactoriser ContextMark pour passer d'un workflow "composition de blocs"
  complexe à un workflow "push/pull de configs existantes" simple, comme
  EnvMark. Les blocs et profils deviennent des features avancées optionnelles.


  ### Changements de paradigme

  1. **Avant**: On crée des blocs → on compose des profils → on génère CLAUDE.md

  2. **Après**: On prend la config existante → on push/pull → optionnellement on
  utilise des profils


  ### Étapes


  #### Phase 1: Nouvelles commandes de base

  1. Implémenter `contextmark push` - Copie CLAUDE.md local → library

  2. Implémenter `contextmark pull` - Copie library → CLAUDE.md local

  3. Implémenter `contextmark diff` - Compare local vs library

  4. Modifier `contextmark status` - Afficher l'état de sync (pas juste les
  blocs)

  5. Ajouter le flag `--global` pour gérer ~/.claude/


  #### Phase 2: Refactorer init

  1. `contextmark init` sans --profile → copie la config existante

  2. `contextmark init --profile <name>` → utilise un profil (comportement
  actuel)

  3. Gérer le cas où CLAUDE.md n'existe pas encore


  #### Phase 3: Structure de la library

  1. Ajouter ~/.contextmark/projects/ pour stocker les configs projet

  2. Modifier ~/.contextmark/global/ pour copier tout ~/.claude/ (rules, skills,
  etc.)

  3. Garder ~/.contextmark/blocks/ et profiles/ pour le mode avancé


  #### Phase 4: Améliorer sync

  1. Garder sync push/pull pour le remote Git

  2. Ajouter sync status amélioré


  #### Phase 5: Nettoyage

  1. Mettre à jour la documentation CLI (--help)

  2. Nettoyer le code legacy si nécessaire

  3. Tests


  ### Fichiers concernés


  #### Nouveaux fichiers

  - src/commands/push.ts (new)

  - src/commands/pull.ts (new)

  - src/commands/diff.ts (new)

  - src/core/project-sync.ts (new) - logique push/pull


  #### Fichiers à modifier

  - src/cli.ts - Ajouter les nouvelles commandes

  - src/commands/init.ts - Nouveau comportement par défaut

  - src/commands/status.ts - Afficher sync status

  - src/core/library.ts - Nouvelle structure (projects/)

  - src/lib/paths.ts - Nouveaux chemins

  - src/types/config.ts - Nouveaux types si besoin


  ### Approche technique


  1. **Push/Pull simples**: Copie de fichiers avec détection de conflits

  2. **Diff**: Comparaison textuelle avec affichage coloré

  3. **--global**: Copie récursive de ~/.claude/ vers lib/global/

  4. **Rétrocompatibilité**: Les projets avec .contextmark.yml existants
  continuent de fonctionner

  5. **Détection de projet**: Nom déduit du dossier ou
  package.json/composer.json


  ### Risques et mitigations

  - **Breaking change**: Documenter clairement la migration

  - **Conflits**: Toujours demander confirmation avant d'écraser

  - **Backups**: Créer un .backup avant pull/push destructif
ai_notes: >
  **2025-12-28T10:58:40.767Z** - **11:59** - PROGRESS: Analyse du code existant
  terminée. Structure comprise. Début de l'implémentation.

  **2025-12-28T11:09:57.474Z** - **12:12** - PROGRESS: Toutes les commandes
  implémentées et testées. push/pull/diff fonctionnent pour projets et global.
  Build OK, check OK, tests manuels OK.
---
Refactoriser ContextMark pour adopter un workflow simple push/pull comme EnvMark, tout en gardant les blocs/profils comme feature avancée optionnelle.
