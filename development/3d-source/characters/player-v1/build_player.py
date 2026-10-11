"""Original editable humanoid study; Blender 4.3, metres, +Z up / -Y forward.
Run: blender -b --python development/3d-source/characters/player-v1/build_player.py
No imported geometry, textures or external asset dependencies. CC0-1.0.
Art acceptance is separate from rig/export validation; this is a technical art study.
"""
import bpy, math, json, pathlib, hashlib
from mathutils import Vector
ROOT = pathlib.Path(__file__).resolve().parents[4]
SOURCE = pathlib.Path(__file__).resolve().parent
OUT = ROOT / 'assets/3d/characters/player-v1'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.scene.unit_settings.scale_length=1
bpy.context.preferences.filepaths.save_version=0

# Real deformation rig: pelvis, spine, limbs, toes and all 30 finger segments.
arm_data=bpy.data.armatures.new('CW_Humanoid_Rig_v1')
rig=bpy.data.objects.new('CW_Humanoid_Rig_v1',arm_data)
bpy.context.collection.objects.link(rig); bpy.context.view_layer.objects.active=rig
rig.select_set(True); bpy.ops.object.mode_set(mode='EDIT')
segments={}
def bone(name,a,b,parent=None):
    x=arm_data.edit_bones.new(name);x.head=a;x.tail=b
    if parent:x.parent=arm_data.edit_bones[parent]
    segments[name]=(Vector(a),Vector(b));return name
bone('root',(0,0,0),(0,0,.15))
bone('pelvis',(0,0,.94),(0,0,1.08),'root')
bone('spine_01',(0,0,1.08),(0,0,1.25),'pelvis')
bone('spine_02',(0,0,1.25),(0,0,1.43),'spine_01')
bone('chest',(0,0,1.43),(0,0,1.58),'spine_02')
bone('neck',(0,0,1.58),(0,0,1.69),'chest')
bone('head',(0,0,1.69),(0,0,1.9),'neck')
for sign,side in [(1,'L'),(-1,'R')]:
    bone('clavicle.'+side,(0,0,1.53),(sign*.25,0,1.53),'chest')
    bone('upper_arm.'+side,(sign*.25,0,1.53),(sign*.43,0,1.28),'clavicle.'+side)
    bone('forearm.'+side,(sign*.43,0,1.28),(sign*.54,-.015,1.02),'upper_arm.'+side)
    bone('hand.'+side,(sign*.54,-.015,1.02),(sign*.575,-.015,.94),'forearm.'+side)
    for i,finger in enumerate(['thumb','index','middle','ring','little']):
        x=sign*(.535+i*.021);z=.947 if i else .995
        direction=Vector((sign*(.046 if i==0 else .011),-.008,-(.064 if i==0 else [.0,.105,.117,.11,.087][i])))
        start=Vector((x,-.025,z));parent='hand.'+side
        for j in range(3):
            end=start+direction/3
            parent=bone(f'{finger}_{j+1:02}.{side}',start,end,parent);start=end
    bone('thigh.'+side,(sign*.105,0,.99),(sign*.135,0,.57),'pelvis')
    bone('shin.'+side,(sign*.135,0,.57),(sign*.14,0,.11),'thigh.'+side)
    bone('foot.'+side,(sign*.14,0,.11),(sign*.14,-.14,.06),'shin.'+side)
    bone('toe.'+side,(sign*.14,-.14,.06),(sign*.14,-.23,.05),'foot.'+side)
bpy.ops.object.mode_set(mode='OBJECT');rig.show_in_front=True
slots={'weapon':'socket.weapon.R','helmet':'socket.helmet','armor':'socket.armor','shoes':'socket.shoes.L','accessory':'socket.accessory.back'}
socket_bones={'socket.weapon.R':('hand.R',(-.575,-.015,.94)), 'socket.weapon.L':('hand.L',(.575,-.015,.94)),
 'socket.helmet':('head',(0,0,1.9)), 'socket.armor':('chest',(0,0,1.43)),
 'socket.shoes.L':('foot.L',(.14,0,.06)), 'socket.shoes.R':('foot.R',(-.14,0,.06)),
 'socket.accessory.back':('chest',(0,.125,1.43)), 'fx.hit.chest':('chest',(0,-.14,1.43)), 'fx.root':('root',(0,0,0))}
