"use strict";
// Development-only fixture producer. Executes existing owners in a fresh VM;
// no real browser, account, renderer, storage, rewards or cloud dependencies.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {glb}=require('./asset-registry.cjs');
const ROOT=path.resolve(__dirname,'..'),DIR='development/hybrid-comparison/t2a-v1',FILE=DIR+'/owner-fixtures.json';
const BASELINE='754acf702325f0a136d21a5948b45807ea5db4f2';
const SLOTS=['weapon','helmet','armor','shoes','accessory'];
const SOURCES=['data.js','worldmaps-earth.js','engine.js','balance.js','alternateuniversedata.js','traits.js','combatmath.js','combatcore.js','combat-events.js','3d-test/appearance-snapshot.js','3d-test/formal-snapshots.js','assets/3d/asset-registry.json','development/3d-source/equipment/ancient-ruins-v1/rig-contract.json'];
const history='development/3d-source/equipment/ancient-ruins-v1/history/';
const historical=p=>p==='assets/3d/asset-registry.json'&&fs.existsSync(path.join(ROOT,history+'original-asset-registry.source.txt'))?history+'original-asset-registry.source.txt':p.startsWith('assets/3d/equipment/ancient-ruins-v1/')&&fs.existsSync(path.join(ROOT,history+path.basename(p)))?history+path.basename(p):p;
const read=p=>fs.readFileSync(path.join(ROOT,historical(p)),'utf8'),plain=x=>JSON.parse(JSON.stringify(x)),sha=x=>crypto.createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
function frozen(x){if(x&&typeof x==='object'){Object.values(x).forEach(frozen);Object.freeze(x);}return x;}
function rng(seed){let n=seed>>>0;return()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
function boot(){
 const w={console,render(){},Math:Object.create(Math),JSON,AbortController,crypto:{randomUUID:()=> 't2a-isolated-v1'},atob:s=>Buffer.from(s,'base64').toString(),document:{hidden:false,addEventListener(){}},addEventListener(){},localStorage:{getItem(){return null},setItem(){throw Error('Fixture storage forbidden');}},fetch(){throw Error('Fixture network forbidden');},setTimeout(){throw Error('Fixture timers forbidden');}};
 w.window=w;vm.createContext(w);
 for(const f of SOURCES.filter(p=>p.endsWith('.js')))vm.runInContext(read(f),w,{filename:f,timeout:1000});
 w.playerCombatStats=()=>({hp:1600,atk:380,def:100,crit:18,dodge:12});
 vm.runInContext(`state={playerName:"T2-A 隔離比較玩家",level:35,hp:1600,worldPhase:1,equipment:{},inventory:[],enhancement:{levels:{}},specializations:{},marks:{entries:{}},unlockedMap:6,mapProgress:Array.from({length:100},()=>[10,10,10,10]),bossKilled:Array(100).fill(false),bossLocked:Array(100).fill(false),bossProgress:Array(100).fill(10),secondWorld:{entered:false},thirdWorld:{entered:false}};`,w);
 return w;
}
const drain=async()=>{for(let i=0;i<160;i++)await Promise.resolve();};
function assets(){
 const r=JSON.parse(read('assets/3d/asset-registry.json'));
 return r.assets.filter(a=>a.type==='character'||a.type==='equipment').map(a=>{
  const b=fs.readFileSync(path.join(ROOT,historical(a.path)));assert.equal(sha(b),a.sha256,a.id+' SHA');const j=glb(b,a.id);
  return {id:a.id,path:a.path,sha256:a.sha256,bytes:b.length,type:a.type,slot:a.slot||null,quality:a.quality,mount:a.mount||null,names:a.names||[],license:a.license,preload:a.preload,joints:j.skins?.[0]?.joints.length||0,sockets:Object.keys(JSON.parse(read('development/3d-source/equipment/ancient-ruins-v1/rig-contract.json')).sockets).filter(name=>j.nodes.some(n=>n.name===name)),animations:(j.animations||[]).map(a=>a.name),artStatus:a.type==='character'?r.artStatus:r.equipmentArtStatus};
 });
}
async function build(){
 const w=boot(),bridge=w.CivilizationCombatEvents,maps=vm.runInContext('MAPS',w),map=maps[6],registry=JSON.parse(read('assets/3d/asset-registry.json'));
 assert.equal(map.name,'古代科技遺址');
 const equipment=Object.fromEntries(SLOTS.map((slot,i)=>[slot,{name:map.gear[i],world:1,type:slot,q:2,level:35}]));
 vm.runInContext('state.equipment='+JSON.stringify(equipment),w);
 const appearance=plain(w.Civilization3DFormalSnapshots.appearance());
 const variants=[];
 for(let mask=0;mask<32;mask++){
  const a=plain(appearance);SLOTS.forEach((s,i)=>{if(!(mask&(1<<i)))a.equipment[s]={...a.equipment[s],present:false,name:'',visualKey:''};});
  variants.push({id:'g007-subset-'+mask,source:'isolated-state-via-formal-appearance-api',appearance:a,resolved:Object.fromEntries(['low','medium','high'].map(lod=>[lod,plain(w.Civilization3DAppearance.resolveEquipment(w.Civilization3DAppearance.modelDescriptors(a),registry,lod))]))});
 }
 const mixed=plain(appearance);mixed.equipment.helmet.name=maps[5].gear[1];mixed.equipment.helmet.visualKey=maps[5].gear[1];mixed.equipment.accessory.present=false;
 variants.push({id:'mixed-g006-g007-empty-accessory',source:'formal MAPS[5/6].gear identities; unbuilt G006 helmet explicitly falls back',appearance:mixed,resolved:Object.fromEntries(['low','medium','high'].map(lod=>[lod,plain(w.Civilization3DAppearance.resolveEquipment(w.Civilization3DAppearance.modelDescriptors(mixed),registry,lod))]))});
 const representatives=[0,3,4].map(i=>{const d=map.enemies[i];return {fixtureKey:'earth-map6-enemy'+i,formalId:null,formalIdAvailability:'unavailable',name:d[0],world:1,regionId:'earth',regionName:map.chapter,mapIndex:6,mapName:map.name,enemyIndex:i,level:d[1],kind:d[2],style:d[3],source:{file:'worldmaps-earth.js',expression:'EARTH_MAPS[6].enemies['+i+']',locator:'MAPS[6].enemies['+i+']'},modelAvailability:'unavailable',atlasAvailability:'unavailable',unlock:'isolated level35, map6 unlocked, prior kills10 and boss not locked; no real account touched'};});
 const cases=[];
 const definitions=[...representatives.map((r,i)=>({id:r.kind+'-baseline',rep:r,seed:i===0?9:107+i,abilities:null})),{id:'boss-player-defeat',rep:representatives[2],seed:111,player:{hp:120,atk:100,def:10,crit:0,dodge:0}},{id:'elite-effects-owner-input',rep:representatives[1],seed:112,abilities:{comboRate:35,counterRate:35,drainRate:35}}];
 for(const d of definitions){
  const seen=[],deliveries=[];const dispose=bridge.subscribe((e,delivery)=>{seen.push(plain(e));deliveries.push(delivery.dropped);},{lane:'gm-fixture'});
  const random=rng(d.seed);w.Math.random=random;
  const enemy=plain(vm.runInContext('createMonsterEncounter(6,'+d.rep.enemyIndex+')',w));
  assert.equal(vm.runInContext('enemyUnlocked(6,'+d.rep.enemyIndex+')',w),true);
  const player=d.player||w.playerCombatStats(),before=vm.runInContext('JSON.stringify(state)',w);
  const result=w.runCombatCore(player,enemy,player.hp,{rng:random,maxActions:12,preparePresentation:true,visualContext:{mode:'main',world:1,owner:'combatcore.js',fixture:true,variant:enemy.kind,location:'6:'+d.rep.enemyIndex,playerName:appearance?vm.runInContext('state.playerName',w):null},...(d.abilities?{enemyAbilityProfile:d.abilities}:{})});
  await drain();const snapshot=plain(bridge.snapshot('gm-fixture'));dispose();
  assert.equal(vm.runInContext('JSON.stringify(state)',w),before,'Core observation must not mutate isolated State');
  const dropped=deliveries.reduce((a,b)=>a+b,0);
  const capture={bridgeSchema:1,lane:'gm-fixture',sourceEventCount:result.events.length,normalizedActions:seen.filter(e=>e.type==='combat-action').length,omitted:snapshot.history.omitted,dropped,historyAvailability:'partial',captureCoverage:dropped===0&&snapshot.history.omitted===0?'complete-known-core-events':'partial',perActionHP:'unavailable',pacing:'unavailable-no-combatfx-playback',settlement:'unavailable-no-transactions',computedOnly:true};
  assert.equal(bridge.diagnostics().subscribers,0);assert.equal(bridge.diagnostics().queued,0);
  assert.ok(seen.length<=32);assert.equal(dropped,0,'Comparison baseline cannot silently lose events');
  const record={id:d.id,representative:d.rep.fixtureKey,seed:d.seed,input:{player,enemy,enemyAbilityProfile:d.abilities||null,maxActions:12},appearanceVariant:'g007-subset-31',capture,events:seen,computed:{start:snapshot.computed.start,final:snapshot.computed.final,result:snapshot.result},stateUnchanged:true};record.sha256=sha(record);cases.push(record);
 }
 const bundle={schema:'cw.t2a.owner-fixtures',version:1,baseline:BASELINE,scope:'development-only-not-live-state',generator:'scripts/hybrid-comparison-fixtures.cjs',sources:Object.fromEntries(SOURCES.map(p=>[p,sha(read(p))])),numericPlayerSource:'explicit isolated numerical input; not inferred from G007 appearance or claimed as saved player stats',player:{name:'T2-A 隔離比較玩家',appearanceSource:'Civilization3DFormalSnapshots.appearance -> Civilization3DAppearance.capture on isolated VM State',appearance},representatives,appearanceVariants:variants,assets:assets(),cases};
 bundle.sha256=sha(bundle);return bundle;
}
function validate(bundle){
 assert.equal(bundle.schema,'cw.t2a.owner-fixtures');assert.equal(bundle.version,1);assert.equal(bundle.scope,'development-only-not-live-state');
 const b=plain(bundle),hash=b.sha256;delete b.sha256;assert.equal(sha(b),hash,'Bundle checksum');
 for(const [p,h] of Object.entries(bundle.sources))assert.ok(SOURCES.includes(p)&&sha(read(p))===h,'Source fingerprint '+p);
 const w=boot();const maps=vm.runInContext('MAPS',w),ids=new Set();
 for(const r of bundle.representatives){const row=maps[r.mapIndex].enemies[r.enemyIndex];assert.equal(row[0],r.name);assert.equal(row[2],r.kind);assert.equal(row[1],r.level);assert.equal(r.formalId,null);}
 for(const c of bundle.cases){const copy=plain(c),h=copy.sha256;delete copy.sha256;assert.equal(sha(copy),h);assert.equal(c.capture.computedOnly,true);assert.equal(c.capture.historyAvailability,'partial');assert.equal(c.capture.perActionHP,'unavailable');assert.equal(c.capture.omitted,0);assert.equal(c.capture.normalizedActions,c.events.filter(e=>e.type==='combat-action').length);assert.equal(c.capture.sourceEventCount,c.capture.normalizedActions);assert.equal(c.computed.result.settlementAvailability,'unavailable');assert.equal(c.capture.settlement,'unavailable-no-transactions');assert.equal(c.capture.dropped,0);assert.equal(c.stateUnchanged,true);assert.ok(c.events.length<=32);let last=0,battle=null;for(const e of c.events){assert.ok(w.CivilizationCombatEvents.validateEvent(e),'Bridge schema');assert.equal(e.lane,'gm-fixture');assert.equal(e.mode,'main');assert.equal(e.source,'combatcore.js');assert.notEqual(e.type,'settlement');assert.equal(e.seq,++last);assert.equal(e.expired,false);battle=battle||e.battleId;assert.equal(e.battleId,battle);assert.equal(e.actors.enemy.name,c.input.enemy.name);}assert.ok(!ids.has(battle));ids.add(battle);}
 for(const a of bundle.assets){const bytes=fs.readFileSync(path.join(ROOT,historical(a.path)));assert.equal(sha(bytes),a.sha256);assert.ok(a.license);assert.equal(a.preload,false);}
 assert.equal(bundle.appearanceVariants.length,33);return true;
}
function comparisonInput(bundle,id,scheme,variant='g007-subset-31'){
 validate(bundle);assert.ok(['A','B','C'].includes(scheme));const c=bundle.cases.find(c=>c.id===id),v=bundle.appearanceVariants.find(v=>v.id===variant);assert.ok(c&&v,'Known case and variant required');
 // An offline input value, not another Bridge or renderer. Never inject into the live global.
 return frozen(plain({contract:'cw.t2a.comparison-input',version:1,scope:'development-only-not-live-state',lane:'gm-fixture',fixtureSHA256:bundle.sha256,caseSHA256:c.sha256,appearanceVariant:variant,events:c.events,computed:c.computed,appearance:v.appearance}));
}
async function main(){const b=await build();validate(b);const output=JSON.stringify(b,null,2)+'\n';if(process.argv.includes('--write')){fs.mkdirSync(path.join(ROOT,DIR),{recursive:true});fs.writeFileSync(path.join(ROOT,FILE),output);}else{assert.equal(read(FILE),output,'Regenerate development fixture only with --write');}console.log('PASS T2-A fixture reproducibility, five owner cases, three official identities, 33 appearances, 18 licensed GLBs; '+b.sha256);}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={build,validate,comparisonInput,sha,plain,FILE,SOURCES};
