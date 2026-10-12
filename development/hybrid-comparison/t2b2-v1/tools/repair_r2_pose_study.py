import bpy,pathlib,sys,math,json
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
from mathutils.bvhtree import BVHTree
bpy.ops.wm.open_mainfile(filepath=str(HERE/'player/animation-source.blend'));rig=bpy.data.objects['CW_Humanoid_Rig_v1'];body=bpy.data.objects['CW_Player_Foundation'];armor=bpy.data.objects['CW_Relic_armor']
rig.animation_data.action=bpy.data.actions['B2_attack'];bpy.context.scene.frame_set(10)
base=rig.pose.bones['upper_arm.R'].rotation_euler.copy();rows=[]
for axis in range(3):
 for degrees in [-20,-10,0,10,20]:
  b=rig.pose.bones['upper_arm.R'];b.rotation_euler=base.copy();b.rotation_euler[axis]+=math.radians(degrees);bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get()
  e=body.evaluated_get(dg);m=e.to_mesh();tree=BVHTree.FromPolygons([body.matrix_world@v.co for v in m.vertices],[list(p.vertices) for p in m.polygons]);e.to_mesh_clear()
  e=armor.evaluated_get(dg);m=e.to_mesh();values=[]
  for v in m.vertices:
   point=armor.matrix_world@v.co;near,n,index,dist=tree.find_nearest(point)
   if (point-near).dot(n)<0:values.append(dist)
  e.to_mesh_clear();rows.append({'axis':axis,'degrees':degrees,'signedNearestMaxMetres':max(values,default=0)})
(HERE/'repair-r2/rejected-pose-study.json').write_text(json.dumps(rows,indent=2));print(rows)
