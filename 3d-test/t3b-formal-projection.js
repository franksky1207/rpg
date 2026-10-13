/* T3-B formal B-view projection: pre-release isolated adapter, no fixture, DOM, IO or writes. */
(function(global){
"use strict";
if(global.CivilizationFormalBProjection)return;
const VERSION=1;
const MODES=Object.freeze({main:[1,2,3],bounty:[1,2],arena:[1,2,3],mirror:[1,2,3],void:[1,2,3],calamity:[1,2],alternate:[1,2,3],special:[1,2],review:[1,2,3]});
const EVENTS=new Set(["battle-start","encounter","combat-action","snapshot","actor-defeated","outcome","settlement","presentation-ended","presentation-skipped","cancelled"]);
const clone=x=>JSON.parse(JSON.stringify(x));
const frozen=x=>{if(x&&typeof x==="object"){Object.values(x).forEach(frozen);Object.freeze(x);}return x;};
const availableHp=x=>!!x&&typeof x==="object"&&Number.isFinite(x.hp)&&Number.isFinite(x.maxHp)&&x.maxHp>0&&x.hp>=0&&x.hp<=x.maxHp&&(x.shield===null||x.shield===undefined||Number.isFinite(x.shield)&&x.shield>=0);
function convert(e){
 if(!e||e.schema!==1||e.lane!=="formal"||!MODES[e.mode]?.includes(e.world)||!EVENTS.has(e.type)||
 e.availability!=="authoritative"||e.expired!==false||typeof e.battleId!=="string"||e.battleId!==e.sessionId||
 !Number.isSafeInteger(e.seq)||e.seq<0)return null;
 const actors=e.actors;
 if(!actors||typeof actors!=="object")return null;
 const raw=e.data&&typeof e.data==="object"?e.data:{};
 // Per-action HP history is intentionally unknown unless supplied by the authoritative owner.
 const observed=raw.state||raw.after||raw.snapshot?.presentation?.state;
 const state=observed&&availableHp(observed.player)&&availableHp(observed.enemy)?clone(observed):null;
 const checkpoint=raw.snapshot&&typeof raw.snapshot==="object"&&availableHp(raw.snapshot.computed?.final?.player)&&availableHp(raw.snapshot.computed?.final?.enemy)
  ?clone(raw.snapshot.computed.final):null;
 const sourceEvent=e.type==="combat-action"?{
   kind:typeof raw.sourceType==="string"?raw.sourceType:"unknown",
   actor:e.actor==="player"?"player":e.actor==="enemy"?"enemy":null,
   target:e.target==="player"?"player":e.target==="enemy"?"enemy":null,
   damage:Number.isFinite(raw.damage)&&raw.damage>=0?raw.damage:null,
   actualDamage:Number.isFinite(raw.actualDamage)&&raw.actualDamage>=0?raw.actualDamage:null,
   healed:Number.isFinite(raw.healed)&&raw.healed>=0?raw.healed:null,
   crit:typeof raw.crit==="boolean"?raw.crit:null,
   hpAfterAction:null
 }:null;
 const projection={schema:VERSION,nonAuthoritative:true,battleId:e.battleId,seq:e.seq,
  mode:e.mode,world:e.world,type:e.type,phase:e.phase==="presentation"?"presentation":"computed",sourceIndex:Number.isSafeInteger(e.sourceIndex)?e.sourceIndex:null,checkpoint:e.checkpoint===true,
  actorNames:{player:typeof actors.player?.name==="string"?actors.player.name:null,enemy:typeof actors.enemy?.name==="string"?actors.enemy.name:null},
  enemyIdentity:{id:typeof actors.enemy?.id==="string"?actors.enemy.id:null,kind:typeof actors.enemy?.kind==="string"?actors.enemy.kind:null,location:typeof actors.enemy?.location==="string"?actors.enemy.location:null},
  authoritativeState:state||checkpoint,perActionHpAvailable:false,sourceEvent,
  background:e.background===true,skippable:e.skippable===true,settlementAvailable:e.type==="settlement",
  assetStatus:"unmapped",assetIdentityAvailability:"unavailable",canCommit:false,canEmitCombatEvents:false};
 return frozen(projection);
}
global.CivilizationFormalBProjection=Object.freeze({version:VERSION,modes:MODES,convert,
 capabilities:Object.freeze({source:"formal-combat-events-only",rendererReleased:false,fixtureAllowed:false,assetManifestReady:false})});
})(window);
