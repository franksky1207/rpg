"""Export the editable saved source without rebuilding or overwriting sculpt work.
blender -b player-foundation.blend --python-exit-code 1 --python export_lods.py
Original CC0-1.0 source tool; five materials, embedded PNGs, preserved 53-joint rig.
"""
import bpy, pathlib, json, sys, struct
SOURCE=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(SOURCE))
from lod_surface import configure_lod

def neutralize_face_tint(file):
    # Blender shares COLOR_0 across all primitives even when the skin shader
    # does not use it. glTF always multiplies it. Neutralize only the separate
    # skin colour accessor, so Babylon matches the editable Blender material.
    data=bytearray(file.read_bytes());size=struct.unpack_from('<I',data,12)[0]
    doc=json.loads(data[20:20+size]);binary=20+size+8
    primitives=[p for m in doc['meshes'] for p in m['primitives']]
    skins=[p for p in primitives if doc['materials'][p['material']]['name']=='CW_Head_NaturalSkin']
    assert skins
    for primitive in skins:
        index=primitive['attributes']['COLOR_0']
        assert all(p is primitive or p['attributes'].get('COLOR_0')!=index for p in primitives)
        accessor=doc['accessors'][index];view=doc['bufferViews'][accessor['bufferView']]
        assert accessor['componentType']==5126 and accessor['type'] in ['VEC3','VEC4']
        count=3 if accessor['type']=='VEC3' else 4;stride=view.get('byteStride',count*4)
        offset=binary+view.get('byteOffset',0)+accessor.get('byteOffset',0)
        for vertex in range(accessor['count']):struct.pack_into('<'+'f'*count,data,offset+vertex*stride,*([1.0]*count))
    file.write_bytes(data)

def export_lods(source,out,rig,body,slots):
    out.mkdir(parents=True,exist_ok=True);stats={};bpy.context.scene.frame_set(1)
    for quality,ratio in [('low',.05),('medium',.16),('high',.64)]:
        lod=configure_lod(body,ratio)
        bpy.context.view_layer.objects.active=body;bpy.ops.object.modifier_move_up(modifier=lod.name)
        bpy.ops.object.select_all(action='DESELECT');body.select_set(True);rig.select_set(True)
        for o in bpy.data.objects:
            if o.type=='EMPTY':o.select_set(True)
        file=out/f'player-{quality}.glb'
        bpy.ops.export_scene.gltf(filepath=str(file),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=True,export_skins=True,export_yup=True,export_all_influences=False,export_force_sampling=False,export_all_vertex_colors=False)
        neutralize_face_tint(file)
        e=body.evaluated_get(bpy.context.evaluated_depsgraph_get());m=e.to_mesh();m.calc_loop_triangles()
        stats[quality]={'vertices':len(m.vertices),'triangles':len(m.loop_triangles),'bytes':file.stat().st_size,'ratio':ratio};e.to_mesh_clear();body.modifiers.remove(lod)
    (source/'export-measurements.json').write_text(json.dumps({'heightMetres':1.9,'bones':len(rig.data.bones),'slots':slots,'lod':stats,'artStatus':body['art_status'],'sourceVertices':len(body.data.vertices),'sourceBytes':(source/'player-foundation.blend').stat().st_size,'lodPolicy':'soft garment-boundary importance; prioritize head and hands'},indent=2)+'\n')
    print('CW_EXPORT',json.dumps(stats));return stats

if __name__=='__main__':
    slots={'weapon':'socket.weapon.R','helmet':'socket.helmet','armor':'socket.armor','shoes':'socket.shoes.L','accessory':'socket.accessory.back'}
    export_lods(SOURCE,SOURCE.parents[3]/'assets/3d/characters/player-v1',bpy.data.objects['CW_Humanoid_Rig_v1'],bpy.data.objects['CW_Player_Foundation'],slots)
