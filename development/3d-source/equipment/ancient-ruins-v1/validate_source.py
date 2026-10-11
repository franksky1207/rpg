"""Open the saved editable source; compare the locked accepted rig/sockets,
weights and actual deformed meshes. Blender exits nonzero on contract failure.
"""
import bpy,json,pathlib,math,hashlib
HERE=pathlib.Path(__file__).resolve().parent
contract=json.loads((HERE/'rig-contract.json').read_text());rig=bpy.data.objects['CW_Humanoid_Rig_v1']
rig.data.pose_position='REST';bpy.context.view_layer.update()
assert len(rig.data.bones)==53 and len(contract['sockets'])==9
for row in contract['bones']:
 b=rig.data.bones[row['name']];assert (b.parent.name if b.parent else None)==row['parent']
 assert max(abs(b.matrix_local[i][j]-row['matrix'][i][j]) for i in range(4) for j in range(4))<1e-7
for name,row in contract['sockets'].items():
 o=bpy.data.objects[name];assert o.parent_bone==row['bone']
 assert max(abs(o.matrix_local[i][j]-row['local'][i][j]) for i in range(4) for j in range(4))<1e-7
base=HERE.parents[3]/'development/3d-source/characters/player-v1/player-foundation.blend'
assert hashlib.sha256(base.read_bytes()).hexdigest()==contract['baseSHA256'],'accepted source untouched'
for slot in ['helmet','armor','shoes']:
 o=bpy.data.objects['CW_Relic_'+slot];assert len(o.vertex_groups)==53
 for v in o.data.vertices:assert abs(sum(g.weight for g in v.groups)-1)<1e-7
 assert all(p.material_index<len(o.data.materials) for p in o.data.polygons)
 assert all(m.diffuse_color[3]==1 for m in o.data.materials),'opaque helmet/materials'
rig.data.pose_position='POSE';rig.animation_data_clear();bpy.context.scene.frame_set(1)
original={p.name:(p.rotation_mode,p.rotation_euler.copy(),p.rotation_quaternion.copy()) for p in rig.pose.bones}
results=[]
for name,degrees in [('head',25),('upper_arm.L',35),('forearm.L',70),('spine_01',15),('thigh.L',35),('shin.L',60),('foot.L',20),('hand.R',15)]:
 p=rig.pose.bones[name];p.rotation_mode='XYZ';p.rotation_euler.x+=math.radians(degrees);bpy.context.view_layer.update()
 row={'bone':name,'degrees':degrees,'meshes':{}}
 for slot in ['weapon','helmet','armor','shoes','accessory']:
  o=bpy.data.objects['CW_Relic_'+slot];ev=o.evaluated_get(bpy.context.evaluated_depsgraph_get());m=ev.to_mesh()
  assert all(math.isfinite(v) for vert in m.vertices for v in vert.co)
  # Every authored plate has a single rigid bone weight. Edge lengths must stay
  # rigid during animation; no stretched/degenerate armor from skin remapping.
  if slot in ['helmet','armor','shoes']:
   ratios=[]
   for edge in m.edges:
    a,b=edge.vertices;old=(o.data.vertices[a].co-o.data.vertices[b].co).length;new=(m.vertices[a].co-m.vertices[b].co).length
    if old>1e-6:ratios.append(new/old)
   assert min(ratios)>.99 and max(ratios)<1.01
   row['meshes'][slot]={'maxEdgeRatio':max(ratios),'minEdgeRatio':min(ratios),'vertices':len(m.vertices)}
  ev.to_mesh_clear()
 results.append(row)
 for b in rig.pose.bones:
  mode,euler,quat=original[b.name];b.rotation_mode=mode;b.rotation_euler=euler;b.rotation_quaternion=quat
 bpy.context.view_layer.update()
(HERE/'source-validation.json').write_text(json.dumps({'passed':True,'bones':53,'sockets':9,'unchangedPlayerSHA256':contract['baseSHA256'],'poses':results,'collisionScope':'visual ordinary-pose evidence; no claim of exhaustive attack cloth collision'},indent=2)+'\n')
print('PASS B28C saved source, locked 53 bones/9 sockets, normalized weights, opaque materials and eight finite strain-free poses')
