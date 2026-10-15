/* T1-C: observation only. No combat math, storage, audio, rendering or timers. */
(function(global){
"use strict";
if(global.CivilizationCombatEvents)return;
const VERSION=1,MAX_QUEUE=32,MAX_SUBSCRIBERS=16,MAX_SOURCE_EVENTS=256;
const WORLDS={main:[1,2,3],bounty:[1,2],arena:[1,2,3],mirror:[1,2,3],void:[1,2,3],calamity:[1,2],alternate:[1,2,3],special:[1,2],review:[1,2,3],"gm-benchmark":[1,2,3]};
const OWNERS={main:["combatcore.js","secondworldcombat.js","thirdworldcombat.js"],bounty:["dungeoncore.js"],arena:["dungeonarena.js","thirdworldarena.js"],mirror:["mirrordungeonrun.js"],void:["dungeonvoid.js"],calamity:["calamitycore.js","secondworldcalamityrun.js"],alternate:["alternateuniversecombat.js"],special:["specialcore.js"],review:["ui.js","secondworldcombat.js","thirdworldcombat.js","secondworldcalamityui.js"],"gm-benchmark":["gmpowerbenchmark.js","thirdworldcombat.js","gmalternateuniversebenchmark.js"]};
const SETTLERS={main:["combatcore.js","secondworldmainline.js","thirdworldprogress.js"],mirror:["mirrordungeonrun.js"],alternate:["alternateuniversecombat.js"]};
const TYPES=new Set(["battle-start","encounter","combat-action","snapshot","actor-defeated","outcome","settlement","presentation-ended","presentation-skipped","cancelled"]);
const RAW_TYPES=new Set(["attack","dodge","combo","counter","drain","mark","berserk","firstActor","battleEnd","combatSafety"]);
const NUMBERS=["damage","actualDamage","healed","shieldAbsorbed","remainingShield","shield","hp","maxHp","turns","actionCount","maxActions","maxActionsPerChain","chainActions","rate","layer"];
const FLAGS=["crit","revengeCrit","penetration","ignoreDefense","initiative","berserk","absorbed","indomitable"];
const TEXT=["source","mark","action","from","scope"];
const subscribers=new Map(),references=new WeakMap(),lanes={formal:null,"gm-fixture":null};
const realm=(()=>{try{return global.crypto?.randomUUID?.()||"document";}catch(_){return "document";}})();
let serial=0,background=global.document?.hidden===true;
const stats={sessions:0,rejected:0,consumerErrors:0,omitted:0};
const finite=n=>typeof n==="number"&&Number.isFinite(n)&&n>=0;
const text=value=>typeof value==="string"?value.slice(0,160):null;
const clone=value=>JSON.parse(JSON.stringify(value));
function freeze(value){if(value&&typeof value==="object"){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
const copy=value=>freeze(clone(value));
function reject(reason){stats.rejected++;return {ok:false,reason};}
function role(value){return value==="player"?"player":value==="enemy"||value==="mirror"?"enemy":null;}
function stateOf(playerHp,playerMaxHp,enemyHp,enemyMaxHp,playerShield=null,enemyShield=null){
 if(![playerHp,playerMaxHp,enemyHp,enemyMaxHp].every(finite)||playerMaxHp<=0||enemyMaxHp<=0||playerHp>playerMaxHp||enemyHp>enemyMaxHp)return null;
 if([playerShield,enemyShield].some(n=>n!==null&&!finite(n)))return null;
 return {player:{hp:playerHp,maxHp:playerMaxHp,shield:playerShield},enemy:{hp:enemyHp,maxHp:enemyMaxHp,shield:enemyShield}};
}
function validContext(context){return context&&typeof context==="object"&&WORLDS[context.mode]?.includes(context.world)&&OWNERS[context.mode]?.includes(context.owner);}
function lookup(reference){return reference&&typeof reference==="object"?(references.get(reference)||references.get(reference.events)||references.get(reference.combat)||references.get(reference.settlementBasis)):null;}
function associate(reference,basis){const session=lookup(basis);if(!session||!reference||typeof reference!=="object")return reject("unavailable-reference");references.set(reference,session);if(Array.isArray(reference.events))references.set(reference.events,session);if(reference.settlementBasis)references.set(reference.settlementBasis,session);return {ok:true,battleId:session.id};}
function current(session){return !!session&&lanes[session.lane]===session&&session.status!=="cancelled";}
function snapshotValue(session){return session?{schema:VERSION,battleId:session.id,sessionId:session.id,seq:session.seq,mode:session.context.mode,world:session.context.world,lane:session.lane,source:session.context.owner,appearance:session.appearance,actors:session.actors,status:session.status,computed:session.computed,presentation:session.presentation,pacing:session.pacing||null,result:session.result,settlement:session.settlement,history:{availability:"partial",sourceEventCount:session.sourceEventCount,omitted:session.omitted},background}: {schema:VERSION,status:"unavailable",reason:"no-authoritative-session"};}
function schedule(sub){
 if(!sub.active||sub.busy||sub.scheduled||!sub.queue.length)return;
 sub.scheduled=true;
 Promise.resolve().then(()=>{
  sub.scheduled=false;if(!sub.active||sub.busy)return;
  const event=sub.queue.shift();if(!event)return;
  if(event.battleId!==lanes[sub.lane]?.id||(!current(lanes[sub.lane])&&event.type!=="cancelled")){schedule(sub);return;}
  sub.busy=true;
  const dropped=sub.dropped;sub.dropped=0;
  // A frozen event and a fresh delivery token are the only consumer inputs.
  const delivery=Object.freeze({dropped,signal:sub.controller?.signal,isCurrent:()=>sub.active&&event.battleId===lanes[sub.lane]?.id&&current(lanes[sub.lane])});
  const done=()=>{sub.busy=false;schedule(sub);};
  try{Promise.resolve(sub.fn(copy(event),delivery)).then(done,error=>{stats.consumerErrors++;if(!sub.errorReported){sub.errorReported=true;console.warn("Combat event consumer rejected",String(error?.message||error));}done();});}
  catch(error){stats.consumerErrors++;if(!sub.errorReported){sub.errorReported=true;console.warn("Combat event consumer failed",String(error?.message||error));}done();}
 });
}
function enqueue(sub,event){
 if(!sub.active)return;
 if(sub.queue.length>=MAX_QUEUE){let index=sub.queue.findIndex(e=>e.skippable);if(index<0)index=0;sub.queue.splice(index,1);sub.dropped++;}
 sub.queue.push(event);schedule(sub);
}
function event(session,type,data={},options={}){
 if(!current(session))return reject("stale-session");
 const item=freeze({eventId:session.id+":"+(session.seq+1),checkpoint:false,schema:VERSION,sessionId:session.id,battleId:session.id,seq:++session.seq,type,lane:session.lane,mode:session.context.mode,world:session.context.world,actors:session.actors,source:options.source||session.context.owner,availability:"authoritative",phase:options.phase||"computed",actor:options.actor||null,target:options.target||null,sourceIndex:options.sourceIndex??null,skippable:options.skippable===true,expired:false,background,timing:{sourceOrder:options.sourceIndex??null,durationMs:null,pacing:session.pacing||null},data:clone(data)});
 for(const sub of subscribers.values())if(sub.lane===session.lane){
  if(background&&item.skippable){sub.dropped++;continue;}
  enqueue(sub,item);
 }
 return {ok:true,seq:item.seq,battleId:session.id};
}
function resetLane(lane){
 for(const sub of subscribers.values())if(sub.lane===lane){sub.queue.length=0;sub.controller?.abort();sub.controller=typeof AbortController==="function"?new AbortController():null;}
}
function normalizeRaw(raw){
 if(!raw||!RAW_TYPES.has(raw.type))return null;
 if(raw.type!=="battleEnd"&&!role(raw.actor||raw.owner))return null;
 if(raw.target!==undefined&&!role(raw.target))return null;
 const value={sourceType:raw.type,actor:role(raw.actor||raw.owner),target:role(raw.target),winner:role(raw.winner),loser:role(raw.loser)};
 for(const key of NUMBERS)if(raw[key]!==undefined){if(!finite(raw[key]))return null;value[key]=raw[key];}
 for(const key of FLAGS)if(raw[key]!==undefined){if(typeof raw[key]!=="boolean")return null;value[key]=raw[key];}
 for(const key of TEXT)if(raw[key]!==undefined)value[key]=text(raw[key]);
 return value;
}
function capture(result,context,mirror=false){
 if(lookup(result))return reject("duplicate-battle-result");
 if(!validContext(context))return reject("unavailable-owner-context");
 if(context.battleId!==undefined)return reject("externally-assigned-battle-id");
 if(!result||typeof result.win!=="boolean")return reject("unavailable-combat-result");
 const start=mirror?stateOf(result.maxHp,result.maxHp,result.maxHp,result.maxHp):stateOf(result.playerStartHp,result.playerMaxHp,result.enemyStartHp,result.enemyMaxHp);
 const final=mirror?stateOf(result.playerHp,result.maxHp,result.mirrorHp,result.maxHp,result.markState?.player?.shield??null,result.markState?.mirror?.shield??null):stateOf(result.hp,result.playerMaxHp,result.enemyHp,result.enemyMaxHp,result.actorState?.player?.shield??null,result.actorState?.enemy?.shield??null);
 if(!start||!final)return reject("nonfinite-or-invalid-combat-state");
 const lane=context.fixture===true?"gm-fixture":"formal";
 resetLane(lane);
 const previous=lanes[lane];if(previous)previous.status="superseded";
 const enemy=result.e||{},id=++serial;
 const session={id:"combat-v1-"+realm+"-"+id,lane,context:{mode:context.mode,world:context.world,owner:context.owner,variant:text(context.variant),location:text(context.location)},seq:0,status:"computed",computed:{start,final},presentation:null,presentationToken:null,result:{win:result.win,winner:mirror?role(result.winner):null,winnerAvailability:mirror?"authoritative":"unavailable",turns:finite(result.turns)?result.turns:null,actionBudgetReached:result.actionBudgetReached===true,settlementAvailability:"unavailable"},settlement:null,sourceEventCount:Array.isArray(result.events)?result.events.length:0,omitted:0,actors:{player:{role:"player",name:text(context.playerName),identityAvailability:text(context.playerName)?"name-only":"unavailable"},enemy:{role:"enemy",name:text(context.enemyName)||text(enemy.name),id:text(enemy.id)||text(enemy.bossId),kind:text(enemy.kind),location:text(context.location),identityAvailability:text(context.enemyName)||text(enemy.name)?"owner-name-and-context":"unavailable"}}};
 session.appearance=lane==="formal"?copy(global.Civilization3DAppearance?.equipmentSnapshot?.()||null):null;
 lanes[lane]=session;references.set(result,session);if(Array.isArray(result.events))references.set(result.events,session);stats.sessions++;
 event(session,"battle-start",{state:start,context:session.context,appearance:session.appearance});
 if(context.mode==="special")event(session,"encounter",{enemy:session.actors.enemy,detailsAvailability:"partial"});
 // Do not serialize a million-action benchmark or retain another full combat log.
 const count=session.sourceEventCount;
 if([...subscribers.values()].some(sub=>sub.lane===lane)&&!background){
  const limit=Math.min(count,MAX_SOURCE_EVENTS);
  for(let i=0;i<limit;i++){
   const raw=normalizeRaw(result.events[i]);
   if(!raw){session.omitted++;stats.omitted++;continue;}
   event(session,"combat-action",{...raw,stateAvailability:"unavailable",stateReason:"core-does-not-record-every-action-hp"},{actor:raw.actor,target:raw.target,sourceIndex:i,skippable:true});
  }
  session.omitted+=count-limit;stats.omitted+=count-limit;
 }else{session.omitted=count;stats.omitted+=count;}
 if(session.omitted)event(session,"snapshot",{kind:"computed-final",state:final,omitted:session.omitted,historyAvailability:"partial"});
 if(final.player.hp===0)event(session,"actor-defeated",{role:"player",basis:"authoritative-combat-end-hp",penaltyAvailability:"unavailable"});
 if(final.enemy.hp===0)event(session,"actor-defeated",{role:"enemy",basis:"authoritative-combat-end-hp"});
 event(session,"outcome",{...session.result,state:final});
 return {ok:true,battleId:session.id};
}
function bindPresentation(reference,snapshot){
 const session=lookup(reference);if(!current(session)||!Number.isSafeInteger(snapshot?.token)||snapshot.token<=0)return reject("unavailable-presentation-session");
 session.presentationToken=snapshot.token;return updatePresentation(snapshot,null);
}
function updatePresentation(snapshot,raw){
 const session=lanes.formal?.presentationToken===snapshot?.token?lanes.formal:lanes["gm-fixture"]?.presentationToken===snapshot?.token?lanes["gm-fixture"]:null;
 if(!current(session))return reject("stale-presentation");
 const next=stateOf(snapshot.playerHp,snapshot.playerMaxHp,snapshot.enemyHp,snapshot.enemyMaxHp,snapshot.playerShield,snapshot.enemyShield);
 if(!next)return reject("invalid-presentation-state");
 const before=session.presentation?.state||null;
 session.presentation={token:snapshot.token,index:snapshot.index,state:next};
 return event(session,"snapshot",{kind:"presentation",before,after:next,sourceType:text(raw?.type),historyAvailability:"snapshot-only"},{source:"combatfx.js",phase:"presentation",skippable:true,sourceIndex:snapshot.index});
}
function setPacing(token,pacing){
 const session=[lanes.formal,lanes["gm-fixture"]].find(s=>s?.presentationToken===token);
 if(!current(session)||!pacing)return reject("stale-pacing");
 if(![1,1.5,2].includes(pacing.combatSpeed))return reject("unsupported-pacing-speed");
 const keys=["openingDelay","impactDelay","stepDelay","endDelay","eventCount","combatSpeed"];
 if(!keys.every(k=>finite(pacing[k])))return reject("invalid-pacing");
 session.pacing=Object.fromEntries(keys.map(k=>[k,pacing[k]]));
 return {ok:true};
}
function presentationSkipped(reference,reason){
 const session=lookup(reference);if(!current(session))return reject("stale-session");
 resetLane(session.lane);
 return event(session,"presentation-skipped",{reason:text(reason),kind:"current-state",snapshot:snapshotValue(session),historyAvailability:"snapshot-only"},{phase:"lifecycle"});
}
function endPresentation(token,reason){
 const session=[lanes.formal,lanes["gm-fixture"]].find(s=>s?.presentationToken===token);
 if(!current(session))return reject("stale-presentation");
 session.presentationToken=null;
 resetLane(session.lane);
 return event(session,"presentation-ended",{reason:text(reason)},{source:"combatfx.js",phase:"presentation"});
}
function settlement(reference,source,summary){
 const session=lookup(reference);if(!current(session))return reject("stale-settlement");
 if(session.settlement)return reject("duplicate-settlement");
 if(!SETTLERS[session.context.mode]?.includes(source)||!summary||summary.committed!==true)return reject("unavailable-settlement-owner");
 const rewards={};for(const key of ["xp","gold","vipPoints","darkMatter","darkEnergy","dimensionalStrings","effectivePermanentDamage","depth","wins","losses"])if(summary[key]!==undefined){if(!finite(summary[key]))return reject("invalid-settlement-value");rewards[key]=summary[key];}
 const items=Array.isArray(summary.items)?summary.items.slice(0,8).map(row=>({name:text(row?.item?.name||row?.name),type:text(row?.item?.type||row?.type)})):null;
 session.settlement={source,rewards,items,itemsAvailability:items?"owner-projection":"unavailable",scope:text(summary.scope)||"battle"};session.result.settlementAvailability="authoritative";
 return event(session,"settlement",session.settlement,{source});
}
function cancel(lane="formal",reason="cancelled"){
 const session=lanes[lane];if(!session)return {ok:true,active:false};
 resetLane(lane);
 event(session,"cancelled",{reason:text(reason)},{phase:"lifecycle"});
 session.status="cancelled";return {ok:true};
}
function subscribe(fn,options={}){
 if(typeof fn!=="function")throw TypeError("Combat consumer must be a function");
 const existing=subscribers.get(fn);if(existing)return existing.dispose;
 if(subscribers.size>=MAX_SUBSCRIBERS)throw Error("Combat subscriber limit reached");
 const lane=options.lane==="gm-fixture"?"gm-fixture":"formal";
 const sub={fn,lane,queue:[],active:true,busy:false,scheduled:false,dropped:0,controller:typeof AbortController==="function"?new AbortController():null};
 const dispose=()=>{if(!sub.active)return;sub.active=false;sub.queue.length=0;sub.controller?.abort();options.signal?.removeEventListener("abort",dispose);subscribers.delete(fn);};
 sub.dispose=dispose;if(options.signal?.aborted)return dispose;
 subscribers.set(fn,sub);options.signal?.addEventListener("abort",dispose,{once:true});
 const session=lanes[lane];if(current(session))enqueue(sub,copy({eventId:null,checkpoint:true,actors:session.actors,actor:null,target:null,background,sourceIndex:null,timing:{sourceOrder:null,durationMs:null},schema:VERSION,battleId:session.id,sessionId:session.id,seq:session.seq,type:"snapshot",lane,mode:session.context.mode,world:session.context.world,source:"bridge-current-state",phase:"resubscribe",availability:"authoritative",skippable:false,expired:false,data:{kind:"current-state",snapshot:snapshotValue(session),historyAvailability:"snapshot-only"}}));
 return dispose;
}
function finiteProjection(value,depth=0){
 if(depth>16)return false;
 if(typeof value==="number")return finite(value);
 if(value===null||typeof value==="string"||typeof value==="boolean")return true;
 return !!value&&typeof value==="object"&&Object.values(value).every(item=>finiteProjection(item,depth+1));
}
function validateEvent(value){
 return !!value&&value.schema===VERSION&&typeof value.battleId==="string"&&value.battleId===value.sessionId&&Number.isSafeInteger(value.seq)&&value.seq>=0&&WORLDS[value.mode]?.includes(value.world)&&["formal","gm-fixture"].includes(value.lane)&&TYPES.has(value.type)&&typeof value.source==="string"&&typeof value.skippable==="boolean"&&value.expired===false&&typeof value.checkpoint==="boolean"&&value.availability==="authoritative"&&value.actors&&typeof value.data==="object"&&value.data!==null&&finiteProjection(value.data)&&finiteProjection(value.timing)&& (value.checkpoint?value.eventId===null:value.eventId===value.battleId+":"+value.seq);
}
// Producer hooks must remain optional and fail independently of formal owners.
const safe=fn=>(...args)=>{try{return fn(...args);}catch(error){stats.rejected++;console.warn("Combat event adapter failed",String(error?.message||error));return {ok:false,reason:"adapter-failed"};}};
global.CivilizationCombatEvents=Object.freeze({version:VERSION,limits:Object.freeze({queue:MAX_QUEUE,subscribers:MAX_SUBSCRIBERS,sourceEvents:MAX_SOURCE_EVENTS}),observeStandard:safe((result,context)=>capture(result,context)),observeMirror:safe((result,context)=>capture(result,context,true)),associate:safe(associate),bindPresentation:safe(bindPresentation),presentationSkipped:safe(presentationSkipped),setPacing:safe(setPacing),updatePresentation:safe(updatePresentation),endPresentation:safe(endPresentation),settlement:safe(settlement),cancel:safe(cancel),subscribe,snapshot:(lane="formal")=>copy(snapshotValue(lanes[lane])),isCurrent:event=>!!event&&current(lanes[event.lane])&&event.battleId===lanes[event.lane].id,diagnostics:()=>Object.freeze({...stats,subscribers:subscribers.size,queued:[...subscribers.values()].reduce((n,s)=>n+s.queue.length,0),inFlight:[...subscribers.values()].filter(s=>s.busy).length}),validateEvent,projectAction:raw=>{const value=normalizeRaw(raw);return value?copy(value):null;},capabilities:()=>copy({schema:VERSION,rawEventTypes:[...RAW_TYPES],unavailable:["attack-preparation","block","per-action-core-hp-history","unhooked-reward-transactions"],audio:"existing-owner-only-no-replay"})});
global.document?.addEventListener?.("visibilitychange",()=>{background=global.document.hidden===true;for(const sub of subscribers.values()){sub.dropped+=sub.queue.length;sub.queue.length=0;}for(const session of Object.values(lanes))if(current(session))event(session,"snapshot",{kind:"visibility-current-state",snapshot:snapshotValue(session),historyAvailability:"snapshot-only"},{phase:"lifecycle"});});
global.addEventListener?.("civilization-auth-signed-out",()=>cancel("formal","signed-out"));
global.addEventListener?.("pagehide",event=>{if(event?.persisted===true)return;cancel("formal","pagehide");cancel("gm-fixture","pagehide");for(const sub of [...subscribers.values()])sub.dispose();});
})(window);
