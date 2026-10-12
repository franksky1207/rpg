"""Exact repair risks: actual decoded tiers/cues, all clips/subsets, continuity.
Never replaces the original pixel/GLB/rig tests or approves art/hardware.
"""
import pathlib,json,hashlib,itertools
import numpy as np
from PIL import Image
HERE=pathlib.Path(__file__).resolve().parents[1]
def load(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
after=load(HERE/'repair-r1/geometry-after.json');before=load(HERE/'repair-r1/geometry-before.json')
qc=load(HERE/'review/blender-qc.json')
assert sum(len(c['probes']) for a in qc['actors'] for c in a['actions'])==528
assert all(p['belowGroundMetres']==0 for a in qc['actors'] for c in a['actions'] for p in c['probes'])
assert len(after['frames'])==len(before['frames'])==132
assert after['sourceSHA']==sha(HERE/'player/animation-source.blend') and after['sourceSHA']!=before['sourceSHA']
# The unchanged weighted sole deforms slightly below its rest ankle plane.
# A constant authored +3mm target clears it; test fixed targets and movement,
# not a relaxed displacement threshold or renamed collision number.
for r in after['frames']:
    for a in r['ankles'].values():
        assert np.max(np.abs(np.array(a['headMetres'])-(np.array(a['restHeadMetres'])+[0,0,.003])))<1e-5
for mesh in ['CW_Relic_accessory','CW_Relic_shoes','CW_Relic_helmet']:
    for frame in after['frames']:
        slot=next(s for s in frame['slots'] if s['mesh']==mesh)
        assert slot['threeRayInsideCountOver6mm']==0,(mesh,frame['action'],frame['frame'])
for frame in before['frames']+after['frames']:
    slot=next(s for s in frame['slots'] if s['mesh']=='CW_Relic_accessory')
    assert slot['surfaceTrianglePairs']==0
def deepest(data,mesh):return max(s['maxThreeRayInsideMetres'] for r in data['frames'] for s in r['slots'] if s['mesh']==mesh)
assert deepest(after,'CW_Relic_armor')<deepest(before,'CW_Relic_armor')
assert after['collisionGate']=='pending-review-not-auto-approved'
meta=load(HERE/'player/atlases/atlas.json');samples=load(HERE/'review/player-pose-samples.json')['samples']
assert len(samples)==132
def pose(action,frame):return next(r['joints'] for r in samples if r['action']==action and r['frame']==frame)
strike,returned=pose('attack',9),pose('return',0)
assert max(np.max(np.abs(np.array(strike[k])-np.array(returned[k]))) for k in strike)<1e-5,'Visible jump at strike->return'
for action in ['idle','attack','hit','dodge','return']:
    end,start=pose(action,21),pose('idle',0)
    assert max(np.max(np.abs(np.array(end[k])-np.array(start[k]))) for k in end)<1e-5,(action,'idle continuity')
tiers=load(HERE/'repair-r1/quality-tiers.json')
for tier,budget in [('low',128),('medium',192),('high',256)]:
    row=tiers['tiers'][tier];assert row['sourcePixelBudget']==budget
    total=decoded=0
    for f in row['files']:
        path=HERE/f['path'];assert sha(path)==f['sha256'];total+=path.stat().st_size
        im=Image.open(path);im.load();plane=im.width*im.height*(4 if im.mode=='RGBA' else 2);assert plane==f['decodedPlaneBytesEstimate'];decoded+=plane
    assert total==row['encodedBytes'] and decoded==row['decodedPlaneBytesEstimate']
    if tier!='high':
        for actor in ['player','normal','elite','boss']:
            p=HERE/f'repair-r1/tiers/{tier}/{actor}/atlas.json';m=load(p);master=HERE/m['masterMetadata'];assert sha(master)==m['masterSHA'];src=load(master);assert m['sourceSHA']==src['sourceSHA']
            for r in m['rows']:
                assert len(r['frames'])==22 and r['durationMs']==700 and not r['mipmap']
                im=Image.open(p.parent/r['rgba']);zz=Image.open(p.parent/r['depth'])
                for frame in r['frames']:
                    x,y,w,h=frame['rect'];a=np.array(im.crop((x,y,x+w,y+h)));z=np.array(zz.crop((x,y,x+w,y+h)));assert np.all(a[a[:,:,3]==0]==0);assert np.all(z[a[:,:,3]==0]==65535)
fallback=load(HERE/'repair-r1/g006-fallback.json');assert fallback['availability']=='unavailable' and fallback['selectedHelmetLayer'] is None and fallback['strategy']=='text-degradation'
mapping=load(HERE/'repair-r1/cues/mapping.json');assert mapping['budget']=={'maxSprites':1,'maxOpacity':.65,'sameForABC':True};assert mapping['mappings']['drain']['actorClip']=='idle'
colors=[]
for cue in ['crit','counter','drain']:
    images=[np.array(Image.open(HERE/f'repair-r1/cues/{cue}-{i:02}.png').convert('RGBA')) for i in range(8)]
    assert any(np.count_nonzero(im[:,:,3])>10 for im in images),'Cue is blank';assert len({hashlib.sha256(im.tobytes()).hexdigest() for im in images})>2,'Static fake cue'
    colors.append(hashlib.sha256(images[2].tobytes()).hexdigest())
assert len(set(colors))==3
costs=load(HERE/'repair-r1/resource-cost-comparison.json')
assert costs['gpuBytes']=='unavailable'
for tier in ['low','medium','high']:
    for scheme in ['A','B','C']:
        cost=costs['tiers'][tier][scheme];total=0
        for f in cost['files']:
            p=pathlib.Path(f['path']);assert sha(p)==f['sha256'];assert p.stat().st_size==f['bytes'];total+=f['bytes']
        assert total==cost['encodedBytes'] and cost['notGPUOrFPS']
print('PASS full-frame back/shoe/helmet probes, armor improvement, planted feet, joint continuity, actual tiers/cues/fallback (no art/GPU approval)')
