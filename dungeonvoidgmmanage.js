(function(){
 function voidState(){
  if(typeof ensureVoidMirageState==="function")return ensureVoidMirageState();
  if(!state.dungeon||typeof state.dungeon!=="object")state.dungeon={};
  if(!state.dungeon.voidMirage||typeof state.dungeon.voidMirage!=="object")state.dungeon.voidMirage={highestCleared:0};
  return state.dungeon.voidMirage;
 }
 function dailyState(){
  const daily=typeof ensureDailyState==="function"?ensureDailyState():state.daily;
  if(!daily.voidMirage||typeof daily.voidMirage!=="object")daily.voidMirage={highestFloor:0,claimed:false};
  return daily.voidMirage;
 }
 function activeRun(){try{return typeof getVoidMirageRunSnapshot==="function"?getVoidMirageRunSnapshot():null;}catch(e){return null;}}
 function canManage(){const run=activeRun();if(run?.active){alert("虛空幻境挑戰進行中，請先結束或強制退出後再使用 GM 樓層管理。");return false;}return true;}
 function nonNegativeInt(value){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0?n:null;}
 function saveRender(){if(typeof save==="function")save(false);if(typeof render==="function")render();}

 window.gmSetVoidMirageState=function(highest,dailyHighest,claimed){
  if(!canManage())return false;
  const h=nonNegativeInt(highest),d=nonNegativeInt(dailyHighest);
  if(h==null||d==null){alert("虛空層數請輸入 0 以上的整數。");return false;}
  const historical=Math.max(h,d);
  voidState().highestCleared=historical;
  const daily=dailyState();daily.highestFloor=d;daily.claimed=claimed===true;
  saveRender();return true;
 };
 window.gmResetVoidMirageFloor=function(){
  if(!canManage())return;
  voidState().highestCleared=0;
  const daily=dailyState();daily.highestFloor=0;daily.claimed=false;
  saveRender();
 };
 window.getVoidMirageGmManageInfo=function(){
  const s=voidState(),daily=dailyState();
  const highest=Math.max(0,Math.floor(Number(s.highestCleared)||0));
  const dailyHighest=Math.max(0,Math.floor(Number(daily.highestFloor)||0));
  const start=typeof getVoidMirageStartFloor==="function"?getVoidMirageStartFloor():Math.max(1,highest-100);
  return {highestCleared:highest,startFloor:start,dailyHighest,claimed:daily.claimed===true,reward:typeof voidMirageDailyStatus==="function"?voidMirageDailyStatus().reward:dailyHighest*2};
 };
})();