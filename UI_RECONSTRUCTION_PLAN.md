# UI reconstruction plan

Updated: 2026-10-17. Source of truth: all 67 files in `Game UI/`, visually inspected in nine labeled contact sheets. All 306 PNG artwork files were visually inspected in 24 labeled sheets; transparency, dimensions, content bounds and SHA-256 recorded for all 310 assets in `.ui-reconstruction/audit/inventory.json`. Original images remain immutable.

## Reference coordinates and implementation rules

Use a 393×852 logical canvas. References are either 393×852 or 1572×3408 (4×). Uniformly fit and center the canvas inside available safe-area bounds; never stretch artwork independently. Layer the original Sky/grass, transparent illustration parts, functional controls, dynamic text and modal dimmers in that order. Web uses crisp pixel image rendering and a centered portrait canvas. Maintain aspect ratios using asset metadata. Native safe-area and keyboard adjustments protect controls.

Measurement helper `scripts/ui_measure.py` locates original assets against normalized reference exports; results in `.ui-reconstruction/audit/measurements.json` supplement the visual review. Contact sheets are inspection artifacts only, never used as application screens.

## Design-to-implementation map

| Reference design | Matching assets | App route / state | Required work | Status |
|---|---|---|---|---|
| DEFEAT PAGE - SOLO CHALLENGE.png (1572×3408) | `assets/defeat_screen_solo_match/Sky.png`; `assets/defeat_screen_solo_match/defeat.png`; `assets/defeat_screen_solo_match/score_streak_box.png`; `assets/defeat_screen_solo_match/share_button.png`; full group below | /game/defeat (result/post-result) | Distinct red DEFEAT header; actual score and zero streak; crying avatar on stone podium with clown hat and three balloons. Separate result/post-result controls. | Implemented; screenshot-validated (diff 8.4) |
| DEFEAT PAGE.png (393×852) | `assets/defeat_screen_solo_match/Sky.png`; `assets/defeat_screen_solo_match/defeat.png`; `assets/defeat_screen_solo_match/score_streak_box.png`; `assets/defeat_screen_solo_match/share_button.png`; full group below | /game/defeat (result/post-result) | Distinct red DEFEAT header; actual score and zero streak; crying avatar on stone podium with clown hat and three balloons. Separate result/post-result controls. | Implemented; screenshot-validated (diff 9.2) |
| DRAW PAGE.png (1572×3408) | `assets/draw_screen_solo_match/Sky.png`; `assets/draw_screen_solo_match/draw.png`; `assets/draw_screen_solo_match/score_streak_box.png`; `assets/draw_screen_solo_match/share_button.png`; full group below | /game/draw (result/post-result) | Gray DRAW title, actual score and retained streak; sad avatar/stone podium, no crown, hat or balloons; separate result/post-result controls. | Implemented; screenshot-validated (diff 6.3) |
| Game Mode.png (1572×3408) | `assets/game_mode_screen/Sky.png`; `assets/game_mode_screen/select_game_mode.png`; `assets/game_mode_screen/Stone.png`; `assets/game_mode_screen/Paper.png`; full group below | /game-mode | Centered select-game-mode artwork around y230; two compact buttons around y450/540. Preserve best-of-three/five and selected mode. | Implemented; screenshot-validated (diff 5.0) |
| Game page - Draw State.png (1572×3408) | `assets/game_screen/grass_Background.png`; `assets/game_screen/HOLD STATE BLUE HANDS BLOCK.png`; `assets/game_screen/HOLD STATE REDHANDS BLOCK.png`; `assets/game_screen/PAPER BLUE HAND BLOCKS.png`; full group below | /game or /game/multiplayer (round phase) | Full grass canvas; large opposed red/blue hand layers at top/bottom; side score pips and player names, settings upper-right; bottom three move buttons. Center 3/2/1/SHOOT and dimmed round dialogs. Preserve rules and cancel timers on exit/pause. | Implemented; screenshot-validated (diff 3.8) |
| Game page - Round Result.png (1572×3408) | `assets/game_screen/grass_Background.png`; `assets/game_screen/HOLD STATE BLUE HANDS BLOCK.png`; `assets/game_screen/HOLD STATE REDHANDS BLOCK.png`; `assets/game_screen/PAPER BLUE HAND BLOCKS.png`; full group below | /game or /game/multiplayer (round phase) | Full grass canvas; large opposed red/blue hand layers at top/bottom; side score pips and player names, settings upper-right; bottom three move buttons. Center 3/2/1/SHOOT and dimmed round dialogs. Preserve rules and cancel timers on exit/pause. | Implemented; screenshot-validated (diff 2.0) |
| Game page-1.png (393×852) | `assets/game_screen/grass_Background.png`; `assets/game_screen/HOLD STATE BLUE HANDS BLOCK.png`; `assets/game_screen/HOLD STATE REDHANDS BLOCK.png`; `assets/game_screen/PAPER BLUE HAND BLOCKS.png`; full group below | /game or /game/multiplayer (round phase) | Full grass canvas; large opposed red/blue hand layers at top/bottom; side score pips and player names, settings upper-right; bottom three move buttons. Center 3/2/1/SHOOT and dimmed round dialogs. Preserve rules and cancel timers on exit/pause. | Implemented; screenshot-validated (diff 1.9) |
| Game page.png (1572×3408) | `assets/game_screen/grass_Background.png`; `assets/game_screen/HOLD STATE BLUE HANDS BLOCK.png`; `assets/game_screen/HOLD STATE REDHANDS BLOCK.png`; `assets/game_screen/PAPER BLUE HAND BLOCKS.png`; full group below | /game or /game/multiplayer (round phase) | Full grass canvas; large opposed red/blue hand layers at top/bottom; side score pips and player names, settings upper-right; bottom three move buttons. Center 3/2/1/SHOOT and dimmed round dialogs. Preserve rules and cancel timers on exit/pause. | Implemented; screenshot-validated (diff 10.2) |
| Gender Section - Female.png (1572×3408) | `assets/gender_screen/Sky.png`; `assets/gender_screen/select_ur_gender.png`; `assets/gender_screen/guy_on_the_tower.png`; `assets/gender_screen/girl_on_the_tower.png`; full group below | /gender (selection state) | Title near (40,110); two tower characters in lower half; selectable male/female raised tower with crown/stars; next at (320,26). Save selection to profile. | Implemented; screenshot-validated (diff 8.7) |
| Gender Section - Male.png (1572×3408) | `assets/gender_screen/Sky.png`; `assets/gender_screen/select_ur_gender.png`; `assets/gender_screen/guy_on_the_tower.png`; `assets/gender_screen/girl_on_the_tower.png`; full group below | /gender (selection state) | Title near (40,110); two tower characters in lower half; selectable male/female raised tower with crown/stars; next at (320,26). Save selection to profile. | Implemented; screenshot-validated (diff 8.3) |
| Gender Section.png (1572×3408) | `assets/gender_screen/Sky.png`; `assets/gender_screen/select_ur_gender.png`; `assets/gender_screen/guy_on_the_tower.png`; `assets/gender_screen/girl_on_the_tower.png`; full group below | /gender (selection state) | Title near (40,110); two tower characters in lower half; selectable male/female raised tower with crown/stars; next at (320,26). Save selection to profile. | Implemented; screenshot-validated (diff 5.9) |
| Home Screen.png (1572×3408) | `assets/home_screen/Sky.png`; `assets/home_screen/logo.png`; `assets/home_screen/profile_holder.png`; `assets/home_screen/male_profile_pic.png`; full group below | /home | Profile (27,26), settings (320,26), logo at upper third, large island/character lower-middle; SOLO CHALLENGE and ONLINE DUEL original buttons. Actual profile and mode navigation. | Implemented; screenshot-validated (diff 9.8) |
| Loading Screen.png (1572×3408) | `assets/loading_screen/Sky.png`; `assets/loading_screen/Stone.png`; `assets/loading_screen/Paper.png`; `assets/loading_screen/Scissors.png`; full group below | /loading | 393×852 sky; LOADING at y386, three animated move sprites at y455. Fixed transition to onboarding; no invented progress bar. | Implemented; screenshot-validated (diff 8.2) |
| LOG-IN PAGE - Empty Fields.png (1572×3408) | `assets/authentiction_screen/Sky.png`; `assets/authentiction_screen/Vector.png`; `assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png`; `assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png`; full group below | /login (form/dialog state) | SIGN IN art with move decorations; username/email/password at y240/348/456; custom buttons y567/699; error fields and dimmed dialogs. Preserve email/password auth and implement password reset. Google remains explicitly unavailable without provider setup. | Implemented; screenshot-validated (diff 14.7) |
| LOG-IN PAGE - ERROR STATE.png (1572×3408) | `assets/authentiction_screen/Sky.png`; `assets/authentiction_screen/Vector.png`; `assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png`; `assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png`; full group below | /login (form/dialog state) | SIGN IN art with move decorations; username/email/password at y240/348/456; custom buttons y567/699; error fields and dimmed dialogs. Preserve email/password auth and implement password reset. Google remains explicitly unavailable without provider setup. | Implemented; screenshot-validated (diff 61.1) — reference uses a 40px-shifted layout variant; error styling applied on the base layout |
| LOG-IN PAGE - Invalid password..png (1572×3408) | `assets/authentiction_screen/Sky.png`; `assets/authentiction_screen/Vector.png`; `assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png`; `assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png`; full group below | /login (form/dialog state) | SIGN IN art with move decorations; username/email/password at y240/348/456; custom buttons y567/699; error fields and dimmed dialogs. Preserve email/password auth and implement password reset. Google remains explicitly unavailable without provider setup. | Implemented; screenshot-validated (diff 12.0) |
| LOG-IN PAGE - Password Reset Sent.png (1572×3408) | `assets/authentiction_screen/Sky.png`; `assets/authentiction_screen/Vector.png`; `assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png`; `assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png`; full group below | /login (form/dialog state) | SIGN IN art with move decorations; username/email/password at y240/348/456; custom buttons y567/699; error fields and dimmed dialogs. Preserve email/password auth and implement password reset. Google remains explicitly unavailable without provider setup. | Implemented; screenshot-validated (diff 12.1) |
| LOG-IN PAGE.png (1572×3408) | `assets/authentiction_screen/Sky.png`; `assets/authentiction_screen/Vector.png`; `assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png`; `assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png`; full group below | /login (form/dialog state) | SIGN IN art with move decorations; username/email/password at y240/348/456; custom buttons y567/699; error fields and dimmed dialogs. Preserve email/password auth and implement password reset. Google remains explicitly unavailable without provider setup. | Implemented; screenshot-validated (diff 8.2) |
| LOGIN-IN PAGE - Invalid username..png (1572×3408) | `assets/authentiction_screen/Sky.png`; `assets/authentiction_screen/Vector.png`; `assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png`; `assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png`; full group below | /login (form/dialog state) | SIGN IN art with move decorations; username/email/password at y240/348/456; custom buttons y567/699; error fields and dimmed dialogs. Preserve email/password auth and implement password reset. Google remains explicitly unavailable without provider setup. | Implemented; screenshot-validated (diff 12.2) |
| No Internet Screen.png (1572×3408) | `assets/No_Internet_Screen/Sky.png`; `assets/No_Internet_Screen/no_wifi_icon.png`; `assets/No_Internet_Screen/no_internet.png`; `assets/No_Internet_Screen/retry_home_button.png`; full group below | /no-internet | No-WiFi icon near y180; supplied dialog y335, Retry/Home y500/590. Retry actual failed operation/navigation after connectivity check. | Implemented; screenshot-validated (diff 3.0) |
| Onboarding Screen 1.png (1572×3408) | `assets/onboarding_screen/Sky.png`; `assets/onboarding_screen/Exclude.png`; `assets/onboarding_screen/floating_island_1.png`; `assets/onboarding_screen/floating_island_2.png`; full group below | /onboarding (slide state) | White circular sky cutout; island y350–473, illustration/thought y150–380, dots y493, title y533 and explanatory copy y598; next at (320,780); slide-specific illustrations and skip. | Implemented; screenshot-validated (diff 5.9) |
| Onboarding Screen 2.png (1572×3408) | `assets/onboarding_screen/Sky.png`; `assets/onboarding_screen/Exclude.png`; `assets/onboarding_screen/floating_island_1.png`; `assets/onboarding_screen/floating_island_2.png`; full group below | /onboarding (slide state) | White circular sky cutout; island y350–473, illustration/thought y150–380, dots y493, title y533 and explanatory copy y598; next at (320,780); slide-specific illustrations and skip. | Implemented; screenshot-validated (diff 8.6) |
| Onboarding Screen 3.png (1572×3408) | `assets/onboarding_screen/Sky.png`; `assets/onboarding_screen/Exclude.png`; `assets/onboarding_screen/floating_island_1.png`; `assets/onboarding_screen/floating_island_2.png`; full group below | /onboarding (slide state) | White circular sky cutout; island y350–473, illustration/thought y150–380, dots y493, title y533 and explanatory copy y598; next at (320,780); slide-specific illustrations and skip. | Implemented; screenshot-validated (diff 8.7) |
| Online Duel - Create Room.png (1572×3408) | `assets/online_duel_screen/Sky.png`; `assets/online_duel_screen/online_duel_vector.png`; `assets/online_duel_screen/create_room_button.png`; `assets/online_duel_screen/roin_room_button.png`; full group below | /online-lobby (entry/create/join/ready/transition) | Entry title y240 and create/join; create room-code/copy/share; join form and busy dialog; ready banner y125, two real player cards y375, host start/joiner leave y650; entering-match overlay. Keep real Firestore subscription. | Implemented; screenshot-validated (diff 6.0) |
| Online Duel - Defeat Page-1.png (1572×3408) | `assets/victory_defeat_draw_screen_online_duel_match/Sky.png`; `assets/victory_defeat_draw_screen_online_duel_match/victory.png`; `assets/victory_defeat_draw_screen_online_duel_match/defeat.png`; `assets/victory_defeat_draw_screen_online_duel_match/draw.png`; full group below | /game/online-result (outcome/post/rematch state) | Two named actual opponents on distinct gold/stone podiums; winner crown/stars and loser hat/balloons; actual scores. Post-result rematch/home; live request/accept/deny overlay. Fix host-role capture and score handoff; do not simulate room data. | Implemented; screenshot-validated (diff 41.9) — reference draws the local player as the winner under DEFEAT; app renders the real outcome |
| Online Duel - Defeat Page.png (1572×3408) | `assets/victory_defeat_draw_screen_online_duel_match/Sky.png`; `assets/victory_defeat_draw_screen_online_duel_match/victory.png`; `assets/victory_defeat_draw_screen_online_duel_match/defeat.png`; `assets/victory_defeat_draw_screen_online_duel_match/draw.png`; full group below | /game/online-result (outcome/post/rematch state) | Two named actual opponents on distinct gold/stone podiums; winner crown/stars and loser hat/balloons; actual scores. Post-result rematch/home; live request/accept/deny overlay. Fix host-role capture and score handoff; do not simulate room data. | Implemented; screenshot-validated (diff 44.1) — reference draws the local player as the winner under DEFEAT; app renders the real outcome |
| Online Duel - Entering a match.png (1572×3408) | `assets/online_duel_screen/Sky.png`; `assets/online_duel_screen/online_duel_vector.png`; `assets/online_duel_screen/create_room_button.png`; `assets/online_duel_screen/roin_room_button.png`; full group below | /online-lobby (entry/create/join/ready/transition) | Entry title y240 and create/join; create room-code/copy/share; join form and busy dialog; ready banner y125, two real player cards y375, host start/joiner leave y650; entering-match overlay. Keep real Firestore subscription. | Implemented; screenshot-validated (diff 3.7) |
| Online Duel - Hosted a Room.png (1572×3408) | `assets/online_duel_screen/Sky.png`; `assets/online_duel_screen/online_duel_vector.png`; `assets/online_duel_screen/create_room_button.png`; `assets/online_duel_screen/roin_room_button.png`; full group below | /online-lobby (entry/create/join/ready/transition) | Entry title y240 and create/join; create room-code/copy/share; join form and busy dialog; ready banner y125, two real player cards y375, host start/joiner leave y650; entering-match overlay. Keep real Firestore subscription. | Implemented; screenshot-validated (diff 8.1) |
| Online Duel - Join Room.png (1572×3408) | `assets/online_duel_screen/Sky.png`; `assets/online_duel_screen/online_duel_vector.png`; `assets/online_duel_screen/create_room_button.png`; `assets/online_duel_screen/roin_room_button.png`; full group below | /online-lobby (entry/create/join/ready/transition) | Entry title y240 and create/join; create room-code/copy/share; join form and busy dialog; ready banner y125, two real player cards y375, host start/joiner leave y650; entering-match overlay. Keep real Firestore subscription. | Implemented; screenshot-validated (diff 6.6) |
| Online Duel - Joined a Room-1.png (1572×3408) | `assets/online_duel_screen/Sky.png`; `assets/online_duel_screen/online_duel_vector.png`; `assets/online_duel_screen/create_room_button.png`; `assets/online_duel_screen/roin_room_button.png`; full group below | /online-lobby (entry/create/join/ready/transition) | Entry title y240 and create/join; create room-code/copy/share; join form and busy dialog; ready banner y125, two real player cards y375, host start/joiner leave y650; entering-match overlay. Keep real Firestore subscription. | Implemented; screenshot-validated (diff 3.8) |
| Online Duel - Joined a Room.png (1572×3408) | `assets/online_duel_screen/Sky.png`; `assets/online_duel_screen/online_duel_vector.png`; `assets/online_duel_screen/create_room_button.png`; `assets/online_duel_screen/roin_room_button.png`; full group below | /online-lobby (entry/create/join/ready/transition) | Entry title y240 and create/join; create room-code/copy/share; join form and busy dialog; ready banner y125, two real player cards y375, host start/joiner leave y650; entering-match overlay. Keep real Firestore subscription. | Implemented; screenshot-validated (diff 8.7) |
| Online Duel - Joining Room.png (1572×3408) | `assets/online_duel_screen/Sky.png`; `assets/online_duel_screen/online_duel_vector.png`; `assets/online_duel_screen/create_room_button.png`; `assets/online_duel_screen/roin_room_button.png`; full group below | /online-lobby (entry/create/join/ready/transition) | Entry title y240 and create/join; create room-code/copy/share; join form and busy dialog; ready banner y125, two real player cards y375, host start/joiner leave y650; entering-match overlay. Keep real Firestore subscription. | Implemented; screenshot-validated (diff 3.0) |
| Online Duel - Post Victory Page.png (1572×3408) | `assets/victory_defeat_draw_screen_online_duel_match/Sky.png`; `assets/victory_defeat_draw_screen_online_duel_match/victory.png`; `assets/victory_defeat_draw_screen_online_duel_match/defeat.png`; `assets/victory_defeat_draw_screen_online_duel_match/draw.png`; full group below | /game/online-result (outcome/post/rematch state) | Two named actual opponents on distinct gold/stone podiums; winner crown/stars and loser hat/balloons; actual scores. Post-result rematch/home; live request/accept/deny overlay. Fix host-role capture and score handoff; do not simulate room data. | Implemented; screenshot-validated (diff 9.7) |
| Online Duel - Rematch Request Page.png (1572×3408) | `assets/victory_defeat_draw_screen_online_duel_match/Sky.png`; `assets/victory_defeat_draw_screen_online_duel_match/victory.png`; `assets/victory_defeat_draw_screen_online_duel_match/defeat.png`; `assets/victory_defeat_draw_screen_online_duel_match/draw.png`; full group below | /game/online-result (outcome/post/rematch state) | Two named actual opponents on distinct gold/stone podiums; winner crown/stars and loser hat/balloons; actual scores. Post-result rematch/home; live request/accept/deny overlay. Fix host-role capture and score handoff; do not simulate room data. | Implemented; screenshot-validated (diff 13.6) |
| Online Duel - Victory Page.png (1572×3408) | `assets/victory_defeat_draw_screen_online_duel_match/Sky.png`; `assets/victory_defeat_draw_screen_online_duel_match/victory.png`; `assets/victory_defeat_draw_screen_online_duel_match/defeat.png`; `assets/victory_defeat_draw_screen_online_duel_match/draw.png`; full group below | /game/online-result (outcome/post/rematch state) | Two named actual opponents on distinct gold/stone podiums; winner crown/stars and loser hat/balloons; actual scores. Post-result rematch/home; live request/accept/deny overlay. Fix host-role capture and score handoff; do not simulate room data. | Implemented; screenshot-validated (diff 12.0) |
| Online Duel.png (1572×3408) | `assets/online_duel_screen/Sky.png`; `assets/online_duel_screen/online_duel_vector.png`; `assets/online_duel_screen/create_room_button.png`; `assets/online_duel_screen/roin_room_button.png`; full group below | /online-lobby (entry/create/join/ready/transition) | Entry title y240 and create/join; create room-code/copy/share; join form and busy dialog; ready banner y125, two real player cards y375, host start/joiner leave y650; entering-match overlay. Keep real Firestore subscription. | Implemented; screenshot-validated (diff 6.0) |
| Oops Screen.png (1572×3408) | `assets/Oops_Screen/Sky.png`; `assets/Oops_Screen/warning.png`; `assets/Oops_Screen/oops.png`; `assets/Oops_Screen/ok_button.png`; full group below | /oops | Warning icon y300; supplied OOPS dialog y460 and OK y630; connect relevant failures and return action. | Implemented; screenshot-validated (diff 2.0) |
| POST DEFEAT PAGE - SOLO CHALLENGE.png (1572×3408) | `assets/defeat_screen_solo_match/Sky.png`; `assets/defeat_screen_solo_match/defeat.png`; `assets/defeat_screen_solo_match/score_streak_box.png`; `assets/defeat_screen_solo_match/share_button.png`; full group below | /game/defeat (result/post-result) | Distinct red DEFEAT header; actual score and zero streak; crying avatar on stone podium with clown hat and three balloons. Separate result/post-result controls. | Implemented; screenshot-validated (diff 6.1) |
| POST DEFEAT PAGE.png (393×852) | `assets/defeat_screen_solo_match/Sky.png`; `assets/defeat_screen_solo_match/defeat.png`; `assets/defeat_screen_solo_match/score_streak_box.png`; `assets/defeat_screen_solo_match/share_button.png`; full group below | /game/defeat (result/post-result) | Distinct red DEFEAT header; actual score and zero streak; crying avatar on stone podium with clown hat and three balloons. Separate result/post-result controls. | Implemented; screenshot-validated (diff 6.0) |
| POST DRAW PAGE.png (1572×3408) | `assets/draw_screen_solo_match/Sky.png`; `assets/draw_screen_solo_match/draw.png`; `assets/draw_screen_solo_match/score_streak_box.png`; `assets/draw_screen_solo_match/share_button.png`; full group below | /game/draw (result/post-result) | Gray DRAW title, actual score and retained streak; sad avatar/stone podium, no crown, hat or balloons; separate result/post-result controls. | Implemented; screenshot-validated (diff 4.1) |
| POST VICTORY PAGE - SOLO CHALLENGE.png (1572×3408) | `assets/victory_screen_solo_match/Sky.png`; `assets/victory_screen_solo_match/victory.png`; `assets/victory_screen_solo_match/score_streak_box.png`; `assets/victory_screen_solo_match/share_button.png`; full group below | /game/victory (result/post-result) | VICTORY header y45; live score/streak at y165/245 and Share at y325; crowned character and gold podium fill lower half. Next replaces stats with rematch/home controls while keeping composition. | Implemented; screenshot-validated (diff 5.4) |
| POST VICTORY PAGE.png (393×852) | `assets/victory_screen_solo_match/Sky.png`; `assets/victory_screen_solo_match/victory.png`; `assets/victory_screen_solo_match/score_streak_box.png`; `assets/victory_screen_solo_match/share_button.png`; full group below | /game/victory (result/post-result) | VICTORY header y45; live score/streak at y165/245 and Share at y325; crowned character and gold podium fill lower half. Next replaces stats with rematch/home controls while keeping composition. | Implemented; screenshot-validated (diff 5.9) |
| Quit Screen.png (1572×3408) | `assets/game_screen/exit_game_box.png`; `assets/game_screen/yes_exit_button.png`; `assets/game_screen/cancel_button_exit_screen_&_restart_screen.png`; full group below | game pause → quit confirmation overlay | Sky-backed red-title EXIT GAME dialog at y255 with move accents; YES, EXIT and CANCEL beneath; actual leave/cancel behavior. | Implemented; screenshot-validated (diff 4.0) |
| Restart Screen.png (1572×3408) | `assets/game_screen/exit_game_box.png`; `assets/game_screen/cancel_button_exit_screen_&_restart_screen.png`; full group below | game pause → restart confirmation overlay | Yellow RESTART GAME title/body over matching existing frame at y255; YES/CANCEL. No dedicated restart heading asset: render pixel text over original dialog frame. | Implemented; screenshot-validated (diff 6.1) |
| Settings - Mid Game - 1.png (1572×3408) | `assets/game_screen/Group 83.png`; `assets/game_screen/button.png`; `assets/game_screen/quit_button.png`; full group below | /game or /game/multiplayer (pause overlay) | Sky-backed PAUSED composition; Resume, Restart, SOUND ON/OFF and Quit controls at y225/340/455/570. Overlay state, no separate navigation route. | Implemented; screenshot-validated (diff 13.0) |
| Settings - Mid Game - 2.png (1572×3408) | `assets/game_screen/Group 83.png`; `assets/game_screen/button.png`; `assets/game_screen/quit_button.png`; full group below | /game or /game/multiplayer (pause overlay) | Sky-backed PAUSED composition; Resume, Restart, SOUND ON/OFF and Quit controls at y225/340/455/570. Overlay state, no separate navigation route. | Implemented; screenshot-validated (diff 12.4) |
| Settings - Mid Game-1.png (393×852) | `assets/game_screen/Group 83.png`; `assets/game_screen/button.png`; `assets/game_screen/quit_button.png`; full group below | /game or /game/multiplayer (pause overlay) | Sky-backed PAUSED composition; Resume, Restart, SOUND ON/OFF and Quit controls at y225/340/455/570. Overlay state, no separate navigation route. | Implemented; screenshot-validated (diff 8.0) |
| Settings - Mid Game.png (393×852) | `assets/game_screen/Group 83.png`; `assets/game_screen/button.png`; `assets/game_screen/quit_button.png`; full group below | /game or /game/multiplayer (pause overlay) | Sky-backed PAUSED composition; Resume, Restart, SOUND ON/OFF and Quit controls at y225/340/455/570. Overlay state, no separate navigation route. | Implemented; screenshot-validated (diff 8.6) |
| SETTINGS PAGE - 3.png (393×852) | `assets/settings_screen/Sky.png`; `assets/settings_screen/settings_vector.png`; `assets/settings_screen/go_back_button.png`; `assets/settings_screen/edit_button.png`; full group below | /settings (normal/edit state) | Back/edit top corners; SETTINGS title y138; profile rows y225/318; SOUND then MUSIC gauges y440/560, logout y650; edit dimmer leaves profile rows and glowing pencil active. | Implemented; screenshot-validated (diff 7.4) |
| SETTINGS PAGE - 4.png (393×852) | `assets/settings_screen/Sky.png`; `assets/settings_screen/settings_vector.png`; `assets/settings_screen/go_back_button.png`; `assets/settings_screen/edit_button.png`; full group below | /settings (normal/edit state) | Back/edit top corners; SETTINGS title y138; profile rows y225/318; SOUND then MUSIC gauges y440/560, logout y650; edit dimmer leaves profile rows and glowing pencil active. | Implemented; screenshot-validated (diff 7.4) |
| SETTINGS PAGE - EDIT STATE.png (1572×3408) | `assets/settings_screen/Sky.png`; `assets/settings_screen/settings_vector.png`; `assets/settings_screen/go_back_button.png`; `assets/settings_screen/edit_button.png`; full group below | /settings (normal/edit state) | Back/edit top corners; SETTINGS title y138; profile rows y225/318; SOUND then MUSIC gauges y440/560, logout y650; edit dimmer leaves profile rows and glowing pencil active. | Implemented; screenshot-validated (diff 7.3) |
| SETTINGS PAGE.png (1572×3408) | `assets/settings_screen/Sky.png`; `assets/settings_screen/settings_vector.png`; `assets/settings_screen/go_back_button.png`; `assets/settings_screen/edit_button.png`; full group below | /settings (normal/edit state) | Back/edit top corners; SETTINGS title y138; profile rows y225/318; SOUND then MUSIC gauges y440/560, logout y650; edit dimmer leaves profile rows and glowing pencil active. | Implemented; screenshot-validated (diff 7.6) |
| SHARE PAGE - Online Duel.png (1572×3408) | `assets/share_screen/mobile_hand.png`; full group below | /share | Full-size transparent phone/hand overlay around a live solo/online result composition; preserve result and invoke actual platform sharing. No additional decorative UI inside capture. | Implemented; screenshot-validated (diff 24.1) — inner page layout differs slightly in the reference |
| SHARE PAGE - SOLO CHALLENGE.png (1572×3408) | `assets/share_screen/mobile_hand.png`; full group below | /share | Full-size transparent phone/hand overlay around a live solo/online result composition; preserve result and invoke actual platform sharing. No additional decorative UI inside capture. | Implemented; screenshot-validated (diff 17.4) |
| SHARE PAGE.png (393×852) | `assets/share_screen/mobile_hand.png`; full group below | /share | Full-size transparent phone/hand overlay around a live solo/online result composition; preserve result and invoke actual platform sharing. No additional decorative UI inside capture. | Implemented; screenshot-validated (diff 17.0) |
| SIGN-UP PAGE - Account Created.png (1572×3408) | `assets/authentiction_screen/Sky.png`; `assets/authentiction_screen/sign_up.png`; `assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png`; `assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png`; full group below | /signup (form/dialog state) | SIGN UP form with username/email/password, outlined inputs, red invalid fields, original dialogs and account-created Continue to avatar selection; preserve Firebase signup. | Implemented; screenshot-validated (diff 13.1) |
| SIGN-UP PAGE - ERROR STATE.png (1572×3408) | `assets/authentiction_screen/Sky.png`; `assets/authentiction_screen/sign_up.png`; `assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png`; `assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png`; full group below | /signup (form/dialog state) | SIGN UP form with username/email/password, outlined inputs, red invalid fields, original dialogs and account-created Continue to avatar selection; preserve Firebase signup. | Implemented; screenshot-validated (diff 65.9) — reference uses a shifted layout variant; error styling applied on the base layout |
| SIGN-UP PAGE - Password Too Short.png (1572×3408) | `assets/authentiction_screen/Sky.png`; `assets/authentiction_screen/sign_up.png`; `assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png`; `assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png`; full group below | /signup (form/dialog state) | SIGN UP form with username/email/password, outlined inputs, red invalid fields, original dialogs and account-created Continue to avatar selection; preserve Firebase signup. | Implemented; screenshot-validated (diff 65.9) — reference uses a shifted layout variant; app shows the weak-password dialog |
| SIGN-UP PAGE - Username Already Taken.png (1572×3408) | `assets/authentiction_screen/Sky.png`; `assets/authentiction_screen/sign_up.png`; `assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png`; `assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png`; full group below | /signup (form/dialog state) | SIGN UP form with username/email/password, outlined inputs, red invalid fields, original dialogs and account-created Continue to avatar selection; preserve Firebase signup. | Implemented; screenshot-validated (diff 12.6) |
| SIGN-UP PAGE.png (1572×3408) | `assets/authentiction_screen/Sky.png`; `assets/authentiction_screen/sign_up.png`; `assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png`; `assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png`; full group below | /signup (form/dialog state) | SIGN UP form with username/email/password, outlined inputs, red invalid fields, original dialogs and account-created Continue to avatar selection; preserve Firebase signup. | Implemented; screenshot-validated (diff 11.5) |
| Start of the game - 1.png (1572×3408) | `assets/game_screen/grass_Background.png`; `assets/game_screen/HOLD STATE BLUE HANDS BLOCK.png`; `assets/game_screen/HOLD STATE REDHANDS BLOCK.png`; `assets/game_screen/PAPER BLUE HAND BLOCKS.png`; full group below | /game or /game/multiplayer (round phase) | Full grass canvas; large opposed red/blue hand layers at top/bottom; side score pips and player names, settings upper-right; bottom three move buttons. Center 3/2/1/SHOOT and dimmed round dialogs. Preserve rules and cancel timers on exit/pause. | Implemented; screenshot-validated (diff 3.3) |
| Start of the game - 2.png (1572×3408) | `assets/game_screen/grass_Background.png`; `assets/game_screen/HOLD STATE BLUE HANDS BLOCK.png`; `assets/game_screen/HOLD STATE REDHANDS BLOCK.png`; `assets/game_screen/PAPER BLUE HAND BLOCKS.png`; full group below | /game or /game/multiplayer (round phase) | Full grass canvas; large opposed red/blue hand layers at top/bottom; side score pips and player names, settings upper-right; bottom three move buttons. Center 3/2/1/SHOOT and dimmed round dialogs. Preserve rules and cancel timers on exit/pause. | Implemented; screenshot-validated (diff 3.0) |
| Start of the game - 3.png (1572×3408) | `assets/game_screen/grass_Background.png`; `assets/game_screen/HOLD STATE BLUE HANDS BLOCK.png`; `assets/game_screen/HOLD STATE REDHANDS BLOCK.png`; `assets/game_screen/PAPER BLUE HAND BLOCKS.png`; full group below | /game or /game/multiplayer (round phase) | Full grass canvas; large opposed red/blue hand layers at top/bottom; side score pips and player names, settings upper-right; bottom three move buttons. Center 3/2/1/SHOOT and dimmed round dialogs. Preserve rules and cancel timers on exit/pause. | Implemented; screenshot-validated (diff 3.0) |
| Start of the game - Shoot.png (1572×3408) | `assets/game_screen/grass_Background.png`; `assets/game_screen/HOLD STATE BLUE HANDS BLOCK.png`; `assets/game_screen/HOLD STATE REDHANDS BLOCK.png`; `assets/game_screen/PAPER BLUE HAND BLOCKS.png`; full group below | /game or /game/multiplayer (round phase) | Full grass canvas; large opposed red/blue hand layers at top/bottom; side score pips and player names, settings upper-right; bottom three move buttons. Center 3/2/1/SHOOT and dimmed round dialogs. Preserve rules and cancel timers on exit/pause. | Implemented; screenshot-validated (diff 4.9) |
| Start of the game.png (393×852) | `assets/game_screen/grass_Background.png`; `assets/game_screen/HOLD STATE BLUE HANDS BLOCK.png`; `assets/game_screen/HOLD STATE REDHANDS BLOCK.png`; `assets/game_screen/PAPER BLUE HAND BLOCKS.png`; full group below | /game or /game/multiplayer (round phase) | Full grass canvas; large opposed red/blue hand layers at top/bottom; side score pips and player names, settings upper-right; bottom three move buttons. Center 3/2/1/SHOOT and dimmed round dialogs. Preserve rules and cancel timers on exit/pause. | Implemented; screenshot-validated (diff 6.1) |
| VICTORY PAGE - SOLO CHALLENGE.png (1572×3408) | `assets/victory_screen_solo_match/Sky.png`; `assets/victory_screen_solo_match/victory.png`; `assets/victory_screen_solo_match/score_streak_box.png`; `assets/victory_screen_solo_match/share_button.png`; full group below | /game/victory (result/post-result) | VICTORY header y45; live score/streak at y165/245 and Share at y325; crowned character and gold podium fill lower half. Next replaces stats with rematch/home controls while keeping composition. | Implemented; screenshot-validated (diff 7.7) |
| VICTORY PAGE.png (393×852) | `assets/victory_screen_solo_match/Sky.png`; `assets/victory_screen_solo_match/victory.png`; `assets/victory_screen_solo_match/score_streak_box.png`; `assets/victory_screen_solo_match/share_button.png`; full group below | /game/victory (result/post-result) | VICTORY header y45; live score/streak at y165/245 and Share at y325; crowned character and gold podium fill lower half. Next replaces stats with rematch/home controls while keeping composition. | Implemented; screenshot-validated (diff 9.1) |

