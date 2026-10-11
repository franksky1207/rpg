/* Executable T1-A contract and negative tests; no credentials, storage or renderer. */
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm"),fs=require("node:fs");
const read=path=>fs.readFileSync(path,"utf8");
const plain=value=>JSON.parse(JSON.stringify(value));
function fixture(){
 const w={console,atob:s=>Buffer.from(s,"base64").toString(),state:{level:700,gm:false,unlockedMap:99,bossKilled:Array(100).fill(false),
  equipment:{weapon:{name:"銀河測試武器",world:1,q:3,level:20},armor:{name:"高維測試鎧甲",world:3,q:4,level:1200}},inventory:[],enhancement:{levels:{weapon:2}},specializations:{training:4},marks:{entries:{ward:{level:2}}},secondWorld:{entered:true,civilizationLevel:3},thirdWorld:{entered:true,coreLevel:4}},
  MAPS:Array.from({length:100},(_,i)=>({name:"測試區"+i})),WORLD_REGIONS:Array.from({length:10},(_,i)=>({name:"測試大區"+i,mapStart:i*10,mapEnd:i*10+9})),
  SPECIALIZATION_KEYS:["training"],MARK_KEYS:["ward"],currentWorldPhase:()=>3,playerCombatStats:()=>({hp:100,atk:20,def:10,crit:0,dodge:0}),
  SECOND_WORLD_BOSSES:Array.from({length:100},(_,index)=>({index})),secondWorldBossKilled:i=>i<12,secondWorldHighestUnlockedBossIndex:()=>12,getSecondWorld3DPreviewSelectedRegion:()=>7,
  THIRD_WORLD_BOSS_DEFINITIONS:Array.from({length:10},(_,index)=>({index})),thirdWorldBossProgressSnapshot:i=>({defeated:i<2,remainingPercent:i<2?0:75,challengeStatus:{allowed:i===2}}),
  alternateUniverseProgressionSnapshot:()=>({unlocked:true,maxDepth:1000,deepestCleared:7,nextDepth:8,completed:false}),alternateUniverseActiveAttempt:()=>({depth:8}),alternateUniverseFailureStatus:()=>({locked:false}),
  getArenaCoreState:()=>({phase:"ready",rank:4,position:"hard",daily:{remaining:3},runtime:{mode:"varied",round:{stageIndex:2},finishedRuns:6}}),getBountyTestSnapshot:()=>({phase:"ready",tier:{id:"high"}}),
  dungeonModeAvailability:key=>({visible:key!=="bounty",enabled:true}),isDungeonModeEntryUnlocked:()=>true,dailyDungeonStatus:()=>({remaining:3}),mirrorDungeonStatus:()=>({unlocked:true,history:{bestWins:12}}),getVoidMirageProgressSnapshot:()=>({highestCleared:18}),
  getCombatPresentationSnapshot:()=>({playerHp:25,playerMaxHp:100,enemyHp:75,enemyMaxHp:100,playerShield:20,playerShieldMax:40,enemyShield:0}),
  getCivilizationCalamityDefinitions:()=>[{id:"one"}],getCivilizationCalamityStatus:()=>({mark:{level:10},currentHp:25,maxHp:100}),isCivilizationCalamityUnlocked:()=>true,
  getSecondWorldCalamityDefinitions:()=>[{id:"two"}],getSecondWorldCalamityStatus:()=>({completed:false,challengeable:true,currentHp:60,maxHp:100,progressPercent:30}),isSecondWorldCalamityVisible:()=>true};
 w.window=w;const context=vm.createContext(w);vm.runInContext(read("3d-test/appearance-snapshot.js"),context);vm.runInContext(read("3d-test/formal-snapshots.js"),context);return {w,context,api:w.Civilization3DFormalSnapshots};
}
test("galaxy last region uses the real last Boss, not 101/501",()=>{
 const {w,api}=fixture();assert.equal(api.galaxy().completedRegions[9],false);w.state.bossKilled[99]=true;assert.equal(api.galaxy().completedRegions[9],true);
 w.state.unlockedMap=10;assert.equal(api.galaxy().completedRegions[0],true);assert.equal(api.galaxy().completedRegions[1],false);
});
test("galaxy review and progress focus are explicit presentation contexts",()=>{
 const {w,api}=fixture();w.state.unlockedMap=12;
 assert.equal(api.galaxy({focus:"progress"}).selectedMap,1);assert.equal(api.galaxy({mapIndex:77,review:true}).selectedMap,7);assert.ok(api.galaxy({review:true}).completedRegions.every(Boolean));
});
test("universe selected/review focus and defeated Bosses use live owners",()=>{
 const {api}=fixture(),s=api.universe({review:true});assert.equal(s.selectedMap,7);assert.equal(s.clearedBossCount,12);assert.equal(s.defeatedBosses.length,100);assert.equal(s.review,true);
});
test("higher uses late reincarnation owner overrides",()=>{
 const {w,api}=fixture();assert.equal(api.higher().selectedPresence,2);w.thirdWorldBossProgressSnapshot=()=>({defeated:true,remainingPercent:0,challengeStatus:{allowed:false}});assert.ok(api.higher().presences.every(p=>p.defeated));
});
test("mixed epochs, empty slots and external appearance API remain supported",()=>{
 const {w,api}=fixture(),s=api.appearance();assert.equal(s.version,2);assert.equal(s.equipment.weapon.world,1);assert.equal(s.equipment.armor.world,3);assert.equal(s.equipment.helmet.present,false);assert.equal(w.Civilization3DAppearance.modelDescriptors(s).length,5);assert.equal(api.growth("marks").growthLevels[0],2);
});
test("returned appearance and snapshots never alias formal state or owner output",()=>{
 const {w,api}=fixture(),before=JSON.stringify(w.state),owner={playerHp:25,playerMaxHp:100,enemyHp:75,enemyMaxHp:100};w.getCombatPresentationSnapshot=()=>owner;
 const a=api.appearance();a.equipment.weapon.name="changed";const s=api.scenario();s.galaxy.completedRegions[0]=false;s.higher.presences[0].defeated=false;s.battle.playerHp=999;
 assert.equal(JSON.stringify(w.state),before);assert.equal(owner.playerHp,25);assert.equal(api.battle().playerHp,25);
});
test("alternate separates active, next and historical focus",()=>{
 const {w,api}=fixture();w.alternateUniverseActiveAttempt=()=>({depth:23});let s=api.alternate();assert.equal(s.focusKind,"active-attempt");assert.equal(s.activeAttemptDepth,23);assert.equal(s.nextChallengeDepth,8);assert.equal(s.historicalCompletedDepth,7);assert.equal(s.alternateUniverse,5);assert.equal(s.alternateDepth,3);
 w.alternateUniverseActiveAttempt=()=>null;s=api.alternate();assert.equal(s.focusKind,"next-challenge");assert.equal(s.focusDepth,8);
 w.alternateUniverseProgressionSnapshot=()=>({maxDepth:1000,deepestCleared:1000,nextDepth:null,completed:true});s=api.alternate();assert.equal(s.focusKind,"historical-completion");assert.equal(s.activeAttemptDepth,null);assert.equal(s.nextChallengeDepth,null);assert.equal(s.alternateCompleted,true);
});
test("locked/missing/invalid alternate owners cannot fabricate an active challenge",()=>{
 const {w,api}=fixture();w.alternateUniverseActiveAttempt=()=>({depth:Infinity});assert.equal(api.alternate().status,"unavailable");
 w.alternateUniverseActiveAttempt=()=>null;w.alternateUniverseProgressionSnapshot=()=>({maxDepth:1000,deepestCleared:0,nextDepth:null,completed:false,unlocked:false});assert.equal(api.alternate().focusDepth,null);
 delete w.alternateUniverseProgressionSnapshot;assert.equal(api.alternate().status,"unavailable");
});
test("calamity status/HP/review are shared, absent definitions stay unavailable",()=>{
 const {api}=fixture(),s=api.calamity(1,{review:true});assert.equal(s.calamitySeals[0].remainingPercent,25);assert.equal(s.calamitySeals[0].completed,true);assert.equal(s.calamitySeals[0].review,true);assert.equal(s.calamitySeals[1].status,"unavailable");assert.equal(api.calamities(2)[0].remainingPercent,60);
});
test("W3 bounty is unavailable and visible-mode availability stays aligned",()=>{
 const {w,api}=fixture(),hub=api.dungeon();assert.deepEqual(plain(hub.dungeonVisibleModes),["arena","tower","mirror"]);assert.deepEqual(plain(hub.dungeonAvailableModes),[false,true,true,true]);assert.equal(api.dungeon("bounty").status,"unavailable");
 w.dailyDungeonStatus=()=>({remaining:0});assert.equal(api.dungeon().dungeonAvailableModes[1],false);assert.equal(api.dungeon("arena").higherArenaMode,"varied");assert.equal(api.dungeon("mirror").advancedProgress,12);assert.equal(api.dungeon("void").advancedProgress,18);
});
test("missing formal sources are not filled by GM fixtures",()=>{
 const {w,api}=fixture();delete w.getArenaCoreState;delete w.getVoidMirageProgressSnapshot;delete w.THIRD_WORLD_BOSS_DEFINITIONS;delete w.getCombatPresentationSnapshot;
 assert.equal(api.dungeon("arena").status,"unavailable");assert.equal(api.dungeon("void").status,"unavailable");assert.equal(api.higher().status,"unavailable");assert.equal(api.battle().battleAvailable,false);w.state=null;assert.equal(api.scenario(),null);
});
test("battle uses only authoritative finite HP/shield; encounter/results unavailable",()=>{
 const {w,api}=fixture(),s=api.battle();assert.equal(s.playerHpRatio,.25);assert.equal(s.enemyHpRatio,.75);assert.equal(s.shieldRatio,.5);assert.equal(s.source,"formal-combat");assert.equal(s.encounter.status,"unavailable");assert.equal(s.settlement.status,"unavailable");
 for(const value of [null,undefined,NaN,Infinity,"bad"," ",true,[],{}]){w.getCombatPresentationSnapshot=()=>({playerHp:value,playerMaxHp:100,enemyHp:75,enemyMaxHp:100});assert.equal(api.battle().status,"unavailable");}
 w.getCombatPresentationSnapshot=()=>({playerHp:10,playerMaxHp:Infinity,enemyHp:75,enemyMaxHp:100});assert.equal(api.battle().status,"unavailable");
 w.getCombatPresentationSnapshot=()=>({playerHp:10,playerMaxHp:100,enemyHp:75,enemyMaxHp:100,playerShield:Infinity});assert.equal(api.battle().status,"unavailable");
});
test("real formal catalog retains 100/100/10 sets and all 1050 names",()=>{
 const {context,api}=fixture();vm.runInContext(read("data.js"),context);
 for(const name of ["earth","solar","nearstar","frontier","orion","galactic-frontier","galactic-mid","core-outer","core-war","galactic-unification"])vm.runInContext(read("worldmaps-"+name+".js"),context);
 vm.runInContext(read("secondworlddata.js"),context);
 // Execute only the authoritative name table: the full loot owner requires the
 // production equipment/stat pipeline, outside this identity projection unit test.
 const rows=read("thirdworldloot.js").match(/const NAME_ROWS=(Object.freeze\(\[[\s\S]*?\]\));/);
 assert.ok(rows,"Formal higher-name table missing");vm.runInContext("window.THIRD_WORLD_EQUIPMENT_NAME_ROWS="+rows[1],context);
 const c=api.equipmentCatalog();assert.deepEqual([1,2,3].map(w=>c[w].reduce((n,g)=>n+g.entries.length,0)),[100,100,10]);assert.equal(Object.values(c).flatMap(g=>g.flatMap(r=>r.entries.flatMap(e=>e.names))).length,1050);
 assert.deepEqual(plain(c[1][0].entries[6].names),plain(vm.runInContext("MAPS[6].gear",context)));
});
test("catalog rejects missing identity data rather than guessing names",()=>{const {api}=fixture();assert.throws(()=>api.equipmentCatalog(),/正式裝備/);});
test("GM bridge rejects unauthorized, foreign-origin and foreign-window messages",()=>{
 const {w,context}=fixture(),listeners={},sent=[];
 const frameWindow={postMessage:(data,origin)=>sent.push({data,origin})};
 const node=tag=>({tag,style:{},isConnected:true,children:[],contentWindow:tag==="iframe"?frameWindow:null,append(...children){this.children.push(...children);},addEventListener(){},setAttribute(){},focus(){},remove(){this.isConnected=false;},querySelector(kind){return this.children.find(n=>n.tag===kind);}});
 w.document={activeElement:null,addEventListener(){},createElement:node,body:{style:{},appendChild(){}},getElementById:()=>null};w.location={origin:"https://example.test"};w.scrollTo=()=>{};w.addEventListener=(type,cb)=>{(listeners[type]??=[]).push(cb);};
 vm.runInContext(read("gm3dprototype.js"),context);assert.equal(w.openGm3DPrototype(),false);w.state.gm=true;assert.equal(w.openGm3DPrototype(),true);
 const send=(source=frameWindow,origin=w.location.origin)=>listeners.message.forEach(fn=>fn({source,origin,data:{type:"civilization3d:scenario-request"}}));
 send({},w.location.origin);send(frameWindow,"https://evil.test");assert.equal(sent.length,0);w.state.gm=false;send();assert.equal(sent.length,0);w.state.gm=true;send();assert.equal(sent.length,1);assert.equal(sent[0].data.type,"civilization3d:scenario-response");assert.equal(sent[0].data.snapshot.galaxy.completedRegions[9],false);
 w.closeGm3DPrototype();send();assert.equal(sent.length,1);
});
