(function(){
 function installStyles(){
  if(document.getElementById("batch5UiStyles"))return;
  const style=document.createElement("style");style.id="batch5UiStyles";style.textContent=`
   .game-daily-clock{margin-left:auto;text-align:center;line-height:1.05;flex:0 0 auto;padding:0 4px}.game-daily-clock-time{font-size:22px;font-weight:850;letter-spacing:.06em;color:#f0d494;font-variant-numeric:tabular-nums}.game-daily-clock-note{margin-top:4px;font-size:10px;color:#9f9b93;white-space:nowrap}.brand>#saveStatus{margin-left:12px;flex:0 0 auto}
   .gm-batch5-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:12px}.gm-batch5-grid label{display:flex;flex-direction:column;gap:5px;color:#d8c49a;font-size:13px}.gm-batch5-grid input,.gm-batch5-grid select{width:100%}
   @media(max-width:760px){.brand{gap:7px}.game-daily-clock{padding:0}.game-daily-clock-time{font-size:17px}.game-daily-clock-note{font-size:9px;margin-top:3px}.brand>#saveStatus{margin-left:2px}.gm-batch5-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}}
   @media(max-width:430px){.brand>#saveStatus{display:none}.game-daily-clock-time{font-size:18px}}
  `;document.head.appendChild(style);
 }
 function clockText(){return new Date(Date.now()+8*60*60*1000).toISOString().slice(11,19);}
 let clockElement=null,clockTimeElement=null;
 function connected(node){return !!node&&(typeof node.isConnected!=="boolean"||node.isConnected);}
 function ensureClock(){
  if(connected(clockElement)&&connected(clockTimeElement))return clockElement;
  clockElement=document.getElementById("gameDailyClock");
  clockTimeElement=document.getElementById("gameDailyClockTime");
  if(connected(clockElement)&&connected(clockTimeElement))return clockElement;
  const brand=document.querySelector("header .brand");
  if(!brand){clockElement=null;clockTimeElement=null;return null;}
  if(!clockElement){
   clockElement=document.createElement("div");clockElement.id="gameDailyClock";clockElement.className="game-daily-clock";
   clockElement.innerHTML='<div id="gameDailyClockTime" class="game-daily-clock-time">00:00:00</div><div class="game-daily-clock-note">每日凌晨 0 點重置</div>';
   const save=document.getElementById("saveStatus");if(save)brand.insertBefore(clockElement,save);else brand.appendChild(clockElement);
  }
  clockTimeElement=typeof clockElement.querySelector==="function"?clockElement.querySelector("#gameDailyClockTime"):document.getElementById("gameDailyClockTime");
  return clockElement;
 }
 let lastDateKey=typeof gameDailyDateKey==="function"?gameDailyDateKey():"";
 function tickClock(){
  ensureClock();if(clockTimeElement)clockTimeElement.textContent=clockText();
  if(typeof gameDailyDateKey!=="function")return;
  const key=gameDailyDateKey();if(key===lastDateKey)return;lastDateKey=key;
  if(typeof ensureDailyState==="function")ensureDailyState();
  if(typeof save==="function")save(false);
  const busy=typeof battleBusy!=="undefined"&&battleBusy===true;
  const bgActive=typeof window.backgroundProgressIsActive==="function"&&(window.backgroundProgressIsActive("void")||window.backgroundProgressIsActive("arena")||window.backgroundProgressIsActive("bounty"));
  if(!busy&&!bgActive&&typeof render==="function")render();
 }

 function finiteInt(value,min=0,max=Number.MAX_SAFE_INTEGER){const n=Math.floor(Number(value));return Number.isFinite(n)?Math.max(min,Math.min(max,n)):null;}
 function formalManagePhase(target=state){
  if(typeof window.gmFormalManagePhase==="function")return window.gmFormalManagePhase(target);
  if(typeof window.currentWorldPhase==="function"){
   const phase=Number(window.currentWorldPhase(target));
   if(phase===1||phase===2||phase===3)return phase;
  }
  return target?.thirdWorld?.entered===true?3:target?.secondWorld?.entered===true?2:1;
 }
 function dungeonManagementNoteForPhase(phase=formalManagePhase()){
  const value=Math.max(1,Math.min(3,Math.floor(Number(phase)||1)));
  if(value===3)return "競技場每日 20 輪由銀河／宇宙／高維三個紀元共用；高維紀元沒有額外 Rank 或獨立每日計數器。";
  if(value===2)return "銀河／宇宙競技場共用每日 20 輪計數；本區可調整今日已使用次數。";
  return "銀河紀元競技場每日共 20 輪；本區可調整今日已使用次數。";
 }
 function gmDaily(){return typeof ensureDailyState==="function"?ensureDailyState():state.daily;}
 function gmVoidInfo(){return typeof getVoidMirageGmManageInfo==="function"?getVoidMirageGmManageInfo():{highestCleared:0,startFloor:1,dailyHighest:0,claimed:false,reward:0};}
 function voidRunActive(){try{return typeof getVoidMirageRunSnapshot==="function"&&getVoidMirageRunSnapshot()?.active===true;}catch(e){return false;}}
 function mirrorRunActive(){try{return typeof getMirrorDungeonActiveRun==="function"&&getMirrorDungeonActiveRun()?.active===true;}catch(e){return false;}}
 function thirdWorldArenaRunActive(){try{const rt=typeof window.getThirdWorldArenaRuntimeState==="function"?window.getThirdWorldArenaRuntimeState():null;return rt?.status==="combat"||rt?.status==="between"||rt?.status==="ready";}catch(e){return false;}}
 function mirrorManageStatusHtml(){
  const info=typeof mirrorDungeonStatus==="function"?mirrorDungeonStatus():null;
  if(!info)return '<div class="muted gm-hub-note">鏡像戰管理模組尚未載入。</div>';
  const h=info.history||{},record=h.bestDate?`${Math.max(0,Number(h.bestWins)||0)} 勝（${h.bestDate}）`:"尚無紀錄",miracles=Array.isArray(h.miracleDates)?h.miracleDates.length:0;
  return `<div class="muted gm-hub-note">今日狀態：${info.status==="idle"?"尚未挑戰":"今日鏡像戰已結束／進行中"}　・　歷史最高：${record}　・　神蹟 ${miracles} 次</div><div class="muted gm-hub-note" style="margin-top:6px">「重置今日副本」會一併恢復今日鏡像戰正式挑戰機會；歷史最高與神蹟紀錄不受影響。</div>`;
 }
 function mirrorManagementHtml(){
  if(typeof window.gmMirrorManagementHtml==="function"){
   try{return window.gmMirrorManagementHtml();}catch(error){console.error("GM mirror management renderer failed",error);}
  }
  return mirrorManageStatusHtml();
 }
 function gmStatus(){
  const daily=gmDaily()||{},bounty=Math.max(0,Math.min(20,Math.floor(Number(daily?.bounty?.used)||0))),arena=Math.max(0,Math.min(20,Math.floor(Number(daily?.arena?.used)||0))),info=gmVoidInfo();
  return {vip:Math.max(0,Math.floor(Number(state?.vipLevel)||0)),points:Math.max(0,Math.floor(Number(state?.vipPoints)||0)),bounty,arena,highest:Math.max(0,Math.floor(Number(info.highestCleared)||0)),start:Math.max(1,Math.floor(Number(info.startFloor)||1)),dailyHighest:Math.max(0,Math.floor(Number(info.dailyHighest)||0)),claimed:info.claimed===true,reward:Math.max(0,Math.floor(Number(info.reward)||0))};
 }
 function dungeonManagementHtml(){
  const s=gmStatus(),phaseNote=dungeonManagementNoteForPhase();
  return `<div class="notice gm-hub-note gm-dungeon-summary"><div class="gm-dungeon-summary-item"><span class="gm-dungeon-summary-label">今日懸賞</span><span class="gm-dungeon-summary-value">${s.bounty} / 20</span></div><span class="gm-dungeon-summary-sep">／</span><div class="gm-dungeon-summary-item"><span class="gm-dungeon-summary-label">今日競技場</span><span class="gm-dungeon-summary-value">${s.arena} / 20</span></div><span class="gm-dungeon-summary-sep">／</span><div class="gm-dungeon-summary-item"><span class="gm-dungeon-summary-label">VIP 等級</span><span class="gm-dungeon-summary-value">VIP${s.vip}</span></div><span class="gm-dungeon-summary-sep">／</span><div class="gm-dungeon-summary-item"><span class="gm-dungeon-summary-label">VIP 積分</span><span class="gm-dungeon-summary-value">${s.points.toLocaleString()}</span></div></div>
   <div class="muted gm-hub-note">${phaseNote}</div>
   <div class="gm-batch5-grid"><label>VIP 積分<input id="gmDungeonPoints" type="number" min="0" step="1" value="${s.points}"></label><label>今日懸賞已用<input id="gmBountyDailyUsed" type="number" min="0" max="20" step="1" value="${s.bounty}"></label><label>今日競技場已用<input id="gmArenaDailyUsed" type="number" min="0" max="20" step="1" value="${s.arena}"></label><label>虛空歷史最高<input id="gmVoidHistoricalHighest" type="number" min="0" step="1" value="${s.highest}"></label><label>虛空當日最高<input id="gmVoidDailyHighest" type="number" min="0" step="1" value="${s.dailyHighest}"></label><label>虛空今日領獎<select id="gmVoidDailyClaimed" class="btn"><option value="0" ${s.claimed?"":"selected"}>尚未領取</option><option value="1" ${s.claimed?"selected":""}>已領取</option></select></label></div>
   <div class="muted" style="margin-top:9px">虛空挑戰起點目前為第 ${s.start.toLocaleString()} 層；當日最高對應目前可領 ${s.reward.toLocaleString()} VIP。若當日最高高於歷史最高，套用時會自動把歷史最高同步提高。</div>
   <div class="controls"><button class="btn blue" onclick="gmApplyDungeonValues()">套用副本／VIP資料</button><button class="btn" onclick="gmResetDailyDungeonState()">重置今日副本</button></div><div class="item" style="margin-top:14px"><b>鏡像戰</b><div style="margin-top:9px">${mirrorManagementHtml()}</div></div>`;
 }
 window.gmDungeonManagementHtml=dungeonManagementHtml;
 window.gmDungeonManagementNoteForPhase=dungeonManagementNoteForPhase;
 window.gmApplyDungeonValues=function(){
  if(voidRunActive()){alert("虛空幻境挑戰進行中，請先結束或強制退出後再修改副本資料。");return false;}
  if(thirdWorldArenaRunActive()){alert("高維競技場挑戰進行中，請先結束目前挑戰後再修改副本資料。");return false;}
  if(typeof window.gmCommitFormalDungeonMutation!=="function"){alert("正式 GM transaction owner 尚未載入。");return false;}
  const values={points:document.getElementById("gmDungeonPoints")?.value,bounty:document.getElementById("gmBountyDailyUsed")?.value,arena:document.getElementById("gmArenaDailyUsed")?.value,highest:document.getElementById("gmVoidHistoricalHighest")?.value,dailyHighest:document.getElementById("gmVoidDailyHighest")?.value,claimed:document.getElementById("gmVoidDailyClaimed")?.value==="1"};
  const points=Number(values.points),bounty=Number(values.bounty),arena=Number(values.arena),highest=Number(values.highest),dailyHighest=Number(values.dailyHighest);
  if(!Number.isInteger(points)||points<0||!Number.isInteger(bounty)||bounty<0||bounty>20||!Number.isInteger(arena)||arena<0||arena>20||!Number.isInteger(highest)||highest<0||!Number.isInteger(dailyHighest)||dailyHighest<0){alert("請輸入有效的 0 以上整數；懸賞與競技場範圍為 0～20。");return false;}
  const tx=window.gmCommitFormalDungeonMutation({points,bounty,arena,highest,dailyHighest,claimed:values.claimed});
  if(!tx?.ok){alert(`副本／VIP資料更新失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return false;}
  if(typeof render==="function")render();
  return true;
 };
 window.gmResetDailyDungeonState=function(){
  if(voidRunActive()){alert("虛空幻境挑戰進行中，請先結束或強制退出後再重置今日副本。");return false;}
  if(mirrorRunActive()){alert("鏡像戰正在進行中，請先結束後再重置今日副本。");return false;}
  if(thirdWorldArenaRunActive()){alert("高維競技場挑戰進行中，請先結束目前挑戰後再重置今日副本。");return false;}
  if(typeof window.gmCommitFormalDailyDungeonReset!=="function"){alert("正式 GM transaction owner 尚未載入。");return false;}
  if(!confirm("將重置今日全部副本狀態：懸賞、競技場、虛空與鏡像戰。\n\n虛空歷史最高、鏡像歷史最高與神蹟紀錄都會保留。\n\n確定重置？"))return false;
  const tx=window.gmCommitFormalDailyDungeonReset();
  if(!tx?.ok){alert(`今日副本重置失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return false;}
  if(typeof render==="function")render();
  return true;
 };

 installStyles();ensureClock();tickClock();setInterval(tickClock,1000);
 window.BATCH5_CLOCK_CACHE_VERSION=1;
 window.GM_DUNGEON_DAILY_RESET_MERGE_VERSION=2;
 window.GM_ARENA_SHARED_DAILY_MANAGEMENT_VERSION=1;
 window.GM_THIRD_WORLD_ARENA_MANAGEMENT_GUARD_VERSION=1;
 window.GM_DUNGEON_PHASE_COPY_VERSION=1;
 window.GM_DUNGEON_MIRROR_MANAGEMENT_WIRING_VERSION=1;
 window.BATCH5_UI_READY=true;
})();