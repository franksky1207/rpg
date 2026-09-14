(function(){
 const VIP_PERKS=[
  {level:2,text:"主線裝備掉落率 +5 個百分點"},
  {level:4,text:"所有可取得 VIP 積分的副本，VIP 積分 +10%"},
  {level:6,text:"特殊怪遭遇率 +2 個百分點"},
  {level:8,text:"主線掉落裝備有 15% 機率優先目前最弱部位"},
  {level:10,text:"特殊怪特殊獎勵有 10% 機率再次發動一次"},
  {level:12,text:"所有可取得 VIP 積分的副本，VIP 積分總加成提升為 +20%"},
  {level:14,text:"主線掉落裝備有 5% 機率品質 +1 階"},
  {level:16,text:"主線 Boss 有 15% 機率額外掉落 1 件裝備"},
  {level:18,text:"主線 Boss 掉落裝備有 10% 機率品質 +1 階"},
  {level:20,text:"死亡時不再遺失裝備"}
 ];

 function vipLevel(){return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(state?.vipLevel)||0)));}
 function vipPoints(){return Math.max(0,Math.floor(Number(state?.vipPoints)||0));}
 function vipStatusText(){const lv=vipLevel(),points=vipPoints();return lv>=VIP_MAX_LEVEL?`VIP${VIP_MAX_LEVEL} MAX｜VIP 積分 ${points.toLocaleString()}`:`VIP${lv}｜${points.toLocaleString()} / ${vipThreshold(lv+1).toLocaleString()}`;}
 function ensureVipModal(){if(document.getElementById("vipDetailModal"))return;const modal=document.createElement("div");modal.className="modal";modal.id="vipDetailModal";modal.innerHTML=`<div class="modal-box"><h3>VIP 特權</h3><div id="vipDetailBody"></div><div class="controls"><button class="btn primary" onclick="closeVipDetails()">關閉</button></div></div>`;document.body.appendChild(modal);}
 function vipDetailsHtml(){
  const lv=vipLevel(),points=vipPoints(),bonus=vipBonusStats(lv),nextPerk=VIP_PERKS.find(x=>x.level>lv)?.level||null;
  const status=lv>=VIP_MAX_LEVEL?`VIP${VIP_MAX_LEVEL} MAX｜VIP 積分 ${points.toLocaleString()}`:`VIP${lv}｜${points.toLocaleString()} / ${vipThreshold(lv+1).toLocaleString()}`;
  return `<div class="vip-detail-head"><div class="vip-detail-level">${status}</div><div class="vip-bonus-grid"><div><span>HP</span><b>+${bonus.hp}%</b></div><div><span>ATK</span><b>+${bonus.atk}%</b></div><div><span>DEF</span><b>+${bonus.def}%</b></div><div><span>暴擊</span><b>+${bonus.crit}%</b></div><div><span>閃避</span><b>+${bonus.dodge}%</b></div></div><div class="vip-detail-note">每提升 1 級 VIP：HP／ATK +0.5%，DEF +0.25%，暴擊／閃避 +0.25%。VIP 升級門檻為 2500 × 等級²，VIP20 門檻為 1,000,000 積分。</div></div><div class="vip-perk-list">${VIP_PERKS.map(p=>{const cls=p.level<=lv?"unlocked":p.level===nextPerk?"next":"locked";return `<div class="vip-perk-row ${cls}"><div><div class="vip-perk-level">VIP${p.level}</div><div class="vip-perk-threshold">${vipThreshold(p.level).toLocaleString()} 積分</div></div><div>${p.text}</div></div>`;}).join("")}</div>`;
 }
 function vipHomeCardHtml(){return `<div class="vip-home-card"><div class="vip-home-row"><div><div class="muted">VIP 狀態</div><div class="vip-home-value">${vipStatusText()}</div></div><button class="btn vip-btn" onclick="openVipDetails()">查看特權</button></div></div>`;}
 function vipEventsHtml(ctx,defeat){
  const rows=Array.isArray(ctx?.items)?ctx.items.filter(x=>x?.item):[],actualBattles=Math.max(1,Math.floor(Number(ctx?.completed)||0)),multi=actualBattles>=2;
  let vip8=0,vip14=0,vip18=0,vip16=0,chains=0,maxChain=0;
  rows.forEach(row=>{const meta=row.item?._vipMeta||{};if(meta.vip8WeakSlot)vip8++;vip14+=Math.max(0,Number(meta.vip14Promotion)||0);vip18+=Math.max(0,Number(meta.vip18Promotion)||0);if(row.vip16Extra)vip16++;const chain=Math.max(0,Number(meta.actualPromotions)||0);if(chain>=2){chains++;maxChain=Math.max(maxChain,chain);}});
  const lines=[];
  if(vip8)lines.push(multi||vip8>1?`【VIP8】弱部位指定 ×${vip8}`:`【VIP8】本次掉落優先鎖定目前最弱裝備部位。`);
  if(vip14)lines.push(multi||vip14>1?`【VIP14】品質升階 ×${vip14}`:`【VIP14】裝備品質提升 1 階！`);
  if(vip16)lines.push(`【VIP16】Boss 額外掉落 1 件裝備！`);
  if(vip18)lines.push(multi||vip18>1?`【VIP18】Boss 品質升階 ×${vip18}`:`【VIP18】Boss 戰利品品質提升 1 階！`);
  if(defeat?.penalty?.protectedByVip20)lines.push(`【VIP20】裝備受到保護，本次死亡沒有遺失裝備。`);
  let html=lines.map(x=>`<div class="vip-event">${x}</div>`).join("");
  if(chains)html+=`<div class="vip-event chain">★ ${multi||chains>1?`VIP 品質連鎖 ×${chains}（最高連升 ${maxChain} 階）`:`【VIP 連鎖】裝備品質連續提升 ${maxChain} 階！`}</div>`;
  return html;
 }
 window.vipStatusText=vipStatusText;window.vipHomeCardHtml=vipHomeCardHtml;window.vipEventsHtml=vipEventsHtml;
 window.openVipDetails=function(){ensureVipModal();const body=document.getElementById("vipDetailBody");if(body)body.innerHTML=vipDetailsHtml();document.getElementById("vipDetailModal")?.classList.add("show");};
 window.closeVipDetails=function(){document.getElementById("vipDetailModal")?.classList.remove("show");};
 ensureVipModal();
})();