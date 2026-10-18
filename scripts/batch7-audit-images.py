#!/usr/bin/env python3
"""Read-only image audit; never edits the approved masters or candidate images."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'development/combat-animation/batch7'
source = json.loads((BASE / 'approved-sources/manifest.json').read_text())
candidate = json.loads((BASE / 'candidates/manifest.json').read_text())
rows = []
for item in source['files']:
    file = BASE / 'approved-sources' / Path(item['path']).name
    raw = file.read_bytes()
    with Image.open(file) as image:
        assert image.size == (item['width'], item['height'])
        assert image.mode == item['mode']
        assert image.format == ('JPEG' if item['epoch'] == 'universe' else 'PNG')
        assert len(raw) == item['bytes']
        assert hashlib.sha256(raw).hexdigest() == item['sha256']
        if item['epoch'] == 'galaxy':
            alpha = image.getchannel('A')
            assert alpha.getextrema() == (0, 255)
            assert all(alpha.getpixel(p) == 0 for p in [(0, 0), (1253, 0), (0, 1253), (1253, 1253)])
            rows.append({'epoch': item['epoch'], 'sourceAlphaBounds': alpha.getbbox(), 'sourceAlphaRange': alpha.getextrema(), 'transparentPixels': alpha.histogram()[0]})
        else:
            rows.append({'epoch': item['epoch'], 'sourceAlpha': 'absent; RGB background matte'})
for item in candidate['entries']:
    if item['epoch'] == 'higher':
        assert item['asset'] is None and item['replacementVersion'] == 2
        assert item['acceptedLayers'] == [] and item['formalBattleAllowed'] is False
        rows.append({'id':item['id'], 'candidateAsset':'absent; precise alpha and grip blocked'})
        continue
    file = ROOT / item['asset']['path']
    raw = file.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == item['asset']['sha256']
    assert len(raw) == item['asset']['bytes']
    with Image.open(file) as image:
        assert image.format == 'WEBP' and image.size == (512, 512)
        assert image.mode == 'RGBA'
        alpha = image.getchannel('A')
        bounds = alpha.getbbox()
        assert bounds and all(image.getchannel('A').getpixel(p) == 0 for p in [(0, 0), (511, 0), (0, 511), (511, 511)])
        assert bounds[0] > 0 and bounds[1] > 0 and bounds[2] < 512 and bounds[3] < 512
        rows.append({'id': item['id'], 'candidateAlphaBounds': bounds, 'transparentPixels': alpha.histogram()[0], 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()})
print(json.dumps({'scope': 'format/dimensions/alpha/hash only; not precise matte or animation acceptance', 'formalReleaseAllowed': False, 'rows': rows}, ensure_ascii=False, indent=2))
