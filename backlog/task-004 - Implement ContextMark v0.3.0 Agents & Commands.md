---
id: 4
title: Implement ContextMark v0.3.0 Agents & Commands
status: In Progress
priority: high
assignees:
  - '@claude'
labels:
  - feature
  - v0.3.0
subtasks: []
dependencies: []
blocked_by: []
created_date: '2025-12-27T15:01:49.253Z'
updated_date: '2025-12-27T15:02:04.632Z'
changelog:
  - timestamp: '2025-12-27T15:01:49.253Z'
    action: created
    details: Task created
    user: system
  - timestamp: '2025-12-27T15:02:03.941Z'
    action: updated
    details: 'status: To Do → In Progress'
    user: user
  - timestamp: '2025-12-27T15:02:04.632Z'
    action: modified
    details: Task updated
    user: AI
acceptance_criteria: []
ai_plan: |-
  ## Plan v0.3.0 Agents & Commands

  ### Objectif
  Gérer les agents et commands Claude Code réutilisables dans la bibliothèque.

  ### Nouvelles commandes

  #### Agents
  - contextmark agents : lister les agents disponibles
  - contextmark agent create <name> : créer un agent
  - contextmark agent show <name> : afficher un agent
  - contextmark agent edit <name> : éditer un agent
  - contextmark agent remove <name> : supprimer un agent
  - contextmark add-agent <name> : ajouter un agent au projet

  #### Commands
  - contextmark commands : lister les commands
  - contextmark command create <name> : créer une command
  - contextmark command show <name> : afficher une command
  - contextmark command edit <name> : éditer une command
  - contextmark command remove <name> : supprimer une command
  - contextmark add-command <name> : ajouter une command au projet

  ### Fichiers à créer
  - src/core/agent.ts
  - src/core/command.ts
  - src/commands/agents.ts
  - src/commands/agent/index.ts, create.ts, show.ts, edit.ts, remove.ts
  - src/commands/commands.ts
  - src/commands/command/index.ts, create.ts, show.ts, edit.ts, remove.ts
  - src/commands/add-agent.ts
  - src/commands/add-command.ts

  ### Fichiers à modifier
  - src/cli.ts (nouvelles commandes)
  - src/commands/init.ts (copier agents/commands du profil)
  - src/core/generator.ts (tracking agents/commands)

  ### Structure des agents/commands
  ~/.contextmark/agents/<name>.md
  ~/.contextmark/commands/<name>.md

  Avec frontmatter:
  ---
  name: Agent Name
  description: Description
  ---
---
Implement agents and commands management: copy during init, add-agent, add-command, list agents/commands
