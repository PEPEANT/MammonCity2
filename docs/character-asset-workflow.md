# Character Asset Workflow

Conclusion: runtime character art now lives under `assets/characters/player` and `assets/characters/npc/<npc-id>`, while raw sources stay under `assets/_incoming/characters/...`.

## Purpose

- Keep runtime art paths stable.
- Keep raw source art out of the project root.
- Separate current in-game NPCs from future romance candidate art.

## Canonical Folders

- `assets/characters/player/`
  Final in-game player PNGs only.
- `assets/characters/npc/<npc-id>/`
  Final in-game NPC PNGs only.
- `assets/_incoming/characters/player/`
  Raw player source art only.
- `assets/_incoming/characters/npc/romance/`
  Raw female/romance candidate NPC source art and pose variants.

## Current Runtime Rules

- Game code should point only at `assets/characters/...`.
- NPC runtime paths should use `assets/characters/npc/<npc-id>/<variant>.png`.
- Raw source files can be renamed or regrouped freely inside `_incoming` as long as runtime files stay unchanged.

## Current Romance Source Set

- `assets/_incoming/characters/npc/romance/convenience-cashier-default-source.png`
- `assets/_incoming/characters/npc/romance/convenience-cashier-post-surgery-source.png`
- `assets/_incoming/characters/npc/romance/high-school-girl-source.png`
- `assets/_incoming/characters/npc/romance/npc-woman-source.png`
- `assets/_incoming/characters/npc/romance/girlfriend-default-source.png`
- `assets/_incoming/characters/npc/romance/girlfriend-post-surgery-source.png`
- `assets/_incoming/characters/npc/romance/girlfriend-student-source.png`

## Current Runtime NPC Set

- `assets/characters/npc/alley-aunt/default.png`
- `assets/characters/npc/alley-office-worker/default.png`
- `assets/characters/npc/casino-guide/default.png`
- `assets/characters/npc/casino-homeless/default.png`
- `assets/characters/npc/convenience-cashier/default.png`
- `assets/characters/npc/convenience-cashier/post-surgery.png`
- `assets/characters/npc/high-school-girl/default.png`
- `assets/characters/npc/npc-woman/default.png`

## Rules

- Do not keep raw character PNGs in the project root.
- Do not point game code at `_incoming` files.
- Do not mix future girlfriend candidate art into live NPC folders before the role is decided.
- When a raw source becomes a live NPC, create or update its runtime folder under `assets/characters/npc/<npc-id>/`.

## Recommended Next Step

- Implement a single NPC presentation resolver that maps `npcId + variant` to the new runtime folder layout before adding more romance NPCs.
