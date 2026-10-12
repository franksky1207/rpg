"""Unhidden complete G007 meshes in actual front/side/back Blender poses."""
import bpy,sys,pathlib,math,argparse
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
p=argparse.ArgumentParser();p.add_argument('--baseline',default='/tmp/t2b2-baseline/assets/player/animation-source.blend');args=p.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
dest=HERE/'repair-r1/pose-views';dest.mkdir(parents=True,exist_ok=True);rows=[]
for version,path in [('before',pathlib.Path(args.baseline)),('after',HERE/'player/animation-source.blend')]:
    bpy.ops.wm.open_mainfile(filepath=str(path));rig=bpy.data.objects['CW_Humanoid_Rig_v1'];s=bpy.context.scene;s.cycles.samples=32
    assert all(not o.hide_render for o in bpy.data.objects if o.type=='MESH'),'Do not hide geometry for collision review'
    center=Vector((0,0,.97));original=s.camera.matrix_world.copy()
    for action in ACTIONS:
        rig.animation_data.action=bpy.data.actions['B2_'+action]
        for frame in ([5,6] if action=='hit' else [10,22]):
            s.frame_set(frame)
            for view,yaw in [('front',-35),('side',-90),('back',180)]:
                a=math.radians(yaw);pitch=math.radians(15);s.camera.location=center+Vector((math.sin(a)*math.cos(pitch),-math.cos(a)*math.cos(pitch),math.sin(pitch)))*10;s.camera.rotation_euler=(center-s.camera.location).to_track_quat('-Z','Y').to_euler()
                file=f'{version}-{action}-{frame}-{view}.png';s.render.filepath=str(dest/file);bpy.ops.render.render(write_still=True)
                rows.append({'revision':version,'action':action,'frame':frame,'view':view,'file':file,'sourceSHA':sha(path),'allMeshesVisible':True})
write(dest/'samples.json',{'schema':'cw.t2b2.pose-view-review','version':1,'samples':rows,'artApproved':False,'includes':'front/side/back extremes; full 132 frames geometrically inspected separately'})
# Inspection closeups keep real complete meshes, source lamps and 32 samples.
# Extra QC resolution is not a tier asset and is never used to favor A/B/C.
bpy.ops.wm.open_mainfile(filepath=str(HERE/'player/animation-source.blend'));s=bpy.context.scene;s.cycles.samples=32;s.render.resolution_x=s.render.resolution_y=1024;rig=bpy.data.objects['CW_Humanoid_Rig_v1']
for action,frame,view,yaw in [('attack',10,'front',-35),('hit',5,'back',180),('hit',6,'side',-90),('dodge',7,'front',-35),('defeat',22,'front',-35),('defeat',22,'side',-90)]:
    rig.animation_data.action=bpy.data.actions['B2_'+action];s.frame_set(frame);a=math.radians(yaw);pitch=math.radians(15);center=Vector((0,0,.97));s.camera.location=center+Vector((math.sin(a)*math.cos(pitch),-math.cos(a)*math.cos(pitch),math.sin(pitch)))*10;s.camera.rotation_euler=(center-s.camera.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=str(dest/f'closeup-{action}-{frame}-{view}.png');bpy.ops.render.render(write_still=True)
print('PASS 72 actual unhidden front/side/back pose images')
