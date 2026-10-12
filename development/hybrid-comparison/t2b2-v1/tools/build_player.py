"""Add isolated combat pose studies to accepted rig; no accepted file rewritten."""
import bpy,sys,pathlib,math
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
guard_build([HERE/'player/animation-source.blend'])
source=ROOT/'development/3d-source/equipment/ancient-ruins-v1/ancient-ruins.blend'
bpy.ops.wm.open_mainfile(filepath=str(source));bpy.context.preferences.filepaths.save_version=0
rig=bpy.data.objects['CW_Humanoid_Rig_v1'];body=bpy.data.objects['CW_Player_Foundation'];rig.data.pose_position='POSE'
contract=json.loads((ROOT/'development/3d-source/equipment/ancient-ruins-v1/rig-contract.json').read_text())
for row in contract['bones']:
 b=rig.data.bones[row['name']];assert (b.parent.name if b.parent else None)==row['parent'];assert max(abs(b.matrix_local[i][j]-row['matrix'][i][j]) for i in range(4) for j in range(4))<1e-6
assert len(rig.data.bones)==53
for n,row in contract['sockets'].items():
 o=bpy.data.objects[n];assert o.parent_bone==row['bone'];assert max(abs(o.matrix_local[i][j]-row['local'][i][j]) for i in range(4) for j in range(4))<1e-6
poses={
 'idle':[(1,{}),(11,{'chest':(1.3,0,0),'head':(-1,0,0)}),(22,{})],
 'attack':[(1,{}),(5,{'chest':(-7,0,-14),'upper_arm.R':(-48,12,-10),'forearm.R':(-62,0,0),'hand.R':(0,0,-10),'thigh.L':(12,0,0),'shin.L':(-12,0,0)}),(10,{'chest':(12,0,16),'upper_arm.R':(65,0,8),'forearm.R':(-32,0,0),'upper_arm.L':(-20,0,-5),'thigh.R':(18,0,0),'shin.R':(-18,0,0)}),(15,{'chest':(7,0,8),'upper_arm.R':(35,0,0),'forearm.R':(-18,0,0)}),(22,{})],
 'hit':[(1,{}),(6,{'chest':(-18,0,10),'head':(12,0,-8),'upper_arm.L':(-25,0,15),'upper_arm.R':(-18,0,-12),'thigh.L':(18,0,0),'shin.L':(-18,0,0)}),(13,{'chest':(7,0,-4),'head':(-5,0,0)}),(22,{})],
 'dodge':[(1,{}),(7,{'pelvis':(8,0,-16),'chest':(15,0,-22),'head':(-8,0,12),'upper_arm.R':(-30,0,15),'forearm.R':(-35,0,0),'thigh.L':(28,0,-10),'shin.L':(-40,0,0),'thigh.R':(12,0,8),'shin.R':(-20,0,0)}),(15,{'chest':(6,0,-10),'thigh.L':(10,0,-5),'shin.L':(-15,0,0)}),(22,{})],
 'return':[(1,{'chest':(12,0,16),'upper_arm.R':(65,0,8),'forearm.R':(-32,0,0)}),(8,{'chest':(-4,0,-5),'upper_arm.R':(25,0,-5),'forearm.R':(-22,0,0),'thigh.R':(15,0,0),'shin.R':(-20,0,0)}),(15,{'upper_arm.R':(8,0,0),'thigh.L':(10,0,0),'shin.L':(-10,0,0)}),(22,{})],
 'defeat':[(1,{}),(7,{'chest':(-12,0,7),'upper_arm.R':(-22,0,-15)}),(14,{'pelvis':(22,0,0),'chest':(30,0,-12),'head':(25,0,0),'thigh.L':(-28,0,0),'thigh.R':(-28,0,0),'shin.L':(55,0,0),'shin.R':(55,0,0)}),(22,{'pelvis':(35,0,0),'chest':(48,0,-15),'head':(35,0,0),'upper_arm.L':(15,0,15),'upper_arm.R':(22,0,-20),'thigh.L':(-38,0,0),'thigh.R':(-38,0,0),'shin.L':(75,0,0),'shin.R':(75,0,0)})]}
for name in ACTIONS:
 act=animation(rig,name,poses[name])
 # Reversible right-hand grasp, authored in candidate only; independent fingers.
 for b in rig.pose.bones:
  if b.name.endswith('.R') and any(b.name.startswith(f+'_') for f in ['index','middle','ring','little','thumb']):
   for frame in [1,5,10,15,22]:
    b.rotation_euler.x=math.radians(35 if b.name.startswith('thumb') else 48);b.keyframe_insert('rotation_euler',frame=frame)
setup_camera(1.94,True);rig.animation_data.action=bpy.data.actions['B2_idle'];bpy.context.scene.frame_set(1)
folder=HERE/'player';folder.mkdir(exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(folder/'animation-source.blend'),compress=True)
# Original source LOD policy and face tint correction, applied only to candidates.
sys.path.insert(0,str(ROOT/'development/3d-source/characters/player-v1'))
from lod_surface import configure_lod
from export_lods import neutralize_face_tint
stats={}
for quality,ratio in [('low',.05),('medium',.16),('high',.64)]:
 lod=configure_lod(body,ratio);bpy.context.view_layer.objects.active=body;bpy.ops.object.modifier_move_up(modifier=lod.name)
 path=folder/f'candidate-{quality}.glb';export(rig,path,[body]+[o for o in bpy.data.objects if o.type=='EMPTY']);neutralize_face_tint(path)
 stats[quality]={'bytes':path.stat().st_size,'sha256':sha(path),'ratio':ratio};body.modifiers.remove(lod)
write(folder/'animation-contract.json',{'schema':'cw.t2b2.player-animation','version':1,'status':'prototype-pending-art-and-extreme-pose-approval','rigContract':'cw.humanoid.rig.v1','bones':53,'sockets':list(contract['sockets']),'originalEquipment':'15 accepted GLBs remain unchanged; no equipment embedded in candidate','actions':ACTIONS,'durationMs':700,'fps':30,'authoring':'new local joint poses, not idle rename or rigid whole-model rotation','sourceSHA':sha(source),'rigContractSHA':sha(ROOT/'development/3d-source/equipment/ancient-ruins-v1/rig-contract.json'),'lod':stats,'camera':{'yawDegrees':35,'mirrorForPlayer':True,'pitchDegrees':15},'defeatAuthority':'visual asset only; requires confirmed HP zero in B3; no death on action-budget stop'})
