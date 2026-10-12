"""Actual full-palette A/B/C files, costs and conservative decoded estimates.
Not HTTP observations, texture GPU bytes, FPS or a scheme selection.
"""
import pathlib,json,hashlib,struct
from PIL import Image
HERE=pathlib.Path(__file__).resolve().parents[1];ROOT=HERE.parents[2]
registry=json.loads((ROOT/'assets/3d/asset-registry.json').read_text());tiers=json.loads((HERE/'repair-r1/quality-tiers.json').read_text())
def row(p):
    b=p.read_bytes();d={'path':str(p.relative_to(ROOT)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'gpuMeasured':False}
    if p.suffix=='.png':
        im=Image.open(p);d['decodedImagePlaneBytesEstimate']=im.width*im.height*(4 if im.mode=='RGBA' else 2)
    if p.suffix=='.glb':
        j=json.loads(b[20:20+struct.unpack_from('<I',b,12)[0]]);d['declaredBinaryBufferBytesEstimate']=sum(x['byteLength'] for x in j['buffers'])
    return d
common=list((HERE/'shared').glob('*.png'))+list((HERE/'repair-r1/cues').glob('*.png'))
report={'schema':'cw.t2b2.actual-resource-cost','version':1,'basis':'full representative palette: six clips / three enemies / G007 five-slot palette, not observed network or GPU; empty/mixed selects subset later','conditions':'same master, 128/192/256 grids proposed; same camera/actions/VFX; B3 native pixel-budget/material Gate unpassed','tiers':{},'gpuBytes':'unavailable','cacheDedup':'not assumed'}
for tier in ['low','medium','high']:
    atlas=[HERE/f['path'] for f in tiers['tiers'][tier]['files']];player=[HERE/f'player/candidate-{tier}.glb']
    gear=[ROOT/next(a['path'] for a in registry['assets'] if a['id']==registry['equipment'][slot][tier]) for slot in ['weapon','helmet','armor','shoes','accessory']]
    enemies=[HERE/f'enemies/{a}/candidate.glb' for a in ['normal','elite','boss']]
    enemyAtlas=[p for p in atlas if ('enemies' in p.parts if tier=='high' else any(a in p.parts for a in ['normal','elite','boss']))]
    schemes={'A':atlas+common,'B':player+gear+enemyAtlas+common,'C':player+gear+enemies+common};report['tiers'][tier]={}
    for scheme,files in schemes.items():
        data=[row(p) for p in sorted(set(files))]
        report['tiers'][tier][scheme]={'files':data,'encodedBytes':sum(x['bytes'] for x in data),'decodedImagePlaneBytesEstimate':sum(x.get('decodedImagePlaneBytesEstimate',0) for x in data),'declaredGLBBufferBytesEstimate':sum(x.get('declaredBinaryBufferBytesEstimate',0) for x in data),'notGPUOrFPS':True}
(HERE/'repair-r1/resource-cost-comparison.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('PASS actual A/B/C full-palette file costs; GPU and observed network unavailable')
