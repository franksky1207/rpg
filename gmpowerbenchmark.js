(function(){
 const VERSION=13;
 const BATCH_SIZE=25;
 const SLOT_LABELS={weapon:"武器",helmet:"頭盔",armor:"鎧甲",shoes:"鞋子",accessory:"飾品"};
 const KIND_LABELS={normal:"普通",elite:"菁英",boss:"Boss"};
 const MODEL={
  world:1,phase:0,regionId:"",mapIndex:0,enemyIndex:4,runs:100,
  outputSource:"selected",defenseSource:"selected",customDef:0,customAtk:0,
  snapshot:null,outputResult:null,defenseResult:null,combatResult:null,
  universeRegionIndex:0,universeBossIndex:0,universeCombatResult:null,
  busy:false,busyKind:""
 };

 function installStyles(){
  if(typeof document==="undefined"||document.getElementById("gmPowerBenchmarkStyles"))return;
  const style=document.createElement("style");
  style.id="gmPowerBenchmarkStyles";
  style.textContent=`
   .gm-power-benchmark{display:grid;gap:10px}.gm-power-benchmark>.item{margin:0!important;border-radius:11px}
   .gm-power-benchmark .gmpb-title{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
   .gm-power-benchmark .gmpb-controls{display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:8px;margin-top:9px;align-items:end}
   .gm-power-benchmark .gmpb-controls label{display:flex;flex-direction:column;gap:4px;min-width:0;color:#d8c49a;font-size:12px}
   .gm-power-benchmark .gmpb-controls .btn,.gm-power-benchmark .gmpb-controls input,.gm-power-benchmark .gmpb-controls select{width:100%;min-width:0}
   .gm-power-benchmark .gmpb-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}.gm-power-benchmark .gmpb-actions .btn{flex:1 1 170px}
   .gm-power-benchmark .gmpb-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:8px}
   .gm-power-benchmark .gmpb-metric{margin:0!important;padding:9px 10px!important;min-width:0;background:#12171d;border-color:#393d42}
   .gm-power-benchmark .gmpb-metric b{font-size:16px;color:#f0d494;overflow-wrap:anywhere}
   .gm-power-benchmark .gmpb-sub{margin-top:5px;line-height:1.55}.gm-power-benchmark details>summary{cursor:pointer;color:#d9c596}
   .gm-power-benchmark .gmpb-combat-card{margin-top:8px!important}.gm-power-benchmark .gmpb-summary-main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:8px}
   .gm-power-benchmark .gmpb-summary-text{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.55;font-size:12px;max-height:220px;overflow:auto;background:#0d1116;border:1px solid #353a40;border-radius:8px;padding:9px;margin-top:8px}
   @media(max-width:760px){
    .gm-power-benchmark{gap:8px}.gm-power-benchmark>.item{padding:10px!important}.gm-power-benchmark .gmpb-controls{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
    .gm-power-benchmark .gmpb-controls label:nth-child(3),.gm-power-benchmark .gmpb-controls label:nth-child(4){grid-column:span 2}
    .gm-power-benchmark .gmpb-actions{display:grid;grid-template-columns:1fr;gap:7px}.gm-power-benchmark .gmpb-actions .btn{width:100%;min-height:42px}
    .gm-power-benchmark .gmpb-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.gm-power-benchmark .gmpb-metric{padding:8px!important}
    .gm-power-benchmark .gmpb-metric .muted{font-size:11px!important;line-height:1.25}.gm-power-benchmark .gmpb-metric b{font-size:15px}
    .gm-power-benchmark .gmpb-summary-main{grid-template-columns:1fr}.gm-power-benchmark .gmpb-summary-text{max-height:180px;font-size:11px}
   }
   @media(max-width:390px){.gm-power-benchmark .gmpb-controls{grid-template-columns:1fr}.gm-power-benchmark .gmpb-controls label:nth-child(3),.gm-power-benchmark .gmpb-controls label:nth-child(4){grid-column:auto}.gm-power-benchmark .gmpb-metrics{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(style);
 }

 function num(v,f=0){const n=Number(v);return Number.isFinite(n)?n:f;}
 function whole(v,min=0,max=Number.MAX_SAFE_INTEGER){return Math.max(min,Math.min(max,Math.floor(num(v,min))));}
 function one(v){return Math.round(num(v,0)*10)/10;}
 function pct(n,d){return d>0?one(n/d*100):0;}
 function fmt(v){return Math.round(num(v,0)).toLocaleString();}
 function yieldToUi(){return new Promise(resolve=>setTimeout(resolve,0));}
 async function runBatched(total,worker,batchSize=BATCH_SIZE){
  for(let i=0;i<total;i++){
   worker(i);
   if((i+1)%batchSize===0&&i+1<total)await yieldToUi();
  }
 }
 async function withBenchmarkBusy(kind,task){
  if(MODEL.busy)return false;
  MODEL.busy=true;MODEL.busyKind=String(kind||"");
  if(typeof render==="function")render();
  await yieldToUi();
  try{return await task();}
  catch(error){
   console.error("GM power benchmark failed",error);
   if(typeof alert==="function")alert("戰力基準測試執行失敗，請重新整理後再試。");
   return false;
  }finally{
   MODEL.busy=false;MODEL.busyKind="";
   if(typeof render==="function")render();
  }
 }
 function busyDisabled(){return MODEL.busy?" disabled":"";}
 function busyLabel(kind,normal){return MODEL.busy&&MODEL.busyKind===kind?"測試中…":normal;}
 function phaseForLevel(level){return Math.max(0,Math.floor((Math.max(1,whole(level,1))-1)/500));}
 function phaseLabel(index){const start=index*500+1,end=(index+1)*500;return "Lv"+start+"～"+end;}
 function regionsForPhase(phase){
  return (typeof WORLD_REGIONS!=="undefined"&&Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[]).filter(r=>phaseForLevel(r.min)===phase);
 }
 function allPhases(){
  const set=new Set((typeof WORLD_REGIONS!=="undefined"&&Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[]).map(r=>phaseForLevel(r.min)));
  return Array.from(set).sort((a,b)=>a-b);
 }
 function regionById(id){return (typeof WORLD_REGIONS!=="undefined"&&Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[]).find(r=>String(r.id)===String(id))||null;}
 function mapAt(index){return typeof MAPS!=="undefined"&&Array.isArray(MAPS)?MAPS[index]||null:null;}
 function enemyPreview(mapIndex,enemyIndex){
  try{
   if(typeof window.monsterObj==="function")return window.monsterObj(mapIndex,enemyIndex);
   if(typeof monsterObj==="function")return monsterObj(mapIndex,enemyIndex);
  }catch(e){}
  return null;
 }
 function currentHighestMapIndex(){
  const max=Math.max(0,(typeof MAPS!=="undefined"&&Array.isArray(MAPS)?MAPS.length:1)-1);
  return whole(typeof state!=="undefined"?state.unlockedMap:0,0,max);
 }
 function ensureSelection(){
  const phases=allPhases();
  if(!phases.length)return;
  if(!phases.includes(MODEL.phase))MODEL.phase=phases.includes(phaseForLevel(typeof state!=="undefined"?state.level:1))?phaseForLevel(state.level):phases[phases.length-1];
  const regions=regionsForPhase(MODEL.phase);
  if(!regions.some(r=>String(r.id)===String(MODEL.regionId)))MODEL.regionId=regions[0]?String(regions[0].id):"";
  const region=regionById(MODEL.regionId);
  if(region){
   if(MODEL.mapIndex<region.mapStart||MODEL.mapIndex>region.mapEnd)MODEL.mapIndex=region.mapStart;
  }
  const map=mapAt(MODEL.mapIndex);
  const count=Array.isArray(map&&map.enemies)?map.enemies.length:0;
  MODEL.enemyIndex=count?whole(MODEL.enemyIndex,0,count-1):0;
 }
 function useHighestSelection(){
  const mapIndex=currentHighestMapIndex(),map=mapAt(mapIndex);
  if(!map)return false;
  const region=(typeof WORLD_REGIONS!=="undefined"&&Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[]).find(r=>mapIndex>=r.mapStart&&mapIndex<=r.mapEnd);
  MODEL.phase=phaseForLevel(map.min||state.level);
  MODEL.regionId=region?String(region.id):MODEL.regionId;
  MODEL.mapIndex=mapIndex;
  MODEL.enemyIndex=Math.max(0,(Array.isArray(map.enemies)?map.enemies.length:1)-1);
  MODEL.outputResult=null;MODEL.defenseResult=null;MODEL.combatResult=null;
  return true;
 }
 function useHighestBenchmarkSelection(){
  if(benchmarkWorld()===1){const ok=useHighestSelection();if(ok)clearSelectionResults();return ok;}
  const regions=universeRegions();if(!regions.length)return false;
  const highest=typeof window.secondWorldHighestUnlockedBossIndex==="function"?whole(window.secondWorldHighestUnlockedBossIndex(),0,Math.max(0,(Number(window.SECOND_WORLD_BOSS_COUNT)||100)-1)):MODEL.universeBossIndex;
  const meta=universeBossMeta(highest);if(!meta)return false;
  MODEL.universeRegionIndex=whole(meta.regionIndex,0,regions.length-1);
  MODEL.universeBossIndex=meta.index;
  clearSelectionResults();
  return true;
 }
 function resetBenchmarkSession(){
  if(MODEL.busy)return false;
  const ok=typeof confirm!=="function"||confirm("確定要清除目前所有戰力基準測試結果並重新同步角色嗎？\n不會修改正式角色或存檔。");
  if(!ok)return false;
  MODEL.runs=100;
  MODEL.outputSource="selected";
  MODEL.defenseSource="selected";
  MODEL.customDef=0;
  MODEL.customAtk=0;
  MODEL.outputResult=null;
  MODEL.defenseResult=null;
  MODEL.combatResult=null;
  captureSnapshot();
  useHighestBenchmarkSelection();
  if(typeof render==="function")render();
  return true;
 }
 function captureSnapshot(){
  const stats=typeof window.playerCombatStats==="function"?window.playerCombatStats():{hp:1,atk:1,def:0,crit:0,dodge:0};
  const specs=typeof window.specializationLevelsSnapshot==="function"?window.specializationLevelsSnapshot(false):{};
  const marks=typeof window.markLevelsSnapshot==="function"?window.markLevelsSnapshot(false):{};
  const slots=Array.isArray(window.ENHANCEMENT_SLOTS)?window.ENHANCEMENT_SLOTS:["weapon","helmet","armor","shoes","accessory"];
  const enhancements=Object.fromEntries(slots.map(type=>[type,typeof window.enhancementLevel==="function"?window.enhancementLevel(state,type):whole(typeof state!=="undefined"&&state.enhancement&&state.enhancement.levels?state.enhancement.levels[type]:0,0,20)]));
  const equipment=Object.fromEntries(slots.map(type=>{
   const it=typeof state!=="undefined"&&state.equipment?state.equipment[type]:null;
   return [type,it?{name:String(it.name||""),level:whole(it.level,1),q:whole(it.q,0,5)}:null];
  }));
  MODEL.snapshot={
   capturedAt:Date.now(),level:whole(typeof state!=="undefined"?state.level:1,1),vipLevel:whole(typeof state!=="undefined"?state.vipLevel:0,0),vipPoints:whole(typeof state!=="undefined"?state.vipPoints:0,0),
   stats:{hp:whole(stats.hp,1),atk:whole(stats.atk,1),def:whole(stats.def,0),crit:one(stats.crit),dodge:one(stats.dodge)},
   specs,marks,enhancements,equipment
  };
  return MODEL.snapshot;
 }
 function snapshot(){return MODEL.snapshot||captureSnapshot();}
 function specText(s){
  const defs=window.SPECIALIZATION_DEFS||{};
  const keys=Array.isArray(window.SPECIALIZATION_KEYS)?window.SPECIALIZATION_KEYS:Object.keys(s.specs||{});
  return keys.map(k=>(defs[k]&&defs[k].name?defs[k].name:k)+" Lv."+whole(s.specs&&s.specs[k],0)).join("｜");
 }
 function formalMarkName(key){
  return typeof window.markDisplayName==="function"?window.markDisplayName(key):String(key);
 }
 function markText(s){
  const keys=Array.isArray(window.MARK_KEYS)?Array.from(window.MARK_KEYS):Object.keys(s.marks||{});
  return keys.map(k=>formalMarkName(k)+" Lv."+whole(s.marks&&s.marks[k],0)).join("｜");
 }
 function enhancementText(s){
  return Object.keys(s.enhancements||{}).map(k=>(SLOT_LABELS[k]||k)+" +"+whole(s.enhancements[k],0)).join("｜");
 }
 function equipmentText(s){
  return Object.keys(s.equipment||{}).map(k=>{
   const it=s.equipment[k];
   return (SLOT_LABELS[k]||k)+"："+(it?String(it.name)+" Lv."+it.level:"未裝備");
  }).join("｜");
 }
 function option(value,label,selected){return '<option value="'+value+'" '+(selected?'selected':'')+'>'+label+'</option>';}
 function benchmarkWorld(){return Number(MODEL.world)===2?2:1;}
 function benchmarkWorldLabel(){return benchmarkWorld()===2?"宇宙紀元":"銀河紀元";}
 function benchmarkWorldOptions(){
  return option(1,"銀河紀元",benchmarkWorld()===1)+option(2,"宇宙紀元",benchmarkWorld()===2);
 }
 function benchmarkSelectedEnemy(){
  if(benchmarkWorld()===2){
   normalizeUniverseSelection();
   const meta=universeBossMeta(MODEL.universeBossIndex);
   if(!meta)return null;
   const stats=typeof window.secondWorldBossBaseStats==="function"?window.secondWorldBossBaseStats(meta.index):null;
   return {
    world:2,id:meta.id||"",index:meta.index,name:String(meta.name||""),level:whole(meta.level,1),kind:"boss",
    hp:Math.max(0,num(stats?.hp,0)),atk:Math.max(0,num(stats?.atk,0)),def:Math.max(0,num(stats?.def,0)),
    crit:Math.max(0,num(stats?.crit,0)),dodge:Math.max(0,num(stats?.dodge,0)),traits:[]
   };
  }
  const e=enemyPreview(MODEL.mapIndex,MODEL.enemyIndex);
  return e?{...e,world:1,mapIndex:MODEL.mapIndex,enemyIndex:MODEL.enemyIndex}:null;
 }
 function clearSelectionResults(){
  MODEL.outputResult=null;MODEL.defenseResult=null;MODEL.combatResult=null;MODEL.universeCombatResult=null;
 }
 function phaseOptions(){
  return allPhases().map(p=>option(p,phaseLabel(p),p===MODEL.phase)).join("");
 }
 function regionOptions(){
  return regionsForPhase(MODEL.phase).map(r=>option(String(r.id),String(r.name||r.id),String(r.id)===String(MODEL.regionId))).join("");
 }
 function mapOptions(){
  const r=regionById(MODEL.regionId);if(!r)return "";
  const out=[];
  for(let i=r.mapStart;i<=r.mapEnd;i++){const m=mapAt(i);if(m)out.push(option(i,"Lv"+m.min+"～"+m.max+"｜"+m.name,i===MODEL.mapIndex));}
  return out.join("");
 }
 function enemyOptions(){
  const m=mapAt(MODEL.mapIndex);if(!m||!Array.isArray(m.enemies))return "";
  return m.enemies.map((row,i)=>option(i,"Lv"+row[1]+"｜"+row[0]+"｜"+(KIND_LABELS[row[2]]||row[2]),i===MODEL.enemyIndex)).join("");
 }
 function sourceEnemy(kind){
  if(benchmarkWorld()===2){
   const selected=benchmarkSelectedEnemy();
   if(kind==="selected"||kind==="custom")return selected;
   return null;
  }
  const m=mapAt(MODEL.mapIndex);if(!m||!Array.isArray(m.enemies))return null;
  if(kind==="selected")return enemyPreview(MODEL.mapIndex,MODEL.enemyIndex);
  const indexes=m.enemies.map((row,i)=>({row,i})).filter(x=>x.row[2]===kind).map(x=>x.i);
  if(!indexes.length)return null;
  return enemyPreview(MODEL.mapIndex,indexes[indexes.length-1]);
 }
 function sourceLabel(kind,stat){
  if(kind==="custom")return "自訂 "+stat;
  const e=sourceEnemy(kind);
  return e?(benchmarkWorld()===2?"宇宙紀元｜":"")+String(e.name)+" Lv."+whole(e.level,1):"無可用怪物";
 }
 function sourceValue(kind,stat){
  if(kind==="custom")return Math.max(0,num(stat==="DEF"?MODEL.customDef:MODEL.customAtk,0));
  const e=sourceEnemy(kind);return e?Math.max(0,num(e[stat.toLowerCase()],0)):0;
 }
 function normalizeBenchmarkSources(){
  if(benchmarkWorld()===2){
   if(!["selected","custom"].includes(MODEL.outputSource))MODEL.outputSource="selected";
   if(!["selected","custom"].includes(MODEL.defenseSource))MODEL.defenseSource="selected";
  }
 }
 function selectedEnemySummary(){
  const e=benchmarkSelectedEnemy();
  if(!e)return '<div class="muted">目前沒有可用怪物資料。</div>';
  const traits=e.world===2?"戰鬥時隨機":Array.isArray(e.traits)&&e.traits.length?e.traits.join("、"):"無";
  const statPrefix=e.world===2?"基礎 ":"";
  return '<div class="item"><b>目前基準怪物</b><div class="muted" style="margin-top:6px">'+benchmarkWorldLabel()+'｜'+e.name+' Lv.'+e.level+'｜'+(KIND_LABELS[e.kind]||e.kind)+'</div><div style="margin-top:5px">'+statPrefix+'HP '+fmt(e.hp)+'　ATK '+fmt(e.atk)+'　DEF '+fmt(e.def)+'　暴擊 '+one(e.crit||0)+'%　閃避 '+one(e.dodge||0)+'%</div><div class="muted" style="margin-top:5px">特性：'+traits+'</div></div>';
 }
 function snapshotHtml(){
  const s=snapshot(),st=s.stats;
  return '<div class="item"><b>目前角色基準</b><div class="muted gmpb-sub">執行戰力測試時會自動讀取目前正式角色狀態。</div>'+
   '<div style="margin-top:9px">Lv.'+s.level+'　VIP'+s.vipLevel+'（'+fmt(s.vipPoints)+' 積分）</div>'+
   '<div style="margin-top:6px"><b>HP '+fmt(st.hp)+'</b>　ATK '+fmt(st.atk)+'　DEF '+fmt(st.def)+'　暴擊 '+st.crit+'%　閃避 '+st.dodge+'%</div>'+
   '<details style="margin-top:9px"><summary>養成狀態</summary><div class="muted" style="margin-top:7px;line-height:1.6">'+
   '<div>'+enhancementText(s)+'</div><div>'+specText(s)+'</div><div>'+markText(s)+'</div><div>'+equipmentText(s)+'</div></div></details></div>';
 }
 function sourceOptions(selected){
  const rows=benchmarkWorld()===2?[["selected","目前選擇怪物"],["custom","自訂"]]:[["selected","目前選擇怪物"],["normal","本地圖最高普通怪"],["elite","本地圖菁英"],["boss","本地圖 Boss"],["custom","自訂"]];
  return rows.map(x=>option(x[0],x[1],selected===x[0])).join("");
 }
 function metric(label,value){return '<div class="item gmpb-metric"><div class="muted" style="font-size:12px">'+label+'</div><b style="display:block;margin-top:3px">'+value+'</b></div>';}
 function metricFieldsHtml(fields){return fields.map(([label,value])=>metric(label,value)).join("");}
 function summaryFieldLines(fields,size=3){
  const lines=[];
  for(let i=0;i<fields.length;i+=size)lines.push(fields.slice(i,i+size).map(([label,value])=>label+" "+value).join("｜"));
  return lines;
 }
 function outputFields(r){
  return [
   ["平均每回合有效輸出",fmt(r.avgRoundDamage)],["平均單次命中",fmt(r.avgHitDamage)],["最低／最高單次",fmt(r.minHit)+" / "+fmt(r.maxHit)],["實際暴擊率",r.critRate+"%"],
   ["平均普通攻擊",fmt(r.avgNormalDamage)],["平均暴擊傷害",fmt(r.avgCritDamage)],["每回合平均連擊",r.avgCombos],["連擊傷害占比",r.comboDamageShare+"%"],
   ["穿透觸發率",r.penetrationRate+"%"],["無視 DEF 觸發率",r.ignoreRate+"%"],["先制攻擊平均傷害",fmt(r.avgInitiativeDamage)],["汲取觸發率",r.drainRate+"%"]
  ];
 }
 function defenseFields(r){
  return [
   ["平均可承受回合",r.avgSurvivalTurns],["平均每回合 HP 損失",fmt(r.avgTurnLoss)],["平均命中後 HP 損失",fmt(r.avgHitLoss)],["最低／最高單次 HP 損失",fmt(r.minLoss)+" / "+fmt(r.maxLoss)],
   ["玩家實際閃避率",r.dodgeRate+"%"],["敵人命中後暴擊率",r.enemyCritRate+"%"],["護盾平均吸收／場",fmt(r.avgShieldAbsorb)],["吸收印記觸發率",r.absorptionRate+"%"],
   ["反擊平均次數／場",r.avgCounters],["反噬平均傷害／場",fmt(r.avgBacklashDamage)],["不屈救命率",r.indomitableRate+"%"],["達測試上限",r.capped+" 場"]
  ];
 }
 function outputResultHtml(){
  const r=MODEL.outputResult;if(!r)return '<div class="muted">尚未執行輸出測試。</div>';
  return '<div style="margin-top:10px"><div class="muted">'+r.sourceLabel+'｜DEF '+fmt(r.targetDef)+'｜'+r.runs.toLocaleString()+' 次</div><div class="gmpb-metrics">'+metricFieldsHtml(outputFields(r))+'</div></div>';
 }
 function defenseResultHtml(){
  const r=MODEL.defenseResult;if(!r)return '<div class="muted">尚未執行承傷測試。</div>';
  return '<div style="margin-top:10px"><div class="muted">'+r.sourceLabel+'｜ATK '+fmt(r.targetAtk)+'｜'+r.runs.toLocaleString()+' 場</div><div class="gmpb-metrics">'+metricFieldsHtml(defenseFields(r))+'</div></div>';
 }
 async function runOutputTask(){
  normalizeBenchmarkSources();
  const s=captureSnapshot(),player={...s.stats};
  const source=MODEL.outputSource,base=sourceEnemy(source),targetDef=sourceValue(source,"DEF"),runs=MODEL.runs;
  if(source!=="custom"&&!base)return false;
  const dummyHp=Math.max(1e12,player.atk*1000000);
  let total=0,hits=0,min=Infinity,max=0,crits=0,critDamage=0,normalHits=0,normalDamage=0,combos=0,comboDamage=0,penetrations=0,ignores=0,initiativeHits=0,initiativeDamage=0,drains=0;
  await runBatched(runs,()=>{
   const e={name:"輸出木樁",level:whole(base&&base.level,1),kind:String(base&&base.kind||"normal"),hp:dummyHp,atk:0,def:targetDef,crit:0,dodge:0};
   const result=window.runCombatCore(player,e,player.hp,{logs:false,maxTurns:1,skipEnemyAction:true,preparePresentation:false,markLevels:s.marks});
   (result.events||[]).forEach(ev=>{
    if(ev.type==="combo"){combos++;return;}
    if(ev.type==="drain"){drains++;return;}
    if(ev.type!=="attack"||ev.actor!=="player")return;
    const d=Math.max(0,num(ev.actualDamage,0));total+=d;hits++;min=Math.min(min,d);max=Math.max(max,d);
    if(ev.crit){crits++;critDamage+=d;}
    if(ev.source==="normal"){normalHits++;normalDamage+=d;}
    if(ev.source==="combo")comboDamage+=d;
    if(ev.penetration)penetrations++;
    if(ev.ignoreDefense)ignores++;
    if(ev.initiative){initiativeHits++;initiativeDamage+=d;}
   });
  });
  MODEL.outputResult={
   world:benchmarkWorld(),sourceLabel:sourceLabel(source,"DEF"),targetDef,runs,
   avgRoundDamage:total/runs,avgHitDamage:hits?total/hits:0,minHit:min===Infinity?0:min,maxHit:max,
   critRate:pct(crits,hits),avgCritDamage:crits?critDamage/crits:0,avgNormalDamage:normalHits?normalDamage/normalHits:0,
   avgCombos:one(combos/runs),comboDamageShare:pct(comboDamage,total),penetrationRate:pct(penetrations,hits),ignoreRate:pct(ignores,hits),
   avgInitiativeDamage:initiativeHits?initiativeDamage/initiativeHits:0,drainRate:pct(drains,hits)
  };
  return true;
 }
 function runOutput(){return withBenchmarkBusy("output",runOutputTask);}

 async function runDefenseTask(){
  normalizeBenchmarkSources();
  const s=captureSnapshot(),player={...s.stats};
  const source=MODEL.defenseSource,base=source==="custom"?sourceEnemy("selected"):sourceEnemy(source);
  const targetAtk=sourceValue(source,"ATK"),runs=MODEL.runs,dummyHp=Math.max(1e12,player.atk*1000000);
  if(!base)return false;
  let totalTurns=0,totalLoss=0,landed=0,min=Infinity,max=0,dodges=0,crits=0,shield=0,absorptions=0,counters=0,backlash=0,indomitable=0,capped=0;
  await runBatched(runs,()=>{
   const e={name:"承傷木樁",level:whole(base&&base.level,1),kind:String(base&&base.kind||"normal"),hp:dummyHp,atk:targetAtk,def:Math.max(0,num(base&&base.def,0)),crit:Math.max(0,num(base&&base.crit,0)),dodge:Math.max(0,num(base&&base.dodge,0))};
   const result=window.runCombatCore(player,e,player.hp,{logs:false,maxTurns:10000,skipPlayerAction:true,preparePresentation:false,markLevels:s.marks});
   totalTurns+=result.turns;if(result.hp>0)capped++;
   (result.events||[]).forEach(ev=>{
    if(ev.type==="dodge"&&ev.target==="player"){dodges++;return;}
    if(ev.type==="attack"&&ev.actor==="enemy"){
     const loss=Math.max(0,num(ev.actualDamage,0));totalLoss+=loss;landed++;min=Math.min(min,loss);max=Math.max(max,loss);if(ev.crit)crits++;shield+=Math.max(0,num(ev.shieldAbsorbed,0));return;
    }
    if(ev.type==="counter")counters++;
    if(ev.type==="mark"&&ev.mark==="absorption"&&ev.action==="trigger")absorptions++;
    if(ev.type==="mark"&&ev.mark==="backlash"&&ev.action==="trigger")backlash+=Math.max(0,num(ev.actualDamage,ev.damage));
    if(ev.type==="mark"&&ev.mark==="indomitable"&&ev.action==="survive")indomitable++;
   });
  });
  MODEL.defenseResult={
   world:benchmarkWorld(),sourceLabel:sourceLabel(source,"ATK"),targetAtk,runs,
   avgSurvivalTurns:one(totalTurns/runs),avgTurnLoss:totalTurns?totalLoss/totalTurns:0,avgHitLoss:landed?totalLoss/landed:0,minLoss:min===Infinity?0:min,maxLoss:max,
   dodgeRate:pct(dodges,totalTurns),enemyCritRate:pct(crits,landed),avgShieldAbsorb:shield/runs,absorptionRate:pct(absorptions,totalTurns),
   avgCounters:one(counters/runs),avgBacklashDamage:backlash/runs,indomitableRate:pct(indomitable,runs),capped
  };
  return true;
 }
 function runDefense(){return withBenchmarkBusy("defense",runDefenseTask);}

 function freshEncounter(mapIndex,enemyIndex){
  try{
   if(typeof createMonsterEncounter==="function")return createMonsterEncounter(mapIndex,enemyIndex);
  }catch(e){}
  const preview=enemyPreview(mapIndex,enemyIndex);
  return preview?JSON.parse(JSON.stringify(preview)):null;
 }
 function traitName(key){
  const defs=typeof MONSTER_TRAITS!=="undefined"&&MONSTER_TRAITS?MONSTER_TRAITS:{};
  return defs[key]&&defs[key].name?defs[key].name:key;
 }
 async function combatRow(mapIndex,enemyIndex,runs,s){
  const m=mapAt(mapIndex),row=m&&Array.isArray(m.enemies)?m.enemies[enemyIndex]:null;
  if(!row)return null;
  const player={...s.stats};
  let wins=0,totalTurns=0,minTurns=Infinity,maxTurns=0,winHpPct=0,lossEnemyHpPct=0,losses=0;
  let playerDamage=0,enemyDamage=0,playerHits=0,playerCrits=0,enemyHits=0,enemyCrits=0,playerDodges=0,enemyDodges=0;
  let enemyHp=0,enemyAtk=0,enemyDef=0,enemyCrit=0,enemyDodge=0;
  const specs={initiative:0,combo:0,penetration:0,counter:0,drain:0};
  const marks={},traits={};
  await runBatched(runs,()=>{
   const e=freshEncounter(mapIndex,enemyIndex);
   if(!e)return;
   enemyHp+=Math.max(0,num(e.hp,0));enemyAtk+=Math.max(0,num(e.atk,0));enemyDef+=Math.max(0,num(e.def,0));enemyCrit+=Math.max(0,num(e.crit,0));enemyDodge+=Math.max(0,num(e.dodge,0));
   (Array.isArray(e.traits)?e.traits:[]).forEach(k=>{traits[k]=(traits[k]||0)+1;});
   const result=window.runCombatCore(player,e,player.hp,{logs:false,preparePresentation:false,markLevels:s.marks});
   const turns=Math.max(0,whole(result.turns,0));totalTurns+=turns;minTurns=Math.min(minTurns,turns);maxTurns=Math.max(maxTurns,turns);
   if(result.win){wins++;winHpPct+=player.hp>0?Math.max(0,num(result.hp,0))/player.hp*100:0;}
   else{losses++;lossEnemyHpPct+=result.enemyMaxHp>0?Math.max(0,num(result.enemyHp,0))/result.enemyMaxHp*100:0;}
   result.events.forEach(ev=>{
    if(ev.type==="attack"&&ev.actor==="player"){
     const d=Math.max(0,num(ev.actualDamage,0));playerDamage+=d;playerHits++;if(ev.crit)playerCrits++;
     if(ev.initiative)specs.initiative++;if(ev.penetration)specs.penetration++;
     return;
    }
    if(ev.type==="attack"&&ev.actor==="enemy"){
     enemyDamage+=Math.max(0,num(ev.actualDamage,0));enemyHits++;if(ev.crit)enemyCrits++;return;
    }
    if(ev.type==="dodge"&&ev.target==="player"){playerDodges++;return;}
    if(ev.type==="dodge"&&ev.target==="enemy"){enemyDodges++;return;}
    if(ev.type==="combo"){specs.combo++;return;}
    if(ev.type==="counter"){specs.counter++;return;}
    if(ev.type==="drain"){specs.drain++;return;}
    if(ev.type==="mark"){const key=String(ev.mark||"unknown");marks[key]=(marks[key]||0)+1;}
   });
  });
  const completed=Math.max(1,runs);
  const playerAttempts=playerHits+enemyDodges,enemyAttempts=enemyHits+playerDodges;
  return {
   mapIndex,enemyIndex,name:String(row[0]||""),level:whole(row[1],1),kind:String(row[2]||"normal"),runs,
   avgEnemy:{hp:enemyHp/completed,atk:enemyAtk/completed,def:enemyDef/completed,crit:one(enemyCrit/completed),dodge:one(enemyDodge/completed)},
   winRate:pct(wins,runs),wins,losses,avgTurns:one(totalTurns/completed),minTurns:minTurns===Infinity?0:minTurns,maxTurns,
   avgWinHpPct:wins?one(winHpPct/wins):0,avgLossEnemyHpPct:losses?one(lossEnemyHpPct/losses):0,
   avgPlayerTotalDamage:playerDamage/completed,avgEnemyTotalDamage:enemyDamage/completed,
   avgPlayerRoundDamage:totalTurns?playerDamage/totalTurns:0,avgEnemyRoundDamage:totalTurns?enemyDamage/totalTurns:0,
   playerCritRate:pct(playerCrits,playerHits),playerDodgeRate:pct(playerDodges,enemyAttempts),
   enemyCritRate:pct(enemyCrits,enemyHits),enemyDodgeRate:pct(enemyDodges,playerAttempts),
   specs:Object.fromEntries(Object.entries(specs).map(([k,v])=>[k,one(v/completed)])),
   marks:Object.fromEntries(Object.entries(marks).map(([k,v])=>[k,one(v/completed)])),
   traits:Object.fromEntries(Object.entries(traits).map(([k,v])=>[k,pct(v,completed)]))
  };
 }
 async function runCombatTask(mode){
  const s=captureSnapshot(),runs=MODEL.runs;
  if(benchmarkWorld()===2){
   const row=await universeCombatRow(MODEL.universeBossIndex,runs,s);
   if(!row)return false;
   const region=universeRegionMeta(MODEL.universeRegionIndex);
   MODEL.combatResult={world:2,mode:"single",bossIndex:MODEL.universeBossIndex,mapName:region?String(region.name||"宇宙紀元"):"宇宙紀元",runs,rows:[row]};
   MODEL.universeCombatResult=null;
   return true;
  }
  const m=mapAt(MODEL.mapIndex);
  if(!m||!Array.isArray(m.enemies)||!m.enemies.length)return false;
  const indexes=mode==="map"?m.enemies.map((_,i)=>i):[MODEL.enemyIndex],rows=[];
  for(const i of indexes){
   const row=await combatRow(MODEL.mapIndex,i,runs,s);
   if(row)rows.push(row);
  }
  MODEL.combatResult={world:1,mode:mode==="map"?"map":"single",mapIndex:MODEL.mapIndex,mapName:String(m.name||""),runs,rows};
  return true;
 }
 function runCombatBenchmark(mode){
  const universe=benchmarkWorld()===2;
  return withBenchmarkBusy(universe?"combat-single":mode==="map"?"combat-map":"combat-single",()=>runCombatTask(universe?"single":mode));
 }

 function universeRegions(){
  return Array.isArray(window.SECOND_WORLD_REGIONS)?window.SECOND_WORLD_REGIONS:[];
 }
 function universeRegionMeta(index=MODEL.universeRegionIndex){
  const regions=universeRegions();
  return regions[whole(index,0,Math.max(0,regions.length-1))]||null;
 }
 function universeBossesForRegion(index=MODEL.universeRegionIndex){
  if(typeof window.secondWorldBossesForRegion==="function")return window.secondWorldBossesForRegion(index);
  const region=universeRegionMeta(index),bosses=Array.isArray(window.SECOND_WORLD_BOSSES)?window.SECOND_WORLD_BOSSES:[];
  return region?bosses.filter(b=>Number(b.regionIndex)===Number(region.index)):[];
 }
 function normalizeUniverseSelection(){
  const regions=universeRegions();
  if(!regions.length){MODEL.universeRegionIndex=0;MODEL.universeBossIndex=0;return;}
  MODEL.universeRegionIndex=whole(MODEL.universeRegionIndex,0,regions.length-1);
  const bosses=universeBossesForRegion(MODEL.universeRegionIndex);
  if(!bosses.length){MODEL.universeBossIndex=0;return;}
  if(!bosses.some(b=>b.index===MODEL.universeBossIndex))MODEL.universeBossIndex=bosses[0].index;
 }
 function universeBossMeta(index=MODEL.universeBossIndex){
  return typeof window.secondWorldBoss==="function"?window.secondWorldBoss(whole(index,0,Math.max(0,(Number(window.SECOND_WORLD_BOSS_COUNT)||100)-1))):null;
 }
 function universeRegionOptions(){
  normalizeUniverseSelection();
  return universeRegions().map((region,i)=>option(i,region.name+"｜Lv."+region.minLevel+"～"+region.maxLevel,i===MODEL.universeRegionIndex)).join("");
 }
 function universeBossOptions(){
  normalizeUniverseSelection();
  return universeBossesForRegion(MODEL.universeRegionIndex).map(b=>option(b.index,"Boss "+(b.index+1)+"｜"+b.name+" Lv."+b.level,b.index===MODEL.universeBossIndex)).join("");
 }
 async function universeCombatRow(index,runs,s){
  const meta=universeBossMeta(index);if(!meta||typeof window.secondWorldBossEncounter!=="function")return null;
  const player={...s.stats};
  let wins=0,totalTurns=0,minTurns=Infinity,maxTurns=0,winHpPct=0,lossEnemyHpPct=0,losses=0;
  let playerDamage=0,enemyDamage=0,playerHits=0,playerCrits=0,enemyHits=0,enemyCrits=0,playerDodges=0,enemyDodges=0;
  let enemyHp=0,enemyAtk=0,enemyDef=0,enemyCrit=0,enemyDodge=0;
  const specs={initiative:0,combo:0,penetration:0,counter:0,drain:0},marks={},traits={};
  await runBatched(runs,()=>{
   const e=window.secondWorldBossEncounter(index);
   if(!e)return;
   enemyHp+=Math.max(0,num(e.hp,0));enemyAtk+=Math.max(0,num(e.atk,0));enemyDef+=Math.max(0,num(e.def,0));enemyCrit+=Math.max(0,num(e.crit,0));enemyDodge+=Math.max(0,num(e.dodge,0));
   (Array.isArray(e.traits)?e.traits:[]).forEach(k=>{traits[k]=(traits[k]||0)+1;});
   const result=window.runCombatCore(player,e,player.hp,{logs:false,preparePresentation:false,markLevels:s.marks});
   const turns=Math.max(0,whole(result.turns,0));totalTurns+=turns;minTurns=Math.min(minTurns,turns);maxTurns=Math.max(maxTurns,turns);
   if(result.win){wins++;winHpPct+=player.hp>0?Math.max(0,num(result.hp,0))/player.hp*100:0;}
   else{losses++;lossEnemyHpPct+=result.enemyMaxHp>0?Math.max(0,num(result.enemyHp,0))/result.enemyMaxHp*100:0;}
   (result.events||[]).forEach(ev=>{
    if(ev.type==="attack"&&ev.actor==="player"){const d=Math.max(0,num(ev.actualDamage,0));playerDamage+=d;playerHits++;if(ev.crit)playerCrits++;if(ev.initiative)specs.initiative++;if(ev.penetration)specs.penetration++;return;}
    if(ev.type==="attack"&&ev.actor==="enemy"){enemyDamage+=Math.max(0,num(ev.actualDamage,0));enemyHits++;if(ev.crit)enemyCrits++;return;}
    if(ev.type==="dodge"&&ev.target==="player"){playerDodges++;return;}
    if(ev.type==="dodge"&&ev.target==="enemy"){enemyDodges++;return;}
    if(ev.type==="combo"){specs.combo++;return;}
    if(ev.type==="counter"){specs.counter++;return;}
    if(ev.type==="drain"){specs.drain++;return;}
    if(ev.type==="mark"){const key=String(ev.mark||"unknown");marks[key]=(marks[key]||0)+1;}
   });
  });
  const completed=Math.max(1,runs),playerAttempts=playerHits+enemyDodges,enemyAttempts=enemyHits+playerDodges;
  return {
   bossIndex:index,name:meta.name,level:meta.level,kind:"boss",runs,
   avgEnemy:{hp:enemyHp/completed,atk:enemyAtk/completed,def:enemyDef/completed,crit:one(enemyCrit/completed),dodge:one(enemyDodge/completed)},
   winRate:pct(wins,runs),wins,losses,avgTurns:one(totalTurns/completed),minTurns:minTurns===Infinity?0:minTurns,maxTurns,
   avgWinHpPct:wins?one(winHpPct/wins):0,avgLossEnemyHpPct:losses?one(lossEnemyHpPct/losses):0,
   avgPlayerTotalDamage:playerDamage/completed,avgEnemyTotalDamage:enemyDamage/completed,
   avgPlayerRoundDamage:totalTurns?playerDamage/totalTurns:0,avgEnemyRoundDamage:totalTurns?enemyDamage/totalTurns:0,
   playerCritRate:pct(playerCrits,playerHits),playerDodgeRate:pct(playerDodges,enemyAttempts),
   enemyCritRate:pct(enemyCrits,enemyHits),enemyDodgeRate:pct(enemyDodges,playerAttempts),
   specs:Object.fromEntries(Object.entries(specs).map(([k,v])=>[k,one(v/completed)])),
   marks:Object.fromEntries(Object.entries(marks).map(([k,v])=>[k,one(v/completed)])),
   traits:Object.fromEntries(Object.entries(traits).map(([k,v])=>[k,pct(v,completed)]))
  };
 }
 async function runUniverseCombatTask(){
  const s=captureSnapshot(),row=await universeCombatRow(MODEL.universeBossIndex,MODEL.runs,s);
  if(!row)return false;
  MODEL.universeCombatResult={runs:MODEL.runs,row};
  return true;
 }
 function runUniverseCombatBenchmark(){return withBenchmarkBusy("combat-universe",runUniverseCombatTask);}
 function entryText(entries,formatter,empty="無"){
  const rows=Object.entries(entries||{});
  return rows.length?rows.map(([k,v])=>formatter(k,v)).join("｜"):empty;
 }
 function detailLine(title,entries,formatter){
  return '<div class="muted">'+title+'：'+entryText(entries,formatter)+'</div>';
 }
 function specializationName(key){
  const defs=window.SPECIALIZATION_DEFS||{};
  return defs[key]&&defs[key].name?String(defs[key].name):String(key);
 }
 function combatPrimaryFields(r){
  return [
   ["勝率",r.winRate+"%"],["平均戰鬥回合",r.avgTurns],["勝利平均剩餘 HP",r.avgWinHpPct+"%"],["失敗時敵人剩餘 HP",r.avgLossEnemyHpPct+"%"],
   ["玩家每回合傷害",fmt(r.avgPlayerRoundDamage)],["敵人每回合傷害",fmt(r.avgEnemyRoundDamage)]
  ];
 }
 function combatDetailFields(r){
  return [
   ["最短／最長回合",r.minTurns+" / "+r.maxTurns],["玩家平均總傷害",fmt(r.avgPlayerTotalDamage)],["敵人平均總傷害",fmt(r.avgEnemyTotalDamage)],
   ["玩家暴擊",r.playerCritRate+"%"],["玩家閃避",r.playerDodgeRate+"%"],["敵人暴擊",r.enemyCritRate+"%"],["敵人閃避",r.enemyDodgeRate+"%"]
  ];
 }
 function combatEventGroups(r){
  return [
   ["專精平均觸發／場",r.specs,(k,v)=>specializationName(k)+" "+v],
   ["印記事件平均／場",r.marks,(k,v)=>formalMarkName(k)+" "+v],
   ["怪物特性出現率",r.traits,(k,v)=>traitName(k)+" "+v+"%"]
  ];
 }
 function combatRowHtml(r){
  const details=summaryFieldLines(combatDetailFields(r),3).map(line=>'<div class="muted">'+line+'</div>').join("");
  const events=combatEventGroups(r).map(([title,entries,formatter])=>detailLine(title,entries,formatter)).join("");
  return '<div class="item gmpb-combat-card"><div><b>'+r.name+' Lv.'+r.level+'</b>　<span class="muted">'+(KIND_LABELS[r.kind]||r.kind)+'｜'+r.runs.toLocaleString()+' 場</span></div>'+
   '<div class="muted" style="margin-top:5px">隨機特性後平均：HP '+fmt(r.avgEnemy.hp)+'｜ATK '+fmt(r.avgEnemy.atk)+'｜DEF '+fmt(r.avgEnemy.def)+'｜暴擊 '+r.avgEnemy.crit+'%｜閃避 '+r.avgEnemy.dodge+'%</div>'+
   '<div class="gmpb-metrics">'+metricFieldsHtml(combatPrimaryFields(r))+'</div><details style="margin-top:8px"><summary>詳細統計</summary><div style="margin-top:8px;line-height:1.65">'+details+events+'</div></details></div>';
 }
 function universeCombatResultHtml(){
  const result=MODEL.universeCombatResult;
  if(!result?.row)return '<div class="muted">尚未執行宇宙紀元 Boss 實戰基準。</div>';
  return '<div style="margin-top:10px">'+combatRowHtml(result.row)+'</div>';
 }
 function combatResultHtml(){
  const result=MODEL.combatResult;
  if(!result)return '<div class="muted">尚未執行主線實戰基準。</div>';
  const scope=Number(result.world)===2?"宇宙紀元｜單隻 Boss":result.mode==="map"?"地圖 5 隻全部":"單隻怪";
  return '<div style="margin-top:10px"><div class="muted">'+result.mapName+'｜'+scope+'｜每隻 '+result.runs.toLocaleString()+' 場</div>'+
   result.rows.map(combatRowHtml).join("")+'</div>';
 }

 function summaryText(){
  const s=snapshot(),st=s.stats,m=mapAt(MODEL.mapIndex),lines=[];
  lines.push("《文明戰線・戰力基準測試》");
  lines.push("角色：Lv."+s.level+"｜VIP"+s.vipLevel+"（"+fmt(s.vipPoints)+" 積分）");
  lines.push("能力：HP "+fmt(st.hp)+"｜ATK "+fmt(st.atk)+"｜DEF "+fmt(st.def)+"｜暴擊 "+st.crit+"%｜閃避 "+st.dodge+"%");
  lines.push("強化："+enhancementText(s));
  lines.push("專精："+specText(s));
  lines.push("印記："+markText(s));
  lines.push("裝備："+equipmentText(s));
  lines.push("基準："+(m?("Lv"+m.min+"～"+m.max+"｜"+m.name):"未選擇地圖")+"｜測試量 "+MODEL.runs);

  if(MODEL.outputResult){
   const r=MODEL.outputResult;
   lines.push("");
   lines.push("【輸出基準】"+r.sourceLabel+"｜DEF "+fmt(r.targetDef)+"｜"+r.runs+" 次");
   lines.push(...summaryFieldLines(outputFields(r),3));
  }

  if(MODEL.defenseResult){
   const r=MODEL.defenseResult;
   lines.push("");
   lines.push("【承傷／生存基準】"+r.sourceLabel+"｜ATK "+fmt(r.targetAtk)+"｜"+r.runs+" 場");
   lines.push(...summaryFieldLines(defenseFields(r),3));
  }

  if(MODEL.combatResult){
   lines.push("");
   lines.push("【主線實戰】"+MODEL.combatResult.mapName+"｜"+(MODEL.combatResult.mode==="map"?"地圖 5 隻全部":"單隻怪")+"｜每隻 "+MODEL.combatResult.runs+" 場");
   MODEL.combatResult.rows.forEach((r,index)=>{
    if(index>0)lines.push("");
    lines.push("Lv."+r.level+" "+r.name+"（"+(KIND_LABELS[r.kind]||r.kind)+"）");
    lines.push("隨機特性後平均：HP "+fmt(r.avgEnemy.hp)+"｜ATK "+fmt(r.avgEnemy.atk)+"｜DEF "+fmt(r.avgEnemy.def)+"｜暴擊 "+r.avgEnemy.crit+"%｜閃避 "+r.avgEnemy.dodge+"%");
    lines.push("勝敗場數 "+r.wins+" 勝 / "+r.losses+" 敗");
    lines.push(...summaryFieldLines(combatPrimaryFields(r),3));
    lines.push(...summaryFieldLines(combatDetailFields(r),3));
    combatEventGroups(r).forEach(([title,entries,formatter])=>lines.push(title+"："+entryText(entries,formatter)));
   });
  }

  if(MODEL.universeCombatResult?.row){
   const r=MODEL.universeCombatResult.row;
   lines.push("");
   lines.push("【宇宙紀元 Boss 實戰】Lv."+r.level+" "+r.name+"｜"+r.runs+" 場");
   lines.push("隨機特性後平均：HP "+fmt(r.avgEnemy.hp)+"｜ATK "+fmt(r.avgEnemy.atk)+"｜DEF "+fmt(r.avgEnemy.def)+"｜暴擊 "+r.avgEnemy.crit+"%｜閃避 "+r.avgEnemy.dodge+"%");
   lines.push("勝敗場數 "+r.wins+" 勝 / "+r.losses+" 敗");
   lines.push(...summaryFieldLines(combatPrimaryFields(r),3));
   lines.push(...summaryFieldLines(combatDetailFields(r),3));
   combatEventGroups(r).forEach(([title,entries,formatter])=>lines.push(title+"："+entryText(entries,formatter)));
  }

  if(!MODEL.outputResult&&!MODEL.defenseResult&&!MODEL.combatResult&&!MODEL.universeCombatResult){
   lines.push("");
   lines.push("尚未執行輸出、承傷或主線實戰測試。");
  }
  return lines.join("\n");
 }
 async function copySummary(){
  const text=summaryText();let ok=false;
  try{if(typeof navigator!=="undefined"&&navigator.clipboard&&typeof navigator.clipboard.writeText==="function"){await navigator.clipboard.writeText(text);ok=true;}}catch(e){}
  if(!ok&&typeof document!=="undefined"){
   const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.focus();ta.select();try{ok=document.execCommand("copy");}catch(e){}ta.remove();
  }
  if(typeof alert==="function")alert(ok?"測試摘要已複製。":"無法自動複製，請長按下方摘要文字手動複製。");
  return ok;
 }
 function summaryHtml(){
  const s=snapshot(),o=MODEL.outputResult,d=MODEL.defenseResult,cmb=MODEL.combatResult,universe=MODEL.universeCombatResult?.row||null;
  const combatRows=cmb&&Array.isArray(cmb.rows)?cmb.rows:[];
  const avgWin=combatRows.length?one(combatRows.reduce((a,r)=>a+num(r.winRate,0),0)/combatRows.length):null;
  const avgTurns=combatRows.length?one(combatRows.reduce((a,r)=>a+num(r.avgTurns,0),0)/combatRows.length):null;
  return '<div class="item"><div class="gmpb-title"><b>測試摘要</b><span class="muted">方便直接貼給 ChatGPT 做下一階段平衡</span></div>'+
   '<div class="gmpb-summary-main">'+metric("角色","Lv."+s.level+" / VIP"+s.vipLevel)+metric("基準地圖",mapAt(MODEL.mapIndex)?mapAt(MODEL.mapIndex).name:"未選擇")+
   metric("平均回合輸出",o?fmt(o.avgRoundDamage):"尚未測試")+metric("平均回合承傷",d?fmt(d.avgTurnLoss):"尚未測試")+
   metric("銀河實戰平均勝率",avgWin==null?"尚未測試":avgWin+"%")+metric("宇宙 Boss 勝率",universe?universe.winRate+"%":"尚未測試")+'</div>'+
   '<div class="gmpb-actions"><button class="btn blue" type="button" onclick="gmPowerBenchmarkCopySummary()">複製測試摘要</button></div>'+
   '<details style="margin-top:8px"><summary>查看純文字摘要</summary><div class="gmpb-summary-text">'+summaryText().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</div></details></div>';
 }

 function html(){
  installStyles();ensureSelection();normalizeUniverseSelection();snapshot();
  const disabled=busyDisabled(),world=benchmarkWorld();
  const selectionControls=world===2
   ?'<label>紀元<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetWorld(this.value)">'+benchmarkWorldOptions()+'</select></label>'+
    '<label>區域<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetUniverseRegion(this.value)">'+universeRegionOptions()+'</select></label>'+
    '<label style="grid-column:span 2">怪物<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetUniverseBoss(this.value)">'+universeBossOptions()+'</select></label>'+
    '<label>測試量<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetRuns(this.value)">'+option(100,"100",MODEL.runs===100)+option(1000,"1000",MODEL.runs===1000)+'</select></label>'
   :'<label>紀元<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetWorld(this.value)">'+benchmarkWorldOptions()+'</select></label>'+
    '<label>大區域<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetRegion(this.value)">'+regionOptions()+'</select></label>'+
    '<label>地圖<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetMap(this.value)">'+mapOptions()+'</select></label>'+
    '<label>怪物<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetEnemy(this.value)">'+enemyOptions()+'</select></label>'+
    '<label>測試量<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetRuns(this.value)">'+option(100,"100",MODEL.runs===100)+option(1000,"1000",MODEL.runs===1000)+'</select></label>';
  const highestLabel=world===2?"使用目前最高 Boss":"使用目前最高地圖";
  const phaseNotice=world===2?'<div class="muted" style="margin-top:8px">宇宙紀元沒有地圖層；本批先完成「紀元 → 區域 → 怪物」共用選擇架構。輸出／承傷／實戰運算將於下一批接入目前宇宙怪物。</div>':"";
  const universeDisabled=world===2?" disabled":"";
  return '<div class="gm-power-benchmark"><div class="muted gm-hub-note">完整平衡分析工具：先選擇紀元，再讀取該紀元正式主線怪物資料。銀河紀元使用「區域 → 地圖 → 怪物」；宇宙紀元使用「區域 → 怪物」。本工具只做沙盒模擬，不修改正式角色、獎勵、進度或存檔。</div>'+
   '<div class="item"><b>測試基準設定</b><div class="gmpb-controls">'+selectionControls+'</div>'+
   '<div class="gmpb-actions"><button class="btn" type="button"'+disabled+' onclick="gmPowerBenchmarkUseHighest()">'+highestLabel+'</button><button class="btn" type="button"'+disabled+' onclick="gmPowerBenchmarkReset()">重置測試</button></div>'+phaseNotice+'</div>'+
   selectedEnemySummary()+snapshotHtml()+
   '<div class="item"><b>輸出基準測試</b><div class="muted" style="margin-top:5px">敵人不還手；使用正式傷害、暴擊、先制、連擊、穿透與印記規則。防禦來源可獨立選擇。</div>'+
   (world===2?'<div class="notice" style="margin-top:9px">宇宙紀元輸出基準將於第 2 批接入目前選擇 Boss；本批先停用，避免誤用銀河怪物資料。</div>':
   '<div class="gmpb-controls"><label>目標 DEF<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetOutputSource(this.value)">'+sourceOptions(MODEL.outputSource)+'</select></label>'+
   '<label>自訂 DEF<br><input class="btn"'+disabled+' type="number" min="0" value="'+whole(MODEL.customDef,0)+'" onchange="gmPowerBenchmarkSetCustomDef(this.value)"></label>'+
   '<button class="btn blue" type="button"'+disabled+' onclick="gmPowerBenchmarkRunOutput()">'+busyLabel("output","開始輸出測試")+'</button></div>'+outputResultHtml())+'</div>'+
   '<div class="item"><b>承傷／生存基準測試</b><div class="muted" style="margin-top:5px">玩家不主動攻擊；每場從滿 HP 開始直到倒下。保留正式閃避、護盾、吸收、不屈、反擊與反噬規則。</div>'+
   (world===2?'<div class="notice" style="margin-top:9px">宇宙紀元承傷基準將於第 2 批接入目前選擇 Boss；本批先停用，避免誤用銀河怪物資料。</div>':
   '<div class="gmpb-controls"><label>敵人 ATK<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetDefenseSource(this.value)">'+sourceOptions(MODEL.defenseSource)+'</select></label>'+
   '<label>自訂 ATK<br><input class="btn"'+disabled+' type="number" min="0" value="'+whole(MODEL.customAtk,0)+'" onchange="gmPowerBenchmarkSetCustomAtk(this.value)"></label>'+
   '<button class="btn blue" type="button"'+disabled+' onclick="gmPowerBenchmarkRunDefense()">'+busyLabel("defense","開始承傷測試")+'</button></div>'+defenseResultHtml())+'</div>'+
   '<div class="item"><b>現行主線實戰基準</b><div class="muted" style="margin-top:5px">每場重新生成正式主線怪物與隨機特性，使用目前角色完整正式戰鬥規則；只做沙盒模擬，不結算任何獎勵或進度。</div>'+
   (world===2?'<div class="notice" style="margin-top:9px">宇宙紀元主線實戰將於第 2 批併入此區塊；不再使用下方獨立宇宙 Boss 測試區。</div>':
   '<div class="gmpb-actions"><button class="btn blue" type="button"'+disabled+' onclick="gmPowerBenchmarkRunCombat(\'single\')">'+busyLabel("combat-single","測目前選擇怪物")+'</button><button class="btn" type="button"'+disabled+' onclick="gmPowerBenchmarkRunCombat(\'map\')">'+busyLabel("combat-map","測本地圖 5 隻全部")+'</button></div>'+combatResultHtml())+'</div>'+
   summaryHtml()+'</div>';
 }

 window.GM_POWER_BENCHMARK_VERSION=VERSION;
 window.GM_POWER_BENCHMARK_BATCH_SIZE=BATCH_SIZE;
 window.gmPowerBenchmarkHtml=html;
 window.gmPowerBenchmarkSetWorld=function(v){
  if(MODEL.busy)return;
  MODEL.world=Number(v)===2?2:1;
  if(MODEL.world===1)ensureSelection();else normalizeUniverseSelection();
  clearSelectionResults();
  render();
 };
 window.gmPowerBenchmarkSelectedEnemy=function(){const e=benchmarkSelectedEnemy();return e?JSON.parse(JSON.stringify(e)):null;};
 window.gmPowerBenchmarkSetPhase=function(v){if(MODEL.busy)return;MODEL.world=1;MODEL.phase=whole(v,0);MODEL.regionId="";ensureSelection();clearSelectionResults();render();};
 window.gmPowerBenchmarkSetRegion=function(v){if(MODEL.busy)return;MODEL.world=1;MODEL.regionId=String(v||"");const r=regionById(MODEL.regionId);if(r)MODEL.mapIndex=r.mapStart;MODEL.enemyIndex=4;clearSelectionResults();render();};
 window.gmPowerBenchmarkSetMap=function(v){if(MODEL.busy)return;MODEL.world=1;MODEL.mapIndex=whole(v,0);MODEL.enemyIndex=Math.max(0,(mapAt(MODEL.mapIndex)&&mapAt(MODEL.mapIndex).enemies?mapAt(MODEL.mapIndex).enemies.length:1)-1);clearSelectionResults();render();};
 window.gmPowerBenchmarkSetEnemy=function(v){if(MODEL.busy)return;MODEL.world=1;MODEL.enemyIndex=whole(v,0);clearSelectionResults();render();};
 window.gmPowerBenchmarkSetRuns=function(v){if(MODEL.busy)return;MODEL.runs=Number(v)===1000?1000:100;};
 window.gmPowerBenchmarkSetOutputSource=function(v){if(MODEL.busy)return;MODEL.outputSource=String(v||"selected");};
 window.gmPowerBenchmarkSetDefenseSource=function(v){if(MODEL.busy)return;MODEL.defenseSource=String(v||"selected");};
 window.gmPowerBenchmarkSetCustomDef=function(v){if(MODEL.busy)return;MODEL.customDef=Math.max(0,num(v,0));};
 window.gmPowerBenchmarkSetCustomAtk=function(v){if(MODEL.busy)return;MODEL.customAtk=Math.max(0,num(v,0));};
 window.gmPowerBenchmarkUseHighest=function(){if(MODEL.busy)return false;if(useHighestBenchmarkSelection())render();return true;};
 window.gmPowerBenchmarkReset=resetBenchmarkSession;
 window.gmPowerBenchmarkRunOutput=runOutput;
 window.gmPowerBenchmarkRunDefense=runDefense;
 window.gmPowerBenchmarkRunCombat=runCombatBenchmark;
 window.gmPowerBenchmarkSetUniverseRegion=function(v){
  if(MODEL.busy)return;
  MODEL.world=2;
  const regions=universeRegions();
  MODEL.universeRegionIndex=whole(v,0,Math.max(0,regions.length-1));
  const bosses=universeBossesForRegion(MODEL.universeRegionIndex);
  MODEL.universeBossIndex=bosses[0]?.index??0;
  clearSelectionResults();
  render();
 };
 window.gmPowerBenchmarkSetUniverseBoss=function(v){
  if(MODEL.busy)return;
  MODEL.world=2;
  normalizeUniverseSelection();
  const bosses=universeBossesForRegion(MODEL.universeRegionIndex),requested=whole(v,0,Math.max(0,(Number(window.SECOND_WORLD_BOSS_COUNT)||100)-1));
  MODEL.universeBossIndex=bosses.some(b=>b.index===requested)?requested:(bosses[0]?.index??0);
  clearSelectionResults();
  render();
 };
 window.gmPowerBenchmarkRunUniverseCombat=runUniverseCombatBenchmark;
 window.gmPowerBenchmarkIsBusy=function(){return MODEL.busy===true;};
 window.gmPowerBenchmarkSummaryText=summaryText;
 window.gmPowerBenchmarkCopySummary=copySummary;
 window.gmPowerBenchmarkSnapshot=function(){return JSON.parse(JSON.stringify(snapshot()));};
 window.gmPowerBenchmarkSession=function(){return JSON.parse(JSON.stringify(MODEL));};

 if(typeof window.registerGmHubSection==="function"){
  window.registerGmHubSection("test","戰力基準測試",html,{id:"power-benchmark-test"});
 }
})();
