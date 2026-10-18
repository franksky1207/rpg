#!/usr/bin/env python3
"""Read-only source audit and diagnostic plots. Never exports sprite layers.

Plots deliberately retain JPEG white/checker backgrounds. Manual landmarks are
alignment hypotheses, not approved pivots. A successful audit is NOT art approval.
"""
import argparse
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'development/combat-animation/batch7'
SHA = {
    'galaxy_attack_body.jpeg': '425771d77267b4c71a621b025cc1cfebfdccf9b23fa1c5882a76dd53f6d5bc04',
    'galaxy_weapon.png': 'a7826c8251cac295c18e407c9754c0bdb71a597a2427d36b086305a6e3edae2d',
    'universe_attack_body.jpeg': '80fb84f81ff41cedd9be2da1d49e7e5cf79d50474d11f167002687350957ec42',
    'universe_weapon.png': '5e19114ece1139e673cd3e8f0af77c4a0e3bf8a1ae09426a34b46bbeaf983fad',
    'higher_body_no_weapon_v2.png': '7dff371cf2aac63478f2b5eada2a85313da2944ca591d20718d15ba94461bb7b',
    'higher_weapon_independent_v2.png': '1bd7d53030efabc1d0c08e1c9659221e9dd323bd16a06a9366a5574fb43494c1',
}
# Source pixels, manually inspected. Never imported by the shipped renderer.
LANDMARKS = {
    'galaxy': dict(bodyGrip=[421,621], masterGrip=[405,610], masterGuard=[462,660], masterTip=[1010,1025], weaponGrip=[230,320], weaponGuard=[350,425], weaponTip=[1230,1120]),
    'universe': dict(bodyGrip=[422,620], masterGrip=[410,615], masterGuard=[465,660], masterTip=[1010,1080], weaponGrip=[245,235], weaponGuard=[370,365], weaponTip=[1230,1200]),
    'higher': dict(bodyGrip=[313,770], masterGrip=[323,753], masterGuard=[390,810], masterTip=[978,1398], weaponGrip=[190,280], weaponGuard=[345,470], weaponTip=[996,1478]),
}


def verify():
    manifest = json.loads((BASE / 'layer-sources/manifest.json').read_text())
    assert manifest['status'] == 'unverified-candidates'
    assert {f['name'] for f in manifest['files']} == set(SHA)
    rows = []
    for f in manifest['files']:
        p = BASE / 'layer-sources' / f['name']
        raw = p.read_bytes()
        assert f['zip_path'] == ('sources/' if f['name'].startswith('higher') else 'candidates/') + f['name']
        assert hashlib.sha256(raw).hexdigest() == f['sha256'] == SHA[f['name']]
        assert len(raw) == f['bytes']
        with Image.open(p) as im:
            im.load()
            assert im.size == (f['width'], f['height'])
            assert im.mode == f['mode'] and im.format == f['format']
            assert ('A' in im.getbands()) == f['has_alpha']
            alpha = im.getchannel('A') if 'A' in im.getbands() else None
            hist = alpha.histogram() if alpha is not None else None
            rows.append({**f, 'actualAlphaRange': alpha.getextrema() if alpha is not None else None,
                         'fullyTransparentPixels': hist[0] if hist else 0,
                         'alphaBounds': alpha.getbbox() if alpha is not None else None,
                         'edgeAlphaMax': max(alpha.crop(box).getextrema()[1] for box in
                            [(0,0,im.width,1),(0,im.height-1,im.width,im.height),(0,0,1,im.height),(im.width-1,0,im.width,im.height)]) if alpha is not None else None})
    review = json.loads((BASE / 'layer-review/review.json').read_text())
    assert review['formalReleaseAllowed'] is False and review['batch'] == 7
    assert {e['id'] for e in review['entries']} == {'era-galaxy','era-universe','era-higher'}
    for e in review['entries']:
        assert e['setAccepted'] is False and e['acceptedLayers'] == [] and e['finalGrip'] is None
        assert len(e['checks']) == 8
        assert set(e['actions']) == {'idle','attack','hit','dodge','return','defeat'}
        assert set(e['actions'].values()) == {'blocked-not-accepted'}
        for f in e['sources']:
            p = Path(f['path'])
            assert p.parent == Path('development/combat-animation/batch7/layer-sources')
            assert f['sha256'] == SHA[p.name]
        assert len(e['sources']) == 2
        p = ROOT / e['diagnostic']['path']
        raw = p.read_bytes()
        assert hashlib.sha256(raw).hexdigest() == e['diagnostic']['sha256']
        assert len(raw) == e['diagnostic']['bytes']
    return rows


def alignment(era):
    p = {k: np.array(v, dtype=float) for k,v in LANDMARKS[era].items()}
    # Fit guard AND tip; expose grip residual rather than silently stretching.
    a = complex(*(p['masterTip']-p['masterGuard'])) / complex(*(p['weaponTip']-p['weaponGuard']))
    m = np.array([[a.real,-a.imag],[a.imag,a.real]])
    t = p['masterGuard'] - m @ p['weaponGuard']
    grip = m @ p['weaponGrip'] + t
    return m, t, {'scale': abs(a), 'rotationDegrees': float(np.degrees(np.angle(a))),
                 'translation': t.tolist(), 'mappedGrip': grip.tolist(),
                 'distanceToBodyGripSourcePx': float(np.linalg.norm(grip-p['bodyGrip'])),
                 'method': 'manual guard/tip similarity fit; approximate landmarks, NOT final grip approval'}


