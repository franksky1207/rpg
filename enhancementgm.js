(function(){
 const SLOT_LABELS={weapon:"武器",helmet:"頭盔",armor:"鎧甲",shoes:"鞋子",accessory:"飾品"};
 function slots(){return Array.isArray(window.ENHANCEMENT_SLOTS)?window.ENHANCEMENT_SLOTS:["weapon","helmet","armor","shoes","accessory"];}
 function clampLevel(value){return Math.max(0,Math.min(Number(window.ENHANCEMENT_MAX_LEVEL)||20,Math.floor(Number(value)||0)));}
 function levelOptions(value){const max=Number(window.ENHANCEMENT_MAX_LEVEL)||20;return Array.from({length:max+1},(_,i)=>`<option value="${i}" ${i===value?"selected":""}>+${i}</option>`).join("");}
 function ensure(){if(typeof window.normalizeEnhancementState==="function")window.normalizeEnhancementState(state);}
 function section(body){return `<details class="gm-hub-section"><summary>強化管理</summary><div class="gm-hub-body">${body}</div></details>`;}

 window.gmEnhancementManagementHtml=function(){
  ensure();
  return `<div class="muted gm-hub-note">直接修改玩家正式裝備欄位強化等級，套用後會寫入正式存檔；不影響目前持有的基礎／進階強化石。</div><div class="gm-enhancement-grid">${slots().map(type=>{const lv=typeof window.enhancementLevel==="function"?window.enhancementLevel(state,type):clampLevel(state?.enhancement?.levels?.[type]);return `<label><span>${SLOT_LABELS[type]||type}</span><select class="btn" id="gmEnhance-manage-${type}">${levelOptions(lv)}</select></label>`;}).join("")}</div><div class="controls"><button class="btn blue" onclick="gmApplyEnhancementLevels()">套用強化等級</button></div>`;
 };

 window.gmApplyEnhancementLevels=function(){
  ensure();
  const next={};
  slots().forEach(type=>{const el=document.getElementById(`gmEnhance-manage-${type}`);next[type]=clampLevel(el?el.value:state.enhancement.levels[type]);});
  slots().forEach(type=>{state.enhancement.levels[type]=next[type];});
  if(typeof window.normalizeEnhancementState==="function")window.normalizeEnhancementState(state);
  if(typeof save==="function")save();
  if(typeof render==="function")render();
  alert("強化等級已更新。");
 };

 function installStyles(){
  if(document.getElementById("enhancementGmStyles"))return;
  const style=document.createElement("style");style.id="enhancementGmStyles";style.textContent=`
   .gm-enhancement-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;margin-bottom:10px}.gm-enhancement-grid label{display:flex;flex-direction:column;gap:5px;color:#d8c49a;font-size:13px}.gm-enhancement-grid select{width:100%}
   @media(max-width:760px){.gm-enhancement-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}}
  `;document.head.appendChild(style);
 }

 // gmhub.js 已完成正式 GM 介面；在其後只對「管理」頁插入同型態區塊，不碰測試頁。
 const baseGmHtml=window.gmHtml;
 if(typeof baseGmHtml==="function")window.gmHtml=function(){
  let html=baseGmHtml();
  if(!html.includes('gmHubSwitch(\'manage\')')||!html.includes('gm-hub-tab active'))return html;
  const marker='<details class="gm-hub-section"><summary>副本管理</summary>';
  const block=section(window.gmEnhancementManagementHtml());
  return html.includes(marker)?html.replace(marker,block+marker):html.replace('<div class="controls gm-hub-close">',block+'<div class="controls gm-hub-close">');
 };
 installStyles();
})();
