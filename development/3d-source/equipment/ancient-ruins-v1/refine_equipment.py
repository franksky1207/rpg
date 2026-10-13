"""Refine the saved original G007 equipment; never rebuild or edit the player base.
The immutable pre-refinement source/15 GLBs are archived in history/.
"""
import bpy, math, json, pathlib, hashlib
from mathutils import Vector, Matrix
HERE=pathlib.Path(__file__).resolve().parent
ROOT=HERE.parents[3]
OUT=ROOT/'assets/3d/equipment/ancient-ruins-v1'
bpy.ops.wm.open_mainfile(filepath=str(HERE/'ancient-ruins.blend'))
bpy.context.preferences.filepaths.save_version=0
rig=bpy.data.objects['CW_Humanoid_Rig_v1'];rig.data.pose_position='REST';bpy.context.view_layer.update()
if bpy.data.objects['CW_Relic_shoes'].get('refinement_version'):
 raise RuntimeError('Already refined: restore the archived source before reproducing, not additive rerun')
slots={'weapon':'socket.weapon.R','helmet':'socket.helmet','armor':'socket.armor','shoes':'socket.shoes.L','accessory':'socket.accessory.back'}
parts={s:[] for s in slots}
silver=bpy.data.materials['Relic_Satin_Titanium'];iron=bpy.data.materials['Relic_Dark_Ceramic'];gold=bpy.data.materials['Relic_Aged_Champagne'];cyan=bpy.data.materials['Relic_Quiet_Cyan'];rubber=bpy.data.materials['Relic_Flexible_Seal']
def mesh(slot,name,verts,faces,mat,bone=None):
 data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update();o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.data.materials.append(mat);parts[slot].append(o)
 if bone:
  g=o.vertex_groups.new(name=bone);g.add(list(range(len(verts))),1,'REPLACE')
 return o
# Faceted, bevelled closed custom plate, not a primitive placeholder. Coordinates
# form an original profile, backed by a second layer with real thickness.
def plate(slot,name,outline,depth,mat,bone,bevel=.006):
 # outline is xyz. Each layer contracts to form deliberate rim chamfers.
 c=sum((Vector(p) for p in outline),Vector())/len(outline);normal=Vector(depth).normalized();n=len(outline);verts=[]
 for offset,shrink in [(Vector(),.90),(normal*bevel,1),(Vector(depth)-normal*bevel,1),(Vector(depth),.90)]:
  verts.extend(tuple(c+(Vector(p)-c)*shrink+offset) for p in outline)
 faces=[tuple(reversed(range(n))),tuple(range(3*n,4*n))]
 for row in range(3):
  for i in range(n):faces.append((row*n+i,row*n+(i+1)%n,(row+1)*n+(i+1)%n,(row+1)*n+i))
 return mesh(slot,name,verts,faces,mat,bone)
def loft(slot,name,rows,mat,bone,segments=16):
 verts=[];faces=[]
 for x,y,z,rx,ry in rows:
  for i in range(segments):
   a=2*math.pi*i/segments;verts.append((x+rx*math.cos(a),y+ry*math.sin(a),z))
 for r in range(len(rows)-1):
  for i in range(segments):faces.append((r*segments+i,r*segments+(i+1)%segments,(r+1)*segments+(i+1)%segments,(r+1)*segments+i))
 faces.extend([tuple(reversed(range(segments))),tuple(range((len(rows)-1)*segments,len(rows)*segments))])
 return mesh(slot,name,verts,faces,mat,bone)
# Original articulated weights and sockets remain the frame of reference.
# Shin shell stops below the knee; no knee component is owned by shoes.
for sign in [-1,1]:
 side='L' if sign==1 else 'R';x=sign*.14
 loft('shoes','Refined_High_Shin_'+side,[(x,.008,.252,.071,.077),(x,.006,.365,.075,.081),(x,.002,.486,.071,.076),(x,0,.535,.065,.07)],silver,'shin.'+side,12)
 plate('shoes','Shin_Recess_'+side,[(x-.026,-.082,.303),(x+.026,-.082,.303),(x+.022,-.079,.495),(x-.022,-.079,.495)],(0,-.005,0),iron,'shin.'+side,.002)
 # Thin rear support keeps the high boot leg silhouette, without welding knee.
 plate('armor','Refined_Thigh_'+side,[(x-.056,-.09,.864),(x+.06,-.09,.864),(x+.058,-.086,.671),(x+.025,-.102,.641),(x-.045,-.102,.665)],(0,-.014,0),silver,'thigh.'+side,.003)
 plate('armor','Refined_Knee_'+side,[(x-.055,-.072,.625),(x+.055,-.072,.625),(x+.061,-.080,.578),(x+.034,-.084,.552),(x-.038,-.084,.552),(x-.063,-.080,.581)],(0,-.018,0),iron,'shin.'+side,.003)
 # Cheek facets follow the original opaque shell, preserving the blind face.
 plate('helmet','Refined_Jaw_Facet_'+side,[(sign*.029,-.151,1.756),(sign*.08,-.146,1.767),(sign*.078,-.138,1.697),(sign*.018,-.137,1.669)],(0,-.004,0),silver,'head',.002)
 # A stable ankle/sole energy trim: no particle or audio owner.
 loft('shoes','Propulsor_Rim_'+side,[(x,-.081,.031,.08,.193),(x,-.081,.037,.081,.194)],cyan,'foot.'+side,12)
