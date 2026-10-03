(function(){
 const BREAKTHROUGH_PLAYER_UI_VERSION=1;
 const queue=[];
 let active=null;
 let timer=null;

 function whole(value){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0?n:0;}
 function percentText(value){const n=Number(value);if(!Number.isFinite(n))return "0";return Number.isInteger(n)?String(n):String(Math.round(n*100)/100);}
 function normalizeAward(result){
  if(!result||typeof result!=="object")return null;
  const awarded=whole(result.awarded);
  if(awarded<1)return null;
  const milestones=(Array.isArray(result.milestones)?result.milestones:[]).map(whole).filter(v=>v>0);
  const permanentAfter=whole(result.permanentAfter);
  return Object.freeze({
   awarded,
   milestones:Object.freeze(milestones),
   permanentAfter,
   equipmentBonusPercent:permanentAfter*(Number(window.BREAKTHROUGH_EQUIPMENT_PERCENT_PER_LEVEL)||2.5),
   finalDamageBonusPercent:permanentAfter*(Number(window.BREAKTHROUGH_FINAL_DAMAGE_ADD_PER_LEVEL)||.05)*100
  });
 }
 function noticeSnapshot(result){
  const row=normalizeAward(result);if(!row)return null;
  const milestoneText=row.milestones.length?row.milestones.map(level=>`Lv.${level}`).join("、"):"突破里程碑";
  return Object.freeze({
   ...row,
   title:"突破成功！",
   milestoneText,
   levelText:`突破等級提升 ${row.awarded} 級`,
   currentText:`目前突破等級 Lv.${row.permanentAfter}`,
   equipmentText:`裝備 HP／ATK／DEF 加成 +${percentText(row.equipmentBonusPercent)}%`,
   damageText:`最終傷害加成 +${percentText(row.finalDamageBonusPercent)}%`
  });
 }
 function ensureModal(){
  if(typeof document==="undefined"||!document.body)return null;
  let modal=document.getElementById("breakthroughPlayerModal");
  if(modal)return modal;
  modal=document.createElement("div");
  modal.className="modal";
  modal.id="breakthroughPlayerModal";
  modal.setAttribute("role","dialog");
  modal.setAttribute("aria-modal","true");
  modal.setAttribute("aria-labelledby","breakthroughPlayerModalTitle");
  modal.innerHTML=`<div class="modal-box"><h3 id="breakthroughPlayerModalTitle">突破成功！</h3><div id="breakthroughPlayerModalDetail"></div><div class="controls"><button class="btn primary" type="button" data-breakthrough-notice-confirm>確認</button></div></div>`;
  modal.querySelector("[data-breakthrough-notice-confirm]")?.addEventListener("click",()=>closeNotice());
  document.body.appendChild(modal);
  return modal;
 }
 function otherModalBusy(){
  if(typeof document==="undefined")return false;
  return Array.from(document.querySelectorAll(".modal.show")).some(el=>el.id!=="breakthroughPlayerModal");
 }
 function runtimeBusy(){
  if(typeof window.reincarnationRuntimeStatus!=="function")return false;
  try{return window.reincarnationRuntimeStatus()?.blocked===true;}catch(_){return false;}
 }
 function schedule(delay=0){
  if(timer!=null)return;
  timer=setTimeout(()=>{timer=null;flushQueue();},Math.max(0,Number(delay)||0));
 }
 function openNotice(result){
  const snap=noticeSnapshot(result);if(!snap)return false;
  const modal=ensureModal();if(!modal)return false;
  const title=modal.querySelector("#breakthroughPlayerModalTitle"),detail=modal.querySelector("#breakthroughPlayerModalDetail");
  if(title)title.textContent=snap.title;
  if(detail)detail.innerHTML=`<div class="notice"><b>${snap.milestoneText}</b><div style="margin-top:8px">${snap.levelText}</div><div style="margin-top:5px">${snap.currentText}</div></div><div class="stats" style="margin-top:12px"><div class="stat">裝備能力<b>+${percentText(snap.equipmentBonusPercent)}%</b></div><div class="stat">最終傷害<b>+${percentText(snap.finalDamageBonusPercent)}%</b></div></div>`;
  active=snap;
  modal.classList.add("show");
  return true;
 }
 function closeNotice(){
  const modal=typeof document!=="undefined"?document.getElementById("breakthroughPlayerModal"):null;
  if(modal)modal.classList.remove("show");
  active=null;
  if(queue.length)schedule(0);
 }
 function flushQueue(){
  if(active||!queue.length)return false;
  if(otherModalBusy()||runtimeBusy()){schedule(160);return false;}
  const next=queue.shift();
  if(!openNotice(next)){queue.unshift(next);schedule(160);return false;}
  return true;
 }
 function queueNotice(result){
  const snap=noticeSnapshot(result);if(!snap)return null;
  queue.push(result);
  schedule(0);
  return snap;
 }

 window.BREAKTHROUGH_PLAYER_UI_VERSION=BREAKTHROUGH_PLAYER_UI_VERSION;
 window.breakthroughPlayerNoticeSnapshot=noticeSnapshot;
 window.queueBreakthroughPlayerNotice=queueNotice;
 window.openBreakthroughPlayerNotice=openNotice;
 window.closeBreakthroughPlayerNotice=closeNotice;
 window.flushBreakthroughPlayerNoticeQueue=flushQueue;
 window.breakthroughPlayerNoticeQueueLength=function(){return queue.length;};
 window.breakthroughPlayerNoticeActive=function(){return active;};
})();