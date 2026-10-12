"""Author three original articulated enemy studies; not formal skills or stats.
blender -b --python-exit-code 1 --python .../tools/build_enemies.py
"""
import sys,pathlib,math,bpy
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
identities=json.loads((HERE/'source-lock.json').read_text())['representatives']
guard_build([HERE/'enemies'/i['kind']/'source.blend' for i in identities])
for identity in identities:
 reset();kind=identity['kind'];folder=HERE/'enemies'/kind;folder.mkdir(parents=True,exist_ok=True)
 steel=material('Relic_Forged_Panels',(.29,.36,.42),.78);dark=material('Relic_Ceramic_Joints',(.024,.037,.055),.3,.6);gold=material('Relic_Copper_Edges',(.45,.25,.085),.8);light=material('Relic_Cyan_Optics',(.025,.6,.8),.3,.25,2)
 texture(steel,'original-panel-roughness')
 if kind in ('normal','elite'):
  heavy=kind=='elite';w=.40 if heavy else .25;height=2.5 if heavy else 1.85
  bones=[('root',(0,0,0),(0,0,.3),None),('hips',(0,0,.8),(0,0,1.0),'root'),('torso',(0,0,1),(0,0,1.5),'hips'),('sensor',(0,0,1.5),(0,0,1.8),'torso')]
  for side,s in [('L',1),('R',-1)]:
   bones.extend([(f'arm.{side}',(s*w,0,1.5),(s*(w+.1),0,1.15),'torso'),(f'claw.{side}',(s*(w+.1),0,1.15),(s*(w+.1),0,.8),f'arm.{side}'),(f'leg.{side}',(s*.17,0,.9),(s*.17,0,.5),'hips'),(f'ankle.{side}',(s*.17,0,.5),(s*.17,0,.08),f'leg.{side}')])
  rig=rig_create(bones)
  # Distinct chest silhouette, multi-shell edges, vents, optic recess, articulated
  # limbs and rivet crowns. Profiles are explicitly authored, not box placeholders.
  loft('Suspended_Reactor_Cage',[(0,0,.93,w*.6,.16),(0,0,1.04,w*.78,.22),(0,0,1.38,w,.26),(0,0,1.52,w*.85,.19),(0,0,1.58,w*.55,.14)],steel,rig,'torso',24)
  plate('Chest_Recess',[(-w*.68,-.27,1.38),(w*.68,-.27,1.38),(w*.5,-.27,1.09),(0,-.27,1.03),(-w*.5,-.27,1.09)],.05,dark,rig,'torso')
  for i in range(4):
   z=1.12+i*.054;plate('Reactor_Louvre_'+str(i),[(-w*.52,-.285,z),(w*.52,-.285,z),(w*.52,-.285,z+.018),(-w*.52,-.285,z+.018)],.015,gold,rig,'torso')
  loft('Optic_Head',[(0,0,1.57,.1,.10),(0,-.02,1.66,.16,.16),(0,0,1.79,.13,.12),(0,0,1.86,.04,.04)],steel,rig,'sensor',20)
  plate('Single_Inset_Optic',[(-.1,-.163,1.68),(.1,-.163,1.68),(.095,-.16,1.727),(-.095,-.16,1.727)],.014,light,rig,'sensor')
  for side,s in [('L',1),('R',-1)]:
   for bone,rows,r in [(f'arm.{side}',[(s*w,0,1.54),(s*(w+.12),0,1.28),(s*(w+.10),0,1.14)],.12 if heavy else .08),(f'claw.{side}',[(s*(w+.10),0,1.15),(s*(w+.10),-.03,.91),(s*(w+.11),-.06,.81)],.14 if heavy else .075),(f'leg.{side}',[(s*.17,0,.93),(s*.17,0,.67),(s*.17,0,.5)],.10),(f'ankle.{side}',[(s*.17,0,.5),(s*.17,0,.20),(s*.17,-.06,.07)],.13)]:
    loft('Articulated_Housing_'+bone,[(x,y,z,r*(1 if j==1 else .78),r*.9) for j,(x,y,z) in enumerate(rows)],steel,rig,bone)
    for j,(x,y,z) in enumerate(rows[:2]):loft('Joint_Seal_'+bone+str(j),[(x,y,z-.04,r*1.04,r),(x,y,z+.04,r*1.04,r)],dark,rig,bone)
   x=s*.17;loft('Broad_Contact_Foot_'+side,[(x,-.08,.015,.13,.22),(x,-.08,.05,.15,.24),(x,-.03,.12,.105,.13)],dark,rig,f'ankle.{side}',20)
   if heavy:
    plate('Overhanging_Siege_Shoulder_'+side,[(s*(w-.07),-.18,1.65),(s*(w+.25),-.16,1.58),(s*(w+.23),-.15,1.36),(s*(w+.09),-.18,1.29),(s*(w-.04),-.2,1.42)],.27,steel,rig,f'arm.{side}')
    for j in range(3):plate('Siege_Brace_'+side+str(j),[(s*(w+.04),-.205,1.4+j*.06),(s*(w+.2),-.19,1.4+j*.06),(s*(w+.2),-.19,1.418+j*.06),(s*(w+.04),-.205,1.418+j*.06)],.01,gold,rig,f'arm.{side}')
   else:
    plate('Sentinel_Shield_'+side,[(s*(w+.05),-.16,1.26),(s*(w+.19),-.15,1.19),(s*(w+.17),-.15,.86),(s*(w+.08),-.18,.8),(s*(w-.03),-.18,1.02)],.035,gold,rig,f'claw.{side}')
   # Pincers open by forearm articulation during attack; blade edge is true mesh.
   for k in [-1,1]:plate('Pincer_'+side+str(k),[(s*(w+.1)+k*.07,-.04,.93),(s*(w+.1)+k*.10,-.11,.78),(s*(w+.1)+k*.055,-.20,.71),(s*(w+.1)+k*.04,-.13,.82)],.055,dark,rig,f'claw.{side}')
  scale=height/1.85
  # Apply uniform authored size to mesh/rest rig, not per-clip or per-scheme.
  for o in bpy.data.objects:
   if o.type=='MESH':
    for v in o.data.vertices:v.co*=scale
  bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='EDIT')
  for b in rig.data.edit_bones:b.head*=scale;b.tail*=scale
  bpy.ops.object.mode_set(mode='OBJECT')
  poses={
   'idle':[(1,{}),(11,{'torso':(2,0,0),'sensor':(-3,0,2)}),(22,{})],
   'attack':[(1,{}),(5,{'torso':(-12,0,-12),'arm.R':(-45,0,-25),'claw.R':(-65,0,0),'leg.L':(15,0,0)}),(10,{'torso':(17,0,15),'arm.R':(65,0,15),'claw.R':(-35,0,0),'arm.L':(35,0,-10)}),(15,{'torso':(9,0,7),'claw.R':(12,0,0)}),(22,{})],
   'hit':[(1,{}),(6,{'torso':(-24,0,8),'sensor':(15,0,-10),'arm.L':(-25,0,-22),'leg.R':(18,0,0)}),(13,{'torso':(9,0,-5)}),(22,{})],
   'dodge':[(1,{}),(7,{'hips':(10,0,-22),'torso':(12,0,-25),'arm.R':(-25,0,20),'leg.L':(35,0,-15),'ankle.L':(-32,0,0)}),(15,{'torso':(-9,0,-14),'leg.L':(18,0,0)}),(22,{})],
   'return':[(1,{'torso':(17,0,15),'arm.R':(65,0,15),'claw.R':(-35,0,0)}),(8,{'torso':(-7,0,-5),'arm.R':(25,0,-10),'leg.R':(20,0,0)}),(15,{'torso':(4,0,0),'leg.L':(12,0,0)}),(22,{})],
   'defeat':[(1,{}),(7,{'torso':(-12,0,10),'arm.R':(-40,0,-30)}),(14,{'hips':(35,0,0),'torso':(38,0,-12),'leg.L':(-35,0,0),'leg.R':(-35,0,0),'ankle.L':(60,0,0),'ankle.R':(60,0,0)}),(22,{'hips':(48,0,0),'torso':(55,0,-18),'sensor':(35,0,0),'leg.L':(-48,0,0),'leg.R':(-48,0,0),'ankle.L':(80,0,0),'ankle.R':(80,0,0)})]}
 else:
  height=3.2
  bones=[('root',(0,0,0),(0,0,.4),None),('reactor',(0,0,1),(0,0,1.8),'root'),('crown',(0,0,2),(0,0,2.5),'reactor')]
  for i in range(4):
   a=i*math.pi/2+math.pi/4;x,y=math.cos(a),math.sin(a);bones.extend([(f'outrigger.{i}',(x*.65,y*.65,1.3),(x*1.05,y*1.05,.65),'root'),(f'piston.{i}',(x*1.05,y*1.05,.65),(x*1.15,y*1.15,.06),f'outrigger.{i}'),(f'petal.{i}',(x*.4,y*.4,2),(x*.75,y*.75,2.8),'crown')])
  rig=rig_create(bones)
  loft('Core_Pressure_Vessel',[(0,0,.63,.3,.3),(0,0,.85,.55,.55),(0,0,1.4,.6,.6),(0,0,1.95,.48,.48),(0,0,2.13,.3,.3)],dark,rig,'reactor',32)
  for i in range(4):
   a=i*math.pi/2+math.pi/4;x,y=math.cos(a),math.sin(a)
   for b,rows,r in [(f'outrigger.{i}',[(x*.65,y*.65,1.35),(x*.96,y*.96,.88),(x*1.05,y*1.05,.65)],.18),(f'piston.{i}',[(x*1.05,y*1.05,.65),(x*1.15,y*1.15,.28),(x*1.15,y*1.15,.05)],.13)]:
    loft('Loadbearing_'+b,[(xx,yy,z,r,r) for xx,yy,z in rows],steel,rig,b)
    xx,yy,z=rows[1];loft('Hydraulic_Ram_'+b,[(xx,yy,z-.12,r*.65,r*.65),(xx,yy,z+.12,r*.65,r*.65)],gold,rig,b)
   loft('Foundation_Claw_'+str(i),[(x*1.15,y*1.15,.01,.22,.24),(x*1.15,y*1.15,.055,.26,.26),(x*1.15,y*1.15,.13,.16,.18)],dark,rig,f'piston.{i}')
   # Crown petals have deliberately asymmetric swept tips and a raised crest.
   o=plate('Crown_Swept_Petal_'+str(i),[(-.19,-.53,1.94),(.19,-.53,1.94),(.28,-.70,2.5),(.13,-.66,3.15),(-.12,-.58,3.0),(-.25,-.64,2.5)],.12,steel,rig,f'petal.{i}')
   for v in o.data.vertices:
    p=v.co.copy();v.co.x=p.x*math.cos(a)-p.y*math.sin(a);v.co.y=p.x*math.sin(a)+p.y*math.cos(a)
   for j in range(3):
    z=1.1+j*.25;loft('Segmented_Field_Band_'+str(i)+str(j),[(x*.34,y*.34,z,.20,.20),(x*.34,y*.34,z+.08,.22,.22)],gold,rig,'reactor',12)
  plate('Reactor_Exposed_Lens',[(-.32,-.575,1.35),(-.22,-.58,1.7),(.22,-.58,1.7),(.32,-.575,1.35),(.20,-.58,1.1),(-.20,-.58,1.1)],.06,light,rig,'reactor')
  def state(r=0,p=0,legs=0,c=0):return {'reactor':(r,0,0),'crown':(c,0,0),**{f'petal.{i}':(p*(1 if i<2 else -1),0,8*(-1 if i%2 else 1)) for i in range(4)},**{f'outrigger.{i}':(legs*(1 if i<2 else -1),0,0) for i in range(4)},**{f'piston.{i}':(-legs,0,0) for i in range(4)}}
  poses={'idle':[(1,state()),(11,state(2,3,1)),(22,state())], 'attack':[(1,state()),(5,state(-8,-24,10,-8)),(10,state(17,38,-12,20)),(15,state(8,18,5,8)),(22,state())], 'hit':[(1,state()),(6,state(-19,-16,14,-12)),(13,state(7,6,-5,4)),(22,state())], 'dodge':[(1,state()),(7,state(12,-35,22,-18)),(15,state(5,-15,9,-7)),(22,state())], 'return':[(1,state(17,38,-12,20)),(8,state(-4,12,8,-7)),(16,state(2,4,-3,3)),(22,state())], 'defeat':[(1,state()),(6,state(-10,-20,10,-15)),(14,state(22,-55,28,30)),(22,state(35,-78,40,45))]}
 for name in ACTIONS:animation(rig,name,poses[name])
 setup_camera(height);rig.animation_data.action=bpy.data.actions['B2_idle'];bpy.context.scene.frame_set(1)
 bpy.ops.wm.save_as_mainfile(filepath=str(folder/'source.blend'),compress=True)
 export(rig,folder/'candidate.glb')
 write(folder/'design.json',{'schema':'cw.t2b2.enemy-design','version':1,'identity':identity,'license':'CC0-1.0-original-model-texture-and-animation','status':'prototype-pending-user-art-approval','formalSkills':'unavailable; poses are visual responses only','heightMetres':height,'actions':ACTIONS,'fps':30,'durationMs':700,'camera':{'yawDegrees':35,'pitchDegrees':15,'faces':'screen-left','projection':'orthographic'},'source':str((folder/'source.blend').relative_to(ROOT))})
