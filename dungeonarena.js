(function(){
 const ARENA_DIFFICULTIES=[
  {id:"normal",name:"普通競技場"},
  {id:"hard",name:"困難競技場"},
  {id:"extreme",name:"極限競技場"}
 ];
 const ARENA_STAGE_NAMES=["第一戰","第二戰","第三戰"];
 const ARENA_ENEMY_NAMES=["競技場鬥士","競技場戰士","競技場勇士"];

 // Batch 6-2 formal enemy balance.
 // hpMul / damageMul / defMul all apply to specialBaseEnemyFromPlayer().
 // damageMul scales target incoming damage, then ATK is reverse-calculated with player DEF.
 const ARENA_STAGE_CONFIGS={
  normal:[
   {hpMul:.58,damageMul:.58,defMul:.78,critScale:.25,critAdd:0,critCap:5,dodgeScale:.20,dodgeAdd:0,dodgeCap:4,traitMode:"normal1"},
   {hpMul:.65,damageMul:.64,defMul:.80,critScale:.35,critAdd:0,critCap:7,dodgeScale:.30,dodgeAdd:0,dodgeCap:6,traitMode:"normal2"},
   {hpMul:.72,damageMul:.70,defMul:.82,critScale:.45,critAdd:0,critCap:9,dodgeScale:.40,dodgeAdd:0,dodgeCap:8,traitMode:"one"}
  ],
  hard:[
   {hpMul:.66,damageMul:.66,defMul:.80,critScale:.40,critAdd:0,critCap:8,dodgeScale:.35,dodgeAdd:0,dodgeCap:7,traitMode:"one"},
   {hpMul:.75,damageMul:.74,defMul:.84,critScale:.55,critAdd:1,critCap:12,dodgeScale:.50,dodgeAdd:1,dodgeCap:10,traitMode:"one"},
   {hpMul:.85,damageMul:.84,defMul:.88,critScale:.70,critAdd:2,critCap:16,dodgeScale:.65,dodgeAdd:1,dodgeCap:14,traitMode:"hard3"}
  ],
  extreme:[
   {hpMul:.75,damageMul:.74,defMul:.84,critScale:.55,critAdd:1,critCap:12,dodgeScale:.50,dodgeAdd:1,dodgeCap:10,traitMode:"one"},
   {hpMul:.88,damageMul:.86,defMul:.89,critScale:.75,critAdd:2,critCap:18,dodgeScale:.70,dodgeAdd:1,dodgeCap:15,traitMode:"extreme2"},
   {hpMul:1.00,damageMul:.98,defMul:.92,critScale:.90,critAdd:3,critCap:23,dodgeScale:.85,dodgeAdd:2,dodgeCap:20,traitMode:"extreme3"}
  ]
 };

 let arenaState={phase:"select",difficulty:null,stage:0,enemy:null,result:null,history:[]};

 function difficultyById(id){return ARENA_DIFFICULTIES.find(x=>x.id===id)||null;}
 function playerSnapshot(){return createSpecialPlayerSnapshot(equippedStats());}
 function clampLevel(v){return Math.max(1,Math.min(50,Math.floor(Number(v)||1)));}
 function rateFromPlayer(value,scale,add,cap,maxCap){
  return round1(Math.max(0,Math.min(maxCap,cap,(Number(value)||0)*scale+add)));
 }
 function traitCount(mode){
  if(mode==="normal1")return Math.random()<.70?0:1;
  if(mode==="normal2")return Math.random()<.50?0:1;
  if(mode==="hard3")return Math.random()<.75?1:2;
  if(mode==="extreme2")return Math.random()<.60?1:2;
  if(mode==="extreme3")return Math.random()<.50?1:2;
  return 1;
 }
 function rollArenaTraits(mode){
  const pool=(typeof MONSTER_TRAIT_IDS!=="undefined"?MONSTER_TRAIT_IDS:Object.keys(MONSTER_TRAITS||{})).slice();
  const count=traitCount(mode),out=[];
  for(let i=0;i<count&&pool.length;i++)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  return out;
 }
 function applyArenaTraits(enemy,traitIds){
  const e={...enemy,traits:traitIds.slice(),berserk:false};
  traitIds.forEach(id=>{
   if(id==="strong")e.hp=ceil(e.hp*1.20);
   if(id==="ferocious")e.atk=ceil(e.atk*1.15);
   if(id==="hard")e.def=ceil(e.def*1.20);
   if(id==="swift")e.dodge=round1((e.dodge||0)+8);
   if(id==="deadly")e.crit=round1((e.crit||0)+8);
   if(id==="berserk")e.berserk=true;
   if(id==="giant"){
    e.hp=ceil(e.hp*1.30);
    e.atk=ceil(e.atk*1.05);
    e.dodge=round1((e.dodge||0)-5);
   }
  });
  e.crit=round1(Math.max(0,Math.min(MAX_CRIT_RATE,e.crit||0)));
  e.dodge=round1(Math.max(0,Math.min(MAX_DODGE_RATE,e.dodge||0)));
  return e;
 }
 function arenaTraitNames(enemy){
  if(!enemy?.traits?.length)return "無";
  return enemy.traits.map(id=>MONSTER_TRAITS?.[id]?.name||id).join("、");
 }

 function buildArenaEnemy(difficultyId,stageIndex,stats=null,level=null){
  const p=createSpecialPlayerSnapshot(stats||equippedStats());
  const base=specialBaseEnemyFromPlayer(p);
  const stages=ARENA_STAGE_CONFIGS[difficultyId]||ARENA_STAGE_CONFIGS.normal;
  const idx=Math.max(0,Math.min(2,Number(stageIndex)||0));
  const cfg=stages[idx]||stages[0];
  let enemy={
   name:ARENA_ENEMY_NAMES[idx]||"競技場敵人",
   level:clampLevel(level||state.level),
   kind:"dungeon-arena",
   arenaDifficulty:difficultyId,
   arenaStage:idx,
   hp:Math.max(1,ceil(base.hp*cfg.hpMul)),
   atk:Math.max(1,ceil(base.damage*cfg.damageMul+p.def*.55)),
   def:Math.max(0,ceil(base.def*cfg.defMul)),
   crit:rateFromPlayer(p.crit,cfg.critScale,cfg.critAdd,cfg.critCap,MAX_CRIT_RATE),
   dodge:rateFromPlayer(p.dodge,cfg.dodgeScale,cfg.dodgeAdd,cfg.dodgeCap,MAX_DODGE_RATE),
   traits:[],
   berserk:false,
   playerSnapshot:p
  };
  enemy=applyArenaTraits(enemy,rollArenaTraits(cfg.traitMode));
  return enemy;
 }

 window.getArenaDifficultyConfigs=function(){
  return ARENA_DIFFICULTIES.map(d=>({
   ...d,
   stages:(ARENA_STAGE_CONFIGS[d.id]||[]).map(x=>({...x}))
  }));
 };
 window.buildArenaEnemyForDebug=function(difficultyId,stageIndex,stats=null,level=null){
  return difficultyById(difficultyId)?buildArenaEnemy(difficultyId,stageIndex,stats,level):null;
 };
 window.arenaTraitNames=function(enemy){return arenaTraitNames(enemy);};

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
  arenaState={phase:"ready",difficulty,stage:0,enemy:buildArenaEnemy(difficulty.id,0),result:null,history:[]};
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
   arenaState.enemy=buildArenaEnemy(arenaState.difficulty.id,arenaState.stage);
   arenaState.result={type:"stage_win",stage:stageIndex};
   arenaState.phase="ready";
   // Arena attrition rule: no heal between the three fights.
   save(false);
  }else{
   arenaState.result={
    type:result.win?"clear":result.turnLimit?"timeout":"defeat",
    stage:stageIndex,
    combatEndHp:result.combatEndHp,
    turns:result.turns
   };
   arenaState.phase="result";
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
   <div class="muted" style="margin-top:6px">特性：${arenaTraitNames(arenaState.enemy)}</div>
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
   <div class="muted" style="margin-top:8px">Batch 6-2 已套用正式敵人平衡；本批尚未發放競技場積分。</div>
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
