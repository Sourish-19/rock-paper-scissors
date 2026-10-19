# UI reconstruction — completion report

Date: 2026-10-17 · Expo SDK 56 · React Native 0.85 · reference canvas 393×852

**Outcome.** All 67 reference designs are implemented and were compared screenshot-by-screenshot against the running app. 47 references score ≤10 mean absolute pixel difference (out of 255), 14 score 10–20, and 6 score higher. Every one of those six has an identified cause: design-file inconsistencies or one small residual layout offset (see §5). TypeScript and ESLint are clean. Web, Android and iOS bundles export.

**Blocker outside the code:** Cloud Firestore is disabled in the Firebase project `rock-paper-scissors-bolte`. The REST API answers *"Cloud Firestore API has not been used in project … or it is disabled"*. Creating or joining online rooms therefore fails on every platform and routes to the Oops screen. Enabling Firestore in the Firebase console is required before online play can work or be tested live.

## 1. Work inherited from Codex

- A 67-reference design map, an asset inventory and measurements (`UI_RECONSTRUCTION_PLAN.md`, `.ui-reconstruction/audit/`).
- A shared fixed-canvas layer (`src/ui/primitives.tsx`: `GameCanvas`, `Art`, `Label`, `ArtButton`, dialogs) and a typed artwork registry (`src/ui/artwork.ts`).
- Every screen rebuilt on that layer: auth, gender, home, mode, settings, solo game with pause/quit/restart, online lobby and game, solo and online results, rematch, share, no-internet and oops (`src/ui/*.tsx`). Route files in `app/` now only re-export these.
- Store additions for online results (`src/store/gameStore.ts`), a Firestore transaction helper (`src/ui/online.ts`) and a rewritten `MusicProvider` on `expo-audio`.
- The previous screens (about 5,000 lines) were replaced by about 1,000 lines in `src/ui/`. The old versions remain in git history (`HEAD`).

When Claude took over, types passed, lint had 2 problems, and only one screenshot existed.

## 2. Work completed by Claude

