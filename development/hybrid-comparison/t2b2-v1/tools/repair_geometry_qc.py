"""Every authored frame, evaluated Blender geometry; no relaxed old QC gates.
Three independent parity rays supplement signed-nearest and triangle overlaps.
Counts include intentional protected rest contacts, not a no-collision claim.
"""
import bpy, pathlib, sys, argparse, math
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
from mathutils.bvhtree import BVHTree
p=argparse.ArgumentParser();p.add_argument('--source',default=str(HERE/'player/animation-source.blend'));p.add_argument('--output',required=True)
args=p.parse_args(sys.argv[sys.argv.index('--')+1:])
bpy.ops.wm.open_mainfile(filepath=args.source);rig=bpy.data.objects['CW_Humanoid_Rig_v1'];rig.data.pose_position='POSE'
meshes=[o for o in bpy.data.objects if o.type=='MESH']
directions=[Vector(x).normalized() for x in [(1,.371,.213),(.237,1,.419),(.319,.271,1)]]
def parity(tree,point,direction):
    origin=point.copy();hits=0
    for i in range(128):
        position,normal,index,distance=tree.ray_cast(origin,direction,8)
        if position is None:return hits%2==1
        hits+=1;origin=position+direction*1e-5
    raise RuntimeError('Ray traversal did not terminate')
rows=[]
for action in ACTIONS:
    rig.animation_data.action=bpy.data.actions['B2_'+action]
    for frame in range(1,23):
        bpy.context.scene.frame_set(frame);bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get();evaluated={}
        for o in meshes:
            e=o.evaluated_get(dg);m=e.to_mesh();points=[o.matrix_world@v.co for v in m.vertices];polygons=[list(p.vertices) for p in m.polygons];e.to_mesh_clear()
            assert all(math.isfinite(c) for v in points for c in v)
            evaluated[o.name]=(points,polygons,BVHTree.FromPolygons(points,polygons))
        body=evaluated['CW_Player_Foundation'][2];slots=[]
        for o in meshes:
            if o.name=='CW_Player_Foundation':continue
            points,polygons,tree=evaluated[o.name];inside=[];nearestRisk=[];disagreement=0
            # All equipment vertices, not the previous ~100-vertex stride.
            for point in points:
                near,normal,index,distance=body.find_nearest(point)
                if distance<=.006:continue
                votes=[parity(body,point,d) for d in directions]
                if len(set(votes))>1:disagreement+=1
                if all(votes):inside.append(distance)
                if (point-near).dot(normal)<0:nearestRisk.append(distance)
            slots.append({'mesh':o.name,'vertices':len(points),'surfaceTrianglePairs':len(body.overlap(tree)),
                'threeRayInsideCountOver6mm':len(inside),'maxThreeRayInsideMetres':max(inside,default=0),
                'rayDisagreementCount':disagreement,'signedNearestMaxMetres':max(nearestRisk,default=0),
                'minimumZMetres':min(v.z for v in points)})
        ankles={side:{'headMetres':list(rig.pose.bones['foot.'+side].head),'restHeadMetres':list(rig.data.bones['foot.'+side].head_local),
            'headDisplacementMetres':(rig.pose.bones['foot.'+side].head-rig.data.bones['foot.'+side].head_local).length} for side in ['L','R']}
        rows.append({'action':action,'frame':frame,'slots':slots,'ankles':ankles,'bodyMinimumZMetres':min(v.z for v in evaluated['CW_Player_Foundation'][0]),'socketToHandMetres':(bpy.data.objects['socket.weapon.R'].matrix_world.translation-(rig.matrix_world@rig.pose.bones['hand.R'].tail)).length})
    print('INSPECTED',action,22,'evaluated frames',flush=True)
write(pathlib.Path(args.output),{'schema':'cw.t2b2.repair-geometry','version':1,'sourceSHA':sha(args.source),'frames':rows,
    'method':'all equipment vertices, three oblique parity rays; evaluated BVH triangle surface pairs; >6mm separates contacts only, unchanged nearest probe retained',
    'limitations':'body may have overlapping components; disagreement recorded, parity not exact volume Boolean; all protected rest contacts remain reported; manual silhouettes/occlusion still required',
    'artApproved':False,'collisionGate':'pending-review-not-auto-approved'})
print('PASS full-frame finite geometry inspection (not collision/art approval)')
