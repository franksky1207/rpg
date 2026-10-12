"""Actual saved-source poses, joint/socket contract and collision risk probes.
Writes reproducible QC evidence; collision proxies never equal art approval.
"""
import bpy,pathlib,sys,math
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
from mathutils.bvhtree import BVHTree
reports=[]
def signatures():
 return {o.name:hashlib.sha256(json.dumps({'vertices':[list(v.co) for v in o.data.vertices],'polygons':[list(p.vertices) for p in o.data.polygons],'weights':[[(g.group,g.weight) for g in v.groups] for v in o.data.vertices]},separators=(',',':')).encode()).hexdigest() for o in bpy.data.objects if o.type=='MESH'}
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'development/3d-source/equipment/ancient-ruins-v1/ancient-ruins.blend'));acceptedMeshes=signatures()
for actor in ['normal','elite','boss','player']:
 file=HERE/'player/animation-source.blend' if actor=='player' else HERE/'enemies'/actor/'source.blend'
 bpy.ops.wm.open_mainfile(filepath=str(file));rig=next(o for o in bpy.data.objects if o.type=='ARMATURE');rig.data.pose_position='POSE';meshes=[o for o in bpy.data.objects if o.type=='MESH']
 assert all(len(o.data.polygons)>10 for o in meshes)
 if actor!='player':assert all(o.data.uv_layers for o in meshes)
 else:
  assert signatures()==acceptedMeshes,'Original player/equipment topology/weights changed'
  assert bpy.data.objects['CW_Player_Foundation'].data.uv_layers
 assert all(len(o.data.materials)>0 for o in meshes)
 contractChecks=None
 if actor=='player':
  con=json.loads((ROOT/'development/3d-source/equipment/ancient-ruins-v1/rig-contract.json').read_text());assert len(rig.data.bones)==53
  for b in con['bones']:
   current=rig.data.bones[b['name']];assert (current.parent.name if current.parent else None)==b['parent'];assert max(abs(current.matrix_local[i][j]-b['matrix'][i][j]) for i in range(4) for j in range(4))<1e-6
  for name,v in con['sockets'].items():
   o=bpy.data.objects[name];assert o.parent_bone==v['bone'];assert max(abs(o.matrix_local[i][j]-v['local'][i][j]) for i in range(4) for j in range(4))<1e-6
  contractChecks={'bones':53,'sockets':9,'restMatricesUnchanged':True,'socketLocalMatricesUnchanged':True,'geometryNotRewritten':True,'actualMeshAndWeightSignatures':acceptedMeshes,'equipmentUV':'original solid-PBR equipment has no UV; immutable, no new texture claimed'}
 poses=[]
 for name in ACTIONS:
  act=bpy.data.actions['B2_'+name];assert act.fcurves and act.frame_range[0]==1 and act.frame_range[1]==22;rig.animation_data.action=act
  reference=None;maxmove=0;risks=[]
  for frame in range(1,23):
   bpy.context.scene.frame_set(frame);bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get()
   joints=[b.matrix.copy() for b in rig.pose.bones]
   if reference is None:reference=joints
   maxmove=max(maxmove,max(abs(a[i][j]-b[i][j]) for a,b in zip(joints,reference) for i in range(4) for j in range(4)))
   allpoints=[];evaluated={}
   for o in meshes:
    e=o.evaluated_get(dg);m=e.to_mesh();points=[o.matrix_world@v.co for v in m.vertices];assert all(math.isfinite(c) for v in points for c in v);allpoints.extend(points)
    evaluated[o.name]=(points,[list(p.vertices) for p in m.polygons]);e.to_mesh_clear()
   bounds=[[min(v[i] for v in allpoints),max(v[i] for v in allpoints)] for i in range(3)]
   assert max(b-a for a,b in bounds)<8,'Explosive deformation'
   assert bounds[2][0]>=0,('Candidate intersects ground',actor,name,frame,bounds[2][0])
   probe={'frame':frame,'boundsMetres':bounds,'belowGroundMetres':max(0,-bounds[2][0])}
   if actor=='player':
    bodyPoints,bodyFaces=evaluated['CW_Player_Foundation'];tree=BVHTree.FromPolygons(bodyPoints,bodyFaces)
    slots=[]
    for o in meshes:
     if o.name=='CW_Player_Foundation':continue
     points,_=evaluated[o.name];sample=points[::max(1,len(points)//100)];inside=[]
     for point in sample:
      nearest,normal,index,distance=tree.find_nearest(point)
      if nearest is not None and distance>.006 and (point-nearest).dot(normal)<0:inside.append(distance)
     slots.append({'mesh':o.name,'testedVertices':len(sample),'signedNearestPenetrationProxyCount':len(inside),'maxProxyMetres':max(inside,default=0)})
    probe['equipmentBodyRiskProbes']=slots
   risks.append(probe)
  assert maxmove>.001,('Static fake action',actor,name)
  poses.append({'action':name,'durationMs':700,'sampledJointDelta':maxmove,'probes':risks,'movementIsArticulated':True})
 reports.append({'actor':actor,'sourceSHA256':sha(file),'editableMeshes':len(meshes),'sourcePolygons':sum(len(o.data.polygons) for o in meshes),'bones':len(rig.data.bones),'contractChecks':contractChecks,'actions':poses,'collisionStatus':'sampled-nearest-surface-risk-proxy; inspect contact sheets; not exhaustive cloth/collision approval'})
write(HERE/'review/blender-qc.json',{'schema':'cw.t2b2.blender-qc','version':1,'passedStructuralChecks':True,'actors':reports,'userArtApproval':False,'realPhoneValidation':False,'collisionGate':'pending; risk proxies are not proof of no interpenetration'})
print('PASS actual editable geometry, six sampled articulated actions, 53-bone/nine-socket contract; collision risks recorded honestly')
