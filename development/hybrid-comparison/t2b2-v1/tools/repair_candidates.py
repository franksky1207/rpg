"""B2 repair r1, baked joint poses only; immutable player meshes/rest rig/sockets.
Run once against eff0a6be candidates. Git baseline + revision manifest are the
version mechanism; refuse repeat application rather than destroying hand edits.
"""
import bpy, pathlib, sys, math, subprocess
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from art import *
from mathutils import Matrix, Vector

baseline = 'eff0a6becf4f9dbf3d90c33df157aef13a98f355'
revision = HERE/'repair-r1/revision.json'
if revision.exists():
    raise RuntimeError('r1 already authored; use saved-source reexport, not rebuild')
paths = [HERE/'player/animation-source.blend'] + [HERE/'enemies'/a/'source.blend' for a in ['normal','elite','boss']]
lockedInventory=subprocess.check_output(['git','show',baseline+':development/hybrid-comparison/t2b2-v1/inventory.json'],cwd=str(ROOT))
before = {row['path']: {'sha256':row['sha256'],'bytes':row['bytes']} for row in json.loads(lockedInventory)['files']}
before['inventory.json']={'sha256':hashlib.sha256(lockedInventory).hexdigest(),'bytes':len(lockedInventory)}
for path in (paths[:1] if '--player-only' in sys.argv else paths):
    assert sha(path)==before[str(path.relative_to(HERE))]['sha256'],'Author only from locked baseline, never reapply to a hand-edited source'

# Feet are solved on the actual unchanged two-bone rest chain. Each articulated
# pose is baked, with no IK target, helper bone, constraint or socket edit in GLB.
def plant(rig, side, target):
    thigh, shin, foot = [rig.pose.bones[n+'.'+side] for n in ['thigh','shin','foot']]
    hip = thigh.head.copy(); delta=target-hip; distance=delta.length
    a=thigh.bone.length; b=shin.bone.length
    assert abs(a-b)+1e-5 < distance < a+b, ('Unreachable planted foot',side,distance)
    direction=delta.normalized(); pole=Vector((0,-1,0)); pole=(pole-direction*pole.dot(direction)).normalized()
    along=(a*a-b*b+distance*distance)/(2*distance)
    knee=hip+direction*along+pole*math.sqrt(max(0,a*a-along*along))
    for bone,start,end in [(thigh,hip,knee),(shin,knee,target)]:
        rest=bone.bone.matrix_local.to_3x3()
        rotation=(rest@Vector((0,1,0))).rotation_difference((end-start).normalized()).to_matrix()@rest
        desired=rotation.to_4x4();desired.translation=start;bone.matrix=desired
        bpy.context.view_layer.update()
    desired=foot.bone.matrix_local.copy();desired.translation=target;foot.matrix=desired
    bpy.context.view_layer.update()

player=paths[0];bpy.ops.wm.open_mainfile(filepath=str(player));bpy.context.preferences.filepaths.save_version=0
rig=bpy.data.objects['CW_Humanoid_Rig_v1'];rig.data.pose_position='POSE'
# Remove the old candidate actions first. Blender otherwise suffixes new names
# with .001, leaving reexport/render/QC selecting the untouched old B2 clips.
rig.animation_data_clear()
for act in list(bpy.data.actions):
    if act.name.startswith('B2_'):bpy.data.actions.remove(act,do_unlink=True)