for name,(parent,position) in socket_bones.items():
    obj=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(obj)
    obj.parent=rig;obj.parent_type='BONE';obj.parent_bone=parent
    bpy.context.view_layer.update();obj.matrix_world.translation=position
    obj['contract']='cw.humanoid.sockets.v1';obj['unit']='metre';obj['slot']=next((s for s,n in slots.items() if n==name),'auxiliary')

# Custom quad sections, individually shaped anatomical contours; not primitive meshes.
verts=[];faces=[];weights=[];uvs=[];material_indices=[]
def distance(point,name):
    a,b=segments[name];v=b-a;t=max(0,min(1,(point-a).dot(v)/v.length_squared));return (point-a-v*t).length
def bind(point,chain):
    nearest=sorted([(distance(Vector(point),n),n) for n in chain])[:4]
    scores=[1/(d+.015)**4 for d,n in nearest];total=sum(scores)
    return [(n,w/total) for (_,n),w in zip(nearest,scores)]
def tube(rows,chain,material=0,sides=24):
    # Each row carries centre and two independent cross-section radii.
    base=len(verts)
    for j,(x,y,z,rx,ry) in enumerate(rows):
        for i in range(sides):
            theta=2*math.pi*i/sides
            p=(x+rx*math.cos(theta),y+ry*math.sin(theta),z)
            verts.append(p);weights.append(bind(p,chain));uvs.append((i/sides,j/max(1,len(rows)-1)))
    for j in range(len(rows)-1):
        for i in range(sides):
            face=(base+j*sides+i,base+j*sides+(i+1)%sides,base+(j+1)*sides+(i+1)%sides,base+(j+1)*sides+i)
            faces.append(tuple(reversed(face)) if rows[-1][2]<rows[0][2] else face);material_indices.append(material)
    for j,reverse in [(0,True),(len(rows)-1,False)]:
        if rows[-1][2]<rows[0][2]:reverse=not reverse
        faces.append(tuple(base+j*sides+i for i in (range(sides-1,-1,-1) if reverse else range(sides))));material_indices.append(material)
