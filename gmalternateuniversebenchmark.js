(function(){
 const VERSION=1;
 const TRAIT_PAIR_DIAGNOSTICS_VERSION=1;
 const COMBAT_OWNER_VERSION=1;
 const BATCH_SIZE=25;
 const model={depth:1,runs:100,traits:["strong","ferocious"],busy:false,busyKind:"",result:null,diagnostics:null};

 function num(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
 function whole(value,min=0,max=Number.MAX_SAFE_INTEGER){const n=Math.floor(Number(value));return Math.max(min,Math.min(max,Number.isFinite(n)?n:min));}
 function one(value){return Math.round(num(value,0)*10)/10;}
 function fmt(value){return Math.round(num(value,0)).toLocaleString();}
 function clone(value){try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}}
 function maxDepth(){return Math.max(1,whole(window.ALTERNATE_UNIVERSE_MAX_DEPTH||window.ALTERNATE_UNIVERSE_DATA_MAX_DEPTH||1000,1));}
 function traitRows(){
  const rows=Array.isArray(window.ALTERNATE_UNIVERSE_TRAIT_ROWS)?window.ALTERNATE_UNIVERSE_TRAIT_ROWS:[];
  return rows.map(row=>({id:String(row?.id||""),name:String(row?.name||row?.id||"")})).filter(row=>row.id);
 }
 function traitIds(){return traitRows().map(row=>row.id);}
 function traitName(id){return traitRows().find(row=>row.id===id)?.name||String(id||"");}
 function canonicalPair(a,b){
  const ids=traitIds(),ai=ids.indexOf(String(a||"")),bi=ids.indexOf(String(b||""));
  if(ai<0||bi<0||ai===bi)return null;
  return ai<bi?[ids[ai],ids[bi]]:[ids[bi],ids[ai]];
 }
 function allPairs(){
  const ids=traitIds(),pairs=[];
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)pairs.push(Object.freeze([ids[i],ids[j]]));
  return Object.freeze(pairs);
 }
 function setDefaultDepth(){
  if(model.depth>1)return;
  try{
   const snap=typeof window.gmAlternateUniverseFormalSnapshot==="function"?window.gmAlternateUniverseFormalSnapshot(state):null;
   model.depth=whole(snap?.frontier||snap?.deepestCleared||1,1,maxDepth());
  }catch(_){model.depth=1;}
 }
 function playerContext(){
  const character=typeof window.gmTestCharacterSnapshot==="function"?window.gmTestCharacterSnapshot():null;
  const stats=typeof window.gmTestPlayerStats==="function"?window.gmTestPlayerStats():null;
  if(!stats)return null;
  const world=whole(character?.world??1,1,3),civilizationLevel=typeof window.gmTestCivilizationLevelValue==="function"?whole(window.gmTestCivilizationLevelValue(),0,10):0;
  const breakthroughLevel=Math.max(0,whole(character?.breakthroughLevel??0,0));
  return Object.freeze({character:clone(character),world,civilizationLevel,breakthroughLevel,player:{hp:Math.max(1,num(stats.hp,1)),atk:Math.max(1,num(stats.atk,1)),def:Math.max(0,num(stats.def,0)),crit:Math.max(0,num(stats.crit,0)),dodge:Math.max(0,num(stats.dodge,0))}});
 }
 function enemyFor(depth,traits){
  const u=whole(depth,1,maxDepth()),pair=canonicalPair(traits?.[0],traits?.[1]);
  if(!pair||typeof window.alternateUniverseEnemyStats!=="function"||typeof window.applyMonsterTraits!=="function")return null;
  const base=window.alternateUniverseEnemyStats(u);if(!base)return null;
  const info=typeof window.alternateUniverseDepthInfo==="function"?window.alternateUniverseDepthInfo(u):null;
  const named={...base,name:info?.universeName?`${info.universeName}・${info.depthLabel||`第 ${u} 層域`}`:`異宇宙第 ${u} 層域`,alternateUniverse:true,alternateUniverseDepth:u,alternateUniverseMode:"gm-benchmark"};
  const enemy=window.applyMonsterTraits(named,pair);
  return enemy?Object.freeze({...enemy,traits:Object.freeze(pair.slice())}):null;
 }
 function seededRng(seed){let x=(whole(seed,1,0x7fffffff)||1)>>>0;return function(){x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
 function runOne(depth,traits,{rng=Math.random}={}){
  const ctx=playerContext(),enemy=enemyFor(depth,traits);
  if(!ctx)return {ok:false,reason:"player-test-context-missing"};
  if(!enemy)return {ok:false,reason:"enemy-context-missing"};
  if(typeof window.runWorldCombatCore!=="function")return {ok:false,reason:"world-combat-owner-missing"};
  const resolved=window.runWorldCombatCore(ctx.player,enemy,ctx.player.hp,{world:ctx.world,state:typeof state!=="undefined"?state:null,civilizationLevel:ctx.civilizationLevel,breakthroughLevel:ctx.breakthroughLevel,logs:false,rng,useTestSpecializations:true,useTestMarks:true,playerHealCap:ctx.player.hp,maxActions:200000,maxActionsPerChain:1024});
  const combat=resolved?.combat;
  if(!combat||typeof combat!=="object")return {ok:false,reason:"combat-result-missing"};
  const events=Array.isArray(combat.events)?combat.events:[];
  const playerEnd=Math.max(0,num(combat.hp,0)),enemyEnd=Math.max(0,num(combat.enemyHp,0));
  const completed=playerEnd<=0||enemyEnd<=0,win=enemyEnd<=0&&combat.win===true;
  let playerDamage=0,enemyDamage=0,playerCrits=0,enemyCrits=0,dodges=0,berserkTriggers=0;
  events.forEach(event=>{
   if(event?.type==="attack"){
    const damage=Math.max(0,num(event.actualDamage,0));
    if(event.actor==="player"){playerDamage+=damage;if(event.crit)playerCrits++;}
    else if(event.actor==="enemy"){enemyDamage+=damage;if(event.crit)enemyCrits++;}
   }else if(event?.type==="dodge")dodges++;
   else if(event?.type==="berserk")berserkTriggers++;
  });
  const finite=[playerEnd,enemyEnd,combat.turns,playerDamage,enemyDamage].every(Number.isFinite);
  const hpBounds=playerEnd<=ctx.player.hp+1e-9&&enemyEnd<=num(enemy.hp,1)+1e-9;
  return Object.freeze({ok:true,ctx,enemy,combat,completed,win,finite,hpBounds,actionSafety:combat.actionBudgetReached===true||combat.chainBudgetReached===true,playerEnd,enemyEnd,turns:Math.max(0,whole(combat.turns,0)),playerDamage,enemyDamage,playerCrits,enemyCrits,dodges,berserkTriggers,playerFinalDamageMultiplier:num(resolved?.playerFinalDamageMultiplier,1)});
 }
 function aggregateStart(depth,traits,runs,ctx,enemy){return {version:VERSION,depth,traits:traits.slice(),traitNames:traits.map(traitName),runs,completed:0,wins:0,failed:0,turns:0,playerEndPct:0,enemyEndPct:0,playerDamage:0,enemyDamage:0,playerCrits:0,enemyCrits:0,dodges:0,berserkTriggers:0,actionSafety:0,invalid:0,player:clone(ctx?.player),character:clone(ctx?.character),world:ctx?.world||1,civilizationLevel:ctx?.civilizationLevel||0,breakthroughLevel:ctx?.breakthroughLevel||0,enemy:clone(enemy),formalStateStable:true};}
 async function runBenchmark(options={}){
  const depth=whole(options.depth??model.depth,1,maxDepth()),runs=[100,500,1000].includes(Number(options.runs))?Number(options.runs):100,pair=canonicalPair(options.traits?.[0]??model.traits[0],options.traits?.[1]??model.traits[1]);
  if(!pair)return {ok:false,reason:"invalid-trait-pair"};
  const ctx=playerContext(),enemy=enemyFor(depth,pair);if(!ctx||!enemy)return {ok:false,reason:!ctx?"player-test-context-missing":"enemy-context-missing"};
  const formalBefore=typeof state!=="undefined"?JSON.stringify(state):"";
  const out=aggregateStart(depth,pair,runs,ctx,enemy);
  for(let i=0;i<runs;i++){
   const row=runOne(depth,pair,{rng:Math.random});
   if(!row.ok){out.failed++;out.invalid++;continue;}
   if(row.completed)out.completed++;else out.failed++;
   if(row.win)out.wins++;
   out.turns+=row.turns;out.playerEndPct+=row.playerEnd/Math.max(1,row.ctx.player.hp)*100;out.enemyEndPct+=row.enemyEnd/Math.max(1,row.enemy.hp)*100;
   out.playerDamage+=row.playerDamage;out.enemyDamage+=row.enemyDamage;out.playerCrits+=row.playerCrits;out.enemyCrits+=row.enemyCrits;out.dodges+=row.dodges;out.berserkTriggers+=row.berserkTriggers;
   if(row.actionSafety)out.actionSafety++;
   if(!row.finite||!row.hpBounds)out.invalid++;
   if((i+1)%BATCH_SIZE===0&&i+1<runs)await new Promise(resolve=>setTimeout(resolve,0));
  }
  const formalAfter=typeof state!=="undefined"?JSON.stringify(state):"";out.formalStateStable=formalBefore===formalAfter;
  const divisor=Math.max(1,out.completed||runs);
  out.winRate=one(out.wins/runs*100);out.avgTurns=one(out.turns/divisor);out.avgPlayerEndPct=one(out.playerEndPct/runs);out.avgEnemyEndPct=one(out.enemyEndPct/runs);out.avgPlayerDamage=Math.round(out.playerDamage/runs);out.avgEnemyDamage=Math.round(out.enemyDamage/runs);
  out.passed=out.invalid===0&&out.actionSafety===0&&out.formalStateStable&&out.completed===runs;
  return Object.freeze(out);
 }
 function diagnosticPair(depth,pair,index){
  const enemy=enemyFor(depth,pair),base=typeof window.alternateUniverseEnemyStats==="function"?window.alternateUniverseEnemyStats(depth):null;
  const errors=[];
  if(!enemy||!base)errors.push("enemy-init");
  if(enemy&&(!Array.isArray(enemy.traits)||enemy.traits.length!==2||enemy.traits[0]!==pair[0]||enemy.traits[1]!==pair[1]))errors.push("trait-identity");
  if(enemy&&pair.includes("berserk")&&enemy.berserk!==true)errors.push("berserk-flag");
  if(enemy&&![enemy.hp,enemy.atk,enemy.def,enemy.crit,enemy.dodge].every(Number.isFinite))errors.push("enemy-finite");
  if(enemy&&(enemy.hp<1||enemy.atk<1||enemy.def<0||enemy.crit<0||enemy.dodge<0))errors.push("enemy-bounds");
  const combat=runOne(depth,pair,{rng:seededRng(7000+depth*31+index*97)});
  if(!combat.ok)errors.push(combat.reason||"combat");
  else{
   if(!combat.completed)errors.push("combat-incomplete");
   if(!combat.finite)errors.push("combat-finite");
   if(!combat.hpBounds)errors.push("hp-bounds");
   if(combat.actionSafety)errors.push("action-safety");
  }
  return Object.freeze({pair:pair.slice(),names:pair.map(traitName),passed:errors.length===0,errors:Object.freeze(errors),enemy:enemy?{hp:enemy.hp,atk:enemy.atk,def:enemy.def,crit:enemy.crit,dodge:enemy.dodge,berserk:enemy.berserk===true}:null,combat:combat.ok?{win:combat.win,turns:combat.turns,playerEnd:combat.playerEnd,enemyEnd:combat.enemyEnd,berserkTriggers:combat.berserkTriggers}:null});
 }
 async function runDiagnostics(options={}){
  const depth=whole(options.depth??model.depth,1,maxDepth()),pairs=allPairs(),formalBefore=typeof state!=="undefined"?JSON.stringify(state):"";
  const rows=[];for(let i=0;i<pairs.length;i++){rows.push(diagnosticPair(depth,pairs[i],i));if((i+1)%7===0&&i+1<pairs.length)await new Promise(resolve=>setTimeout(resolve,0));}
  const formalAfter=typeof state!=="undefined"?JSON.stringify(state):"",failed=rows.filter(row=>!row.passed);
  return Object.freeze({version:TRAIT_PAIR_DIAGNOSTICS_VERSION,depth,pairCount:pairs.length,passed:failed.length===0&&formalBefore===formalAfter,formalStateStable:formalBefore===formalAfter,failedCount:failed.length,failedPairs:Object.freeze(failed.map(row=>({pair:row.pair.slice(),errors:Array.from(row.errors)}))),rows:Object.freeze(rows)});
 }
 function traitOptions(selected,exclude=""){return traitRows().filter(row=>row.id!==exclude).map(row=>`<option value="${row.id}" ${row.id===selected?"selected":""}>${row.name}</option>`).join("");}
 function metrics(r){if(!r)return '<div class="muted">尚未執行異宇宙戰力基準。</div>';return `<div class="gmpb-metrics">${[["勝率",`${r.winRate}%`],["平均回合",r.avgTurns],["玩家平均剩餘 HP",`${r.avgPlayerEndPct}%`],["敵人平均剩餘 HP",`${r.avgEnemyEndPct}%`],["玩家平均輸出",fmt(r.avgPlayerDamage)],["玩家平均承傷",fmt(r.avgEnemyDamage)]].map(([label,value])=>`<div class="item gmpb-metric"><div class="muted">${label}</div><b>${value}</b></div>`).join("")}</div><div class="muted" style="margin-top:7px">完成 ${r.completed}/${r.runs}｜動作安全異常 ${r.actionSafety}｜無效結果 ${r.invalid}｜正式資料${r.formalStateStable?"未變動":"⚠ 發生變動"}｜狂暴實際觸發 ${r.berserkTriggers} 次</div>`;}
 function diagnosticsHtml(d){if(!d)return '<div class="muted">尚未執行 21 組雙特性診斷。</div>';const failed=d.failedPairs.map(row=>`${row.pair.map(traitName).join("＋")}：${row.errors.join(", ")}`).join("<br>");return `<div class="item" style="margin-top:8px"><b>${d.passed?"21 組雙特性診斷全部通過":"雙特性診斷發現異常"}</b><div class="muted" style="margin-top:5px">第 ${d.depth} 層域｜組合 ${d.pairCount}｜失敗 ${d.failedCount}｜正式資料${d.formalStateStable?"未變動":"⚠ 發生變動"}</div>${failed?`<div class="muted" style="margin-top:6px">${failed}</div>`:""}</div>`;}
 function html(){
  setDefaultDepth();const pair=canonicalPair(model.traits[0],model.traits[1])||allPairs()[0]||["strong","ferocious"];model.traits=pair.slice();
  const busy=model.busy?" disabled":"",ctx=playerContext(),enemy=enemyFor(model.depth,pair),character=ctx?.character||{};
  return `<div class="gm-power-benchmark"><div class="muted gm-hub-note">測試沙盒｜不寫入正式存檔。異宇宙基準直接使用正式 AU 敵人曲線、正式雙特性 owner 與共用 combat core；角色使用目前 GM 角色測試設定。這裡不建立第二套戰鬥公式，也不呼叫異宇宙正式 settlement。</div><div class="item"><div class="gmpb-title"><b>異宇宙戰力基準</b><span class="muted">角色：${character.world===3?"高維紀元":character.world===2?"宇宙紀元":"銀河紀元"} Lv.${whole(character.level||1,1,2000)}｜突破等級 Lv.${whole(character.breakthroughLevel||0,0)}</span></div><div class="gmpb-controls"><label>層域<input id="gmAuBenchmarkDepth" class="btn" type="number" min="1" max="${maxDepth()}" step="1" value="${model.depth}" onchange="gmAlternateUniverseBenchmarkSetDepth(this.value)"></label><label>場數<select class="btn" onchange="gmAlternateUniverseBenchmarkSetRuns(this.value)">${[100,500,1000].map(n=>`<option value="${n}" ${model.runs===n?"selected":""}>${n} 場</option>`).join("")}</select></label><label>特性 A<select class="btn" onchange="gmAlternateUniverseBenchmarkSetTrait(0,this.value)">${traitOptions(pair[0],pair[1])}</select></label><label>特性 B<select class="btn" onchange="gmAlternateUniverseBenchmarkSetTrait(1,this.value)">${traitOptions(pair[1],pair[0])}</select></label></div><div class="muted" style="margin-top:8px">敵人：${enemy?`${enemy.name}｜HP ${fmt(enemy.hp)}｜ATK ${fmt(enemy.atk)}｜DEF ${fmt(enemy.def)}｜暴擊 ${one(enemy.crit)}%｜閃避 ${one(enemy.dodge)}%`:"資料未載入"}</div><div class="gmpb-actions"><button class="btn blue"${busy} onclick="gmAlternateUniverseBenchmarkRunSelected()">${model.busy&&model.busyKind==="benchmark"?"測試中…":"執行戰力基準"}</button><button class="btn"${busy} onclick="gmAlternateUniverseBenchmarkRunDiagnostics()">${model.busy&&model.busyKind==="diagnostics"?"診斷中…":"檢查 21 組雙特性"}</button></div>${metrics(model.result)}${diagnosticsHtml(model.diagnostics)}</div></div>`;
 }
 async function withBusy(kind,task){if(model.busy)return false;model.busy=true;model.busyKind=kind;if(typeof render==="function")render();await new Promise(resolve=>setTimeout(resolve,0));try{return await task();}finally{model.busy=false;model.busyKind="";if(typeof render==="function")render();}}
 async function runSelected(){return withBusy("benchmark",async()=>{model.result=await runBenchmark({depth:model.depth,runs:model.runs,traits:model.traits});return model.result;});}
 async function runAllDiagnostics(){return withBusy("diagnostics",async()=>{model.diagnostics=await runDiagnostics({depth:model.depth});return model.diagnostics;});}
 function setTrait(index,value){const next=model.traits.slice(),ids=traitIds(),id=String(value||"");if(!ids.includes(id))return false;next[index===1?1:0]=id;if(next[0]===next[1]){next[index===1?0:1]=ids.find(x=>x!==id)||next[index===1?0:1];}const pair=canonicalPair(next[0],next[1]);if(!pair)return false;model.traits=pair.slice();model.result=null;if(typeof render==="function")render();return true;}
 function validate(){
  const errors=[],ids=traitIds(),pairs=allPairs();
  if(ids.length!==7)errors.push({code:"TRAIT_COUNT",actual:ids.length});
  if(pairs.length!==21)errors.push({code:"PAIR_COUNT",actual:pairs.length});
  const keys=pairs.map(pair=>pair.join("+"));if(new Set(keys).size!==21)errors.push({code:"PAIR_UNIQUENESS"});
  if(pairs.some(pair=>pair.length!==2||pair[0]===pair[1]))errors.push({code:"PAIR_SHAPE"});
  if(ids.length>=2&&typeof window.alternateUniverseEnemyStats==="function"&&typeof window.applyMonsterTraits==="function"){
   const enemy=enemyFor(1,[ids[1],ids[0]]);if(!enemy||enemy.traits[0]!==ids[0]||enemy.traits[1]!==ids[1])errors.push({code:"CANONICAL_ORDER"});
  }
  return Object.freeze({version:VERSION,traitPairDiagnosticsVersion:TRAIT_PAIR_DIAGNOSTICS_VERSION,combatOwnerVersion:COMBAT_OWNER_VERSION,passed:errors.length===0,pairCount:pairs.length,errors:Object.freeze(errors)});
 }

 window.GM_ALTERNATE_UNIVERSE_BENCHMARK_VERSION=VERSION;
 window.GM_ALTERNATE_UNIVERSE_TRAIT_PAIR_DIAGNOSTICS_VERSION=TRAIT_PAIR_DIAGNOSTICS_VERSION;
 window.GM_ALTERNATE_UNIVERSE_BENCHMARK_COMBAT_OWNER_VERSION=COMBAT_OWNER_VERSION;
 window.gmAlternateUniverseTraitPairs=()=>allPairs().map(pair=>pair.slice());
 window.gmAlternateUniverseBenchmarkEnemy=(depth,traits)=>clone(enemyFor(depth,traits));
 window.gmRunAlternateUniverseBenchmark=runBenchmark;
 window.gmRunAlternateUniverseTraitDiagnostics=runDiagnostics;
 window.gmAlternateUniverseBenchmarkHtml=html;
 window.gmAlternateUniverseBenchmarkSession=()=>clone(model);
 window.gmAlternateUniverseBenchmarkSetDepth=value=>{model.depth=whole(value,1,maxDepth());model.result=null;model.diagnostics=null;if(typeof render==="function")render();return model.depth;};
 window.gmAlternateUniverseBenchmarkSetRuns=value=>{model.runs=[100,500,1000].includes(Number(value))?Number(value):100;return model.runs;};
 window.gmAlternateUniverseBenchmarkSetTrait=setTrait;
 window.gmAlternateUniverseBenchmarkRunSelected=runSelected;
 window.gmAlternateUniverseBenchmarkRunDiagnostics=runAllDiagnostics;
 window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRITY=validate();
 if(typeof window.registerGmHubSection==="function")window.registerGmHubSection("test","異宇宙基準測試",html,{id:"alternate-universe-benchmark-test"});
 if(!window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRITY.passed)console.error("[文明戰線] GM AU benchmark integrity error",window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRITY.errors);
})();
