(function(){
 window.restorePlayerHp=function(options={}){
  state.hp=playerCombatStats().hp;
  if(options.save!==false)save(false);
  return state.hp;
 };

 // 正式 load/migration pipeline 已集中於 savemigration.js；本檔只負責 HP 共用規則，不覆寫主線 UI／戰鬥入口。
 // 新版規則下，非戰鬥狀態維持滿 HP；不再在此重跑 migration。
 restorePlayerHp({save:false});
 save(false);
})();