# Ambient Romance Events

Conclusion: spontaneous confession or approach scenes should reuse the existing `romance` scene presentation and add branching `choices`, instead of inventing a separate event renderer.

## Purpose

- Turn high appearance into visible in-world payoff during normal actions.
- Let places like the library, campus, downtown, and workplaces produce surprise romance scenes.
- Keep future events scalable through one registry and one resolver.

## Core Flow

1. The player enters or finishes an action with an ambient trigger such as `study-academic-prep`.
2. `tryStartAmbientRomanceEvent(triggerId, context, targetState)` scans a small event registry.
3. The resolver filters by appearance, location, time band, current romance/contact state, and cooldown.
4. If one event wins, the game switches to `state.scene = "romance"` using a special `romanceScene` payload.
5. `renderRomanceScene()` shows the player and NPC together with a dedicated background.
6. If `romanceScene.choices` exists, the scene renders branching buttons instead of only a single finish button.
7. The selected outcome applies contact unlocks, romance progression, memories, headline text, and optional follow-up plans.

## Recommended Runtime Shape

```js
{
  id: "library-student-confession",
  triggerId: "study-academic-prep",
  npcId: "girlfriend-student",
  contactId: "girlfriendStudent",
  locationId: "library",
  transitionLocationId: "library-corridor",
  sceneType: "ambient-confession",
  appearanceLevelMin: 2,
  chanceByAppearanceLevel: { 2: 0.06, 3: 0.14, 4: 0.24 },
  oncePerContact: true,
  gates: {
    timeBands: ["day", "evening"],
    blockedIfContactKnown: true,
    blockedIfDating: true,
  },
  backgroundConfig: DAY01_WORLD_LIBRARY_CORRIDOR_BACKGROUND,
  introLines: [
    "도서관에서 나오려는 순간 여학생이 조심스럽게 길을 막아선다.",
    "\"잠깐 시간 괜찮으세요? 꼭 하고 싶은 말이 있어요.\"",
  ],
  choices: [
    { label: "잠깐 이야기한다", outcome: "accept-talk" },
    { label: "오늘은 공부가 먼저다", outcome: "soft-decline" },
    { label: "연락처부터 묻는다", outcome: "ask-contact" },
  ],
}
```

## State

- Add `state.ambientRomance`
- Keep:
  - `seenEventIds`
  - `cooldownUntilDayByNpcId`
  - `lastTriggerId`
  - `activeEventId`
- Extend `state.romanceScene` with:
  - `choices`
  - `sceneOutcomeType`
  - `returnLocationId`
  - `sourceTriggerId`

## Why Romance Scene

- `dialogue` reuses the current outside background and is weaker for staged confession scenes.
- `incident` supports choices, but it does not naturally fit romance presentation and follow-up contact state.
- `romance` already renders player + NPC + custom background, so it is the closest reusable fit.

## Current Status

- Implemented now:
  - `girlfriend-student` NPC and romance contact config are registered.
  - `girlfriend-student` art is exported to `assets/characters/npc/girlfriend-student/default.png`.
  - `AMBIENT_ROMANCE_EVENTS` now contains:
    - `library-student-confession`
    - `library-student-reappearance`
    - `campus-park-bench-talk`
    - `mcdonalds-counter-line-talk`
  - `tryStartAmbientRomanceEvent()` resolves trigger, gates, cooldown, and chance.
  - `renderRomanceScene()` now supports branching `choices` for ambient romance scenes.
  - `renderRomanceCallScene()` now supports branching `choices` for ambient follow-up phone calls.
  - `state.ambientRomance` and extended `romanceScene` payloads survive save/load.
  - `study-academic-prep`, `study-campus-network`, and `buy-mcdonalds-coffee` are live triggers.
  - The first library confession now continues into a follow-up call branch:
    - `잠깐 더 통화한다`
    - `수업 끝나고 보기`
    - `천천히 알아가자`
- Not implemented yet:
  - downtown-specific ambient romance event variant
  - unique follow-up call variants for the campus park and mcdonalds contacts
  - follow-up scenes after the first actual `수업 끝나고 보기` date resolves

## First Event

- Event id: `library-student-confession`
- Trigger: `도서관에서 공부하기`
- Gate:
  - appearance level 2+
  - no unlocked contact for this route yet
  - not already dating through this route
  - fires after the study action resolves in the library
- Visual:
  - background: `assets/backgrounds/day01/library-corridor.jpg`
  - source art: `assets/_incoming/characters/npc/romance/girlfriend-student-source.png`
  - runtime target after export: `assets/characters/npc/girlfriend-student/default.png`
- Outcomes:
  - `잠깐 이야기한다` -> confession succeeds, contact unlocks, next romance route opens
  - `오늘은 공부가 먼저다` -> soft decline, no unlock, future retry allowed after cooldown
  - `연락처부터 묻는다` -> fast contact unlock with a cooler tone

## Risks

- If ambient events fire too often, they will feel spammy rather than special.
- If they bypass the existing social/contact logic, romance state will split into two systems.
- If the event runs before the base action resolves, players may feel their chosen action was stolen.

## Recommended Next Steps

1. Export the `girlfriend-student` runtime art out of `_incoming`.
2. Add a downtown-specific event so each major hub has a visibly different romance beat.
3. Add per-event cooldown and frequency tuning after live playtesting.
4. Expand follow-up branches from `수업 끝나고 보기` into a dedicated scene/result set.
5. Reuse the same schema for campus, downtown, and workplace surprise events.
