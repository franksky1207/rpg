"""Export the editable saved source without rebuilding or overwriting sculpt work.
blender -b player-foundation.blend --python-exit-code 1 --python export_lods.py
Original CC0-1.0 source tool; five materials, embedded PNGs, preserved 53-joint rig.
"""
import bpy, pathlib, json, sys
SOURCE=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(SOURCE))
from lod_surface import configure_lod

def export_lods(source,out,rig,body,slots):
    out.mkdir(parents=True,exist_ok=True);stats={};bpy.context.scene.frame_set(1)
    for quality,ratio in [('low',.05),('medium',.16),('high',.64)]:
        lod=configure_lod(body,ratio)
        bpy.context.view_layer.objects.active=body;bpy.ops.object.modifier_move_up(modifier=lod.name)
        bpy.ops.object.select_all(action='DESELECT');body.select_set(True);rig.select_set(True)
        for o in bpy.data.objects:
            if o.type=='EMPTY':o.select_set(True)
        file=out/f'player-{quality}.glb'
        bpy.ops.export_scene.gltf(filepath=str(file),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=True,export_skins=True,export_yup=True,export_all_influences=False,export_force_sampling=False)
        e=body.evaluated_get(bpy.context.evaluated_depsgraph_get());m=e.to_mesh();m.calc_loop_triangles()
        stats[quality]={'vertices':len(m.vertices),'triangles':len(m.loop_triangles),'bytes':file.stat().st_size,'ratio':ratio};e.to_mesh_clear();body.modifiers.remove(lod)
    (source/'export-measurements.json').write_text(json.dumps({'heightMetres':1.9,'bones':len(rig.data.bones),'slots':slots,'lod':stats,'artStatus':body['art_status'],'sourceVertices':len(body.data.vertices),'sourceBytes':(source/'player-foundation.blend').stat().st_size,'lodPolicy':'soft garment-boundary importance; prioritize head and hands'},indent=2)+'\n')
    print('CW_EXPORT',json.dumps(stats));return stats

if __name__=='__main__':
    slots={'weapon':'socket.weapon.R','helmet':'socket.helmet','armor':'socket.armor','shoes':'socket.shoes.L','accessory':'socket.accessory.back'}
    export_lods(SOURCE,SOURCE.parents[3]/'assets/3d/characters/player-v1',bpy.data.objects['CW_Humanoid_Rig_v1'],bpy.data.objects['CW_Player_Foundation'],slots)
