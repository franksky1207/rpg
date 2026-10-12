"""Real GLB round-trip sampling/rendering; no runtime Renderer integration."""
import bpy,pathlib,sys,argparse
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
p=argparse.ArgumentParser();p.add_argument('--actor',required=True);p.add_argument('--quality',default='high');args=p.parse_args(sys.argv[sys.argv.index('--')+1:]);reset();bpy.context.scene.render.fps=30
file=HERE/'player'/f'candidate-{args.quality}.glb' if args.actor=='player' else HERE/'enemies'/args.actor/'candidate.glb'
bpy.ops.import_scene.gltf(filepath=str(file));rig=next(o for o in bpy.data.objects if o.type=='ARMATURE')
height={'player':1.94,'normal':1.85,'elite':2.5,'boss':3.2}[args.actor];setup_camera(height,args.actor=='player');bpy.context.scene.cycles.samples=32
out=HERE/'review/glb-roundtrip'/args.actor;out.mkdir(parents=True,exist_ok=True)
rows=[]
for name in ACTIONS:
 acts=[a for a in bpy.data.actions if a.name.startswith('B2_'+name)];assert len(acts)==1,(name,[a.name for a in bpy.data.actions]);rig.animation_data.action=acts[0]
 for tick in [0,9,21]:
  frame=acts[0].frame_range[0]+tick;bpy.context.scene.frame_set(int(frame));bpy.context.view_layer.update();bpy.context.scene.render.filepath=str(out/f'{name}-{tick:02}.png');bpy.ops.render.render(write_still=True);rows.append({'action':name,'frame':tick,'timeMs':tick*1000/30,'importFrame':frame,'importAction':acts[0].name,'joints':len(rig.data.bones)})
write(out/'samples.json',{'schema':'cw.t2b2.glb-roundtrip','version':1,'glbSHA':sha(file),'actor':args.actor,'quality':args.quality,'rows':rows,'playerEquipment':'not embedded; separate original 15 GLBs, verified by browser tests','sameCamera':True,'sameSourceAction':True})
print('PASS real GLB round-trip import, six actions sampled and rendered')
