"""Read actual saved Blender camera/light/display values, preserve r1 provenance."""
import bpy,pathlib,sys,json
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
old=json.loads((HERE/'repair-r1/color-source-contract.json').read_text());actors={}
for actor in ['normal','elite','boss','player']:
 file=HERE/'player/animation-source.blend' if actor=='player' else HERE/'enemies'/actor/'source.blend'
 bpy.ops.wm.open_mainfile(filepath=str(file));bpy.context.view_layer.update();s=bpy.context.scene;cam=s.camera;bg=s.world.node_tree.nodes['Background'];lights=[]
 for o in sorted((o for o in bpy.data.objects if o.type=='LIGHT'),key=lambda o:o.name):
  lights.append({'name':o.name,'position':list(o.matrix_world.translation),'matrixWorld':[list(r) for r in o.matrix_world],'energyWatts':o.data.energy,'sizeMetres':o.data.size,'colorLinear':list(o.data.color)})
 desc={'sourceSHA':sha(file),'camera':{'position':list(cam.matrix_world.translation),'matrixWorld':[list(r) for r in cam.matrix_world],'orthoScale':cam.data.ortho_scale},'lights':lights,'worldLinear':list(bg.inputs[0].default_value[:3]),'worldStrength':bg.inputs[1].default_value,'viewTransform':s.view_settings.view_transform,'look':s.view_settings.look,'exposure':s.view_settings.exposure,'gamma':s.view_settings.gamma}
 previous=old['actors'][actor]
 for key in desc:
  if key!='sourceSHA':assert desc[key]==previous[key],('Camera/light/display changed unexpectedly',actor,key)
 actors[actor]=desc
write(HERE/'repair-r2/color-source-contract.json',{'schema':'cw.t2b2.r2-color-source-contract','actors':actors,'actualSavedBlenderRead':True,'sourceLightAndDisplayValuesExactR1':True,'studioHDR':'r1 studio reused: actual numeric camera/light/world values identical; material-only change does not change environment-only bake','notRenderer':True})
print('PASS actual four saved-source camera/light/display values match r1 exactly; current source SHA recorded')