## Complete asset assignments

All filenames below were inspected; the inventory JSON records individual width, height, alpha range and visible bounds. PNG sheets preserve transparent parts on a checkerboard. WAVs: retro_bgm.wav is the existing ~99.6 s music track; retro_bgm2.wav is a one-second alternate. icon.json and the Expo symbol SVG are the existing template icon bundle.

### loading

- `assets/loading_screen/Sky.png`
- `assets/loading_screen/Stone.png`
- `assets/loading_screen/Paper.png`
- `assets/loading_screen/Scissors.png`

### onboarding

- `assets/onboarding_screen/Sky.png`
- `assets/onboarding_screen/Exclude.png`
- `assets/onboarding_screen/floating_island_1.png`
- `assets/onboarding_screen/floating_island_2.png`
- `assets/onboarding_screen/floating_island_3.png`
- `assets/onboarding_screen/hand_thought.png`
- `assets/onboarding_screen/vs_thought.png`
- `assets/onboarding_screen/question_thought.png`
- `assets/onboarding_screen/duel_sword.png`
- `assets/onboarding_screen/dots.png`
- `assets/onboarding_screen/dots_2.png`
- `assets/onboarding_screen/next_button.png`

### login

- `assets/authentiction_screen/Sky.png`
- `assets/authentiction_screen/Vector.png`
- `assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png`
- `assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png`
- `assets/authentiction_screen/button.png`
- `assets/authentiction_screen/GOOGLE LOGO.png`
- `assets/authentiction_screen/missing_info.png`
- `assets/authentiction_screen/login_failed_pass.png`
- `assets/authentiction_screen/login_failed_un.png`
- `assets/authentiction_screen/reset_sent.png`
- `assets/authentiction_screen/ok_button.png`