torso=[(.92,.105,.075),(.98,.16,.105),(1.04,.165,.105),(1.10,.135,.09),(1.18,.14,.095),(1.27,.17,.115),(1.37,.215,.125),(1.46,.245,.115),(1.53,.23,.09),(1.57,.17,.073),(1.59,.065,.052)]
tube([(0,0,z,x,y) for z,x,y in torso],['pelvis','spine_01','spine_02','chest'],0,32)
tube([(0,0,z,x,y) for z,x,y in [(1.56,.056,.052),(1.60,.052,.05),(1.66,.054,.05),(1.70,.058,.052)]],['neck','head'],0)
# Jaw, cheek, brow and cranial contour; front face subtly projects at nose/brow.
head=[(1.67,.038,.039),(1.69,.060,.054),(1.72,.079,.070),(1.75,.087,.080),(1.78,.092,.083),(1.81,.089,.079),(1.84,.083,.072),(1.87,.067,.057),(1.89,.038,.030),(1.90,.004,.004)]
tube([(0,-.007,z,x,y) for z,x,y in head],['head'],3,32)
for sign,side in [(1,'L'),(-1,'R')]:
    chain=['clavicle.'+side,'upper_arm.'+side,'forearm.'+side,'hand.'+side]
    arm=[(.245,1.53,.081,.070),(.28,1.50,.083,.076),(.33,1.43,.073,.065),(.38,1.35,.061,.057),(.43,1.28,.052,.047),(.45,1.23,.063,.053),(.49,1.14,.058,.047),(.53,1.06,.039,.035),(.54,1.02,.030,.026),(.55,.985,.035,.019),(.575,.94,.045,.017)]
    tube([(sign*x,-.008,z,rx,ry) for x,z,rx,ry in arm],chain,0)
    for i,finger in enumerate(['thumb','index','middle','ring','little']):
        chain=[f'{finger}_{j+1:02}.{side}' for j in range(3)]
        a=segments[chain[0]][0];b=segments[chain[-1]][1];rows=[]
        for j in range(7):
            p=a.lerp(b,j/6);r=(.011 if i else .014)*(.92-.48*(j/6)**3)
            rows.append((*p,r,r*.85))
        tube(rows,chain,0,12)
    chain=['thigh.'+side,'shin.'+side,'foot.'+side,'toe.'+side]
    leg=[(.105,.99,.100,.092),(.115,.94,.106,.096),(.125,.84,.092,.083),(.133,.72,.075,.067),(.135,.60,.061,.058),(.135,.56,.060,.055),(.14,.48,.074,.065),(.14,.36,.066,.060),(.14,.24,.043,.045),(.14,.13,.034,.037)]
    tube([(sign*x,.012,z,rx,ry) for x,z,rx,ry in leg],chain,0)
    tube([(sign*.14,y,z,rx,ry) for y,z,rx,ry in [(-.075,.025,.051,.145),(-.085,.05,.061,.154),(-.08,.08,.058,.147),(-.03,.12,.037,.063),(.0,.145,.036,.043)]],chain,1)
    # Integrated flight-suit panels follow anatomical outlines, not game equipment.
    tube([(sign*x,y,z,rx,ry) for x,y,z,rx,ry in [(.28,0,1.50,.086,.08),(.31,0,1.47,.091,.08),(.335,0,1.42,.08,.074)]],['upper_arm.'+side],1)
    tube([(sign*x,-.005,z,rx,ry) for x,z,rx,ry in [(.47,1.20,.066,.057),(.49,1.16,.065,.057),(.515,1.09,.052,.044)]],['forearm.'+side],1)
    tube([(sign*.133,-.025,z,rx,ry) for z,rx,ry in [(.65,.061,.061),(.59,.071,.066),(.53,.066,.063)]],['shin.'+side,'thigh.'+side],1)
# Contoured chest shell, collar and belt; fixed foundation suit rather than named gear.
tube([(0,-.013,z,x,y) for z,x,y in [(1.32,.17,.12),(1.36,.205,.13),(1.43,.22,.125),(1.49,.195,.108)]],['chest','spine_02'],1,32)
tube([(0,0,z,x,y) for z,x,y in [(1.565,.071,.059),(1.58,.073,.06),(1.597,.065,.056)]],['neck'],2)
tube([(0,0,z,x,y) for z,x,y in [(1.025,.17,.11),(1.045,.172,.112),(1.065,.162,.108)]],['pelvis'],1,32)
# Facial inset visor, nose bridge, chin and ears retain a distinct head silhouette.
def patch(name,points,quads,material,chain):
    base=len(verts)
    for p in points:verts.append(p);weights.append(bind(p,chain));uvs.append((p[0]*4+.5,(p[2]-1.65)*4))
    for f in quads:faces.append(tuple(base+i for i in reversed(f)));material_indices.append(material)
patch('face', [(-.075,-.068,1.805),(-.055,-.093,1.798),(0,-.103,1.80),(.055,-.093,1.798),(.075,-.068,1.805),(-.066,-.07,1.769),(-.051,-.094,1.767),(0,-.108,1.765),(.051,-.094,1.767),(.066,-.07,1.769)],[(i,i+1,i+6,i+5) for i in range(4)],4,['head'])
patch('nose',[(-.017,-.086,1.78),(0,-.119,1.771),(.017,-.086,1.78),(-.018,-.083,1.747),(0,-.115,1.749),(.018,-.083,1.747)],[(0,1,4,3),(1,2,5,4)],3,['head'])
for sign in [-1,1]:tube([(sign*.089,0,z,.018,.021) for z in [1.745,1.76,1.782]],['head'],1,12)
mesh=bpy.data.meshes.new('CW_Player_Editable_QuadSurface');mesh.from_pydata(verts,[],faces);mesh.update()
body=bpy.data.objects.new('CW_Player_Foundation',mesh);bpy.context.collection.objects.link(body)
for name in segments:body.vertex_groups.new(name=name)
for i,row in enumerate(weights):
    for name,w in row:body.vertex_groups[name].add([i],w,'REPLACE')
