(function(){
 const VERSION=3;
 window.MAIN_MINIMAL_MODE_INTEGRITY_VERSION=VERSION;
 const src=fn=>{try{return typeof fn==="function"?Function.prototype.toString.call(fn):"";}catch(e){return "";}};

 function run(){
  const issues=[];
  const fail=code=>issues.push(code);

  if(Number(window.MAIN_MINIMAL_MODE_HOOK_VERSION)!==2)fail("hook-version");
  if(Number(window.MAIN_MINIMAL_MODE_PIPELINE_HOOK_VERSION)!==1)fail("pipeline-hook-version");
  if(Number(window.MAIN_MINIMAL_MODE_SPECIAL_HOOK_VERSION)!==1)fail("special-hook-version");
  if(Number(window.MAIN_MINIMAL_MODE_BACKGROUND_POLICY_VERSION)!==1)fail("background-policy-version");
  if(Number(window.MAIN_MINIMAL_MODE_ADAPTER_VERSION)!==1)fail("adapter-version");
  if(Number(window.VOID_MINIMAL_MODE_HOOK_VERSION)!==1)fail("void-hook-version");

  if(typeof window.openMainMinimalMode!=="function")fail("open-api");
  if(typeof window.closeMainMinimalMode!=="function")fail("close-api");
  if(typeof window.isMainMinimalModeOpen!=="function")fail("open-state-api");
  if(typeof window.mainMinimalModeEnsureCombatHeader!=="function")fail("header-hook-api");
  if(typeof window.mainMinimalModeHandleBattleResult!=="function")fail("battle-result-hook-api");
  if(typeof window.mainMinimalModeHandleSpecialResult!=="function")fail("special-result-hook-api");
  if(typeof window.openMinimalMode!=="function")fail("adapter-open-api");
  if(typeof window.registerMinimalModeAdapter!=="function")fail("adapter-register-api");
  if(typeof window.getMinimalModeAdapterId!=="function")fail("adapter-id-api");
  if(typeof window.openVoidMirageMinimalMode!=="function")fail("void-open-api");

  if(typeof window.mainMinimalModeBackgroundPolicy!=="function"||window.mainMinimalModeBackgroundPolicy()!=="follow-gm-background-setting")fail("background-policy");

  if(typeof window.openMainPowerSave!=="undefined")fail("legacy-open-api");
  if(typeof window.closeMainPowerSave!=="undefined")fail("legacy-close-api");
  if(typeof window.syncMainPowerSave!=="undefined")fail("legacy-sync-api");
  if(typeof window.setMainPowerSaveState!=="undefined")fail("legacy-state-api");
  if(typeof window.isMainPowerSaveOpen!=="undefined")fail("legacy-open-state-api");
  if(typeof window.mainPowerSaveOwnsBackgroundFlow!=="undefined")fail("legacy-background-owner-api");

  const minimalSources=[
   src(window.openMainMinimalMode),
   src(window.closeMainMinimalMode),
   src(window.mainMinimalModeHandleBattleResult),
   src(window.mainMinimalModeHandleSpecialResult)
  ].join("\n");
  if(/backgroundProgressStart|backgroundProgressStop/.test(minimalSources))fail("minimal-mode-mutates-background-flow");
  if(/MutationObserver/.test(minimalSources))fail("minimal-mode-observer-present");
  if(/PowerSave|power-save/.test(minimalSources))fail("legacy-runtime-name-present");

  if(typeof window.backgroundProgressMainBattleAllowsBackground!=="function")fail("background-gate-api");
  if(typeof window.gmBackgroundBattleEnabled!=="function")fail("gm-background-api");
  if(typeof window.backgroundProgressMainBattleAllowsBackground==="function"&&typeof window.gmBackgroundBattleEnabled==="function"&&window.backgroundProgressMainBattleAllowsBackground()!==window.gmBackgroundBattleEnabled())fail("background-gate-mismatch");

  if(typeof window.mainMinimalModeEnsureCombatHeader==="function"&&window.mainMinimalModeEnsureCombatHeader({continuous:false})!==false)fail("single-battle-entry-guard");
  if(typeof window.mainMinimalModeHandleBattleResult==="function"&&window.isMainMinimalModeOpen?.()===false&&window.mainMinimalModeHandleBattleResult({pendingStoryId:null})!==false)fail("inactive-result-guard");
  if(typeof window.mainMinimalModeHandleSpecialResult==="function"&&window.isMainMinimalModeOpen?.()===false&&window.mainMinimalModeHandleSpecialResult({},null,{win:false})!==false)fail("inactive-special-guard");

  const report={version:VERSION,ok:issues.length===0,issues,backgroundPolicy:typeof window.mainMinimalModeBackgroundPolicy==="function"?window.mainMinimalModeBackgroundPolicy():null};
  window.MAIN_MINIMAL_MODE_INTEGRITY_REPORT=report;
  if(!report.ok)console.error("Main minimal mode integrity check failed",report);
  return report;
 }

 window.runMainMinimalModeIntegrity=run;
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(run,0),{once:true});else setTimeout(run,0);
})();