### signup

- `assets/authentiction_screen/Sky.png`
- `assets/authentiction_screen/sign_up.png`
- `assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png`
- `assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png`
- `assets/authentiction_screen/button.png`
- `assets/authentiction_screen/GOOGLE LOGO.png`
- `assets/authentiction_screen/username_taken.png`
- `assets/authentiction_screen/weak_pass.png`
- `assets/authentiction_screen/account_created.png`
- `assets/authentiction_screen/continue_button.png`

### gender

- `assets/gender_screen/Sky.png`
- `assets/gender_screen/select_ur_gender.png`
- `assets/gender_screen/guy_on_the_tower.png`
- `assets/gender_screen/girl_on_the_tower.png`
- `assets/gender_screen/CROWN_BLOCKS.png`
- `assets/gender_screen/STAR BLOCKS.png`
- `assets/gender_screen/next_button.png`

### home

- `assets/home_screen/Sky.png`
- `assets/home_screen/logo.png`
- `assets/home_screen/profile_holder.png`
- `assets/home_screen/male_profile_pic.png`
- `assets/home_screen/female_profile_pic.png`
- `assets/home_screen/Settings Button.png`
- `assets/home_screen/floating_island.png`
- `assets/home_screen/SMILE_GUY.png`
- `assets/home_screen/SMILE_GIRL.png`
- `assets/home_screen/game_button.png`