uv=mesh.uv_layers.new(name='UV_Atlas')
for polygon in mesh.polygons:
    polygon.material_index=material_indices[polygon.index];polygon.use_smooth=True
    for li in polygon.loop_indices:uv.data[li].uv=uvs[mesh.loops[li].vertex_index]
def material(name,color,metal,rough,emission=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    if emission:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emission
    body.data.materials.append(m);return m
material('CW_Suit_WovenGraphite',(.018,.028,.042),.08,.72)
material('CW_Panels_BrushedTitanium',(.22,.30,.39),.78,.32)
material('CW_Accent_Cyan',(.02,.55,.82),.3,.24,.8)
material('CW_Head_WarmComposite',(.31,.22,.17),.03,.55)
material('CW_Visor_SmokedGlass',(.012,.044,.065),.65,.16)
# Editable woven surface atlas, embedded in GLB (standard PNG decoder only).
image=bpy.data.images.new('CW_Woven_Atlas_512',width=512,height=512)
pixels=[]
for y in range(512):
    for x in range(512):
        v=.18+(.075 if (x//3+y//3)%2 else 0)+.018*math.sin(x*.5)*math.sin(y*.5)
        pixels.extend((v*.65,v*.8,v,1))
image.pixels.foreach_set(pixels);image.filepath_raw=str(SOURCE/'woven-atlas.png');image.file_format='PNG';image.save();image.pack()
nodes=body.data.materials[0].node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tex.image=image
body.data.materials[0].node_tree.links.new(tex.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
# Keep skinned mesh at scene root (glTF rule); Armature modifier owns binding.
deform=body.modifiers.new('CW_Weighted_Deformation','ARMATURE');deform.object=rig
rig['contract']='cw.humanoid.rig.v1';rig['rest_pose']='A';rig['height_metres']=1.9
body['art_status']='technical-art-study-awaiting-human-art-acceptance'
body['source_license']='CC0-1.0 original mesh; no third-party source'
# Looping breathing test clip proves skin deformation; full actions are Batch 31.
bpy.context.scene.frame_start=1;bpy.context.scene.frame_end=61;bpy.context.scene.render.fps=30
for frame,angle in [(1,0),(16,.028),(31,0),(46,-.028),(61,0)]:
    p=rig.pose.bones['spine_02'];p.rotation_mode='XYZ';p.rotation_euler.x=angle;p.keyframe_insert('rotation_euler',frame=frame)
rig.animation_data.action.name='CW_Idle_Breathing_Compatibility'
bpy.context.scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'player-foundation.blend'))
stats={}
for quality,level in [('low',0),('medium',1),('high',2)]:
    subdiv=body.modifiers.new('CW_LOD_Surface','SUBSURF');subdiv.levels=level;subdiv.render_levels=level
    # Modifier before armature: export preserves weights and skeleton.
    bpy.context.view_layer.objects.active=body;bpy.ops.object.modifier_move_up(modifier=subdiv.name)
    bpy.ops.object.select_all(action='DESELECT');body.select_set(True);rig.select_set(True)
    for o in bpy.data.objects:
        if o.type=='EMPTY':o.select_set(True)
    file=OUT/f'player-{quality}.glb'
    bpy.ops.export_scene.gltf(filepath=str(file),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=True,export_skins=True,export_yup=True,export_all_influences=False)
    evaluated=body.evaluated_get(bpy.context.evaluated_depsgraph_get());m=evaluated.to_mesh();m.calc_loop_triangles()
    stats[quality]={'vertices':len(m.vertices),'triangles':len(m.loop_triangles),'bytes':file.stat().st_size};evaluated.to_mesh_clear()
    body.modifiers.remove(subdiv)
(SOURCE/'export-measurements.json').write_text(json.dumps({'heightMetres':1.9,'bones':len(segments),'slots':slots,'lod':stats,'artStatus':body['art_status']},indent=2)+'\n')
print('CW_EXPORT',json.dumps(stats))
