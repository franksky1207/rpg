import bpy,sys,json,pathlib
out=[]
for actor in ['normal','elite','boss']:
 base=pathlib.Path(__file__).resolve().parents[1]/'enemies'/actor
 for kind in ['source','glb']:
  if kind=='source':bpy.ops.wm.open_mainfile(filepath=str(base/'source.blend'))
  else:
   bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(base/'candidate.glb'))
  mats=[]
  for m in bpy.data.materials:
   if not m.use_nodes:continue
   p=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
   if not p:continue
   vals={k: {'value': list(p.inputs[k].default_value) if k in ['Base Color','Emission Color'] else p.inputs[k].default_value,'links':[x.from_node.name+':'+x.from_socket.name for x in p.inputs[k].links]} for k in ['Base Color','Metallic','Roughness','Emission Color','Emission Strength','IOR']}
   tex=[{'name':n.image.name,'colorSpace':n.image.colorspace_settings.name,'firstRGBA':list(n.image.pixels[:4]),'size':list(n.image.size)} for n in m.node_tree.nodes if n.type=='TEX_IMAGE']
   mats.append({'name':m.name,'inputs':vals,'textures':tex})
  out.append({'actor':actor,'kind':kind,'materials':mats})
(pathlib.Path(__file__).resolve().parents[1]/'repair-r2/material-after.json').write_text(json.dumps(out,indent=2))
