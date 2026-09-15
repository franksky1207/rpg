(function(){
 const OFFLINE_STONE_RATE=.05;
 const settlementPlayerLevel=Math.max(1,Math.floor(Number(state?.level)||1));
 let offlineSaleBasic=0,offlineSaleAdvanced=0;

 // 離線裝備實際出售發生於計算視窗顯示期間；只在這個期間附加出售石頭，避免售價預覽觸發獎勵。
 if(typeof window.specializationSellValue==="function"){
  const base=window.specializationSellValue;
  window.specializationSellValue=function(item,...args){
   const value=base(item,...args);
   const calculating=document.getElementById("offlineCalculatingModal")?.classList.contains("show")===true;
   if(calculating&&typeof grantEnhancementStoneSaleReward==="function"){
    const r=grantEnhancementStoneSaleReward(item);offlineSaleBasic+=r.basic;offlineSaleAdvanced+=r.advanced;
   }
   return value;
  };
  try{specializationSellValue=window.specializationSellValue;}catch(e){}
 }

 function findEnemy(name,level){
  for(let m=0;m<MAPS.length;m++)for(let e=0;e<4;e++){
   try{const x=monsterObj(m,e);if(x&&x.name===name&&Number(x.level)===Number(level))return x;}catch(err){}
  }
  return null;
 }
 function processOfflineResult(){
  const page=document.getElementById("offlineRewardPage");
  if(!page?.classList.contains("show")||page.dataset.enhancementStonesGranted==="1")return;
  const countText=page.querySelector(".offline-battle-count")?.textContent||"";
  const enemyText=page.querySelector(".offline-enemy-line")?.textContent||"";
  const count=Math.max(0,Math.floor(Number(countText.replace(/[^0-9]/g,""))||0));
  const match=enemyText.match(/Lv\.(\d+)\s+(.+?)\s+×/);
  let basic=0,enemy=null;
  if(match&&count>0){
   const level=Number(match[1]),name=match[2].trim();enemy=findEnemy(name,level);
   if(enemy&&enemy.kind!=="boss"&&enhancementStoneEligible(settlementPlayerLevel,enemy.level)){
    const theoretical=count*(enemy.kind==="elite"?1.3:1);
    basic=Math.floor(theoretical*OFFLINE_STONE_RATE);
    if(basic>0)addEnhancementStones(basic,0);
   }
  }
  page.dataset.enhancementStonesGranted="1";
  const grid=page.querySelector(".offline-reward-grid");
  if(grid){
   const card=document.createElement("div");card.className="offline-reward-card";
   card.innerHTML=`<div class="offline-reward-label">基礎強化石</div><div class="offline-reward-value">+${basic.toLocaleString()}</div><div class="muted" style="margin-top:6px">離線收益 5%</div>`;
   grid.appendChild(card);
  }
  if((offlineSaleBasic||offlineSaleAdvanced)&&page.querySelector("#offlineEnhancementSaleNote")==null){
   const gear=page.querySelector(".offline-section:last-of-type");
   if(gear){const note=document.createElement("div");note.id="offlineEnhancementSaleNote";note.className="muted";note.style.marginTop="8px";note.textContent=`出售裝備另獲得 ${[offlineSaleBasic?`基礎強化石 +${offlineSaleBasic}`:"",offlineSaleAdvanced?`進階強化石 +${offlineSaleAdvanced}`:""].filter(Boolean).join("、")}`;gear.appendChild(note);}
  }
  if(typeof save==="function")save(false);
 }
 const observer=new MutationObserver(()=>setTimeout(processOfflineResult,0));
 observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
 setTimeout(processOfflineResult,0);
 window.OFFLINE_ENHANCEMENT_STONE_RATE=OFFLINE_STONE_RATE;
})();
