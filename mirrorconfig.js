(function(){
 const CONFIG=Object.freeze({
  version:1,
  unlockLevel:50,
  runBattles:20,
  rewardPerWinSquared:20,
  combat:Object.freeze({counterScale:.40,comboScale:.50,penetrationDefMultiplier:.75,drainRatio:.10}),
  recordTitles:Object.freeze({15:"幸運眷顧",16:"天選之刻",17:"逆命者",18:"傳說之日",19:"距神一步",20:"神蹟"}),
  resultComments:Object.freeze([
   "你輸給了自己，而且是徹底的那種。","至少命運最後還是留了一點面子。","鏡像看起來比你本人還有自信。","尊嚴還在，只是剩得不多。","今天的自己，似乎特別難打。","命運今天明顯沒有站在你這邊。","開始有點反抗的樣子了。","至少現在看起來像一場比賽。","局勢還沒失控，但命運顯然還在看戲。","差一點，就能把天平拉回中央。","完美五五開。連命運都懶得選邊。","天平終於稍微往你這邊偏了一點。","今天的命運，開始有點客氣了。","運氣開始有點囂張了。","鏡像現在大概已經想申訴了。","幸運不是路過，是直接住下來了。","連機率都開始明顯偏心。","你不是在贏自己，你是在欺負機率。","今天的命運，已經偏心得有點過分了。","只差最後一步，神蹟就在門後。","你擊敗了命運本身。"
  ])
 });
 function clampWins(value){return Math.max(0,Math.min(CONFIG.runBattles,Math.floor(Number(value)||0)));}
 function rewardForWins(value){const wins=clampWins(value);return CONFIG.rewardPerWinSquared*wins*wins;}
 function titleForWins(value){return CONFIG.recordTitles[clampWins(value)]||"";}
 function commentForWins(value){return CONFIG.resultComments[clampWins(value)]||CONFIG.resultComments[0];}
 window.MIRROR_DUNGEON_CONFIG_VERSION=CONFIG.version;
 window.MIRROR_DUNGEON_CONFIG=CONFIG;
 window.MIRROR_DUNGEON_UNLOCK_LEVEL=CONFIG.unlockLevel;
 window.MIRROR_DUNGEON_RUN_BATTLES=CONFIG.runBattles;
 window.mirrorDungeonClampWins=clampWins;
 window.mirrorDungeonRewardForWins=rewardForWins;
 window.mirrorDungeonRecordTitle=titleForWins;
 window.mirrorDungeonResultComment=commentForWins;
})();