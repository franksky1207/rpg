"""Original relic-courtyard backdrop layers and a silent visual impact study."""
import bpy,math,pathlib,sys
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
guard_build([HERE/'shared/stage-source.blend',HERE/'shared/vfx-source.blend'])
reset();out=HERE/'shared';out.mkdir(exist_ok=True)
stone=material('Original_Basalt_Ceramic',(.035,.055,.085),.22,.7);trim=material('Original_Ancient_Brass',(.15,.115,.065),.65,.46);glow=material('Original_Path_Optics',(.025,.24,.35),.2,.4,.5)
groups={'background':[],'midground':[],'foreground':[]}
def add(key,o):groups[key].append(o);return o
for i in range(11):
 x=(i-5)*.55;h=.5+((i*7)%5)*.18
 add('background',loft('Relic_Tower_'+str(i),[(x,2,0,.21,.25),(x,2,h,.20,.20),(x,2,h+.12,.11,.12)],stone,None,None,6))
 add('background',plate('Tower_Crown_'+str(i),[(x-.12,1.72,h-.08),(x+.12,1.72,h-.08),(x+.12,1.72,h),(x-.12,1.72,h)],.02,trim,None,None))
for row in range(7):
 for col in range(9):
  x=(col-4)*.55;y=(row-3)*.45
  add('midground',loft('Courtyard_Inlaid_Slab_'+str(row)+'_'+str(col),[(x,y,-.06,.265,.215),(x,y,-.01,.265,.215)],stone,None,None,4))
for i in range(6):
 x=(i-2.5)*.7
 add('foreground',loft('Broken_Relic_Ridge_'+str(i),[(x,-2.2,-.01,.26,.20),(x,-2.2,.18+(.1 if i%2 else 0),.20,.15),(x+.08,-2.2,.26,.05,.06)],stone,None,None,5))
cam=setup_camera(2.6);s=bpy.context.scene;s.render.resolution_x=1024;s.render.resolution_y=576;cam.data.ortho_scale=6.8;cam.location=(0,-7.7,3.8);cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.wm.save_as_mainfile(filepath=str(out/'stage-source.blend'),compress=True)
for key,objects in groups.items():
 for group in groups.values():
  for o in group:o.hide_render=o not in objects
 s.render.filepath=str(out/(key+'.png'));bpy.ops.render.render(write_still=True)
reset();flash=material('Original_Impact_Amber',(.9,.38,.07),.1,.3,4);cool=material('Original_Impact_Core',(.2,.8,1),.1,.3,3)
objs=[]
for i in range(12):
 a=math.pi*2*i/12;r=.25+(i%3)*.04
 outline=[(math.cos(a)*.06,0,math.sin(a)*.06),(math.cos(a)*r-math.sin(a)*.012,0,math.sin(a)*r+math.cos(a)*.012),(math.cos(a)*r+math.sin(a)*.012,0,math.sin(a)*r-math.cos(a)*.012)]
 objs.append(plate('Impact_Shard_'+str(i),outline,.012,flash if i%2 else cool,None,None))
cam=setup_camera(1);cam.location=(0,-10,0);cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=.9;s=bpy.context.scene;s.render.resolution_x=128;s.render.resolution_y=128;s.frame_end=8
for o in objs:
 for f,k in [(1,.1),(3,1),(8,1.5)]:o.scale=(k,k,k);o.keyframe_insert('scale',frame=f)
 for f,v in [(1,True),(2,False),(7,False),(8,True)]:o.hide_render=v;o.keyframe_insert('hide_render',frame=f)
bpy.ops.wm.save_as_mainfile(filepath=str(out/'vfx-source.blend'),compress=True)
for f in range(1,9):s.frame_set(f);s.render.filepath=str(out/f'impact-{f-1:02}.png');bpy.ops.render.render(write_still=True)
write(out/'effects-contract.json',{'schema':'cw.t2b2.shared-art','version':1,'license':'CC0-1.0-original','status':'prototype-pending-user-art-approval','backgroundLayers':list(groups),'vfxFrames':8,'vfxFPS':30,'authority':'none; no HP, damage, audio or reward','budget':{'maxImpactSprites':1,'maxShadowSpritesPerActor':1,'maxOpacity':.65},'stagePlacement':'B3 must crop/stretch same source layers into locked controls UV; no actor or HUD encoded in background','shadow':'contact-shadow.png original ellipse, follows actor foot; no baked attack outcome'})