### mode

- `assets/game_mode_screen/Sky.png`
- `assets/game_mode_screen/select_game_mode.png`
- `assets/game_mode_screen/Stone.png`
- `assets/game_mode_screen/Paper.png`
- `assets/game_mode_screen/Scissors.png`
- `assets/game_mode_screen/button.png`

### game

- `assets/game_screen/grass_Background.png`
- `assets/game_screen/HOLD STATE BLUE HANDS BLOCK.png`
- `assets/game_screen/HOLD STATE REDHANDS BLOCK.png`
- `assets/game_screen/PAPER BLUE HAND BLOCKS.png`
- `assets/game_screen/PAPER RED HAND BLOCKS.png`
- `assets/game_screen/ROCK BLUE HAND BLOCKS.png`
- `assets/game_screen/ROCK RED HAND BLOCKS.png`
- `assets/game_screen/SCISSOR BLUE HAND BLOCKS.png`
- `assets/game_screen/SCISSOR RED HAND BLOCKS.png`
- `assets/game_screen/control_buttons.png`
- `assets/game_screen/empty_score.png`
- `assets/game_screen/won_point.png`
- `assets/game_screen/lost_point.png`
- `assets/game_screen/round_result.png`
- `assets/game_screen/draw_state.png`
- `assets/game_screen/Settings Button.png`

