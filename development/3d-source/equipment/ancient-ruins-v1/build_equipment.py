"""Original CC0 Ancient Ruins wearable set. Rebuild from the accepted player source.
blender -b --python-exit-code 1 --python development/3d-source/equipment/ancient-ruins-v1/build_equipment.py
No player geometry, bone, weight, socket or animation is edited.
"""
import bpy, math, json, pathlib, hashlib
from mathutils import Vector, Matrix
HERE=pathlib.Path(__file__).resolve().parent
ROOT=HERE.parents[3]
BASE=ROOT/'development/3d-source/characters/player-v1/player-foundation.blend'
OUT=ROOT/'assets/3d/equipment/ancient-ruins-v1'
bpy.ops.wm.open_mainfile(filepath=str(BASE))
bpy.context.preferences.filepaths.save_version=0
rig=bpy.data.objects['CW_Humanoid_Rig_v1'];body=bpy.data.objects['CW_Player_Foundation']
rig.data.pose_position='REST';bpy.context.view_layer.update()
slots={'weapon':'socket.weapon.R','helmet':'socket.helmet','armor':'socket.armor','shoes':'socket.shoes.L','accessory':'socket.accessory.back'}
contract={'baseSHA256':hashlib.sha256(BASE.read_bytes()).hexdigest(),'bones':[{'name':b.name,'parent':b.parent.name if b.parent else None,'matrix':[list(r) for r in b.matrix_local]} for b in rig.data.bones], 'sockets':{o.name:{'bone':o.parent_bone,'local':[list(r) for r in o.matrix_local],'world':[list(r) for r in o.matrix_world]} for o in bpy.data.objects if o.type=='EMPTY'}}
(HERE/'rig-contract.json').write_text(json.dumps(contract,indent=2)+'\n')
def material(name,color,metal,rough,emit=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 if emit:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emit
 return m
silver=material('Relic_Satin_Titanium',(.32,.40,.45),.72,.36)
iron=material('Relic_Dark_Ceramic',(.052,.075,.09),.35,.48)
gold=material('Relic_Aged_Champagne',(.38,.26,.12),.72,.39)
cyan=material('Relic_Quiet_Cyan',(.025,.34,.43),.28,.27,.32)
rubber=material('Relic_Flexible_Seal',(.022,.028,.034),.05,.78)
parts={s:[] for s in slots}
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
# Helmet: sealed enclosing shell with shaped chin, temple, crown and nape. No
# transparency or face cutout. The lowered chin encloses the refined jaw.
loft('helmet','Guard_Closed_Shell',[(0,.012,1.631,.057,.075),(0,.006,1.665,.087,.106),(0,.003,1.725,.115,.134),(0,.004,1.815,.122,.139),(0,.01,1.895,.11,.121),(0,.015,1.936,.060,.069),(0,.015,1.943,.015,.025)],iron,'head',32)
plate('helmet','Opaque_Sensor_Face',[(-.100,-.129,1.827),(-.077,-.139,1.873),(.077,-.139,1.873),(.100,-.129,1.827),(.072,-.117,1.686),(0,-.119,1.651),(-.072,-.117,1.686)],(0,-.014,0),silver,'head')
plate('helmet','Sensor_Blind_Panel',[(-.083,-.153,1.812),(-.073,-.155,1.839),(.073,-.155,1.839),(.083,-.153,1.812),(.063,-.15,1.771),(-.063,-.15,1.771)],(0,-.008,0),iron,'head',.002)
for s in [-1,1]:
 plate('helmet','Guardian_Temple_'+str(s),[(s*.119,-.02,1.874),(s*.128,-.044,1.805),(s*.119,-.02,1.723),(s*.107,.072,1.737),(s*.106,.079,1.851)],(s*.009,0,0),silver,'head')
 plate('helmet','Guardian_Sensor_Line_'+str(s),[(s*.007,-.164,1.827),(s*.068,-.164,1.820),(s*.074,-.164,1.812),(s*.012,-.164,1.819)],(0,-.003,0),cyan,'head',.001)
plate('helmet','Crown_Crest',[(-.02,-.08,1.927),(.02,-.08,1.927),(.022,.077,1.927),(-.022,.077,1.927)],(0,0,.016),gold,'head',.003)
# Armor: separated articulated chest, back, shoulder, elbow/forearm, segmented
# abdominal and belt/tasset plates. Each rigid plate is weighted to its bone;
# the 53-joint skin permits stable body animation without changing the base rig.
for s in [-1,1]:
 plate('armor','Pectoral_Titanium_'+str(s),[(s*.017,-.146,1.513),(s*.164,-.125,1.52),(s*.226,-.102,1.476),(s*.185,-.138,1.35),(s*.024,-.159,1.37)],(0,-.025,0),silver,'chest')
 plate('armor','Pectoral_Inlay_'+str(s),[(s*.035,-.185,1.403),(s*.151,-.166,1.407),(s*.16,-.166,1.397),(s*.038,-.185,1.393)],(0,-.003,0),cyan,'chest',.001)
 plate('armor','Scapular_Plate_'+str(s),[(s*.026,.147,1.513),(s*.19,.112,1.50),(s*.207,.123,1.40),(s*.074,.166,1.355),(s*.026,.164,1.39)],(0,.023,0),silver,'chest')
 plate('armor','Back_Vent_'+str(s),[(s*.055,.192,1.46),(s*.122,.173,1.455),(s*.125,.173,1.425),(s*.055,.192,1.43)],(0,.007,0),iron,'chest',.002)
 for z,b in [(1.30,'spine_02'),(1.205,'spine_01'),(1.105,'spine_01')]:
  plate('armor','Abdominal_Lamella_'+str(s)+str(z),[(s*.017,-.143,z+.045),(s*.141,-.134,z+.029),(s*.132,-.144,z-.035),(s*.018,-.154,z-.044)],(0,-.020,0),iron if z==1.205 else silver,b)
 # Shoulder shell loft follows the upper-arm bind direction, with an open lower
 # joint gap. Reinforcing border and clavicle trim do not bridge elbow bends.
 loft('armor','Pauldron_'+str(s),[(s*.255,0,1.554,.103,.105),(s*.277,0,1.528,.119,.117),(s*.317,0,1.465,.107,.113),(s*.339,0,1.434,.087,.095)],silver,'upper_arm.'+('L' if s==1 else 'R'),20)
 loft('armor','Pauldron_Rim_'+str(s),[(s*.332,0,1.449,.105,.111),(s*.345,0,1.427,.096,.107)],gold,'upper_arm.'+('L' if s==1 else 'R'),20)
 side='L' if s==1 else 'R'
 loft('armor','Forearm_Brace_'+side,[(s*.451,-.005,1.24,.067,.075),(s*.477,-.012,1.18,.072,.079),(s*.518,-.017,1.078,.061,.067),(s*.529,-.018,1.052,.051,.055)],iron,'forearm.'+side,20)
 plate('armor','Bracer_Face_'+side,[(s*.426,-.079,1.219),(s*.486,-.091,1.232),(s*.551,-.081,1.091),(s*.494,-.077,1.073)],(0,-.016,0),silver,'forearm.'+side)
 plate('armor','Hip_Tasset_'+side,[(s*.053,-.147,1.035),(s*.16,-.118,1.037),(s*.197,-.112,.914),(s*.104,-.156,.863),(s*.048,-.166,.93)],(0,-.018,0),silver,'thigh.'+side)
 plate('armor','Side_Belt_'+side,[(s*.181,-.08,1.067),(s*.193,.067,1.067),(s*.195,.08,1.005),(s*.185,-.084,1.005)],(s*.016,0,0),gold,'pelvis')
plate('armor','Sternal_Relic_Sigil',[(-.016,-.184,1.492),(.016,-.184,1.492),(.022,-.184,1.451),(0,-.184,1.429),(-.022,-.184,1.451)],(0,-.008,0),gold,'chest',.002)
plate('armor','Lumbar_Plate',[(-.126,.116,1.083),(.126,.116,1.083),(.137,.139,.998),(-.137,.139,.998)],(0,.018,0),iron,'pelvis')
# Boots: shaped multi-section closed foot, separate ankle cuff and foot-following
# propulsor housings. Both feet share one slot and one container.
for s in [-1,1]:
 side='L' if s==1 else 'R';x=s*.14
 loft('shoes','Float_Boot_Sole_'+side,[(x,-.084,.008,.073,.187),(x,-.089,.025,.081,.194),(x,-.084,.046,.077,.190)],rubber,'foot.'+side,24)
 loft('shoes','Float_Boot_Hull_'+side,[(x,-.082,.042,.078,.19),(x,-.088,.072,.077,.186),(x,-.054,.113,.071,.146),(x,-.023,.14,.059,.083)],silver,'foot.'+side,24)
 loft('shoes','Ankle_Flexible_Seal_'+side,[(x,.005,.121,.06,.069),(x,.005,.19,.064,.071),(x,.005,.222,.061,.067)],rubber,'shin.'+side,20)
 loft('shoes','Ankle_Guard_'+side,[(x,.008,.188,.073,.078),(x,.008,.24,.074,.080),(x,.008,.27,.067,.071)],iron,'shin.'+side,20)
 for k in [-1,1]:
  plate('shoes','Propulsion_Housing_'+side+str(k),[(x+k*.071,-.078,.098),(x+k*.078,.033,.100),(x+k*.078,.053,.061),(x+k*.071,-.081,.051)],(k*.012,0,0),gold,'foot.'+side,.003)
  plate('shoes','Propulsion_Line_'+side+str(k),[(x+k*.089,-.074,.063),(x+k*.09,.025,.068),(x+k*.09,.025,.076),(x+k*.089,-.074,.071)],(k*.002,0,0),cyan,'foot.'+side,.001)
# Back key: offset from backplate; ornate thick geometric key, recessed central
# core, open structural halo made from a purpose-built octagonal annulus.
plate('accessory','Key_Relic_Body',[(-.068,.202,1.561),(.068,.202,1.561),(.087,.202,1.493),(.059,.202,1.426),(.028,.202,1.423),(.028,.202,1.300),(-.028,.202,1.3),(-.028,.202,1.423),(-.059,.202,1.426),(-.087,.202,1.493)],(0,.048,0),gold,None)
plate('accessory','Key_Core',[(-.04,.255,1.52),(.04,.255,1.52),(.048,.255,1.48),(0,.255,1.449),(-.048,.255,1.48)],(0,.014,0),cyan,None,.003)
vs=[];fs=[]
for y in [.255,.28]:
 for r in [.118,.095]:
  for i in range(8):a=math.pi/8+2*math.pi*i/8;vs.append((r*math.cos(a),y,1.49+r*math.sin(a)))
for i in range(8):
 j=(i+1)%8;fs.extend([(i,j,8+j,8+i),(16+i,24+i,24+j,16+j),(i,16+i,16+j,j),(8+i,8+j,24+j,24+i)])
mesh('accessory','Key_Open_Halo',vs,fs,silver)
# Weapon: shaped single-handed metal blade, bevelled edge, split guard,
# ergonomic grip and pommel; blade extends down/out from the resting right hand.
plate('weapon','Ancient_Blade_Core',[(-.606,-.059,.888),(-.666,-.059,.91),(-.837,-.059,.355),(-.834,-.059,.185),(-.731,-.059,.330)],(0,.032,0),silver,None,.007)
plate('weapon','Ancient_Blade_Energy_Edge',[(-.662,-.062,.888),(-.68,-.062,.88),(-.853,-.062,.347),(-.834,-.062,.185),(-.821,-.062,.345)],(0,.008,0),cyan,None,.002)
plate('weapon','Guard_Split_Tang',[(-.712,-.087,.876),(-.699,-.087,.915),(-.546,-.087,.971),(-.526,-.087,.933),(-.565,-.087,.919),(-.592,-.087,.91)],(0,.085,0),gold,None,.006)
loft('weapon','Grip_Closed', [(-.564,-.015,1.040,.02,.026),(-.569,-.015,1.022,.025,.029),(-.576,-.015,.978,.024,.028),(-.59,-.015,.94,.019,.025)],rubber,None,16)
loft('weapon','Pommel', [(-.564,-.015,1.041,.025,.03),(-.562,-.015,1.062,.027,.032),(-.56,-.015,1.071,.018,.024)],silver,None,16)
# Consolidate each slot to one mesh (multiple materials), preserving deliberate
# articulated weights and source editability. All 53 groups enforce joint order.
for slot,objects in parts.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=bpy.context.object;o.name='CW_Relic_'+slot
 if slot in ['weapon','accessory']:
  socket=bpy.data.objects[slots[slot]];inv=socket.matrix_world.inverted()
  for v in o.data.vertices:v.co=inv@v.co
  o.parent=socket;o.matrix_basis=Matrix.Identity(4)
  conversion=Matrix(((1,0,0),(0,0,1),(0,-1,0)));q=(conversion@socket.matrix_world.to_3x3()@conversion.inverted()).to_quaternion()
  o['display_rotation']=[q.x,q.y,q.z,q.w]
 else:
  for b in rig.data.bones:
   if not o.vertex_groups.get(b.name):o.vertex_groups.new(name=b.name)
  mod=o.modifiers.new('CW_Contract_Skin','ARMATURE');mod.object=rig
 parts[slot]=o;o['equipment_slot']=slot;o['rig_contract']='cw.humanoid.rig.v1';o['original_design']='ancient-tech-ruins';o['closed_face']=slot=='helmet'
OUT.mkdir(parents=True,exist_ok=True)
# Saved source has player reference + real idle, ready to inspect or edit.
rig.data.pose_position='POSE';bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'ancient-ruins.blend'))
rig.data.pose_position='REST';rig.animation_data_clear();bpy.context.view_layer.update()
measurements={}
for quality,ratio in [('low',.58),('medium',.82),('high',1.0)]:
 for slot,o in parts.items():
  bpy.ops.object.select_all(action='DESELECT');o.select_set(True)
  if slot not in ['weapon','accessory']:rig.select_set(True)
  # Rigid mesh has socket-local vertices; detach socket before exporting so no
  # character/armature or inherited scale is accidentally duplicated in GLB.
  parent=o.parent
  if slot in ['weapon','accessory']:o.parent=None;o.matrix_basis=Matrix.Identity(4)
  mod=None
  if ratio<1:
   mod=o.modifiers.new('LOD_Decimate','DECIMATE');mod.ratio=ratio
   bpy.context.view_layer.objects.active=o
   if slot not in ['weapon','accessory']:bpy.ops.object.modifier_move_up(modifier=mod.name)
  file=OUT/f'{slot}-{quality}.glb'
  bpy.ops.export_scene.gltf(filepath=str(file),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_skins=True,export_yup=True,export_all_influences=False)
  measurements[f'{slot}.{quality}']={'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()}
  if mod:o.modifiers.remove(mod)
  if slot in ['weapon','accessory']:o.parent=parent;o.matrix_basis=Matrix.Identity(4)
(HERE/'export-measurements.json').write_text(json.dumps(measurements,indent=2)+'\n')
print('B28C_EXPORT',json.dumps(measurements))
