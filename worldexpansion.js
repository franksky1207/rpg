(function(){
 const MAP_COUNT=MAPS.length;
 const OLD_GEAR_NAMES=[
  ["短鐵劍","破門短刃"],["粗布頭巾","巷戰防護盔"],["粗布皮甲","城防插板甲"],["草行靴","街區突進靴"],["青草護符","戰場識別牌"],
  ["獵狼長劍","壕溝軍刀"],["狼皮兜帽","哨戒戰盔"],["荊棘皮甲","防線重甲"],["林行長靴","越野作戰靴"],["森靈項鍊","前線測距儀"],
  ["黑鐵戰斧","試作振動刃"],["礦鋼頭盔","地堡密封盔"],["礦鋼鎧甲","實驗型護甲"],["鐵釘戰靴","封鎖區戰靴"],["晶礦戒指","軍規解碼器"],
  ["流沙彎刀","沙暴斬刀"],["赤砂頭盔","防砂戰術盔"],["赤砂戰甲","沙地複合甲"],["風沙長靴","荒漠疾行靴"],["烈日墜飾","熱源追獵器"],
  ["毒牙短刃","蝕毒軍刃"],["腐藤頭冠","全罩防化面盔"],["腐藤護甲","生化隔離甲"],["沼行長靴","污染區封閉靴"],["瘴氣寶珠","異變偵測器"],
  ["寒霜巨劍","霜鋼長刃"],["冰晶頭盔","極寒封閉盔"],["冰晶重鎧","冰原保溫甲"],["雪踏長靴","雪地抓地靴"],["雪魄護符","熱源定位器"],
  ["古文明戰刃","古代光刃"],["遺跡戰盔","遺物守衛盔"],["遺跡守護甲","自律護衛甲"],["古紋戰靴","遺跡浮行靴"],["失落王印","古文明鑰印"],
  ["熔火戰劍","熔蝕重刃"],["炎核頭盔","高熱隔離盔"],["炎核鎧甲","熔核耐熱甲"],["熔岩戰靴","熱區推進靴"],["赤焰魔石","反應爐調節器"],
  ["闇夜斬刃","禁衛脈衝刃"],["黑王戰盔","中樞禁衛盔"],["黑王戰鎧","指揮級複合甲"],["夜行戰靴","戰略機動靴"],["血月戒指","戰場指揮模組"],
  ["終焉魔劍","終戰斷界刃"],["深淵魔盔","終戰主控盔"],["深淵魔鎧","征服者重甲"],["魔界戰靴","最終突擊靴"],["魔王之眼","地球主控權限"]
 ];
 const GEAR_NAME_MIGRATION=new Map(OLD_GEAR_NAMES);

 function blankProgress(){return Array.from({length:MAP_COUNT},()=>[0,0,0,0]);}
 function fitArray(arr,fill){
  const out=Array.isArray(arr)?arr.slice(0,MAP_COUNT):[];
  while(out.length<MAP_COUNT)out.push(typeof fill==="function"?fill(out.length):fill);
  return out;
 }
 function migrateItem(item){
  if(!item||typeof item!=="object")return;
  const next=GEAR_NAME_MIGRATION.get(item.name);
  if(next)item.name=next;
 }
 function migrateItemCollections(s){
  EQUIPMENT_TYPES.forEach(type=>migrateItem(s.equipment?.[type]));
  (s.inventory||[]).forEach(migrateItem);
  (s.lostGear||[]).forEach(x=>migrateItem(x?.item));
  (s.shop?.items||[]).forEach(migrateItem);
 }
 function normalizeWorldState(s){
  if(!s||typeof s!=="object")return s;
  s.mapProgress=fitArray(s.mapProgress,()=>[0,0,0,0]).map(x=>Array.isArray(x)?[Number(x[0])||0,Number(x[1])||0,Number(x[2])||0,Number(x[3])||0]:[0,0,0,0]);
  s.bossProgress=fitArray(s.bossProgress,0).map(x=>Math.max(0,Number(x)||0));
  s.bossLocked=fitArray(s.bossLocked,false).map(Boolean);
  s.bossKilled=fitArray(s.bossKilled,false).map(Boolean);
  s.unlockedMap=Math.max(0,Math.min(MAP_COUNT-1,Math.floor(Number(s.unlockedMap)||0)));
  for(let i=0;i<MAP_COUNT-1;i++)if(s.bossKilled[i])s.unlockedMap=Math.max(s.unlockedMap,i+1);
  migrateItemCollections(s);
  s.saveVersion=SAVE_VERSION;
  return s;
 }

 blankMapProgress=blankProgress;
 const baseNewState=newState;
 newState=function(){return normalizeWorldState(baseNewState());};

 const baseLoad=load;
 load=function(){
  baseLoad();
  normalizeWorldState(state);
  selectedMap=Math.max(0,Math.min(state.unlockedMap,MAP_COUNT-1));
  save(false);
 };

 currentShopMap=function(){return Math.max(0,Math.min(state.unlockedMap,Math.floor((state.level-1)/5),MAP_COUNT-1));};

 const baseFightOnceForWorld=fightOnce;
 fightOnce=function(mapIdx,eIdx,encounter=null){
  const firstBoss=!state.bossKilled?.[mapIdx]&&MAPS[mapIdx]?.enemies?.[eIdx]?.[2]==="boss";
  const r=baseFightOnceForWorld(mapIdx,eIdx,encounter);
  if(r?.ok&&r.win&&firstBoss&&mapIdx>=9&&mapIdx<MAP_COUNT-1){
   state.unlockedMap=Math.max(state.unlockedMap,mapIdx+1);
   freeShopRefresh(mapIdx+1);
   save(false);
  }
  return r;
 };

 gmUnlock=function(){
  state.unlockedMap=MAP_COUNT-1;
  state.mapProgress=Array.from({length:MAP_COUNT},()=>[10,10,10,10]);
  state.bossProgress=Array(MAP_COUNT).fill(10);
  state.bossLocked=Array(MAP_COUNT).fill(false);
  state.bossKilled=Array(MAP_COUNT).fill(true);
  save();render();
 };

 gmGear=function(q){
  const mi=Math.max(0,Math.min(MAP_COUNT-1,Math.floor((state.level-1)/5)));
  state.inventory.push(makeItem(state.level,mi,"normal",q));save();render();
 };

 if(typeof gmSpecialMapForLevel==="function")gmSpecialMapForLevel=function(level){return Math.max(0,Math.min(MAP_COUNT-1,Math.floor((clampGameLevel(level)-1)/5)));};

 const baseHomePageForWorld=homePage;
 homePage=function(){return baseHomePageForWorld().replace("純文字 RPG","文明戰線");};
 document.title="文明戰線";
 const brand=document.getElementById("brandTitle");if(brand)brand.textContent="文明戰線";

 // ui.js 在本檔之前已經完成首次 load/render，所以現有存檔要在本次頁面載入就立即遷移。
 if(typeof state!=="undefined"&&state){
  normalizeWorldState(state);
  selectedMap=Math.max(0,Math.min(state.unlockedMap,MAP_COUNT-1));
  save(false);
 }
 setTimeout(()=>{if(typeof render==="function")render();},0);

 window.normalizeWorldSaveState=normalizeWorldState;
})();