**Build and tooling**
- Fixed the remaining lint problems (in Codex's screenshot script). ESLint now reports 0 errors and 0 warnings.
- Found why Codex's dev server served stale code: it ran with `CI=1`, which turns off Metro's file watcher. Restarted it in watch mode.
- Made the screenshot driver wait for all images before capturing.
- Added `scripts/ui_multiplayer.mjs`, a two-tab live online-duel test that is ready once Firestore is enabled.
- Ignored the 255 MB Chrome profile (`.ui-reconstruction/chrome/`) in `.gitignore`.

**Bugs fixed**
- Restart dialog buttons were invisible on web. The file name `cancel_button_exit_screen_&_restart_screen.png` contains `&`, which breaks the asset URL. The dialog now uses `game_mode_screen/button.png`, a byte-identical original.
- The share page threw a React Native Web "Unexpected text node" error (`{message && …}` with an empty string).
- The countdown ran 3→2→1. The designs specify a white idle "SHOOT", then 1→2→3, then a yellow "SHOOT". Fixed for solo and online.
- Hands flashed blank while reveal artwork loaded. Hand art is now preloaded.
- The rematch dialog's ACCEPT/DENY buttons had no labels.
- Quitting or choosing HOME used `router.replace('/home')`, which stacked a second Home on top of Game mode. It now uses `router.dismissTo('/home')`.
- Removed two React Native Web deprecation warnings (`pointerEvents` prop, `tintColor` style).
- The login "missing info" artwork's baked text asks for username + password, but login needs email + password. The dialog now states the fields each form actually requires.

**Visual corrections** (all positions were measured from the references by template matching, then re-verified)
- Added foreground cloud layers that were missing on 9 screen families: onboarding, gender, home, loading, game mode, and solo/online victory and defeat.
- Gameplay:
  - Shadows now match the supplied shadow art: black at 65%, offset 22–30px horizontally. Codex had used a 30% copy of the hand.
  - The player's score pips stack bottom-up at 36px spacing.
  - The move buttons use the correct tilted icons.
  - Move buttons no longer fade during the countdown.
- Results:
  - Decorations are placed per outcome.
  - Score rows use a fixed colon column, with the winning score yellow and the losing score red, as in the designs.
  - The SHARE pill has its label.
  - Post-page buttons are at the designed positions.
  - Online pages have no Next arrow, as in the design; they advance to rematch/home after 4 s.
- Positions and type corrected on auth, settings (including the edit state), lobby (all 6 states), dialogs, pause/quit/restart, share (inner page scale and origin), no-internet and oops.
- The restart dialog's yellow title tab (no asset was supplied) is rebuilt on the artwork's 4.75px pixel grid.

## 3. Screens completed

All 67 references are implemented and screenshot-compared. Per-screen detail is in `UI_RECONSTRUCTION_PROGRESS.md`, and per-reference scores are in the plan's status column and `.ui-reconstruction/audit/final-diffs.json`.

## 4. Screens still incomplete

None are missing. Three areas are only partly verified:
- **Online play end-to-end** (create, join, play, rematch). The UI for every state was rendered from seeded data and compared, but no live match was played (Firestore is disabled).
- **Signup "username taken" / "account created"**. These were rendered from state, not triggered live, because that would require an existing account or creating a real one.
- **Native devices.** Nothing was run on iOS or Android hardware.

## 5. Visual comparison results

Method: Expo web at 393×852, real app routes. States that need backend data were produced by seeding the in-memory store and component state from DevTools; no product code was added for this and nothing was written to Firestore. Each screenshot was compared with its reference as reference | app | 50% overlay, with a mean absolute difference score. Comparisons are in `.ui-reconstruction/comparisons/`.

| Range | Count | Notes |
|---|---|---|
| ≤ 5 | 15 | Gameplay states, dialogs, offline/oops, mode, joining/entering |
| 5–10 | 32 | Remaining differences come from sample data (names, scores) and text antialiasing |
| 10–20 | 14 | Auth pages and dialogs (sample input text, cursor glyphs), alternate pause sky, share frame, online victory/rematch |
| > 20 | 6 | See below |

The six highest scores:
- **LOG-IN / SIGN-UP "ERROR STATE" and "Password Too Short" (61–66).** These references draw the form on a variant layout shifted about 40px down with no OR row. Copying it would make the page jump whenever a validation error appears, so the app keeps the base layout and applies the designed error styling (red labels and red boxes).
- **Online "Defeat Page" and its post page (42–44).** The design shows the *local* player crowned, on the winner's podium, with a 3:2 score, under a DEFEAT title. The app renders the real result, so the loser gets the clown hat and balloons.
- **Online share (24).** After correcting the inner origin, a small layout difference inside the phone mock remains.

## 6. Functional test results (Expo web)

| Flow | Result |
|---|---|
| Loading → onboarding (Next/Skip) → login | ✔ |
| Email sign-in, wrong credentials (live Firebase Auth) | ✔ Login Failed dialog; fields marked |
| Password reset (live) | ✔ Reset Sent dialog |
| Sign-up with a too-short password (live) | ✔ Weak Password dialog |
| Empty-field submit (login and signup) | ✔ missing-info dialog with accurate copy; red fields |
| Gender selection → home | ✔ |
| Home → mode → solo best-of-3 → result → Next → REMATCH / HOME | ✔ scores and streak update; rematch resets the score |
| Pause → resume / restart / quit (back to existing Home) | ✔ |
| Settings: edit username, toggle avatar, volume ± | ✔ local store updates (signed out, so the Firebase profile update wasn't exercised) |
| Online create / join / play / rematch | ✖ blocked by Firestore. The lobby correctly routes to Oops on failure. |
| Share sheet | Not exercised |
| Google sign-in | Not tested (no provider configuration or test account) |
| Responsive sizes 360×740, 412×915, 430×932, 1024×768 | ✔ canvas scales uniformly and letterboxes; no errors |

## 7. TypeScript results

`tsc --noEmit`: 0 errors.

## 8. ESLint results

`eslint .` (Expo flat config): 0 errors, 0 warnings. One deliberate, commented suppression remains in `MusicProvider` (`react-hooks/immutability`). Setting `player.loop` / `player.volume` is the documented expo-audio v56 API, and `AudioPlayerOptions` has no equivalent option.

## 9. Runtime issues

- No runtime exceptions were recorded in any captured state.
- `expo export` succeeds for web (all routes statically rendered), Android and iOS.
- Online rooms fail because Firestore is disabled (see the top of this report).
- On native, React Native logs a deprecation warning when **COPY** is pressed in the lobby, because `Clipboard` is imported from `react-native`. It still works.

## 10. Remaining limitations

- No live online match was played (Firestore). No native-device testing.
- The SOUND setting has no audible effect: the project has no sound effects, and only music volume is wired. This predates the reconstruction.
- Pre-existing game logic: drawn rounds use up a round, so a best-of-3 can end 1:0 after three rounds. The draw dialog's wording ("one more round, first to score wins") implies otherwise.
- Deliberate deviations from the designs:
  - Error states keep the base layout.
  - Online defeat shows the real winner.
  - The share page keeps a back button and puts the SHARE pill inside the phone (as in the online share design) rather than adding an undesigned button.
  - Online results auto-advance after 4 s instead of showing an undesigned Next arrow.
- The room code is the backend's real 6-digit code; the designs show a 10-character sample.

## 11. Files modified by Claude

- `src/ui/primitives.tsx`, `src/ui/AuthScreens.tsx`, `src/ui/MenuScreens.tsx`, `src/ui/GameScreens.tsx`, `src/ui/ResultScreens.tsx`, `src/ui/OnlineLobbyScreen.tsx`, `src/ui/FeedbackScreens.tsx`
- `scripts/ui_browser.mjs` (lint fixes, image-ready waits); `scripts/ui_multiplayer.mjs` (new)
- `.gitignore` (Chrome profile)
- `UI_RECONSTRUCTION_PLAN.md` (status column and current state), `UI_RECONSTRUCTION_PROGRESS.md` (new), `UI_RECONSTRUCTION_REPORT.md` (new)
- `.ui-reconstruction/screenshots/`, `.ui-reconstruction/comparisons/`, `.ui-reconstruction/audit/final-diffs.json` (validation artifacts)

No dependency changes. No files in `Game UI/` or `assets/` were modified. Nothing was committed.

## 12. Recommended next steps

1. **Enable Cloud Firestore** for `rock-paper-scissors-bolte` (Firebase console → Firestore Database → Create database) with rules that allow the `rooms` collection. Then run `node scripts/ui_multiplayer.mjs` for a live two-player pass and delete the test room it prints.
2. Run the app on an iOS and an Android device: keyboard avoidance on auth/join, safe areas, audio, share sheet.
3. Decide on the design inconsistencies in §5 (error-state layout, online defeat composition) with the designer.
4. Consider `expo-clipboard` instead of the deprecated `Clipboard`, and fix the drawn-round rule if draws shouldn't use up a round.
5. Review and commit the work; the working tree also contains Codex's earlier uncommitted changes.
