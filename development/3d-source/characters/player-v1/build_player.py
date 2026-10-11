"""Original editable humanoid study; Blender 4.3, metres, +Z up / -Y forward.
Run: blender -b --python development/3d-source/characters/player-v1/build_player.py
No imported geometry, textures or external asset dependencies. CC0-1.0.
Human-proportioned sci-fi undersuit art revision; final visual acceptance belongs to user.
"""
import bpy, math, json, pathlib, hashlib, sys
from mathutils import Vector
ROOT = pathlib.Path(__file__).resolve().parents[4]
SOURCE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(SOURCE))
from lod_surface import configure_lod
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

# Art revision: unified anatomical surface, no hard shells or spherical joints.
# Cross-sections describe anatomy, then voxel retopology joins shoulder/hip/palm.
verts=[];faces=[]
def loft(rows,sides=32,facial=False):
    base=len(verts)
    for j,(x,y,z,rx,ry) in enumerate(rows):
        for i in range(sides):
            t=2*math.pi*i/sides;px=x+rx*math.cos(t);py=y+ry*math.sin(t)
            if facial and math.sin(t)<0:
                # Integrated brow, cheekbone, nose bridge, philtrum and lips.
                front=max(0,-math.sin(t))**10
                nose=.017*math.exp(-((z-1.765)/.021)**2)*math.exp(-(px/.024)**2)
                brow=.007*math.exp(-((z-1.805)/.012)**2)
                lip=.006*math.exp(-((z-1.731)/.005)**2)*math.exp(-(px/.031)**4)
                eye=-.007*math.exp(-((z-1.791)/.009)**2)*math.exp(-((abs(px)-.035)/.018)**2)
                py-=front*(nose+brow+lip+eye)
            verts.append((px,py,z))
    for j in range(len(rows)-1):
        for i in range(sides):
            f=(base+j*sides+i,base+j*sides+(i+1)%sides,base+(j+1)*sides+(i+1)%sides,base+(j+1)*sides+i)
            faces.append(tuple(reversed(f)) if rows[-1][2]<rows[0][2] else f)
    for j in [0,len(rows)-1]:
        seq=list(range(sides));reverse=(j==0) != (rows[-1][2]<rows[0][2])
        faces.append(tuple(base+j*sides+i for i in (reversed(seq) if reverse else seq)))
# Adult ~8-head silhouette. Broad rib cage narrows into a curved pelvis.
torso=[(.915,.110,.075),(.955,.158,.103),(1.00,.168,.110),(1.05,.158,.102),(1.10,.138,.095),(1.16,.140,.098),(1.23,.160,.110),(1.30,.190,.126),(1.38,.216,.132),(1.44,.232,.130),(1.49,.232,.115),(1.53,.213,.094),(1.56,.155,.075),(1.585,.059,.052)]
loft([(0,.008,z,rx,ry) for z,rx,ry in torso],48)
loft([(0,.005,z,rx,ry) for z,rx,ry in [(1.56,.060,.056),(1.59,.058,.053),(1.63,.053,.052),(1.66,.057,.053),(1.69,.062,.054)]])
# Sculpted skull with a flattened face, articulated jaw and chin, not an oval mask.
head=[(1.674,.031,.038),(1.69,.047,.051),(1.704,.061,.059),(1.718,.072,.066),(1.733,.079,.070),(1.749,.084,.074),(1.765,.085,.077),(1.780,.084,.079),(1.793,.083,.080),(1.806,.083,.081),(1.82,.082,.081),(1.84,.078,.077),(1.86,.068,.067),(1.88,.048,.047),(1.895,.021,.020),(1.9,.002,.002)]
loft([(0,-.002,z,rx,ry) for z,rx,ry in head],64,True)
for sign,side in [(1,'L'),(-1,'R')]:
    # Deltoid feeds directly into pectoral/upper arm; elbow has flexible volume.
    arm=[(.160,1.551,.065,.061),(.225,1.532,.078,.075),(.251,1.512,.078,.079),(.285,1.49,.077,.073),(.325,1.434,.070,.065),(.37,1.37,.060,.058),(.408,1.314,.050,.048),(.430,1.282,.045,.044),(.449,1.248,.052,.049),(.473,1.192,.053,.050),(.50,1.128,.046,.040),(.529,1.057,.032,.029),(.54,1.024,.029,.025),(.548,.997,.036,.022),(.563,.970,.048,.021),(.575,.94,.043,.018),(.58,.924,.030,.016)]
    loft([(sign*x,-.008,z,rx,ry) for x,z,rx,ry in arm])
    # Fingers follow the inherited 30-joint rig with knuckles and tapering tips.
    for i,finger in enumerate(['thumb','index','middle','ring','little']):
        chain=[f'{finger}_{j+1:02}.{side}' for j in range(3)];a=segments[chain[0]][0];b=segments[chain[-1]][1]
        rows=[]
        for j in range(13):
            t=j/12;p=a.lerp(b,t);r=(.0065 if i else .0125)*(1-.32*t)
            r*=1+.10*math.exp(-((t-.34)/.08)**2)+.08*math.exp(-((t-.67)/.08)**2)
            if j==12:r*=.28
            rows.append((*p,r,r*.88))
        loft(rows,16)
    # Anatomical quadriceps, patella/calf and Achilles, no bolt-on kneecap.
    leg=[(.088,1.055,.052,.068),(.100,1.022,.085,.087),(.112,.975,.103,.100),(.12,.90,.100,.097),(.126,.82,.089,.086),(.132,.73,.074,.073),(.135,.64,.061,.059),(.135,.59,.056,.056),(.135,.555,.055,.054),(.137,.50,.065,.064),(.14,.43,.070,.067),(.14,.35,.059,.058),(.14,.26,.044,.045),(.14,.18,.034,.037),(.14,.12,.033,.037),(.14,.09,.036,.046)]
    loft([(sign*x,.007,z,rx,ry) for x,z,rx,ry in leg])
    loft([(sign*.14,y,z,rx,ry) for y,z,rx,ry in [(-.073,.018,.051,.146),(-.080,.028,.058,.153),(-.081,.047,.059,.151),(-.067,.065,.055,.139),(-.031,.097,.042,.080),(.002,.135,.034,.040),(.007,.158,.034,.039)]])
    # Ears are joined into the skull, not metal protrusions.
    loft([(sign*.081,.0,z,rx,ry) for z,rx,ry in [(1.744,.009,.016),(1.76,.018,.018),(1.782,.018,.017),(1.798,.009,.012)]],16)
