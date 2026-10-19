"""Read original artwork and create inspection-only inventories/contact sheets."""
from pathlib import Path
import hashlib
import json
import math
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.ui-reconstruction' / 'audit'
OUT.mkdir(parents=True, exist_ok=True)
FONT = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 13)

def inventory(folder):
    entries = []
    for path in sorted((ROOT / folder).rglob('*')):
        if not path.is_file():
            continue
        data = path.read_bytes()
        entry = {'path': path.relative_to(ROOT).as_posix(), 'bytes': len(data),
                 'sha256': hashlib.sha256(data).hexdigest()}
        if path.suffix.lower() == '.png':
            with Image.open(path) as image:
                image.load()
                rgba = image.convert('RGBA')
                entry.update(width=image.width, height=image.height, mode=image.mode,
                             alphaRange=rgba.getchannel('A').getextrema(),
                             contentBounds=rgba.getbbox())
        entries.append(entry)
    return entries

def sheets(entries, prefix, columns, rows, cell_width, image_height):
    entries = [entry for entry in entries if 'width' in entry]
    cell_height = image_height + 55
    for page in range(math.ceil(len(entries) / (columns * rows))):
        batch = entries[page * columns * rows:(page + 1) * columns * rows]
        sheet = Image.new('RGB', (columns * cell_width, math.ceil(len(batch) / columns) * cell_height), '#e7e7e7')
        draw = ImageDraw.Draw(sheet)
        for index, entry in enumerate(batch):
            x, y = index % columns * cell_width, index // columns * cell_height
            for yy in range(y, y + image_height, 12):
                for xx in range(x, x + cell_width, 12):
                    draw.rectangle((xx, yy, xx + 11, yy + 11), fill='#b8b8b8' if ((xx-x)//12+(yy-y)//12)%2 else '#eeeeee')
            with Image.open(ROOT / entry['path']) as image:
                image = image.convert('RGBA')
                image.thumbnail((cell_width - 12, image_height - 8), Image.Resampling.NEAREST)
                sheet.paste(image, (x + (cell_width - image.width)//2, y + (image_height-image.height)//2), image)
            name = entry['path'].split('/')[-1]
            lines = [name[i:i+max(20, cell_width//8)] for i in range(0, len(name), max(20, cell_width//8))]
            label = '\n'.join(lines[:2]) + f"\n{entry['width']}x{entry['height']}"
            draw.text((x+5, y+image_height+3), label, font=FONT, fill='black')
        sheet.save(OUT / f'{prefix}-{page+1:02}.png')

designs = inventory('Game UI')
assets = inventory('assets')
(OUT / 'inventory.json').write_text(json.dumps({'designs': designs, 'assets': assets}, indent=2), encoding='utf-8')
sheets(designs, 'designs', 4, 2, 393, 852)
for folder in sorted({entry['path'].split('/')[1] for entry in assets}):
    sheets([entry for entry in assets if entry['path'].split('/')[1] == folder], 'assets-' + folder, 4, 5, 250, 210)
print(json.dumps({'designs': len(designs), 'assets': len(assets), 'sheets': [p.name for p in OUT.glob('*.png')]}))
