(function(){
 const VIP_UI_VERSION=2;
 const VIP_PERKS=[
  {level:2,text:"主線裝備掉落率 +5 個百分點"},
  {level:4,text:"所有可取得 VIP 積分的副本，VIP 積分 +10%"},
  {level:6,text:"特殊怪遭遇率 +2 個百分點"},
  {level:8,text:"主線與懸賞掉落裝備有 15% 機率優先目前最弱部位"},
  {level:10,text:"特殊怪特殊獎勵有 10% 機率再次發動一次"},
  {level:12,text:"所有可取得 VIP 積分的副本，VIP 積分總加成提升為 +20%"},
  {level:14,text:"主線與懸賞掉落裝備有 5% 機率品質 +1 階"},
  {level:16,text:"主線 Boss 有 15% 機率額外掉落 1 件裝備"},
  {level:18,text:"主線 Boss 掉落裝備有 10% 機率品質 +1 階"},
  {level:20,text:"死亡時不再遺失裝備"}
 ];

 function normalizeLevel(value){return typeof window.normalizeVipLevel==="function"?window.normalizeVipLevel(value):Math.max(0,Math.floor(Number(value)||0));}
 function perkMaxLevel(){return Math.max(20,Math.floor(Number(window.VIP_PERK_MAX_LEVEL)||20));}
 function vipLevel(){return normalizeLevel(state?.vipLevel);}
 function vipPoints(){return Math.max(0,Math.floor(Number(state?.vipPoints)||0));}
 function nextThreshold(level){return typeof vipThreshold==="function"?vipThreshold(normalizeLevel(level)+1):1000*Math.pow(normalizeLevel(level)+1,2);}
 function vipStatusText(){const lv=vipLevel(),points=vipPoints();return `VIP${lv}｜${points.toLocaleString()} / ${nextThreshold(lv).toLocaleString()}`;}
 function ensureVipModal(){if(document.getElementById("vipDetailModal"))return;const modal=document.createElement("div");modal.className="modal";modal.id="vipDetailModal";modal.innerHTML=`<div class="modal-box"><h3>VIP 特權</h3><div id="vipDetailBody"></div><div class="controls"><button class="btn primary" onclick="closeVipDetails()">關閉</button></div></div>`;document.body.appendChild(modal);}
 function vipDetailsHtml(){
  const lv=vipLevel(),points=vipPoints(),bonus=vipBonusStats(lv),nextPerk=VIP_PERKS.find(x=>x.level>lv)?.level||null;
  const status=`VIP${lv}｜${points.toLocaleString()} / ${nextThreshold(lv).toLocaleString()}`;
  const perkComplete=lv>=perkMaxLevel()?`<div class="notice" style="margin-top:10px"><b>特殊特權已全部解鎖。</b><div class="muted" style="margin-top:5px">VIP20 是最後一個特殊特權階段；VIP 等級本身沒有上限，之後仍可持續累積 VIP 積分並提升基本能力。</div></div>`:"";
  return `<div class="vip-detail-head"><div class="vip-detail-level">${status}</div><div class="vip-bonus-grid"><div><span>HP</span><b>+${bonus.hp}%</b></div><div><span>ATK</span><b>+${bonus.atk}%</b></div><div><span>DEF</span><b>+${bonus.def}%</b></div><div><span>暴擊</span><b>+${bonus.crit}%</b></div><div><span>閃避</span><b>+${bonus.dodge}%</b></div></div><div class="vip-detail-note">每提升 1 級 VIP：HP／ATK +0.5%，DEF +0.25%，暴擊／閃避 +0.25%。VIP 等級沒有上限，升級門檻持續使用 1000 × 等級²；VIP20 為最後一個特殊特權階段。</div>${perkComplete}</div><div class="vip-perk-list">${VIP_PERKS.map(p=>{const cls=p.level<=lv?"unlocked":p.level===nextPerk?"next":"locked";return `<div class="vip-perk-row ${cls}"><div><div class="vip-perk-level">VIP${p.level}</div><div class="vip-perk-threshold">${vipThreshold(p.level).toLocaleString()} 積分</div></div><div>${p.text}</div></div>`;}).join("")}</div>`;
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
 function preserveHpRatioWhile(mutator){
  const beforeMax=playerCombatStats().hp,beforeHp=Math.max(0,Math.min(beforeMax,Number(state.hp)||0)),ratio=beforeMax>0?beforeHp/beforeMax:1,wasFull=beforeHp>=beforeMax;
  mutator();
  const afterMax=playerCombatStats().hp;
  state.hp=wasFull?afterMax:Math.max(0,Math.min(afterMax,Math.round(afterMax*ratio)));
 }
 function setFormalVipPoints(points){
  const next=Math.max(0,Math.floor(Number(points)||0));
  preserveHpRatioWhile(()=>{state.vipPoints=next;if(typeof normalizeVipState==="function")normalizeVipState(state);else state.vipLevel=normalizeLevel(Math.floor(Math.sqrt(next/1000)));});
  if(typeof save==="function")save();
  if(typeof render==="function")render();
  return {points:state.vipPoints,level:state.vipLevel};
 }
 function gmVipManagementHtml(){
  const lv=vipLevel(),points=vipPoints();
  return `<div class="muted gm-hub-note">正式 VIP 等級沒有上限，正式資料以 VIP 積分為準；等級會依 1000 × 等級² 自動反推。VIP20 之後不再新增特殊特權，但基本能力仍持續成長。</div><div class="notice">目前：VIP${lv}｜VIP 積分 ${points.toLocaleString()}｜下一級門檻 ${nextThreshold(lv).toLocaleString()}</div><div class="controls" style="align-items:end"><label>指定 VIP 積分<br><input id="gmVipPointsInput" class="btn" type="number" min="0" step="1" value="${points}" style="width:190px"></label><button class="btn blue" type="button" onclick="gmApplyVipPoints()">套用 VIP 積分</button><button class="btn danger" type="button" onclick="gmResetVip()">重置 VIP（等級＋積分）</button></div>`;
 }
 function patchGuideCopy(){
  const patchCategories=categories=>(Array.isArray(categories)?categories.map(category=>({...category,items:(category.items||[]).map(item=>{
   if(item?.[0]==="VIP 系統")return [item[0],"透過競技場、虛空幻境等玩法取得 VIP 積分並提升 VIP 等級。VIP 等級沒有上限；VIP20 是最後一個特殊特權階段，之後仍可持續提升基本能力。"];
   if(item?.[0]==="VIP 基礎能力")return [item[0],"VIP 每提升 1 級，HP／攻擊 +0.5%、防禦 +0.25%、暴擊／閃避 +0.25 個百分點；VIP20 之後仍持續成長。"];
   if(item?.[0]==="VIP 特權")return [item[0],"VIP2～VIP20 會依指定等級解鎖裝備、特殊怪、副本與死亡保護等特權；VIP20 為最後一個特殊特權，VIP21 以上不新增特權。"];
   return Array.isArray(item)?item.slice():item;
  })})):categories);
  if(typeof window.gameGuideCategoriesForState==="function"){
   const baseCategories=window.gameGuideCategoriesForState;
   window.gameGuideCategoriesForState=function(target=null){return patchCategories(baseCategories(target));};
  }
  if(typeof window.gameGuidePage==="function"){
   const basePage=window.gameGuidePage;
   window.gameGuidePage=function(){
    return String(basePage())
     .replace("透過競技場、虛空幻境等玩法取得 VIP 積分並提升 VIP 等級，最高 VIP20。升級後可獲得能力與特權。","透過競技場、虛空幻境等玩法取得 VIP 積分並提升 VIP 等級。VIP 等級沒有上限；VIP20 是最後一個特殊特權階段，之後仍可持續提升基本能力。")
     .replace("VIP 等級會提升 HP、攻擊、防禦、暴擊與閃避。","VIP 每提升 1 級，HP／攻擊 +0.5%、防禦 +0.25%、暴擊／閃避 +0.25 個百分點；VIP20 之後仍持續成長。")
     .replace("部分 VIP 等級會解鎖裝備、特殊怪、副本與死亡保護等特權；完整效果可在「查看特權」確認。","VIP2～VIP20 會解鎖裝備、特殊怪、副本與死亡保護等特權；VIP20 為最後一個特殊特權，VIP21 以上不新增特權。完整效果可在「查看特權」確認。");
   };
  }
  window.GAME_GUIDE_VIP_UNBOUNDED_COPY_VERSION=1;
 }
 window.vipStatusText=vipStatusText;window.vipHomeCardHtml=vipHomeCardHtml;window.vipEventsHtml=vipEventsHtml;
 window.openVipDetails=function(){ensureVipModal();const body=document.getElementById("vipDetailBody");if(body)body.innerHTML=vipDetailsHtml();document.getElementById("vipDetailModal")?.classList.add("show");};
 window.closeVipDetails=function(){document.getElementById("vipDetailModal")?.classList.remove("show");};
 window.gmVipManagementHtml=gmVipManagementHtml;
 window.gmApplyVipPoints=function(){const input=document.getElementById("gmVipPointsInput"),raw=input?input.value:null,n=Number(raw);if(!Number.isFinite(n)||n<0||!Number.isInteger(n)){alert("請輸入 0 以上的整數 VIP 積分。");return false;}const result=setFormalVipPoints(n);alert(`VIP 積分已更新為 ${result.points.toLocaleString()}，目前 VIP${result.level}。`);return true;};
 window.setFormalVipPoints=setFormalVipPoints;
 window.VIP_UI_VERSION=VIP_UI_VERSION;
 patchGuideCopy();
 ensureVipModal();
})();