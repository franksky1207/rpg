const {chromium}=require("playwright");
const assert=require("assert");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.REINCARNATION_TRANSACTION_VERSION===1&&window.REINCARNATION_RUNTIME_GUARD_VERSION===1&&typeof window.executeFormalReincarnation==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const stable=v=>Array.isArray(v)?v.map(stable):(v&&typeof v==="object"?Object.fromEntries(Object.keys(v).sort().map(key=>[key,stable(v[key])])):v);
   const diffPaths=(a,b,path="",out=[])=>{
    if(out.length>=20)return out;
    if(Object.is(a,b))return out;
    const aa=Array.isArray(a),ab=Array.isArray(b);
    if(aa||ab){if(!(aa&&ab)){out.push(path||"$");return out;}if(a.length!==b.length)out.push(`${path||"$"}.length:${a.length}->${b.length}`);for(let i=0;i<Math.max(a.length,b.length)&&out.length<20;i++)diffPaths(a[i],b[i],`${path}[${i}]`,out);return out;}
    const oa=a&&typeof a==="object",ob=b&&typeof b==="object";
    if(oa||ob){if(!(oa&&ob)){out.push(path||"$");return out;}const keys=[...new Set([...Object.keys(a),...Object.keys(b)])].sort();for(const key of keys){if(out.length>=20)break;if(!Object.prototype.hasOwnProperty.call(a,key)||!Object.prototype.hasOwnProperty.call(b,key)){out.push(`${path?path+".":""}${key}:${Object.prototype.hasOwnProperty.call(a,key)?"present":"missing"}->${Object.prototype.hasOwnProperty.call(b,key)?"present":"missing"}`);continue;}diffPaths(a[key],b[key],path?`${path}.${key}`:key,out);}return out;}
    out.push(`${path||"$"}:${String(a)}->${String(b)}`);return out;
   };
   const makeQualified=()=>{
    const s=newState();
    s.saveVersion=17;s.level=2000;s.exp=123;s.hp=99999;s.gold=777;s.vipPoints=625000;window.normalizeVipState(s);
    s.reincarnation={count:2,breakthrough:{permanent:17,milestoneLifeId:2,milestones:Object.fromEntries((window.BREAKTHROUGH_MILESTONE_LEVELS||[]).map(level=>[String(level),true]))},alternateUniverse:{unlocked:true,deepestCleared:12,activeAttempt:null,lifeFailures:{lifeId:2,failures:{}}}};
    s.specializations=Object.fromEntries((window.SPECIALIZATION_KEYS||[]).map(key=>[key,60]));
    s.enhancement={basicStones:3,advancedStones:2,levels:Object.fromEntries(["weapon","helmet","armor","shoes","accessory"].map(slot=>[slot,40]))};
    s.calamities=window.createBlankCalamityState();s.marks=window.createBlankMarkState();Object.values(s.marks.entries).forEach(row=>{row.acquired=true;row.level=10;});
    s.secondWorld=window.createBlankSecondWorldState();s.secondWorld.entered=true;s.secondWorld.civilizationLevel=10;
    s.thirdWorld=window.createBlankThirdWorldState();s.thirdWorld.entered=true;s.thirdWorld.entryVersion=2;s.thirdWorld.coreLevel=10;s.thirdWorld.bosses=s.thirdWorld.bosses.map(()=>({currentHp:0}));
    const permanent=(type,hp)=>({id:`p-${type}`,type,world:3,level:2000,name:`永久${type}`,hp,atk:type==="weapon"?100:0,def:type==="armor"?50:0,crit:0,dodge:0,mainStat:{stat:type==="weapon"?"atk":type==="armor"?"def":"hp",value:10},affixes:[],sell:0,buy:0});
    s.equipment={weapon:permanent("weapon",100),helmet:permanent("helmet",200),armor:permanent("armor",300),shoes:permanent("shoes",400),accessory:permanent("accessory",500)};
    s.inventory=[];s.lostGear=[];s.dungeon={arenaByWorld:{1:{rank:10},2:{rank:10}},mirror:{best:20},voidMirage:{highestCleared:88}};
    s.daily={dateKey:"2026-10-03",bountyUsed:17,arenaUsed:19,rewardClaimed:true};s.storyProgress={completedStories:["higher-dimensional-final"]};
    return s;
   };
   const cases={};
   state=makeQualified();window.activeMainBattleContext={test:true};cases.mainBattle=window.executeFormalReincarnation({reload:false,saveFn:()=>true});window.activeMainBattleContext=null;
   state=makeQualified();const oldMinimal=window.isMinimalModeOpen;window.isMinimalModeOpen=()=>true;cases.minimal=window.executeFormalReincarnation({reload:false,saveFn:()=>true});window.isMinimalModeOpen=oldMinimal;
   state=makeQualified();window.backgroundProgressStart("reincarnation-test",{mode:"continuous"});cases.background=window.executeFormalReincarnation({reload:false,saveFn:()=>true});window.backgroundProgressStop("reincarnation-test");
   state=makeQualified();window.activeSpecialEncounter={test:true};cases.special=window.executeFormalReincarnation({reload:false,saveFn:()=>true});window.activeSpecialEncounter=null;
   state=makeQualified();let nestedResult=null;window.runSettlementTransaction({label:"outer-test",saveFn:()=>false,mutate:()=>{nestedResult=window.executeFormalReincarnation({reload:false,saveFn:()=>true});return {ok:false,reason:"outer-test-stop"};}});cases.transactionBusy=nestedResult;
   state=makeQualified();const root=state,equipmentRef=state.equipment,reincarnationRef=state.reincarnation,beforeStable=stable(clone(state));cases.saveFail=window.executeFormalReincarnation({reload:false,currentTime:5000,saveFn:()=>false});const afterStable=stable(clone(state));cases.rollback={sameRoot:state===root,sameEquipment:state.equipment===equipmentRef,sameReincarnation:state.reincarnation===reincarnationRef,semanticExact:JSON.stringify(afterStable)===JSON.stringify(beforeStable),diffPaths:diffPaths(beforeStable,afterStable),count:state.reincarnation.count,level:state.level};
   state=makeQualified();const preserved={vipPoints:state.vipPoints,daily:clone(state.daily),story:clone(state.storyProgress),mirror:clone(state.dungeon.mirror),voidMirage:clone(state.dungeon.voidMirage)};cases.success=window.executeFormalReincarnation({reload:false,currentTime:6000,saveFn:()=>true});cases.after={count:state.reincarnation.count,level:state.level,exp:state.exp,vipPoints:state.vipPoints,daily:clone(state.daily),story:clone(state.storyProgress),mirror:clone(state.dungeon.mirror),voidMirage:clone(state.dungeon.voidMirage),commitPending:window.reincarnationCommitPending()};cases.second=window.executeFormalReincarnation({reload:false,saveFn:()=>true});
   return {cases,preserved,versions:{transaction:window.REINCARNATION_TRANSACTION_VERSION,runtime:window.REINCARNATION_RUNTIME_GUARD_VERSION}};
  });
  assert.deepEqual(report.versions,{transaction:1,runtime:1});
  for(const key of ["mainBattle","minimal","background","special"]){assert.equal(report.cases[key].ok,false,key);assert.equal(report.cases[key].reason,"active-runtime",key);}
  assert.ok(report.cases.mainBattle.runtime.blockers.includes("mainline-active"));
  assert.ok(report.cases.minimal.runtime.blockers.includes("minimal-mode-open"));
  assert.ok(report.cases.background.runtime.blockers.includes("background-flow:reincarnation-test"));
  assert.ok(report.cases.special.runtime.blockers.some(x=>x.includes("special-encounter-active")));
  assert.equal(report.cases.transactionBusy.ok,false);assert.equal(report.cases.transactionBusy.reason,"transaction-busy");
  assert.equal(report.cases.saveFail.ok,false);assert.equal(report.cases.saveFail.reason,"save-failed");assert.equal(report.cases.saveFail.transaction.rolledBack,true);
  if(!report.cases.rollback.semanticExact)console.error("Rollback semantic drift:",JSON.stringify(report.cases.rollback.diffPaths));
  assert.equal(report.cases.rollback.sameRoot,true);assert.equal(report.cases.rollback.sameEquipment,true);assert.equal(report.cases.rollback.sameReincarnation,true);assert.equal(report.cases.rollback.semanticExact,true);assert.equal(report.cases.rollback.count,2);assert.equal(report.cases.rollback.level,2000);
  assert.equal(report.cases.success.ok,true);assert.equal(report.cases.success.saved,true);assert.equal(report.cases.success.reloading,false);
  assert.equal(report.cases.after.count,3);assert.equal(report.cases.after.level,1);assert.equal(report.cases.after.exp,0);assert.equal(report.cases.after.commitPending,true);
  assert.equal(report.cases.after.vipPoints,report.preserved.vipPoints);assert.deepEqual(report.cases.after.daily,report.preserved.daily);assert.deepEqual(report.cases.after.story,report.preserved.story);assert.deepEqual(report.cases.after.mirror,report.preserved.mirror);assert.deepEqual(report.cases.after.voidMirage,report.preserved.voidMirage);
  assert.equal(report.cases.second.ok,false);assert.equal(report.cases.second.reason,"reincarnation-committed");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Reincarnation transaction integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
