/* T2-B1 offline input only. Read JSON/source text; never execute formal owners. */
export const FIXTURE_SHA='7b551e35c24ac6e9ec676d9d9534f6bd30ebcde026ac945826d979e9a15b1820';
export const CONTROLS_SHA='0a5f25b26f3e9500125fe406a358c53da6d722680c03ac33ffd85dc9d4dd6e27';
export const SOURCE_PATHS=Object.freeze(['data.js','worldmaps-earth.js','engine.js','balance.js','alternateuniversedata.js','traits.js','combatmath.js','combatcore.js','combat-events.js','3d-test/appearance-snapshot.js','3d-test/formal-snapshots.js','assets/3d/asset-registry.json','development/3d-source/equipment/ancient-ruins-v1/rig-contract.json']);
export const CASE_IDS=Object.freeze(['normal-baseline','elite-baseline','boss-baseline','boss-player-defeat','elite-effects-owner-input']);
export const PHASE5_SOURCES_SHA='b291647208228606d62c3cf53651647719eeee13a4682a1e7c6aaf0f13215d07';
const verified=new WeakSet(),inputs=new WeakSet();
export const isVerifiedInput=value=>inputs.has(value);
const requireValue=(ok,message)=>{if(!ok)throw Error(message);};
export const clone=value=>JSON.parse(JSON.stringify(value));
export function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
export const copyFrozen=value=>freeze(clone(value));
export async function sha(value){if(!globalThis.crypto?.subtle)throw Error('SHA-256 驗證需要 HTTPS 或 localhost 開發環境');const bytes=new TextEncoder().encode(typeof value==='string'?value:JSON.stringify(value));return [...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');}
const aborted=signal=>signal?.throwIfAborted();
function numbers(value){if(typeof value==='number')return Number.isFinite(value)&&value>=0;if(value===null||typeof value==='string'||typeof value==='boolean')return true;return !!value&&typeof value==='object'&&Object.values(value).every(numbers);}
function hp(value){return value&&Number.isFinite(value.hp)&&Number.isFinite(value.maxHp)&&value.hp>=0&&value.maxHp>0&&value.hp<=value.maxHp&&(value.shield===null||Number.isFinite(value.shield)&&value.shield>=0);}
function checkEvent(e,last,battle){
 requireValue(e.schema===1&&e.lane==='gm-fixture'&&e.mode==='main'&&e.world===1&&e.source==='combatcore.js','Invalid Bridge owner/lane/schema');
 requireValue(e.seq===last+1&&e.battleId===battle&&e.sessionId===battle&&e.eventId===battle+':'+e.seq,'Invalid source session/order');
 requireValue(['battle-start','combat-action','snapshot','actor-defeated','outcome'].includes(e.type)&&e.expired===false&&!e.checkpoint&&e.availability==='authoritative','Invalid source event type/availability');
 requireValue(numbers(e.data)&&numbers(e.timing),'Invalid nonfinite source projection');
}
export async function validateData(bundle,controls,{readSource,signal}={}){
 aborted(signal);
 requireValue(bundle.schema==='cw.t2a.owner-fixtures'&&bundle.version===1&&bundle.scope==='development-only-not-live-state','Unsupported Fixture schema');
 const unsigned=clone(bundle);delete unsigned.sha256;
 requireValue(bundle.sha256===FIXTURE_SHA&&await sha(unsigned)===FIXTURE_SHA,'Fixture SHA mismatch; do not regenerate silently');
 requireValue(controls.schema==='cw.t2a.comparison-controls'&&controls.version===1&&await sha(controls)===CONTROLS_SHA,'Controls SHA mismatch');
 requireValue(typeof readSource==='function'&&JSON.stringify(Object.keys(bundle.sources))===JSON.stringify(SOURCE_PATHS),'Missing authority source reader/manifest');
 let currentRegistry=null;
 const sourceTexts=await Promise.all(SOURCE_PATHS.map(async file=>{aborted(signal);const text=await readSource(file,signal);aborted(signal);const digest=await sha(text);
  if(['combat-events.js','3d-test/appearance-snapshot.js'].includes(file)&&digest!==bundle.sources[file]){
   const proofText=await readSource('3d-test/fixture-owner-history.json',signal);
   requireValue(await sha(proofText)===PHASE5_SOURCES_SHA,'Phase5 owner history changed');const proof=JSON.parse(proofText),row=proof.sources[file];
   requireValue(proof.schema==='cw.phase5.immutable-fixture-owners.v1'&&proof.baselineHEAD==='fbe46d9004eb38afbac55b8de03f832237ca56df'&&row.beforeSHA256===bundle.sources[file]&&row.afterSHA256===digest&&await sha(row.source)===bundle.sources[file],'Source SHA changed: '+file);
   return [file,row.source];
  }
  if(file==='combatcore.js'&&digest==='dd5344db15e9b01ea480935efc90c278168d595a64f63aedb4c3020caf38bfdc'){
   // Batch20 adds only an encounter sink. Preserve the immutable GM fixture's
   // captured source: verify the exact live bytes AND the exact inverse edit.
   const hook="  if(options.visualContext&&!options.useTestSpecializations&&!options.useTestMarks)window.recordMonsterCodexEncounter?.(options.visualContext,enemy);\n";
   requireValue(text.split(hook).length===2&&await sha(text.replace(hook,''))==='3b1e33726b50ae2c70f12eaf914ae501f20d648b03a7dc1d48c9fea6619380c6','Batch20 encounter-only source registration mismatch');
   return [file,text.replace(hook,'')];
  }
  if(file==='combatcore.js'&&digest!==bundle.sources[file]){
   // Batch19-4 changes only the settlement wrapper, not the captured kernel.
   // Keep the immutable fixture, and accept exactly this parity-tested live owner.
   requireValue(bundle.sources[file]==='f26e8b556618cab2cf3fa65c833b3020b181e6cb60fb5b7d4ea658336689debe'&&digest==='3b1e33726b50ae2c70f12eaf914ae501f20d648b03a7dc1d48c9fea6619380c6','Source SHA changed: '+file);
   return [file,text];
  }
  if(file==='assets/3d/asset-registry.json'&&digest!==bundle.sources[file]){
   // The fixture is SHA-locked to its original captured owner data. The current
   // renderer must use the *current* SHA-verified GM B registry instead of
   // loading retired Blender/refinement history and old registry snapshots.
   const record=JSON.parse(await readSource('development/hybrid-comparison/t2b3-v1/manifest.json',signal));
   const live=JSON.parse(text);
   requireValue(record.schema==='cw.t2b3.assets'&&record.publish===false&&
     JSON.stringify(record.registry)===JSON.stringify(live),'Current B registry disagrees with approved B3 manifest');
   currentRegistry=live;return[file,text];
  }
  requireValue(digest===bundle.sources[file],'Source SHA changed: '+file);return [file,text];}));
 aborted(signal);
 const registry=JSON.parse(sourceTexts.find(([p])=>p==='assets/3d/asset-registry.json')[1]);
 const identities=[['遺址守衛機','normal',31,0],['遠古戰爭機甲','elite',34,3],['遺址中樞核心','boss',35,4]];
 requireValue(bundle.representatives.length===3&&bundle.cases.length===5&&bundle.appearanceVariants.length===33,'Incomplete Fixture set');
 for(let i=0;i<3;i++){const r=bundle.representatives[i],expected=identities[i];requireValue(r.name===expected[0]&&r.kind===expected[1]&&r.level===expected[2]&&r.enemyIndex===expected[3]&&r.world===1&&r.mapIndex===6&&r.mapName==='古代科技遺址'&&r.formalId===null,'Official identity mismatch');}
 const battles=new Set();
 for(let i=0;i<bundle.cases.length;i++){
  const c=bundle.cases[i],u=clone(c);delete u.sha256;
  requireValue(c.id===CASE_IDS[i]&&await sha(u)===c.sha256,'Case SHA/identity mismatch');
  requireValue(c.capture.computedOnly&&c.capture.historyAvailability==='partial'&&c.capture.perActionHP==='unavailable'&&c.capture.settlement==='unavailable-no-transactions'&&c.capture.dropped===0&&c.capture.omitted===0&&c.stateUnchanged,'Unsupported capture authority');
  requireValue(c.events.length>0&&c.events.length<=32&&c.capture.sourceEventCount<=256,'Fixture queue/history overflow');
  const battle=c.events[0].battleId;requireValue(!battles.has(battle),'Duplicate source battle');battles.add(battle);
  let last=0;for(const e of c.events){checkEvent(e,last,battle);last=e.seq;requireValue(e.actors.enemy.name===c.input.enemy.name,'Enemy identity mismatch');}
  requireValue(hp(c.computed.start.player)&&hp(c.computed.start.enemy)&&hp(c.computed.final.player)&&hp(c.computed.final.enemy)&&c.computed.result.settlementAvailability==='unavailable','Invalid known HP/shield/settlement');
 }
 for(const a of bundle.assets){const r=registry.assets.find(r=>r.id===a.id);requireValue(r&&a.path===r.path&&a.license===r.license&&a.preload===false&&r.preload===false&&/^[a-f0-9]{64}$/.test(a.sha256)&&a.bytes>0,'Signed fixture asset identity mismatches current registry');}
 const pack=copyFrozen({bundle,controls,fixtureSHA:FIXTURE_SHA,controlsSHA:CONTROLS_SHA,currentRegistry});verified.add(pack);return pack;
}
export function selectInput(pack,{caseId,variantId,lod,scheme}){
 requireValue(verified.has(pack),'Only verified data may be selected');requireValue(['A','B','C'].includes(scheme)&&['low','medium','high'].includes(lod),'Unknown scheme/LOD');
 const c=pack.bundle.cases.find(c=>c.id===caseId),variant=pack.bundle.appearanceVariants.find(v=>v.id===variantId);requireValue(c&&variant,'Unknown Case/appearance');
 // Scheme is deliberately excluded. A/B/C receive identical immutable values.
 const equipment=variant.resolved[lod].map(d=>{
  if(!pack.currentRegistry||!d.assetId)return d;
  const old=pack.bundle.assets.find(a=>a.id===d.assetId&&a.sha256===d.sha256),a=pack.currentRegistry.assets.find(a=>a.id===d.assetId);
  requireValue(old&&a&&a.slot===d.type&&a.quality===lod&&a.mount===old.mount&&JSON.stringify(a.names)===JSON.stringify(old.names),'Refined equipment identity mismatch');
  return {...d,sha256:a.sha256,bytes:a.bytes,fixtureAssetSHA256:d.sha256};
 });
 const input=copyFrozen({schema:'cw.t2b1.playback-input',version:1,scope:'development-only-not-live-state',lane:'gm-fixture',fixtureSHA:pack.fixtureSHA,caseSHA:c.sha256,controlsSHA:pack.controlsSHA,caseId,variantId,lod,representative:pack.bundle.representatives.find(r=>r.fixtureKey===c.representative),playerName:pack.bundle.player.name,events:c.events,computed:c.computed,capture:c.capture,appearance:variant.appearance,equipment,controls:pack.controls});inputs.add(input);return input;
}
export async function loadData({signal,fetcher=globalThis.fetch,base=new URL('./',import.meta.url)}={}){
 const read=async url=>{const response=await fetcher(url,{signal,cache:'no-store'});if(!response.ok)throw Error('Fixture/source HTTP '+response.status+': '+url.pathname);return response.text();};
 const [bundle,controls]=await Promise.all(['owner-fixtures','comparison-controls'].map(async name=>JSON.parse(await read(new URL('t2a-v1/'+name+'.json',base)))));
 return validateData(bundle,controls,{signal,readSource:file=>read(new URL('../../'+file,base))});
}