# Empty central back socket is armor; the complete key remains independent.
plate('armor','Refined_Back_Socket',[(-.043,.188,1.51),(.043,.188,1.51),(.052,.188,1.453),(-.052,.188,1.453)],(0,.018,0),iron,'chest',.002)
plate('armor','Refined_Back_Spine',[(-.025,.158,1.405),(.025,.158,1.405),(.022,.15,1.24),(-.022,.15,1.24)],(0,.018,0),silver,'spine_02',.002)
# Blade spine and tang layering retain the existing length and original grip.
plate('weapon','Refined_Blade_Spine',[(-.622,-.027,.866),(-.651,-.027,.884),(-.817,-.027,.35),(-.798,-.027,.35)],(0,.008,0),iron,None,.002)
plate('weapon','Refined_Guard_Inlay',[(-.689,-.09,.885),(-.683,-.09,.901),(-.559,-.09,.946),(-.553,-.09,.931)],(0,-.003,0),silver,None,.002)
# Replace only the coarse original key mesh with a fixed layered diamond/frame.
old=bpy.data.objects['CW_Relic_accessory'];socket=bpy.data.objects[slots['accessory']]
bpy.data.objects.remove(old,do_unlink=True)
# Fixed annular diamond frames, two depth layers; no loose floating parts.
for layer,(y,r,inner,mat) in enumerate([(.235,.127,.096,gold),(.269,.117,.085,silver)]):
 vs=[];fs=[]
 for yy in [y,y+.018]:
  for radius in [r,inner]:
   for xx,zz in [(0,radius),(radius,0),(0,-radius),(-radius,0)]:vs.append((xx,yy,1.49+zz))
 for j in range(4):
  k=(j+1)%4;fs.extend([(j,k,4+k,4+j),(8+j,12+j,12+k,8+k),(j,8+j,8+k,k),(4+j,4+k,12+k,12+j)])
 mesh('accessory','Fixed_Diamond_Frame_'+str(layer),vs,fs,mat)
vs=[(0,.282,1.562),(.063,.282,1.49),(0,.282,1.417),(-.063,.282,1.49),(0,.315,1.49),(0,.258,1.49)]
mesh('accessory','Volumetric_Diamond_Core',vs,[(0,1,4),(1,2,4),(2,3,4),(3,0,4),(1,0,5),(2,1,5),(3,2,5),(0,3,5)],cyan)
plate('accessory','Fixed_Key_Stem',[(-.021,.226,1.385),(.021,.226,1.385),(.024,.226,1.297),(-.024,.226,1.297)],(0,.022,0),gold,None,.003)
# Consolidate additions into the original slot meshes; no actor or rig rebuild.
for slot,objects in parts.items():
 if slot!='accessory':objects.insert(0,bpy.data.objects['CW_Relic_'+slot])
 else:
  for o in objects:
   inv=socket.matrix_world.inverted()
   for v in o.data.vertices:v.co=inv@v.co
   o.parent=socket;o.matrix_basis=Matrix.Identity(4)
 # Weapon additions authored in world/rest space must become socket local.
 if slot=='weapon':
  so=bpy.data.objects[slots[slot]]
  for o in objects[1:]:
   inv=so.matrix_world.inverted()
   for v in o.data.vertices:v.co=inv@v.co
   o.parent=so;o.matrix_basis=Matrix.Identity(4)
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=bpy.context.object;o.name='CW_Relic_'+slot
 if slot=='accessory':
  conversion=Matrix(((1,0,0),(0,0,1),(0,-1,0)));q=(conversion@socket.matrix_world.to_3x3()@conversion.inverted()).to_quaternion();o['display_rotation']=[q.x,q.y,q.z,q.w]
 o['refinement_version']='batch28-consolidated-2026-10-14';o['equipment_slot']=slot;o['rig_contract']='cw.humanoid.rig.v1';o['original_design']='ancient-tech-ruins'
 parts[slot]=o
rig.data.pose_position='POSE';bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'ancient-ruins.blend'))
rig.data.pose_position='REST';rig.animation_data_clear();bpy.context.view_layer.update()
exec(compile((HERE/'export_refined.py').read_text(),str(HERE/'export_refined.py'),'exec'))