poses={
 'idle':[(1,{}),(11,{'spine_01':(.7,0,0),'head':(-.7,0,0)}),(22,{})],
 'attack':[(1,{}),(5,{'spine_01':(-4,0,-6),'chest':(-3,0,-6),'upper_arm.R':(-26,8,-8),'forearm.R':(-58,0,0),'upper_arm.L':(-12,0,0),'forearm.L':(-12,0,0)}),(10,{'spine_01':(5,0,6),'chest':(6,0,7),'upper_arm.R':(32,0,6),'forearm.R':(-42,0,0),'upper_arm.L':(-16,0,0),'forearm.L':(-18,0,0)}),(15,{'chest':(4,0,5),'upper_arm.R':(20,0,0),'forearm.R':(-18,0,0)}),(22,{})],
 'hit':[(1,{}),(6,{'spine_01':(-7,0,4),'chest':(-7,0,4),'head':(7,0,-4),'upper_arm.L':(-18,0,7),'forearm.L':(-18,0,0),'upper_arm.R':(-12,0,-5),'forearm.R':(-12,0,0)}),(13,{'spine_01':(3,0,-2),'chest':(3,0,-2),'head':(-3,0,0)}),(22,{})],
 'dodge':[(1,{}),(7,{'pelvis':(4,0,-8),'spine_01':(5,0,-8),'chest':(7,0,-10),'head':(-5,0,6),'upper_arm.R':(-22,0,8),'forearm.R':(-30,0,0),'upper_arm.L':(-14,0,-5),'forearm.L':(-20,0,0)}),(15,{'chest':(3,0,-5),'forearm.R':(-12,0,0)}),(22,{})],
 'return':[(1,{'spine_01':(5,0,6),'chest':(6,0,7),'upper_arm.R':(32,0,6),'forearm.R':(-42,0,0),'upper_arm.L':(-16,0,0),'forearm.L':(-18,0,0)}),(8,{'chest':(-3,0,-3),'upper_arm.R':(22,0,-3),'forearm.R':(-20,0,0)}),(15,{'upper_arm.R':(6,0,0),'forearm.R':(-7,0,0)}),(22,{})],
 'defeat':[(1,{}),(7,{'spine_01':(-4,0,3),'chest':(-5,0,3),'upper_arm.R':(-16,0,-7),'forearm.R':(-12,0,0)}),(14,{'pelvis':(8,0,0),'spine_01':(10,0,-4),'chest':(12,0,-5),'head':(16,0,0),'upper_arm.R':(5,0,-8),'forearm.R':(-22,0,0)}),(22,{'pelvis':(10,0,0),'spine_01':(14,0,-4),'chest':(18,0,-6),'head':(20,0,0),'upper_arm.L':(6,0,7),'forearm.L':(-25,0,0),'upper_arm.R':(10,0,-10),'forearm.R':(-28,0,0)})]
}
for name in ACTIONS:
    act=animation(rig,name,poses[name])
    # A curled grasp follows the unchanged right-hand socket through every clip.
    for bone in rig.pose.bones:
        if bone.name.endswith('.R') and any(bone.name.startswith(f+'_') for f in ['index','middle','ring','little','thumb']):
            for frame in [1,5,10,15,22]:
                bone.rotation_euler.x=math.radians(28 if bone.name.startswith('thumb') else 42)
                bone.keyframe_insert('rotation_euler',frame=frame)
    # Root is lowered to load the knees, then each ankle receives an exact
    # analytic solve. Two soles remain level; dodge changes leg load, not timing.
    snapshots=[]
    for frame in range(1,23):
        bpy.context.scene.frame_set(frame);bpy.context.view_layer.update()
        t=(frame-1)/21; pulse=math.sin(math.pi*t)**2
        load=.026*math.sin(math.pi*9/21)**2*(1-t)**2 if name=='return' else {'idle':.002,'attack':.026,'hit':.026,'dodge':.04}.get(name,0)*pulse
        lower=.009 + (load if name!='defeat' else .045*(t*t*(3-2*t)))
        root=rig.pose.bones['root'];root.location=(0,-lower,0);bpy.context.view_layer.update()
        for side in ['L','R']:
            target=rig.data.bones['foot.'+side].head_local.copy()+Vector((0,0,.003))
            plant(rig,side,target)
        snapshots.append({b.name:(b.location.copy(),b.rotation_euler.copy()) for b in rig.pose.bones if b.name=='root' or b.name.startswith(('thigh.','shin.','foot.'))})
    for frame,snapshot in enumerate(snapshots,1):
        for n,(loc,rot) in snapshot.items():
            b=rig.pose.bones[n];b.location=loc;b.rotation_euler=rot
            b.keyframe_insert('location',frame=frame);b.keyframe_insert('rotation_euler',frame=frame)
    for curve in act.fcurves:
        if any(curve.data_path.startswith('pose.bones["'+n) for n in ['root','thigh.','shin.','foot.']):
            for key in curve.keyframe_points:key.interpolation='LINEAR'
rig.animation_data.action=bpy.data.actions['B2_idle'];bpy.context.scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(player),compress=True)

# Same 700ms clips and frame-10 impact; distinguish response inertia, never
# change battle events. Preserve enemy topology/cameras, enlarge Boss vessel
# within its existing crown/outrigger envelope instead of scaling the stage.
for actor,path in ([] if '--player-only' in sys.argv else zip(['normal','elite','boss'],paths[1:])):
    bpy.ops.wm.open_mainfile(filepath=str(path));bpy.context.preferences.filepaths.save_version=0
    rig=next(o for o in bpy.data.objects if o.type=='ARMATURE')
    for action in ACTIONS:
        act=bpy.data.actions['B2_'+action];rig.animation_data.action=act
        for curve in act.fcurves:
            if curve.data_path.endswith('rotation_euler'):
                for key in curve.keyframe_points:
                    # Keep ordinary guardian nimble, elite braced and core heavy.
                    factor=.85 if actor=='elite' else .68 if actor=='boss' else .95
                    key.co.y*=factor;key.handle_left.y*=factor;key.handle_right.y*=factor
    if actor=='boss':
        for o in bpy.data.objects:
            if o.type=='MESH' and o.name.startswith(('Core_Pressure_Vessel','Segmented_Field_Band','Reactor_Exposed_Lens')):
                for v in o.data.vertices:v.co.x*=1.13;v.co.y*=1.13
        # Deliberate anticipation hold, same impact sample and duration.
        act=bpy.data.actions['B2_attack']
        for curve in act.fcurves:
            if curve.data_path.endswith('rotation_euler'):
                anticipation=curve.evaluate(5)
                curve.keyframe_points.insert(7,anticipation)
                curve.update()
    rig.animation_data.action=bpy.data.actions['B2_idle'];bpy.context.scene.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath=str(path),compress=True)
write(revision,{'schema':'cw.t2b2.repair-revision','version':1,'baselineCommit':baseline,'before':before,'rollback':'git restore --source='+baseline+' -- development/hybrid-comparison/t2b2-v1; remove only added r1 files, or revert repair commits','protected':'player topology/weights/rest 53 bones/9 socket locals and formal G007 15 GLBs unchanged','afterSources':{str(p.relative_to(HERE)):sha(p) for p in paths},'artApproval':False})
print('PASS authored r1 joint poses and enemy visual inertia; no formal source edited')
