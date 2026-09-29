(function(){
 const VERSION=4;
 const PLAYER_RULE_VERSION=4;
 const PHASE_RULE_VERSION=1;
 const GM_OVERRIDE_VERSION=1;
 const STORAGE_PREFIX="civilization_frontline_gm_combat_speed_v1_";
 const ALLOWED=Object.freeze([1,1.5,2]);

 function normalizeSpeed(value){
  const n=Number(value);
  return ALLOWED.includes(n)?n:null;
 }
 function currentUserId(){
  const id=window.civilizationAuth?.getUser?.()?.id||window.civilizationAuthSession?.user?.id||"";
  return String(id||"");
 }
 function storageKeyForUser(userId){
  const id=String(userId||"").trim();
  return id?`${STORAGE_PREFIX}${id}`:"";
 }
 function storageKey(){return storageKeyForUser(currentUserId());}
 function currentGameState(){
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}
  catch(e){return null;}
 }
 function combatSpeedWorldPhase(target=null){
  const gameState=target&&typeof target==="object"?target:currentGameState();
  if(typeof window.currentWorldPhase==="function"){
   const phase=Number(window.currentWorldPhase(gameState));
   if(phase===1||phase===2||phase===3)return phase;
  }
  if(gameState?.thirdWorld?.entered===true)return 3;
  if(gameState?.secondWorld?.entered===true)return 2;
  return 1;
 }
 function playerCombatSpeedOptions(target=null){
  return combatSpeedWorldPhase(target)>=2?[1,1.5]:[1];
 }
 function playerCombatSpeed(){
  const gameState=currentGameState(),options=playerCombatSpeedOptions(gameState);
  const stored=normalizeSpeed(gameState?.settings?.combatSpeed);
  return stored!=null&&options.includes(stored)?stored:1;
 }
 function setPlayerCombatSpeed(value){
  const gameState=currentGameState(),speed=normalizeSpeed(value),options=playerCombatSpeedOptions(gameState);
  if(speed==null||!options.includes(speed)||speed===2||!gameState)return false;
  if(!gameState.settings||typeof gameState.settings!=="object"||Array.isArray(gameState.settings))gameState.settings={};
  const previous=gameState.settings.combatSpeed;
  gameState.settings.combatSpeed=speed;
  const saved=typeof save==="function"?save(false):true;
  if(saved!==true){gameState.settings.combatSpeed=previous;return false;}
  window.dispatchEvent(new CustomEvent("combat-speed-change",{detail:{speed,effectiveSpeed:effectiveCombatSpeed(),source:"player"}}));
  return true;
 }
 function gmOverride(){
  const key=storageKey();
  if(!key)return null;
  try{return normalizeSpeed(localStorage.getItem(key));}
  catch(e){return null;}
 }
 function effectiveCombatSpeed(){
  return gmOverride()??playerCombatSpeed();
 }
 function scaledDelay(baseMs,speed=effectiveCombatSpeed()){
  const base=Math.max(0,Number(baseMs)||0);
  const resolved=normalizeSpeed(speed)??playerCombatSpeed();
  return Math.max(0,Math.round(base/resolved));
 }
 function setGmOverride(value){
  const speed=normalizeSpeed(value),key=storageKey();
  if(speed==null||!key)return false;
  try{
   localStorage.setItem(key,String(speed));
   window.dispatchEvent(new CustomEvent("combat-speed-change",{detail:{speed,effectiveSpeed:effectiveCombatSpeed(),source:"gm"}}));
   return true;
  }catch(e){return false;}
 }
 function clearForUser(userId){
  const key=storageKeyForUser(userId);
  if(!key)return false;
  try{
   localStorage.removeItem(key);
   window.dispatchEvent(new CustomEvent("combat-speed-change",{detail:{speed:null,effectiveSpeed:playerCombatSpeed(),source:"logout"}}));
   return true;
  }catch(e){return false;}
 }
 function clearCurrent(){return clearForUser(currentUserId());}

 window.COMBAT_SPEED_CORE_VERSION=VERSION;
 window.COMBAT_SPEED_PLAYER_RULE_VERSION=PLAYER_RULE_VERSION;
 window.COMBAT_SPEED_PHASE_RULE_VERSION=PHASE_RULE_VERSION;
 window.COMBAT_SPEED_GM_OVERRIDE_VERSION=GM_OVERRIDE_VERSION;
 window.COMBAT_SPEED_ALLOWED=ALLOWED.slice();
 window.combatSpeedWorldPhase=combatSpeedWorldPhase;
 window.playerCombatSpeedOptions=playerCombatSpeedOptions;
 window.playerCombatSpeed=playerCombatSpeed;
 window.setPlayerCombatSpeed=setPlayerCombatSpeed;
 window.gmCombatSpeedOverride=gmOverride;
 window.effectiveCombatSpeed=effectiveCombatSpeed;
 window.combatSpeedScaledDelay=scaledDelay;
 window.setGmCombatSpeedOverride=setGmOverride;
 window.clearGmCombatSpeedOverride=clearCurrent;
 window.clearGmCombatSpeedOverrideForUser=clearForUser;
 window.gmCombatSpeedStorageKey=storageKey;
})();