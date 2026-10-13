"""Export the saved refined G007 source; reproducible without additive refinement.
The tiny fixed core/frame intentionally retains its 100 triangles at every LOD.
"""
import bpy, pathlib, json, hashlib
from mathutils import Matrix
HERE=pathlib.Path(__file__).resolve().parent;ROOT=HERE.parents[3];OUT=ROOT/'assets/3d/equipment/ancient-ruins-v1'
bpy.ops.wm.open_mainfile(filepath=str(HERE/'ancient-ruins.blend'))
rig=bpy.data.objects['CW_Humanoid_Rig_v1'];rig.data.pose_position='REST';rig.animation_data_clear();bpy.context.view_layer.update()
parts={s:bpy.data.objects['CW_Relic_'+s] for s in ['weapon','helmet','armor','shoes','accessory']}
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
  if ratio<1 and slot!='accessory':
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
