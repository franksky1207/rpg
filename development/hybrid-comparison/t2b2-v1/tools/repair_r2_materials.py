"""Targeted sRGB scalar-texture export repair; preserves effective roughness.
No display filter, exposure fit, official asset or animation changes.
"""
import bpy,pathlib,sys,json,hashlib,subprocess
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import HERE,write,sha
out=HERE/'repair-r2';out.mkdir(exist_ok=True)
revision=out/'revision.json'
if revision.exists():raise RuntimeError('r2 already authored; preserve revision before editing')
base=subprocess.check_output(['git','rev-parse','HEAD'],cwd=HERE).decode().strip()
inv=json.loads((HERE/'inventory.json').read_text())
write(revision,{'schema':'cw.t2b2.repair-r2-revision','baselineHEAD':base,'before':inv['files'],'versionMechanism':'Git baseline HEAD retains every original binary; no formal source changed'})
rows=[]
for actor in ['normal','elite','boss']:
 file=HERE/'enemies'/actor/'source.blend';before=sha(file)
 bpy.ops.wm.open_mainfile(filepath=str(file));bpy.context.preferences.filepaths.save_version=0
 mat=bpy.data.materials['Relic_Forged_Panels'];node=next(n for n in mat.node_tree.nodes if n.type=='TEX_IMAGE')
 original=node.image;assert original.colorspace_settings.name=='sRGB'
 values=list(original.pixels);linear=[]
 for i,v in enumerate(values):linear.append(v if i%4==3 else (v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4))
 image=bpy.data.images.new('original-panel-roughness-linear-r2',width=64,height=64,alpha=True)
 image.colorspace_settings.name='Non-Color';image.pixels.foreach_set(linear)
 image.filepath_raw=str(out/'panel-roughness-linear.png');image.file_format='PNG';image.save();image.pack();node.image=image
 bpy.ops.wm.save_as_mainfile(filepath=str(file))
 rows.append({'actor':actor,'beforeSourceSHA':before,'afterSourceSHA':sha(file),'beforeTextureColorSpace':'sRGB','afterTextureColorSpace':'Non-Color','operation':'IEC sRGB decode to linear scalar before PNG quantization; same physical source roughness, not changing artistic roughness to old raw sRGB bytes','seamBeforeEncoded':values[0],'seamSourceLinear':linear[0],'seamAfterStored':image.pixels[0]})
write(out/'material-repair.json',{'schema':'cw.t2b2.r2-material-repair','rows':rows,'rootCause':'glTF exporter packs sRGB texture bytes unchanged into linear metallicRoughness G; source shader decodes sRGB while native GLB reads raw scalar','formalAssetsModified':False,'artApproved':False})
