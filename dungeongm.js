(function(){
 let bountyTestHtml="";
 let bountyTestResult=null;
 let bountyTestResults={};
 let voidMirageTestResult=null;
 let bountyTestWorld=Number(window.gmTestWorld)===2?2:1;
 let voidMirageTestHtml="";
 const VOID_MIRAGE_GM_SIM_LIMIT=10000;

 function testPercent(value,total=GM_TEST_RUNS){return total?round1(value/total*100):0;}
 function showTestResult(id,html){const box=document.getElementById(id);if(box)box.innerHTML=html;}
 function testVip(){return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(window.gmTestVipLevel)||0)));}
 function vipLabel(){return typeof gmTestVipLabel==="function"?gmTestVipLabel():`VIP${testVip()}`;}
 function testSummary(title,runLabel,specText=null){return gmTestSummaryHtml(title,runLabel,vipLabel(),specText);}
 function testPlayer(base=null){return typeof gmTestPlayerStats==="function"?gmTestPlayerStats(base):createSpecialPlayerSnapshot(playerCombatStats(base||equippedStats(),testVip()));}
 function traitDetail(enemy){
  if(!enemy?.traits?.length)return "無";
  return enemy.traits.map(id=>{const t=MONSTER_TRAITS?.[id];return t?`${t.name}（${t.desc}）`:id;}).join("、");
 }
 function enemyLine(e){return `HP ${e.hp}　ATK ${e.atk}　DEF ${e.def}　暴擊 ${e.crit}%　閃避 ${e.dodge}%`;}
 function showBountyTest(html){bountyTestHtml=html;showTestResult("gmBountyTestResult",html);if(typeof window.gmPowerBenchmarkRefreshSummary==="function")window.gmPowerBenchmarkRefreshSummary();}
 function showVoidMirageTest(html){voidMirageTestHtml=html;showTestResult("gmVoidMirageTestResult",html);if(typeof window.gmPowerBenchmarkRefreshSummary==="function")window.gmPowerBenchmarkRefreshSummary();}
 function simulateFight(player,enemy,startHp=player.hp){const marks=typeof window.markLevelsSnapshot==="function"?window.markLevelsSnapshot(true):null;return runCombatCore(player,enemy,startHp,{logs:false,useTestSpecializations:true,useTestMarks:true,markLevels:marks});}
 function gmTestLevelForWorld(world){const raw=Math.floor(Number(window.gmTestLevel)||Number(state?.level)||1);return Number(world)===2?Math.max(500,Math.min(1000,raw)):Math.max(1,Math.min(500,raw));}
 window.gmSetBountyTestWorld=function(value){bountyTestWorld=Number(value)===2?2:1;bountyTestHtml="";if(typeof render==="function")render();return bountyTestWorld;};
 window.gmBountyTestWorld=function(){return bountyTestWorld;};
 window.gmSimulateBounty=function(tierId){
  const tier=typeof getBountyTierMeta==="function"?getBountyTierMeta(tierId):null;if(!tier)return alert("找不到懸賞資料。");
  const world=bountyTestWorld,level=gmTestLevelForWorld(world);
  const base=typeof window.gmTestEnhancedEquippedStats==="function"?createSpecialPlayerSnapshot(window.gmTestEnhancedEquippedStats()):createSpecialPlayerSnapshot(equippedStats());
  const player=testPlayer(base),summary={wins:0,totalTurns:0,winHpTotal:0};
  for(let i=0;i<GM_TEST_RUNS;i++){
   const enemy=buildBountyEnemyForTest(tierId,base,level,world),r=simulateFight(player,enemy);
   summary.totalTurns+=r.turns;if(r.win){summary.wins++;summary.winHpTotal+=r.hp;}
  }
  const winRate=testPercent(summary.wins),avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/player.hp*100):0,avgTurns=round1(summary.totalTurns/GM_TEST_RUNS);
  const reward=world===2&&typeof window.getUniverseBountyRewardPreview==="function"?window.getUniverseBountyRewardPreview(tierId,level,{useTestSpecializations:true,state:{level}}):null;
  const rewardHtml=reward?`<div class="muted gm-test-context">宇宙獎勵基準：Lv.${reward.rewardLevel} → Lv.${reward.bossLevel} ${reward.bossName}；EXP ${reward.exp.toLocaleString()}・暗物質 ${reward.darkMatter.toLocaleString()}・裝備 ${reward.gearCount} 件。</div>`:"";
  bountyTestResult={world,level,tierId:tier.id,tierName:tier.name,runs:GM_TEST_RUNS,wins:summary.wins,losses:GM_TEST_RUNS-summary.wins,winRate,avgWinHp,avgTurns,reward:reward?{rewardLevel:reward.rewardLevel,bossLevel:reward.bossLevel,bossName:reward.bossName,exp:reward.exp,darkMatter:reward.darkMatter,gearCount:reward.gearCount}:null};
  bountyTestResults[String(world)+":"+tier.id]=JSON.parse(JSON.stringify(bountyTestResult));
  showBountyTest(`<div class="notice">${testSummary(`${world===2?"宇宙紀元":"銀河紀元"}・${tier.name}`,`${GM_TEST_RUNS} 次模擬`)}<div class="muted gm-test-context">GM 測試角色 Lv.${level}；紀元與正式角色進度完全脫鉤，玩家戰鬥套用測試 VIP／專精／強化／印記。</div>${rewardHtml}<div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))"><div class="stat">勝率<b>${winRate}%</b></div><div class="stat">勝利平均剩餘 HP<b>${avgWinHp}%</b></div><div class="stat">平均回合<b>${avgTurns}</b></div></div></div>`);
 };


 function gmVoidFloorValue(){const raw=Number(document.getElementById("gmVoidMirageFloor")?.value),floor=Number.isFinite(raw)&&raw>=1?Math.floor(raw):null;if(floor&&typeof window.gmSetVoidMirageTestFloor==="function")window.gmSetVoidMirageTestFloor(floor);return floor;}
 window.gmPreviewVoidMirageFloor=function(){
  const floor=gmVoidFloorValue();if(!floor)return alert("請輸入 1 以上的起始樓層。");if(typeof buildVoidMirageEnemy!=="function")return alert("虛空幻境資料尚未載入。");
  const base=typeof voidMirageBaseStats==="function"?voidMirageBaseStats(floor):null,enemy=buildVoidMirageEnemy(floor),boss=!!enemy.isBossFloor;
  const rewardBase=floor*2,reward=typeof adjustVipDungeonPoints==="function"?adjustVipDungeonPoints(rewardBase,testVip()):rewardBase;
  voidMirageTestResult={type:"preview",floor,boss,name:enemy.name,base:base?{hp:base.hp,atk:base.atk,def:base.def,crit:base.crit,dodge:base.dodge}:null,enemy:{hp:enemy.hp,atk:enemy.atk,def:enemy.def,crit:enemy.crit,dodge:enemy.dodge,traits:Array.isArray(enemy.traits)?enemy.traits.slice():[]},rewardBase,reward};
  showVoidMirageTest(`<div class="notice"><b>虛空幻境・第 ${floor} 層${boss?"（雙特性關卡）":""}</b><div class="muted" style="margin-top:7px">名稱：${enemy.name}</div>${base?`<div class="muted" style="margin-top:4px">基礎能力：${enemyLine(base)}</div>`:""}<div class="muted" style="margin-top:4px">本次特性後：${enemyLine(enemy)}</div><div class="muted" style="margin-top:4px">特性：${traitDetail(enemy)}</div><div class="muted" style="margin-top:4px">若第 ${floor} 層成為當日最高：基礎每日獎勵 ${rewardBase.toLocaleString()} VIP，依目前測試 VIP 實得 ${reward.toLocaleString()} VIP。</div></div>`);
 };

 window.gmSimulateVoidMirageClimb=function(){
  const startFloor=gmVoidFloorValue();if(!startFloor)return alert("請輸入 1 以上的起始樓層。");if(typeof buildVoidMirageEnemy!=="function")return alert("虛空幻境資料尚未載入。");
  const player=testPlayer();let floor=startFloor,cleared=0,totalTurns=0,lastWinHp=player.hp,lastWinFloor=startFloor-1,previousName="",failedEnemy=null,hitSafetyLimit=false;
  while(cleared<VOID_MIRAGE_GM_SIM_LIMIT){const enemy=buildVoidMirageEnemy(floor,{previousName});if(!enemy.isBossFloor)previousName=enemy.name;const r=simulateFight(player,enemy,player.hp);totalTurns+=r.turns;if(!r.win){failedEnemy=enemy;break;}cleared++;lastWinFloor=floor;lastWinHp=r.hp;floor++;}
  if(cleared>=VOID_MIRAGE_GM_SIM_LIMIT)hitSafetyLimit=true;
  const avgTurns=cleared?round1(totalTurns/cleared):0,lastHpPct=cleared?round1(lastWinHp/player.hp*100):0,stopFloor=hitSafetyLimit?floor:(failedEnemy?.floor||floor),rewardBase=cleared?lastWinFloor*2:0,reward=typeof adjustVipDungeonPoints==="function"?adjustVipDungeonPoints(rewardBase,testVip()):rewardBase;
  voidMirageTestResult={type:"climb",startFloor,cleared,lastWinFloor:cleared?lastWinFloor:null,stopFloor,rewardBase,reward,avgTurns,lastWinHp:cleared?lastWinHp:null,lastHpPct:cleared?lastHpPct:null,hitSafetyLimit};
  showVoidMirageTest(`<div class="notice">${testSummary("虛空幻境",`從第 ${startFloor} 層連續爬塔`)}<div class="muted gm-test-context">每層皆以滿血開始下一層；以下每日獎勵是假設最後成功樓層成為當日最高時的結果。</div><div class="stats" style="margin-top:10px"><div class="stat">起始樓層<b>${startFloor}</b></div><div class="stat">成功層數<b>${cleared}</b></div><div class="stat">最後成功樓層<b>${cleared?lastWinFloor:"—"}</b></div><div class="stat">停止／失敗樓層<b>${stopFloor}</b></div><div class="stat">基礎每日獎勵<b>${rewardBase.toLocaleString()}</b></div><div class="stat">測試 VIP 實得<b>${reward.toLocaleString()}</b></div><div class="stat">平均戰鬥回合<b>${avgTurns}</b></div><div class="stat">最後成功剩餘 HP<b>${cleared?`${lastWinHp}（${lastHpPct}%）`:"—"}</b></div></div></div>`);
 };

 window.GM_BOUNTY_UNIVERSE_PREVIEW_VERSION=1;
 window.GM_BOUNTY_INDEPENDENT_WORLD_TEST_VERSION=1;
 window.getBountyGmTestHtml=function(){return bountyTestHtml;};
 window.getVoidMirageGmTestHtml=function(){return voidMirageTestHtml;};
 window.gmBountyTestResultSnapshot=function(){const rows=Object.values(bountyTestResults);return rows.length?JSON.parse(JSON.stringify(rows)):null;};
 window.gmVoidMirageTestResultSnapshot=function(){return voidMirageTestResult?JSON.parse(JSON.stringify(voidMirageTestResult)):null;};
 window.gmClearBountyTestResult=function(){bountyTestHtml="";bountyTestResult=null;bountyTestResults={};return true;};
 window.gmClearVoidMirageTestResult=function(){voidMirageTestHtml="";voidMirageTestResult=null;return true;};
 window.GM_DUNGEON_SUMMARY_EXPORT_VERSION=1;
 window.GM_BOUNTY_STATE_ISOLATION_VERSION=1;
 window.GM_LEGACY_MAP_ARENA_TESTS_RETIRED_VERSION=1;
})();