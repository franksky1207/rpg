(function(){
 const MAP_COUNT=MAPS.length;

 function blankProgress(){return Array.from({length:MAP_COUNT},()=>[0,0,0,0]);}
 function fitArray(arr,fill){
  const out=Array.isArray(arr)?arr.slice(0,MAP_COUNT):[];
  while(out.length<MAP_COUNT)out.push(typeof fill==="function"?fill(out.length):fill);
  return out;
 }
 function normalizeWorldState(s){
  if(!s||typeof s!=="object")return s;
  s.mapProgress=fitArray(s.mapProgress,()=>[0,0,0,0]).map(x=>Array.isArray(x)?[Number(x[0])||0,Number(x[1])||0,Number(x[2])||0,Number(x[3])||0]:[0,0,0,0]);
  s.bossProgress=fitArray(s.bossProgress,0).map(x=>Math.max(0,Number(x)||0));
  s.bossLocked=fitArray(s.bossLocked,false).map(Boolean);
  s.bossKilled=fitArray(s.bossKilled,false).map(Boolean);
  s.unlockedMap=Math.max(0,Math.min(MAP_COUNT-1,Math.floor(Number(s.unlockedMap)||0)));
  for(let i=0;i<MAP_COUNT-1;i++)if(s.bossKilled[i])s.unlockedMap=Math.max(s.unlockedMap,i+1);
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

 // ui.js 在本檔之前已完成首次 load/render，因此只重新校正世界進度結構。
 if(typeof state!=="undefined"&&state){
  normalizeWorldState(state);
  selectedMap=Math.max(0,Math.min(state.unlockedMap,MAP_COUNT-1));
  save(false);
 }
 setTimeout(()=>{if(typeof render==="function")render();},0);

 window.normalizeWorldSaveState=normalizeWorldState;
})();