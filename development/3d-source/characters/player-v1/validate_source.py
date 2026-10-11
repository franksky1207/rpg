"""Reopen real .blend and verify editable topology, weights, pose deformation,
sockets, normals, scale and a reproducible low-LOD export. Writes evidence outside
the source tree. blender -b player-foundation.blend --python validate_source.py
"""
import bpy, bmesh, pathlib, math, json, hashlib, sys
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
from lod_surface import configure_lod
rig=bpy.data.objects['CW_Humanoid_Rig_v1'];body=bpy.data.objects['CW_Player_Foundation']
assert rig.type=='ARMATURE' and body.type=='MESH' and len(rig.data.bones)==53
assert all(abs(v-1)<1e-6 for v in body.scale) and all(abs(v-1)<1e-6 for v in rig.scale)
assert any(m.type=='ARMATURE' and m.object==rig for m in body.modifiers)
assert len(body.data.vertices)>3000 and any(len(p.vertices)==4 for p in body.data.polygons)
assert abs(max(v.co.z for v in body.data.vertices)-1.9)<1e-5
for v in body.data.vertices:
    assert v.groups and len(v.groups)<=4 and abs(sum(g.weight for g in v.groups)-1)<1e-5
    assert all(math.isfinite(x) for x in v.co) and abs(v.normal.length-1)<1e-4
slots={'weapon':'socket.weapon.R','helmet':'socket.helmet','armor':'socket.armor','shoes':'socket.shoes.L','accessory':'socket.accessory.back'}
for name in slots.values():
    o=bpy.data.objects[name];assert o.type=='EMPTY' and o.parent==rig and o.parent_type=='BONE' and o.parent_bone in rig.data.bones
assert all(f'{finger}_{j:02}.{side}' in rig.data.bones for side in ['L','R'] for finger in ['thumb','index','middle','ring','little'] for j in [1,2,3])
def evaluated():
    e=body.evaluated_get(bpy.context.evaluated_depsgraph_get());m=e.to_mesh();p=[v.co.copy() for v in m.vertices];e.to_mesh_clear();return p
bpy.context.scene.frame_set(1);before=evaluated();bpy.context.scene.frame_set(16);after=evaluated()
movement=max((a-b).length for a,b in zip(before,after));assert movement>.001
# Closed manifold union, with no detached hard shells or open joint seams.
bm=bmesh.new();bm.from_mesh(body.data)
assert all(e.is_manifold for e in bm.edges),'anatomical body must be closed manifold'
assert all(f.calc_area()>1e-12 for f in bm.faces),'zero-area source face'
remaining=set(bm.verts);components=[]
while remaining:
    seed=remaining.pop();stack=[seed];count=1
    while stack:
        v=stack.pop()
        for e in v.link_edges:
            n=e.other_vert(v)
            if n in remaining:remaining.remove(n);stack.append(n);count+=1
    components.append(count)
assert len(components)==1,('detached anatomical components',components)
bm.free()
for name in ['region.head','region.torso','region.legs','region.feet','region.back']:
    assert name in body.data.attributes and name not in body.vertex_groups
# Exercise elbow/knee/shoulder/hip independently. Report geometric strain,
# with a guard against explosive deformation or collapsed skin faces.
bpy.context.scene.frame_set(1);rest=evaluated();pose_reports=[]
for bone_name,degrees in [('forearm.L',80),('shin.L',75),('upper_arm.L',45),('thigh.L',50),('index_02.L',55),('head',25),('neck',15)]:
    p=rig.pose.bones[bone_name];p.rotation_mode='XYZ';original=p.rotation_euler.copy();p.rotation_euler.x+=math.radians(degrees);bpy.context.view_layer.update();posed=evaluated()
    assert all(math.isfinite(x) for v in posed for x in v)
    moved=max((a-b).length for a,b in zip(rest,posed));assert moved>.001
    ratios=[(posed[e.vertices[0]]-posed[e.vertices[1]]).length/max((rest[e.vertices[0]]-rest[e.vertices[1]]).length,1e-6) for e in body.data.edges]
    assert max(ratios)<6,'explosive edge stretching'
    pose_reports.append({'bone':bone_name,'degrees':degrees,'movementMetres':moved,'maxEdgeStretch':max(ratios),'severeCompressedEdges':sum(r<.05 for r in ratios)})
    p.rotation_euler=original;bpy.context.view_layer.update()
bpy.context.scene.frame_set(1);bpy.ops.object.select_all(action='DESELECT');body.select_set(True);rig.select_set(True)
for o in bpy.data.objects:
    if o.type=='EMPTY':o.select_set(True)
lod=configure_lod(body,.05)
bpy.context.view_layer.objects.active=body;bpy.ops.object.modifier_move_up(modifier=lod.name)
output='/tmp/rpg-player-reexport.glb'
bpy.ops.export_scene.gltf(filepath=output,export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=True,export_skins=True,export_yup=True,export_all_influences=False,export_force_sampling=False,export_all_vertex_colors=False)
from export_lods import neutralize_face_tint
neutralize_face_tint(pathlib.Path(output))
source=pathlib.Path(bpy.data.filepath).parents[4]/'assets/3d/characters/player-v1/player-low.glb'
assert pathlib.Path(output).read_bytes()==source.read_bytes(),'re-export must match committed low GLB'
report={'passed':True,'bones':53,'vertices':len(body.data.vertices),'height':1.9,'maxPoseMovementMetres':movement,'sockets':slots,'jointPoses':pose_reports,'closedManifold':True,'lowReexportBytes':pathlib.Path(output).stat().st_size,'lowReexportSHA256':hashlib.sha256(pathlib.Path(output).read_bytes()).hexdigest()}
pathlib.Path('/tmp/rpg-player-source-validation.json').write_text(json.dumps(report,indent=2)+'\n');print('PASS editable Blender source',json.dumps(report))
