(function(){
 const errors=[],warnings=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const required=["createMirrorCombatSnapshot","normalizeMirrorCombatSnapshot","runMirrorCombatCore","mirrorDungeonStatus","beginMirrorDungeonState","recordMirrorDungeonCompletion","resetMirrorDungeonToday","startMirrorCombatRun","mirrorDungeonRewardForWins","mirrorDungeonResultComment","mirrorDungeonRecordTitle","mirrorDungeonClampWins","gmResetMirrorDungeonToday","gmSetMirrorFormalResult","gmApplyMirrorFormalResultMutation","gmCommitMirrorFormalResult","gmMirrorTest","gmMirrorSymmetryTest","combatDamageWithRng","auditCurrentMirrorCombatSnapshotSources","mirrorCombatWorldForState","mirrorDungeonIdentityHtml","playerTitleHtml","registerDungeonViewRenderer","registerDungeonHomeCardRenderer","registerDungeonNavigationGuard","isValidMirrorDateKey","mirrorMarkPresentationTarget"];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("MISSING_FUNCTION",`鏡像戰必要函式 ${name} 未載入`);});
 const cfg=window.MIRROR_DUNGEON_CONFIG;
 if(!cfg||Number(window.MIRROR_DUNGEON_CONFIG_VERSION)!==1)fail("CONFIG","鏡像戰集中設定未載入");
 else{
  if(cfg.unlockLevel!==50||window.MIRROR_DUNGEON_UNLOCK_LEVEL!==cfg.unlockLevel)fail("UNLOCK_LEVEL",`鏡像戰解鎖等級設定異常：${cfg.unlockLevel}`);
  if(cfg.runBattles!==20||window.MIRROR_DUNGEON_RUN_BATTLES!==cfg.runBattles||window.MIRROR_COMBAT_BATTLE_LIMIT!==cfg.runBattles)fail("RUN_BATTLES",`鏡像戰場數設定未對齊：${cfg.runBattles}`);
  if(cfg.rewardPerWinSquared!==20)fail("REWARD_FACTOR",`鏡像戰獎勵係數異常：${cfg.rewardPerWinSquared}`);
  if(!Array.isArray(cfg.resultComments)||cfg.resultComments.length!==cfg.runBattles+1)fail("COMMENT_CONFIG","鏡像戰評語數量未與場數對齊");
 }
 if(Number(window.COMBAT_DAMAGE_MODEL_VERSION)!==1)fail("DAMAGE_MODEL_VERSION",`共用傷害模型版本異常：${window.COMBAT_DAMAGE_MODEL_VERSION}`);
 if(Number(window.DUNGEON_UI_EXTENSION_VERSION)!==1)fail("DUNGEON_UI_EXTENSION","副本 UI 擴充 owner 未載入");
 if(Number(window.GM_MIRROR_FORMAL_RESULT_VERSION)!==1)fail("GM_MIRROR_FORMAL_RESULT_VERSION","GM 鏡像正式裁定 owner 未載入",window.GM_MIRROR_FORMAL_RESULT_VERSION);
 if(typeof window.combatDamageWithRng==="function"){const low=window.combatDamageWithRng(100,20,()=>0),mid=window.combatDamageWithRng(100,20,()=>.5),high=window.combatDamageWithRng(100,20,()=>1);if(low!==85||mid!==89||high!==94)fail("SHARED_DAMAGE_MODEL",`共用傷害公式結果異常：${low}/${mid}/${high}`);}
 if(typeof window.getNewStateNormalizerCount==="function"&&Number(window.getNewStateNormalizerCount())!==5)fail("NORMALIZER_COUNT",`正式 newState normalizer 應為 5 個，實際 ${window.getNewStateNormalizerCount()}`);
 if(typeof window.mirrorDungeonRewardForWins==="function")[[0,0],[1,20],[10,2000],[20,8000]].forEach(([wins,reward])=>{const actual=window.mirrorDungeonRewardForWins(wins);if(Number(actual)!==reward)fail("REWARD_FORMULA",`${wins} 勝應得 ${reward} VIP，實際 ${actual}`);});
 if(typeof window.mirrorDungeonRecordTitle==="function"&&(window.mirrorDungeonRecordTitle(14)!==""||window.mirrorDungeonRecordTitle(15)!=="幸運眷顧"||window.mirrorDungeonRecordTitle(20)!=="神蹟"))fail("RECORD_TITLES","15～20 勝歷史稱號規則異常");
 if(typeof window.mirrorDungeonResultComment==="function"&&(window.mirrorDungeonResultComment(0)!=="你輸給了自己，而且是徹底的那種。"||window.mirrorDungeonResultComment(10)!=="完美五五開。連命運都懶得選邊。"||window.mirrorDungeonResultComment(20)!=="你擊敗了命運本身。"))fail("RESULT_COMMENTS","鏡像戰結算評語規則異常");
 if(typeof newState==="function"){const fresh=newState(),mirror=fresh?.dungeon?.mirror;if(!mirror||mirror.daily?.status!=="idle"||mirror.history?.bestDate!==null||Number(mirror.history?.bestWins)!==0)fail("NEW_STATE","新存檔未正確建立鏡像戰初始狀態",mirror||null);}
 if(typeof window.gmApplyMirrorFormalResultMutation==="function"){
  try{
   const ts=Date.parse("2026-09-16T04:00:00Z"),probe={level:50,vipPoints:321,dungeon:{mirror:{version:2,history:{bestWins:16,bestDate:"2026-09-10",miracleDates:[]},daily:{dateKey:"2026-09-16",status:"idle",challengeDate:null,startedAt:0,wins:0,losses:0,completedAt:0}}},titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}};
   const vipBefore=probe.vipPoints,r18=window.gmApplyMirrorFormalResultMutation(probe,18,ts),dateKey=r18?.dateKey,ids18=Array.from(probe.titles?.unlocked||[]);
   if(!r18?.ok||probe.dungeon.mirror.daily.status!=="completed"||probe.dungeon.mirror.daily.wins!==18||probe.dungeon.mirror.daily.losses!==2||probe.dungeon.mirror.history.bestWins!==18||probe.dungeon.mirror.history.bestDate!==dateKey||probe.vipPoints!==vipBefore)fail("GM_FORMAL_18_RESULT","GM 裁定 18 勝必須同步 daily/history 且不得增加 VIP",{r18,mirror:probe.dungeon.mirror,vip:probe.vipPoints});
   ["mirror_title_15","mirror_title_16","mirror_title_17","mirror_title_18"].forEach(id=>{if(!ids18.includes(id))fail("GM_FORMAL_18_TITLE",`GM 裁定 18 勝應解鎖 ${id}`,ids18);});
   if(ids18.includes("mirror_title_19")||ids18.includes("mirror_title_20"))fail("GM_FORMAL_18_TITLE_OVERGRANT","GM 裁定 18 勝不得越級授予 19／20 勝稱號",ids18);
   const r20=window.gmApplyMirrorFormalResultMutation(probe,20,ts),ids20=Array.from(probe.titles?.unlocked||[]);
   if(!r20?.ok||probe.dungeon.mirror.daily.wins!==20||probe.dungeon.mirror.daily.losses!==0||probe.dungeon.mirror.history.bestWins!==20||probe.dungeon.mirror.history.bestDate!==r20.dateKey||probe.dungeon.mirror.history.miracleDates.length!==1||probe.dungeon.mirror.history.miracleDates[0]!==r20.dateKey||probe.vipPoints!==vipBefore)fail("GM_FORMAL_20_RESULT","GM 裁定 20 勝必須同步今日神蹟且不得增加 VIP",{r20,mirror:probe.dungeon.mirror,vip:probe.vipPoints});
   ["mirror_title_19","mirror_title_20"].forEach(id=>{if(!ids20.includes(id))fail("GM_FORMAL_20_TITLE",`GM 裁定 20 勝應解鎖 ${id}`,ids20);});
   const beforeReject=JSON.stringify(probe),r19=window.gmApplyMirrorFormalResultMutation(probe,19,ts);if(r19?.ok!==false||r19?.reason!=="not-an-upgrade"||JSON.stringify(probe)!==beforeReject)fail("GM_FORMAL_NO_DOWNGRADE","GM 鏡像正式裁定不得下降或重寫較低紀錄",{r19,mirror:probe.dungeon.mirror});
  }catch(err){fail("GM_FORMAL_RESULT_PROBE","GM 鏡像正式裁定回歸測試失敗",String(err?.message||err));}
 }
 if(typeof window.auditCurrentMirrorCombatSnapshotSources==="function"){try{const audit=window.auditCurrentMirrorCombatSnapshotSources();if(!audit?.passed)fail("SNAPSHOT_SOURCE_AUDIT","鏡像快照未完整對齊正式玩家戰鬥來源",audit?.issues||audit||null);}catch(err){fail("SNAPSHOT_SOURCE_AUDIT_ERROR","鏡像快照來源稽核失敗",String(err?.message||err));}}
 if(Number(window.MIRROR_COMBAT_CORE_VERSION)!==6)fail("MIRROR_COMBAT_VERSION","Mirror Combat Core 應為 V6",window.MIRROR_COMBAT_CORE_VERSION);
 if(Number(window.MIRROR_COMBAT_WORLD_PHASE_VERSION)!==1)fail("MIRROR_WORLD_PHASE_VERSION","Mirror 應正式識別三紀元 world phase",window.MIRROR_COMBAT_WORLD_PHASE_VERSION);
 if(Number(window.MIRROR_CIVILIZATION_DAMAGE_VERSION)!==1)fail("MIRROR_CIVILIZATION_DAMAGE","Mirror civilization damage layer missing",window.MIRROR_CIVILIZATION_DAMAGE_VERSION);
 if(Number(window.MIRROR_COMBAT_MARK_RULE_VERSION)!==Number(window.MARK_COMBAT_RULE_VERSION))fail("MIRROR_MARK_RULE_VERSION","鏡像印記規則版本未與共用 Mark Core 同步",{mirror:window.MIRROR_COMBAT_MARK_RULE_VERSION,mark:window.MARK_COMBAT_RULE_VERSION});
 if(Number(window.MIRROR_RUN_VERSION)!==4||Number(window.MIRROR_MARK_PRESENTATION_VERSION)!==1)fail("MIRROR_MARK_PRESENTATION","鏡像戰 run／印記戰鬥呈現版本異常",{run:window.MIRROR_RUN_VERSION,presentation:window.MIRROR_MARK_PRESENTATION_VERSION});
 if(Number(window.MIRROR_W3_INTEGRATION_VERSION)!==1||Number(window.MIRROR_W3_TITLE_PRESENTATION_VERSION)!==1)fail("MIRROR_W3_INTEGRATION","鏡像戰 W3 整合契約未載入",{integration:window.MIRROR_W3_INTEGRATION_VERSION,title:window.MIRROR_W3_TITLE_PRESENTATION_VERSION});
 const w3Policy=window.MIRROR_W3_RESOURCE_POLICY;
 if(w3Policy?.reward!=="vip"||w3Policy?.sharedProgress!=="mirror-history"||w3Policy?.exp!==false||w3Policy?.dimensionalStrings!==false||w3Policy?.thirdWorldBossHp!==false||w3Policy?.thirdWorldCore!==false)fail("MIRROR_W3_RESOURCE_POLICY","鏡像戰不得成為高維主線資源／進度來源",w3Policy||null);
 if(typeof window.mirrorCombatWorldForState==="function"){
  const probes=[[{secondWorld:{entered:false},thirdWorld:{entered:false}},1],[{secondWorld:{entered:true},thirdWorld:{entered:false}},2],[{secondWorld:{entered:true},thirdWorld:{entered:true}},3]];
  probes.forEach(([target,expected])=>{const actual=Number(window.mirrorCombatWorldForState(target));if(actual!==expected)fail("WORLD_PHASE_PROBE",`Mirror world phase 應為 ${expected}，實際 ${actual}`,{target,actual});});
 }
 if(typeof window.playerTitleHtml==="function"&&typeof window.mirrorDungeonIdentityHtml==="function"){
  [["higher-dimensional-title-01",1],["higher-dimensional-title-06",6],["higher-dimensional-title-10",10]].forEach(([titleId,tier])=>{
   const title=String(window.playerTitleHtml(titleId)),common="player-title--higher-dimensional",specific=`player-title--higher-dimensional-${tier}`;
   if(!title.includes(common)||!title.includes(specific))fail("W3_TITLE_RENDERER",`高維稱號 ${tier} renderer 未輸出正式 class`,title);
  });
  const wiring=Function.prototype.toString.call(window.mirrorDungeonIdentityHtml);
  if(!/playerIdentityNameHtml/.test(wiring)||!/[鏡]像・/.test(wiring)||!/compact\s*:\s*true/.test(wiring))fail("W3_TITLE_IDENTITY_WIRING","Mirror 玩家／鏡像身份未共用正式稱號 renderer",wiring);
 }
 if(typeof window.createMirrorCombatSnapshot==="function"&&typeof window.runMirrorCombatCore==="function"){try{const snap=window.createMirrorCombatSnapshot(),markKeys=Array.from(window.MARK_KEYS||[]);if(!snap?.stats||Number(snap.stats.hp)<=0)fail("SNAPSHOT","鏡像戰快照缺少有效戰鬥能力",snap||null);if(Number(snap.damageModelVersion)!==Number(window.COMBAT_DAMAGE_MODEL_VERSION))fail("SNAPSHOT_DAMAGE_MODEL","鏡像快照傷害模型版本未對齊共用傷害模型",snap||null);if(Number(snap.markRuleVersion)!==Number(window.MARK_COMBAT_RULE_VERSION)||markKeys.length!==10||markKeys.some(key=>!Number.isFinite(Number(snap.marks?.[key]))))fail("SNAPSHOT_MARKS","鏡像快照未完整包含 10 枚印記與規則版本",snap||null);const result=window.runMirrorCombatCore(snap,{logs:false});if(!result||!["player","mirror"].includes(result.winner)||!["player","mirror"].includes(result.firstActor)||!result.markState)fail("COMBAT_RESULT","Mirror Combat 單場結果格式／印記狀態異常",result||null);}catch(err){fail("COMBAT_PROBE","Mirror Combat 試跑失敗",String(err?.message||err));}}
 if(typeof window.normalizeMirrorCombatSnapshot==="function"){
  try{
   const base={stats:{hp:100,atk:10,def:5,crit:0,dodge:0},specializations:{},specializationBonuses:{},enhancementLevels:{},equipment:{}};
   const legacy=window.normalizeMirrorCombatSnapshot(base),markKeys=Array.from(window.MARK_KEYS||[]);
   if(markKeys.length!==10||markKeys.some(key=>Number(legacy.marks?.[key])!==0))fail("LEGACY_MARK_SNAPSHOT","舊鏡像快照缺少 marks 時應正規化為 10 枚 Lv.0",legacy);
   [1,2,3].forEach(world=>{const normalized=window.normalizeMirrorCombatSnapshot({...base,world});if(Number(normalized.world)!==world)fail("LEGACY_WORLD_SNAPSHOT",`既有／新版鏡像 snapshot world=${world} 應保持相容`,normalized);});
  }catch(err){fail("LEGACY_MARK_SNAPSHOT_ERROR","舊鏡像快照正規化測試失敗",String(err?.message||err));}
 }
 if(typeof window.mirrorMarkPresentationTarget==="function"){
  const mappings=[
   [{type:"mark",owner:"player",mark:"ward",action:"activate"},"player"],
   [{type:"mark",owner:"mirror",mark:"ward",action:"activate"},"enemy"],
   [{type:"mark",owner:"player",target:"mirror",mark:"suppression",action:"preventDodge"},"enemy"],
   [{type:"mark",owner:"mirror",target:"player",mark:"ignore",action:"trigger"},"player"],
   [{type:"mark",owner:"mirror",target:"player",mark:"backlash",action:"trigger"},"player"]
  ];
  mappings.forEach(([evt,expected])=>{const actual=window.mirrorMarkPresentationTarget(evt);if(actual!==expected)fail("MARK_PRESENTATION_TARGET",`${evt.mark}/${evt.owner} target 應為 ${expected}，實際 ${actual}`,evt);});
 }
 if(typeof window.requestMirrorContinuousStop!=="undefined"||typeof window.stopMirrorCombatRun!=="undefined")fail("STOP_API","鏡像戰不應提供正式停止 API");
 if(Number(window.DUNGEON_PREP_RETURN_UX_VERSION)<2)warnings.push({code:"PREP_RETURN_UX",message:"懸賞／競技準備頁正式返回導覽尚未載入"});
 if(Number(window.GM_HUB_EXTENSION_VERSION)!==2)warnings.push({code:"GM_HUB_EXTENSION",message:"GM Hub 擴充 owner 尚未載入"});
 if(Number(window.MIRROR_DUNGEON_GUIDE_VERSION)!==2)warnings.push({code:"GUIDE",message:"鏡像戰遊戲說明模組版本異常"});
 window.MIRROR_DUNGEON_INTEGRITY={passed:errors.length===0,errors,warnings,worldPhaseVersion:Number(window.MIRROR_COMBAT_WORLD_PHASE_VERSION)||0,w3IntegrationVersion:Number(window.MIRROR_W3_INTEGRATION_VERSION)||0,w3TitlePresentationVersion:Number(window.MIRROR_W3_TITLE_PRESENTATION_VERSION)||0,checkedAt:Date.now()};
 if(errors.length)console.error("[Mirror Dungeon Integrity]",errors);else console.info("[Mirror Dungeon Integrity] passed",warnings.length?warnings:"");
})();