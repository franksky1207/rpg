(function(){
 const ARENA_DIFFICULTIES=[
  {id:"normal",name:"普通競技場",stagePoints:[25,35,120],totalPoints:180},
  {id:"hard",name:"困難競技場",stagePoints:[35,45,200],totalPoints:280},
  {id:"extreme",name:"極限競技場",stagePoints:[40,60,320],totalPoints:420}
 ];
 const ARENA_STAGE_NAMES=["第一戰","第二戰","第三戰"];
 const ARENA_ENEMY_NAMES=["基礎模擬單元","戰術強化單元","極限測試平台"];

 const ARENA_STAGE_CONFIGS={
  normal:[
   {hpMul:.60,damageMul:.57,defMul:.78,critScale:.25,critAdd:0,critCap:5,dodgeScale:.20,dodgeAdd:0,dodgeCap:4,traitMode:"normal1"},
   {hpMul:.69,damageMul:.64,defMul:.80,critScale:.35,critAdd:0,critCap:7,dodgeScale:.30,dodgeAdd:0,dodgeCap:6,traitMode:"normal2"},
   {hpMul:.78,damageMul:.73,defMul:.82,critScale:.45,critAdd:0,critCap:9,dodgeScale:.40,dodgeAdd:0,dodgeCap:8,traitMode:"one"}
  ],
  hard:[
   {hpMul:.64,damageMul:.57,defMul:.80,critScale:.40,critAdd:0,critCap:8,dodgeScale:.35,dodgeAdd:0,dodgeCap:7,traitMode:"one"},
   {hpMul:.70,damageMul:.63,defMul:.83,critScale:.55,critAdd:1,critCap:12,dodgeScale:.50,dodgeAdd:1,dodgeCap:10,traitMode:"one"},
   {hpMul:.78,damageMul:.70,defMul:.85,critScale:.70,critAdd:2,critCap:16,dodgeScale:.65,dodgeAdd:1,dodgeCap:14,traitMode:"hard3"}
  ],
  extreme:[
   {hpMul:.63,damageMul:.56,defMul:.80,critScale:.55,critAdd:1,critCap:12,dodgeScale:.50,dodgeAdd:1,dodgeCap:10,traitMode:"one"},
   {hpMul:.70,damageMul:.61,defMul:.83,critScale:.75,critAdd:2,critCap:18,dodgeScale:.70,dodgeAdd:1,dodgeCap:15,traitMode:"extreme2"},
   {hpMul:.80,damageMul:.69,defMul:.86,critScale:.90,critAdd:3,critCap:23,dodgeScale:.85,dodgeAdd:2,dodgeCap:20,traitMode:"extreme3"}
  ]
 };

 function createArenaState(overrides={}){
  return {phase:"select",difficulty:null,stage:0,enemy:null,result:null,history:[],gainedPoints:0,playerSnapshot:null,enemyScalingSnapshot:null,vipLevelSnapshot:0,...overrides};
 }
 let arenaState=createArenaState();

 function difficultyById(id){return ARENA_DIFFICULTIES.find(x=>x.id===id)||null;}
 function clampLevel(v){return clampGameLevel(v);}
 function rateFromPlayer(value,scale,add,cap,maxCap){return round1(Math.max(0,Math.min(maxCap,cap,(Number(value)||0)*scale+add)));}
 function traitCount(mode){
  if(mode==="normal1")return Math.random()<.70?0:1;
  if(mode==="normal2")return Math.random()<.50?0:1;
  if(mode==="hard3")return Math.random()<.75?1:2;
  if(mode==="extreme2")return Math.random()<.60?1:2;
  if(mode==="extreme3")return Math.random()<.50?1:2;
  return 1;
 }
 function rollArenaTraits(mode){
  const pool=MONSTER_TRAIT_IDS.slice(),count=traitCount(mode),out=[];
  for(let i=0;i<count&&pool.length;i++)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  return out;
 }
 function arenaTraitNames(enemy){
  if(!enemy?.traits?.length)return "無";
  return enemy.traits.map(id=>MONSTER_TRAITS?.[id]?.name||id).join("、");
 }
 function difficultyClass(id){return id==="extreme"?"arena-tag-extreme":id==="hard"?"arena-tag-hard":"arena-tag-normal";}

 function buildArenaEnemy(difficultyId,stageIndex,stats=null,level=null,options={}){
  const p=createSpecialPlayerSnapshot(stats||equippedStats());
  const base=specialBaseEnemyFromPlayer(p);
  const stages=ARENA_STAGE_CONFIGS[difficultyId]||ARENA_STAGE_CONFIGS.normal;
  const idx=Math.max(0,Math.min(2,Number(stageIndex)||0));
  const cfg=stages[idx]||stages[0];
  const traits=Array.isArray(options.traits)?options.traits.slice():rollArenaTraits(cfg.traitMode);
  const enemy={
   name:ARENA_ENEMY_NAMES[idx]||"模擬對手",
   level:clampLevel(level||state.level),kind:"dungeon-arena",arenaDifficulty:difficultyId,arenaStage:idx,
   hp:Math.max(1,ceil(base.hp*cfg.hpMul)),
   atk:Math.max(1,ceil(base.damage*cfg.damageMul+p.def*.55)),
   def:Math.max(0,ceil(base.def*cfg.defMul)),
   crit:rateFromPlayer(p.crit,cfg.critScale,cfg.critAdd,cfg.critCap,MONSTER_MAX_CRIT_RATE),
   dodge:rateFromPlayer(p.dodge,cfg.dodgeScale,cfg.dodgeAdd,cfg.dodgeCap,MONSTER_MAX_DODGE_RATE),
   playerSnapshot:p
  };
  return applyMonsterTraits(enemy,traits);
 }

 window.getArenaDifficultyConfigs=function(){return ARENA_DIFFICULTIES.map(d=>({...d,stagePoints:d.stagePoints.slice(),stages:(ARENA_STAGE_CONFIGS[d.id]||[]).map(x=>({...x}))}));};
 window.buildArenaEnemyForTest=function(difficultyId,stageIndex,stats=null,level=null){return difficultyById(difficultyId)?buildArenaEnemy(difficultyId,stageIndex,stats,level):null;};
 window.arenaTraitNames=function(enemy){return arenaTraitNames(enemy);};

 function resetArenaState(){arenaState=createArenaState();}
 function arenaEnemyScalingStats(){return arenaState.enemyScalingSnapshot||createSpecialPlayerSnapshot(equippedStats());}
 function arenaPlayerStats(){
  if(arenaState.playerSnapshot)return arenaState.playerSnapshot;
  return createSpecialPlayerSnapshot(playerCombatStats(equippedStats(),state.vipLevel));
 }
 function arenaFightCore(enemy){
  const player=arenaPlayerStats();
  const combat=runCombatCore(player,enemy,state.hp);
  state.hp=combat.hp;
  return {win:combat.win,logs:combat.logs,e:enemy,combatEndHp:state.hp,turns:combat.turns};
 }

 window.openArenaDungeon=function(){
  if((Number(state.level)||1)<15){view="dungeon";render();return;}
  resetArenaState();view="dungeon-arena";render();
 };
 window.startArenaDungeon=function(difficultyId){
  if((Number(state.level)||1)<15)return;
  const difficulty=difficultyById(difficultyId);if(!difficulty)return;
  if(!canStartDungeonRun(1)){view="dungeon";render();return;}
  arenaState=createArenaState({phase:"ready",difficulty,enemy:buildArenaEnemy(difficulty.id,0)});
  view="dungeon-arena";render();
 };

 function awardStagePoints(stageIndex){
  const points=Math.floor(Number(arenaState.difficulty?.stagePoints?.[stageIndex])||0);
  if(points>0)addDungeonPoints(points);
  arenaState.gainedPoints+=points;
  return points;
 }

 window.startArenaStageFight=function(){
  if(arenaState.phase!=="ready"||!arenaState.enemy||battleBusy)return;
  const previewTraits=Array.isArray(arenaState.enemy.traits)?arenaState.enemy.traits.slice():[];
  const enemyScaling=createSpecialPlayerSnapshot(equippedStats());
  const vipLevel=Math.max(0,Math.floor(Number(state.vipLevel)||0));
  const player=createSpecialPlayerSnapshot(playerCombatStats(enemyScaling,vipLevel));
  const started=beginDungeonRun({mode:"arena",cost:1});
  if(!started.ok){view="dungeon";resetArenaState();render();return;}
  arenaState.enemyScalingSnapshot=enemyScaling;
  arenaState.vipLevelSnapshot=vipLevel;
  arenaState.playerSnapshot=player;
  arenaState.stage=0;
  arenaState.enemy=buildArenaEnemy(arenaState.difficulty.id,0,enemyScaling,state.level,{traits:previewTraits});
  state.hp=player.hp;
  arenaState.phase="combat";
  render();
  setTimeout(runArenaFight,80);
 };

 function setHpUi(enemyHp,enemyMax,playerHp,playerMax,message){
  const eb=document.getElementById("combatEnemyBar"),eh=document.getElementById("combatEnemyHp"),pb=document.getElementById("combatPlayerBar"),ph=document.getElementById("combatPlayerHp"),msg=document.getElementById("combatMessage");
  if(eb)eb.style.width=`${Math.max(0,Math.min(100,enemyHp/enemyMax*100))}%`;
  if(eh)eh.textContent=`${Math.max(0,enemyHp)} / ${enemyMax}`;
  if(pb)pb.style.width=`${Math.max(0,Math.min(100,playerHp/playerMax*100))}%`;
  if(ph)ph.textContent=`${Math.max(0,playerHp)} / ${playerMax}`;
  if(msg)msg.textContent=message||"";
 }
 function pulse(target,text){
  const card=document.getElementById(target==="enemy"?"combatEnemyCard":"combatPlayerCard"),dmg=document.getElementById(target==="enemy"?"combatEnemyDamage":"combatPlayerDamage");
  if(card&&text!=="閃避"){card.classList.remove("hit");void card.offsetWidth;card.classList.add("hit");setTimeout(()=>card.classList.remove("hit"),260);}
  if(dmg){dmg.textContent=text;dmg.classList.remove("show");void dmg.offsetWidth;dmg.classList.add("show");}
 }
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 async function animateArena(result,startHp,playerMax){
  let ehp=result.e.hp,php=startHp;
  const delay=result.logs.length>80?20:result.logs.length>40?40:75;
  setHpUi(ehp,result.e.hp,php,playerMax,"戰鬥開始");await sleep(120);
  for(const line of result.logs){
   let m=line.match(/^你攻擊.+，(?:暴擊)?造成 (\d+) 點傷害。$/);
   if(m){const d=Number(m[1]);ehp=Math.max(0,ehp-d);pulse("enemy",line.includes("暴擊")?`暴擊 ${d}`:`-${d}`);setHpUi(ehp,result.e.hp,php,playerMax,line);await sleep(delay);continue;}
   if(line.includes("閃避了你的攻擊")){pulse("enemy","閃避");setHpUi(ehp,result.e.hp,php,playerMax,line);await sleep(delay);continue;}
   m=line.match(/^.+攻擊你，(?:暴擊)?造成 (\d+) 點傷害。$/);
   if(m){const d=Number(m[1]);php=Math.max(0,php-d);pulse("player",line.includes("暴擊")?`暴擊 ${d}`:`-${d}`);setHpUi(ehp,result.e.hp,php,playerMax,line);await sleep(delay);continue;}
   if(line.includes("你閃避了攻擊")){pulse("player","閃避");setHpUi(ehp,result.e.hp,php,playerMax,line);await sleep(delay);continue;}
   setHpUi(ehp,result.e.hp,php,playerMax,line);await sleep(delay);
  }
 }

 async function runArenaFight(){
  if(battleBusy)return;
  battleBusy=true;
  try{
   while(arenaState.phase==="combat"&&arenaState.enemy){
    const stageIndex=arenaState.stage,enemy=arenaState.enemy,startHp=state.hp,playerMax=arenaPlayerStats().hp;
    const result=arenaFightCore(enemy);
    await animateArena(result,startHp,playerMax);
    let stagePoints=0;
    if(result.win)stagePoints=awardStagePoints(stageIndex);
    arenaState.history.push({stage:stageIndex,win:!!result.win,startHp,endHp:result.combatEndHp,turns:result.turns,stagePoints,enemy:{...enemy}});

    if(!result.win||stageIndex>=2){
     arenaState.result={type:result.win?"clear":"defeat",stage:stageIndex,combatEndHp:result.combatEndHp,turns:result.turns,stagePoints};
     arenaState.phase="result";
     finishDungeonRun();
     render();
     break;
    }

    save(false);
    arenaState.stage=stageIndex+1;
    arenaState.enemy=buildArenaEnemy(arenaState.difficulty.id,arenaState.stage,arenaEnemyScalingStats(),state.level);
    arenaState.result=null;
    render();
    await sleep(450);
   }
  }finally{
   battleBusy=false;
  }
 }

 function selectionHtml(){
  const d=ensureDungeonProgressState();
  const cards=ARENA_DIFFICULTIES.map(x=>`<button class="arena-difficulty-card ${difficultyClass(x.id)}" ${d.attempts>0?"":"disabled"} onclick="${d.attempts>0?`startArenaDungeon('${x.id}')`:"void(0)"}"><b>${x.name}</b><span>三戰全通 ${x.totalPoints} VIP 積分</span><small>${x.stagePoints.join(" + ")}</small></button>`).join("");
  return `<div class="function-page dungeon-page-shell arena-shell"><div class="back-home"><button class="btn back-btn" onclick="go('dungeon')">← 返回副本</button></div><section class="arena-panel"><div class="arena-title">競技場</div><div class="arena-subtitle">三場連續戰鬥，場與場之間不回血</div><div class="arena-attempts">目前可挑戰次數：<strong>${d.attempts}</strong> 次</div><div class="arena-difficulty-grid">${cards}</div></section></div>`;
 }
 function progressStrip(){
  return `<div class="arena-progress-strip">${[0,1,2].map(i=>`<div class="arena-progress-step ${i<arenaState.stage?"done":i===arenaState.stage?"current":""}"><span>${i+1}</span>${ARENA_STAGE_NAMES[i]}</div>`).join("")}</div>`;
 }
 function readyHtml(){
  const s=arenaPlayerStats(),d=arenaState.difficulty;
  return `<div class="function-page dungeon-page-shell arena-shell"><section class="arena-panel arena-ready-panel"><div class="arena-title">${d?.name||"競技場"}</div>${progressStrip()}<div class="arena-stage-label">三戰挑戰</div><h2>${arenaState.enemy?.name||"模擬對手"}</h2><div class="arena-traits">第一戰特性：${arenaTraitNames(arenaState.enemy)}</div><div class="arena-player-hp">目前 HP：<strong>${state.hp} / ${s.hp}</strong></div><div class="arena-carry">開始後將自動連續進行三戰，場間不回血。</div><div class="arena-earned">全通可獲得：${d?.totalPoints||0} VIP 積分</div><div class="controls arena-actions"><button class="btn arena-start-btn" onclick="startArenaStageFight()">開始三戰</button></div></section></div>`;
 }
 function combatHtml(){
  const e=arenaState.enemy,s=arenaPlayerStats(),d=arenaState.difficulty,stage=arenaState.stage;
  return `<section class="combat-screen arena-combat"><div class="combat-head arena-combat-head">【競技場】 ${d?.name||""}・${ARENA_STAGE_NAMES[stage]}</div><div class="arena-progress-wrap">${progressStrip()}</div><div class="combat-arena"><div class="combatant player arena-player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${escapePlayerName(currentPlayerName())} Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${Math.max(0,Math.min(100,state.hp/s.hp*100))}%"></span></div></div></div><div class="combat-vs arena-vs">VS</div><div class="combatant enemy arena-enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><div class="${difficultyClass(d?.id)} arena-combat-tier">${d?.name||""}</div><h2 id="combatEnemyName">${e.name}</h2><div class="arena-traits">特性：${arenaTraitNames(e)}</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message arena-message" id="combatMessage">準備戰鬥</div></section>`;
 }
 function resultHtml(){
  const d=ensureDungeonProgressState(),r=arenaState.result||{},diff=arenaState.difficulty;
  const title=r.type==="clear"?"競技場三戰完成":"競技場挑戰失敗";
  const cleared=arenaState.history.filter(x=>x.win).length;
  const rows=arenaState.history.map((h,i)=>`<div class="arena-result-row"><span>${ARENA_STAGE_NAMES[i]}</span><span>${h.win?`通過　+${h.stagePoints||0}`:"失敗"}</span></div>`).join("");
  return `<div class="function-page dungeon-page-shell arena-shell"><section class="arena-panel arena-result-panel"><div class="arena-title">${title}</div><div class="${difficultyClass(diff?.id)} arena-result-difficulty">${diff?.name||""}</div><div class="arena-clear-count">已通過：${cleared} / 3 戰</div><div class="arena-result-list">${rows}</div><div class="arena-total-earned">本次獲得 VIP 積分：<strong>${arenaState.gainedPoints}</strong></div><div class="arena-current-points">目前 VIP 積分：${Math.floor(Number(state.vipPoints)||0)}</div><div class="arena-current-points">剩餘可挑戰次數：${d.attempts} 次</div><div class="controls arena-actions"><button class="btn arena-start-btn" onclick="openArenaDungeon()">再次選擇競技場</button><button class="btn" onclick="go('dungeon')">返回副本</button></div></section></div>`;
 }

 window.renderArenaDungeon=function(){if(arenaState.phase==="select")return selectionHtml();if(arenaState.phase==="combat")return combatHtml();if(arenaState.phase==="result")return resultHtml();return readyHtml();};
 window.getArenaCoreState=function(){return {phase:arenaState.phase,difficulty:arenaState.difficulty?{...arenaState.difficulty,stagePoints:arenaState.difficulty.stagePoints.slice()}:null,stage:arenaState.stage,enemy:arenaState.enemy?{...arenaState.enemy}:null,result:arenaState.result?{...arenaState.result}:null,gainedPoints:arenaState.gainedPoints,playerSnapshot:arenaState.playerSnapshot?{...arenaState.playerSnapshot}:null,enemyScalingSnapshot:arenaState.enemyScalingSnapshot?{...arenaState.enemyScalingSnapshot}:null,vipLevelSnapshot:arenaState.vipLevelSnapshot||0,history:arenaState.history.map(x=>({...x,enemy:x.enemy?{...x.enemy}:null}))};};
})();