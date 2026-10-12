"""Generate a tests-only AgX LUT from Blender 4.3.2's exact OCIO configuration.
PYTHONPATH=/tmp/t2b2-python python3 .../color_lut.py
Log-domain texture carries high dynamic range; no scheme quality is reduced.
"""
import pathlib,json,hashlib,argparse
import numpy as np
from PIL import Image
import PyOpenColorIO as OCIO
HERE=pathlib.Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--output',default='/tmp/t2b2-color-lut');args=p.parse_args()
folder=pathlib.Path(args.output);folder.mkdir(parents=True,exist_ok=True)
config=pathlib.Path('/usr/share/blender/datafiles/colormanagement/config.ocio')
c=OCIO.Config.CreateFromFile(str(config));cpu=c.getProcessor(OCIO.DisplayViewTransform(src='Linear Rec.709',display='sRGB',view='AgX')).getDefaultCPUProcessor()
n=65;data=np.zeros((n,n*n,4),np.uint8)
for blue in range(n):
    for green in range(n):
        for red in range(n):
            rgb=[2**(-12+20*index/(n-1)) for index in [red,green,blue]]
            data[green,blue*n+red,:3]=np.round(np.clip(cpu.applyRGB(rgb),0,1)*255);data[green,blue*n+red,3]=255
Image.fromarray(data).save(folder/'blender-agx-log-lut.png',optimize=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
(folder/'lut.json').write_text(json.dumps({'schema':'cw.t2b2.ocio-lut','version':1,'blender':'4.3.2','ocioVersion':OCIO.__version__,'configSHA':sha(config),'processor':'Linear Rec.709 -> display sRGB view AgX, no look, exposure 0, gamma 1','dimensions':[n*n,n],'cubeSize':n,'inputDomain':'per-channel log2, -12..8 stops','sampling':'trilinear using two bilinear blue slices, 8-bit sRGB output, upload gammaSpace=false','license':'redistribution-unverified; generated in /tmp only from locally installed Blender OCIO, no third-party LUT committed','sha256':sha(folder/'blender-agx-log-lut.png'),'notRuntimeRenderer':True,'lightingResidualGate':'LUT fixes display transform; actual PBR/area-light differences require pixel comparisons, not presumed equal'},indent=2)+'\n')
print('PASS locally generated same Blender AgX transform; redistribution not approved')
