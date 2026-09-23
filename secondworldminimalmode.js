(function(){
 const VERSION=1;
 const ADAPTER_ID="second-world-mainline";
 const originalAdventurePage=window.secondWorldAdventurePageHtml;
 const originalContinuous=window.startSecondWorldBossContinuous;

 function activeContext(){return window.activeSecondWorldMainlineContext||null;}
 function isActive(){const ctx=activeContext();return ctx?.continuous===true&&!!ctx.currentEncounter;}
 function progressSnapshot(){return typeof window.levelProgressSnapshot==="function"?window.levelProgressSnapshot(state):{atCap:false,exp:Number(state?.exp)||0,need:0};}
 function fmt(value){return Math.max(0,Math.floor(Number(value)||0)).toLocaleString();}
 function contentHtml(){
  return `<div class="main-minimal-mode-block"><div class="main-minimal-mode-label">目前敵人</div><div class="main-minimal-mode-value" data-second-world-minimal-enemy>宇宙 Boss</div></div>
   <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">連續戰鬥</div><div class="main-minimal-mode-value" data-second-world-minimal-round>第 1 場</div></div>
   <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">角色</div><div class="main-minimal-mode-value" data-second-world-minimal-level>Lv.${Math.max(1,Math.floor(Number(state?.level)||1))}</div></div>
   <div class="main-minimal-mode-block main-minimal-mode-stats"><div data-second-world-minimal-exp>EXP　—</div><div data-second-world-minimal-dark-matter>暗物質　${fmt(state?.secondWorld?.darkMatter)}</div><div data-second-world-minimal-dark-energy>暗能量　${fmt(state?.secondWorld?.darkEnergy)}</div></div>`;
 }
 function sync(root,mode){
  const ctx=activeContext();
  const encounter=ctx?.currentEncounter||ctx?.lastCombat?.e||ctx?.boss||null;
  const progress=progressSnapshot();
  const enemy=root.querySelector("[data-second-world-minimal-enemy]");
  const round=root.querySelector("[data-second-world-minimal-round]");
  const level=root.querySelector("[data-second-world-minimal-level]");
  const exp=root.querySelector("[data-second-world-minimal-exp]");
  const darkMatter=root.querySelector("[data-second-world-minimal-dark-matter]");
  const darkEnergy=root.querySelector("[data-second-world-minimal-dark-energy]");
  if(enemy&&mode==="running")enemy.textContent=encounter?`${encounter.name}　Lv.${encounter.level}`:"宇宙 Boss";
  if(round)round.textContent=`第 ${Math.max(1,Math.floor(Number(ctx?.completed)||0)+1)} 場`;
  if(level)level.textContent=progress.atCap?`Lv.${state.level} MAX`:`Lv.${state.level}`;
  if(exp)exp.textContent=`EXP　${progress.atCap?"MAX":`${fmt(progress.exp)} / ${fmt(progress.need)}`}`;
  if(darkMatter)darkMatter.textContent=`暗物質　${fmt(state?.secondWorld?.darkMatter)}`;
  if(darkEnergy)darkEnergy.textContent=`暗能量　${fmt(state?.secondWorld?.darkEnergy)}`;
 }
 function registerAdapter(){
  if(typeof window.registerMinimalModeAdapter!=="function")return false;
  return window.registerMinimalModeAdapter(ADAPTER_ID,{isActive,runningStatus:"宇宙主線持續戰鬥中",centerClass:"main-minimal-mode-center--stacked",contentHtml,sync});
 }
 window.openSecondWorldMainlineMinimalMode=function(){return typeof window.openMinimalMode==="function"?window.openMinimalMode(ADAPTER_ID):false;};

 function injectEntry(html){
  const ctx=activeContext();
  if(!ctx?.continuous||!ctx.currentEncounter||typeof html!=="string"||html.includes("openSecondWorldMainlineMinimalMode()"))return html;
  return html.replace(/<div class="combat-head">([\s\S]*?)<\/div>/,`<div class="combat-head main-minimal-mode-head"><span class="main-minimal-mode-head-label">$1</span><button type="button" class="main-minimal-mode-enter" onclick="openSecondWorldMainlineMinimalMode()">極簡模式</button></div>`);
 }
 if(typeof originalAdventurePage==="function")window.secondWorldAdventurePageHtml=function(){return injectEntry(originalAdventurePage.apply(this,arguments));};

 if(typeof originalContinuous==="function")window.startSecondWorldBossContinuous=async function(value){
  const beforePending=state?.storyProgress?.pendingStory||null;
  const pending=originalContinuous.call(this,value);
  const ctx=activeContext();
  const result=await pending;
  if(window.getMinimalModeAdapterId?.()===ADAPTER_ID&&window.isMinimalModeOpen?.()){
   const afterPending=state?.storyProgress?.pendingStory||null;
   const hasNewStory=!!afterPending&&afterPending!==beforePending;
   window.setMinimalModeState?.(hasNewStory?"story":"stopped");
   window.syncMinimalMode?.();
  }
  return result;
 };

 registerAdapter();
 window.SECOND_WORLD_MAINLINE_MINIMAL_MODE_VERSION=VERSION;
 window.SECOND_WORLD_MAINLINE_MINIMAL_MODE_INTEGRITY={
  version:VERSION,
  passed:typeof window.openSecondWorldMainlineMinimalMode==="function"&&typeof window.secondWorldAdventurePageHtml==="function"&&typeof window.startSecondWorldBossContinuous==="function"&&typeof window.registerMinimalModeAdapter==="function"
 };
})();
