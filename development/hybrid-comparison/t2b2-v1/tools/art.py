"""Original CC0 prototype modelling/animation utilities. Blender 4.3.2.
No formal owner or generation tool is executed. All output stays development.
"""
import bpy, math, json, pathlib, hashlib, sys
from mathutils import Vector
HERE=pathlib.Path(__file__).resolve().parents[1]
ROOT=HERE.parents[2]
ACTIONS=['idle','attack','hit','dodge','return','defeat']
def guard_build(paths):
 if '--rebuild' not in sys.argv:
  existing=[str(p) for p in paths if pathlib.Path(p).exists()]
  if existing:raise RuntimeError('Saved candidate art already exists; use reexport.py, or explicit -- --rebuild after preserving edits: '+', '.join(existing))
def sha(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def write(p,x): pathlib.Path(p).parent.mkdir(parents=True,exist_ok=True);pathlib.Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def reset():
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.context.preferences.filepaths.save_version=0
def material(name,color,metal=.5,rough=.38,emission=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF')
 p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 if emission:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emission
 return m
def texture(m,name):
 # Small authored panel finish, no borrowed images or generated concept art.
 im=bpy.data.images.new(name,width=64,height=64,alpha=True)
 pixels=[]
 for y in range(64):
  for x in range(64):
   seam=x%32 in (0,1) or y%32 in (0,1);v=.24 if seam else .66+((x*13+y*7)%17)/100
   pixels.extend((v,v,v,1))
 im.pixels.foreach_set(pixels);im.filepath_raw=str(HERE/'textures'/f'{name}.png');im.file_format='PNG';pathlib.Path(im.filepath_raw).parent.mkdir(exist_ok=True);im.save();im.pack()
 n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=im
 m.node_tree.links.new(n.outputs['Color'],m.node_tree.nodes['Principled BSDF'].inputs['Roughness'])
 return im
def rig_create(bones):
 d=bpy.data.armatures.new('B2_Articulated_Mechanism');o=bpy.data.objects.new('B2_Enemy_Rig',d);bpy.context.collection.objects.link(o)
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
 for name,head,tail,parent in bones:
  b=d.edit_bones.new(name);b.head=head;b.tail=tail
  if parent:b.parent=d.edit_bones[parent]
 bpy.ops.object.mode_set(mode='OBJECT');return o
def mesh(name,verts,faces,mat,rig,bone):
 d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update();o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);d.materials.append(mat)
 if rig:
  g=o.vertex_groups.new(name=bone);g.add(list(range(len(verts))),1,'REPLACE');a=o.modifiers.new('Articulated_Weight','ARMATURE');a.object=rig;o.parent=rig
 # Explicit original UV projection; preserve editable mesh and exact panels.
 uv=d.uv_layers.new(name='PanelUV')
 for poly in d.polygons:
  for li in poly.loop_indices:
   co=d.vertices[d.loops[li].vertex_index].co;uv.data[li].uv=(co.x*.5+.5,co.z*.5)
 return o
def loft(name,rows,mat,rig,bone,n=16):
 verts=[];faces=[]
 for x,y,z,rx,ry in rows:
  for i in range(n):
   a=2*math.pi*i/n;verts.append((x+rx*math.cos(a),y+ry*math.sin(a),z))
 for j in range(len(rows)-1):
  for i in range(n):faces.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
 faces.extend([tuple(reversed(range(n))),tuple(range((len(rows)-1)*n,len(rows)*n))])
 return mesh(name,verts,faces,mat,rig,bone)
def plate(name,outline,thickness,mat,rig,bone):
 c=sum((Vector(v) for v in outline),Vector())/len(outline);n=len(outline);verts=[]
 for offset,k in [(0,.88),(.012,1),(thickness-.012,1),(thickness,.88)]:
  verts.extend(tuple(c+(Vector(v)-c)*k+Vector((0,offset,0))) for v in outline)
 faces=[tuple(reversed(range(n))),tuple(range(n*3,n*4))]
 for j in range(3):
  for i in range(n):faces.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
 return mesh(name,verts,faces,mat,rig,bone)
def animation(rig,name,poses):
 rig.animation_data_clear();act=bpy.data.actions.new('B2_'+name);act.use_fake_user=True;rig.animation_data_create();rig.animation_data.action=act
 for frame,pose in poses:
  for b in rig.pose.bones:
   b.rotation_mode='XYZ';b.rotation_euler=tuple(math.radians(a) for a in pose.get(b.name,(0,0,0)));b.location=(0,0,0)
   b.keyframe_insert('rotation_euler',frame=frame);b.keyframe_insert('location',frame=frame)
 for fc in act.fcurves:
  for kp in fc.keyframe_points:kp.interpolation='BEZIER'
 return act
def export(rig,path,objects=None):
 bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
 selected=objects or list(bpy.data.objects);parents=[]
 for o in selected:
  if o.type in ('MESH','EMPTY'):o.select_set(True)
  if o.type=='MESH' and any(m.type=='ARMATURE' for m in o.modifiers) and o.parent:
   parents.append((o,o.parent,o.matrix_world.copy()));o.parent=None;o.matrix_world=parents[-1][2]
 rig.animation_data.action=bpy.data.actions['B2_idle'];bpy.context.scene.frame_set(1)
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_frame_range=True,export_skins=True,export_yup=True,export_all_vertex_colors=False)
 for o,parent,matrix in parents:o.parent=parent;o.matrix_world=matrix
def setup_camera(height=2,player=False):
 s=bpy.context.scene;s.frame_start=1;s.frame_end=22;s.render.fps=30;s.render.fps_base=1
 s.render.engine='CYCLES';s.cycles.samples=8;s.cycles.use_denoising=False;s.cycles.device='CPU';s.render.threads_mode='FIXED';s.render.threads=8
 s.render.resolution_x=256;s.render.resolution_y=256;s.render.resolution_percentage=100;s.render.film_transparent=True;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.view_settings.view_transform='AgX'
 s.world=bpy.data.worlds.new('B2_Studio');s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.12,.15,.20,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.5
 yaw=math.radians(-35 if player else 35);pitch=math.radians(15);center=Vector((0,0,height*.5))
 view=Vector((math.sin(yaw)*math.cos(pitch),-math.cos(yaw)*math.cos(pitch),math.sin(pitch)));right=Vector((math.cos(yaw),math.sin(yaw),0))
 d=bpy.data.cameras.new('B2_Fixed35_15');cam=bpy.data.objects.new('B2_Fixed35_15',d);s.collection.objects.link(cam);cam.location=center+view*10;cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();d.type='ORTHO';d.ortho_scale=height*1.8;s.camera=cam
 for name,pos,power,size,color in [('Key',center+view*4-right*3+Vector((0,0,4)),500,4,(1,.93,.83)),('Fill',center+view*2+right*4+Vector((0,0,2)),250,4,(.54,.72,1)),('Rim',center-view*3+Vector((0,0,3)),450,3,(.36,.85,1))]:
  l=bpy.data.lights.new(name,'AREA');l.energy=power;l.size=size;l.color=color;o=bpy.data.objects.new(name,l);s.collection.objects.link(o);o.location=pos;o.rotation_euler=(center-o.location).to_track_quat('-Z','Y').to_euler()
 return cam
