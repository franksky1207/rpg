(function(){
 const VERSION=1;
 const SETTLEMENT_VERSION=1;
 const CONTINUOUS_VERSION=1;
 let activeRun=null;

 function clone(value){try{return value==null?value:JSON.parse(JSON.stringify(value));}catch(e){return null;}}
 function def(value){return typeof window.getSecondWorldCalamityDefinition==="function"?window.getSecondWorldCalamityDefinition(value):null;}
 function status(value){return typeof window.getSecondWorldCalamityStatus==="function"?window.getSecondWorldCalamityStatus(value):null;}
 function player(){return typeof window.playerCombatStats==="function"?window.playerCombatStats():null;}
 function saveAtomic(before){
  let ok=true;
  try{if(typeof save==="function")ok=save(false)!==false;}catch(e){ok=false;}
  if(ok)return true;
  try{state=JSON.parse(before);}catch(e){}
  return false;
 }
 function enemy(value){
  const d=def(value);if(!d)return null;
  const base=typeof window.secondWorldBossBaseStats==="function"?window.secondWorldBossBaseStats(d.bossIndex):null;
  if(!base)return null;
  return {
   name:d.name,level:d.level,kind:"civilization-calamity",style:"universe",
   hp:d.maxHp,
   atk:Math.max(1,Math.ceil(base.atk*d.atkMultiplier)),
   def:Math.max(0,Math.ceil(base.def*d.defMultiplier)),
   crit:d.crit,dodge:d.dodge,
   calamityId:d.id,regionId:d.regionId,bossIndex:d.bossIndex
  };
 }
 function runCombat(value,options={}){
  const d=def(value);if(!d)return {ok:false,reason:"找不到宇宙紀元文明災厄。"};
  if(options.ignoreUnlock!==true&&!(typeof window.canChallengeSecondWorldCalamity==="function"&&window.canChallengeSecondWorldCalamity(d.id,options.state||null)))return {ok:false,reason:"尚未符合此文明災厄的挑戰條件。"};
  if(typeof window.runCombatCore!=="function")return {ok:false,reason:"正式戰鬥核心尚未載入。"};
  const e=enemy(d);if(!e)return {ok:false,reason:"無法建立宇宙紀元文明災厄。"};
  const p=options.player&&typeof options.player==="object"?options.player:player();if(!p)return {ok:false,reason:"無法取得玩家能力。"};
  const startEnemyHp=typeof window.getSecondWorldCalamityCurrentHp==="function"?window.getSecondWorldCalamityCurrentHp(d.id,options.state||null):e.hp;
  const targetState=options.state&&typeof options.state==="object"?options.state:state;
  const civilizationMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"?window.civilizationCombatDamageMultiplier({world:2,state:targetState,civilizationLevel:options.civilizationLevel}):1;
  const combat=window.runCombatCore(p,e,Math.max(1,Number(p.hp)||1),{
   logs:options.logs!==false,
   rng:typeof options.rng==="function"?options.rng:undefined,
   enemyStartHp:startEnemyHp,
   maxTurns:options.maxTurns||0,
   preparePresentation:options.preparePresentation!==false,
   playerFinalDamageMultiplier:civilizationMultiplier
  });
  return {ok:true,win:combat.win===true,definition:d,enemy:e,enemyStartHp:startEnemyHp,enemyEndHp:combat.enemyHp,playerStartHp:p.hp,playerEndHp:combat.hp,turns:combat.turns,logs:combat.logs||[],events:combat.events||[],combat,civilizationDamageMultiplier:civilizationMultiplier};
 }
 function settle(value,combat,options={}){
  const d=def(value);if(!d||!combat)return {ok:false,reason:"文明災厄結算資料無效。"};
  if(!state?.secondWorld?.entered)return {ok:false,reason:"目前不是宇宙紀元。"};
  if(typeof window.normalizeSecondWorldCalamityState==="function")window.normalizeSecondWorldCalamityState(state);
  const row=state.secondWorld?.calamities?.[d.index];if(!row)return {ok:false,reason:"文明災厄 state 不存在。"};
  const before=JSON.stringify(state);
  const completedBefore=typeof window.isSecondWorldCalamityCompleted==="function"&&window.isSecondWorldCalamityCompleted(d.id,state);
  const killsBefore=Math.max(0,Math.min(30,Math.floor(Number(row.trueKills)||0)));
  const civBefore=Math.max(0,Math.min(10,Math.floor(Number(state.secondWorld.civilizationLevel)||0)));
  let trueKill=false,civilizationLevelUp=false;
  if(combat.win){
   if(!completedBefore){
    row.trueKills=Math.min(30,killsBefore+1);
    trueKill=true;
    if(row.trueKills>=30){
     state.secondWorld.civilizationLevel=Math.max(civBefore,d.targetCivilizationLevel);
     civilizationLevelUp=state.secondWorld.civilizationLevel>civBefore;
    }
   }
   row.currentHp=null;
  }else{
   const completeNow=completedBefore||row.trueKills>=30||Math.max(0,Math.floor(Number(state.secondWorld.civilizationLevel)||0))>=d.targetCivilizationLevel;
   row.currentHp=completeNow?null:Math.max(1,Math.min(d.maxHp,Math.floor(Number(combat.enemyHp)||d.maxHp)));
  }
  const completedAfter=row.trueKills>=30||Math.max(0,Math.floor(Number(state.secondWorld.civilizationLevel)||0))>=d.targetCivilizationLevel;
  if(completedAfter)row.currentHp=null;
  if(typeof window.restorePlayerHp==="function")window.restorePlayerHp({save:false});
  else if(typeof window.playerCombatStats==="function")state.hp=window.playerCombatStats().hp;
  if(options.save!==false&&!saveAtomic(before))return {ok:false,reason:"存檔失敗，已回復戰鬥前狀態。"};
  return {
   ok:true,calamityId:d.id,win:combat.win===true,trueKill,
   trueKillsBefore:killsBefore,trueKills:Math.max(0,Math.min(30,Math.floor(Number(row.trueKills)||0))),
   completedBefore,completed:completedAfter,completedNow:!completedBefore&&completedAfter,
   civilizationLevelBefore:civBefore,civilizationLevel:Math.max(0,Math.min(10,Math.floor(Number(state.secondWorld.civilizationLevel)||0))),
   civilizationLevelUp,currentHp:completedAfter?d.maxHp:(combat.win?d.maxHp:row.currentHp),maxHp:d.maxHp,
   rewards:{exp:0,darkMatter:0,darkEnergy:0,equipment:0}
  };
 }
 function battle(value,options={}){
  const combat=runCombat(value,options);if(!combat.ok)return combat;
  const settlement=settle(value,combat.combat,{save:options.save!==false});
  if(!settlement.ok)return {ok:false,reason:settlement.reason};
  return {...combat,settlement};
 }
 function runSnapshot(){
  if(!activeRun)return null;
  return {...activeRun,lastBattle:clone(activeRun.lastBattle)};
 }
 function finish(reason){
  if(!activeRun)return null;
  activeRun.active=false;activeRun.reason=String(reason||"ended");activeRun.endedAt=Date.now();
  return runSnapshot();
 }
 function begin(value,mode="continuous"){
  const d=def(value);if(!d)return {ok:false,reason:"unknown-calamity",run:runSnapshot()};
  if(!(typeof window.canChallengeSecondWorldCalamity==="function"&&window.canChallengeSecondWorldCalamity(d.id)))return {ok:false,reason:"locked",run:runSnapshot()};
  if(activeRun?.active)return {ok:false,reason:"already-active",run:runSnapshot()};
  activeRun={active:true,mode:mode==="single"?"single":"continuous",calamityId:d.id,calamityName:d.name,battleCount:0,wins:0,losses:0,trueKills:0,stopRequested:false,reason:"",startedAt:Date.now(),endedAt:null,lastBattle:null};
  return {ok:true,run:runSnapshot()};
 }
 function fightNext(options={}){
  if(!activeRun?.active)return {ok:false,reason:"no-active-run",run:runSnapshot()};
  if(activeRun.stopRequested)return {ok:true,ended:true,reason:"stopped",run:finish("stopped")};
  const result=battle(activeRun.calamityId,options);
  if(!result.ok)return {ok:false,reason:result.reason,run:finish("error")};
  activeRun.battleCount++;
  if(result.win)activeRun.wins++;else activeRun.losses++;
  if(result.settlement?.trueKill)activeRun.trueKills++;
  activeRun.lastBattle={
   win:result.win,enemyStartHp:result.enemyStartHp,enemyEndHp:result.enemyEndHp,maxHp:result.enemy?.hp||0,
   playerStartHp:result.playerStartHp,playerEndHp:result.playerEndHp,turns:result.turns,
   settlement:clone(result.settlement)
  };
  if(activeRun.mode==="single"){
   const run=finish("single-complete");return {ok:true,ended:true,reason:"single-complete",result,run,battleNumber:activeRun.battleCount};
  }
  if(result.settlement?.completed===true){
   const run=finish("civilization-complete");return {ok:true,ended:true,reason:"civilization-complete",result,run,battleNumber:activeRun.battleCount};
  }
  if(activeRun.stopRequested){
   const run=finish("stopped");return {ok:true,ended:true,reason:"stopped",result,run,battleNumber:activeRun.battleCount};
  }
  return {ok:true,ended:false,result,run:runSnapshot(),battleNumber:activeRun.battleCount};
 }
 async function continuous(value,options={}){
  if(!activeRun?.active){const started=begin(value,"continuous");if(!started.ok)return started;}
  const onBattle=typeof options.onBattleComplete==="function"?options.onBattleComplete:null;
  const onEnd=typeof options.onEnd==="function"?options.onEnd:null;
  while(activeRun?.active){
   const step=fightNext(options);
   if(!step.ok){if(onEnd)await onEnd(step.run);return step;}
   if(onBattle)await onBattle(step);
   if(step.ended||!activeRun?.active){const run=step.run||runSnapshot();if(onEnd)await onEnd(run);return {ok:true,ended:true,reason:step.reason,result:step,run};}
   await new Promise(resolve=>setTimeout(resolve,0));
  }
  const run=runSnapshot();if(onEnd)await onEnd(run);return {ok:true,ended:true,reason:run?.reason||"ended",run};
 }
 function single(value,options={}){
  const started=begin(value,"single");if(!started.ok)return started;
  return fightNext(options);
 }
 function stop(){
  if(!activeRun?.active)return {ok:false,reason:"no-active-run",run:runSnapshot()};
  activeRun.stopRequested=true;
  return {ok:true,ended:false,run:runSnapshot()};
 }

 window.SECOND_WORLD_CALAMITY_COMBAT_VERSION=VERSION;
 window.SECOND_WORLD_CALAMITY_SETTLEMENT_VERSION=SETTLEMENT_VERSION;
 window.SECOND_WORLD_CALAMITY_CONTINUOUS_VERSION=CONTINUOUS_VERSION;
 window.buildSecondWorldCalamityEnemy=enemy;
 window.runSecondWorldCalamityCombat=runCombat;
 window.settleSecondWorldCalamityBattle=settle;
 window.runSecondWorldCalamityBattle=battle;
 window.beginSecondWorldCalamityRun=begin;
 window.fightNextSecondWorldCalamityBattle=fightNext;
 window.runSecondWorldCalamitySingle=single;
 window.runSecondWorldCalamityContinuous=continuous;
 window.requestSecondWorldCalamityStop=stop;
 window.getSecondWorldCalamityRunSnapshot=runSnapshot;
})();