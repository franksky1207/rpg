(function(){
 window.gmTestVipLevel=0;
 function testVip(){return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(window.gmTestVipLevel)||0)));}
 window.gmSetTestVipLevel=function(value){
  window.gmTestVipLevel=Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(value)||0)));
  const info=document.getElementById("gmTestVipInfo");if(info)info.textContent=gmTestVipLabel();
 };
 window.gmTestPlayerStats=function(baseStats=null){return createSpecialPlayerSnapshot(playerCombatStats(baseStats||equippedStats(),testVip()));};
 window.gmTestVipLabel=function(){const lv=testVip(),b=vipBonusStats(lv);return `VIP${lv}｜HP/ATK +${b.hp}%｜DEF +${b.def}%｜暴擊/閃避 +${b.crit}%`;};
 window.gmTestVipOptions=function(){return Array.from({length:VIP_MAX_LEVEL+1},(_,i)=>`<option value="${i}" ${i===testVip()?"selected":""}>VIP${i}</option>`).join("");};
 window.gmTestVipControlHtml=function(){return `<div class="item" style="margin:0 0 12px"><b>測試 VIP 等級</b><div class="controls" style="margin-top:8px;align-items:end"><label>VIP<br><select id="gmTestVipLevel" class="btn" onchange="gmSetTestVipLevel(this.value)">${gmTestVipOptions()}</select></label><span id="gmTestVipInfo" class="muted">${gmTestVipLabel()}</span><span class="muted">僅本次網頁工作階段保留；重新整理或重開後回 VIP0。</span></div></div>`;};
})();