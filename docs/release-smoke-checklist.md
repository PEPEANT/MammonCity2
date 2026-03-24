# Release Smoke Checklist

Conclusion: before release, verify that `new game -> save/load -> shift loop -> ending -> ranking fallback` stays playable without softlocks.

## Purpose

- Catch run-killing bugs first.
- Re-verify save/load, shift flow, ending flow, and ranking fallback after stabilization work.
- Keep console errors at `0`, and confirm that ranking failures do not stop the game.

## Automated Check

Run this first:

```bash
npm run qa:core-smoke
```

This script currently checks:

- JS parse sanity for core runtime files
- `unusedLegacy*` removal
- single `showRankingScreen()` definition
- save-scene sanitizer presence
- `[hidden]` fallback for the title UI
- hidden default state for `continue-button` and `spd-start-btn`

## Manual Pass

### 1. First boot

- Open `index.html` in a clean browser profile or clean origin.
- Confirm the title screen renders normally.
- Confirm console shows no errors or warnings.
- Confirm `continue` stays hidden until a real save exists.

### 2. New game start

- Start a fresh run.
- Confirm spoon selection, spawn scene, and first room scene all load without overlap or broken UI.
- Confirm the current objective is visible as soon as the run starts.
- Confirm dirt-spoon and silver-spoon start actors are visibly larger in their start scenes.

### 3. Room save/load

- Save from the room with no extra interaction.
- Reload.
- Confirm day, time, room scene, phone state, and objective text all restore correctly.

### 4. Outside save/load

- Move outside.
- Open the phone, then open `jobs` or `bank`.
- Save and reload.
- Confirm outside location, route-safe scene, phone state, and objective text restore correctly.

### 5. Input lock / button feel

- Rapidly tap a normal UI button three times.
- Confirm there is no repeated `input lock` warning spam for normal debounce hits.
- Confirm real blocking still works during `moving`, `event`, `dialogue`, `minigame`, and `phone focus` states.

### 6. Phone layout

- Open and close the phone from both room and outside scenes.
- Confirm collapsed phone controls stay anchored to the bottom-right corner.
- Open bank from the app grid and confirm the phone auto-expands into the simplified bank home.
- Confirm phone focus dims the background and blocks map click-through.

### 7. NPC visibility and wander

- At a home-front scene, confirm only one visible NPC is shown by default.
- At a major hub scene, confirm the default crowd does not overfill and obvious duplicates are absent.
- Use `돌아다니기` multiple times and confirm one focus NPC is shown after wander, with rotation when possible.
- Click visible NPCs directly and confirm approach/dialogue works.

### 8. Shift loop

- Create or load a McDonald's-capable shift state.
- Confirm inquiry is rejected outside inquiry hours.
- Confirm customer kiosk works outside shift time.
- Confirm shift start appears only during the assigned shift window.
- Confirm the minigame starts, ends, and returns the player to a safe scene.

### 9. Economy clarity

- Confirm HUD separates cash and bank balance.
- Open trading and confirm quantity, average entry, pnl, liquidation price, and status are visible.
- Confirm liquidation shows an explicit warning instead of a silent disappearance.

### 10. Plastic surgery flow

- Move to Baegeum Hospital and open the consultation room.
- Confirm both `자연형` and `또렷형` choices are shown with price and target appearance level.
- Confirm insufficient funds leaves the player in consultation with a clear failure headline.
- Confirm successful surgery runs through consultation -> procedure -> recovery -> mirror -> hospital lobby return.
- Save during the surgery scene, reload, and confirm the event scene resumes instead of dropping the player into a broken fallback state.

### 11. Ending and ranking fallback

- Progress to ending or load an ending-adjacent save.
- Save just before ending, reload, and confirm recovery goes to `ending`.
- Confirm ranking failure still leaves the ending screen playable.
- Confirm restart-to-title still works after ranking failure.

## Release Gate

Release should stay blocked if any of these remain:

- console error or warning tied to gameplay flow
- save/load sends the player back into a broken transient scene
- phone controls jump to the wrong corner
- repeated button presses trigger visible lock spam
- major locations fail NPC visibility or NPC click interaction
- McDonald's shift flow mixes inquiry, customer, and work states again
- plastic surgery mid-save drops staged progress or loses day-end resolution
- ranking failure blocks ending completion

## Recommended Order

1. `npm run qa:core-smoke`
2. fresh new game
3. room save/load
4. outside + phone save/load
5. input lock + phone layout checks
6. NPC visibility + wander checks
7. McDonald's shift loop
8. economy visibility checks
9. plastic surgery flow
10. ending + ranking fallback
