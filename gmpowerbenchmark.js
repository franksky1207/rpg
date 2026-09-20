(function(){
 const VERSION=3;
 const SLOT_LABELS={weapon:"武器",helmet:"頭盔",armor:"鎧甲",shoes:"鞋子",accessory:"飾品"};
 const KIND_LABELS={normal:"普通",elite:"菁英",boss:"Boss"};
 const MODEL={
  phase:0,regionId:"",mapIndex:0,enemyIndex:4,runs:100,
  outputSource:"selected",defenseSource:"selected",customDef:0,customAtk:0,
  snapshot:null,outputResult:null,defenseResult:null,combatResult:null
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
 function markText(s){
  const defs=window.MARK_DEFS||{};
  const keys=Array.isArray(window.MARK_KEYS)?Array.from(window.MARK_KEYS):Object.keys(s.marks||{});
  return keys.map(k=>(defs[k]&&defs[k].name?defs[k].name:k)+" Lv."+whole(s.marks&&s.marks[k],0)).join("｜");
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
  const m=mapAt(MODEL.mapIndex);if(!m||!Array.isArray(m.enemies))return null;
  if(kind==="selected")return enemyPreview(MODEL.mapIndex,MODEL.enemyIndex);
  const indexes=m.enemies.map((row,i)=>({row,i})).filter(x=>x.row[2]===kind).map(x=>x.i);
  if(!indexes.length)return null;
  return enemyPreview(MODEL.mapIndex,indexes[indexes.length-1]);
 }
 function sourceLabel(kind,stat){
  if(kind==="custom")return "自訂 "+stat;
  const e=sourceEnemy(kind);
  return e?String(e.name)+" Lv."+whole(e.level,1):"無可用怪物";
 }
 function sourceValue(kind,stat){
  if(kind==="custom")return Math.max(0,num(stat==="DEF"?MODEL.customDef:MODEL.customAtk,0));
  const e=sourceEnemy(kind);return e?Math.max(0,num(e[stat.toLowerCase()],0)):0;
 }
 function selectedEnemySummary(){
  const e=sourceEnemy("selected");
  if(!e)return '<div class="muted">目前沒有可用怪物資料。</div>';
  const traits=Array.isArray(e.traits)&&e.traits.length?e.traits.join("、"):"無";
  return '<div class="item"><b>目前基準怪物</b><div class="muted" style="margin-top:6px">'+e.name+' Lv.'+e.level+'｜'+(KIND_LABELS[e.kind]||e.kind)+'</div><div style="margin-top:5px">HP '+fmt(e.hp)+'　ATK '+fmt(e.atk)+'　DEF '+fmt(e.def)+'　暴擊 '+one(e.crit||0)+'%　閃避 '+one(e.dodge||0)+'%</div><div class="muted" style="margin-top:5px">特性：'+traits+'</div></div>';
 }
 function snapshotHtml(){
  const s=snapshot(),st=s.stats;
  return '<div class="item"><b>目前角色基準</b><div class="gmpb-actions"><button class="btn blue" type="button" onclick="gmPowerBenchmarkSync()">同步目前角色狀態</button></div>'+
   '<div style="margin-top:9px">Lv.'+s.level+'　VIP'+s.vipLevel+'（'+fmt(s.vipPoints)+' 積分）</div>'+
   '<div style="margin-top:6px"><b>HP '+fmt(st.hp)+'</b>　ATK '+fmt(st.atk)+'　DEF '+fmt(st.def)+'　暴擊 '+st.crit+'%　閃避 '+st.dodge+'%</div>'+
   '<details style="margin-top:9px"><summary>養成狀態</summary><div class="muted" style="margin-top:7px;line-height:1.6">'+
   '<div>'+enhancementText(s)+'</div><div>'+specText(s)+'</div><div>'+markText(s)+'</div><div>'+equipmentText(s)+'</div></div></details></div>';
 }
 function sourceOptions(selected){
  return [["selected","目前選擇怪物"],["normal","本地圖最高普通怪"],["elite","本地圖菁英"],["boss","本地圖 Boss"],["custom","自訂"]].map(x=>option(x[0],x[1],selected===x[0])).join("");
 }
 function metric(label,value){return '<div class="item gmpb-metric"><div class="muted" style="font-size:12px">'+label+'</div><b style="display:block;margin-top:3px">'+value+'</b></div>';}
 function outputResultHtml(){
  const r=MODEL.outputResult;if(!r)return '<div class="muted">尚未執行輸出測試。</div>';
  return '<div style="margin-top:10px"><div class="muted">'+r.sourceLabel+'｜DEF '+fmt(r.targetDef)+'｜'+r.runs.toLocaleString()+' 次</div>'+
   '<div class="gmpb-metrics">'+
   metric("平均每回合有效輸出",fmt(r.avgRoundDamage))+metric("平均單次命中",fmt(r.avgHitDamage))+metric("最低／最高單次",fmt(r.minHit)+" / "+fmt(r.maxHit))+metric("實際暴擊率",r.critRate+"%")+
   metric("平均普通攻擊",fmt(r.avgNormalDamage))+metric("平均暴擊傷害",fmt(r.avgCritDamage))+metric("每回合平均連擊",r.avgCombos)+metric("連擊傷害占比",r.comboDamageShare+"%")+
   metric("穿透觸發率",r.penetrationRate+"%")+metric("無視 DEF 觸發率",r.ignoreRate+"%")+metric("先制攻擊平均傷害",fmt(r.avgInitiativeDamage))+metric("汲取觸發率",r.drainRate+"%")+
   '</div></div>';
 }
 function defenseResultHtml(){
  const r=MODEL.defenseResult;if(!r)return '<div class="muted">尚未執行承傷測試。</div>';
  return '<div style="margin-top:10px"><div class="muted">'+r.sourceLabel+'｜ATK '+fmt(r.targetAtk)+'｜'+r.runs.toLocaleString()+' 場</div>'+
   '<div class="gmpb-metrics">'+
   metric("平均可承受回合",r.avgSurvivalTurns)+metric("平均每回合 HP 損失",fmt(r.avgTurnLoss))+metric("平均命中後 HP 損失",fmt(r.avgHitLoss))+metric("最低／最高單次 HP 損失",fmt(r.minLoss)+" / "+fmt(r.maxLoss))+
   metric("玩家實際閃避率",r.dodgeRate+"%")+metric("敵人命中後暴擊率",r.enemyCritRate+"%")+metric("護盾平均吸收／場",fmt(r.avgShieldAbsorb))+metric("吸收印記觸發率",r.absorptionRate+"%")+
   metric("反擊平均次數／場",r.avgCounters)+metric("反噬平均傷害／場",fmt(r.avgBacklashDamage))+metric("不屈救命率",r.indomitableRate+"%")+metric("達測試上限",r.capped+" 場")+
   '</div></div>';
 }
 function runOutput(){
  const s=captureSnapshot(),player={...s.stats};
  const source=MODEL.outputSource,targetDef=sourceValue(source,"DEF"),runs=MODEL.runs;
  const dummyHp=Math.max(1e12,player.atk*1000000);
  let total=0,hits=0,min=Infinity,max=0,crits=0,critDamage=0,normalHits=0,normalDamage=0,combos=0,comboDamage=0,penetrations=0,ignores=0,initiativeHits=0,initiativeDamage=0,drains=0;
  for(let i=0;i<runs;i++){
   const e={name:"輸出木樁",level:1,kind:"normal",hp:dummyHp,atk:0,def:targetDef,crit:0,dodge:0};
   const result=window.runCombatCore(player,e,player.hp,{logs:false,maxTurns:1,skipEnemyAction:true,preparePresentation:false,markLevels:s.marks});
   const attacks=result.events.filter(x=>x.type==="attack"&&x.actor==="player");
   let round=0;
   attacks.forEach(a=>{
    const d=Math.max(0,num(a.actualDamage,0));round+=d;total+=d;hits++;min=Math.min(min,d);max=Math.max(max,d);
    if(a.crit){crits++;critDamage+=d}
    if(a.source==="normal"){normalHits++;normalDamage+=d}
    if(a.source==="combo"){comboDamage+=d}
    if(a.penetration)penetrations++;
    if(a.ignoreDefense)ignores++;
    if(a.initiative){initiativeHits++;initiativeDamage+=d}
   });
   combos+=result.events.filter(x=>x.type==="combo").length;
   drains+=result.events.filter(x=>x.type==="drain").length;
  }
  MODEL.outputResult={
   sourceLabel:sourceLabel(source,"DEF"),targetDef,runs,
   avgRoundDamage:total/runs,avgHitDamage:hits?total/hits:0,minHit:min===Infinity?0:min,maxHit:max,
   critRate:pct(crits,hits),avgCritDamage:crits?critDamage/crits:0,avgNormalDamage:normalHits?normalDamage/normalHits:0,
   avgCombos:one(combos/runs),comboDamageShare:pct(comboDamage,total),penetrationRate:pct(penetrations,hits),ignoreRate:pct(ignores,hits),
   avgInitiativeDamage:initiativeHits?initiativeDamage/initiativeHits:0,drainRate:pct(drains,hits)
  };
  render();
 }
 function runDefense(){
  const s=captureSnapshot(),player={...s.stats};
  const source=MODEL.defenseSource,base=source==="custom"?sourceEnemy("selected"):sourceEnemy(source);
  const targetAtk=sourceValue(source,"ATK"),runs=MODEL.runs,dummyHp=Math.max(1e12,player.atk*1000000);
  let totalTurns=0,totalLoss=0,landed=0,min=Infinity,max=0,dodges=0,crits=0,shield=0,absorptions=0,counters=0,backlash=0,indomitable=0,capped=0;
  for(let i=0;i<runs;i++){
   const e={name:"承傷木樁",level:whole(base&&base.level,1),kind:String(base&&base.kind||"normal"),hp:dummyHp,atk:targetAtk,def:Math.max(0,num(base&&base.def,0)),crit:Math.max(0,num(base&&base.crit,0)),dodge:Math.max(0,num(base&&base.dodge,0))};
   const result=window.runCombatCore(player,e,player.hp,{logs:false,maxTurns:10000,skipPlayerAction:true,preparePresentation:false,markLevels:s.marks});
   totalTurns+=result.turns;if(result.hp>0)capped++;
   result.events.forEach(ev=>{
    if(ev.type==="dodge"&&ev.target==="player"){dodges++;return}
    if(ev.type==="attack"&&ev.actor==="enemy"){
     const loss=Math.max(0,num(ev.actualDamage,0));totalLoss+=loss;landed++;min=Math.min(min,loss);max=Math.max(max,loss);if(ev.crit)crits++;shield+=Math.max(0,num(ev.shieldAbsorbed,0));return;
    }
    if(ev.type==="counter")counters++;
    if(ev.type==="mark"&&ev.mark==="absorption"&&ev.action==="trigger")absorptions++;
    if(ev.type==="mark"&&ev.mark==="backlash"&&ev.action==="trigger")backlash+=Math.max(0,num(ev.actualDamage,ev.damage));
    if(ev.type==="mark"&&ev.mark==="indomitable"&&ev.action==="survive")indomitable++;
   });
  }
  MODEL.defenseResult={
   sourceLabel:sourceLabel(source,"ATK"),targetAtk,runs,
   avgSurvivalTurns:one(totalTurns/runs),avgTurnLoss:totalTurns?totalLoss/totalTurns:0,avgHitLoss:landed?totalLoss/landed:0,minLoss:min===Infinity?0:min,maxLoss:max,
   dodgeRate:pct(dodges,totalTurns),enemyCritRate:pct(crits,landed),avgShieldAbsorb:shield/runs,absorptionRate:pct(absorptions,totalTurns),
   avgCounters:one(counters/runs),avgBacklashDamage:backlash/runs,indomitableRate:pct(indomitable,runs),capped
  };
  render();
 }
 function freshEncounter(mapIndex,enemyIndex){
  try{
   if(typeof createMonsterEncounter==="function")return createMonsterEncounter(mapIndex,enemyIndex);
  }catch(e){}
  const preview=enemyPreview(mapIndex,enemyIndex);
  return preview?JSON.parse(JSON.stringify(preview)):null;
 }
 function markName(key){
  const defs=window.MARK_DEFS||{};
  return defs[key]&&defs[key].name?defs[key].name:key;
 }
 function traitName(key){
  const defs=typeof MONSTER_TRAITS!=="undefined"&&MONSTER_TRAITS?MONSTER_TRAITS:{};
  return defs[key]&&defs[key].name?defs[key].name:key;
 }
 function combatRow(mapIndex,enemyIndex,runs,s){
  const m=mapAt(mapIndex),row=m&&Array.isArray(m.enemies)?m.enemies[enemyIndex]:null;
  if(!row)return null;
  const player={...s.stats};
  let wins=0,totalTurns=0,minTurns=Infinity,maxTurns=0,winHpPct=0,lossEnemyHpPct=0,losses=0;
  let playerDamage=0,enemyDamage=0,playerHits=0,playerCrits=0,enemyHits=0,enemyCrits=0,playerDodges=0,enemyDodges=0;
  let enemyHp=0,enemyAtk=0,enemyDef=0,enemyCrit=0,enemyDodge=0;
  const specs={initiative:0,combo:0,penetration:0,counter:0,drain:0};
  const marks={},traits={};
  for(let i=0;i<runs;i++){
   const e=freshEncounter(mapIndex,enemyIndex);
   if(!e)continue;
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
  }
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
 function runCombatBenchmark(mode){
  const s=captureSnapshot(),runs=MODEL.runs,m=mapAt(MODEL.mapIndex);
  if(!m||!Array.isArray(m.enemies)||!m.enemies.length)return;
  const indexes=mode==="map"?m.enemies.map((_,i)=>i):[MODEL.enemyIndex];
  const rows=indexes.map(i=>combatRow(MODEL.mapIndex,i,runs,s)).filter(Boolean);
  MODEL.combatResult={mode:mode==="map"?"map":"single",mapIndex:MODEL.mapIndex,mapName:String(m.name||""),runs,rows};
  render();
 }
 function detailLine(title,entries,formatter){
  const rows=Object.entries(entries||{});
  if(!rows.length)return '<div class="muted">'+title+'：無</div>';
  return '<div class="muted">'+title+'：'+rows.map(([k,v])=>formatter(k,v)).join('｜')+'</div>';
 }
 function combatRowHtml(r){
  return '<div class="item gmpb-combat-card"><div><b>'+r.name+' Lv.'+r.level+'</b>　<span class="muted">'+(KIND_LABELS[r.kind]||r.kind)+'｜'+r.runs.toLocaleString()+' 場</span></div>'+
   '<div class="muted" style="margin-top:5px">隨機特性後平均：HP '+fmt(r.avgEnemy.hp)+'｜ATK '+fmt(r.avgEnemy.atk)+'｜DEF '+fmt(r.avgEnemy.def)+'｜暴擊 '+r.avgEnemy.crit+'%｜閃避 '+r.avgEnemy.dodge+'%</div>'+
   '<div class="gmpb-metrics">'+
   metric("勝率",r.winRate+"%")+metric("平均戰鬥回合",r.avgTurns)+metric("勝利平均剩餘 HP",r.avgWinHpPct+"%")+metric("失敗時敵人剩餘 HP",r.avgLossEnemyHpPct+"%")+
   metric("玩家每回合傷害",fmt(r.avgPlayerRoundDamage))+metric("敵人每回合傷害",fmt(r.avgEnemyRoundDamage))+
   '</div><details style="margin-top:8px"><summary>詳細統計</summary><div style="margin-top:8px;line-height:1.65">'+
   '<div class="muted">最短／最長回合：'+r.minTurns+' / '+r.maxTurns+'｜玩家平均總傷害 '+fmt(r.avgPlayerTotalDamage)+'｜敵人平均總傷害 '+fmt(r.avgEnemyTotalDamage)+'</div>'+
   '<div class="muted">玩家暴擊 '+r.playerCritRate+'%｜玩家閃避 '+r.playerDodgeRate+'%｜敵人暴擊 '+r.enemyCritRate+'%｜敵人閃避 '+r.enemyDodgeRate+'%</div>'+
   detailLine("專精平均觸發／場",r.specs,(k,v)=>k+" "+v)+
   detailLine("印記事件平均／場",r.marks,(k,v)=>markName(k)+" "+v)+
   detailLine("怪物特性出現率",r.traits,(k,v)=>traitName(k)+" "+v+"%")+
   '</div></details></div>';
 }
 function combatResultHtml(){
  const result=MODEL.combatResult;
  if(!result)return '<div class="muted">尚未執行主線實戰基準。</div>';
  return '<div style="margin-top:10px"><div class="muted">'+result.mapName+'｜'+(result.mode==="map"?"地圖 5 隻全部":"單隻怪")+'｜每隻 '+result.runs.toLocaleString()+' 場</div>'+
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
  if(MODEL.outputResult){const r=MODEL.outputResult;lines.push("");lines.push("【輸出基準】"+r.sourceLabel+"｜DEF "+fmt(r.targetDef));lines.push("平均每回合有效輸出 "+fmt(r.avgRoundDamage)+"｜平均單次 "+fmt(r.avgHitDamage)+"｜暴擊率 "+r.critRate+"%｜穿透 "+r.penetrationRate+"%｜無視DEF "+r.ignoreRate+"%");}
  if(MODEL.defenseResult){const r=MODEL.defenseResult;lines.push("");lines.push("【承傷基準】"+r.sourceLabel+"｜ATK "+fmt(r.targetAtk));lines.push("平均可承受 "+r.avgSurvivalTurns+" 回合｜平均每回合HP損失 "+fmt(r.avgTurnLoss)+"｜閃避 "+r.dodgeRate+"%｜敵方暴擊 "+r.enemyCritRate+"%");}
  if(MODEL.combatResult){lines.push("");lines.push("【主線實戰】"+MODEL.combatResult.mapName+"｜每隻 "+MODEL.combatResult.runs+" 場");MODEL.combatResult.rows.forEach(r=>lines.push("Lv."+r.level+" "+r.name+"（"+(KIND_LABELS[r.kind]||r.kind)+"）：勝率 "+r.winRate+"%｜平均 "+r.avgTurns+" 回合｜勝利剩餘HP "+r.avgWinHpPct+"%｜玩家回合傷害 "+fmt(r.avgPlayerRoundDamage)+"｜敵人回合傷害 "+fmt(r.avgEnemyRoundDamage)));}
  if(!MODEL.outputResult&&!MODEL.defenseResult&&!MODEL.combatResult){lines.push("");lines.push("尚未執行輸出、承傷或主線實戰測試。");}
  return lines.join("\\n");
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
  const s=snapshot(),o=MODEL.outputResult,d=MODEL.defenseResult,cmb=MODEL.combatResult;
  const combatRows=cmb&&Array.isArray(cmb.rows)?cmb.rows:[];
  const avgWin=combatRows.length?one(combatRows.reduce((a,r)=>a+num(r.winRate,0),0)/combatRows.length):null;
  const avgTurns=combatRows.length?one(combatRows.reduce((a,r)=>a+num(r.avgTurns,0),0)/combatRows.length):null;
  return '<div class="item"><div class="gmpb-title"><b>測試摘要</b><span class="muted">方便直接貼給 ChatGPT 做下一階段平衡</span></div>'+
   '<div class="gmpb-summary-main">'+metric("角色","Lv."+s.level+" / VIP"+s.vipLevel)+metric("基準地圖",mapAt(MODEL.mapIndex)?mapAt(MODEL.mapIndex).name:"未選擇")+
   metric("平均回合輸出",o?fmt(o.avgRoundDamage):"尚未測試")+metric("平均回合承傷",d?fmt(d.avgTurnLoss):"尚未測試")+
   metric("實戰平均勝率",avgWin==null?"尚未測試":avgWin+"%")+metric("實戰平均回合",avgTurns==null?"尚未測試":avgTurns)+'</div>'+
   '<div class="gmpb-actions"><button class="btn blue" type="button" onclick="gmPowerBenchmarkCopySummary()">複製測試摘要</button></div>'+
   '<details style="margin-top:8px"><summary>查看純文字摘要</summary><div class="gmpb-summary-text">'+summaryText().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</div></details></div>';
 }

 function html(){
  installStyles();ensureSelection();snapshot();
  return '<div class="gm-power-benchmark"><div class="muted gm-hub-note">讀取正式角色與正式主線怪物資料，在沙盒中計算；不增加 EXP／金幣／掉落／進度，不修改 HP、VIP 或存檔。目前提供角色快照、輸出、承傷、主線實戰與摘要。</div>'+
   '<div class="item"><b>測試基準設定</b><div class="gmpb-controls">'+
   '<label>大階段<br><select class="btn" onchange="gmPowerBenchmarkSetPhase(this.value)">'+phaseOptions()+'</select></label>'+
   '<label>大區域<br><select class="btn" onchange="gmPowerBenchmarkSetRegion(this.value)">'+regionOptions()+'</select></label>'+
   '<label>地圖<br><select class="btn" onchange="gmPowerBenchmarkSetMap(this.value)">'+mapOptions()+'</select></label>'+
   '<label>怪物<br><select class="btn" onchange="gmPowerBenchmarkSetEnemy(this.value)">'+enemyOptions()+'</select></label>'+
   '<label>測試量<br><select class="btn" onchange="gmPowerBenchmarkSetRuns(this.value)">'+option(100,"100",MODEL.runs===100)+option(1000,"1000",MODEL.runs===1000)+'</select></label>'+
   '<button class="btn" type="button" onclick="gmPowerBenchmarkUseHighest()">使用目前最高地圖</button></div></div>'+
   selectedEnemySummary()+snapshotHtml()+
   '<div class="item"><b>輸出基準測試</b><div class="muted" style="margin-top:5px">敵人不還手；使用正式傷害、暴擊、先制、連擊、穿透與印記規則。防禦來源可獨立選擇。</div>'+
   '<div class="gmpb-controls"><label>目標 DEF<br><select class="btn" onchange="gmPowerBenchmarkSetOutputSource(this.value)">'+sourceOptions(MODEL.outputSource)+'</select></label>'+
   '<label>自訂 DEF<br><input class="btn" type="number" min="0" value="'+whole(MODEL.customDef,0)+'" onchange="gmPowerBenchmarkSetCustomDef(this.value)"></label>'+
   '<button class="btn blue" type="button" onclick="gmPowerBenchmarkRunOutput()">開始輸出測試</button></div>'+outputResultHtml()+'</div>'+
   '<div class="item"><b>承傷／生存基準測試</b><div class="muted" style="margin-top:5px">玩家不主動攻擊；每場從滿 HP 開始直到倒下。保留正式閃避、護盾、吸收、不屈、反擊與反噬規則。</div>'+
   '<div class="gmpb-controls"><label>敵人 ATK<br><select class="btn" onchange="gmPowerBenchmarkSetDefenseSource(this.value)">'+sourceOptions(MODEL.defenseSource)+'</select></label>'+
   '<label>自訂 ATK<br><input class="btn" type="number" min="0" value="'+whole(MODEL.customAtk,0)+'" onchange="gmPowerBenchmarkSetCustomAtk(this.value)"></label>'+
   '<button class="btn blue" type="button" onclick="gmPowerBenchmarkRunDefense()">開始承傷測試</button></div>'+defenseResultHtml()+'</div>'+
   '<div class="item"><b>現行主線實戰基準</b><div class="muted" style="margin-top:5px">每場重新生成正式主線怪物與隨機特性，使用目前角色完整正式戰鬥規則；只做沙盒模擬，不結算任何獎勵或進度。</div>'+
   '<div class="gmpb-actions"><button class="btn blue" type="button" onclick="gmPowerBenchmarkRunCombat(\'single\')">測目前選擇怪物</button><button class="btn" type="button" onclick="gmPowerBenchmarkRunCombat(\'map\')">測本地圖 5 隻全部</button></div>'+combatResultHtml()+'</div>'+summaryHtml()+'</div>';
 }

 window.GM_POWER_BENCHMARK_VERSION=VERSION;
 window.gmPowerBenchmarkHtml=html;
 window.gmPowerBenchmarkSync=function(){captureSnapshot();MODEL.outputResult=null;MODEL.defenseResult=null;MODEL.combatResult=null;render();};
 window.gmPowerBenchmarkSetPhase=function(v){MODEL.phase=whole(v,0);MODEL.regionId="";ensureSelection();MODEL.outputResult=null;MODEL.defenseResult=null;MODEL.combatResult=null;render();};
 window.gmPowerBenchmarkSetRegion=function(v){MODEL.regionId=String(v||"");const r=regionById(MODEL.regionId);if(r)MODEL.mapIndex=r.mapStart;MODEL.enemyIndex=4;MODEL.outputResult=null;MODEL.defenseResult=null;MODEL.combatResult=null;render();};
 window.gmPowerBenchmarkSetMap=function(v){MODEL.mapIndex=whole(v,0);MODEL.enemyIndex=Math.max(0,(mapAt(MODEL.mapIndex)&&mapAt(MODEL.mapIndex).enemies?mapAt(MODEL.mapIndex).enemies.length:1)-1);MODEL.outputResult=null;MODEL.defenseResult=null;MODEL.combatResult=null;render();};
 window.gmPowerBenchmarkSetEnemy=function(v){MODEL.enemyIndex=whole(v,0);MODEL.outputResult=null;MODEL.defenseResult=null;MODEL.combatResult=null;render();};
 window.gmPowerBenchmarkSetRuns=function(v){MODEL.runs=Number(v)===1000?1000:100;};
 window.gmPowerBenchmarkSetOutputSource=function(v){MODEL.outputSource=String(v||"selected");};
 window.gmPowerBenchmarkSetDefenseSource=function(v){MODEL.defenseSource=String(v||"selected");};
 window.gmPowerBenchmarkSetCustomDef=function(v){MODEL.customDef=Math.max(0,num(v,0));};
 window.gmPowerBenchmarkSetCustomAtk=function(v){MODEL.customAtk=Math.max(0,num(v,0));};
 window.gmPowerBenchmarkUseHighest=function(){if(useHighestSelection())render();};
 window.gmPowerBenchmarkRunOutput=runOutput;
 window.gmPowerBenchmarkRunDefense=runDefense;
 window.gmPowerBenchmarkRunCombat=runCombatBenchmark;
 window.gmPowerBenchmarkSummaryText=summaryText;
 window.gmPowerBenchmarkCopySummary=copySummary;
 window.gmPowerBenchmarkSnapshot=function(){return JSON.parse(JSON.stringify(snapshot()));};
 window.gmPowerBenchmarkSession=function(){return JSON.parse(JSON.stringify(MODEL));};

 if(typeof window.registerGmHubSection==="function"){
  window.registerGmHubSection("test","戰力基準測試",html,{id:"power-benchmark-test"});
 }
})();
