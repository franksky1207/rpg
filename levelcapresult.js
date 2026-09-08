(function(){
 let normalConvertedTotal=0;

 const baseBeginCombatForLevelCapResult=beginCombat;
 beginCombat=function(count){
  normalConvertedTotal=0;
  return baseBeginCombatForLevelCapResult(count);
 };

 const baseFightOnceForLevelCapResult=fightOnce;
 fightOnce=function(mapIdx,eIdx,encounter=null){
  const r=baseFightOnceForLevelCapResult(mapIdx,eIdx,encounter);
  if(r?.ok&&r.win&&r.convertedExpGold){
   normalConvertedTotal+=Math.max(0,Number(r.convertedExpGold)||0);
  }
  return r;
 };

 function normalResultTitle(){
  const title=document.getElementById("battleResultTitle")?.textContent||"";
  return title==="戰鬥勝利"||title==="連續戰鬥結算"||title==="連續戰鬥階段結算";
 }

 function appendNormalConversionNote(){
  if(normalConvertedTotal<=0||!normalResultTitle())return;
  const modal=document.getElementById("battleResultModal"),detail=document.getElementById("battleResultDetail");
  if(!modal?.classList.contains("show")||!detail)return;
  if(detail.querySelector("[data-normal-exp-conversion]"))return;
  const box=document.createElement("div");
  box.className="notice";
  box.dataset.normalExpConversion="1";
  box.style.marginTop="10px";
  box.innerHTML=`<b>滿等 EXP 轉金幣 +${normalConvertedTotal}</b>`;
  detail.appendChild(box);
 }

 const baseShowBattleResultForLevelCapResult=showBattleResult;
 showBattleResult=function(ctx,defeat=null){
  const out=baseShowBattleResultForLevelCapResult(ctx,defeat);
  if(!defeat)appendNormalConversionNote();
  return out;
 };

 const modal=document.getElementById("battleResultModal");
 if(modal){
  new MutationObserver(()=>{
   if(modal.classList.contains("show"))appendNormalConversionNote();
  }).observe(modal,{attributes:true,attributeFilter:["class"]});
 }
})();
