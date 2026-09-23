(function(){
 const VERSION=1;
 const ADAPTER_ID="second-world-calamity";
 const originalPage=window.secondWorldCivilizationCalamityPageHtml;
 const originalContinuous=window.runSecondWorldCalamityContinuous;
 let retainedRun=null;
 let retainedStatus=null;
 let completedLevelUp=false;

 function liveRun(){return typeof window.getSecondWorldCalamityRunSnapshot==="function"?window.getSecondWorldCalamityRunSnapshot():null;}
 function displayRun(){return liveRun()||retainedRun;}
 function currentStatus(){
  const run=displayRun();
  const id=run?.calamityId;
  return id&&typeof window.getSecondWorldCalamityStatus==="function"?window.getSecondWorldCalamityStatus(id):retainedStatus;
 }
 function isActive(){const run=liveRun();return run?.active===true&&run?.mode==="continuous";}
 function fmt(v){return Math.max(0,Math.floor(Number(v)||0)).toLocaleString();}
 function pct(v){return Math.max(0,Math.min(100,Number(v)||0)).toFixed(2).replace(/\.00$/,"")+"%";}
 function playerMaxHp(){return typeof window.playerCombatStats==="function"?Math.max(1,Number(window.playerCombatStats()?.hp)||1):1;}
 function contentHtml(){
  const run=displayRun(),st=currentStatus(),maxHp=Math.max(1,Number(st?.maxHp)||1),playerHp=playerMaxHp();
  return `<div class="main-minimal-mode-block"><div class="main-minimal-mode-label">目前災厄</div><div class="main-minimal-mode-value" data-second-world-calamity-minimal-name>${run?.calamityName||"文明災厄"}</div></div>
   <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">連續討伐</div><div class="main-minimal-mode-value" data-second-world-calamity-minimal-round>第 ${Math.max(1,(Number(run?.battleCount)||0)+1)} 場</div></div>
   <div class="main-minimal-mode-block main-minimal-mode-stats"><div data-second-world-calamity-minimal-enemy-hp>災厄 HP　${fmt(st?.currentHp)} / ${fmt(maxHp)}</div><div data-second-world-calamity-minimal-player-hp>玩家 HP　${fmt(state?.hp)} / ${fmt(playerHp)}</div><div data-second-world-calamity-minimal-progress>文明進度　${pct(st?.progressPercent)}</div><div data-second-world-calamity-minimal-kills>完整擊殺　${Math.max(0,Math.min(30,Math.floor(Number(st?.trueKills)||0)))} / 30</div></div>`;
 }
 function sync(root,mode){
  const run=displayRun(),st=currentStatus(),last=run?.lastBattle||null,maxHp=Math.max(1,Number(st?.maxHp)||Number(last?.maxHp)||1),pMax=playerMaxHp();
  const name=root.querySelector("[data-second-world-calamity-minimal-name]");
  const round=root.querySelector("[data-second-world-calamity-minimal-round]");
  const enemyHp=root.querySelector("[data-second-world-calamity-minimal-enemy-hp]");
  const playerHp=root.querySelector("[data-second-world-calamity-minimal-player-hp]");
  const progress=root.querySelector("[data-second-world-calamity-minimal-progress]");
  const kills=root.querySelector("[data-second-world-calamity-minimal-kills]");
  if(name)name.textContent=run?.calamityName||st?.definition?.name||"文明災厄";
  if(round){const count=Math.max(0,Math.floor(Number(run?.battleCount)||0));round.textContent=`第 ${mode==="running"?count+1:Math.max(1,count)} 場`;}
  if(enemyHp){const hp=mode==="running"?Math.max(0,Number(st?.currentHp)||Number(last?.enemyEndHp)||maxHp):Math.max(0,Number(st?.currentHp)||maxHp);enemyHp.textContent=`災厄 HP　${fmt(hp)} / ${fmt(maxHp)}`;}
  if(playerHp){const hp=mode==="running"?Math.max(0,Number(last?.playerEndHp ?? state?.hp)||0):Math.max(0,Number(state?.hp)||pMax);playerHp.textContent=`玩家 HP　${fmt(hp)} / ${fmt(pMax)}`;}
  if(progress)progress.textContent=`文明進度　${pct(st?.progressPercent)}`;
  if(kills)kills.textContent=`完整擊殺　${Math.max(0,Math.min(30,Math.floor(Number(st?.trueKills)||0)))} / 30`;
 }
 function registerAdapter(){
  if(typeof window.registerMinimalModeAdapter!=="function")return false;
  return window.registerMinimalModeAdapter(ADAPTER_ID,{isActive,runningStatus:"文明災厄連續討伐中",centerClass:"main-minimal-mode-center--stacked",contentHtml,sync});
 }
 window.openSecondWorldCalamityMinimalMode=function(){return typeof window.openMinimalMode==="function"?window.openMinimalMode(ADAPTER_ID):false;};

 function injectEntry(html){
  const run=liveRun();
  if(!run?.active||run.mode!=="continuous"||typeof html!=="string"||html.includes("openSecondWorldCalamityMinimalMode()"))return html;
  return html.replace(/<div class="calamity-combat-head"><span>([\s\S]*?)<\/span><\/div>/,`<div class="calamity-combat-head main-minimal-mode-head"><span class="main-minimal-mode-head-label">$1</span><button type="button" class="main-minimal-mode-enter" onclick="openSecondWorldCalamityMinimalMode()">極簡模式</button></div>`);
 }
 if(typeof originalPage==="function")window.secondWorldCivilizationCalamityPageHtml=function(){return injectEntry(originalPage.apply(this,arguments));};

 function applyEndState(run){
  retainedRun=run||retainedRun;
  const id=retainedRun?.calamityId;
  if(id&&typeof window.getSecondWorldCalamityStatus==="function")retainedStatus=window.getSecondWorldCalamityStatus(id);
  if(window.getMinimalModeAdapterId?.()!==ADAPTER_ID||!window.isMinimalModeOpen?.())return;
  window.setMinimalModeState?.("stopped");
  window.syncMinimalMode?.();
  const overlay=document.getElementById("mainMinimalModeOverlay");
  if(!overlay)return;
  if(retainedRun?.reason==="civilization-complete"){
   const status=overlay.querySelector("[data-main-minimal-mode-status]");
   const note=overlay.querySelector("[data-main-minimal-mode-note]");
   if(status){status.textContent="文明階段已完成";status.classList.remove("is-stopped");status.classList.add("is-complete");}
   if(note){note.textContent=completedLevelUp?"文明等級已提升":"文明進度已達 100%";note.hidden=false;}
  }
 }
 if(typeof originalContinuous==="function")window.runSecondWorldCalamityContinuous=async function(value,options={}){
  retainedRun=null;retainedStatus=null;completedLevelUp=false;
  const userBattle=typeof options.onBattleComplete==="function"?options.onBattleComplete:null;
  const userEnd=typeof options.onEnd==="function"?options.onEnd:null;
  return originalContinuous.call(this,value,{
   ...options,
   async onBattleComplete(step){
    retainedRun=step?.run||liveRun()||retainedRun;
    if(step?.result?.settlement?.civilizationLevelUp===true)completedLevelUp=true;
    if(userBattle)await userBattle(step);
    if(window.getMinimalModeAdapterId?.()===ADAPTER_ID&&window.isMinimalModeOpen?.())window.syncMinimalMode?.();
   },
   async onEnd(run){retainedRun=run||liveRun()||retainedRun;if(userEnd)await userEnd(run);applyEndState(retainedRun);}
  });
 };

 registerAdapter();
 window.SECOND_WORLD_CALAMITY_MINIMAL_MODE_VERSION=VERSION;
 window.SECOND_WORLD_CALAMITY_MINIMAL_MODE_INTEGRITY={version:VERSION,passed:typeof window.openSecondWorldCalamityMinimalMode==="function"&&typeof window.secondWorldCivilizationCalamityPageHtml==="function"&&typeof window.runSecondWorldCalamityContinuous==="function"&&typeof window.registerMinimalModeAdapter==="function"};
})();
