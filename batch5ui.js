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
 function ensureClock(){
  const brand=document.querySelector("header .brand");if(!brand)return null;
  let clock=document.getElementById("gameDailyClock");
  if(!clock){clock=document.createElement("div");clock.id="gameDailyClock";clock.className="game-daily-clock";clock.innerHTML='<div id="gameDailyClockTime" class="game-daily-clock-time">00:00:00</div><div class="game-daily-clock-note">每日凌晨 0 點重置</div>';const save=document.getElementById("saveStatus");if(save)brand.insertBefore(clock,save);else brand.appendChild(clock);}
  return clock;
 }
 let lastDateKey=typeof gameDailyDateKey==="function"?gameDailyDateKey():"";
 function tickClock(){
  ensureClock();const time=document.getElementById("gameDailyClockTime");if(time)time.textContent=clockText();
  if(typeof gameDailyDateKey!=="function")return;
  const key=gameDailyDateKey();if(key===lastDateKey)return;lastDateKey=key;
  if(typeof ensureDailyState==="function")ensureDailyState();
  if(typeof save==="function")save(false);
  const bgActive=typeof window.backgroundProgressIsActive==="function"&&(window.backgroundProgressIsActive("void")||window.backgroundProgressIsActive("arena")||window.backgroundProgressIsActive("bounty"));
  if(!window.battleBusy&&!bgActive&&typeof render==="function")render();
 }

 function finiteInt(value,min=0,max=Number.MAX_SAFE_INTEGER){const n=Math.floor(Number(value));return Number.isFinite(n)?Math.max(min,Math.min(max,n)):null;}
 function gmDaily(){return typeof ensureDailyState==="function"?ensureDailyState():state.daily;}
 function gmVoidInfo(){return typeof getVoidMirageGmManageInfo==="function"?getVoidMirageGmManageInfo():{highestCleared:0,startFloor:1,dailyHighest:0,claimed:false,reward:0};}
 function gmStatus(){
  const daily=gmDaily()||{},bounty=Math.max(0,Math.min(20,Math.floor(Number(daily?.bounty?.used)||0))),arena=Math.max(0,Math.min(20,Math.floor(Number(daily?.arena?.used)||0))),info=gmVoidInfo();
  return {vip:Math.max(0,Math.floor(Number(state?.vipLevel)||0)),points:Math.max(0,Math.floor(Number(state?.vipPoints)||0)),bounty,arena,highest:Math.max(0,Math.floor(Number(info.highestCleared)||0)),start:Math.max(1,Math.floor(Number(info.startFloor)||1)),dailyHighest:Math.max(0,Math.floor(Number(info.dailyHighest)||0)),claimed:info.claimed===true,reward:Math.max(0,Math.floor(Number(info.reward)||0))};
 }
 function dungeonManagementHtml(){
  const s=gmStatus();
  return `<div class="notice gm-hub-note gm-dungeon-summary"><div class="gm-dungeon-summary-item"><span class="gm-dungeon-summary-label">今日懸賞</span><span class="gm-dungeon-summary-value">${s.bounty} / 20</span></div><span class="gm-dungeon-summary-sep">／</span><div class="gm-dungeon-summary-item"><span class="gm-dungeon-summary-label">今日競技場</span><span class="gm-dungeon-summary-value">${s.arena} / 20</span></div><span class="gm-dungeon-summary-sep">／</span><div class="gm-dungeon-summary-item"><span class="gm-dungeon-summary-label">VIP 等級</span><span class="gm-dungeon-summary-value">VIP${s.vip}</span></div><span class="gm-dungeon-summary-sep">／</span><div class="gm-dungeon-summary-item"><span class="gm-dungeon-summary-label">VIP 積分</span><span class="gm-dungeon-summary-value">${s.points.toLocaleString()}</span></div></div>
   <div class="gm-batch5-grid"><label>VIP 積分<input id="gmDungeonPoints" type="number" min="0" step="1" value="${s.points}"></label><label>今日懸賞已用<input id="gmBountyDailyUsed" type="number" min="0" max="20" step="1" value="${s.bounty}"></label><label>今日競技場已用<input id="gmArenaDailyUsed" type="number" min="0" max="20" step="1" value="${s.arena}"></label><label>虛空歷史最高<input id="gmVoidHistoricalHighest" type="number" min="0" step="1" value="${s.highest}"></label><label>虛空當日最高<input id="gmVoidDailyHighest" type="number" min="0" step="1" value="${s.dailyHighest}"></label><label>虛空今日領獎<select id="gmVoidDailyClaimed" class="btn"><option value="0" ${s.claimed?"":"selected"}>尚未領取</option><option value="1" ${s.claimed?"selected":""}>已領取</option></select></label></div>
   <div class="muted" style="margin-top:9px">虛空挑戰起點目前為第 ${s.start.toLocaleString()} 層；當日最高對應目前可領 ${s.reward.toLocaleString()} VIP。若當日最高高於歷史最高，套用時會自動把歷史最高同步提高。</div>
   <div class="controls"><button class="btn blue" onclick="gmApplyDungeonValues()">套用副本／VIP資料</button><button class="btn" onclick="gmResetDailyDungeonState()">重置今日副本資料</button><button class="btn danger" onclick="gmResetVoidMirageFloor()">重置虛空紀錄</button><button class="btn danger" onclick="gmResetVip()">重置 VIP（等級＋積分）</button></div>`;
 }
 window.gmApplyDungeonValues=function(){
  const points=finiteInt(document.getElementById("gmDungeonPoints")?.value),bounty=finiteInt(document.getElementById("gmBountyDailyUsed")?.value,0,20),arena=finiteInt(document.getElementById("gmArenaDailyUsed")?.value,0,20),highest=finiteInt(document.getElementById("gmVoidHistoricalHighest")?.value),dailyHighest=finiteInt(document.getElementById("gmVoidDailyHighest")?.value),claimed=document.getElementById("gmVoidDailyClaimed")?.value==="1";
  if([points,bounty,arena,highest,dailyHighest].some(v=>v==null)){alert("請輸入有效的 0 以上整數；懸賞與競技場範圍為 0～20。");return;}
  state.vipPoints=points;if(typeof normalizeVipState==="function")normalizeVipState(state);
  if(typeof ensureDungeonProgressState==="function"){const d=ensureDungeonProgressState();if(d)d.points=state.vipPoints;}
  const daily=gmDaily();if(daily){daily.bounty.used=bounty;daily.arena.used=arena;}
  const historical=Math.max(highest,dailyHighest);
  if(typeof gmSetVoidMirageState==="function")gmSetVoidMirageState(historical,dailyHighest,claimed);else{if(state?.dungeon?.voidMirage)state.dungeon.voidMirage.highestCleared=historical;if(daily?.voidMirage){daily.voidMirage.highestFloor=dailyHighest;daily.voidMirage.claimed=claimed;}if(typeof save==="function")save(false);if(typeof render==="function")render();}
 };
 window.gmResetDailyDungeonState=function(){
  const daily=gmDaily();if(!daily)return;
  const fresh=typeof blankDailyState==="function"?blankDailyState(typeof gameDailyDateKey==="function"?gameDailyDateKey():daily.dateKey):{dateKey:daily.dateKey,bounty:{used:0},arena:{used:0},voidMirage:{highestFloor:0,claimed:false}};
  Object.assign(daily,fresh);if(typeof save==="function")save(false);if(typeof render==="function")render();
 };

 if(typeof gmHtml==="function"){
  const baseGmHtml=gmHtml;
  gmHtml=function(){
   const html=baseGmHtml(),marker='<summary>副本管理</summary><div class="gm-hub-body">',start=html.indexOf(marker);if(start<0)return html;
   const bodyStart=start+marker.length,end=html.indexOf('</div></details>',bodyStart);if(end<0)return html;
   return html.slice(0,bodyStart)+dungeonManagementHtml()+html.slice(end);
  };
 }

 installStyles();ensureClock();tickClock();setInterval(tickClock,1000);
 window.BATCH5_UI_READY=true;
})();