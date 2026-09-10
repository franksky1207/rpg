(function(){
 const VIP_PERKS=[
  {level:2,text:"主線裝備掉落率 +5 個百分點"},
  {level:4,text:"副本進度取得 +10%"},
  {level:6,text:"特殊怪遭遇率 +2 個百分點"},
  {level:8,text:"主線掉落裝備有 15% 機率優先目前最弱部位"},
  {level:10,text:"特殊怪特殊獎勵有 10% 機率再次發動一次"},
  {level:12,text:"副本進度總加成提升為 +20%"},
  {level:14,text:"主線掉落裝備有 5% 機率品質 +1 階"},
  {level:16,text:"主線 Boss 有 15% 機率額外掉落 1 件裝備"},
  {level:18,text:"主線 Boss 掉落裝備有 10% 機率品質 +1 階"},
  {level:20,text:"死亡時不再遺失裝備"}
 ];

 function installVipStyles(){
  if(document.getElementById("vip-ui-styles"))return;
  const style=document.createElement("style");
  style.id="vip-ui-styles";
  style.textContent=`
   .vip-home-card{max-width:680px;margin:0 auto 16px;padding:13px 14px;border:1px solid #9f7834;border-radius:12px;background:linear-gradient(180deg,#211b10,#15120c);box-shadow:0 0 22px rgba(220,169,64,.08)}
   .vip-home-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.vip-home-value{font-size:18px;font-weight:850;color:#f2cf77;text-shadow:0 0 10px rgba(242,207,119,.22)}
   .vip-btn{background:#6c4d18!important;border-color:#b88a38!important;color:#fff0be!important}.vip-btn:hover{background:#805d1e!important}
   .vip-event{margin-top:10px;padding:9px 11px;border:1px solid #9b7430;border-radius:9px;background:linear-gradient(180deg,rgba(105,75,22,.32),rgba(56,39,14,.24));color:#f4d77e;font-weight:800;text-shadow:0 0 9px rgba(244,215,126,.18)}
   .vip-event.chain{border-color:#d48a28;color:#ffd98a;box-shadow:0 0 18px rgba(222,142,41,.16)}
   #vipDetailModal .modal-box{max-width:720px;max-height:calc(100dvh - 24px);overflow:auto}.vip-detail-head{border:1px solid #8a692f;border-radius:11px;padding:13px;background:#1c170e;margin-bottom:12px}.vip-detail-level{font-size:22px;font-weight:900;color:#f2cf77}.vip-detail-note{margin-top:7px;color:#bdb39b;font-size:13px;line-height:1.5}
   .vip-bonus-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin-top:10px}.vip-bonus-grid>div{background:#121317;border:1px solid #3b3a35;border-radius:8px;padding:8px;text-align:center}.vip-bonus-grid span{display:block;color:#a9a59a;font-size:12px}.vip-bonus-grid b{display:block;margin-top:3px;color:#f0d494}
   .vip-perk-list{display:grid;gap:7px}.vip-perk-row{border:1px solid #3a3c42;border-radius:9px;padding:10px 11px;background:#13161b;display:grid;grid-template-columns:92px 1fr;gap:10px;align-items:center}.vip-perk-row .vip-perk-level{font-weight:850}.vip-perk-row.unlocked{border-color:#806526}.vip-perk-row.unlocked .vip-perk-level{color:#f2cf77}.vip-perk-row.next{border-color:#c28a2e;background:#211a0d;box-shadow:0 0 16px rgba(212,149,47,.12)}.vip-perk-row.next .vip-perk-level{color:#ffd77a}.vip-perk-row.locked{opacity:.5}.vip-perk-threshold{font-size:11px;color:#96938a;margin-top:2px}
   @media(max-width:760px){.vip-home-card{margin-bottom:10px}.vip-bonus-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.vip-perk-row{grid-template-columns:78px 1fr;padding:9px}.vip-home-row{align-items:stretch}.vip-home-row .vip-btn{width:100%}}
  `;
  document.head.appendChild(style);
 }

 function vipLevel(){return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(state?.vipLevel)||0)));}
 function vipPoints(){return Math.max(0,Math.floor(Number(state?.vipPoints)||0));}
 function vipStatusText(){
  const lv=vipLevel(),points=vipPoints();
  if(lv>=VIP_MAX_LEVEL)return `VIP${VIP_MAX_LEVEL} MAX｜VIP 積分 ${points.toLocaleString()}`;
  return `VIP${lv}｜${points.toLocaleString()} / ${vipThreshold(lv+1).toLocaleString()}`;
 }
 window.vipStatusText=vipStatusText;

 function ensureVipModal(){
  if(document.getElementById("vipDetailModal"))return;
  const modal=document.createElement("div");
  modal.className="modal";modal.id="vipDetailModal";
  modal.innerHTML=`<div class="modal-box"><h3>VIP 特權</h3><div id="vipDetailBody"></div><div class="controls"><button class="btn primary" onclick="closeVipDetails()">關閉</button></div></div>`;
  document.body.appendChild(modal);
 }
 function vipDetailsHtml(){
  const lv=vipLevel(),points=vipPoints(),stat=lv*2,rate=round1(lv*.5);
  const nextPerk=VIP_PERKS.find(x=>x.level>lv)?.level||null;
  const status=lv>=VIP_MAX_LEVEL?`VIP${VIP_MAX_LEVEL} MAX｜VIP 積分 ${points.toLocaleString()}`:`VIP${lv}｜${points.toLocaleString()} / ${vipThreshold(lv+1).toLocaleString()}`;
  return `<div class="vip-detail-head"><div class="vip-detail-level">${status}</div><div class="vip-bonus-grid"><div><span>HP</span><b>+${stat}%</b></div><div><span>ATK</span><b>+${stat}%</b></div><div><span>DEF</span><b>+${stat}%</b></div><div><span>暴擊</span><b>+${rate}%</b></div><div><span>閃避</span><b>+${rate}%</b></div></div><div class="vip-detail-note">每提升 1 級 VIP：HP／ATK／DEF +2%，暴擊／閃避 +0.5%。已解鎖的 VIP 等級不會因消耗 VIP 積分而下降。</div></div><div class="vip-perk-list">${VIP_PERKS.map(p=>{const cls=p.level<=lv?"unlocked":p.level===nextPerk?"next":"locked";return `<div class="vip-perk-row ${cls}"><div><div class="vip-perk-level">VIP${p.level}</div><div class="vip-perk-threshold">${vipThreshold(p.level).toLocaleString()} 積分</div></div><div>${p.text}</div></div>`;}).join("")}</div>`;
 }
 window.openVipDetails=function(){installVipStyles();ensureVipModal();const body=document.getElementById("vipDetailBody");if(body)body.innerHTML=vipDetailsHtml();document.getElementById("vipDetailModal")?.classList.add("show");};
 window.closeVipDetails=function(){document.getElementById("vipDetailModal")?.classList.remove("show");};

 function replaceDungeonPointLabels(root){
  if(!root||typeof document.createTreeWalker!=="function")return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{if(n.nodeValue?.includes("副本積分"))n.nodeValue=n.nodeValue.replaceAll("副本積分","VIP 積分");});
 }
 function enhanceHome(main){
  const menu=main.querySelector(".menu-grid");if(!menu)return;
  const dungeonStatus=main.querySelector("#dungeon-home-status");
  if(dungeonStatus){const boxes=dungeonStatus.querySelectorAll(":scope>div");if(boxes.length>=3)boxes[2].remove();dungeonStatus.classList.add("no-points");}
  if(!main.querySelector("#vip-home-card"))menu.insertAdjacentHTML("beforebegin",`<div id="vip-home-card" class="vip-home-card"><div class="vip-home-row"><div><div class="muted">VIP 狀態</div><div class="vip-home-value">${vipStatusText()}</div></div><button class="btn vip-btn" onclick="openVipDetails()">查看特權</button></div></div>`);
 }
 function enhanceDungeonHome(main){
  const grid=main.querySelector(".dungeon-summary-grid");if(!grid)return;
  const boxes=grid.querySelectorAll(":scope>div");
  if(boxes.length>=2)boxes[1].innerHTML=`<span class="muted">VIP 狀態</span><strong>${vipStatusText()}</strong>`;
 }
 function enhanceRenderedUi(){
  installVipStyles();ensureVipModal();
  const main=document.getElementById("main");if(!main)return;
  replaceDungeonPointLabels(main);
  if(view==="home")enhanceHome(main);
  if(view==="dungeon")enhanceDungeonHome(main);
 }

 function vipEventsHtml(ctx,defeat){
  const rows=Array.isArray(ctx?.items)?ctx.items.filter(x=>x?.item):[];
  const actualBattles=Math.max(1,Math.floor(Number(ctx?.completed)||0));
  const multi=actualBattles>=2;
  let vip8=0,vip14=0,vip18=0,vip16=0,chains=0,maxChain=0;
  rows.forEach(row=>{
   const meta=row.item?._vipMeta||{};
   if(meta.vip8WeakSlot)vip8++;
   vip14+=Math.max(0,Number(meta.vip14Promotion)||0);
   vip18+=Math.max(0,Number(meta.vip18Promotion)||0);
   if(row.vip16Extra)vip16++;
   const chain=Math.max(0,Number(meta.actualPromotions)||0);
   if(chain>=2){chains++;maxChain=Math.max(maxChain,chain);}
  });
  const lines=[];
  if(vip8)lines.push(multi?`【VIP8】弱部位指定 ×${vip8}`:`【VIP8】本次掉落優先鎖定目前最弱裝備部位。`);
  if(vip14)lines.push(multi?`【VIP14】品質升階 ×${vip14}`:`【VIP14】裝備品質提升 ${vip14} 階！`);
  if(vip16)lines.push(multi?`【VIP16】Boss 額外掉落 ×${vip16}`:`【VIP16】Boss 額外掉落 1 件裝備！`);
  if(vip18)lines.push(multi?`【VIP18】Boss 品質升階 ×${vip18}`:`【VIP18】Boss 戰利品品質提升 ${vip18} 階！`);
  if(defeat?.penalty?.protectedByVip20)lines.push(`【VIP20】裝備受到保護，本次死亡沒有遺失裝備。`);
  let html=lines.map(x=>`<div class="vip-event">${x}</div>`).join("");
  if(chains)html+=`<div class="vip-event chain">★ ${multi?`VIP 品質連鎖 ×${chains}（最高連升 ${maxChain} 階）`:`【VIP 連鎖】裝備品質連續提升 ${maxChain} 階！`}</div>`;
  return html;
 }

 const baseShowBattleResult=typeof showBattleResult==="function"?showBattleResult:null;
 if(baseShowBattleResult){
  showBattleResult=function(ctx,defeat=null){
   baseShowBattleResult(ctx,defeat);
   const detail=document.getElementById("battleResultDetail"),extra=vipEventsHtml(ctx,defeat);
   if(detail&&extra)detail.insertAdjacentHTML("beforeend",extra);
  };
  window.showBattleResult=showBattleResult;
 }

 const baseRender=render;
 render=function(){baseRender();enhanceRenderedUi();};
 window.render=render;
 enhanceRenderedUi();
 if(typeof render==="function")render();
})();
