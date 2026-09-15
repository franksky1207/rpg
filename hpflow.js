(function(){
 window.restorePlayerHp=function(options={}){
  state.hp=playerCombatStats().hp;
  if(options.save!==false)save(false);
  return state.hp;
 };

 // 正式 load/migration pipeline 已集中於 savemigration.js；本檔只負責 HP 共用規則，不再覆寫主線 UI／戰鬥入口。
 // 相容標記暫時保留，Boss continuous 的正式入口 owner 已回到 ui.js。
 window.HP_FLOW_BOSS_CONTINUOUS_FIX_VERSION=1;

 // 新版規則下，非戰鬥狀態維持滿 HP；不再在此重跑 migration。
 restorePlayerHp({save:false});
 save(false);
})();