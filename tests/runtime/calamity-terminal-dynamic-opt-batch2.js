const fs=require("fs"),vm=require("vm"),assert=require("assert");
const backgroundSource=fs.readFileSync("backgroundprogress.js","utf8");
const w1Source=fs.readFileSync("calamityrun.js","utf8");
const w2Source=fs.readFileSync("secondworldcalamityrun.js","utf8");
function harness(era,{fast=false,kills=29,failSave=false,title=false}={}){
 let clock=1000,saves=0,serializes=0;const docEvents={},winEvents={},observed=[];
 const document={visibilityState:"visible",hasFocus:()=>true,addEventListener(name,fn){docEvents[name]=fn;}};
 const def={id:era===1?"galaxy-calamity-probe":"universe-calamity-probe",name:"Probe",markId:"mark-probe",index:0,targetCivilizationLevel:1,maxHp:100000,bossIndex:0,level:600,atkMultiplier:1,defMultiplier:1,crit:0,dodge:0};
 const ctx={console,document,Date:{now:()=>clock},setTimeout(fn,ms){return 0;},clearTimeout(){},addEventListener(name,fn){winEvents[name]=fn;},
  state:{hp:100,calamities:{entries:{}},marks:{},secondWorld:{entered:true,civilizationLevel:0,calamities:[{trueKills:kills,currentHp:null}]}},
  gmBackgroundBattleEnabled:()=>true,
  getCivilizationCalamityDefinition:id=>id===def.id?def:null,
  getCivilizationCalamityStatus:()=>({currentHp:100000,maxHp:100000,mark:{level:9,progress:29}}),
  isCivilizationCalamityUnlocked:()=>true,playerCombatStats:()=>({hp:100,atk:10,def:10}),
  runCivilizationCalamityBattle(id,options){if(options.save!==false&&typeof ctx.save==="function")ctx.save(false);return {ok:true,win:true,calamityId:id,enemy:{hp:100000},enemyStartHp:100000,enemyEndHp:0,playerStartHp:100,playerEndHp:100,turns:1,settlement:{markMaxed:true,titleSettlement:null,markSettlement:{level:10}}};},
  getSecondWorldCalamityDefinition:value=>value===def||value===def.id?def:null,
  canChallengeSecondWorldCalamity:()=>true,secondWorldBossBaseStats:()=>({atk:10,def:10}),
  getSecondWorldCalamityCurrentHp:()=>100000,civilizationCombatDamageMultiplier:()=>1,
  runCombatCore(){return {win:true,enemyHp:0,hp:95,turns:1,logs:[],events:[]};},
  normalizeSecondWorldCalamityState(){},isSecondWorldCalamityCompleted:()=>ctx.state.secondWorld.calamities[0].trueKills>=30,
  restorePlayerHp(){ctx.state.hp=100;},grantPlayerTitleForUniverseCalamityFirstKill:()=>title?{firstAcquisition:true}:null,
  save(){saves++;return !failSave;},
  registerWorldTransitionRuntimeBlocker(){return true;}
 };
 // Count expensive full-state JSON copies, excluding compact battle/settlement serialization.
 Object.defineProperty(ctx.state,"toJSON",{configurable:true,enumerable:false,value(){serializes++;return {...this};}});
 ctx.window=ctx;vm.createContext(ctx);
 vm.runInContext(backgroundSource,ctx,{filename:"backgroundprogress.js"});
 if(fast){
  const create=ctx.createContinuousRunInfrastructure;
  ctx.createContinuousRunInfrastructure=options=>{
   const base=create(options);
   return Object.freeze({...base,startBackground(){
    const started=base.startBackground();
    document.visibilityState="hidden";docEvents.visibilitychange();
    clock+=100000;document.visibilityState="visible";docEvents.visibilitychange();
    return started;
   }});
  };
 }
 vm.runInContext(era===1?w1Source:w2Source,ctx,{filename:era===1?"calamityrun.js":"secondworldcalamityrun.js"});
 return {ctx,def,observed,counts:()=>({saves,serializes}),setFail(value){failSave=value;},events:docEvents};
}
async function continuous(era,fast){
 const x=harness(era,{fast});
 const fn=era===1?x.ctx.runCivilizationCalamityContinuous:x.ctx.runSecondWorldCalamityContinuous;
 let ended=null;
 const result=await fn(x.def.id,{
  async onBattleComplete(step){x.observed.push(step);},
  async onEnd(run){ended=run;}
 });
 assert.equal(result.ok,true,"W"+era+" continuous final must succeed");
 assert.equal(result.ended,true,"W"+era+" terminal must end");
 assert.equal(result.reason,era===1?"mark-maxed":"civilization-complete","W"+era+" terminal reason");
 assert.equal(x.observed.length,1,"W"+era+" final should invoke one battle callback");
 const step=x.observed[0],policy=step.presentationPolicy;
 assert.equal(policy.fastCatchUp,fast,"W"+era+" must carry pre-battle catch-up policy after finish stopped background");
 assert.equal(policy.shouldPresentBattle,!fast,"W"+era+" fast terminal is intentionally headless; normal battle shown");
 assert.equal(policy.combatOptions.save!==false,!fast,"W"+era+" terminal save policy");
 assert.equal(x.counts().saves,1,"W"+era+" final battle must checkpoint exactly once");
 assert.equal(ended.active,false,"W"+era+" final end snapshot should be terminal");
 assert.equal(x.ctx.backgroundProgressIsActive("calamity"),false,"W"+era+" background flow must stop after final battle");
 if(era===2)assert.equal(x.counts().serializes,fast?0:1,"W2 avoid full-state snapshot when skip-save; keep rollback snapshot when saving");
 if(era===2)assert.equal(x.ctx.state.secondWorld.calamities[0].trueKills,30,"W2 terminal must persist 30 kills");
 return {era,fast,reason:result.reason,saveCount:x.counts().saves,fullStateSnapshots:x.counts().serializes};
}
async function main(){
 const results=[];
 for(const era of [1,2])for(const fast of [false,true])results.push(await continuous(era,fast));
 // Non-terminal W2 checkpoint skip still applies state changes, and a manual stop checkpoints exactly once.
 {
  const x=harness(2,{kills:27});
  assert.equal(x.ctx.beginSecondWorldCalamityRun(x.def.id,"continuous").ok,true);
  const step=x.ctx.fightNextSecondWorldCalamityBattle({save:false,logs:false,preparePresentation:false});
  assert.equal(step.ended,false,"W2 28th kill should not end");
  assert.equal(x.counts().saves,0,"W2 fast intermediate step must not save");
  assert.equal(x.counts().serializes,0,"W2 fast intermediate step must not JSON.stringify full state");
  x.ctx.requestSecondWorldCalamityStop();
  assert.equal(x.counts().saves,1,"W2 stopped run must save intermediate skipped progress");
 }
 // W2 initial title terminates with exactly one checkpoint in both policies.
 for(const saveNow of [true,false]){
  const x=harness(2,{kills:0,title:true});
  assert.equal(x.ctx.beginSecondWorldCalamityRun(x.def.id,"continuous").ok,true);
  const step=x.ctx.fightNextSecondWorldCalamityBattle({save:saveNow});
  assert.equal(step.reason,"title-first-kill");
  assert.equal(x.counts().saves,1);
  assert.equal(x.counts().serializes,saveNow?1:0);
 }
 // An actual checkpoint failure must roll back W2 formal combat progress.
 {
  const x=harness(2,{kills:29,failSave:true});
  assert.equal(x.ctx.beginSecondWorldCalamityRun(x.def.id,"continuous").ok,true);
  const step=x.ctx.fightNextSecondWorldCalamityBattle({save:true});
  assert.equal(step.ok,false,"W2 save failure should reject settlement");
  assert.equal(x.ctx.state.secondWorld.calamities[0].trueKills,29,"W2 save failure must restore 29 kills");
  assert.equal(x.ctx.state.secondWorld.civilizationLevel,0,"W2 save failure must revert civilization advancement");
  assert.equal(x.counts().saves,2,"W2 failed formal settlement retains existing fail-path terminal checkpoint behavior");
 }
 for(const token of [
  "SECOND_WORLD_CALAMITY_SNAPSHOT_CONDITIONAL_VERSION",
  "SECOND_WORLD_CALAMITY_TERMINAL_CHECKPOINT_OPT_VERSION",
  "CALAMITY_TERMINAL_CHECKPOINT_OPT_VERSION"
 ])assert.ok((fs.readFileSync("secondworldcalamityrun.js","utf8")+fs.readFileSync("calamityrun.js","utf8")).includes(token),"Missing optimization owner "+token);
 console.log("CALAMITY TERMINAL DYNAMIC BATCH2 PASSED",JSON.stringify(results));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