mesh=bpy.data.meshes.new('CW_Player_Editable_AnatomicalSurface');mesh.from_pydata(verts,[],faces);mesh.update()
body=bpy.data.objects.new('CW_Player_Foundation',mesh);bpy.context.collection.objects.link(body)
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body
body.data.remesh_voxel_size=.006
bpy.ops.object.voxel_remesh()
smooth=body.modifiers.new('Anatomical_Retopo_Relax','SMOOTH');smooth.factor=.72;smooth.iterations=4;bpy.ops.object.modifier_apply(modifier=smooth.name)
# Normalize the sculpt to the unchanged 1.9m contract, anchored to sole.
lo=min(v.co.z for v in body.data.vertices);hi=max(v.co.z for v in body.data.vertices)
for v in body.data.vertices:v.co.z=(v.co.z-lo)*1.9/(hi-lo)
# Materials remain five; rich fabric, soft elastomer, restrained titanium and skin.
def material(name,color,metal,rough,emission=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    if emission:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emission
    body.data.materials.append(m);return m
material('CW_Suit_WovenGraphite',(.032,.046,.065),.02,.77)
material('CW_Suit_SoftCeramicWeave',(.041,.063,.080),.08,.65)
material('CW_Trim_TitaniumCyan',(.025,.32,.39),.42,.34,.18)
material('CW_Head_NaturalSkin',(.39,.245,.175),0,.61)
material('CW_Flex_Charcoal',(.012,.019,.025),0,.86)
# Original repeatable fine weave: modest dark yarn contrast, embedded 512 PNG.
image=bpy.data.images.new('CW_Woven_Atlas_512',width=512,height=512);pixels=[]
for y in range(512):
    for x in range(512):
        yarn=.78+.05*((x//2+y//2)%2)+.003*math.sin(x*.8)*math.sin(y*.8)
        pixels.extend((yarn*.93,yarn,yarn*1.035,1))
image.pixels.foreach_set(pixels);image.filepath_raw=str(SOURCE/'woven-atlas.png');image.file_format='PNG';image.save();image.pack()
for index in [0,1]:
    mat=body.data.materials[index];nodes=mat.node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tex.image=image
    mat.node_tree.links.new(tex.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color']) if index==0 else None
# Spatial tailoring on the unified surface: the boundary is flush, never floating.
def region(p):
    x,y,z=p;ax=abs(x);front=y<0
    if z>1.676:return 3 # detailed skin/eyes/hair atlas, no polygonal face stripes
    if z>1.575:return 4
    if ax>.235 and z>.88:
        if 1.265<z<1.303 or z<1.055:return 4
        if 1.32<z<1.48 and front and ax>.30:return 1
        if 1.105<z<1.20 and front:return 1
        return 0
    if z<.125:return 4 if z<.035 else 1
    if z<.90:
        if .535<z<.625:return 4
        if front and .67<z<.88 and ax>.13:return 1
        if not front and .28<z<.49:return 1
        # narrow tailored side piping follows the outer leg, not armor.
        if .2<z<.90 and ax>.17 and abs(y)<.026:return 2
        return 0
    if front and 1.28<z<1.51 and .068+(1.51-z)*.12<ax<.196-(1.51-z)*.10 and y<-.077:return 1
    if not front and 1.24<z<1.53 and .040+(1.53-z)*.06<ax<.18-(1.53-z)*.12:return 1
    if .99<z<1.045 and ax>.06:return 4
    if .90<z<1.18 and ax<.045:return 4
    # Two restrained chest / spine channels. Soft suit does not occupy armor envelope.
    if front and 1.30<z<1.49 and abs(ax-(.065+(1.49-z)*.17))<.006:return 2
    if not front and 1.14<z<1.54 and ax<.012:return 2
    return 0
for p in body.data.polygons:p.material_index=region(p.center);p.use_smooth=True
# Continuous vertex colour transitions across cut lines prevent voxel-sized
# staircase boundaries; distinct PBR roughness still distinguishes fabrics.
palette=[(.035,.045,.060),(.041,.063,.080),(.025,.32,.39),(1,1,1),(.012,.019,.025)]
sums=[[0.,0.,0.,0] for v in body.data.vertices]
for poly in body.data.polygons:
    c=palette[poly.material_index]
    for vi in poly.vertices:
        if poly.material_index!=3:
            for k in range(3):sums[vi][k]+=c[k]
            sums[vi][3]+=1
attribute=body.data.color_attributes.new(name='CW_Tailoring_Color',type='FLOAT_COLOR',domain='POINT')
body.data.color_attributes.active_color=attribute
for v,row in zip(body.data.vertices,sums):
    attribute.data[v.index].color=(*(row[k]/row[3] for k in range(3)),1) if row[3] else (.39,.245,.175,1) # face ignores colour; collar interpolation must not turn white
for index,mat in enumerate(body.data.materials):
    p=mat.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(1,1,1,1)
    if index not in [0,3]:
        color=mat.node_tree.nodes.new('ShaderNodeVertexColor');color.layer_name='CW_Tailoring_Color';mat.node_tree.links.new(color.outputs['Color'],p.inputs['Base Color'])
# glTF uses COLOR_0 to multiply a neutral weave. Blender mirrors that exact
# material by explicit multiplication, while face colour stays texture only.
mat=body.data.materials[0];p=mat.node_tree.nodes.get('Principled BSDF');tex=next(n for n in mat.node_tree.nodes if n.type=='TEX_IMAGE')
color=mat.node_tree.nodes.new('ShaderNodeVertexColor');color.layer_name='CW_Tailoring_Color'
mix=mat.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
mat.node_tree.links.new(tex.outputs['Color'],mix.inputs[1]);mat.node_tree.links.new(color.outputs['Color'],mix.inputs[2]);mat.node_tree.links.new(mix.outputs[0],p.inputs['Base Color'])

# Smart UV on editable source; material boundaries carry seams, no runtime shader tricks.
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.006);bpy.ops.object.mode_set(mode='OBJECT')
# Original facial atlas: coherent eye shapes, iris, lids, brows and lips,
# eliminating coarse per-face colour bands on the sculpted skull.
face=bpy.data.images.new('CW_Original_Face_1024',width=1024,height=1024)
colors=[]
for iy in range(1024):
    v=iy/1023
    for ix in range(1024):
        u=ix/1023;grain=.004*math.sin(ix*1.73+iy*.93)*math.cos(iy*.77)
        c=[.39+grain,.245+grain*.65,.175+grain*.45]
        # natural scalp silhouette, including temples, leaving ears uncovered.
        hairline=.733+.027*math.cos((u-.5)*math.pi*8)
        if v>hairline or (abs(u-.5)>.165 and v>.54):c=[.027+grain*.2,.034+grain*.2,.038+grain*.2]
        for center in [.434,.566]:
            dx=(u-center)/.027;dy=(v-.530)/.015;oval=dx*dx+dy*dy
            if oval<1.45:c=[.20,.12,.09] # warm eyelid rim
            if oval<1:c=[.56,.55,.49]
            if ((u-center)/.0078)**2+((v-.531)/.015)**2<1:c=[.040,.090,.090]
            if ((u-center)/.0037)**2+((v-.531)/.010)**2<1:c=[.009,.013,.015]
            if ((u-center+.002)/.0016)**2+((v-.536)/.003)**2<1:c=[.77,.78,.72]
            if abs(dx)<1.1 and abs(v-(.574+.004*(1-dx*dx)))<.004:c=[.048,.034,.027]
        # shaped lip volume and gentle centre seam, not a jagged black mouth.
        lx=(u-.5)/.037;ly=(v-.287)/.013
        if lx*lx+ly*ly<1:c=[.31,.155,.128]
        if abs(lx)<.90 and abs(v-(.287-.002*math.cos(lx*math.pi)))<.0018:c=[.135,.067,.054]
        # nostril shading corresponds to the sculpted nose underside.
        if any(((u-n)/.005)**2+((v-.370)/.006)**2<1 for n in [.487,.513]):c=[.24,.13,.09]
        colors.extend((*c,1))
face.pixels.foreach_set(colors);face.filepath_raw=str(SOURCE/'face-atlas.png');face.file_format='PNG';face.save();face.pack()
mat=body.data.materials[3];tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=face
mat.node_tree.links.new(tex.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
uv=body.data.uv_layers.active
for poly in body.data.polygons:
    if poly.material_index==3:
        for li in poly.loop_indices:
            p=body.data.vertices[body.data.loops[li].vertex_index].co
            uv.data[li].uv=(.5+math.atan2(p.x,-p.y)/(2*math.pi),(p.z-1.66)/.25)

# Weight by anatomical chain; preserve all 53 bone names and joint placements.
def distance(point,name):
    a,b=segments[name];v=b-a;t=max(0,min(1,(point-a).dot(v)/v.length_squared));return (point-a-v*t).length
for name in segments:body.vertex_groups.new(name=name)
for v in body.data.vertices:
    candidates=[]
    for n in segments:
        if n=='root':continue
        gate=1.0
        if any(n.startswith(prefix) for prefix in ['upper_arm','forearm','hand','thumb','index','middle','ring','little']):
            t=max(0,min(1,(abs(v.co.x)-.19)/.13));gate=t*t*(3-2*t)
        if n.startswith(('thigh','shin','foot','toe')):
            t=max(0,min(1,(1.13-v.co.z)/.16));gate*=t*t*(3-2*t)
        d=distance(v.co,n);candidates.append((gate/(d+.018)**4,n))
    near=sorted(candidates,reverse=True)[:4];total=sum(w for w,n in near)
    for w,n in near:
        if w>0:body.vertex_groups[n].add([v.index],w/total,'REPLACE')

deform=body.modifiers.new('CW_Weighted_Deformation','ARMATURE');deform.object=rig;deform.use_deform_preserve_volume=False # match glTF linear blend skinning
rig['contract']='cw.humanoid.rig.v1';rig['rest_pose']='A';rig['height_metres']=1.9
body['art_status']='human-sci-fi-art-revision-awaiting-user-acceptance';body['source_license']='CC0-1.0 original anatomy surface and textile'
# Editable semantic groups prepare future hide masks, not an equipment implementation.
for name,predicate in {'region.head':lambda p:p.z>1.674,'region.torso':lambda p:.94<p.z<1.575 and abs(p.x)<.24,'region.legs':lambda p:.125<p.z<=.94 and abs(p.x)<.24,'region.feet':lambda p:p.z<=.125,'region.back':lambda p:p.y>.04 and 1.0<p.z<1.575 and abs(p.x)<.24}.items():
    attribute=body.data.attributes.new(name=name,type='BOOLEAN',domain='POINT')
    for v in body.data.vertices:attribute.data[v.index].value=predicate(v.co)
bpy.context.scene.frame_start=1;bpy.context.scene.frame_end=61;bpy.context.scene.render.fps=30
for frame,angle in [(1,0),(16,.028),(31,0),(46,-.028),(61,0)]:
    p=rig.pose.bones['spine_02'];p.rotation_mode='XYZ';p.rotation_euler.x=angle;p.keyframe_insert('rotation_euler',frame=frame)
rig.animation_data.action.name='CW_Idle_Breathing_Compatibility';bpy.context.scene.frame_set(1)
# Region attributes are source-only masks and never contaminate skin weights.
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'player-foundation.blend'))
from export_lods import export_lods
export_lods(SOURCE,OUT,rig,body,slots)
