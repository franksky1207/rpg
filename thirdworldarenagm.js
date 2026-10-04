(function(){
 const VERSION=3;
 const CORE_DELEGATION_VERSION=1;
 const FORMAL_SNAPSHOT_VERSION=1;
 const FORMAL_OPTIONS_VERSION=1;
 const RESULT_SNAPSHOT_VERSION=2;
 const baseHtml=window.gmArena5TestHtml;
 const baseSetWorld=window.gmArena5SetWorld;
 const baseTestWorld=window.gmArena5TestWorld;
 const baseSnapshot=window.gmArena5ResultSnapshot;
 const baseClear=window.gmClearArena5Result;
 const baseSummaryText=window.gmPowerBenchmarkSummaryText;
 let world=Number(window.gmTestWorld)===3?3:(typeof baseTestWorld==="function"?baseTestWorld():1);
 let mode="fixed";
 let bossChoice="all";
 let resultHtml="";
 let results=[];
 let busy=false;
 function whole(v,min=0,max=Number.MAX_SAFE_INTEGER){const n=Math.floor(Number(v));return Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;}
 function one(v){return Math.round((Number(v)||0)*10)/10;}
 function pct(n,d){return d?one(n/d*100):0;}
 function vip(){return typeof window.normalizeVipLevel==="function"?window.normalizeVipLevel(window.gmTestVipLevel):Math.max(0,whole(window.gmTestVipLevel,0));}
 function testLevel(){return Math.max(1000,Math.min(2000,whole(window.gmTestLevel??state?.level,1000)));}
 function rawTestStats(){
  const base=typeof window.gmTestEnhancedEquippedStats==="function"?window.gmTestEnhancedEquippedStats():typeof window.equippedStats==="function"?window.equippedStats():{};
  return typeof window.gmTestPlayerStats==="function"?window.gmTestPlayerStats(base):typeof window.playerCombatStats==="function"?window.playerCombatStats(base,vip()):base;
 }
 function formalTestPlayer(){
  if(typeof window.createThirdWorldArenaPlayerSnapshot!=="function")throw new Error("World 3 Arena formal player snapshot owner unavailable.");
  return window.createThirdWorldArenaPlayerSnapshot(rawTestStats());
 }
 function marks(){return typeof window.markLevelsSnapshot==="function"?window.markLevelsSnapshot(true):null;}
 function testCivilizationLevel(){return typeof window.gmTestCivilizationLevelValue==="function"?window.gmTestCivilizationLevelValue():0;}
 function formalArenaState(){return {secondWorld:{entered:true,civilizationLevel:testCivilizationLevel()},thirdWorld:{entered:true}};}
 function formalCombatOptions(enemy){
  if(typeof window.getThirdWorldArenaCombatOptions!=="function")throw new Error("World 3 Arena formal combat option owner unavailable.");
  return window.getThirdWorldArenaCombatOptions(enemy,formalArenaState());
 }
 function runFormalCombat(player,enemy,hp,markLevels){
  if(typeof window.runCombatCore!=="function")throw new Error("Combat core unavailable.");
  const options=formalCombatOptions(enemy);
  return window.runCombatCore(player,enemy,hp,{...options,logs:false,useTestSpecializations:true,useTestMarks:true,markLevels});
 }
 function bosses(){return Array.isArray(window.THIRD_WORLD_BOSS_DEFINITIONS)?window.THIRD_WORLD_BOSS_DEFINITIONS:[];}
 function bossOptions(){return `<option value="all" ${bossChoice==="all"?"selected":""}>全部十名存在（各 500 輪）</option>`+bosses().map((b,i)=>`<option value="${i}" ${String(i)===String(bossChoice)?"selected":""}>${i+1}. ${b.name}</option>`).join("");}
 function worldOptionPatch(html){
  const source=String(html||"");
  if(source.includes('value="3"'))return source;
  return source.replace(/(<select id="gmArenaWorld5"[^>]*>)([\s\S]*?)(<\/select>)/,(all,start,opts,end)=>`${start}${opts}<option value="3" ${world===3?"selected":""}>高維紀元</option>${end}`);
 }
 function simulate(modeValue,bossIndex,runs){
  if(typeof window.rollThirdWorldArenaLineup!=="function"||typeof window.buildThirdWorldArenaEnemy!=="function"||typeof window.getThirdWorldArenaStageReward!=="function")throw new Error("World 3 Arena formal benchmark owners unavailable.");
  const player=formalTestPlayer(),level=testLevel(),markLevels=marks(),sampleOptions=formalCombatOptions(null),civ=Math.max(0,Number(sampleOptions?.playerFinalDamageMultiplier)||1);
  const wins=[0,0,0];let clearCount=0,totalTurns=0,clearHpTotal=0,totalScaled=0,totalVip=0;
  for(let run=0;run<runs;run++){
   const lineup=window.rollThirdWorldArenaLineup(modeValue,{bossIndex:bossIndex==null?undefined:bossIndex});
   let hp=Math.max(1,Number(player.hp)||1),runScaled=0,cleared=true;
   for(let stage=0;stage<3;stage++){
    const row=lineup[stage];if(!row){cleared=false;break;}
    const enemy=window.buildThirdWorldArenaEnemy(row.bossIndex,stage,player,level);if(!enemy){cleared=false;break;}
    const out=runFormalCombat(player,enemy,hp,markLevels);
    totalTurns+=Number(out.turns)||0;
    if(!out.win){cleared=false;break;}
    wins[stage]++;hp=out.hp;
    const reward=window.getThirdWorldArenaStageReward(stage,level);runScaled+=Math.max(0,whole(reward?.scaledPoints,0));
   }
   if(cleared){clearCount++;clearHpTotal+=hp;}
   totalScaled+=runScaled;
   totalVip+=typeof window.adjustVipDungeonPoints==="function"?window.adjustVipDungeonPoints(runScaled,vip()):runScaled;
  }
  const boss=Number.isInteger(bossIndex)?bosses()[bossIndex]:null,modeName=modeValue==="varied"?"異相競技場":"定相競技場",bossLabel=modeValue==="varied"?"三名不同高維投影":boss?.name||"高維投影";
  return {world:3,rank:0,positionId:modeValue,mode:modeValue,modeName,bossIndex:Number.isInteger(bossIndex)?bossIndex:null,bossLabel,runs,reached:[runs,wins[0],wins[1]],wins,clearCount,totalPoints:totalScaled,totalVipPoints:totalVip,totalTurns,avgPoints:one(totalScaled/runs),avgVipPoints:one(totalVip/runs),avgTurns:one(totalTurns/runs),avgClearHp:clearCount?one(clearHpTotal/clearCount/player.hp*100):0,cfg:{name:`高維：${modeName}｜${bossLabel}`,totalPoints:typeof window.getThirdWorldArenaRoundReward==="function"?window.getThirdWorldArenaRoundReward(level).scaledPoints:0},assessment:false,level,civilizationDamageMultiplier:civ,formalCoreDelegated:true};
 }
 function resultCard(s){
  return `<div class="notice" style="margin-top:10px"><b>${s.modeName}・${s.bossLabel}</b><div class="muted gm-test-context">Lv.${s.level}・${s.runs} 輪完整三連戰；玩家套用目前 GM 測試 VIP／專精／強化／印記／文明等級，敵人與戰鬥參數直接共用正式高維競技場 Core。</div><div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(135px,1fr))"><div class="stat">第一戰通過率<b>${pct(s.wins[0],s.runs)}%</b></div><div class="stat">第二戰累積通過率<b>${pct(s.wins[1],s.runs)}%</b></div><div class="stat">第三戰／完整三連勝<b>${pct(s.clearCount,s.runs)}%</b></div><div class="stat">平均 VIP 實得積分<b>${s.avgVipPoints}</b></div><div class="stat">全通平均剩餘 HP<b>${s.avgClearHp}%</b></div><div class="stat">平均總回合<b>${s.avgTurns}</b></div></div></div>`;
 }
 async function run500(){
  if(busy)return false;busy=true;resultHtml='<div class="notice">高維競技場測試執行中…</div>';if(typeof render==="function")render();
  try{
   const rows=[];
   if(mode==="fixed"&&bossChoice==="all"){
    for(let i=0;i<bosses().length;i++){rows.push(simulate("fixed",i,500));await new Promise(resolve=>setTimeout(resolve,0));}
   }else if(mode==="fixed")rows.push(simulate("fixed",whole(bossChoice,0,9),500));
   else rows.push(simulate("varied",null,500));
   results=rows;resultHtml=rows.map(resultCard).join("");
  }catch(error){console.error("GM World 3 arena benchmark failed",error);resultHtml='<div class="notice">高維競技場測試失敗，請重新整理後再試。</div>';}
  finally{busy=false;if(typeof render==="function")render();if(typeof window.gmPowerBenchmarkRefreshSummary==="function")window.gmPowerBenchmarkRefreshSummary();}
  return true;
 }
 function w3Html(){
  const modeOptions=`<option value="fixed" ${mode==="fixed"?"selected":""}>定相競技場</option><option value="varied" ${mode==="varied"?"selected":""}>異相競技場</option>`;
  return `<div class="muted gm-hub-note">高維紀元競技場不使用 Rank／升階。測試角色直接沿用角色能力測試設定；高維核心不參與競技場；正式角色快照、敵人建構與戰鬥參數皆共用玩家端高維競技場 owner。</div><div class="controls" style="align-items:end"><label>紀元<br><select id="gmArenaWorld5" class="btn" onchange="gmArena5SetWorld(this.value)"><option value="1">銀河紀元</option><option value="2">宇宙紀元</option><option value="3" selected>高維紀元</option></select></label><label>模式<br><select id="gmArenaW3Mode" class="btn" onchange="gmArenaW3SetMode(this.value)">${modeOptions}</select></label>${mode==="fixed"?`<label>高維存在<br><select id="gmArenaW3Boss" class="btn" onchange="gmArenaW3SetBoss(this.value)">${bossOptions()}</select></label>`:""}<button id="gmArenaW3Run500" class="btn gm-create" ${busy?"disabled":""} onclick="gmArenaW3Run500()">${busy?"測試中…":"500 輪完整三連戰"}</button></div><div class="muted" style="margin-top:8px">定相可指定單一存在，或一次測試十名存在各 500 輪；異相每輪隨機三名不同存在。</div><div id="gmArenaTestResult" style="margin-top:12px">${resultHtml}</div>`;
 }
 window.gmArena5SetWorld=function(value){const requested=Number(value);if(requested===3){world=3;resultHtml="";results=[];if(typeof render==="function")render();return 3;}world=requested===2?2:1;resultHtml="";results=[];return typeof baseSetWorld==="function"?baseSetWorld(world):world;};
 window.gmArena5TestWorld=function(){return world;};
 window.gmArena5TestHtml=function(){if(world===3)return w3Html();return worldOptionPatch(typeof baseHtml==="function"?baseHtml():"");};
 window.gmArenaW3SetMode=function(value){mode=String(value)==="varied"?"varied":"fixed";resultHtml="";results=[];if(typeof render==="function")render();return mode;};
 window.gmArenaW3SetBoss=function(value){bossChoice=String(value)==="all"?"all":String(whole(value,0,9));return bossChoice;};
 window.gmArenaW3Run500=run500;
 window.gmArena5ResultSnapshot=function(){
  const legacy=typeof baseSnapshot==="function"?baseSnapshot():null;
  const legacyRows=Array.isArray(legacy)?legacy:(legacy?[legacy]:[]),rows=legacyRows.concat(results.map(row=>JSON.parse(JSON.stringify(row))));
  return rows.length?rows:null;
 };
 window.gmClearArena5Result=function(){resultHtml="";results=[];if(typeof baseClear==="function")baseClear();return true;};
 if(typeof baseSummaryText==="function"){
  window.gmPowerBenchmarkSummaryText=function(){
   let text=String(baseSummaryText()||"");
   text=text.replace(/【銀河紀元・競技場】\nRank 0｜高維：([^\n]+)\n第1戰 ([\d.]+)%｜第2戰條件 ([\d.]+)%｜第3戰條件 ([\d.]+)%｜三連戰全通 ([\d.]+)%/g,(all,label,s1,s2,s3,full)=>`【高維紀元・競技場】\n${label}\n第一戰通過率 ${s1}%｜第二戰累積通過率 ${s2}%｜第三戰／完整三連勝 ${full}%`);
   return text;
  };
 }
 window.GM_THIRD_WORLD_ARENA_TEST_VERSION=VERSION;
 window.GM_THIRD_WORLD_ARENA_CORE_DELEGATION_VERSION=CORE_DELEGATION_VERSION;
 window.GM_THIRD_WORLD_ARENA_FORMAL_SNAPSHOT_VERSION=FORMAL_SNAPSHOT_VERSION;
 window.GM_THIRD_WORLD_ARENA_FORMAL_OPTIONS_VERSION=FORMAL_OPTIONS_VERSION;
 window.GM_THIRD_WORLD_ARENA_RESULT_SNAPSHOT_VERSION=RESULT_SNAPSHOT_VERSION;
 window.GM_THIRD_WORLD_ARENA_500_VERSION=1;
 window.GM_THIRD_WORLD_ARENA_ALL_BOSSES_VERSION=1;
 window.GM_THIRD_WORLD_ARENA_SUMMARY_VERSION=1;
})();