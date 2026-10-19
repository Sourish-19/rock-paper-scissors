# UI reconstruction — continuation tracker

Continuation of Codex's reconstruction (see `UI_RECONSTRUCTION_PLAN.md`). Repository files are the source of truth. Final summary: `UI_RECONSTRUCTION_REPORT.md`.

**Current state (2026-10-17):** all 67 references implemented and screenshot-compared. TypeScript and ESLint pass with no errors or warnings. Web/Android/iOS bundles export. The only open blocker is outside the code: **Cloud Firestore is disabled in the Firebase project**, so live online play can't run anywhere until the project owner enables it.

## How validation is done (for the next agent)

- Dev server: `node node_modules/expo/bin/cli start --web --port 8081 --offline`. **Do not set `CI=1`**: it turns off Metro's file watcher, which is why Codex's server kept serving a stale bundle.
- Browser: Chrome with remote debugging on :9222. Its profile lives in `.ui-reconstruction/chrome/` (now git-ignored).
- Driver: `scripts/ui_browser.mjs` (`capture <route> <name> [w h]`, `click <aria-label> <name>`, `wait <ms> <name>`, `eval <js> <name>`). It waits for fonts and all images before capturing. In Git Bash set `MSYS_NO_PATHCONV=1`, or routes like `/home` get rewritten into Windows paths.
- Two-player live test: `scripts/ui_multiplayer.mjs`. It's ready but blocked by Firestore (see the report).
- States that need backend data (room lobby, online results, rematch) were rendered by seeding the in-memory store and component state through Metro's dev `__r` module registry and React's hook dispatchers, from DevTools. No product code was changed for this, and nothing was written to Firestore.
- Scoring: mean absolute pixel difference (0–255) between the 393×852 screenshot and the reference resized to 393×852. Asset positions were measured with masked template matching (allowing off-canvas placement) and copied into the code.
- Results: `.ui-reconstruction/audit/final-diffs.json`. Side-by-side comparisons (reference | app | 50% overlay): `.ui-reconstruction/comparisons/`. Screenshots: `.ui-reconstruction/screenshots/` (`f_*` = final regression pass).
- Caveat: a mean difference near 0 means the pixels match. Values of 5–10 usually mean the same composition with different sample data (names, scores) or 1–2px text antialiasing.

## Status

Visual = final mean abs diff (before → after where Claude changed it). ✔ = validated, ◐ = validated with a known, explained difference.

| Screen / state | Codex implementation | Claude changes | Visual validation | Functional validation |
|---|---|---|---|---|
| Loading | Done | Missing foreground cloud added | ✔ 10.2 → 8.2 | ✔ auto-advances to onboarding |
| Onboarding 1–3 | Done | Two missing cloud layers; body copy 8px / 17.5 line height; Skip not underlined | ✔ 5.9 / 8.6 / 8.7 (from 8.4 / 10.8 / 9.6) | ✔ Next / Skip |
| Login | Done | Measured box and label positions; labels drawn above boxes; no divider lines (as designed); link sizes | ✔ 14.1 → 8.2 | ✔ live Firebase: bad credentials → Login Failed dialog; reset → Reset Sent |
| Login dialogs (missing info, invalid password/username, reset sent) | Done | Dialog moved to the measured position (y 303, OK y 477); red error labels; accurate missing-field copy | ✔ 12–15 | ✔ (empty submit, live wrong password, live reset) |
| Login error state | Done | Red labels and boxes on the base layout | ◐ 61.1: the reference is a 40px-shifted layout variant (see report) | ✔ |
| Signup | Done | As login, plus dashed OR divider and 12px footer link | ✔ 17.0 → 11.5 | ✔ live Firebase: short password → Weak Password dialog |
| Signup dialogs (taken / created) | Done | Same dialog fixes | ✔ 12.6 / 13.1 (rendered by state; not triggered live) | ◐ not triggered live (would need an existing or new real account) |
| Signup error / password too short | Done | Error styling | ◐ 65.9: shifted-layout reference variant | ✔ |
| Gender (none / male / female) | Done | Selected avatar keeps its size and rises 30px; measured crown/stars per gender; missing foreground cloud | ✔ 5.9 / 8.3 / 8.7 (from 9.0 / 18.5 / 19.6) | ✔ select + confirm |
| Home | Done | Correct island asset and position; missing cloud (in front of island); button positions | ✔ 18.0 → 9.8 | ✔ |
| Game mode | Done | Missing cloud; decor and button positions | ✔ 9.9 → 5.0 | ✔ Bo3 / Bo5 routing |
| Settings / variants 3 & 4 | Done | Rows at measured y; 13.5px heavy-outline text; long-name auto-fit; decor offsets | ✔ 16.3 → 7.6; 7.4 / 7.4 | ✔ username edit, avatar toggle, volume |
| Settings edit | Done | Edit state keeps the outlined pixel text with a caret (hidden native input does the typing) | ✔ 13.3 → 7.3 | ✔ saves to the local store (signed out, so the Firebase `updateProfile` path was not exercised) |
| Online duel entry | Done | Decor offsets, 12px label, buttons x=49, dashed divider | ✔ 9.5 → 6.0 | ✔ navigation; ✖ create blocked (Firestore disabled) |
| Join room | Done | Own layout per reference; yellow outlined room-code entry | ✔ 21.6 → 6.6 | ◐ input / validation ✔; join blocked (Firestore) |
| Create room | Done | Measured box / copy / share; COPY/SHARE titles offset right of icons; share icon size | ✔ 7.5 → 6.0 | ✖ blocked (Firestore) |
| Hosted / joined / joining / entering | Done | Stars, button, crown, label and room-code line measured; 1v1 box y | ✔ 8.1 / 8.7 / 3.0 / 3.7 / 3.8 (from 13.6 / 13.6 / 6.4 / 27.9) | ✖ blocked (Firestore) |
| Solo game idle / countdown / reveal | Done | Countdown order 1→2→3→SHOOT (was 3→2→1); white idle SHOOT; real shadow treatment; paper hand x; bottom-up pips; correct button icons; hand preloading; buttons don't fade | ✔ 6.1, 3.3, 3.0, 3.0, 4.9, 10.2 | ✔ full Bo3 → victory → rematch |
| Round result / draw state | Done | Panel y=349 | ✔ 1.9–2.0 / 3.8 | ✔ |
| Pause (sound on/off, both sky variants) | Done | — | ✔ 8.6 / 8.0; ◐ 13.0 / 12.4 (alternate sky) | ✔ resume, sound toggle |
| Quit confirm | Done | Measured box, buttons, decor; returns to the existing Home (`dismissTo`) | ✔ 12.2 → 4.0 | ✔ |
| Restart confirm | Done | Button art failed on web (`&` in file name) → byte-identical original; yellow title tab rebuilt on the art's pixel grid | ✔ 19.9 → 6.1 | ✔ |
| Solo victory / defeat / draw | Done | Per-outcome decor; stadium and character x; score layout (fixed colon column, winner yellow / loser red); SHARE label; foreground cloud | ✔ 7.7 / 8.4 / 6.3 (from 20.9 / 25.9 / 23.6) | ✔ |
| Solo post pages | Done | Buttons at measured (126, 174/266) | ✔ 5.4 / 6.1 / 4.1 | ✔ rematch, home |
| Share (solo) | Done | Inner page transform measured (0.882 at 24.5, 63); no cloud in the shared image; SHARE pill inside the phone; fixed an "Unexpected text node" runtime error | ✔ 46.3 → 17.4 | ◐ pill renders and is tappable; the share sheet itself was not exercised |
| Share (online) | Done | Online-specific inner origin | ◐ 35.8 → 24.1 | — |
| Online victory / post | Done | Shared header; measured players, podiums, crown, balloons; cloud; no Next arrow (auto-advance after 4s) | ✔ 12.0 / 9.7 (from 23.2 / 38.6) | ◐ rendered from seeded state; live match blocked |
| Online defeat / post | Done | As above | ◐ 44.1 / 41.9: the reference shows the local player crowned under DEFEAT; the app renders the real outcome | ◐ seeded |
| Rematch request | Done | Measured panel and buttons; ACCEPT/DENY labels (were missing); design wording | ✔ 23.7 → 13.6 | ◐ seeded; accept/deny need Firestore |
| No internet / Oops | Done | Decor positions | ✔ 3.0 / 2.0 | ✔ retry / home |

