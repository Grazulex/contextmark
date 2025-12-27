---
id: 3
title: Implement ContextMark v0.2.0 Updates & Sync
status: Done
priority: high
assignees:
  - '@claude'
labels:
  - feature
  - v0.2.0
subtasks: []
dependencies: []
blocked_by: []
created_date: '2025-12-27T14:53:34.807Z'
updated_date: '2025-12-27T14:59:29.108Z'
closed_date: '2025-12-27T14:59:29.108Z'
changelog:
  - timestamp: '2025-12-27T14:53:34.807Z'
    action: created
    details: Task created
    user: system
  - timestamp: '2025-12-27T14:53:53.194Z'
    action: updated
    details: 'status: To Do → In Progress'
    user: user
  - timestamp: '2025-12-27T14:53:53.889Z'
    action: modified
    details: Task updated
    user: AI
  - timestamp: '2025-12-27T14:58:12.039Z'
    action: modified
    details: Task updated
    user: AI
  - timestamp: '2025-12-27T14:59:29.108Z'
    action: updated
    details: 'status: In Progress → Done'
    user: user
acceptance_criteria: []
ai_plan: >-
  ## Plan d'implémentation v0.2.0 Updates & Sync


  ### Objectif

  Ajouter les commandes de mise à jour et de synchronisation Git pour
  ContextMark.


  ### Nouvelles commandes


  #### 1. contextmark update

  Met à jour le CLAUDE.md du projet courant avec les dernières versions des
  blocs.

  - Lit .contextmark.yml pour le profil actuel

  - Compare les hashes des blocs

  - Régénère CLAUDE.md avec les blocs mis à jour

  - Met à jour .contextmark.yml


  #### 2. contextmark update --all

  Met à jour tous les projets connus.

  - Scanne les répertoires pour trouver les .contextmark.yml

  - Affiche un tableau récapitulatif

  - Met à jour chaque projet


  #### 3. contextmark sync push

  Pousse les changements de la bibliothèque vers le remote Git.

  - Commit les changements dans ~/.contextmark

  - Push vers le remote configuré


  #### 4. contextmark sync pull

  Récupère les changements depuis le remote Git.

  - Pull depuis le remote

  - Affiche les changements


  #### 5. contextmark sync status

  Affiche l'état de synchronisation.


  ### Fichiers à créer

  - src/commands/update.ts

  - src/commands/sync/index.ts

  - src/commands/sync/push.ts

  - src/commands/sync/pull.ts

  - src/commands/sync/status.ts

  - src/core/sync.ts (logique Git)


  ### Fichiers à modifier

  - src/cli.ts (ajouter les nouvelles commandes)

  - src/core/generator.ts (fonction regenerate)

  - src/lib/config.ts (gestion du remote)


  ### Dépendances

  - Aucune nouvelle dépendance (utilise simple-git via child_process)


  ### Approche technique

  - Utiliser child_process pour les commandes Git

  - Stocker les projets connus dans ~/.contextmark/projects.yml

  - Auto-découverte des projets via find


  ### Tests

  - update: modifier un bloc, vérifier que CLAUDE.md est mis à jour

  - sync: vérifier push/pull fonctionnent
ai_notes: >
  **2025-12-27T14:58:12.039Z** - **16:00** - PROGRESS: v0.2.0 implémentée -
  update, update --all, sync push/pull/status/setup
---
Implement update command, update --all, and sync push/pull for Git synchronization
