(function(){
 const ARENA_RANK_CURVE=Object.freeze({
  hp:Object.freeze({linear:.025,quadratic:.0075}),
  damage:Object.freeze({linear:.005,quadratic:.0031}),
  def:Object.freeze({linear:.016,quadratic:.004})
 });
 const ARENA_POSITION_BASES=[
  {id:"normal",stageWeights:[25,35,120]},
  {id:"hard",stageWeights:[35,45,200]},
  {id:"extreme",stageWeights:[40,60,320]}
 ];
 const ARENA_STAGE_NAMES=["第一戰","第二戰","第三戰"];
 const ARENA_ENEMY_NAMES=["基礎模擬單元","戰術強化單元","極限測試平台"];
 const ARENA_PHYSICAL_STAGE_PROFILE=[
  {hpMul:.60,damageMul:.57,defMul:.78},
  {hpMul:.69,damageMul:.64,defMul:.80},
  {hpMul:.78,damageMul:.73,defMul:.82}
 ];
 const ARENA_POSITION_PHYSICAL_MULTIPLIERS={
  normal:{hp:1,damage:1,def:1},
  hard:{hp:.96,damage:.96,def:.98},
  extreme:{hp:.90,damage:.92,def:.96}
 };
 const ARENA_POSITION_STAGE_CONFIGS={
  normal:[
   {critScale:.25,critAdd:0,critCap:5,dodgeScale:.20,dodgeAdd:0,dodgeCap:4,traitMode:"normal1"},
   {critScale:.35,critAdd:0,critCap:7,dodgeScale:.30,dodgeAdd:0,dodgeCap:6,traitMode:"normal2"},
   {critScale:.45,critAdd:0,critCap:9,dodgeScale:.40,dodgeAdd:0,dodgeCap:8,traitMode:"one"}
  ],
  hard:[
   {critScale:.40,critAdd:0,critCap:8,dodgeScale:.35,dodgeAdd:0,dodgeCap:7,traitMode:"one"},
   {critScale:.55,critAdd:1,critCap:12,dodgeScale:.50,dodgeAdd:1,dodgeCap:10,traitMode:"one"},
   {critScale:.70,critAdd:2,critCap:16,dodgeScale:.65,dodgeAdd:1,dodgeCap:14,traitMode:"hard3"}
  ],
  extreme:[
   {critScale:.50,critAdd:1,critCap:11,dodgeScale:.45,dodgeAdd:1,dodgeCap:9,traitMode:"one"},
   {critScale:.65,critAdd:2,critCap:16,dodgeScale:.60,dodgeAdd:1,dodgeCap:13,traitMode:"extreme2"},
   {critScale:.75,critAdd:2,critCap:19,dodgeScale:.70,dodgeAdd:1,dodgeCap:16,traitMode:"extreme3"}
  ]
 };
 const ARENA_TRAIT_COUNT_PROFILES={
  normal1:{zero:.70,one:.30,two:0},
  normal2:{zero:.50,one:.50,two:0},
  one:{zero:0,one:1,two:0},
  hard3:{zero:0,one:.75,two:.25},
  extreme2:{zero:0,one:.75,two:.25},
  extreme3:{zero:0,one:.70,two:.30}
 };

 function arenaMaxRank(){return Math.max(1,Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS.length:1);}
 function clampArenaRank(value){return Math.max(1,Math.min(arenaMaxRank(),Math.floor(Number(value)||1)));}
 function dailyStatus(){return typeof dailyDungeonStatus==="function"?dailyDungeonStatus("arena"):{used:0,remaining:0,limit:20};}
 function arenaUnlockedRankCap(){
  if(typeof unlockedArenaRankCapForState==="function")return clampArenaRank(unlockedArenaRankCapForState(state));
  const unlockedMap=Math.max(0,Math.floor(Number(state?.unlockedMap)||0)),regions=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[];
  const count=regions.filter(region=>unlockedMap>=Math.max(0,Math.floor(Number(region?.mapStart)||0))).length;
  return Math.max(1,Math.min(arenaMaxRank(),count||1));
 }
 function currentArenaProgress(){
  const dungeon=typeof ensureDungeonProgressState==="function"?ensureDungeonProgressState():state?.dungeon;
  if(!dungeon||typeof dungeon!=="object")return {rank:1};
  if(!dungeon.arena||typeof dungeon.arena!=="object")dungeon.arena={rank:1};
  const selected=dungeon.arena.activeRank??dungeon.arena.rank??dungeon.arena.highestArenaUnlocked??1;
  dungeon.arena.rank=clampArenaRank(selected);
  return dungeon.arena;
 }
 function currentArenaRank(){return currentArenaProgress().rank;}
 function arenaRankName(rank){const r=clampArenaRank(rank),region=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS[r-1]:null;return `${region?.name||`第${r}區`}階`;}
 function arenaVenueName(rank){const r=clampArenaRank(rank),region=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS[r-1]:null;return `${region?.name||`第${r}區`}競技場`;}
 function arenaRankMultipliers(rank){
  const x=clampArenaRank(rank)-1;
  const value=key=>{const curve=ARENA_RANK_CURVE[key];return 1+curve.linear*x+curve.quadratic*x*x;};
  return {hp:value("hp"),damage:value("damage"),def:value("def")};
 }
 function scaleStagePoints(weights,total){const source=Array.isArray(weights)&&weights.length===3?weights:[0,0,0],sourceTotal=Math.max(1,source.reduce((sum,x)=>sum+Math.max(0,Number(x)||0),0)),target=Math.max(0,Math.floor(Number(total)||0));const first=Math.max(0,Math.round((Number(source[0])||0)*target/sourceTotal)),second=Math.max(0,Math.round((Number(source[1])||0)*target/sourceTotal));return [first,second,Math.max(0,target-first-second)];}
 function arenaBaseTotalPoints(rank,difficultyId){
  const r=clampArenaRank(rank),id=String(difficultyId||"normal");
  const base=id==="extreme"?150:id==="hard"?100:50;
  if(r<=3)return base;
  return base+60*(r-3);
 }
 function difficultyForRank(base,rank){
  if(!base)return null;
  const r=clampArenaRank(rank),totalPoints=arenaBaseTotalPoints(r,base.id);
  return {id:base.id,name:arenaVenueName(r),rank:r,rankName:arenaRankName(r),stagePoints:scaleStagePoints(base.stageWeights,totalPoints),totalPoints};
 }
 function difficultyById(id,rank=currentArenaRank()){const base=ARENA_POSITION_BASES.find(x=>x.id===id)||null;return difficultyForRank(base,rank);}
 function arenaDifficultyConfigs(rank=currentArenaRank()){const r=clampArenaRank(rank);return ARENA_POSITION_BASES.map(base=>{const d=difficultyForRank(base,r),positionStages=ARENA_POSITION_STAGE_CONFIGS[d.id]||ARENA_POSITION_STAGE_CONFIGS.normal,positionPhysical=ARENA_POSITION_PHYSICAL_MULTIPLIERS[d.id]||ARENA_POSITION_PHYSICAL_MULTIPLIERS.normal;return {...d,positionPhysical:{...positionPhysical},stages:positionStages.map((position,i)=>{const physical=ARENA_PHYSICAL_STAGE_PROFILE[i]||ARENA_PHYSICAL_STAGE_PROFILE[0];return {...physical,...position,effectivePhysical:{hpMul:physical.hpMul*positionPhysical.hp,damageMul:physical.damageMul*positionPhysical.damage,defMul:physical.defMul*positionPhysical.def}};})};});}
 function newContinuousSummary(){return {runs:0,fullClears:0,failedRuns:0,totalPoints:0,stopReason:null};}
 function createArenaState(overrides={}){return {phase:"select",rank:1,difficulty:null,stage:0,enemy:null,result:null,history:[],gainedPoints:0,roundPoints:0,roundBasePoints:0,playerSnapshot:null,enemyScalingSnapshot:null,vipLevelSnapshot:0,continuous:false,stopRequested:false,summary:newContinuousSummary(),...overrides};}
 let arenaState=createArenaState();

 function clampLevel(v){return clampGameLevel(v);}
 function rateFromPlayer(value,scale,add,cap,maxCap){return round1(Math.max(0,Math.min(maxCap,cap,(Number(value)||0)*scale+add)));}
 function traitCount(mode){const p=ARENA_TRAIT_COUNT_PROFILES[mode]||ARENA_TRAIT_COUNT_PROFILES.one,roll=Math.random();if(roll<p.zero)return 0;if(roll<p.zero+p.one)return 1;return 2;}
 function rollArenaTraits(mode){const pool=MONSTER_TRAIT_IDS.slice(),count=traitCount(mode),out=[];for(let i=0;i<count&&pool.length;i++)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);return out;}
 function arenaTraitNames(enemy){if(!enemy?.traits?.length)return "無";return enemy.traits.map(id=>MONSTER_TRAITS?.[id]?.name||id).join("、");}
 function difficultyClass(id){return id==="extreme"?"arena-tag-extreme":id==="hard"?"arena-tag-hard":"arena-tag-normal";}
 function stopReasonText(reason){return reason==="death"?"玩家死亡":reason==="daily-limit"?"今日競技場次數已用完":reason==="manual"?"玩家手動停止":"挑戰結束";}
 function adjustedFullClearPoints(diff){const base=Math.max(0,Math.floor(Number(diff?.totalPoints)||0));return typeof adjustVipDungeonPoints==="function"?adjustVipDungeonPoints(base):base;}

 function buildArenaEnemy(difficultyId,stageIndex,stats=null,level=null,options={}){
  const p=createSpecialPlayerSnapshot(stats||equippedStats()),base=specialBaseEnemyFromPlayer(p),positionStages=ARENA_POSITION_STAGE_CONFIGS[difficultyId]||ARENA_POSITION_STAGE_CONFIGS.normal,positionPhysical=ARENA_POSITION_PHYSICAL_MULTIPLIERS[difficultyId]||ARENA_POSITION_PHYSICAL_MULTIPLIERS.normal,idx=Math.max(0,Math.min(2,Number(stageIndex)||0)),physical=ARENA_PHYSICAL_STAGE_PROFILE[idx]||ARENA_PHYSICAL_STAGE_PROFILE[0],position=positionStages[idx]||positionStages[0],rank=clampArenaRank(options.rank??currentArenaRank()),rankScale=arenaRankMultipliers(rank),traits=Array.isArray(options.traits)?options.traits.slice():rollArenaTraits(position.traitMode);
  return applyMonsterTraits({name:ARENA_ENEMY_NAMES[idx]||"模擬對手",level:clampLevel(level||state.level),kind:"dungeon-arena",arenaDifficulty:difficultyId,arenaStage:idx,arenaRank:rank,arenaRankName:arenaRankName(rank),hp:Math.max(1,ceil(base.hp*physical.hpMul*positionPhysical.hp*rankScale.hp)),atk:Math.max(1,ceil(base.damage*physical.damageMul*positionPhysical.damage*rankScale.damage+p.def*.55)),def:Math.max(0,ceil(base.def*physical.defMul*positionPhysical.def*rankScale.def)),crit:rateFromPlayer(p.crit,position.critScale,position.critAdd,position.critCap,MONSTER_MAX_CRIT_RATE),dodge:rateFromPlayer(p.dodge,position.dodgeScale,position.dodgeAdd,position.dodgeCap,MONSTER_MAX_DODGE_RATE),playerSnapshot:p},traits);
 }

 window.ARENA_BALANCE_VERSION=6;
 window.ARENA_RANK_BALANCE_VERSION=3;
 window.ARENA_RANK_CURVE=ARENA_RANK_CURVE;
 window.getArenaRankMultipliers=function(rank){return arenaRankMultipliers(rank);};
 window.getArenaPositionPhysicalMultipliers=function(id){const key=String(id||"normal"),v=ARENA_POSITION_PHYSICAL_MULTIPLIERS[key]||ARENA_POSITION_PHYSICAL_MULTIPLIERS.normal;return {hp:v.hp,damage:v.damage,def:v.def};};
 window.getArenaPositionStageConfig=function(id,stageIndex){const key=String(id||"normal"),stages=ARENA_POSITION_STAGE_CONFIGS[key]||ARENA_POSITION_STAGE_CONFIGS.normal,idx=Math.max(0,Math.min(2,Math.floor(Number(stageIndex)||0))),v=stages[idx]||stages[0];return {...v};};
 window.getArenaTraitCountProfile=function(mode){const v=ARENA_TRAIT_COUNT_PROFILES[String(mode||"one")]||ARENA_TRAIT_COUNT_PROFILES.one;return {zero:v.zero,one:v.one,two:v.two};};
 window.getArenaDifficultyConfigs=function(rank=null){return arenaDifficultyConfigs(rank==null?currentArenaRank():rank);};
 window.buildArenaEnemyForTest=function(difficultyId,stageIndex,stats=null,level=null,rank=null){return difficultyById(difficultyId,rank==null?currentArenaRank():rank)?buildArenaEnemy(difficultyId,stageIndex,stats,level,{rank:rank==null?currentArenaRank():rank}):null;};
 window.arenaTraitNames=function(enemy){return arenaTraitNames(enemy);};
 window.getArenaCurrentRank=currentArenaRank;
 window.getArenaUnlockedRankCap=arenaUnlockedRankCap;
 window.getArenaRankName=arenaRankName;
 window.getArenaBaseTotalPoints=arenaBaseTotalPoints;
 window.getArenaRankInfo=function(rank=null){const r=clampArenaRank(rank==null?currentArenaRank():rank);return {rank:r,name:arenaRankName(r),maxRank:arenaMaxRank(),unlockedCap:arenaUnlockedRankCap(),multipliers:arenaRankMultipliers(r)};};

 function resetArenaState(){arenaState=createArenaState({rank:currentArenaRank()});}
 function arenaEnemyScalingStats(){return arenaState.enemyScalingSnapshot||createSpecialPlayerSnapshot(equippedStats());}
 function arenaPlayerStats(){if(arenaState.playerSnapshot)return arenaState.playerSnapshot;return createSpecialPlayerSnapshot(playerCombatStats(equippedStats(),state.vipLevel));}
 function arenaFightCore(enemy){const player=arenaPlayerStats(),combat=runCombatCore(player,enemy,state.hp);state.hp=combat.hp;return {win:combat.win,logs:combat.logs,e:enemy,combatEndHp:state.hp,turns:combat.turns};}
 const sleep=ms=>arenaState.continuous&&typeof window.backgroundProgressSleep==="function"?window.backgroundProgressSleep(ms,"arena"):new Promise(r=>setTimeout(r,ms));
 function stopArenaBackground(){if(typeof window.backgroundProgressStop==="function")window.backgroundProgressStop("arena");}
 function healAfterRound(){if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});else state.hp=playerCombatStats().hp;save(false);}
 function beginArenaRound(options={}){
  const use=typeof consumeDailyDungeonUse==="function"?consumeDailyDungeonUse("arena",1):{ok:false,reason:"daily_core_missing"};
  if(!use.ok)return false;
  save(false);
  const preservePreview=options.preservePreview===true,previewTraits=preservePreview&&Array.isArray(arenaState.enemy?.traits)?arenaState.enemy.traits.slice():null,enemyScaling=createSpecialPlayerSnapshot(equippedStats()),vipLevel=Math.max(0,Math.floor(Number(state.vipLevel)||0)),player=createSpecialPlayerSnapshot(playerCombatStats(enemyScaling,vipLevel));
  arenaState.enemyScalingSnapshot=enemyScaling;arenaState.vipLevelSnapshot=vipLevel;arenaState.playerSnapshot=player;arenaState.stage=0;arenaState.roundPoints=0;arenaState.roundBasePoints=0;arenaState.history=[];arenaState.result=null;arenaState.enemy=buildArenaEnemy(arenaState.difficulty.id,0,enemyScaling,state.level,{traits:previewTraits||undefined,rank:arenaState.rank});state.hp=player.hp;arenaState.phase="combat";render();sleep(80).then(runArenaFight);return true;
 }

 window.openArenaDungeon=function(){if((Number(state.level)||1)<15){view="dungeon";render();return;}if(typeof clearArenaVenueSelection==="function")clearArenaVenueSelection();resetArenaState();view="dungeon-arena";render();};
 window.startArenaDungeon=function(difficultyId){if((Number(state.level)||1)<15)return;const rank=currentArenaRank(),difficulty=difficultyById(difficultyId,rank);if(!difficulty)return;if(dailyStatus().remaining<=0){view="dungeon-arena";resetArenaState();render();return;}arenaState=createArenaState({phase:"ready",rank,difficulty,enemy:buildArenaEnemy(difficulty.id,0,null,null,{rank})});view="dungeon-arena";render();};

 function collectStageBasePoints(stageIndex){const basePoints=Math.max(0,Math.floor(Number(arenaState.difficulty?.stagePoints?.[stageIndex])||0));arenaState.roundBasePoints+=basePoints;return basePoints;}
 function creditRoundPoints(){
  const base=Math.max(0,Math.floor(Number(arenaState.roundBasePoints)||0));
  const awarded=base>0&&typeof addDungeonPoints==="function"?addDungeonPoints(base):{added:base,baseAdded:base};
  const actual=Math.max(0,Math.floor(Number(awarded?.added)||0));
  arenaState.roundPoints=actual;arenaState.gainedPoints+=actual;
  return {base,actual};
 }

 window.startArenaStageFight=function(continuous=false){if(arenaState.phase!=="ready"||!arenaState.enemy||battleBusy||dailyStatus().remaining<=0)return;arenaState.continuous=continuous===true;arenaState.stopRequested=false;arenaState.summary=newContinuousSummary();arenaState.gainedPoints=0;if(arenaState.continuous&&typeof window.backgroundProgressStart==="function")window.backgroundProgressStart("arena",{mode:"continuous"});if(!beginArenaRound({preservePreview:true})){stopArenaBackground();view="dungeon-arena";resetArenaState();render();}};
 window.requestArenaContinuousStop=function(){if(!arenaState.continuous||arenaState.phase!=="combat")return;arenaState.stopRequested=true;const btn=document.getElementById("arenaContinuousStop");if(btn){btn.textContent="本輪結束後停止";btn.disabled=true;}};

 async function animateArena(result,startHp,playerMax){
  if(typeof window.animateStructuredCombatPresentation!=="function")throw new Error("Structured Combat Presentation 未載入。");
  const eventCount=window.getCombatPresentationSnapshot?.()?.eventCount||0;
  const stepDelay=eventCount>120?24:eventCount>70?38:72;
  await window.animateStructuredCombatPresentation(result,{mode:"arena",openingDelay:110,impactDelay:65,stepDelay,endDelay:150,clearAfter:true,clearReason:"arena-stage-end"});
 }

 window.ARENA_COMBAT_MARK_PRESENTATION_VERSION=1;
 async function runArenaFight(){
  if(battleBusy)return;
  battleBusy=true;
  try{
   while(arenaState.phase==="combat"&&arenaState.enemy){
    const stageIndex=arenaState.stage,enemy=arenaState.enemy,startHp=state.hp,playerMax=arenaPlayerStats().hp,result=arenaFightCore(enemy);
    await animateArena(result,startHp,playerMax);
    const baseStagePoints=result.win?collectStageBasePoints(stageIndex):0;
    arenaState.history.push({stage:stageIndex,win:!!result.win,startHp,endHp:result.combatEndHp,turns:result.turns,baseStagePoints,enemy:{...enemy}});
    if(!result.win||stageIndex>=2){
     const fullClear=!!result.win&&stageIndex>=2,credited=creditRoundPoints();
     arenaState.result={type:fullClear?"clear":"defeat",stage:stageIndex,combatEndHp:result.combatEndHp,turns:result.turns,basePoints:credited.base,points:credited.actual};
     healAfterRound();
     if(arenaState.continuous){
      arenaState.summary.runs++;if(fullClear)arenaState.summary.fullClears++;else arenaState.summary.failedRuns++;arenaState.summary.totalPoints+=credited.actual;
      const ds=dailyStatus();
      if(!fullClear)arenaState.summary.stopReason="death";else if(arenaState.stopRequested)arenaState.summary.stopReason="manual";else if(ds.remaining<=0)arenaState.summary.stopReason="daily-limit";
      if(arenaState.summary.stopReason){stopArenaBackground();arenaState.phase="result";render();break;}
      await sleep(300);
      if(!beginArenaRound({preservePreview:false})){stopArenaBackground();arenaState.summary.stopReason="daily-limit";arenaState.phase="result";render();break;}
      break;
     }
     arenaState.phase="result";render();break;
    }
    save(false);arenaState.stage=stageIndex+1;arenaState.enemy=buildArenaEnemy(arenaState.difficulty.id,arenaState.stage,arenaEnemyScalingStats(),state.level,{rank:arenaState.rank});arenaState.result=null;render();await sleep(450);
   }
  }finally{battleBusy=false;}
 }

 function selectionHtml(){
  if(typeof window.renderArenaVenueSelectionHtml==="function")return window.renderArenaVenueSelectionHtml();
  const ds=dailyStatus();
  return `<div class="function-page dungeon-page-shell arena-shell"><div class="back-home"><button class="btn back-btn" onclick="go('dungeon')">← 返回副本</button></div><section class="arena-panel"><div class="arena-title">競技場</div><div class="arena-attempts">今日競技場：<strong>${ds.used} / ${ds.limit}</strong>・剩餘 ${ds.remaining} 輪</div><div class="notice">競技場選擇介面載入中。</div></section></div>`;
 }
 function progressStrip(){return `<div class="arena-progress-strip">${[0,1,2].map(i=>`<div class="arena-progress-step ${i<arenaState.stage?"done":i===arenaState.stage?"current":""}"><span>${i+1}</span>${ARENA_STAGE_NAMES[i]}</div>`).join("")}</div>`;}
 function readyHtml(){
  const d=arenaState.difficulty,ds=dailyStatus(),base=Math.max(0,Math.floor(Number(d?.totalPoints)||0)),actual=adjustedFullClearPoints(d),rewardText=actual!==base?`${actual} VIP 積分（基礎 ${base}）`:`${base} VIP 積分`;
  return `<div class="function-page dungeon-page-shell arena-shell"><section class="arena-panel arena-ready-panel"><div class="arena-title">${d?.name||"競技場"}</div><div class="arena-attempts">今日競技場：<strong>${ds.used} / ${ds.limit}</strong>・剩餘 ${ds.remaining} 輪</div>${progressStrip()}<div class="arena-stage-label">三戰挑戰</div><h2>${arenaState.enemy?.name||"模擬對手"}</h2><div class="arena-traits">第一戰特性：${arenaTraitNames(arenaState.enemy)}</div><div class="arena-carry">每輪自動進行三戰，場間不回血；新一輪開始會重新滿血。正式開始一輪才使用 1 次今日額度。</div><div class="arena-earned">全通可獲得：${rewardText}</div><div class="controls arena-actions"><button class="btn arena-start-btn" ${ds.remaining>0?"":"disabled"} onclick="startArenaStageFight(false)">單次挑戰</button><button class="btn primary arena-start-btn" ${ds.remaining>0?"":"disabled"} onclick="startArenaStageFight(true)">連續挑戰</button></div></section></div>`;
 }
 function combatHtml(){const e=arenaState.enemy,s=arenaPlayerStats(),d=arenaState.difficulty,stage=arenaState.stage,traits=typeof combatTraitBadgesHtml==="function"?combatTraitBadgesHtml(e?.traits):"",stop=arenaState.continuous?`<div class="controls arena-actions"><button id="arenaContinuousStop" class="btn" onclick="requestArenaContinuousStop()">${arenaState.stopRequested?"本輪結束後停止":"停止連續挑戰"}</button></div>`:"";return `<section class="combat-screen arena-combat"><div class="combat-head arena-combat-head">【競技場】 ${d?.name||""}・${ARENA_STAGE_NAMES[stage]}${arenaState.continuous?"・連續挑戰":""}</div><div class="arena-progress-wrap">${progressStrip()}</div><div class="combat-arena"><div class="combatant player arena-player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${escapePlayerName(currentPlayerName())} Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${Math.max(0,Math.min(100,state.hp/s.hp*100))}%"></span></div></div></div><div class="combat-vs arena-vs">VS</div><div class="combatant enemy arena-enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><div class="${difficultyClass(d?.id)} arena-combat-tier">競技場對手</div><h2 id="combatEnemyName">${e.name}</h2>${traits}<div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message arena-message" id="combatMessage">準備戰鬥</div>${stop}</section>`;}
 function continuousResultHtml(){const diff=arenaState.difficulty,s=arenaState.summary,ds=dailyStatus();return `<div class="function-page dungeon-page-shell arena-shell"><section class="arena-panel arena-result-panel"><div class="arena-title">競技場連續挑戰結算</div><div class="${difficultyClass(diff?.id)} arena-result-difficulty">${diff?.name||arenaVenueName(arenaState.rank)}</div><div class="arena-clear-count">共完成：${s.runs} 輪・全通 ${s.fullClears} 輪・失敗 ${s.failedRuns} 輪</div><div class="arena-total-earned">總獲得 VIP 積分：<strong>${s.totalPoints}</strong></div><div class="arena-current-points">停止原因：${stopReasonText(s.stopReason)}</div><div class="arena-current-points">目前 VIP 積分：${Math.floor(Number(state.vipPoints)||0)}</div><div class="arena-current-points">今日競技場：${ds.used} / ${ds.limit}・剩餘 ${ds.remaining} 輪</div><div class="controls arena-actions"><button class="btn" onclick="go('dungeon')">返回副本</button></div></section></div>`;}
 function resultHtml(){
  if(arenaState.continuous)return continuousResultHtml();
  const r=arenaState.result||{},diff=arenaState.difficulty,ds=dailyStatus(),title=r.type==="clear"?"競技場三戰完成":"競技場挑戰失敗",cleared=arenaState.history.filter(x=>x.win).length,rows=arenaState.history.map((h,i)=>`<div class="arena-result-row"><span>${ARENA_STAGE_NAMES[i]}</span><span>${h.win?`通過　基礎 +${h.baseStagePoints||0}`:"失敗"}</span></div>`).join("");
  return `<div class="function-page dungeon-page-shell arena-shell"><section class="arena-panel arena-result-panel"><div class="arena-title">${title}</div><div class="${difficultyClass(diff?.id)} arena-result-difficulty">${diff?.name||arenaVenueName(arenaState.rank)}</div><div class="arena-clear-count">已通過：${cleared} / 3 戰</div><div class="arena-result-list">${rows}</div><div class="arena-total-earned">本次獲得 VIP 積分：<strong>${arenaState.roundPoints}</strong></div><div class="arena-current-points">目前 VIP 積分：${Math.floor(Number(state.vipPoints)||0)}</div><div class="arena-current-points">今日競技場：${ds.used} / ${ds.limit}・剩餘 ${ds.remaining} 輪</div><div class="controls arena-actions"><button class="btn arena-start-btn" ${ds.remaining>0?"":"disabled"} onclick="${ds.remaining>0?"openArenaDungeon()":"void(0)"}">${ds.remaining>0?"再次選擇競技場":"今日競技場次數已用完"}</button><button class="btn" onclick="go('dungeon')">返回副本</button></div></section></div>`;
 }

 window.renderArenaDungeon=function(){if(arenaState.phase==="select")return selectionHtml();if(arenaState.phase==="combat")return combatHtml();if(arenaState.phase==="result")return resultHtml();return readyHtml();};
 window.getArenaCoreState=function(){const assessment=typeof window.getArenaAssessmentStatus==="function"?window.getArenaAssessmentStatus():null;return {phase:arenaState.phase,rank:arenaState.rank,rankName:arenaRankName(arenaState.rank),difficulty:arenaState.difficulty?{...arenaState.difficulty,stagePoints:arenaState.difficulty.stagePoints.slice()}:null,stage:arenaState.stage,enemy:arenaState.enemy?{...arenaState.enemy}:null,result:arenaState.result?{...arenaState.result}:null,gainedPoints:arenaState.gainedPoints,roundPoints:arenaState.roundPoints,roundBasePoints:arenaState.roundBasePoints,continuous:arenaState.continuous,stopRequested:arenaState.stopRequested,summary:{...arenaState.summary},daily:dailyStatus(),playerSnapshot:arenaState.playerSnapshot?{...arenaState.playerSnapshot}:null,enemyScalingSnapshot:arenaState.enemyScalingSnapshot?{...arenaState.enemyScalingSnapshot}:null,vipLevelSnapshot:arenaState.vipLevelSnapshot||0,assessment,history:arenaState.history.map(x=>({...x,enemy:x.enemy?{...x.enemy}:null}))};};
})();