## Pixel text treatment (follow-up pass)

- All in-app text goes through `Label` (`src/ui/primitives.tsx`). `src/components/PixelText.tsx` and `RetroButton.tsx` are unused leftovers. The SIGN IN / SIGN UP headings are original artwork (`authentiction_screen/Vector.png`, `sign_up.png`), not text, and already match.
- `Label` draws three layers, back to front: an optional hard offset silhouette (`shadowX` / `shadowY`), a square outline (`outline`), then the fill. All values are reference-canvas px.
  - Web: one text node with a grid of zero-blur CSS `text-shadow`s. That dilates the glyph with square corners, and CSS always paints shadows behind the fill. The label is drawn through its own transparency layer (`opacity: 0.999`) so Chrome can't use coloured LCD antialiasing.
  - Native: the same offset grid drawn as stacked copies, stepped at one font pixel (size/8).
- Values measured from 4× captures against the 4× designs:

  | Text | Size | Outline | Shadow |
  |---|---|---|---|
  | Button titles | 16 | 1.5 | 1.5 / 1.5 |
  | Auth field labels | 16 | 2 | none |
  | SHOOT / countdown | 40 | 3 | 3 / 3 |
  | LOADING | 40 | 2 | 4 / 4 |
  | Result SCORE / STREAK | 20 | 2.5 | 1 / 0.5 |
  | Room code, COPY / SHARE | — | as before | 1.5 / 1.5 |

  Unlisted labels keep a 1.5 px outline with no shadow, which matches the designs checked.
- Placement fixes found on the way:
  - Button title y formula was 2 px high.
  - Home and Mode button text is 16 px (was 15).
  - SHOOT position; countdown digits sit 12 px left of SHOOT.
  - LOADING is 40 px, with a tighter second dot.
  - Result score and colon columns; auth label size and x; "Waiting for player" y.
- Capture at 4× with `node scripts/ui_browser.mjs capture <route> <name> 393 852 4` for pixel-level checks.

**Update (owner request):** the shadow is now the default on every `Label`, offset down-right by the stroke width. Every outline is 1px thicker than the measured value (`STROKE_BOOST` in `primitives.tsx`). Only the auth field labels (USERNAME / EMAIL ID / PASSWORD) opt out with `shadow={false}`. The per-screen shadow values above were removed in favour of this default. To make all text less heavy or heavier, change `STROKE_BOOST`.

## Next actions (if resuming)

1. Enable Cloud Firestore for project `rock-paper-scissors-bolte` (Firebase console → Build → Firestore Database → Create database; rules must allow the `rooms` collection). Then run `node scripts/ui_multiplayer.mjs` for a live two-player pass, and delete the test room it reports.
2. Test on a physical iOS/Android device (keyboard avoidance, safe areas, audio, share sheet).
