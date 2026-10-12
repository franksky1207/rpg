"""Correct candidate-only root contact using actually deformed meshes.
Idempotent: clear root translations before sampling, then key all 22 samples.
Never edits rest bones, sockets, mesh, equipment or accepted sources.
"""
import bpy,pathlib,sys
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
report=[]
for actor in ['normal','elite','boss','player']:
 path=HERE/'player/animation-source.blend' if actor=='player' else HERE/'enemies'/actor/'source.blend';bpy.ops.wm.open_mainfile(filepath=str(path));bpy.context.preferences.filepaths.save_version=0
 rig=next(o for o in bpy.data.objects if o.type=='ARMATURE');rig.data.pose_position='POSE';root=rig.pose.bones['root'];meshes=[o for o in bpy.data.objects if o.type=='MESH'];rows=[]
 axis=(rig.matrix_world.to_3x3()@root.bone.matrix_local.to_3x3()).inverted()@Vector((0,0,1))
 for name in ACTIONS:
  act=bpy.data.actions['B2_'+name];rig.animation_data.action=act
  for curve in list(act.fcurves):
   if curve.data_path=='pose.bones["root"].location':act.fcurves.remove(curve)
  corrections=[]
  for f in range(1,23):
   bpy.context.scene.frame_set(f);root.location=(0,0,0);bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get();minz=100
   for o in meshes:
    ev=o.evaluated_get(dg);m=ev.to_mesh();minz=min(minz,min((o.matrix_world@v.co).z for v in m.vertices));ev.to_mesh_clear()
   corrections.append(max(0,.001-minz))
  for f,correction in enumerate(corrections,1):root.location=axis*correction;root.keyframe_insert('location',frame=f)
  for c in act.fcurves:
   if c.data_path=='pose.bones["root"].location':
    for key in c.keyframe_points:key.interpolation='LINEAR'
  rows.append({'action':name,'rootLiftMetres':corrections})
 rig.animation_data.action=bpy.data.actions['B2_idle'];bpy.context.scene.frame_set(1);bpy.ops.wm.save_as_mainfile(filepath=str(path),compress=True);report.append({'actor':actor,'sourceSHA':sha(path),'actions':rows})
write(HERE/'review/ground-correction.json',{'schema':'cw.t2b2.ground-correction','version':1,'method':'actual deformed mesh minimum Z; candidate-only non-negative root lift, no rest contract change','actors':report,'artApproval':False})
print('PASS candidate root contact correction, no accepted source edited')
