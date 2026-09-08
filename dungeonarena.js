(function(){
 const ARENA_DIFFICULTIES=[
  {id:"normal",name:"普通競技場"},
  {id:"hard",name:"困難競技場"},
  {id:"extreme",name:"極限競技場"}
 ];
 const ARENA_STAGE_NAMES=["第一戰","第二戰","第三戰"];
 const ARENA_ENEMY_NAMES=["競技場鬥士","競技場戰士","競技場勇士"];

 // Batch 6-1 only: temporary core-flow multipliers.
 // Do not treat these as final balance. Batch 6-2 will replace them with the formal 3x3 configs.
 const ARENA_CORE_PLACEHOLDER={
  normal:[.56,.64,.72],
  hard:[.64,.72,.80],
  extreme:[.72,.80,.88]
 };

 let arenaState={phase:"select",difficulty:null,stage:0,enemy:null,result:null,history:[]};

 function difficultyById(id){return ARENA_DIFFICULTIES.find(x=>x.id===id)||null;}
 function playerSnapshot(){return createSpecialPlayerSnapshot(equippedStats());}
 function clampLevel(v){return Math.max(1,Math.min(50,Math.floor(Number(v)||1)));}

 function buildCoreEnemy(difficultyId,stageIndex){
  const p=playerSnapshot();
  const base=specialBaseEnemyFromPlayer(p);
  const stages=ARENA_CORE_PLACEHOLDER[difficultyId]||ARENA_CORE_PLACEHOLDER.normal;
  const mul=stages[Math.max(0,Math.min(2,stageIndex))]||stages[0];
  return {
   name:ARENA_ENEMY_NAMES[stageIndex]||"競技場敵人",
   level:clampLevel(state.level),
   kind:"dungeon-arena",
   arenaDifficulty:difficultyId,
   arenaStage:stageIndex,
   hp:Math.max(1,ceil(base.hp*mul)),
   atk:Math.max(1,ceil(base.damage*mul+p.def*.55)),
   def:Math.max(0,ceil(base.def*.78)),
   crit:0,
   dodge:0,
   traits:[],
   berserk:false
  };
 }

 function resetArenaState(){
  arenaState={phase:"select",difficulty:null,stage:0,enemy:null,result:null,history:[]};
 }

 window.openArenaDungeon=function(){
  if((Number(state.level)||1)<15){view="dungeon";render();return;}
  resetArenaState();
  view="dungeon-arena";
  render();
 };

 window.startArenaDungeon=function(difficultyId){
  if((Number(state.level)||1)<15)return;
  const difficulty=difficultyById(difficultyId);
  if(!difficulty)return;
  const started=beginDungeonRun({mode:"arena",cost:1});
  if(!started.ok){view="dungeon";render();return;}
  arenaState={phase:"ready",difficulty,stage:0,enemy:buildCoreEnemy(difficulty.id,0),result:null,history:[]};
  view="dungeon-arena";
  render();
 };

 window.runArenaStage=function(){
  if(arenaState.phase!=="ready"||!arenaState.enemy||battleBusy)return;
  battleBusy=true;
  const stageIndex=arenaState.stage;
  const enemy=arenaState.enemy;
  const startHp=state.hp;
  const result=dungeonFightCore(enemy);
  arenaState.history.push({
   stage:stageIndex,
   win:!!result.win,
   turnLimit:!!result.turnLimit,
   startHp,
   endHp:result.combatEndHp,
   turns:result.turns,
   enemy:{...enemy}
  });

  if(result.win&&stageIndex<2){
   arenaState.stage=stageIndex+1;
   arenaState.enemy=buildCoreEnemy(arenaState.difficulty.id,arenaState.stage);
   arenaState.result={type:"stage_win",stage:stageIndex};
   arenaState.phase="ready";
   // Intentionally no heal here. HP carries into the next arena fight.
   save(false);
  }else{
   arenaState.result={
    type:result.win?"clear":result.turnLimit?"timeout":"defeat",
    stage:stageIndex,
    combatEndHp:result.combatEndHp,
    turns:result.turns
   };
   arenaState.phase="result";
   // Formal arena run ends here; end-of-run heal is allowed by dungeon common rules.
   finishDungeonRun();
  }
  battleBusy=false;
  render();
 };

 function selectionHtml(){
  const d=ensureDungeonProgressState();
  return `<div class="function-page dungeon-page-shell">
   <div class="back-home"><button class="btn back-btn" onclick="go('dungeon')">← 返回副本</button></div>
   <section class="card"><h2>競技場</h2><div class="muted">三場連續戰鬥；只有正式開始時才消耗 1 次副本可挑戰次數。</div><div class="notice" style="margin-top:10px">目前可挑戰次數：${d.attempts} 次</div>
   <div class="controls" style="margin-top:12px">
    ${ARENA_DIFFICULTIES.map(x=>`<button class="btn" ${d.attempts>0?"":"disabled"} onclick="${d.attempts>0?`startArenaDungeon('${x.id}')`:"void(0)"}">${x.name}</button>`).join("")}
   </div></section>
  </div>`;
 }

 function readyHtml(){
  const s=equippedStats();
  const stage=arenaState.stage;
  const previous=arenaState.history.length?`<div class="notice" style="margin-top:10px">上一戰已通過，目前 HP ${state.hp} / ${s.hp}；不會自動回血。</div>`:"";
  return `<div class="function-page dungeon-page-shell"><section class="card">
   <h2>競技場｜${arenaState.difficulty?.name||""}</h2>
   <div class="notice">${ARENA_STAGE_NAMES[stage]} / 共三戰</div>
   <div style="margin-top:10px"><b>${arenaState.enemy?.name||"競技場敵人"}</b></div>
   <div class="muted" style="margin-top:6px">玩家 HP：${state.hp} / ${s.hp}</div>${previous}
   <div class="controls" style="margin-top:14px"><button class="btn primary" onclick="runArenaStage()">開始${ARENA_STAGE_NAMES[stage]}</button></div>
  </section></div>`;
 }

 function resultHtml(){
  const d=ensureDungeonProgressState();
  const r=arenaState.result||{};
  const title=r.type==="clear"?"競技場三戰完成":r.type==="timeout"?"競技場挑戰未完成":"競技場挑戰失敗";
  const cleared=arenaState.history.filter(x=>x.win).length;
  return `<div class="function-page dungeon-page-shell"><section class="card">
   <h2>${title}</h2>
   <div class="notice">已通過：${cleared} / 3 戰</div>
   <div class="muted" style="margin-top:8px">Batch 6-1 僅驗證核心流程，本批尚未發放競技場積分。</div>
   <div class="muted" style="margin-top:6px">挑戰結束後已補滿 HP。剩餘副本次數：${d.attempts} 次</div>
   <div class="controls" style="margin-top:14px"><button class="btn" onclick="openArenaDungeon()">再次選擇競技場</button><button class="btn" onclick="go('dungeon')">返回副本</button></div>
  </section></div>`;
 }

 window.renderArenaDungeon=function(){
  if(arenaState.phase==="select")return selectionHtml();
  if(arenaState.phase==="result")return resultHtml();
  return readyHtml();
 };

 window.getArenaCoreState=function(){
  return {
   phase:arenaState.phase,
   difficulty:arenaState.difficulty?{...arenaState.difficulty}:null,
   stage:arenaState.stage,
   enemy:arenaState.enemy?{...arenaState.enemy}:null,
   result:arenaState.result?{...arenaState.result}:null,
   history:arenaState.history.map(x=>({...x,enemy:x.enemy?{...x.enemy}:null}))
  };
 };
})();
