(function(){
 function installStyles(){
  if(document.getElementById("settlement-ui-fix-styles"))return;
  const s=document.createElement("style");
  s.id="settlement-ui-fix-styles";
  s.textContent=`
   #battleResultModal .modal-box{max-height:calc(100dvh - 24px)!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
   #battleResultModal #battleResultDetail{min-height:0!important;overflow:auto!important;overscroll-behavior:contain;padding-right:2px}
   #battleResultModal>.modal-box>.controls{flex:0 0 auto!important;margin-top:10px!important}
   .settlement-drop-wrap{margin-top:10px}
   .settlement-drop-scroll{height:210px;overflow-y:auto;overscroll-behavior:contain;border:1px solid #323740;border-radius:10px;background:#0f1319;padding:7px;scrollbar-gutter:stable}
   .settlement-drop-row{padding:8px 9px;border-bottom:1px solid #292e36;line-height:1.35}
   .settlement-drop-row:last-child{border-bottom:0}
   .settlement-drop-row .muted{margin-top:3px;font-size:12px}
   @media(max-width:760px){
    #battleResultModal{padding:10px!important}
    #battleResultModal .modal-box{max-height:calc(100dvh - 20px)!important;padding:14px!important}
    .settlement-drop-scroll{height:190px;padding:6px}
    .settlement-drop-row{padding:7px 8px}
   }
  `;
  document.head.appendChild(s);
 }
 function isTargetTitle(){
  const t=(document.getElementById("battleResultTitle")?.textContent||"").trim();
  return t==="戰鬥勝利"||t==="連續戰鬥結算"||t==="連續戰鬥階段結算";
 }
 function qualityNode(item){
  return item.querySelector(":scope > .q-common,:scope > .q-uncommon,:scope > .q-rare,:scope > .q-epic,:scope > .q-legendary,:scope > .q-mythic")
    || item.querySelector(".q-common,.q-uncommon,.q-rare,.q-epic,.q-legendary,.q-mythic");
 }
 function autosellNode(item){
  return Array.from(item.querySelectorAll(".muted")).find(el=>(el.textContent||"").trim().startsWith("自動出售"))||null;
 }
 function transformLegacyDropBlock(block){
  if(!block||block.classList.contains("settlement-drop-wrap")||block.querySelector(":scope > .settlement-drop-scroll")||block.querySelector(":scope > .stage-drop-scroll"))return;
  const items=Array.from(block.querySelectorAll(":scope > .item"));
  if(!items.length)return;
  const scroll=document.createElement("div");
  scroll.className="settlement-drop-scroll";
  items.forEach(item=>{
   const row=document.createElement("div");
   row.className="settlement-drop-row";
   const q=qualityNode(item);
   if(q)row.appendChild(q.cloneNode(true));
   else{
    const fallback=document.createElement("span");
    fallback.textContent=(item.textContent||"").trim().split("\n")[0]||"裝備";
    row.appendChild(fallback);
   }
   const sold=autosellNode(item);
   if(sold)row.appendChild(sold.cloneNode(true));
   scroll.appendChild(row);
  });
  items.forEach(item=>item.remove());
  block.classList.add("settlement-drop-wrap");
  block.appendChild(scroll);
 }
 function normalizeCurrentStageBlock(detail){
  detail.querySelectorAll(".stage-drop-wrap").forEach(block=>{
   if(block.classList.contains("settlement-drop-wrap"))return;
   block.classList.add("settlement-drop-wrap");
   const old=block.querySelector(":scope > .stage-drop-scroll");
   if(old){old.classList.add("settlement-drop-scroll");old.querySelectorAll(":scope > .stage-drop-row").forEach(row=>row.classList.add("settlement-drop-row"));}
  });
 }
 function apply(){
  installStyles();
  const modal=document.getElementById("battleResultModal"),detail=document.getElementById("battleResultDetail");
  if(!modal?.classList.contains("show")||!detail||!isTargetTitle())return;
  normalizeCurrentStageBlock(detail);
  Array.from(detail.querySelectorAll("b")).forEach(b=>{
   const text=(b.textContent||"").trim();
   if(!/^裝備(?:掉落)?(?:\s*\d+\s*件)?$/.test(text))return;
   const block=b.parentElement;
   if(block&&block!==detail)transformLegacyDropBlock(block);
  });
 }
 const modal=document.getElementById("battleResultModal");
 if(modal){
  new MutationObserver(()=>setTimeout(apply,0)).observe(modal,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
 }
 installStyles();
 setTimeout(apply,0);
})();
