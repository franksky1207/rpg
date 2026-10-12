"""Export saved editable candidate sources; never reconstruct/overwrite art.
--output /tmp/b2-reexport (byte comparison) or --output development/... (explicit)
"""
import bpy,sys,pathlib,argparse
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
p=argparse.ArgumentParser();p.add_argument('--output',required=True);p.add_argument('--actor',choices=['normal','elite','boss','player'],required=True);args=p.parse_args(sys.argv[sys.argv.index('--')+1:]);out=pathlib.Path(args.output);out.mkdir(parents=True,exist_ok=True)
if args.actor!='player':
 bpy.ops.wm.open_mainfile(filepath=str(HERE/'enemies'/args.actor/'source.blend'));rig=next(o for o in bpy.data.objects if o.type=='ARMATURE');export(rig,out/'candidate.glb')
else:
 bpy.ops.wm.open_mainfile(filepath=str(HERE/'player/animation-source.blend'));rig=bpy.data.objects['CW_Humanoid_Rig_v1'];rig.data.pose_position='POSE';body=bpy.data.objects['CW_Player_Foundation']
 sys.path.insert(0,str(ROOT/'development/3d-source/characters/player-v1'));from lod_surface import configure_lod
 from export_lods import neutralize_face_tint
 for q,r in [('low',.05),('medium',.16),('high',.64)]:
  lod=configure_lod(body,r);bpy.context.view_layer.objects.active=body;bpy.ops.object.modifier_move_up(modifier=lod.name);dest=out/f'candidate-{q}.glb';export(rig,dest,[body]+[o for o in bpy.data.objects if o.type=='EMPTY']);neutralize_face_tint(dest);body.modifiers.remove(lod)
print('PASS exported saved source without rewriting source')
