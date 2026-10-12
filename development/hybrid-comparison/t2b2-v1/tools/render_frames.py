"""Offline asset baking, not an A/B/C runtime Renderer.
--actor normal|elite|boss|player --output /tmp/b2-frames
Saves real Cycles RGBA and 16-bit linear camera depth. Z resolves independent
layers in every pose; fixed painter order alone cannot handle a moving weapon.
"""
import bpy,bmesh,sys,pathlib,argparse,math
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
from bpy_extras.object_utils import world_to_camera_view
p=argparse.ArgumentParser();p.add_argument('--actor',required=True);p.add_argument('--output',default='/tmp/t2b2-frames');p.add_argument('--sample-only',action='store_true');p.add_argument('--terminal-only',action='store_true');p.add_argument('--action',choices=ACTIONS);args=p.parse_args(sys.argv[sys.argv.index('--')+1:])
source=HERE/'player/animation-source.blend' if args.actor=='player' else HERE/'enemies'/args.actor/'source.blend'
bpy.ops.wm.open_mainfile(filepath=str(source));s=bpy.context.scene
s.cycles.samples=32
rig=next(o for o in bpy.data.objects if o.type=='ARMATURE');rig.data.pose_position='POSE'
meshes=[o for o in bpy.data.objects if o.type=='MESH'];out=pathlib.Path(args.output)/args.actor;out.mkdir(parents=True,exist_ok=True)
layers={}
if args.actor=='player':
 body=bpy.data.objects['CW_Player_Foundation'];rig.data.pose_position='REST';bpy.context.view_layer.update()
 sys.path.insert(0,str(ROOT/'development/3d-source/characters/player-v1'))
 from lod_surface import configure_lod
 lod=configure_lod(body,.64);bpy.context.view_layer.objects.active=body;bpy.ops.object.modifier_move_up(modifier=lod.name)
 evalbody=body.evaluated_get(bpy.context.evaluated_depsgraph_get());d=bpy.data.meshes.new_from_object(evalbody,preserve_all_data_layers=True,depsgraph=bpy.context.evaluated_depsgraph_get());body.modifiers.remove(lod)
 # Same conservative predicates as original registry; converted Z-up -> glTF.
 def region(poly):
  mat=d.materials[poly.material_index].name
  positions=[(d.vertices[i].co.x,d.vertices[i].co.z,-d.vertices[i].co.y) for i in poly.vertices]
  predicates={
   'helmet':lambda x,y,z:mat=='CW_Head_NaturalSkin' and 1.735<y<1.862 and z>.036 and abs(x)<.074,
   'armor':lambda x,y,z:abs(x)<.135 and 1.375<y<1.465 and z>.075,
   'shoes':lambda x,y,z:abs(abs(x)-.14)<.045 and .035<y<.075 and .05<z<.19,
   'accessory':lambda x,y,z:abs(x)<.03 and 1.453<y<1.514 and z<-.09}
  return next((k for k,f in predicates.items() if all(f(*v) for v in positions)),'base')
 # Triangulate first, so patch predicates apply per triangle just like runtime.
 bm=bmesh.new();bm.from_mesh(d);bmesh.ops.triangulate(bm,faces=list(bm.faces));bm.to_mesh(d);bm.free();buckets=[region(poly) for poly in d.polygons]
 for key in ['base','helmet','armor','shoes','accessory']:
  o=body.copy();o.data=d.copy();bpy.context.collection.objects.link(o);o.name='B2_body_'+key
  bm=bmesh.new();bm.from_mesh(o.data);bm.faces.ensure_lookup_table();bmesh.ops.delete(bm,geom=[f for f in bm.faces if buckets[f.index]!=key],context='FACES');bm.to_mesh(o.data);bm.free()
  layers['body-'+key]=[o]
 body.hide_render=True;meshes.remove(body)
 # Source joined five meshes carry original slot custom properties.
 for slot in ['weapon','helmet','armor','shoes','accessory']:
  found=[o for o in meshes if o.get('slot')==slot or o.name.lower().endswith('_'+slot) or o.name=='CW_Equipment_'+slot]
  if not found:
   found=[o for o in meshes if o.get('equipment_slot')==slot]
  if not found:raise RuntimeError(('Missing actual slot',slot,[(o.name,dict(o.items())) for o in meshes]))
  layers[slot]=found
 rig.data.pose_position='POSE'
else:layers={'enemy':meshes}
allmeshes=[o for group in layers.values() for o in group]
s.use_nodes=True;s.view_layers[0].use_pass_z=True
n=s.node_tree.nodes;n.clear();r=n.new('CompositorNodeRLayers');comp=n.new('CompositorNodeComposite');s.node_tree.links.new(r.outputs['Image'],comp.inputs[0])
mapper=n.new('CompositorNodeMapRange');mapper.inputs['From Min'].default_value=6;mapper.inputs['From Max'].default_value=14;mapper.inputs['To Min'].default_value=0;mapper.inputs['To Max'].default_value=1;mapper.use_clamp=True;s.node_tree.links.new(r.outputs['Depth'],mapper.inputs[0])
z=n.new('CompositorNodeOutputFile');z.format.file_format='PNG';z.format.color_mode='BW';z.format.color_depth='16';s.node_tree.links.new(mapper.outputs[0],z.inputs[0])
foot=world_to_camera_view(s,s.camera,Vector((0,0,0)));pivot=[foot.x*256,(1-foot.y)*256]
samples=json.loads((out/'bake.json').read_text())['samples'] if (args.terminal_only or args.action) and (out/'bake.json').exists() else []
if args.action:samples=[r for r in samples if r['action']!=args.action]
for name in ([args.action] if args.action else ACTIONS):
 rig.animation_data.action=bpy.data.actions['B2_'+name]
 for f in ([22] if args.terminal_only else [1,10,22] if args.sample_only else range(1,23)):
  s.frame_set(f);bpy.context.view_layer.update()
  for key,objs in layers.items():
   for o in allmeshes:o.hide_render=o not in objs
   dest=out/name/key;dest.mkdir(parents=True,exist_ok=True);s.render.filepath=str(dest/f'{f-1:02}.png');z.base_path=str(dest);z.file_slots[0].path=f'depth-{f-1:02}-';bpy.ops.render.render(write_still=True)
  # Actual evaluated joints/mesh points for pose deformation evidence.
  samples.append({'action':name,'frame':f-1,'joints':{b.name:[list(row) for row in b.matrix] for b in rig.pose.bones}})
write(out/'bake.json',{'actor':args.actor,'sourceSHA':sha(source),'frameCount':22,'fps':30,'durationMs':700,'endpoint':'inclusive sample at 700ms; no extra frame hold','layers':list(layers),'pivotPixels':pivot,'depth':{'format':'PNG16 linear normalized camera distance, not sRGB','nearMetres':6,'farMetres':14,'background':65535,'ordering':'smaller distance in front; per-pixel not fixed painter order'},'camera':{'yawDegrees':35,'pitchDegrees':15,'projection':'orthographic','orthoScale':s.camera.data.ortho_scale,'position':list(s.camera.location),'matrixWorld':[list(r) for r in s.camera.matrix_world]},'samples':samples,'renderEngine':'Cycles CPU 32 samples','artApproval':False})
