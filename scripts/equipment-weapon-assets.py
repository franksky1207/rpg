#!/usr/bin/env python3
"""Check delivered attack layers, original character integrity and weapon readiness.
Image generation is the art source. This tool validates bytes; it never paints placeholder art.
"""
import hashlib,json,io
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def sha(b):return hashlib.sha256(b).hexdigest()
def validate(root=ROOT):
    registry=json.loads((root/'development/equipment-2_5d/weapons-v1/registry.json').read_text())
    original=json.loads((root/'development/equipment-2_5d/v1/registry.json').read_text())
    assert registry['schema']=='cw.weapon-layers.v1'
    assert [e['id'] for e in registry['entries']]==['g005','g007','g018']
    for e in registry['entries']:
        o=next(o for o in original['entries'] if o['id']==e['id'])
        assert sha((root/o['asset']['path']).read_bytes())==o['asset']['sha256'],'original changed'
        assert e['source']['tool']=='image_gen' and e['source']['licenseBasis']=='user-authorized-development-generation','weapon art license metadata missing'
        assert e['weaponAnimationStatus']=='complete' and e['template']=='one-hand-blade'
        assert e['depth']=='front-with-grip-occlusion' and len(e['grip'])==2 and all(.1<x<.9 for x in e['grip'])
        assert 1<e['windup']<3 and 3<e['strike']<5 and .01<=e['handRadius']<=.04
        for layer in ['body','weapon']:
            a=e[layer];p=Path(a['path']);assert p.as_posix()==f"development/equipment-2_5d/weapons-v1/{e['id']}/{'attack-body' if layer=='body' else 'weapon'}.webp"
            raw=(root/p).read_bytes();assert sha(raw)==a['sha256'] and len(raw)==a['bytes'] and 1000<len(raw)<800000
            im=Image.open(io.BytesIO(raw));im.load();assert im.format=='WEBP' and im.size==(512,512)
            alpha=im.convert('RGBA').getchannel('A');assert alpha.getextrema()[0]==0 and alpha.getextrema()[1]>=250
            coverage=sum(alpha.histogram()[32:]);assert coverage>(1000 if layer=='body' else 300)
            assert all(alpha.getpixel(x)==0 for x in [(0,0),(511,0),(0,511),(511,511)])
            assert alpha.getpixel(tuple(round(x*512) for x in e['grip']))>32,'empty grip'
        assert e['body']['sha256']!=o['asset']['sha256'] and e['body']['sha256']!=e['weapon']['sha256']
        # Source PNG and historical review SHA are retired evidence only.
        # Delivered layer SHA, decode, alpha, grip and original-character
        # invariants above remain mandatory.
    return registry
if __name__=='__main__':
    r=validate();print('PASS three real weapon layers, three repaired bases, delivered SHA, grip/alpha, original character bytes unchanged')
