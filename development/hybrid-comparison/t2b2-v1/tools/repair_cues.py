"""Render color variants of the existing original VFX source, not new skills."""
import bpy,sys,pathlib
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from art import *
dest=HERE/'repair-r1/cues';dest.mkdir(parents=True,exist_ok=True)
source=HERE/'shared/vfx-source.blend';bpy.ops.wm.open_mainfile(filepath=str(source));bpy.context.preferences.filepaths.save_version=0
materials=[m for m in bpy.data.materials if m.use_nodes]
variants={'crit':(.95,.62,.12),'counter':(.20,.58,.95),'drain':(.18,.85,.36)}
for name,color in variants.items():
    for m in materials:
        node=m.node_tree.nodes['Principled BSDF'];node.inputs['Base Color'].default_value=(*color,1)
        node.inputs['Emission Color'].default_value=(*color,1)
    for frame in range(1,9):
        bpy.context.scene.frame_set(frame);bpy.context.scene.render.filepath=str(dest/f'{name}-{frame-1:02}.png');bpy.context.scene.cycles.samples=32;bpy.ops.render.render(write_still=True)
    # Each editable source retains original shard keyframes, camera and lighting.
    bpy.ops.wm.save_as_mainfile(filepath=str(dest/f'{name}-source.blend'),compress=True)
write(dest/'mapping.json',{'schema':'cw.t2b2.event-visual-mapping','version':1,'status':'candidate-assets-not-B3-integrated','eventAuthority':'combat-events.js normalizeRaw; no new source types, damage, HP or audio','durationMs':700,'impactAtMs':300,'cancel':'B1 signal/isCurrent; no additional timer or emission after cancel','budget':{'maxSprites':1,'maxOpacity':.65,'sameForABC':True},'mappings':{
 'attack':{'when':'combat-action data.sourceType=attack','actorClip':'attack','targetClip':'hit','targetCondition':'known successful hit','cue':'shared/impact-00..07.png'},
 'crit':{'when':'same attack with data.crit=true or revengeCrit=true','actorClip':'attack','targetClip':'hit','cue':'repair-r1/cues/crit-00..07.png','text':'暴擊'},
 'combo':{'when':'combat-action data.sourceType=combo','actorClip':'attack','composition':'once for each source event; never invent additional hits','targetClip':'hit','cue':'shared/impact-00..07.png','text':'連擊','eventOrder':'original seq; no artificial event or damage'},
 'counter':{'when':'combat-action data.sourceType=counter','actorClip':'attack','actorPolicy':'source actor, opposite role preserved','targetClip':'hit','cue':'repair-r1/cues/counter-00..07.png','text':'反擊'},
 'drain':{'when':'combat-action data.sourceType=drain','actorClip':'idle','posePolicy':'retain current pose rather than duplicate attack','targetClip':'idle','cue':'repair-r1/cues/drain-00..07.png at source actor','text':'吸血','hp':'only authoritative checkpoint; do not infer healing or create hit'},
 'dodge':{'when':'combat-action data.sourceType=dodge','actorClip':'dodge','actorPolicy':'source actor','targetClip':'idle','text':'閃避'},
 'defeat':{'when':'actor-defeated authoritative event, not action-budget truncation','actorClip':'defeat'},
 'unknown':{'actorClip':'idle','status':'unavailable','text':'視覺素材未提供'}},'independentActionRequired':False,'reason':'existing articulated actions plus source-event-specific silent cues suffice; not claiming four extra clips','sourceSHA':sha(source),'artApproved':False})

# Source flags modify the known base cue within the same one-sprite budget.
mapping=json.loads((dest/'mapping.json').read_text());mapping['flagComposition']={'critOrRevengeCrit':{'eligibleSourceTypes':['attack','combo','counter'],'clip':'preserve base action','cue':'replace base impact with crit color, never add a second sprite','text':'retain base label plus 暴擊','maxSprites':1},'drain':'requires its own source event; never infer healing from an attack flag'};write(dest/'mapping.json',mapping)
write(HERE/'repair-r1/g006-fallback.json',{'schema':'cw.t2b2.unavailable-equipment','version':1,'formalSet':'G006','formalName':'極寒封閉盔','availability':'unavailable','licensedAssetAudit':'asset-registry and source-lock contain only G007 helmet in three LODs; no compatible authorized G006 source/model supplied','strategy':'text-degradation','visibleText':'G006 極寒封閉盔：素材 unavailable，顯示原始裸頭（非裝備外觀）','selectedHelmetLayer':None,'doNotSubstitute':'G007 or any other formal helmet','sameABC':True,'emptySlotDistinct':'empty: no message; unavailable equipped item: mandatory labeled degradation','safety':'fallback never changes formal equipment identity/stats/53 bones/9 sockets','artApproved':False})
print('PASS real editable-source cue variants and explicitly unavailable G006 text fallback')
