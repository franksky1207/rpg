(function(){
 const MAX_NAME_UNITS=12;
 function charUnits(ch){
  try{return /\p{Script=Han}/u.test(ch)?2:1;}catch(_){return /[\u3400-\u9fff\uf900-\ufaff]/.test(ch)?2:1;}
 }
 function nameUnits(value){return Array.from(String(value??"")).reduce((sum,ch)=>sum+charUnits(ch),0);}
 window.playerNameUnits=nameUnits;
 window.PLAYER_NAME_MAX_UNITS=MAX_NAME_UNITS;

 const baseSettingsPage=window.settingsPage;
 if(typeof baseSettingsPage==="function")window.settingsPage=function(){
  return String(baseSettingsPage()||"").replace("最多 12 個字；空白名稱儲存時會自動恢復成「玩家」。","名稱最多 12 格，中文字算 2 格；空白名稱儲存時會自動恢復成「玩家」。");
 };

 window.savePlayerName=function(){
  const input=document.getElementById("playerNameInput");
  let name=(input?.value||"").trim();
  if(!name)name="玩家";
  if(nameUnits(name)>MAX_NAME_UNITS){alert("名稱過長。\n名稱最多 12 格，中文字算 2 格。");return false;}
  state.playerName=name;
  save();render();
  return true;
 };

 window.PLAYER_NAME_RULE_VERSION=1;
})();