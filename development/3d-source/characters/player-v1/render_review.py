"""Repeatable actual Blender art review; renders never enter Pages.
blender -b player-foundation.blend --python render_review.py -- --output /tmp/review
Original neutral studio and game lighting; no borrowed character design.
"""
import bpy, math, pathlib, argparse, sys, json
from mathutils import Vector
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
from lod_surface import configure_lod
args=argparse.ArgumentParser();args.add_argument('--output',default='/tmp/rpg-b27-art-review');args.add_argument('--samples',type=int,default=24);args.add_argument('--only-lod',action='store_true')
opt=args.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
out=pathlib.Path(opt.output);out.mkdir(parents=True,exist_ok=True)
scene=bpy.context.scene;body=bpy.data.objects['CW_Player_Foundation'];rig=bpy.data.objects['CW_Humanoid_Rig_v1'];scene.frame_set(1)
scene.render.engine='CYCLES';scene.cycles.samples=opt.samples;scene.cycles.use_denoising=False # distro Cycles has no OpenImageDenoise
scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG'
scene.view_settings.view_transform='AgX';scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.08,.10,.14,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.35
# Neutral presentation ground, never exported as player geometry.
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.012));ground=bpy.context.object;ground.name='REVIEW_Ground'
m=bpy.data.materials.new('REVIEW_Backdrop');m.diffuse_color=(.095,.115,.145,1);ground.data.materials.append(m)
def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
lights=[]
for name,pos,power,size,color in [('Key',(-2,-3,4),350,3,(.96,.98,1)),('Fill',(2,-1,2.5),180,2,(.78,.85,1)),('Rim',(0,2,3),500,2,(.85,.94,1))]:
    data=bpy.data.lights.new('REVIEW_'+name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color
    o=bpy.data.objects.new(data.name,data);scene.collection.objects.link(o);o.location=pos;aim(o,(0,0,1));lights.append(o)
data=bpy.data.cameras.new('REVIEW_Camera');cam=bpy.data.objects.new(data.name,data);scene.collection.objects.link(cam);scene.camera=cam;data.type='ORTHO'
views=[('01-front',(0,-4,1.0),(0,0,.98),2.18,760,1000),('02-back',(0,4,1.0),(0,0,.98),2.18,760,1000),('03-left',(4,0,1.0),(0,0,.98),2.18,760,1000),('04-right',(-4,0,1.0),(0,0,.98),2.18,760,1000),('05-head-chest',(.6,-3,1.85),(0,-.015,1.61),.78,900,1000),('06-shoulder-hand',(1.8,-3,1.30),(.32,0,1.27),.95,900,1000),('07-hip-knee-shoes',(.6,-3,.65),(0,-.025,.61),1.30,900,1000)]
for name,pos,target,scale,w,h in views:
    if opt.only_lod:continue
    cam.location=pos;aim(cam,target);data.ortho_scale=scale;scene.render.resolution_x=w;scene.render.resolution_y=h;scene.render.filepath=str(out/(name+'.png'));bpy.ops.render.render(write_still=True)
# Three true decimated levels under identical camera/light, side-by-side.
body.hide_render=True
for q,ratio,x in [('low',.05,-1.4),('medium',.16,0),('high',.64,1.4)]:
    copy=body.copy();copy.data=body.data.copy();scene.collection.objects.link(copy);copy.hide_render=False;copy.location.x=x
    copy.modifiers.clear()
    if ratio<1:
        lod=configure_lod(copy,ratio,'REVIEW_'+q)
cam.location=(0,-4,1);aim(cam,(0,0,.98));data.ortho_scale=4.6;scene.render.resolution_x=1500;scene.render.resolution_y=1100;scene.render.filepath=str(out/'08-lod-low-medium-high.png');bpy.ops.render.render(write_still=True)
if opt.only_lod:
    print('PASS actual boundary-preserving LOD comparison',out);sys.exit(0)
for o in list(scene.objects):
    if o.type=='MESH' and o!=body and o!=ground:bpy.data.objects.remove(o,do_unlink=True)
body.hide_render=False
lights[0].data.color=(.65,.80,1);lights[1].data.color=(.14,.65,1);lights[2].data.color=(1,.48,.18)
cam.location=(2,-4,1.65);aim(cam,(0,0,1));data.ortho_scale=2.18;scene.render.resolution_x=760;scene.render.resolution_y=1000;scene.render.filepath=str(out/'09-game-light.png');bpy.ops.render.render(write_still=True)
# Posed inspection uses the same linear skin deformation exported to glTF.
for name,degrees in [('forearm.L',80),('shin.L',75),('upper_arm.L',35),('thigh.L',35),('index_02.L',55)]:
    p=rig.pose.bones[name];p.rotation_mode='XYZ';p.rotation_euler.x=math.radians(degrees)
bpy.context.view_layer.update()
cam.location=(2,-4,1.4);aim(cam,(0,0,.95));data.ortho_scale=2.25;scene.render.filepath=str(out/'10-joint-deformation.png');bpy.ops.render.render(write_still=True)
(out/'render-settings.json').write_text(json.dumps({'engine':'Cycles CPU','samples':opt.samples,'source':bpy.data.filepath,'views':[v[0] for v in views]+['08-lod-low-medium-high','09-game-light','10-joint-deformation'],'lodOrder':['low','medium','high'],'humanArtApproval':False},indent=2)+'\n')
print('PASS actual Blender review renders',out)
