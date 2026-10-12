"""Unhidden complete G007 meshes in actual front/side/back Blender poses."""
import bpy,sys,pathlib,math,argparse
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
p=argparse.ArgumentParser();p.add_argument('--baseline',default='/tmp/t2b2-baseline/assets/player/animation-source.blend');args=p.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
dest=HERE/'repair-r2/pose-views';dest.mkdir(parents=True,exist_ok=True);rows=[]
for version,path in [('r2-unchanged-player',HERE/'player/animation-source.blend')]:
    bpy.ops.wm.open_mainfile(filepath=str(path));rig=bpy.data.objects['CW_Humanoid_Rig_v1'];s=bpy.context.scene;s.cycles.samples=32
    assert all(not o.hide_render for o in bpy.data.objects if o.type=='MESH'),'Do not hide geometry for collision review'
    center=Vector((0,0,.97));original=s.camera.matrix_world.copy()
    for action in ACTIONS:
        rig.animation_data.action=bpy.data.actions['B2_'+action]
        for frame in ([7] if action=='hit' else [1] if action=='return' else [10]):
            s.frame_set(frame)
            for view,yaw in [('front',-35),('side',-90),('back',180)]:
                a=math.radians(yaw);pitch=math.radians(15);s.camera.location=center+Vector((math.sin(a)*math.cos(pitch),-math.cos(a)*math.cos(pitch),math.sin(pitch)))*10;s.camera.rotation_euler=(center-s.camera.location).to_track_quat('-Z','Y').to_euler()
                file=f'{version}-{action}-{frame}-{view}.png';s.render.filepath=str(dest/file);bpy.ops.render.render(write_still=True)
                rows.append({'revision':version,'action':action,'frame':frame,'view':view,'file':file,'sourceSHA':sha(path),'allMeshesVisible':True})
write(dest/'samples.json',{'schema':'cw.t2b2.pose-view-review','version':1,'samples':rows,'artApproved':False,'includes':'front/side/back extremes; full 132 frames geometrically inspected separately'})

print('PASS 18 actual unhidden r2 front/side/back pose images')
