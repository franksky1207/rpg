(function(){
 const errors=[],warnings=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const required=["createMirrorCombatSnapshot","runMirrorCombatCore","mirrorDungeonStatus","beginMirrorDungeonState","recordMirrorDungeonCompletion","resetMirrorDungeonToday","startMirrorCombatRun","mirrorDungeonRewardForWins","mirrorDungeonResultComment","mirrorDungeonRecordTitle","gmResetMirrorDungeonToday","gmMirrorTest"];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("MISSING_FUNCTION",`鏡像戰必要函式 ${name} 未載入`);});
 if(Number(window.MIRROR_DUNGEON_UNLOCK_LEVEL)!==50)fail("UNLOCK_LEVEL",`鏡像戰應為 Lv.50 解鎖，實際 ${window.MIRROR_DUNGEON_UNLOCK_LEVEL}`);
 if(Number(window.MIRROR_DUNGEON_RUN_BATTLES)!==20)fail("RUN_BATTLES",`鏡像戰每次應固定 20 場，實際 ${window.MIRROR_DUNGEON_RUN_BATTLES}`);
 if(Number(window.MIRROR_COMBAT_BATTLE_LIMIT)!==20)fail("COMBAT_LIMIT",`Mirror Combat battle limit 應為 20，實際 ${window.MIRROR_COMBAT_BATTLE_LIMIT}`);
 if(typeof window.getNewStateNormalizerCount==="function"&&Number(window.getNewStateNormalizerCount())!==4)fail("NORMALIZER_COUNT",`正式 newState normalizer 應維持 4 個，實際 ${window.getNewStateNormalizerCount()}`);
 if(typeof window.mirrorDungeonRewardForWins==="function"){
  [[0,0],[1,20],[10,2000],[20,8000]].forEach(([wins,reward])=>{const actual=window.mirrorDungeonRewardForWins(wins);if(Number(actual)!==reward)fail("REWARD_FORMULA",`${wins} 勝應得 ${reward} VIP，實際 ${actual}`);});
 }
 if(typeof window.mirrorDungeonRecordTitle==="function"){
  if(window.mirrorDungeonRecordTitle(14)!==""||window.mirrorDungeonRecordTitle(15)!=="幸運眷顧"||window.mirrorDungeonRecordTitle(20)!=="神蹟")fail("RECORD_TITLES","15～20 勝歷史稱號規則異常");
 }
 if(typeof window.mirrorDungeonResultComment==="function"){
  if(window.mirrorDungeonResultComment(0)!=="你輸給了自己，而且是徹底的那種。"||window.mirrorDungeonResultComment(10)!=="完美五五開。連命運都懶得選邊。"||window.mirrorDungeonResultComment(20)!=="你擊敗了命運本身。")fail("RESULT_COMMENTS","鏡像戰結算評語規則異常");
 }
 if(typeof newState==="function"){
  const fresh=newState(),mirror=fresh?.dungeon?.mirror;
  if(!mirror||mirror.daily?.status!=="idle"||mirror.history?.bestDate!==null||Number(mirror.history?.bestWins)!==0)fail("NEW_STATE","新存檔未正確建立鏡像戰初始狀態",mirror||null);
 }
 if(typeof window.createMirrorCombatSnapshot==="function"&&typeof window.runMirrorCombatCore==="function"){
  try{
   const snap=window.createMirrorCombatSnapshot();
   if(!snap?.stats||Number(snap.stats.hp)<=0)fail("SNAPSHOT","鏡像戰快照缺少有效戰鬥能力",snap||null);
   const result=window.runMirrorCombatCore(snap,{logs:false});
   if(!result||!["player","mirror"].includes(result.winner)||!["player","mirror"].includes(result.firstActor))fail("COMBAT_RESULT","Mirror Combat 單場結果格式異常",result||null);
  }catch(err){fail("COMBAT_PROBE","Mirror Combat 試跑失敗",String(err?.message||err));}
 }
 if(typeof window.requestMirrorContinuousStop!=="undefined"||typeof window.stopMirrorCombatRun!=="undefined")fail("STOP_API","鏡像戰不應提供正式停止 API");
 if(Number(window.DUNGEON_PREP_RETURN_UX_VERSION)!==1)warnings.push({code:"PREP_RETURN_UX",message:"懸賞／競技準備頁返回按鈕模組尚未載入"});
 if(Number(window.MIRROR_DUNGEON_GUIDE_VERSION)!==1)warnings.push({code:"GUIDE",message:"鏡像戰遊戲說明模組尚未載入"});
 window.MIRROR_DUNGEON_INTEGRITY={passed:errors.length===0,errors,warnings,checkedAt:Date.now()};
 if(errors.length)console.error("[Mirror Dungeon Integrity]",errors);
 else console.info("[Mirror Dungeon Integrity] passed",warnings.length?warnings:"");
})();