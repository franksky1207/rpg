(function(){
 function voidState(){
  if(typeof ensureVoidMirageState==="function")return ensureVoidMirageState();
  if(!state.dungeon||typeof state.dungeon!=="object")state.dungeon={progress:0,attempts:0,points:0};
  if(!state.dungeon.voidMirage||typeof state.dungeon.voidMirage!=="object")state.dungeon.voidMirage={highestCleared:0};
  return state.dungeon.voidMirage;
 }
 function dungeonState(){
  if(typeof ensureDungeonProgressState==="function")return ensureDungeonProgressState();
  if(!state.dungeon||typeof state.dungeon!=="object")state.dungeon={progress:0,attempts:0,points:0};
  return state.dungeon;
 }
 function activeRun(){
  try{return typeof getVoidMirageRunSnapshot==="function"?getVoidMirageRunSnapshot():null;}catch(e){return null;}
 }
 function canManage(){
  const run=activeRun();
  if(run?.active){alert("虛空幻境挑戰進行中，請先結束或強制退出後再使用 GM 樓層管理。");return false;}
  return true;
 }
 function floorInput(id){
  const n=Number(document.getElementById(id)?.value);
  return Number.isFinite(n)&&n>=1?Math.floor(n):null;
 }
 function saveRender(){
  if(typeof save==="function")save(false);
  if(typeof render==="function")render();
 }
 function pointsForFloor(floor){
  if(typeof voidMirageFirstClearPoints==="function")return Math.max(0,Math.floor(Number(voidMirageFirstClearPoints(floor))||0));
  const f=Math.max(1,Math.floor(Number(floor)||1));
  let p=Math.round(15+1.75*Math.sqrt(Math.max(0,f-1)));
  if(f%10===0)p*=2;
  return p;
 }

 window.gmResetVoidMirageFloor=function(){
  if(!canManage())return;
  const s=voidState();
  s.highestCleared=0;
  saveRender();
 };

 window.gmMoveVoidMirageFloor=function(){
  if(!canManage())return;
  const target=floorInput("gmVoidMoveFloor");
  if(!target)return alert("請輸入 1 以上的指定樓層。");
  const s=voidState();
  s.highestCleared=target-1;
  saveRender();
 };

 window.gmClimbVoidMirageToFloor=function(){
  if(!canManage())return;
  const target=floorInput("gmVoidClimbFloor");
  if(!target)return alert("請輸入 1 以上的指定樓層。");
  const s=voidState();
  const current=Math.max(1,(Math.floor(Number(s.highestCleared)||0))+1);
  if(target<current)return alert(`指定樓層不能低於目前樓層（第 ${current} 層）。`);
  let gained=0;
  for(let floor=current;floor<=target;floor++)gained+=pointsForFloor(floor);
  s.highestCleared=target;
  const d=dungeonState();
  d.points=Math.max(0,Math.floor(Number(d.points)||0))+gained;
  if(typeof save==="function")save(false);
  alert(`虛空幻境已從第 ${current} 層推進到第 ${target} 層。\n獲得副本積分：${gained}`);
  if(typeof render==="function")render();
 };

 window.getVoidMirageGmManageInfo=function(){
  const s=voidState();
  const highest=Math.max(0,Math.floor(Number(s.highestCleared)||0));
  return {highestCleared:highest,currentFloor:highest+1};
 };
})();