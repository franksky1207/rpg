(function(){
 let mirrorTestHtml="";

 function pct(value,total){return total?Math.round(value/total*10000)/100:0;}
 function currentInfo(){return typeof mirrorDungeonStatus==="function"?mirrorDungeonStatus():{status:"idle",history:{bestWins:0,bestDate:null,miracleDates:[]}};}
 function resultBox(){const box=document.getElementById("gmMirrorTestResult");if(box)box.innerHTML=mirrorTestHtml;}
 function snapshot(){return typeof createMirrorCombatSnapshot==="function"?createMirrorCombatSnapshot():null;}
 function eventCounts(target,events){
  (events||[]).forEach(evt=>{
   if(evt.type==="combo")target.combo++;
   else if(evt.type==="counter")target.counter++;
   else if(evt.type==="drain")target.drain++;
   else if(evt.type==="attack"){
    if(evt.penetration)target.penetration++;
    if(evt.initiative)target.initiative++;
   }
  });
 }
 function simulate(runs){
  const snap=snapshot();if(!snap||typeof runMirrorCombatCore!=="function")return null;
  const summary={runs,totalBattles:runs*20,totalWins:0,playerFirst:0,playerFirstWins:0,mirrorFirst:0,mirrorFirstWins:0,totalTurns:0,distribution:Array(21).fill(0),events:{initiative:0,combo:0,penetration:0,counter:0,drain:0}};
  for(let r=0;r<runs;r++){
   let wins=0;
   for(let i=0;i<20;i++){
    const out=runMirrorCombatCore(snap,{logs:false});
    if(out.win){wins++;summary.totalWins++;}
    if(out.firstActor==="player"){summary.playerFirst++;if(out.win)summary.playerFirstWins++;}
    else{summary.mirrorFirst++;if(out.win)summary.mirrorFirstWins++;}
    summary.totalTurns+=Math.max(0,Number(out.turns)||0);eventCounts(summary.events,out.events);
   }
   summary.distribution[wins]++;
  }
  return summary;
 }
 function distributionHtml(s){return s.distribution.map((count,wins)=>count?`<span>${wins}勝：${count}次</span>`:"").filter(Boolean).join("　");}
 function summaryHtml(s,label){
  const avg=Math.round(s.totalWins/s.runs*100)/100,totalRate=pct(s.totalWins,s.totalBattles),pFirst=pct(s.playerFirstWins,s.playerFirst),mFirst=pct(s.mirrorFirstWins,s.mirrorFirst),avgTurns=Math.round(s.totalTurns/s.totalBattles*100)/100;
  return `<div class="notice"><b>鏡像戰・${label}</b><div class="muted gm-test-context">純沙盒模擬，不消耗今日鏡像戰、不發 VIP、不更新歷史或神蹟。</div><div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(135px,1fr))"><div class="stat">平均每次勝場<b>${avg}</b></div><div class="stat">玩家總勝率<b>${totalRate}%</b></div><div class="stat">玩家先攻時勝率<b>${pFirst}%</b></div><div class="stat">鏡像先攻時玩家勝率<b>${mFirst}%</b></div><div class="stat">平均回合<b>${avgTurns}</b></div></div><div class="muted" style="margin-top:9px">勝場分布：${distributionHtml(s)}</div><div class="muted" style="margin-top:6px">觸發統計：先制 ${s.events.initiative}・連擊 ${s.events.combo}・穿透 ${s.events.penetration}・反擊 ${s.events.counter}・汲取 ${s.events.drain}</div></div>`;
 }
 window.gmMirrorTest=function(runs){
  const n=runs===100?100:1,button=document.getElementById(n===100?"gmMirrorTest100":"gmMirrorTest1");
  if(button){button.disabled=true;button.textContent="測試中…";}
  setTimeout(()=>{
   try{const s=simulate(n);mirrorTestHtml=s?summaryHtml(s,n===100?"100 次完整挑戰（2,000 場）":"1 次完整挑戰（20 場）"):`<div class="notice">鏡像戰核心尚未載入。</div>`;}
   catch(err){console.error("Mirror GM simulation failed",err);mirrorTestHtml=`<div class="notice">鏡像戰測試失敗，請重新整理後再試。</div>`;}
   resultBox();if(button){button.disabled=false;button.textContent=n===100?"測試 100 次（2,000 場）":"測試 1 次（20 場）";}
  },20);
 };
 window.gmResetMirrorDungeonToday=function(){
  const active=typeof getMirrorDungeonActiveRun==="function"?getMirrorDungeonActiveRun():null;
  if(active?.active)return alert("鏡像戰正在進行中，無法重置今日狀態。");
  if(!confirm("重置今日鏡像戰後，可重新取得今天唯一一次正式挑戰機會。\n\n歷史最高與神蹟紀錄不會變更；重新進行的正式挑戰仍會正常發放獎勵並更新紀錄。\n\n確定重置？"))return;
  if(typeof resetMirrorDungeonToday!=="function")return alert("鏡像戰狀態模組尚未載入。");
  resetMirrorDungeonToday();if(typeof render==="function")render();
 };
 window.getMirrorGmTestHtml=function(){return mirrorTestHtml;};

 const baseDungeonManage=window.gmDungeonManagementHtml;
 if(typeof baseDungeonManage==="function")window.gmDungeonManagementHtml=function(){
  const info=currentInfo(),h=info.history||{},record=h.bestDate?`${Math.max(0,Number(h.bestWins)||0)} 勝（${h.bestDate}）`:"尚無紀錄",miracles=Array.isArray(h.miracleDates)?h.miracleDates.length:0;
  return `${baseDungeonManage()}<div class="item" style="margin-top:12px"><b>鏡像戰</b><div class="muted" style="margin-top:6px">今日狀態：${info.status==="idle"?"尚未挑戰":"今日鏡像戰已結束／進行中"}　・　歷史最高：${record}　・　神蹟 ${miracles} 次</div><div class="controls"><button class="btn danger" onclick="gmResetMirrorDungeonToday()">重置今日鏡像戰</button></div></div>`;
 };

 function mirrorTestSection(){
  const result=typeof getMirrorGmTestHtml==="function"?getMirrorGmTestHtml():"";
  return `<details class="gm-hub-section" data-mirror-gm-test="1"><summary>鏡像戰測試</summary><div class="gm-hub-body"><div class="muted gm-hub-note">以目前正式角色能力建立鏡像快照。測試不消耗正式每日機會、不發 VIP、不更新歷史與神蹟。</div><div class="gm-test-button-grid"><button id="gmMirrorTest1" class="btn blue" onclick="gmMirrorTest(1)">測試 1 次（20 場）</button><button id="gmMirrorTest100" class="btn blue" onclick="gmMirrorTest(100)">測試 100 次（2,000 場）</button></div><div id="gmMirrorTestResult" style="margin-top:12px">${result}</div></div></details>`;
 }
 function injectMirrorTest(){
  const hub=document.querySelector(".gm-hub");if(!hub||hub.querySelector("[data-mirror-gm-test]"))return;
  const active=Array.from(hub.querySelectorAll(".gm-hub-tab")).find(btn=>btn.classList.contains("active"));if(!active||active.textContent.trim()!=="測試")return;
  const close=hub.querySelector(".gm-hub-close");if(close)close.insertAdjacentHTML("beforebegin",mirrorTestSection());
 }
 const baseRender=render;
 render=function(){const out=baseRender();injectMirrorTest();return out;};
 injectMirrorTest();
})();