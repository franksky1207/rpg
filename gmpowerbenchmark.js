(function(){
 const VERSION=21;
 const BATCH_SIZE=25;
 const SLOT_LABELS={weapon:"武器",helmet:"頭盔",armor:"鎧甲",shoes:"鞋子",accessory:"飾品"};
 const KIND_LABELS={normal:"普通",elite:"菁英",boss:"Boss"};
 const MODEL={
  world:Number(window.gmTestWorld)===2?2:1,phase:0,regionId:"",mapIndex:0,enemyIndex:4,runs:100,
  outputSource:"selected",defenseSource:"selected",customDef:0,customAtk:0,
  snapshot:null,outputResult:null,defenseResult:null,combatResult:null,
  universeRegionIndex:0,universeBossIndex:0,calamityWorld:Number(window.gmTestWorld)===2?2:1,
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
 function testCharacterLevel(){
  return whole(window.gmTestLevel??(typeof state!=="undefined"?state.level:1),1,1000);
 }
 function currentHighestMapIndex(){
  const maps=typeof MAPS!=="undefined"&&Array.isArray(MAPS)?MAPS:[];
  if(!maps.length)return 0;
  const lv=Math.max(1,Math.min(500,testCharacterLevel()));
  let best=0;
  maps.forEach((map,index)=>{if((Number(map?.min)||1)<=lv)best=index;});
  return whole(best,0,maps.length-1);
 }
 function ensureSelection(){
  const phases=allPhases();
  if(!phases.length)return;
  if(!phases.includes(MODEL.phase)){const p=phaseForLevel(testCharacterLevel());MODEL.phase=phases.includes(p)?p:phases[phases.length-1];}
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
  const level=Math.max(500,Math.min(1000,testCharacterLevel()));
  const highest=typeof window.secondWorldBossIndexForPlayerLevel==="function"?window.secondWorldBossIndexForPlayerLevel(level):MODEL.universeBossIndex;
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
  clearExternalModeResults();
  captureSnapshot();
  useHighestBenchmarkSelection();
  if(typeof render==="function")render();
  return true;
 }
 function captureSnapshot(){
  const character=typeof window.gmTestCharacterSnapshot==="function"?window.gmTestCharacterSnapshot():null;
  const stats=typeof window.gmTestPlayerStats==="function"?window.gmTestPlayerStats():typeof window.playerCombatStats==="function"?window.playerCombatStats():{hp:1,atk:1,def:0,crit:0,dodge:0};
  const specs=typeof window.specializationLevelsSnapshot==="function"?window.specializationLevelsSnapshot(true):{};
  const marks=typeof window.markLevelsSnapshot==="function"?window.markLevelsSnapshot(true):{};
  const slots=Array.isArray(window.ENHANCEMENT_SLOTS)?window.ENHANCEMENT_SLOTS:["weapon","helmet","armor","shoes","accessory"];
  const enhancements=Object.fromEntries(slots.map(type=>[type,typeof window.gmTestEnhancementLevel==="function"?window.gmTestEnhancementLevel(type):0]));
  const sourceEquipment=character?.equipment&&typeof character.equipment==="object"?character.equipment:{};
  const equipment=Object.fromEntries(slots.map(type=>{
   const it=sourceEquipment[type]||null;
   return [type,it?{name:String(it.name||""),level:whole(it.level,1),q:whole(it.q,0,5),world:Number(it.world)===2?2:1}:null];
  }));
  const civilizationLevel=typeof window.gmTestCivilizationLevelValue==="function"?window.gmTestCivilizationLevelValue():0;
  const civilizationDamageMultiplier=typeof window.civilizationDamageMultiplierForLevel==="function"?window.civilizationDamageMultiplierForLevel(civilizationLevel):1;
  MODEL.snapshot={
   capturedAt:Date.now(),
   characterWorld:Number(character?.world)===2?2:1,
   equipmentSource:character?.equipmentSource==="synced"?"synced":"generated",
   level:whole(character?.level??window.gmTestLevel??(typeof state!=="undefined"?state.level:1),1,1000),
   vipLevel:whole(window.gmTestVipLevel??(typeof state!=="undefined"?state.vipLevel:0),0),
   vipPoints:0,
   stats:{hp:whole(stats.hp,1),atk:whole(stats.atk,1),def:whole(stats.def,0),crit:one(stats.crit),dodge:one(stats.dodge)},
   civilizationLevel,civilizationDamageMultiplier,
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
 function benchmarkSpecializationEconomyText(s){
  const target={secondWorld:{entered:benchmarkWorld()===2}};
  if(typeof window.specializationWorldEconomySummary==="function")return window.specializationWorldEconomySummary(target,true,s?.specs||{}).text;
  return "";
 }
 function civilizationText(s){
  const lv=benchmarkWorld()===2?whole(s?.civilizationLevel,0,Math.max(0,Number(window.CIVILIZATION_LEVEL_MAX)||10)):0;
  const bonus=typeof window.civilizationDamageBonusPercentForLevel==="function"?window.civilizationDamageBonusPercentForLevel(lv):lv*5;
  const multi=typeof window.civilizationDamageMultiplierForLevel==="function"?window.civilizationDamageMultiplierForLevel(lv):1+bonus/100;
  return benchmarkWorld()===2?`文明 Lv.${lv}｜最終傷害 +${bonus}%｜×${Number(multi).toFixed(2)}`:"文明等級｜銀河紀元不套用";
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
   const quality=it&&typeof QUALITY!=="undefined"&&Array.isArray(QUALITY)&&QUALITY[it.q]?.n?QUALITY[it.q].n:"";
   return (SLOT_LABELS[k]||k)+"："+(it?(String(it.name)+" Lv."+it.level+(quality?" "+quality:"")):"未裝備");
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
  MODEL.outputResult=null;MODEL.defenseResult=null;MODEL.combatResult=null;
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
  return '<div id="gmPowerBenchmarkCharacterSnapshot" class="item"><b>目前 GM 測試角色</b><div class="muted gmpb-sub">所有戰力測試讀取「角色能力測試」的 GM 沙盒角色；與正式角色目前紀元、解鎖與進度脫鉤。</div>'+
   '<div style="margin-top:9px">'+(s.characterWorld===2?"宇宙紀元角色":"銀河紀元角色")+'｜Lv.'+s.level+'　VIP'+s.vipLevel+'｜'+(s.equipmentSource==="synced"?"正式實穿裝備":"同級神話預測裝備")+'</div>'+
   '<div style="margin-top:6px"><b>HP '+fmt(st.hp)+'</b>　ATK '+fmt(st.atk)+'　DEF '+fmt(st.def)+'　暴擊 '+st.crit+'%　閃避 '+st.dodge+'%</div>'+
   '<details style="margin-top:9px"><summary>養成狀態</summary><div class="muted" style="margin-top:7px;line-height:1.6">'+
   '<div>'+enhancementText(s)+'</div><div>'+specText(s)+'</div><div>經濟專精｜'+benchmarkSpecializationEconomyText(s)+'</div><div>'+civilizationText(s)+'</div><div>'+markText(s)+'</div><div>'+equipmentText(s)+'</div></div></details></div>';
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
   const result=window.runCombatCore(player,e,player.hp,{logs:false,maxTurns:1,skipEnemyAction:true,preparePresentation:false,useTestSpecializations:true,useTestMarks:true,markLevels:s.marks,playerFinalDamageMultiplier:benchmarkWorld()===2?Number(s.civilizationDamageMultiplier)||1:1});
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
   const result=window.runCombatCore(player,e,player.hp,{logs:false,maxTurns:10000,skipPlayerAction:true,preparePresentation:false,useTestSpecializations:true,useTestMarks:true,markLevels:s.marks});
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
   const result=window.runCombatCore(player,e,player.hp,{logs:false,preparePresentation:false,useTestSpecializations:true,useTestMarks:true,markLevels:s.marks});
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
   const result=window.runCombatCore(player,e,player.hp,{logs:false,preparePresentation:false,useTestSpecializations:true,useTestMarks:true,markLevels:s.marks,playerFinalDamageMultiplier:Number(s.civilizationDamageMultiplier)||1});
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
 function combatResultHtml(){
  const result=MODEL.combatResult;
  if(!result)return '<div class="muted">尚未執行主線實戰基準。</div>';
  const scope=Number(result.world)===2?"宇宙紀元｜單隻 Boss":result.mode==="map"?"地圖 5 隻全部":"單隻怪";
  return '<div style="margin-top:10px"><div class="muted">'+result.mapName+'｜'+scope+'｜每隻 '+result.runs.toLocaleString()+' 場</div>'+
   result.rows.map(combatRowHtml).join("")+'</div>';
 }

 function externalResult(fnName){
  try{return typeof window[fnName]==="function"?window[fnName]():null;}catch(error){console.error("GM summary export failed",fnName,error);return null;}
 }
 function collectedModeResults(){
  return {special:externalResult("gmSpecialBatchResultSnapshot"),bounty:externalResult("gmBountyTestResultSnapshot"),arena:externalResult("gmArena5ResultSnapshot"),void:externalResult("gmVoidMirageTestResultSnapshot"),mirror:externalResult("gmMirrorTestResultSnapshot"),calamity1:externalResult("gmCalamityTestResultSnapshot"),calamity2:externalResult("gmSecondWorldCalamityTestResultSnapshot")};
 }
 function testedModeCount(results){let count=(MODEL.outputResult||MODEL.defenseResult||MODEL.combatResult)?1:0;if(results.special)count++;if(results.bounty)count++;if(results.arena)count++;if(results.void)count++;if(results.mirror)count++;if(results.calamity1||results.calamity2)count++;return count;}
 function characterSummaryLines(s){const st=s.stats||{};return ["【角色測試設定】","角色來源："+(s.equipmentSource==="synced"?"同步正式角色／實穿裝備":"GM 預測角色／同級神話裝備"),"角色紀元："+(s.characterWorld===2?"宇宙紀元":"銀河紀元")+"｜Lv."+s.level+"｜VIP"+s.vipLevel,"能力：HP "+fmt(st.hp)+"｜ATK "+fmt(st.atk)+"｜DEF "+fmt(st.def)+"｜暴擊 "+one(st.crit)+"%｜閃避 "+one(st.dodge)+"%","強化："+enhancementText(s),"專精："+specText(s),"印記："+markText(s),"文明等級：Lv."+whole(s.civilizationLevel,0,10)+"｜宇宙紀元最終傷害 ×"+Number(s.civilizationDamageMultiplier||1).toFixed(2),"裝備："+equipmentText(s)];}
 function appendMapSummary(lines){
  const enemy=benchmarkSelectedEnemy(),cmb=MODEL.combatResult;if(!MODEL.outputResult&&!MODEL.defenseResult&&!cmb)return;
  lines.push("");lines.push("【"+benchmarkWorldLabel()+"・地圖怪】");if(enemy)lines.push("目標：Lv."+enemy.level+" "+enemy.name+"（"+(KIND_LABELS[enemy.kind]||enemy.kind)+"）｜測試量 "+MODEL.runs);
  if(cmb){const scope=Number(cmb.world)===2?"單隻 Boss":cmb.mode==="map"?"地圖 5 隻全部":"單隻怪";lines.push("實戰："+cmb.mapName+"｜"+scope+"｜每隻 "+cmb.runs+" 場");cmb.rows.forEach(r=>lines.push("・Lv."+r.level+" "+r.name+"｜"+r.wins+"勝/"+r.losses+"敗｜勝率 "+r.winRate+"%｜平均回合 "+r.avgTurns+"｜勝利剩餘HP "+r.avgWinHp+"%"));}
  if(MODEL.outputResult){const o=MODEL.outputResult;lines.push("輸出診斷："+o.sourceLabel+"｜DEF "+fmt(o.targetDef)+"｜"+o.runs+" 次");lines.push(...summaryFieldLines(outputFields(o),3));}
  if(MODEL.defenseResult){const d=MODEL.defenseResult;lines.push("承傷診斷："+d.sourceLabel+"｜ATK "+fmt(d.targetAtk)+"｜"+d.runs+" 場");lines.push(...summaryFieldLines(defenseFields(d),3));}
 }
 function appendSpecialSummary(lines,data){const rows=Array.isArray(data)?data:(data?[data]:[]);rows.forEach(item=>{if(!item?.summary)return;const s=item.summary,sp=item.special||{},resource=s.world===2?"暗物質":"金幣";lines.push("","【"+(s.world===2?"宇宙紀元":"銀河紀元")+"・特殊怪】");lines.push("目標："+String(sp.name||sp.id||"特殊怪")+"｜"+s.count+" 次");lines.push("勝率 "+s.winRate+"%｜平均回合 "+s.avgTurns+"｜勝利平均剩餘HP "+s.avgWinHp+"%");lines.push("勝利平均 EXP "+fmt(s.totalXp/Math.max(1,s.wins))+"｜勝利平均"+resource+" "+fmt(s.totalResource/Math.max(1,s.wins))+"｜裝備掉落 "+s.dropCount+" 件");const q=(s.qualityCounts||[]).map((n,i)=>n>0?(((typeof QUALITY!=="undefined"&&QUALITY[i]?.n)||("Q"+i))+" "+n):"").filter(Boolean).join("｜");if(q)lines.push("品質分布："+q);if(s.vip10Triggers)lines.push("VIP10 第二次特殊獎勵："+s.vip10Triggers+" 次");const rr=Object.entries(s.randomRewards||{}).map(x=>x[0]+" "+x[1]).join("｜");if(rr)lines.push("隨機獎勵："+rr);});}
 function appendBountySummary(lines,data){const rows=Array.isArray(data)?data:(data?[data]:[]);if(!rows.length)return;const groups=new Map();rows.forEach(b=>{const key=b.world===2?2:1;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(b);});groups.forEach((list,world)=>{lines.push("","【"+(world===2?"宇宙紀元":"銀河紀元")+"・懸賞戰】");list.forEach(b=>{lines.push(b.tierName+"｜Lv."+b.level+"｜"+b.runs+" 次｜"+b.wins+"勝/"+b.losses+"敗｜勝率 "+b.winRate+"%｜平均回合 "+b.avgTurns+"｜勝利剩餘HP "+b.avgWinHp+"%");if(b.reward)lines.push("  獎勵基準：Lv."+b.reward.rewardLevel+" → Lv."+b.reward.bossLevel+" "+b.reward.bossName+"｜EXP "+fmt(b.reward.exp)+"｜暗物質 "+fmt(b.reward.darkMatter)+"｜裝備 "+b.reward.gearCount+" 件");});});}
 function appendArenaSummary(lines,data){const rows=Array.isArray(data)?data:(data?[data]:[]);rows.forEach(a=>{const cond=i=>a.reached&&a.reached[i]?one((a.wins?.[i]||0)/a.reached[i]*100):0;lines.push("","【"+(a.world===2?"宇宙紀元":"銀河紀元")+"・競技場】");lines.push("Rank "+a.rank+"｜"+String(a.cfg?.name||a.positionId||"競技場")+"｜"+a.runs+" 次完整三連戰"+(a.assessment?"｜正式戰力評估":""));lines.push("第1戰 "+one((a.wins?.[0]||0)/Math.max(1,a.runs)*100)+"%｜第2戰條件 "+cond(1)+"%｜第3戰條件 "+cond(2)+"%｜三連戰全通 "+one((a.clearCount||0)/Math.max(1,a.runs)*100)+"%");lines.push("平均基礎積分 "+a.avgPoints+"｜平均 VIP 實得積分 "+(a.avgVipPoints??a.avgPoints)+"｜全通平均剩餘HP "+a.avgClearHp+"%｜平均總回合 "+a.avgTurns);if(a.assessment)lines.push("評估結果："+a.clearCount+" / "+a.runs+"（"+one((a.clearCount||0)/Math.max(1,a.runs)*100)+"%）");});}
 function appendVoidSummary(lines,v){if(!v)return;lines.push("","【虛空幻境】");if(v.type==="preview"){lines.push("第 "+v.floor+" 層"+(v.boss?"（雙特性關卡）":"")+"｜"+v.name);lines.push("敵人：HP "+fmt(v.enemy?.hp)+"｜ATK "+fmt(v.enemy?.atk)+"｜DEF "+fmt(v.enemy?.def)+"｜暴擊 "+one(v.enemy?.crit)+"%｜閃避 "+one(v.enemy?.dodge)+"%");lines.push("每日獎勵預覽：基礎 "+fmt(v.rewardBase)+"｜測試 VIP 實得 "+fmt(v.reward));}else{lines.push("起始 "+v.startFloor+" 層｜成功 "+v.cleared+" 層｜最後成功 "+(v.lastWinFloor??"—")+"｜停止／失敗 "+v.stopFloor);lines.push("平均回合 "+v.avgTurns+"｜最後成功剩餘HP "+(v.lastHpPct==null?"—":v.lastHpPct+"%")+"｜測試 VIP 每日獎勵 "+fmt(v.reward));}}
 function appendMirrorSummary(lines,m){if(!m)return;lines.push("","【鏡像戰】");const s=m.simulation;if(s){const rate=one((s.totalWins||0)/Math.max(1,s.totalBattles||0)*100),avg=one((s.totalWins||0)/Math.max(1,s.runs||0)),turns=one((s.totalTurns||0)/Math.max(1,s.totalBattles||0));lines.push(s.runs+" 次完整挑戰｜總場數 "+s.totalBattles+"｜平均每次勝場 "+avg+"｜總勝率 "+rate+"%｜平均回合 "+turns);const dist=(s.distribution||[]).map((n,w)=>n?(w+"勝 "+n+"次"):"").filter(Boolean).join("｜");if(dist)lines.push("勝場分布："+dist);if(s.events)lines.push("觸發：先制 "+s.events.initiative+"｜連擊 "+s.events.combo+"｜穿透 "+s.events.penetration+"｜反擊 "+s.events.counter+"｜汲取 "+s.events.drain);}if(m.symmetry)lines.push("64 組對稱回歸："+(m.symmetry.passed?"通過":"未通過")+"｜異常 "+(m.symmetry.errors?.length||0));}
 function appendCalamitySummary(lines,c1,c2){const data=c2||c1;if(!data)return;const world=c2?2:1,def=data.definition||{},enemy=data.enemy||{};lines.push("","【"+(world===2?"宇宙紀元":"銀河紀元")+"・文明災厄】");lines.push("目標："+String(def.name||enemy.name||data.calamityId||"文明災厄")+(def.level?"｜Lv."+def.level:""));if(world===2&&Number.isFinite(Number(data.civilizationLevel)))lines.push("文明 Lv."+data.civilizationLevel+(data.civilizationDamageMultiplier?"｜最終傷害 ×"+Number(data.civilizationDamageMultiplier).toFixed(2):""));if(data.type==="single")lines.push("單場：造成傷害 "+fmt(data.damage)+"｜剩餘HP "+fmt(data.remainingHp)+"｜回合 "+fmt(data.turns)+"｜玩家 "+(data.win?"擊殺":"未擊殺"));else lines.push("完整擊殺："+(data.completed?"完成":"未完成")+"｜需要場次 "+fmt(data.attempts)+"｜總傷害 "+fmt(data.totalDamage)+"｜總回合 "+fmt(data.totalTurns)+"｜剩餘HP "+fmt(data.remainingHp));}
 function summaryText(){
  const s=snapshot(),r=collectedModeResults(),lines=["《文明戰線・GM 戰力基準測試摘要》",...characterSummaryLines(s)];
  appendMapSummary(lines);appendSpecialSummary(lines,r.special);appendBountySummary(lines,r.bounty);appendArenaSummary(lines,r.arena);appendVoidSummary(lines,r.void);appendMirrorSummary(lines,r.mirror);appendCalamitySummary(lines,r.calamity1,null);appendCalamitySummary(lines,null,r.calamity2);
  if(testedModeCount(r)===0)lines.push("","尚未執行任何戰鬥測試。");
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
  const s=snapshot(),r=collectedModeResults(),count=testedModeCount(r),tested=[];
  if(MODEL.outputResult||MODEL.defenseResult||MODEL.combatResult)tested.push("地圖怪");if(r.special)tested.push("特殊怪");if(r.bounty)tested.push("懸賞");if(r.arena)tested.push("競技場");if(r.void)tested.push("虛空");if(r.mirror)tested.push("鏡像");if(r.calamity1||r.calamity2)tested.push("災厄");
  return '<div id="gmPowerBenchmarkUnifiedSummary" class="item"><div class="gmpb-title"><b>統一測試摘要</b><span class="muted">只收錄本次實際跑過的模式，可直接貼給 ChatGPT 分析平衡</span></div>'+
   '<div class="gmpb-summary-main">'+metric("測試角色","Lv."+s.level+" / VIP"+s.vipLevel)+metric("角色來源",s.equipmentSource==="synced"?"正式角色同步":"神話預測裝備")+metric("已測模式",count+" / 7")+metric("包含內容",tested.length?tested.join("、"):"尚未測試")+metric("文明等級","Lv."+s.civilizationLevel)+metric("角色紀元",s.characterWorld===2?"宇宙紀元":"銀河紀元")+'</div>'+
   '<div class="gmpb-actions"><button class="btn blue" type="button" onclick="gmPowerBenchmarkCopySummary()">複製測試摘要</button><button class="btn" type="button" onclick="gmPowerBenchmarkClearAllResults()">清除全部測試結果</button></div>'+
   '<details style="margin-top:8px"><summary>查看純文字摘要</summary><div class="gmpb-summary-text">'+summaryText().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</div></details></div>';
 }
 function benchmarkSubsection(title,body,id,open=false){
  return '<details class="gm-ability-test-sub gmpb-mode-sub" data-gmpb-mode="'+id+'" '+(open?'open':'')+'><summary>'+title+'</summary><div class="gm-ability-test-sub-body">'+body+'</div></details>';
 }
 function modeRenderer(fn,missing){
  try{return typeof fn==="function"?String(fn()||""):'<div class="muted gm-hub-note">'+missing+'</div>';}catch(error){console.error("GM benchmark child renderer failed",error);return '<div class="muted gm-hub-note">測試模組載入失敗。</div>';}
 }
 function calamityBenchmarkHtml(){
  const world=Number(MODEL.calamityWorld)===2?2:1;
  const body=world===2?modeRenderer(window.gmSecondWorldCalamityTestHtml,"宇宙文明災厄測試尚未載入。"):modeRenderer(window.gmCalamityTestHtml,"銀河文明災厄測試尚未載入。");
  return '<div class="muted gm-hub-note">文明災厄測試可獨立選擇紀元；沿用各紀元既有測試資料與功能，不新增輸出／承傷診斷。</div><div class="controls" style="align-items:end"><label>紀元<br><select id="gmBenchmarkCalamityWorld" class="btn" onchange="gmPowerBenchmarkSetCalamityWorld(this.value)"><option value="1" '+(world===1?'selected':'')+'>銀河紀元</option><option value="2" '+(world===2?'selected':'')+'>宇宙紀元</option></select></label></div>'+body;
 }
 function mapBenchmarkHtml(){
  ensureSelection();normalizeUniverseSelection();normalizeBenchmarkSources();
  const disabled=busyDisabled(),world=benchmarkWorld();
  const selectionControls=world===2
   ?'<label>紀元<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetWorld(this.value)">'+benchmarkWorldOptions()+'</select></label>'+
    '<label>區域<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetUniverseRegion(this.value)">'+universeRegionOptions()+'</select></label>'+
    '<label style="grid-column:span 2">怪物<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetUniverseBoss(this.value)">'+universeBossOptions()+'</select></label>'+
    '<label>文明等級<br><select class="btn"'+disabled+' onchange="gmSetTestCivilizationLevel(this.value);gmPowerBenchmarkInvalidateSnapshot()">'+(typeof window.gmCivilizationTestOptionsHtml==="function"?window.gmCivilizationTestOptionsHtml():"")+'</select></label>'+
    '<label>測試量<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetRuns(this.value)">'+option(100,"100",MODEL.runs===100)+option(1000,"1000",MODEL.runs===1000)+'</select></label>'
   :'<label>紀元<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetWorld(this.value)">'+benchmarkWorldOptions()+'</select></label>'+
    '<label>大區域<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetRegion(this.value)">'+regionOptions()+'</select></label>'+
    '<label>地圖<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetMap(this.value)">'+mapOptions()+'</select></label>'+
    '<label>怪物<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetEnemy(this.value)">'+enemyOptions()+'</select></label>'+
    '<label>測試量<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetRuns(this.value)">'+option(100,"100",MODEL.runs===100)+option(1000,"1000",MODEL.runs===1000)+'</select></label>';
  const highestLabel=world===2?"使用測試等級對應 Boss":"使用測試等級對應地圖";
  const combatActions=world===2
   ?'<div class="gmpb-actions"><button class="btn blue" type="button"'+disabled+' onclick="gmPowerBenchmarkRunCombat(\'single\')">'+busyLabel("combat-single","測目前選擇怪物")+'</button></div>'
   :'<div class="gmpb-actions"><button class="btn blue" type="button"'+disabled+' onclick="gmPowerBenchmarkRunCombat(\'single\')">'+busyLabel("combat-single","測目前選擇怪物")+'</button><button class="btn" type="button"'+disabled+' onclick="gmPowerBenchmarkRunCombat(\'map\')">'+busyLabel("combat-map","測本地圖 5 隻全部")+'</button></div>';
  return '<div class="muted gm-hub-note">地圖怪實戰為主要平衡測試；輸出／承傷只保留在本區作進階診斷。銀河與宇宙紀元可自由切換，不受正式角色目前紀元與解鎖限制。</div>'+
   '<div class="item"><b>地圖怪設定</b><div class="gmpb-controls">'+selectionControls+'</div>'+
   '<div class="gmpb-actions"><button class="btn" type="button"'+disabled+' onclick="gmPowerBenchmarkUseHighest()">'+highestLabel+'</button><button class="btn" type="button"'+disabled+' onclick="gmPowerBenchmarkReset()">重置地圖怪測試</button></div></div>'+
   selectedEnemySummary()+
   '<div class="item"><b>實戰基準</b><div class="muted" style="margin-top:5px">每場重新生成正式怪物與隨機特性，使用 GM 測試角色完整戰鬥規則；只做沙盒模擬。</div>'+combatActions+combatResultHtml()+'</div>'+
   '<details class="item" style="margin-top:0"><summary><b>進階診斷：輸出／承傷</b></summary><div style="margin-top:10px">'+
    '<div class="item"><b>輸出基準測試</b><div class="muted" style="margin-top:5px">敵人不還手；使用正式傷害、暴擊、先制、連擊、穿透與印記規則。</div>'+
    '<div class="gmpb-controls"><label>目標 DEF<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetOutputSource(this.value)">'+sourceOptions(MODEL.outputSource)+'</select></label>'+
    '<label>自訂 DEF<br><input class="btn"'+disabled+' type="number" min="0" value="'+whole(MODEL.customDef,0)+'" onchange="gmPowerBenchmarkSetCustomDef(this.value)"></label>'+
    '<button class="btn blue" type="button"'+disabled+' onclick="gmPowerBenchmarkRunOutput()">'+busyLabel("output","開始輸出測試")+'</button></div>'+outputResultHtml()+'</div>'+
    '<div class="item" style="margin-top:10px"><b>承傷／生存基準測試</b><div class="muted" style="margin-top:5px">玩家不主動攻擊；每場從滿 HP 開始直到倒下。</div>'+
    '<div class="gmpb-controls"><label>敵人 ATK<br><select class="btn"'+disabled+' onchange="gmPowerBenchmarkSetDefenseSource(this.value)">'+sourceOptions(MODEL.defenseSource)+'</select></label>'+
    '<label>自訂 ATK<br><input class="btn"'+disabled+' type="number" min="0" value="'+whole(MODEL.customAtk,0)+'" onchange="gmPowerBenchmarkSetCustomAtk(this.value)"></label>'+
    '<button class="btn blue" type="button"'+disabled+' onclick="gmPowerBenchmarkRunDefense()">'+busyLabel("defense","開始承傷測試")+'</button></div>'+defenseResultHtml()+'</div>'+
   '</div></details>';
 }
 function html(){
  installStyles();ensureSelection();normalizeUniverseSelection();normalizeBenchmarkSources();captureSnapshot();
  const special=typeof window.gmSpecialTestHtml==="function"?window.gmSpecialTestHtml():'<div class="muted">特殊怪測試模組尚未載入。</div>';
  return '<div class="gm-power-benchmark"><div class="muted gm-hub-note">戰力基準測試統一使用「角色能力測試」的 GM 沙盒角色。模式紀元可以獨立切換，因此即使正式角色仍在銀河紀元，也能直接預測宇宙紀元戰鬥。</div>'+
   snapshotHtml()+
   '<div class="gm-ability-test-stack gmpb-section-stack">'+
    benchmarkSubsection("地圖怪測試",mapBenchmarkHtml(),"map",true)+
    benchmarkSubsection("特殊怪測試",special,"special",false)+
    benchmarkSubsection("懸賞戰測試",modeRenderer(window.gmBountyTestHtml,"懸賞戰測試尚未載入。"),"bounty",false)+
    benchmarkSubsection("競技場測試",modeRenderer(window.gmArena5TestHtml,"競技場測試尚未載入。"),"arena",false)+
    benchmarkSubsection("虛空幻境測試",modeRenderer(window.gmVoidMirageTestHtml,"虛空幻境測試尚未載入。"),"void",false)+
    benchmarkSubsection("鏡像戰測試",modeRenderer(window.gmMirrorTestHtml,"鏡像戰測試尚未載入。"),"mirror",false)+
    benchmarkSubsection("文明災厄測試",calamityBenchmarkHtml(),"calamity",false)+
   '</div>'+summaryHtml()+'</div>';
 }
 function refreshBenchmarkUi(options={}){
  if(options.capture!==false){MODEL.snapshot=null;captureSnapshot();}
  const characterBox=typeof document!=="undefined"?document.getElementById("gmPowerBenchmarkCharacterSnapshot"):null;
  if(characterBox){
   const html=snapshotHtml(),wrap=document.createElement("div");wrap.innerHTML=html;
   const next=wrap.firstElementChild;if(next)characterBox.replaceWith(next);
  }
  const summaryBox=typeof document!=="undefined"?document.getElementById("gmPowerBenchmarkUnifiedSummary"):null;
  if(summaryBox){
   const html=summaryHtml(),wrap=document.createElement("div");wrap.innerHTML=html;
   const next=wrap.firstElementChild;if(next)summaryBox.replaceWith(next);
  }
  return true;
 }
 function clearExternalModeResults(){
  ["gmClearSpecialBatchResult","gmClearBountyTestResult","gmClearArena5Result","gmClearVoidMirageTestResult","gmClearMirrorTestResult","gmClearCalamityTestResult","gmClearSecondWorldCalamityTestResult"].forEach(name=>{try{if(typeof window[name]==="function")window[name]();}catch(error){console.error("GM result clear failed",name,error);}});
 }
 function clearAllBenchmarkResults(){clearSelectionResults();clearExternalModeResults();if(typeof render==="function")render();return true;}
 window.GM_POWER_BENCHMARK_VERSION=VERSION;
 window.GM_POWER_BENCHMARK_GROUP_VERSION=2;
 window.GM_POWER_BENCHMARK_ALL_MODES_VERSION=1;
 window.GM_POWER_BENCHMARK_UNIFIED_SUMMARY_VERSION=2;
 window.GM_POWER_BENCHMARK_LIVE_REFRESH_VERSION=1;
 window.GM_POWER_BENCHMARK_LEGACY_FALLBACK_RETIRED_VERSION=1;
 window.GM_POWER_BENCHMARK_GM_CHARACTER_VERSION=1;
 window.GM_POWER_BENCHMARK_ENHANCEMENT_RANGE_VERSION=1;
 window.GM_POWER_BENCHMARK_SPECIALIZATION_WORLD_VERSION=1;
 window.GM_POWER_BENCHMARK_CIVILIZATION_VERSION=1;
 window.GM_POWER_BENCHMARK_CALAMITY_INTEGRATION_VERSION=1;
 window.GM_POWER_BENCHMARK_BATCH_SIZE=BATCH_SIZE;
 window.gmPowerBenchmarkHtml=html;
 window.gmPowerBenchmarkSnapshot=function(){const s=snapshot();return s?JSON.parse(JSON.stringify(s)):null;};
 window.gmPowerBenchmarkSetCalamityWorld=function(v){if(MODEL.busy)return;MODEL.calamityWorld=Number(v)===2?2:1;if(typeof render==="function")render();return MODEL.calamityWorld;};
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
 window.gmPowerBenchmarkIsBusy=function(){return MODEL.busy===true;};
 window.gmPowerBenchmarkSummaryText=summaryText;
 window.gmPowerBenchmarkCopySummary=copySummary;
 window.gmPowerBenchmarkInvalidateSnapshot=function(){MODEL.snapshot=null;clearSelectionResults();clearExternalModeResults();return true;};
 window.gmPowerBenchmarkClearAllResults=clearAllBenchmarkResults;
 window.gmPowerBenchmarkRefreshUi=refreshBenchmarkUi;
 window.gmPowerBenchmarkRefreshSummary=function(){return refreshBenchmarkUi({capture:false});};
 window.gmPowerBenchmarkSnapshot=function(){return JSON.parse(JSON.stringify(snapshot()));};
 window.gmPowerBenchmarkSession=function(){return JSON.parse(JSON.stringify(MODEL));};

 if(typeof window.registerGmHubSection==="function"){
  window.registerGmHubSection("test","戰力基準測試",html,{id:"power-benchmark-test"});
 }
})();
