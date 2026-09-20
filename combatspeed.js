(function(){
 const VERSION=1;
 const PLAYER_RULE_VERSION=1;
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
 function playerCombatSpeed(){
  // Lv.1～500 的正式玩家規則目前固定為 1×。
  // 未來突破 500 後的正式倍速解鎖只應從這個 owner 擴充。
  return 1;
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
 window.COMBAT_SPEED_GM_OVERRIDE_VERSION=GM_OVERRIDE_VERSION;
 window.COMBAT_SPEED_ALLOWED=ALLOWED.slice();
 window.playerCombatSpeed=playerCombatSpeed;
 window.gmCombatSpeedOverride=gmOverride;
 window.effectiveCombatSpeed=effectiveCombatSpeed;
 window.combatSpeedScaledDelay=scaledDelay;
 window.setGmCombatSpeedOverride=setGmOverride;
 window.clearGmCombatSpeedOverride=clearCurrent;
 window.clearGmCombatSpeedOverrideForUser=clearForUser;
 window.gmCombatSpeedStorageKey=storageKey;
})();