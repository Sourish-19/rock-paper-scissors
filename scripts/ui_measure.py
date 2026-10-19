"""Locate supplied artwork in reference exports; does not modify originals."""
from pathlib import Path
import json
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.ui-reconstruction' / 'audit'
PAIRS = {
    'Home Screen.png': ['home_screen'],
    'Game Mode.png': ['game_mode_screen'],
    'Gender Section - Male.png': ['gender_screen'],
    'Loading Screen.png': ['loading_screen'],
    'LOG-IN PAGE.png': ['authentiction_screen'],
    'SIGN-UP PAGE.png': ['authentiction_screen'],
    'Onboarding Screen 1.png': ['onboarding_screen', 'home_screen'],
    'Onboarding Screen 2.png': ['onboarding_screen'],
    'SETTINGS PAGE.png': ['settings_screen'],
    'Game page.png': ['game_screen'],
    'Start of the game - 3.png': ['game_screen'],
    'VICTORY PAGE - SOLO CHALLENGE.png': ['victory_screen_solo_match'],
    'DEFEAT PAGE - SOLO CHALLENGE.png': ['defeat_screen_solo_match'],
    'DRAW PAGE.png': ['draw_screen_solo_match'],
    'Online Duel.png': ['online_duel_screen'],
    'Online Duel - Hosted a Room.png': ['online_duel_screen'],
    'Online Duel - Victory Page.png': ['victory_defeat_draw_screen_online_duel_match'],
    'No Internet Screen.png': ['No_Internet_Screen'],
    'Oops Screen.png': ['Oops_Screen'],
}
output = {}
for name, folders in PAIRS.items():
    ref = np.array(Image.open(ROOT / 'Game UI' / name).convert('RGB').resize((393, 852), Image.Resampling.BOX))
    found = []
    for folder in folders:
        for path in sorted((ROOT / 'assets' / folder).glob('*.png')):
            if path.name in ('Sky.png', 'half_time_screen.png', 'grass_Background.png', 'Exclude.png'):
                continue
            original = Image.open(path).convert('RGBA')
            scales = [0.25, 0.5, 1.0]
            if original.height > 850:
                scales += [0.10, 0.12, 0.125, 0.13, 0.14, 0.15, 0.1667, 0.175, 0.2, 0.225, 0.3]
            best = None
            for scale in scales:
                w, h = round(original.width * scale), round(original.height * scale)
                if w < 8 or h < 8 or w > 393 or h > 852:
                    continue
                arr = np.array(original.resize((w, h), Image.Resampling.BOX))
                mask = (arr[:,:,3] > 245).astype(np.uint8) * 255
                if np.count_nonzero(mask) < 20:
                    continue
                result = cv2.matchTemplate(ref, arr[:,:,:3], cv2.TM_SQDIFF_NORMED, mask=mask)
                result[~np.isfinite(result)] = 10
                score, _, position, _ = cv2.minMaxLoc(result)
                if best is None or score < best['error']:
                    best = {'asset': path.relative_to(ROOT).as_posix(), 'x': position[0], 'y': position[1], 'width': w, 'height': h, 'error': round(score, 5)}
            if best and best['error'] < 0.12:
                found.append(best)
    output[name] = found
    print(name, len(found), flush=True)
(OUT / 'measurements.json').write_text(json.dumps(output, indent=2), encoding='utf-8')
