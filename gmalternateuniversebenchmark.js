(function(){
 const VERSION=2;
 const TRAIT_PAIR_DIAGNOSTICS_VERSION=1;
 const COMBAT_OWNER_VERSION=1;
 const INTEGRATION_VERSION=2;
 const OPTIMIZATION_VERSION=1;
 const FORMAL_STATE_GUARD_VERSION=1;
 const PREPARED_CONTEXT_VERSION=1;
 const RESULT_CONTEXT_VERSION=1;
 const BATCH_SIZE=25;
 const model={depth:1,runs:100,busy:false,result:null,diagnostics:null};

 function num(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
 function whole(value,min=0,max=Number.MAX_SAFE_INTEGER){const n=Math.floor(Number(value));return Math.max(min,Math.min(max,Number.isFinite(n)?n:min));}
 function one(value){return Math.round(num(value,0)*10)/10;}
 function fmt(value){return Math.round(num(value,0)).toLocaleString();}
 function clone(value){try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}}
 function escapeHtml(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
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
 function rollPair(rng=Math.random){
  if(typeof window.rollAlternateUniverseTraits==="function"){
   const rolled=window.rollAlternateUniverseTraits(rng),pair=canonicalPair(rolled?.[0],rolled?.[1]);
   if(pair)return pair;
  }
  const pairs=allPairs();if(!pairs.length)return null;
  const value=Math.max(0,Math.min(.999999999999,num(rng(),0)));
  return pairs[Math.floor(value*pairs.length)].slice();
 }
 function playerContext(){
  const character=typeof window.gmTestCharacterSnapshot==="function"?window.gmTestCharacterSnapshot():null;
  const stats=typeof window.gmTestPlayerStats==="function"?window.gmTestPlayerStats():null;
  if(!stats)return null;
  const world=whole(character?.world??1,1,3),civilizationLevel=typeof window.gmTestCivilizationLevelValue==="function"?whole(window.gmTestCivilizationLevelValue(),0,10):0;
  const breakthroughLevel=Math.max(0,whole(character?.breakthroughLevel??0,0));
  return Object.freeze({character:clone(character),world,civilizationLevel,breakthroughLevel,player:Object.freeze({hp:Math.max(1,num(stats.hp,1)),atk:Math.max(1,num(stats.atk,1)),def:Math.max(0,num(stats.def,0)),crit:Math.max(0,num(stats.crit,0)),dodge:Math.max(0,num(stats.dodge,0))})});
 }
 function depthInfo(depth){return typeof window.alternateUniverseDepthInfo==="function"?window.alternateUniverseDepthInfo(depth):null;}
 function baseEnemyFor(depth){
  const u=whole(depth,1,maxDepth());
  if(typeof window.alternateUniverseEnemyStats!=="function")return null;
  const base=window.alternateUniverseEnemyStats(u);if(!base)return null;
  const info=depthInfo(u),name=info?.universeName?`${info.universeName}・${info.depthLabel||`第 ${u} 層域`}`:`異宇宙第 ${u} 層域`;
  return Object.freeze({...base,name,alternateUniverse:true,alternateUniverseDepth:u,alternateUniverseMode:"gm-benchmark"});
 }
 function enemyFromBase(base,traits){
  const pair=canonicalPair(traits?.[0],traits?.[1]);
  if(!base||!pair||typeof window.applyMonsterTraits!=="function")return null;
  const enemy=window.applyMonsterTraits({...base},pair);
  return enemy?Object.freeze({...enemy,traits:Object.freeze(pair.slice())}):null;
 }
 function enemyFor(depth,traits){return enemyFromBase(baseEnemyFor(depth),traits);}
 function seededRng(seed){let x=(whole(seed,1,0x7fffffff)||1)>>>0;return function(){x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
 function formalStateFingerprint(target){
  const root=arguments.length?target:(typeof state!=="undefined"?state:null);
  let h1=2166136261>>>0,h2=5381>>>0,nodes=0;
  const seen=typeof WeakSet==="function"?new WeakSet():null;
  function mix(text){const s=String(text);for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,16777619)>>>0;h2=(((h2<<5)+h2)^c)>>>0;}}
  function visit(value){
   nodes++;
   if(value===null){mix("null;");return;}
   const type=typeof value;mix(type);mix(":");
   if(type==="number"){mix(Number.isNaN(value)?"NaN":Object.is(value,-0)?"-0":String(value));mix(";");return;}
   if(type==="string"||type==="boolean"||type==="undefined"||type==="bigint"){mix(String(value));mix(";");return;}
   if(type==="function"||type==="symbol"){mix("ignored;");return;}
   if(seen){if(seen.has(value)){mix("[cycle];");return;}seen.add(value);}
   if(Array.isArray(value)){mix("[");for(let i=0;i<value.length;i++){mix(i);mix("=");visit(value[i]);}mix("]");return;}
   const keys=Object.keys(value);mix("{");for(const key of keys){mix(key);mix("=");visit(value[key]);}mix("}");
  }
  visit(root);
  return Object.freeze({version:FORMAL_STATE_GUARD_VERSION,fingerprint:`${h1.toString(16).padStart(8,"0")}:${h2.toString(16).padStart(8,"0")}:${nodes}`,nodes});
 }
 function formalStateGuard(){return formalStateFingerprint(typeof state!=="undefined"?state:null);}
 function guardStable(before,after){return !!before&&!!after&&before.fingerprint===after.fingerprint;}
 function prepareContext(depth){
  const u=whole(depth,1,maxDepth()),ctx=playerContext(),baseEnemy=baseEnemyFor(u);
  if(!ctx)return Object.freeze({ok:false,reason:"player-test-context-missing",version:PREPARED_CONTEXT_VERSION,depth:u});
  if(!baseEnemy)return Object.freeze({ok:false,reason:"enemy-context-missing",version:PREPARED_CONTEXT_VERSION,depth:u});
  return Object.freeze({ok:true,version:PREPARED_CONTEXT_VERSION,depth:u,ctx,baseEnemy,pairs:allPairs()});
 }
 function runOnePrepared(prepared,traits=null,{rng=Math.random}={}){
  if(!prepared?.ok)return {ok:false,reason:prepared?.reason||"prepared-context-missing"};
  const pair=traits?canonicalPair(traits?.[0],traits?.[1]):rollPair(rng),ctx=prepared.ctx,enemy=enemyFromBase(prepared.baseEnemy,pair);
  if(!pair||!enemy)return {ok:false,reason:"enemy-context-missing"};
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
  return Object.freeze({ok:true,pair:Object.freeze(pair.slice()),ctx,enemy,combat,completed,win,finite,hpBounds,actionSafety:combat.actionBudgetReached===true||combat.chainBudgetReached===true,playerEnd,enemyEnd,turns:Math.max(0,whole(combat.turns,0)),playerDamage,enemyDamage,playerCrits,enemyCrits,dodges,berserkTriggers,playerFinalDamageMultiplier:num(resolved?.playerFinalDamageMultiplier,1)});
 }
 function runOne(depth,traits=null,{rng=Math.random}={}){return runOnePrepared(prepareContext(depth),traits,{rng});}
 function aggregateStart(depth,runs,ctx,enemy,testContext=null){return {version:VERSION,optimizationVersion:OPTIMIZATION_VERSION,preparedContextVersion:PREPARED_CONTEXT_VERSION,formalStateGuardVersion:FORMAL_STATE_GUARD_VERSION,resultContextVersion:RESULT_CONTEXT_VERSION,testContext:clone(testContext),depth,runs,completed:0,wins:0,failed:0,turns:0,playerEndPct:0,enemyEndPct:0,playerDamage:0,enemyDamage:0,playerCrits:0,enemyCrits:0,dodges:0,berserkTriggers:0,actionSafety:0,invalid:0,player:clone(ctx?.player),character:clone(ctx?.character),world:ctx?.world||1,civilizationLevel:ctx?.civilizationLevel||0,breakthroughLevel:ctx?.breakthroughLevel||0,enemy:clone(enemy),traitCounts:{},traitPairCounts:{},formalStateStable:true,stale:false};}
 async function runBenchmark(options={}){
  const depth=whole(options.depth??model.depth,1,maxDepth()),runs=[100,500,1000].includes(Number(options.runs))?Number(options.runs):100,fixedPair=options.traits?canonicalPair(options.traits?.[0],options.traits?.[1]):null;
  if(options.traits&&!fixedPair)return {ok:false,reason:"invalid-trait-pair"};
  const prepared=prepareContext(depth);if(!prepared.ok)return {ok:false,reason:prepared.reason};
  const testContext=typeof window.gmTestContextSnapshot==="function"?window.gmTestContextSnapshot():null,startRevision=Math.max(0,Math.floor(Number(testContext?.revision)||0));
  const formalBefore=formalStateGuard(),out=aggregateStart(depth,runs,prepared.ctx,prepared.baseEnemy,testContext);
  for(let i=0;i<runs;i++){
   if(typeof window.gmTestContextRevision==="function"&&window.gmTestContextRevision()!==startRevision){out.stale=true;break;}
   const row=runOnePrepared(prepared,fixedPair,{rng:Math.random});
   if(!row.ok){out.failed++;out.invalid++;continue;}
   const pairKey=row.pair.join("+");out.traitPairCounts[pairKey]=(out.traitPairCounts[pairKey]||0)+1;row.pair.forEach(id=>{out.traitCounts[id]=(out.traitCounts[id]||0)+1;});
   if(row.completed)out.completed++;else out.failed++;
   if(row.win)out.wins++;
   out.turns+=row.turns;out.playerEndPct+=row.playerEnd/Math.max(1,prepared.ctx.player.hp)*100;out.enemyEndPct+=row.enemyEnd/Math.max(1,row.enemy.hp)*100;
   out.playerDamage+=row.playerDamage;out.enemyDamage+=row.enemyDamage;out.playerCrits+=row.playerCrits;out.enemyCrits+=row.enemyCrits;out.dodges+=row.dodges;out.berserkTriggers+=row.berserkTriggers;
   if(row.actionSafety)out.actionSafety++;
   if(!row.finite||!row.hpBounds)out.invalid++;
   if((i+1)%BATCH_SIZE===0&&i+1<runs)await new Promise(resolve=>setTimeout(resolve,0));
  }
  if(typeof window.gmTestContextRevision==="function"&&window.gmTestContextRevision()!==startRevision)out.stale=true;
  const formalAfter=formalStateGuard();out.formalStateStable=guardStable(formalBefore,formalAfter);out.formalStateFingerprintBefore=formalBefore.fingerprint;out.formalStateFingerprintAfter=formalAfter.fingerprint;
  const divisor=Math.max(1,out.completed||runs);
  out.winRate=one(out.wins/runs*100);out.avgTurns=one(out.turns/divisor);out.avgPlayerEndPct=one(out.playerEndPct/runs);out.avgEnemyEndPct=one(out.enemyEndPct/runs);out.avgPlayerDamage=Math.round(out.playerDamage/runs);out.avgEnemyDamage=Math.round(out.enemyDamage/runs);
  out.passed=!out.stale&&out.invalid===0&&out.actionSafety===0&&out.formalStateStable&&out.completed===runs;
  return Object.freeze(out);
 }
 function diagnosticPair(prepared,pair,index){
  const enemy=enemyFromBase(prepared?.baseEnemy,pair),base=prepared?.baseEnemy,errors=[];
  if(!enemy||!base)errors.push("enemy-init");
  if(enemy&&(!Array.isArray(enemy.traits)||enemy.traits.length!==2||enemy.traits[0]!==pair[0]||enemy.traits[1]!==pair[1]))errors.push("trait-identity");
  if(enemy&&pair.includes("berserk")&&enemy.berserk!==true)errors.push("berserk-flag");
  if(enemy&&![enemy.hp,enemy.atk,enemy.def,enemy.crit,enemy.dodge].every(Number.isFinite))errors.push("enemy-finite");
  if(enemy&&(enemy.hp<1||enemy.atk<1||enemy.def<0||enemy.crit<0||enemy.dodge<0))errors.push("enemy-bounds");
  const combat=runOnePrepared(prepared,pair,{rng:seededRng(7000+prepared.depth*31+index*97)});
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
  const depth=whole(options.depth??model.depth,1,maxDepth()),prepared=prepareContext(depth);if(!prepared.ok)return Object.freeze({version:TRAIT_PAIR_DIAGNOSTICS_VERSION,depth,pairCount:0,passed:false,formalStateStable:true,failedCount:1,failedPairs:Object.freeze([{pair:[],errors:[prepared.reason]}]),rows:Object.freeze([])});
  const pairs=prepared.pairs,formalBefore=formalStateGuard(),rows=[];
  for(let i=0;i<pairs.length;i++){rows.push(diagnosticPair(prepared,pairs[i],i));if((i+1)%7===0&&i+1<pairs.length)await new Promise(resolve=>setTimeout(resolve,0));}
  const formalAfter=formalStateGuard(),failed=rows.filter(row=>!row.passed),formalStateStable=guardStable(formalBefore,formalAfter);
  return Object.freeze({version:TRAIT_PAIR_DIAGNOSTICS_VERSION,optimizationVersion:OPTIMIZATION_VERSION,preparedContextVersion:PREPARED_CONTEXT_VERSION,formalStateGuardVersion:FORMAL_STATE_GUARD_VERSION,depth,pairCount:pairs.length,passed:failed.length===0&&formalStateStable,formalStateStable,formalStateFingerprintBefore:formalBefore.fingerprint,formalStateFingerprintAfter:formalAfter.fingerprint,failedCount:failed.length,failedPairs:Object.freeze(failed.map(row=>({pair:row.pair.slice(),errors:Array.from(row.errors)}))),rows:Object.freeze(rows)});
 }
 function metrics(r){if(!r)return '<div class="muted">尚未執行異宇宙測試。</div>';return `<div class="gmpb-metrics">${[["勝率",`${r.winRate}%`],["平均回合",r.avgTurns],["玩家平均剩餘 HP",`${r.avgPlayerEndPct}%`],["敵人平均剩餘 HP",`${r.avgEnemyEndPct}%`],["玩家平均輸出",fmt(r.avgPlayerDamage)],["玩家平均承傷",fmt(r.avgEnemyDamage)]].map(([label,value])=>`<div class="item gmpb-metric"><div class="muted">${label}</div><b>${value}</b></div>`).join("")}</div><div class="muted" style="margin-top:7px">完成 ${r.completed}/${r.runs}｜動作安全異常 ${r.actionSafety}｜無效結果 ${r.invalid}｜正式資料${r.formalStateStable?"未變動":"⚠ 發生變動"}</div>`;}
 function html(){
  const depth=whole(model.depth,1,maxDepth()),ctx=playerContext(),enemy=baseEnemyFor(depth),character=ctx?.character||{},busy=model.busy?" disabled":"";
  return `<div class="muted gm-hub-note">測試沙盒｜不寫入正式存檔。直接輸入 1～${maxDepth()} 的王編號；每場依正式異宇宙規則隨機取得兩種怪物特性，角色使用目前「角色能力測試」設定。</div><div class="item"><div class="gmpb-title"><b>異宇宙各王測試</b><span class="muted">角色：${character.world===3?"高維紀元":character.world===2?"宇宙紀元":"銀河紀元"} Lv.${whole(character.level||1,1,2000)}｜突破等級 Lv.${whole(character.breakthroughLevel||0,0)}</span></div><div class="gmpb-controls"><label>王編號<br><input id="gmAuBenchmarkDepth" class="btn" type="number" min="1" max="${maxDepth()}" step="1" value="${depth}" onchange="gmAlternateUniverseBenchmarkSetDepth(this.value)"></label><label>測試量<br><select class="btn" onchange="gmAlternateUniverseBenchmarkSetRuns(this.value)">${[100,500,1000].map(n=>`<option value="${n}" ${model.runs===n?"selected":""}>${n}</option>`).join("")}</select></label></div><div class="gmpb-actions"><button class="btn"${busy||depth<=1?" disabled":""} onclick="gmAlternateUniverseBenchmarkStep(-1)">上一隻</button><button class="btn"${busy||depth>=maxDepth()?" disabled":""} onclick="gmAlternateUniverseBenchmarkStep(1)">下一隻</button><button class="btn blue"${busy} onclick="gmAlternateUniverseBenchmarkRunSelected()">${model.busy?"測試中…":"開始測試"}</button></div><div class="muted" style="margin-top:8px">${enemy?`${enemy.name}｜基礎 HP ${fmt(enemy.hp)}｜ATK ${fmt(enemy.atk)}｜DEF ${fmt(enemy.def)}｜每場正式隨機雙特性`:"異宇宙資料未載入"}</div>${metrics(model.result)}</div>`;
 }
 async function runSelected(){
  if(model.busy)return false;model.busy=true;if(typeof render==="function")render();await new Promise(resolve=>setTimeout(resolve,0));
  try{const result=await runBenchmark({depth:model.depth,runs:model.runs});model.result=result?.stale?null:result;return result;}
  finally{model.busy=false;if(typeof render==="function")render();}
 }
 function clearResult({diagnostics=true}={}){model.result=null;if(diagnostics)model.diagnostics=null;return true;}
 function setDepth(value){model.depth=whole(value,1,maxDepth());clearResult();if(typeof render==="function")render();return model.depth;}
 function stepDepth(delta){return setDepth(model.depth+(Number(delta)<0?-1:1));}
 function setRuns(value){model.runs=[100,500,1000].includes(Number(value))?Number(value):100;clearResult({diagnostics:false});return model.runs;}
 function resultSnapshot(){return model.result?clone(model.result):null;}
 function summaryTextForResult(result=model.result){
  if(!result)return "";
  const enemy=result.enemy||{};
  return `【異宇宙】\n目標：第 ${result.depth} 層域｜${enemy.name||`異宇宙第 ${result.depth} 層域`}｜${result.runs} 場\n勝率 ${result.winRate}%｜平均回合 ${result.avgTurns}｜玩家平均剩餘HP ${result.avgPlayerEndPct}%｜敵人平均剩餘HP ${result.avgEnemyEndPct}%｜平均輸出 ${fmt(result.avgPlayerDamage)}｜平均承傷 ${fmt(result.avgEnemyDamage)}`;
 }
 function subsectionHtml(){
  const open=typeof window.gmPowerBenchmarkModeIsOpen==="function"&&window.gmPowerBenchmarkModeIsOpen("alternate");
  return `<details class="gm-ability-test-sub gmpb-mode-sub" data-gmpb-mode="alternate" ${open?"open ":""}ontoggle="gmPowerBenchmarkModeToggle('alternate',this.open)"><summary>異宇宙測試</summary><div class="gm-ability-test-sub-body">${html()}</div></details>`;
 }
 function decorateUnifiedSummary(source){
  let out=String(source||""),has=!!model.result;
  out=out.replace(/(<div class="muted"[^>]*>已測模式<\/div><b[^>]*>)(\d+)\s*\/\s*7(<\/b>)/,(all,a,n,b)=>`${a}${Number(n)+(has?1:0)} / 8${b}`);
  out=out.replace(/(<div class="muted"[^>]*>包含內容<\/div><b[^>]*>)([^<]*)(<\/b>)/,(all,a,value,b)=>{
   if(!has)return `${a}${value}${b}`;
   const current=String(value||"").trim();return `${a}${current==="尚未測試"?"異宇宙":(current.includes("異宇宙")?current:`${current}、異宇宙`)}${b}`;
  });
  if(has){
   const add=escapeHtml(summaryTextForResult());
   out=out.replace(/(<div class="gmpb-summary-text">)([\s\S]*?)(<\/div><\/details>)/,(all,a,text,b)=>`${a}${text.replace(/\n?尚未執行任何戰鬥測試。/g,"")}${text.trim()?"\n\n":""}${add}${b}`);
  }
  return out;
 }
 function validate(){
  const errors=[],ids=traitIds(),pairs=allPairs();
  if(ids.length!==7)errors.push({code:"TRAIT_COUNT",actual:ids.length});
  if(pairs.length!==21)errors.push({code:"PAIR_COUNT",actual:pairs.length});
  const keys=pairs.map(pair=>pair.join("+"));if(new Set(keys).size!==21)errors.push({code:"PAIR_UNIQUENESS"});
  if(pairs.some(pair=>pair.length!==2||pair[0]===pair[1]))errors.push({code:"PAIR_SHAPE"});
  if(model.depth!==1)errors.push({code:"SESSION_DEFAULT_DEPTH",actual:model.depth});
  const sample=ids.length>=2?enemyFor(1,[ids[1],ids[0]]):null;if(ids.length>=2&&(!sample||sample.traits[0]!==ids[0]||sample.traits[1]!==ids[1]))errors.push({code:"CANONICAL_ORDER"});
  const guardA=formalStateFingerprint({a:1,b:{c:2}}),guardB=formalStateFingerprint({a:1,b:{c:3}});if(guardA.fingerprint===guardB.fingerprint)errors.push({code:"FORMAL_STATE_GUARD_COLLISION_PROBE"});
  const prepared=prepareContext(1);if(!prepared.ok||prepared.version!==PREPARED_CONTEXT_VERSION)errors.push({code:"PREPARED_CONTEXT",actual:prepared});
  if(RESULT_CONTEXT_VERSION!==1||typeof window.gmTestContextSnapshot!=="function")errors.push({code:"RESULT_CONTEXT_OWNER"});
  if(typeof window.gmPowerBenchmarkRegisterTestContextInvalidator!=="function")errors.push({code:"RESULT_INVALIDATION_REGISTRY"});
  return Object.freeze({version:VERSION,optimizationVersion:OPTIMIZATION_VERSION,formalStateGuardVersion:FORMAL_STATE_GUARD_VERSION,preparedContextVersion:PREPARED_CONTEXT_VERSION,resultContextVersion:RESULT_CONTEXT_VERSION,traitPairDiagnosticsVersion:TRAIT_PAIR_DIAGNOSTICS_VERSION,combatOwnerVersion:COMBAT_OWNER_VERSION,integrationVersion:INTEGRATION_VERSION,passed:errors.length===0,pairCount:pairs.length,errors:Object.freeze(errors)});
 }
 function installIntegration(){
  if(typeof window.gmPowerBenchmarkRegisterTestContextInvalidator==="function")window.gmPowerBenchmarkRegisterTestContextInvalidator(()=>{clearResult();});
  const baseHtml=window.gmPowerBenchmarkHtml,baseSummary=window.gmPowerBenchmarkSummaryText,baseClear=window.gmPowerBenchmarkClearAllResults,baseReset=window.gmPowerBenchmarkReset,baseRefresh=window.gmPowerBenchmarkRefreshUi,baseRefreshSummary=window.gmPowerBenchmarkRefreshSummary;
  if(typeof baseHtml!=="function")return false;
  const wrapped=function(){
   let source=String(baseHtml()||""),marker='<div id="gmPowerBenchmarkUnifiedSummary"';
   const index=source.indexOf(marker);if(index>=0)source=source.slice(0,index)+subsectionHtml()+source.slice(index);else source+=subsectionHtml();
   return decorateUnifiedSummary(source);
  };
  function refreshIntegratedSummaryDom(){
   if(typeof document==="undefined")return false;
   const current=document.getElementById("gmPowerBenchmarkUnifiedSummary");if(!current)return false;
   const host=document.createElement("div");host.innerHTML=wrapped();
   const next=host.querySelector("#gmPowerBenchmarkUnifiedSummary");if(!next)return false;
   current.replaceWith(next);return true;
  }
  wrapped.__alternateUniverseIntegrationVersion=INTEGRATION_VERSION;
  window.gmPowerBenchmarkHtml=wrapped;
  window.gmPowerBenchmarkSummaryText=function(){
   let text=typeof baseSummary==="function"?String(baseSummary()||""):"";
   if(model.result){text=text.replace(/\n?尚未執行任何戰鬥測試。/g,"");text+=(text.trim()?"\n\n":"")+summaryTextForResult();}
   return text;
  };
  window.gmPowerBenchmarkCopySummary=async function(){
   const text=window.gmPowerBenchmarkSummaryText();let ok=false;
   try{if(typeof navigator!=="undefined"&&navigator.clipboard&&typeof navigator.clipboard.writeText==="function"){await navigator.clipboard.writeText(text);ok=true;}}catch(_){ }
   if(!ok&&typeof document!=="undefined"){const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.focus();ta.select();try{ok=document.execCommand("copy");}catch(_){ }ta.remove();}
   if(typeof alert==="function")alert(ok?"測試摘要已複製。":"無法自動複製，請長按下方摘要文字手動複製。");return ok;
  };
  if(typeof baseClear==="function")window.gmPowerBenchmarkClearAllResults=function(){clearResult();const out=baseClear.apply(this,arguments);refreshIntegratedSummaryDom();return out;};
  if(typeof baseReset==="function")window.gmPowerBenchmarkReset=function(){clearResult();const out=baseReset.apply(this,arguments);refreshIntegratedSummaryDom();return out;};
  if(typeof baseRefresh==="function")window.gmPowerBenchmarkRefreshUi=function(){const out=baseRefresh.apply(this,arguments);refreshIntegratedSummaryDom();return out;};
  if(typeof baseRefreshSummary==="function")window.gmPowerBenchmarkRefreshSummary=function(){const out=baseRefreshSummary.apply(this,arguments);refreshIntegratedSummaryDom();return out;};
  if(typeof window.replaceGmHubSectionRenderer==="function")window.replaceGmHubSectionRenderer("test","power-benchmark-test",wrapped,"戰力基準測試");
  return true;
 }

 window.GM_ALTERNATE_UNIVERSE_BENCHMARK_VERSION=VERSION;
 window.GM_ALTERNATE_UNIVERSE_TRAIT_PAIR_DIAGNOSTICS_VERSION=TRAIT_PAIR_DIAGNOSTICS_VERSION;
 window.GM_ALTERNATE_UNIVERSE_BENCHMARK_COMBAT_OWNER_VERSION=COMBAT_OWNER_VERSION;
 window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRATION_VERSION=INTEGRATION_VERSION;
 window.GM_ALTERNATE_UNIVERSE_BENCHMARK_OPTIMIZATION_VERSION=OPTIMIZATION_VERSION;
 window.GM_ALTERNATE_UNIVERSE_BENCHMARK_FORMAL_STATE_GUARD_VERSION=FORMAL_STATE_GUARD_VERSION;
 window.GM_ALTERNATE_UNIVERSE_BENCHMARK_PREPARED_CONTEXT_VERSION=PREPARED_CONTEXT_VERSION;
 window.GM_ALTERNATE_UNIVERSE_BENCHMARK_RESULT_CONTEXT_VERSION=RESULT_CONTEXT_VERSION;
 window.gmAlternateUniverseTraitPairs=()=>allPairs().map(pair=>pair.slice());
 window.gmAlternateUniverseBenchmarkEnemy=(depth,traits)=>clone(enemyFor(depth,traits||rollPair()));
 window.gmAlternateUniverseBenchmarkFormalStateFingerprint=formalStateFingerprint;
 window.gmAlternateUniverseBenchmarkPrepareContext=prepareContext;
 window.gmRunAlternateUniverseBenchmark=runBenchmark;
 window.gmRunAlternateUniverseTraitDiagnostics=runDiagnostics;
 window.gmAlternateUniverseBenchmarkHtml=html;
 window.gmAlternateUniverseBenchmarkSession=()=>clone(model);
 window.gmAlternateUniverseBenchmarkResultSnapshot=resultSnapshot;
 window.gmClearAlternateUniverseBenchmarkResult=()=>clearResult();
 window.gmAlternateUniverseBenchmarkSetDepth=setDepth;
 window.gmAlternateUniverseBenchmarkStep=stepDepth;
 window.gmAlternateUniverseBenchmarkSetRuns=setRuns;
 window.gmAlternateUniverseBenchmarkRunSelected=runSelected;
 window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRITY=validate();
 window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INSTALL_REPORT=Object.freeze({version:VERSION,integrationVersion:INTEGRATION_VERSION,optimizationVersion:OPTIMIZATION_VERSION,formalStateGuardVersion:FORMAL_STATE_GUARD_VERSION,preparedContextVersion:PREPARED_CONTEXT_VERSION,integrated:installIntegration(),separateHubSection:false,defaultDepth:1});
 if(!window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRITY.passed)console.error("[文明戰線] GM AU benchmark integrity error",window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRITY.errors);
})();