"""Bake original saved area-light studio radiance for offline native PBR QC.
No third-party HDR/IBL borrowed. Actor-free environment bake is not pose evidence.
"""
import bpy,sys,pathlib,math
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]/'t2b2-v1/tools'))
from art import *
dest=HERE.parent/'t2b3-v1/lighting';dest.mkdir(parents=True,exist_ok=True)
for actor,height in [('player',1.94)]:
    source=HERE/'player/animation-source.blend';bpy.ops.wm.open_mainfile(filepath=str(source));bpy.context.preferences.filepaths.save_version=0;s=bpy.context.scene
    lamps=[(o.name,o.matrix_world.copy(),o.data.energy,o.data.size,tuple(o.data.color)) for o in bpy.data.objects if o.type=='LIGHT']
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    for name,matrix,watts,size,color in lamps:
        bpy.ops.mesh.primitive_plane_add(size=size);o=bpy.context.object;o.name=name+'_Radiance_Area';o.matrix_world=matrix
        mat=bpy.data.materials.new(name+'_Original_Studio_Radiance');mat.use_nodes=True;n=mat.node_tree.nodes;n.clear();e=n.new('ShaderNodeEmission');e.inputs['Color'].default_value=(*color,1);e.inputs['Strength'].default_value=watts/(size*size*math.pi);out=n.new('ShaderNodeOutputMaterial');mat.node_tree.links.new(e.outputs['Emission'],out.inputs['Surface']);o.data.materials.append(mat)
    data=bpy.data.cameras.new('Studio_Equirectangular');cam=bpy.data.objects.new(data.name,data);s.collection.objects.link(cam);cam.location=(0,0,height*.5);cam.rotation_euler=(math.pi/2,0,0);data.type='PANO';data.panorama_type='EQUIRECTANGULAR';s.camera=cam
    s.render.engine='CYCLES';s.cycles.samples=32;s.render.film_transparent=False;s.render.resolution_x=512;s.render.resolution_y=256;s.render.image_settings.file_format='HDR';s.render.image_settings.color_mode='RGB';s.render.filepath=str(dest/f'{actor}-studio.hdr');s.view_settings.view_transform='Standard'
    bpy.ops.wm.save_as_mainfile(filepath=str(dest/f'{actor}-studio-source.blend'),compress=True);bpy.ops.render.render(write_still=True)
write(dest/'contract.json',{'schema':'cw.t2b3.player-studio-ibl','version':1,'license':'CC0 original light arrangement only; no external HDR image','basis':'saved B2 source area positions/color/watts/size and world linear radiance','radiance':'watts/(pi*area), scene-linear HDR, fixed emitter geometry','spatialApproximation':'actor-center environment approximation; Cycles sees finite emitters per shading point, native IBL residual must be measured','displayTransform':'HDR contains no view transform. Current B3 native uses Babylon ACES; B2 source AgX mismatch remains an explicit failed fairness gate.','notPoseEvidence':True})
print('PASS original studio HDR and editable source, not a borrowed environment')
