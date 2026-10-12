"""Locate unchanged all-frame armor/grip risks by actual body region.
No distance proxy is reported as Boolean penetration depth; no geometry hidden.
"""
import bpy,pathlib,sys
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
from mathutils.bvhtree import BVHTree
source=HERE/'player/animation-source.blend';bpy.ops.wm.open_mainfile(filepath=str(source));rig=bpy.data.objects['CW_Humanoid_Rig_v1'];body=bpy.data.objects['CW_Player_Foundation']
directions=[Vector(x).normalized() for x in [(1,.371,.213),(.237,1,.419),(.319,.271,1)]]
def inside(tree,p,d):
 hits=0
 for i in range(128):
  near,n,index,dist=tree.ray_cast(p,d,8)
  if near is None:return bool(hits%2)
  hits+=1;p=near+d*1e-5
 raise RuntimeError('Ray traversal did not terminate')
def evaluated(o,dg):
 e=o.evaluated_get(dg);m=e.to_mesh();points=[o.matrix_world@v.co for v in m.vertices];polys=[list(p.vertices) for p in m.polygons];e.to_mesh_clear();return points,polys,BVHTree.FromPolygons(points,polys)
def group(o,vertex):
 gs=o.data.vertices[vertex].groups
 return o.vertex_groups[max(gs,key=lambda g:g.weight).group].name if gs else 'rigid-socket'
weapon=bpy.data.objects['CW_Relic_weapon'];adj={v.index:set() for v in weapon.data.vertices}
for e in weapon.data.edges:
 a,b=e.vertices;adj[a].add(b);adj[b].add(a)
components=[];seen=set()
for v in weapon.data.vertices:
 if v.index in seen:continue
 todo=[v.index];indices=set()
 while todo:
  i=todo.pop()
  if i in indices:continue
  indices.add(i);todo.extend(adj[i]-indices)
 seen|=indices
 mats=sorted(set(weapon.data.materials[f.material_index].name for f in weapon.data.polygons if f.vertices[0] in indices))
 names={20:('energy-edge' if mats==['Relic_Quiet_Cyan'] else 'blade'),24:'guard',64:'grip',48:'pommel'}
 components.append({'id':len(components),'part':names[len(indices)],'vertices':sorted(indices),'materials':mats})
vertexPart={i:c['part'] for c in components for i in c['vertices']}
rows=[]
for action in ACTIONS:
 rig.animation_data.action=bpy.data.actions['B2_'+action]
 for frame in range(1,23):
  bpy.context.scene.frame_set(frame);bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get();bp,bf,tree=evaluated(body,dg)
  slots=[]
  for name in ['CW_Relic_armor','CW_Relic_weapon']:
   o=bpy.data.objects[name];points,faces,gear=evaluated(o,dg);risks=[]
   for i,p in enumerate(points):
    near,n,face,dist=tree.find_nearest(p)
    if dist<=.006 or not all(inside(tree,p.copy(),d) for d in directions):continue
    bodyVertex=min(bf[face],key=lambda v:(bp[v]-near).length_squared)
    risks.append({'vertex':i,'weaponPart':vertexPart[i] if name=='CW_Relic_weapon' else None,'sourceLocalMetres':list(o.data.vertices[i].co),'worldMetres':list(p),'nearestBodyPointMetres':list(near),'nearestBodyDominantBone':group(body,bodyVertex),'equipmentDominantBone':group(o,i),'nearestSurfaceDistanceMetres':dist})
   regions={}
   for r in risks:
    key=r['equipmentDominantBone']+'/'+r['nearestBodyDominantBone']
    if key not in regions or r['nearestSurfaceDistanceMetres']>regions[key]['nearestSurfaceDistanceMetres']:regions[key]=r
   parts=[]
   if name=='CW_Relic_weapon':
    for component in components:
     part=component['part'];rr=[r for r in risks if r['weaponPart']==part];indices=set(component['vertices']);partTree=BVHTree.FromPolygons(points,[f for f in faces if f[0] in indices])
     parts.append({'part':part,'threeRayInsideCountOver6mm':len(rr),'maxNearestSurfaceMetres':max((r['nearestSurfaceDistanceMetres'] for r in rr),default=0),'bodyRegions':sorted(set(r['nearestBodyDominantBone'] for r in rr)),'surfaceTrianglePairs':len(tree.overlap(partTree)),'classification':'potential intended palm/finger grip contact; not automatic approval' if part=='grip' else 'contact must be separately reviewed; not treated as grip'})
   slots.append({'parts':parts,'mesh':name,'unanimousRayCountOver6mm':len(risks),'surfaceTrianglePairs':len(tree.overlap(gear)),'worstByRegion':regions})
  rows.append({'action':action,'frame':frame,'slots':slots})
 print('LOCATED',action,22,flush=True)
write(HERE/'repair-r2/contact-localization.json',{'schema':'cw.t2b2.r2-contact-localization','sourceSHA':sha(source),'frames':rows,'weaponComponents':components,'method':'evaluated BVH nearest body triangle + three parity rays; source vertex and dominant bone localization; >6mm same r1 contact boundary','limitations':'dominant bone is an anatomical locator, not complete segmentation; nearest distances and surface pairs are not penetration depths; hand region is not automatic intentional-contact approval','formalGeometryModified':False,'gate':'pending-precise-contact-and-art-review'})
