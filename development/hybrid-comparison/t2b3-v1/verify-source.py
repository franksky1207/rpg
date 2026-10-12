"""Read-only actual Blender verification; never rewrites B2 poses or evidence."""
import bpy,pathlib,json,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[3];ART=ROOT/'development/hybrid-comparison/t2b2-v1';rows=[]
for actor in ['player','normal','elite','boss']:
 source=ART/('player/animation-source.blend' if actor=='player' else f'enemies/{actor}/source.blend');before=hashlib.sha256(source.read_bytes()).hexdigest();bpy.ops.wm.open_mainfile(filepath=str(source));rig=next(o for o in bpy.data.objects if o.type=='ARMATURE');assert len(rig.data.bones)==({'player':53,'normal':12,'elite':12,'boss':15}[actor]);actions=[]
 if actor=='player':
  contract=json.loads((ROOT/'development/3d-source/equipment/ancient-ruins-v1/rig-contract.json').read_text());assert len(contract['sockets'])==9
  for b in contract['bones']:
   current=rig.data.bones[b['name']];assert (current.parent.name if current.parent else None)==b['parent'];assert max(abs(current.matrix_local[i][j]-b['matrix'][i][j]) for i in range(4) for j in range(4))<1e-6
  for name,v in contract['sockets'].items():
   socket=bpy.data.objects[name];assert socket.parent_bone==v['bone'];assert max(abs(socket.matrix_local[i][j]-v['local'][i][j]) for i in range(4) for j in range(4))<1e-6
 for clip in ['idle','attack','hit','dodge','return','defeat']:
  action=bpy.data.actions.get('B2_'+clip);assert action is not None,(actor,clip);assert len(action.fcurves)>10;assert tuple(action.frame_range)==(1.0,22.0);rig.animation_data.action=action;samples=[]
  for f in [1,10,22]:bpy.context.scene.frame_set(f);samples.append([tuple(b.matrix.translation) for b in rig.pose.bones])
  assert samples[0]!=samples[1] or samples[1]!=samples[2],(actor,clip,'static');actions.append(clip)
 assert hashlib.sha256(source.read_bytes()).hexdigest()==before;rows.append({'actor':actor,'bones':len(rig.data.bones),'clips':actions,'sourceSHA256':before})
print('PASS read-only actual Blender four source rigs / 24 articulated clips / exact frame 1..22:',json.dumps(rows))