def plots(out):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from matplotlib.transforms import Affine2D
    out.mkdir(parents=True, exist_ok=True)
    recipe = json.loads((BASE / 'mask-recipe.json').read_text())
    geometry = []
    for row in recipe['entries'] + [dict(epoch='higher',file='higher_complete_master_v2.png',footAnchor=[535,1518],headY=20)]:
        era = row['epoch']
        master = np.asarray(Image.open(BASE / 'approved-sources' / row['file']))
        body = np.asarray(Image.open(BASE / 'layer-sources' / ('higher_body_no_weapon_v2.png' if era=='higher' else era+'_attack_body.jpeg')))
        weapon = np.asarray(Image.open(BASE / 'layer-sources' / ('higher_weapon_independent_v2.png' if era=='higher' else era+'_weapon.png')))
        m,t,metrics = alignment(era)
        scale = 430/(row['footAnchor'][1]-row['headY'])
        offset = np.array([256,460.8])-np.array(row['footAnchor'])*scale
        metrics.update(id='era-'+era, diagnostic512GripResidual=metrics['distanceToBodyGripSourcePx']*scale)
        geometry.append(metrics)
        # Each top panel has exactly a 512x512 coordinate space.
        fig,axes = plt.subplots(2,3,figsize=(15.36,10.24),dpi=100)
        def draw(ax,im,transform):
            h,w = im.shape[:2]
            ax.imshow(im,extent=(0,w,h,0),transform=transform+ax.transData,interpolation='lanczos')
        norm = Affine2D().scale(scale).translate(*offset)
        fit = Affine2D(np.array([[m[0,0],m[0,1],t[0]],[m[1,0],m[1,1],t[1]],[0,0,1]]))
        for ax in axes[0]:
            ax.set_facecolor('#233047');ax.set_xlim(0,512);ax.set_ylim(512,0);ax.set_aspect('equal');ax.set_xticks([0,256,512]);ax.set_yticks([0,256,460.8,512])
            ax.plot([256],[460.8],'+',color='lime',markersize=10)
        draw(axes[0,0],master,norm);draw(axes[0,1],body,norm)
        draw(axes[0,2],body,norm);draw(axes[0,2],weapon,fit+norm)
        for ax,title in zip(axes[0],['APPROVED MASTER','INCOMING BODY - SOURCE BACKGROUND RETAINED','DIAGNOSTIC RECOMBINATION - NOT ACCEPTED']): ax.set_title(title,fontsize=9)
        # Native coordinate evidence; no masking, repainting or decontamination.
        for ax in axes[1]: ax.set_facecolor('#233047');ax.set_aspect('equal')
        draw(axes[1,0],master,Affine2D());draw(axes[1,1],weapon,fit)
        g = LANDMARKS[era]['masterGuard'];tip = LANDMARKS[era]['masterTip']
        for ax in axes[1,:2]:
            ax.set_xlim(g[0]-180,tip[0]+40);ax.set_ylim(tip[1]+40,g[1]-180)
            ax.plot(*LANDMARKS[era]['masterGrip'],'+',color='red',markersize=12)
        axes[1,0].set_title('Original sword / grip / leg occlusion',fontsize=9)
        axes[1,1].set_title('Incoming sword fitted at guard + tip (no nonuniform stretch)',fontsize=9)
        draw(axes[1,2],body,Affine2D());draw(axes[1,2],weapon,fit)
        bg=LANDMARKS[era]['bodyGrip'];axes[1,2].set_xlim(bg[0]-100,bg[0]+140);axes[1,2].set_ylim(bg[1]+150,bg[1]-100)
        axes[1,2].plot(*bg,'+',color='lime',markersize=14)
        axes[1,2].plot(*metrics['mappedGrip'],'x',color='red',markersize=14)
        axes[1,2].set_title(f"Fist/handle: green=body, red=fitted grip; residual {metrics['diagnostic512GripResidual']:.1f}px at 512",fontsize=9)
        fig.suptitle(era.upper()+' | read-only source plots | no alpha/hand-depth acceptance | green foot = pivot [0.5,0.9]',fontsize=11)
        fig.tight_layout();fig.savefig(out/(('higher-v2' if era=='higher' else era)+'-review.png'));plt.close(fig)
    return geometry


if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--plots',type=Path);parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    result={'scope':'source integrity, measured alpha and diagnostic alignment; NOT art or six-action acceptance',
            'formalReleaseAllowed':False,'rows':verify(),
            'alignment': plots(args.plots) if args.plots else [dict(id='era-'+era,**alignment(era)[2]) for era in LANDMARKS]}
    text=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if args.output: args.output.write_text(text)
    else: print(text,end='')
