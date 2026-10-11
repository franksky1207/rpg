"""Reopen real .blend and verify editable topology, weights, pose deformation,
sockets, normals, scale and a reproducible low-LOD export. Writes evidence outside
the source tree. blender -b player-foundation.blend --python validate_source.py
"""
import bpy, pathlib, math, json, hashlib
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
bpy.context.scene.frame_set(1);bpy.ops.object.select_all(action='DESELECT');body.select_set(True);rig.select_set(True)
for o in bpy.data.objects:
    if o.type=='EMPTY':o.select_set(True)
output='/tmp/rpg-player-reexport.glb'
bpy.ops.export_scene.gltf(filepath=output,export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=True,export_skins=True,export_yup=True,export_all_influences=False)
source=pathlib.Path(bpy.data.filepath).parents[4]/'assets/3d/characters/player-v1/player-low.glb'
assert pathlib.Path(output).read_bytes()==source.read_bytes(),'re-export must match committed low GLB'
report={'passed':True,'bones':53,'vertices':len(body.data.vertices),'height':1.9,'maxPoseMovementMetres':movement,'sockets':slots,'lowReexportBytes':pathlib.Path(output).stat().st_size,'lowReexportSHA256':hashlib.sha256(pathlib.Path(output).read_bytes()).hexdigest()}
pathlib.Path('/tmp/rpg-player-source-validation.json').write_text(json.dumps(report,indent=2)+'\n');print('PASS editable Blender source',json.dumps(report))