### pause

- `assets/game_screen/Group 83.png`
- `assets/game_screen/button.png`
- `assets/game_screen/quit_button.png`

### quit

- `assets/game_screen/exit_game_box.png`
- `assets/game_screen/yes_exit_button.png`
- `assets/game_screen/cancel_button_exit_screen_&_restart_screen.png`

### restart

- `assets/game_screen/exit_game_box.png`
- `assets/game_screen/cancel_button_exit_screen_&_restart_screen.png`

### settings

- `assets/settings_screen/Sky.png`
- `assets/settings_screen/settings_vector.png`
- `assets/settings_screen/go_back_button.png`
- `assets/settings_screen/edit_button.png`
- `assets/settings_screen/activr_state.png`
- `assets/settings_screen/username_gender_box.png`
- `assets/settings_screen/LEFT ARROW.png`
- `assets/settings_screen/RIGHT ARROW.png`
- `assets/settings_screen/sound_music_box.png`
- `assets/settings_screen/one_unit_sound_music_notation.png`
- `assets/settings_screen/PLUS BUTTON.png`
- `assets/settings_screen/minus_button.png`
- `assets/settings_screen/log_out_button.png`

### online

- `assets/online_duel_screen/Sky.png`
- `assets/online_duel_screen/online_duel_vector.png`
- `assets/online_duel_screen/create_room_button.png`
- `assets/online_duel_screen/roin_room_button.png`
- `assets/online_duel_screen/room_input_box.png`
- `assets/online_duel_screen/copy_button.png`
- `assets/online_duel_screen/copy_icon.png`
- `assets/online_duel_screen/share_button.png`
- `assets/online_duel_screen/share_icon.png`
- `assets/online_duel_screen/join_button.png`
- `assets/online_duel_screen/room_ready.png`
- `assets/online_duel_screen/all_the_stars.png`
- `assets/online_duel_screen/male_player.png`
- `assets/online_duel_screen/female_player.png`
- `assets/online_duel_screen/start_match_button.png`
- `assets/online_duel_screen/leave_room_button.png`
- `assets/online_duel_screen/1v1_box.png`
- `assets/online_duel_screen/entering_match_box.png`

### victory

- `assets/victory_screen_solo_match/Sky.png`
- `assets/victory_screen_solo_match/victory.png`
- `assets/victory_screen_solo_match/score_streak_box.png`
- `assets/victory_screen_solo_match/share_button.png`
- `assets/victory_screen_solo_match/SMILE GUY.png`
- `assets/victory_screen_solo_match/SMILE GIRL.png`
- `assets/victory_screen_solo_match/Victory Stadium.png`
- `assets/victory_screen_solo_match/CROWN_BLOCKS.png`
- `assets/victory_screen_solo_match/STAR BLOCKS.png`
- `assets/victory_screen_solo_match/STAR BLOCKS-1.png`
- `assets/victory_screen_solo_match/STAR BLOCKS-2.png`
- `assets/victory_screen_solo_match/next_button.png`
- `assets/victory_screen_solo_match/rematch_home_button.png`

### defeat

- `assets/defeat_screen_solo_match/Sky.png`
- `assets/defeat_screen_solo_match/defeat.png`
- `assets/defeat_screen_solo_match/score_streak_box.png`
- `assets/defeat_screen_solo_match/share_button.png`
- `assets/defeat_screen_solo_match/cry_guy.png`
- `assets/defeat_screen_solo_match/cry_girl.png`
- `assets/defeat_screen_solo_match/Defeated Stadium.png`
- `assets/defeat_screen_solo_match/Group 33.png`
- `assets/defeat_screen_solo_match/Red Balloon.png`
- `assets/defeat_screen_solo_match/Blue Balloon.png`
- `assets/defeat_screen_solo_match/Green Balloon.png`
- `assets/defeat_screen_solo_match/next_button.png`
- `assets/defeat_screen_solo_match/rematch_home_button.png`

### draw

- `assets/draw_screen_solo_match/Sky.png`
- `assets/draw_screen_solo_match/draw.png`
- `assets/draw_screen_solo_match/score_streak_box.png`
- `assets/draw_screen_solo_match/share_button.png`
- `assets/draw_screen_solo_match/SAD GUY.png`
- `assets/draw_screen_solo_match/SAD GIRL.png`
- `assets/draw_screen_solo_match/Defeated Stadium.png`
- `assets/draw_screen_solo_match/next_button.png`
- `assets/draw_screen_solo_match/rematch_home_button.png`

### onlineResult

- `assets/victory_defeat_draw_screen_online_duel_match/Sky.png`
- `assets/victory_defeat_draw_screen_online_duel_match/victory.png`
- `assets/victory_defeat_draw_screen_online_duel_match/defeat.png`
- `assets/victory_defeat_draw_screen_online_duel_match/draw.png`
- `assets/victory_defeat_draw_screen_online_duel_match/score_streak_box.png`
- `assets/victory_defeat_draw_screen_online_duel_match/SMILE GUY.png`
- `assets/victory_defeat_draw_screen_online_duel_match/SMILE GIRL.png`
- `assets/victory_defeat_draw_screen_online_duel_match/cry_guy.png`
- `assets/victory_defeat_draw_screen_online_duel_match/cry_girl.png`
- `assets/victory_defeat_draw_screen_online_duel_match/victor's_stadium.png`
- `assets/victory_defeat_draw_screen_online_duel_match/defeated's_stadium.png`
- `assets/victory_defeat_draw_screen_online_duel_match/clown.png`
- `assets/victory_defeat_draw_screen_online_duel_match/CROWN_BLOCKS.png`
- `assets/victory_defeat_draw_screen_online_duel_match/rematch_request.png`
- `assets/victory_defeat_draw_screen_online_duel_match/accept_button.png`
- `assets/victory_defeat_draw_screen_online_duel_match/deny_button.png`

### share

- `assets/share_screen/mobile_hand.png`

### offline

- `assets/No_Internet_Screen/Sky.png`
- `assets/No_Internet_Screen/no_wifi_icon.png`
- `assets/No_Internet_Screen/no_internet.png`
- `assets/No_Internet_Screen/retry_home_button.png`
- `assets/No_Internet_Screen/Stone.png`
- `assets/No_Internet_Screen/Paper.png`
- `assets/No_Internet_Screen/Scissors.png`

### oops

- `assets/Oops_Screen/Sky.png`
- `assets/Oops_Screen/warning.png`
- `assets/Oops_Screen/oops.png`
- `assets/Oops_Screen/ok_button.png`
- `assets/Oops_Screen/Stone.png`
- `assets/Oops_Screen/Paper.png`
- `assets/Oops_Screen/Scissors.png`

## Exhaustive asset inventory

