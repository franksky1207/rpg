"""Actual saved Blender source reviews. Never concept/AI imagery."""
import bpy,math,pathlib,json
from mathutils import Vector
HERE=pathlib.Path(__file__).resolve().parent;out=HERE/'review';out.mkdir(exist_ok=True)
scene=bpy.context.scene;scene.frame_set(1);scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=False
scene.render.resolution_x=600;scene.render.resolution_y=850;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX'
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.08,.10,.14,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.35
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.012));ground=bpy.context.object
m=bpy.data.materials.new('Review_Ground');m.diffuse_color=(.095,.115,.145,1);ground.data.materials.append(m)
def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for name,pos,power,size,col in [('Key',(-2,-3,4),350,3,(.96,.98,1)),('Fill',(2,-1,2.5),180,2,(.78,.85,1)),('Rim',(0,2,3),500,2,(.85,.94,1))]:
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.size=size;d.color=col;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=pos;aim(o,(0,0,1))
d=bpy.data.cameras.new('Review_Camera');cam=bpy.data.objects.new('Review_Camera',d);scene.collection.objects.link(cam);scene.camera=cam;d.type='ORTHO'
for name,pos,target,scale in [('front',(0,-4,1),(0,0,.98),2.22),('side',(4,0,1),(0,0,.98),2.22),('back',(0,4,1),(0,0,.98),2.22),('helmet',(.65,-3,1.85),(0,0,1.77),.60)]:
 cam.location=pos;aim(cam,target);d.ortho_scale=scale;scene.render.filepath=str(out/(name+'.png'));bpy.ops.render.render(write_still=True)
# Practical joint evidence uses actual shared accepted rig, no rig modifications.
rig=bpy.data.objects['CW_Humanoid_Rig_v1'];rig.animation_data_clear()
for name,deg in [('head',25),('upper_arm.L',35),('forearm.L',70),('spine_01',15),('thigh.L',35),('shin.L',60),('foot.L',20)]:
 p=rig.pose.bones[name];p.rotation_mode='XYZ';p.rotation_euler.x+=math.radians(deg)
bpy.context.view_layer.update();cam.location=(2,-4,1.3);aim(cam,(0,0,1));d.ortho_scale=2.3;scene.render.filepath=str(out/'joint-pose.png');bpy.ops.render.render(write_still=True)
(out/'render-settings.json').write_text(json.dumps({'source':bpy.data.filepath,'engine':'Blender Cycles','samples':16,'visualApproval':False,'realIPhone':False},indent=2)+'\n')