| Asset | Dimensions | Transparency / intended role |
|---|---|---|
| `assets/authentiction_screen/account_created.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/button.png` | 1225×289 | Contains transparency. Interactive control artwork |
| `assets/authentiction_screen/continue_button.png` | 673×289 | Contains transparency. Interactive control artwork |
| `assets/authentiction_screen/custom_cursor.png` | 37×73 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/GOOGLE LOGO.png` | 104×104 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/login_failed_pass.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/login_failed_un.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/missing_info.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/ok_button.png` | 673×289 | Contains transparency. Interactive control artwork |
| `assets/authentiction_screen/Paper.png` | 192×179 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png` | 1225×289 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/reset_sent.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/Scissors.png` | 183×190 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/sign_up.png` | 1248×192 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/authentiction_screen/Stone.png` | 337×251 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png` | 1225×289 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/username_taken.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/Vector.png` | 1252×196 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/authentiction_screen/weak_pass.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (authentiction_screen) |
| `assets/defeat_screen_solo_match/Blue Balloon.png` | 433×529 | Contains transparency. Screen-specific decorative/title/dialog layer (defeat_screen_solo_match) |
| `assets/defeat_screen_solo_match/cloud_1.png` | 1280×600 | Contains transparency. Separate transparent cloud layer |
| `assets/defeat_screen_solo_match/cloud_2.png` | 900×460 | Contains transparency. Separate transparent cloud layer |
| `assets/defeat_screen_solo_match/cry_girl.png` | 1764×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/defeat_screen_solo_match/cry_guy.png` | 1932×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/defeat_screen_solo_match/defeat.png` | 992×188 | Contains transparency. Screen-specific decorative/title/dialog layer (defeat_screen_solo_match) |
| `assets/defeat_screen_solo_match/Defeated Stadium.png` | 972×1089 | Contains transparency. Podium / character-on-podium illustration |
| `assets/defeat_screen_solo_match/Green Balloon.png` | 433×529 | Contains transparency. Screen-specific decorative/title/dialog layer (defeat_screen_solo_match) |
| `assets/defeat_screen_solo_match/Group 33.png` | 647×404 | Contains transparency. Screen-specific decorative/title/dialog layer (defeat_screen_solo_match) |
| `assets/defeat_screen_solo_match/next_button.png` | 184×184 | Contains transparency. Interactive control artwork |
| `assets/defeat_screen_solo_match/Paper.png` | 192×179 | Contains transparency. Screen-specific decorative/title/dialog layer (defeat_screen_solo_match) |
| `assets/defeat_screen_solo_match/Red Balloon.png` | 433×529 | Contains transparency. Screen-specific decorative/title/dialog layer (defeat_screen_solo_match) |
| `assets/defeat_screen_solo_match/rematch_home_button.png` | 673×289 | Contains transparency. Interactive control artwork |
| `assets/defeat_screen_solo_match/Scissors.png` | 194×200 | Contains transparency. Screen-specific decorative/title/dialog layer (defeat_screen_solo_match) |
| `assets/defeat_screen_solo_match/score_streak_box.png` | 1225×289 | Contains transparency. Score / audio indicator |
| `assets/defeat_screen_solo_match/share_button.png` | 400×172 | Contains transparency. Interactive control artwork |
| `assets/defeat_screen_solo_match/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/defeat_screen_solo_match/Stone.png` | 339×270 | Contains transparency. Screen-specific decorative/title/dialog layer (defeat_screen_solo_match) |
| `assets/draw_screen_solo_match/cloud_1.png` | 1280×600 | Contains transparency. Separate transparent cloud layer |
| `assets/draw_screen_solo_match/cloud_2.png` | 900×460 | Contains transparency. Separate transparent cloud layer |
| `assets/draw_screen_solo_match/Defeated Stadium.png` | 972×1089 | Contains transparency. Podium / character-on-podium illustration |
| `assets/draw_screen_solo_match/draw.png` | 672×188 | Contains transparency. Screen-specific decorative/title/dialog layer (draw_screen_solo_match) |
| `assets/draw_screen_solo_match/next_button.png` | 184×184 | Contains transparency. Interactive control artwork |
| `assets/draw_screen_solo_match/Paper.png` | 192×179 | Contains transparency. Screen-specific decorative/title/dialog layer (draw_screen_solo_match) |
| `assets/draw_screen_solo_match/rematch_home_button.png` | 673×289 | Contains transparency. Interactive control artwork |
| `assets/draw_screen_solo_match/SAD GIRL.png` | 1764×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/draw_screen_solo_match/SAD GUY.png` | 1932×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/draw_screen_solo_match/Scissors.png` | 194×200 | Contains transparency. Screen-specific decorative/title/dialog layer (draw_screen_solo_match) |
| `assets/draw_screen_solo_match/score_streak_box.png` | 1225×289 | Contains transparency. Score / audio indicator |
| `assets/draw_screen_solo_match/share_button.png` | 400×172 | Contains transparency. Interactive control artwork |
| `assets/draw_screen_solo_match/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/draw_screen_solo_match/Stone.png` | 339×270 | Contains transparency. Screen-specific decorative/title/dialog layer (draw_screen_solo_match) |
| `assets/expo.icon/Assets/expo-symbol 2.svg` | Non-raster | Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/expo.icon/Assets/grid.png` | 1024×1024 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/expo.icon/icon.json` | Non-raster | Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/game_mode_screen/button.png` | 673×289 | Contains transparency. Interactive control artwork |
| `assets/game_mode_screen/cloud_1.png` | 1280×600 | Contains transparency. Separate transparent cloud layer |
| `assets/game_mode_screen/cloud_2.png` | 900×460 | Contains transparency. Separate transparent cloud layer |
| `assets/game_mode_screen/Paper.png` | 192×179 | Contains transparency. Screen-specific decorative/title/dialog layer (game_mode_screen) |
| `assets/game_mode_screen/Scissors.png` | 194×200 | Contains transparency. Screen-specific decorative/title/dialog layer (game_mode_screen) |
| `assets/game_mode_screen/select_game_mode.png` | 1252×744 | Contains transparency. Screen-specific decorative/title/dialog layer (game_mode_screen) |
| `assets/game_mode_screen/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/game_mode_screen/Stone.png` | 339×270 | Contains transparency. Screen-specific decorative/title/dialog layer (game_mode_screen) |
| `assets/game_screen/button.png` | 769×289 | Contains transparency. Interactive control artwork |
| `assets/game_screen/cancel_button_exit_screen_&_restart_screen.png` | 673×289 | Contains transparency. Interactive control artwork |
| `assets/game_screen/control_buttons.png` | 288×288 | Contains transparency. Interactive control artwork |
| `assets/game_screen/draw_state.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (game_screen) |
| `assets/game_screen/empty_score.png` | 144×127 | Contains transparency. Score / audio indicator |
| `assets/game_screen/exit_game_box.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (game_screen) |
| `assets/game_screen/grass_Background.png` | 1572×3408 | Full portrait background |
| `assets/game_screen/Group 83.png` | 992×188 | Contains transparency. Screen-specific decorative/title/dialog layer (game_screen) |
| `assets/game_screen/half_time_screen.png` | 1572×3408 | Contains transparency. Modal dimming overlay |
| `assets/game_screen/HOLD STATE BLUE HANDS BLOCK.png` | 752×1276 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/game_screen/HOLD STATE REDHANDS BLOCK.png` | 752×1276 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/game_screen/HOLD STATE SHADOW BLUE HANDS BLOCK.png` | 752×1276 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/game_screen/lost_point.png` | 144×126 | Contains transparency. Score / audio indicator |
| `assets/game_screen/PAPER BLUE HAND BLOCKS.png` | 708×1540 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/game_screen/PAPER RED HAND BLOCKS.png` | 708×1540 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/game_screen/PAPER SAHDOW HAND RED BLOCKS.png` | 708×1540 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/game_screen/Paper.png` | 192×179 | Contains transparency. Screen-specific decorative/title/dialog layer (game_screen) |
| `assets/game_screen/quit_button.png` | 769×289 | Contains transparency. Interactive control artwork |
| `assets/game_screen/ROCK BLUE HAND BLOCKS.png` | 752×1276 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/game_screen/ROCK RED HAND BLOCKS.png` | 752×1276 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/game_screen/round_result.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (game_screen) |
| `assets/game_screen/SCISSOR BLUE HAND BLOCKS.png` | 748×1540 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/game_screen/SCISSOR RED HAND BLOCKS.png` | 748×1540 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/game_screen/SCISSOR SHADOW HAND BLOCKS.png` | 748×1540 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/game_screen/Scissors.png` | 194×200 | Contains transparency. Screen-specific decorative/title/dialog layer (game_screen) |
| `assets/game_screen/Settings Button.png` | 184×184 | Contains transparency. Interactive control artwork |
| `assets/game_screen/settings_icon.png` | 127×120 | Contains transparency. Screen-specific decorative/title/dialog layer (game_screen) |
| `assets/game_screen/Stone.png` | 339×270 | Contains transparency. Screen-specific decorative/title/dialog layer (game_screen) |
| `assets/game_screen/won_point.png` | 144×126 | Contains transparency. Score / audio indicator |
| `assets/game_screen/yes_exit_button.png` | 673×289 | Contains transparency. Interactive control artwork |
| `assets/gender_screen/cloud_1.png` | 1280×600 | Contains transparency. Separate transparent cloud layer |
| `assets/gender_screen/cloud_2.png` | 900×460 | Contains transparency. Separate transparent cloud layer |
| `assets/gender_screen/CROWN_BLOCKS.png` | 247×206 | Contains transparency. Screen-specific decorative/title/dialog layer (gender_screen) |
| `assets/gender_screen/girl_on_the_tower.png` | 681×1520 | Contains transparency. Podium / character-on-podium illustration |
| `assets/gender_screen/guy_on_the_tower.png` | 721×1520 | Contains transparency. Podium / character-on-podium illustration |
| `assets/gender_screen/next_button.png` | 184×184 | Contains transparency. Interactive control artwork |
| `assets/gender_screen/Paper.png` | 192×179 | Contains transparency. Screen-specific decorative/title/dialog layer (gender_screen) |
| `assets/gender_screen/Scissors.png` | 194×200 | Contains transparency. Screen-specific decorative/title/dialog layer (gender_screen) |
| `assets/gender_screen/select_ur_gender.png` | 1256×768 | Contains transparency. Screen-specific decorative/title/dialog layer (gender_screen) |
| `assets/gender_screen/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/gender_screen/STAR BLOCKS-1.png` | 36×34 | Contains transparency. Screen-specific decorative/title/dialog layer (gender_screen) |
| `assets/gender_screen/STAR BLOCKS-2.png` | 35×33 | Contains transparency. Screen-specific decorative/title/dialog layer (gender_screen) |
| `assets/gender_screen/STAR BLOCKS.png` | 39×38 | Contains transparency. Screen-specific decorative/title/dialog layer (gender_screen) |
| `assets/gender_screen/Stone.png` | 339×270 | Contains transparency. Screen-specific decorative/title/dialog layer (gender_screen) |
| `assets/general/cloud_1.png` | 1280×600 | Contains transparency. Separate transparent cloud layer |
| `assets/general/cloud_2.png` | 900×460 | Contains transparency. Separate transparent cloud layer |
| `assets/general/cry_girl.png` | 1764×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/general/cry_guy.png` | 1932×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/general/grass_Background.png` | 1572×3408 | Full portrait background |
| `assets/general/home_page_floating_island.png` | 1200×940 | Contains transparency. Screen-specific decorative/title/dialog layer (general) |
| `assets/general/Paper.png` | 192×179 | Contains transparency. Screen-specific decorative/title/dialog layer (general) |
| `assets/general/SAD GIRL.png` | 1764×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/general/SAD GUY.png` | 1932×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/general/Scissors.png` | 194×200 | Contains transparency. Screen-specific decorative/title/dialog layer (general) |
| `assets/general/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/general/SMILE GIRL.png` | 1764×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/general/SMILE GUY.png` | 1932×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/general/Stone.png` | 339×270 | Contains transparency. Screen-specific decorative/title/dialog layer (general) |
| `assets/home_screen/cloud_1.png` | 1280×600 | Contains transparency. Separate transparent cloud layer |
| `assets/home_screen/cloud_2.png` | 900×460 | Contains transparency. Separate transparent cloud layer |
| `assets/home_screen/CROWN BLOCKS.png` | 53×44 | Contains transparency. Screen-specific decorative/title/dialog layer (home_screen) |
| `assets/home_screen/female_profile_pic.png` | 124×130 | Contains transparency. Avatar expression / profile illustration |
| `assets/home_screen/floating_island.png` | 1200×880 | Contains transparency. Screen-specific decorative/title/dialog layer (home_screen) |
| `assets/home_screen/floating_island_crumble_1.png` | 100×120 | Contains transparency. Screen-specific decorative/title/dialog layer (home_screen) |
| `assets/home_screen/floating_island_crumble_2.png` | 200×220 | Contains transparency. Screen-specific decorative/title/dialog layer (home_screen) |
| `assets/home_screen/floating_island_crumble_3.png` | 160×180 | Contains transparency. Screen-specific decorative/title/dialog layer (home_screen) |
| `assets/home_screen/game_button.png` | 1012×239 | Contains transparency. Interactive control artwork |
| `assets/home_screen/logo.png` | 1380×1130 | Contains transparency. Screen-specific decorative/title/dialog layer (home_screen) |
| `assets/home_screen/male_profile_pic.png` | 124×130 | Contains transparency. Avatar expression / profile illustration |
| `assets/home_screen/profile_holder.png` | 471×184 | Contains transparency. Screen-specific decorative/title/dialog layer (home_screen) |
| `assets/home_screen/Settings Button.png` | 184×184 | Contains transparency. Interactive control artwork |
| `assets/home_screen/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/home_screen/SMILE_GIRL.png` | 443×632 | Contains transparency. Avatar expression / profile illustration |
| `assets/home_screen/SMILE_GUY.png` | 484×632 | Contains transparency. Avatar expression / profile illustration |
| `assets/images/android-icon-background.png` | 512×512 | Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/android-icon-foreground.png` | 512×512 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/android-icon-monochrome.png` | 432×432 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/buttons/btn_paper.png` | 63×63 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/buttons/btn_rock.png` | 63×63 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/buttons/btn_scissors.png` | 63×63 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/buttons/btn_settings.png` | 47×47 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/characters/char_avatar_defeat.png` | 149×439 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/characters/char_avatar_idle.png` | 149×219 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/characters/char_avatar_victory.png` | 149×402 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/decorations/balloon_red.png` | 74×139 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/decorations/floating_island.png` | 353×170 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/decorations/pedestal_victory.png` | 193×112 | Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/decorations/pillar_defeat.png` | 193×77 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/decorations/star_victory.png` | 67×67 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/expo-badge-white.png` | 371×72 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/expo-badge.png` | 371×72 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/expo-logo.png` | 228×213 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/favicon.png` | 48×48 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/hands/hand_bot_paper.png` | 338×384 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/images/hands/hand_bot_rock.png` | 338×318 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/images/hands/hand_bot_scissors.png` | 262×232 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/images/hands/hand_player_paper.png` | 338×384 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/images/hands/hand_player_rock.png` | 263×166 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/images/hands/hand_player_scissors.png` | 262×232 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/images/icon.png` | 1024×1024 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/logo-glow.png` | 604×604 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/react-logo.png` | 100×100 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/react-logo@2x.png` | 200×200 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/react-logo@3x.png` | 300×300 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/splash-icon.png` | 228×213 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/tabIcons/explore.png` | 25×25 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/tabIcons/explore@2x.png` | 49×49 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/tabIcons/explore@3x.png` | 73×73 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/tabIcons/home.png` | 24×24 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/tabIcons/home@2x.png` | 48×48 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/tabIcons/home@3x.png` | 72×72 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/images/tutorial-web.png` | 1480×855 | Contains transparency. Existing template / alternate asset; preserve, do not use as substitute for original screen layers |
| `assets/loading_screen/Paper.png` | 162×151 | Contains transparency. Screen-specific decorative/title/dialog layer (loading_screen) |
| `assets/loading_screen/Scissors.png` | 171×181 | Contains transparency. Screen-specific decorative/title/dialog layer (loading_screen) |
| `assets/loading_screen/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/loading_screen/Stone.png` | 211×111 | Contains transparency. Screen-specific decorative/title/dialog layer (loading_screen) |
| `assets/logo/App Icon - 1.png` | 4096×4096 | Contains transparency. Application branding icon |
| `assets/logo/App Icon - 2.png` | 4096×4096 | Application branding icon |
| `assets/No_Internet_Screen/no_internet.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (No_Internet_Screen) |
| `assets/No_Internet_Screen/no_wifi_icon.png` | 148×136 | Contains transparency. Screen-specific decorative/title/dialog layer (No_Internet_Screen) |
| `assets/No_Internet_Screen/Paper.png` | 162×151 | Contains transparency. Screen-specific decorative/title/dialog layer (No_Internet_Screen) |
| `assets/No_Internet_Screen/retry_home_button.png` | 673×289 | Contains transparency. Interactive control artwork |
| `assets/No_Internet_Screen/Scissors.png` | 171×181 | Contains transparency. Screen-specific decorative/title/dialog layer (No_Internet_Screen) |
| `assets/No_Internet_Screen/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/No_Internet_Screen/Stone.png` | 211×111 | Contains transparency. Screen-specific decorative/title/dialog layer (No_Internet_Screen) |
| `assets/onboarding_screen/CROWN_BLOCKS.png` | 247×206 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/onboarding_screen/dot_fil.png` | 48×40 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/onboarding_screen/dot_unfilled.png` | 80×72 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/onboarding_screen/dots.png` | 336×72 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/onboarding_screen/dots_2.png` | 336×72 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/onboarding_screen/duel_sword.png` | 460×460 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/onboarding_screen/Exclude.png` | 1572×3408 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/onboarding_screen/floating_island_1.png` | 1348×495 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/onboarding_screen/floating_island_2.png` | 1348×495 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/onboarding_screen/floating_island_3.png` | 1348×495 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/onboarding_screen/hand_thought.png` | 259×268 | Contains transparency. Hand illustration; images/hands variants include baked UI and are unsuitable for dynamic arena |
| `assets/onboarding_screen/next_button.png` | 184×184 | Contains transparency. Interactive control artwork |
| `assets/onboarding_screen/Paper.png` | 192×179 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/onboarding_screen/question_thought.png` | 259×268 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/onboarding_screen/Scissors.png` | 194×200 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/onboarding_screen/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/onboarding_screen/Stone.png` | 339×270 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/onboarding_screen/vs_thought.png` | 259×268 | Contains transparency. Screen-specific decorative/title/dialog layer (onboarding_screen) |
| `assets/online_duel_screen/1v1_box.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (online_duel_screen) |
| `assets/online_duel_screen/all_the_stars.png` | 753×312 | Contains transparency. Screen-specific decorative/title/dialog layer (online_duel_screen) |
| `assets/online_duel_screen/cloud_1.png` | 1280×600 | Contains transparency. Separate transparent cloud layer |
| `assets/online_duel_screen/cloud_2.png` | 900×460 | Contains transparency. Separate transparent cloud layer |
| `assets/online_duel_screen/copy_button.png` | 577×289 | Contains transparency. Interactive control artwork |
| `assets/online_duel_screen/copy_icon.png` | 132×153 | Contains transparency. Screen-specific decorative/title/dialog layer (online_duel_screen) |
| `assets/online_duel_screen/create_room_button.png` | 1201×289 | Contains transparency. Interactive control artwork |
| `assets/online_duel_screen/CROWN_BLOCKS.png` | 247×206 | Contains transparency. Screen-specific decorative/title/dialog layer (online_duel_screen) |
| `assets/online_duel_screen/entering_match_box.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (online_duel_screen) |
| `assets/online_duel_screen/female_player.png` | 529×720 | Contains transparency. Screen-specific decorative/title/dialog layer (online_duel_screen) |
| `assets/online_duel_screen/half_time_screen.png` | 1572×3408 | Contains transparency. Modal dimming overlay |
| `assets/online_duel_screen/join_button.png` | 577×289 | Contains transparency. Interactive control artwork |
| `assets/online_duel_screen/leave_room_button.png` | 1201×289 | Contains transparency. Interactive control artwork |
| `assets/online_duel_screen/male_player.png` | 529×720 | Contains transparency. Screen-specific decorative/title/dialog layer (online_duel_screen) |
| `assets/online_duel_screen/online_duel_vector.png` | 1248×496 | Contains transparency. Screen-specific decorative/title/dialog layer (online_duel_screen) |
| `assets/online_duel_screen/Paper.png` | 162×151 | Contains transparency. Screen-specific decorative/title/dialog layer (online_duel_screen) |
| `assets/online_duel_screen/roin_room_button.png` | 1201×289 | Contains transparency. Interactive control artwork |
| `assets/online_duel_screen/room_input_box.png` | 1225×289 | Contains transparency. Screen-specific decorative/title/dialog layer (online_duel_screen) |
| `assets/online_duel_screen/room_ready.png` | 1555×480 | Contains transparency. Screen-specific decorative/title/dialog layer (online_duel_screen) |
| `assets/online_duel_screen/Scissors.png` | 171×181 | Contains transparency. Screen-specific decorative/title/dialog layer (online_duel_screen) |
| `assets/online_duel_screen/share_button.png` | 577×289 | Contains transparency. Interactive control artwork |
| `assets/online_duel_screen/share_icon.png` | 152×116 | Contains transparency. Screen-specific decorative/title/dialog layer (online_duel_screen) |
| `assets/online_duel_screen/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/online_duel_screen/start_match_button.png` | 1201×289 | Contains transparency. Interactive control artwork |
| `assets/online_duel_screen/Stone.png` | 211×111 | Contains transparency. Screen-specific decorative/title/dialog layer (online_duel_screen) |
| `assets/Oops_Screen/ok_button.png` | 673×289 | Contains transparency. Interactive control artwork |
| `assets/Oops_Screen/oops.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (Oops_Screen) |
| `assets/Oops_Screen/Paper.png` | 162×151 | Contains transparency. Screen-specific decorative/title/dialog layer (Oops_Screen) |
| `assets/Oops_Screen/Scissors.png` | 171×181 | Contains transparency. Screen-specific decorative/title/dialog layer (Oops_Screen) |
| `assets/Oops_Screen/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/Oops_Screen/Stone.png` | 211×111 | Contains transparency. Screen-specific decorative/title/dialog layer (Oops_Screen) |
| `assets/Oops_Screen/warning.png` | 528×496 | Contains transparency. Screen-specific decorative/title/dialog layer (Oops_Screen) |
| `assets/settings_screen/activr_state.png` | 400×396 | Contains transparency. Screen-specific decorative/title/dialog layer (settings_screen) |
| `assets/settings_screen/edit_button.png` | 184×184 | Contains transparency. Interactive control artwork |
| `assets/settings_screen/go_back_button.png` | 184×184 | Contains transparency. Interactive control artwork |
| `assets/settings_screen/half_time_screen.png` | 1572×3408 | Contains transparency. Modal dimming overlay |
| `assets/settings_screen/LEFT ARROW.png` | 61×85 | Contains transparency. Interactive control artwork |
| `assets/settings_screen/log_out_button.png` | 673×289 | Contains transparency. Interactive control artwork |
| `assets/settings_screen/minus_button.png` | 192×192 | Contains transparency. Interactive control artwork |
| `assets/settings_screen/one_unit_sound_music_notation.png` | 97×97 | Contains transparency. Score / audio indicator |
| `assets/settings_screen/Paper.png` | 192×179 | Contains transparency. Screen-specific decorative/title/dialog layer (settings_screen) |
| `assets/settings_screen/Pencil.png` | 120×120 | Contains transparency. Screen-specific decorative/title/dialog layer (settings_screen) |
| `assets/settings_screen/PLUS BUTTON.png` | 192×192 | Contains transparency. Interactive control artwork |
| `assets/settings_screen/RIGHT ARROW.png` | 61×85 | Contains transparency. Interactive control artwork |
| `assets/settings_screen/Scissors.png` | 183×190 | Contains transparency. Screen-specific decorative/title/dialog layer (settings_screen) |
| `assets/settings_screen/Settings Button.png` | 184×184 | Contains transparency. Interactive control artwork |
| `assets/settings_screen/settings_vector.png` | 1336×192 | Contains transparency. Screen-specific decorative/title/dialog layer (settings_screen) |
| `assets/settings_screen/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/settings_screen/SOUND_MUSIC_BATTERY.png` | 769×289 | Contains transparency. Score / audio indicator |
| `assets/settings_screen/sound_music_box.png` | 769×289 | Contains transparency. Screen-specific decorative/title/dialog layer (settings_screen) |
| `assets/settings_screen/Stone.png` | 329×251 | Contains transparency. Screen-specific decorative/title/dialog layer (settings_screen) |
| `assets/settings_screen/username_gender_box.png` | 1225×289 | Contains transparency. Screen-specific decorative/title/dialog layer (settings_screen) |
| `assets/share_screen/mobile_hand.png` | 1580×3351 | Contains transparency. Screen-specific decorative/title/dialog layer (share_screen) |
| `assets/sounds/retro_bgm.wav` | Non-raster | Audio |
| `assets/sounds/retro_bgm2.wav` | Non-raster | Audio |
| `assets/victory_defeat_draw_screen_online_duel_match/accept_button.png` | 673×289 | Contains transparency. Interactive control artwork |
| `assets/victory_defeat_draw_screen_online_duel_match/Blue Balloon.png` | 433×529 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_defeat_draw_screen_online_duel_match/cloud_1.png` | 1280×600 | Contains transparency. Separate transparent cloud layer |
| `assets/victory_defeat_draw_screen_online_duel_match/cloud_2.png` | 900×460 | Contains transparency. Separate transparent cloud layer |
| `assets/victory_defeat_draw_screen_online_duel_match/clown.png` | 647×404 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_defeat_draw_screen_online_duel_match/CROWN_BLOCKS.png` | 247×206 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_defeat_draw_screen_online_duel_match/cry_girl.png` | 1764×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/victory_defeat_draw_screen_online_duel_match/cry_guy.png` | 1932×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/victory_defeat_draw_screen_online_duel_match/defeat.png` | 992×188 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_defeat_draw_screen_online_duel_match/defeated's_stadium.png` | 681×871 | Contains transparency. Podium / character-on-podium illustration |
| `assets/victory_defeat_draw_screen_online_duel_match/deny_button.png` | 673×289 | Contains transparency. Interactive control artwork |
| `assets/victory_defeat_draw_screen_online_duel_match/draw.png` | 672×188 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_defeat_draw_screen_online_duel_match/Green Balloon.png` | 433×529 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_defeat_draw_screen_online_duel_match/half_time_screen.png` | 1572×3408 | Contains transparency. Modal dimming overlay |
| `assets/victory_defeat_draw_screen_online_duel_match/next_button.png` | 184×184 | Contains transparency. Interactive control artwork |
| `assets/victory_defeat_draw_screen_online_duel_match/Paper.png` | 192×179 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_defeat_draw_screen_online_duel_match/Red Balloon.png` | 433×529 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_defeat_draw_screen_online_duel_match/rematch_home_button.png` | 673×289 | Contains transparency. Interactive control artwork |
| `assets/victory_defeat_draw_screen_online_duel_match/rematch_request.png` | 1448×615 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_defeat_draw_screen_online_duel_match/Scissors.png` | 194×200 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_defeat_draw_screen_online_duel_match/score_streak_box.png` | 1225×289 | Contains transparency. Score / audio indicator |
| `assets/victory_defeat_draw_screen_online_duel_match/share_button.png` | 400×172 | Contains transparency. Interactive control artwork |
| `assets/victory_defeat_draw_screen_online_duel_match/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/victory_defeat_draw_screen_online_duel_match/SMILE GIRL.png` | 1764×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/victory_defeat_draw_screen_online_duel_match/SMILE GUY.png` | 1932×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/victory_defeat_draw_screen_online_duel_match/STAR BLOCKS-1.png` | 431×414 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_defeat_draw_screen_online_duel_match/STAR BLOCKS-2.png` | 431×414 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_defeat_draw_screen_online_duel_match/STAR BLOCKS.png` | 402×377 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_defeat_draw_screen_online_duel_match/Stone.png` | 339×270 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_defeat_draw_screen_online_duel_match/victor's_stadium.png` | 681×871 | Contains transparency. Podium / character-on-podium illustration |
| `assets/victory_defeat_draw_screen_online_duel_match/victory.png` | 1152×188 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_defeat_draw_screen_online_duel_match) |
| `assets/victory_screen_solo_match/cloud_1.png` | 1280×600 | Contains transparency. Separate transparent cloud layer |
| `assets/victory_screen_solo_match/cloud_2.png` | 900×460 | Contains transparency. Separate transparent cloud layer |
| `assets/victory_screen_solo_match/CROWN_BLOCKS.png` | 247×206 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_screen_solo_match) |
| `assets/victory_screen_solo_match/next_button.png` | 184×184 | Contains transparency. Interactive control artwork |
| `assets/victory_screen_solo_match/Paper.png` | 192×179 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_screen_solo_match) |
| `assets/victory_screen_solo_match/rematch_home_button.png` | 673×289 | Contains transparency. Interactive control artwork |
| `assets/victory_screen_solo_match/Scissors.png` | 194×200 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_screen_solo_match) |
| `assets/victory_screen_solo_match/score_streak_box.png` | 1225×289 | Contains transparency. Score / audio indicator |
| `assets/victory_screen_solo_match/share_button.png` | 400×172 | Contains transparency. Interactive control artwork |
| `assets/victory_screen_solo_match/Sky.png` | 1572×3408 | Full portrait sky backdrop with baked-in clouds |
| `assets/victory_screen_solo_match/SMILE GIRL.png` | 1764×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/victory_screen_solo_match/SMILE GUY.png` | 1932×2520 | Contains transparency. Avatar expression / profile illustration |
| `assets/victory_screen_solo_match/STAR BLOCKS-1.png` | 431×414 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_screen_solo_match) |
| `assets/victory_screen_solo_match/STAR BLOCKS-2.png` | 431×414 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_screen_solo_match) |
| `assets/victory_screen_solo_match/STAR BLOCKS.png` | 402×377 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_screen_solo_match) |
| `assets/victory_screen_solo_match/Stone.png` | 339×270 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_screen_solo_match) |
| `assets/victory_screen_solo_match/Victory Stadium.png` | 972×1089 | Contains transparency. Podium / character-on-podium illustration |
| `assets/victory_screen_solo_match/victory.png` | 1152×188 | Contains transparency. Screen-specific decorative/title/dialog layer (victory_screen_solo_match) |

## Missing / conflicting reference material

- No standalone restart-confirmation title/frame, LOADING text, countdown numerals, VS label, or OR divider artwork: render pixel typography over matching original assets.
- Login designs contain username plus email; Firebase authenticates email/password. Preserve both visual fields; username is optional at sign-in, required at account creation.
- Room designs show a ten-character sample code; existing service uses six digits. Render the real room code in the designed field without changing backend identity rules.
- Online defeat reference shows a winning score/crown on the left while calling the outcome defeat. Render the actual local result and actual winner/loser positions.
- No standalone online draw reference; implement draw using supplied online draw artwork and paired neutral podiums.
- Some error artwork embeds fixed wording and rematch artwork embeds CAPPY. Dynamic copy uses the same artwork panel with its text region covered in the panel's solid color.
- Google provider configuration and test accounts are not supplied. Preserve the designed Google button and present truthful unavailable/error feedback; do not fabricate authentication.
- Reference descriptions mention image sharing but existing app shares text. Retain actual native share and provide the designed live-result phone preview; document any platform image-export limitation.

## Validation and tracking

Do not label implemented screens complete until screenshots and interactions are checked. Use actual app screenshots at 393×852 and common portrait sizes. Runtime screenshots are separate from source references. Backend tests require available accounts; never seed production rooms with mock screenshots. Record unverified backend/native flows explicitly.

Initial state: all 67 references mapped; implementation pending.

Current state (2026-10-17): all 67 references implemented and screenshot-compared; see `UI_RECONSTRUCTION_PROGRESS.md`, `UI_RECONSTRUCTION_REPORT.md`, `.ui-reconstruction/audit/final-diffs.json` and `.ui-reconstruction/comparisons/`. Statuses in the table above carry the final mean absolute pixel difference (0–255) at 393×852. Existing lockfile changes and untracked home cloud assets are user-owned and preserved.

