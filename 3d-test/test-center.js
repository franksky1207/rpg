/* GM battle animation test center. Presentation only: no official combat, storage or cloud owner. */
(function(){
"use strict";
const categories=[["character","角色與動作"],["combat","戰場與對戰"]];
const cases=[
 {id:"C-08-CHARACTER",cat:"character",title:"角色動作預覽",kind:"character",detail:"查看現有角色動畫的待機、攻擊、受擊、閃避、死亡與重播。現有素材並非未來三紀元角色。"},
 {id:"C-15-BATTLE",cat:"combat",title:"戰鬥動畫模擬",kind:"battle-battle",detail:"檢視已發布戰場、可用角色、敵方情境、血量與播放控制，不發放收益。"}
];
const $=id=>document.getElementById(id);
const host=$("prototypeHost"),status=$("status"),fallback=$("fallback"),fallbackReason=$("fallbackReason");
const quality=$("quality"),toggle=$("toggle"),categoryList=$("categoryList"),caseList=$("caseList"),search=$("caseSearch"),maximizeButton=$("maximizePreview");
const embedded=new URLSearchParams(location.search).get("embedded")==="1";
if(embedded){const back=$("backToGame");if(back){back.hidden=true;back.style.display="none";}}
let category="character",selected="C-08-CHARACTER",runtime=null,serial=0,disabled=false,maximized=false,maximumScroll=null;
const entry=()=>cases.find(c=>c.id===selected)||cases[0];
function release(){
 serial++;
 const old=runtime;runtime=null;
 if(old)try{old.dispose();}catch(_){}
 host.replaceChildren();
}
function showFailure(reason){
 status.hidden=false;fallback.hidden=false;host.hidden=true;
 fallbackReason.textContent=String(reason);
 status.textContent="預覽安全模式：可重新啟動或返回 GM";
}
function setMaximized(value){
 const next=!!value;if(next===maximized)return;
 if(next)maximumScroll={left:window.scrollX,top:window.scrollY};
 maximized=next;
 document.body.classList.toggle("gm-3d-maximized",maximized);
 $("centerWorkspace").classList.toggle("center-maximized",maximized);
 maximizeButton.setAttribute("aria-pressed",String(maximized));
 maximizeButton.setAttribute("aria-label",maximized?"還原預覽":"最大化預覽");
 maximizeButton.textContent=maximized?"⛶ 還原預覽":"⛶ 最大化預覽";
 runtime?.resize?.();
 requestAnimationFrame(()=>{
  if(!maximized){if(maximumScroll)window.scrollTo({...maximumScroll,behavior:"instant"});maximumScroll=null;}
  runtime?.resize?.();
 });
}
maximizeButton.addEventListener("click",()=>setMaximized(!maximized));
function renderCategories(){
 categoryList.replaceChildren();
 for(const [id,title] of categories){
  const btn=document.createElement("button");btn.type="button";btn.className="center-category"+(category===id?" active":"");
  btn.setAttribute("aria-pressed",String(category===id));
  const name=document.createElement("span");name.className="center-category-name";name.textContent=title;
  const count=document.createElement("span");count.className="center-category-count";count.textContent=String(cases.filter(c=>c.cat===id).length);
  btn.append(name,count);
  btn.onclick=()=>{category=id;selected=cases.find(c=>c.cat===id).id;renderCategories();renderCases();renderInfo();void start();};
  categoryList.append(btn);
 }
}
function renderCases(){
 caseList.replaceChildren();const q=search.value.trim().toLowerCase();
 for(const c of cases.filter(c=>c.cat===category&&[c.title,c.detail,categories.find(x=>x[0]===c.cat)?.[1]].join(" ").toLowerCase().includes(q))){
  const btn=document.createElement("button");btn.type="button";btn.className="center-case"+(selected===c.id?" active":"");
  btn.setAttribute("aria-pressed",String(selected===c.id));
  const label=document.createElement("span");label.className="center-case-label";label.textContent=c.title;btn.append(label);
  btn.onclick=()=>{selected=c.id;renderCases();renderInfo();void start();};
  caseList.append(btn);
 }
 if(!caseList.children.length){const p=document.createElement("p");p.textContent="沒有符合搜尋條件的測試項目。";caseList.append(p);}
}
function renderInfo(){
 $("caseTitle").textContent=entry().title;$("caseDetail").textContent=entry().detail;
 const legacy=$("fixturePanel");if(legacy)legacy.hidden=true;
}
async function start(){
 release();
 const ticket=serial;
 if(disabled){showFailure("預覽已停用，不影響正式遊戲。");return;}
 fallback.hidden=true;host.hidden=false;status.hidden=false;
 const abort=new AbortController();let viewer=null;
 runtime={dispose:()=>{abort.abort();viewer?.dispose?.();},resize:()=>viewer?.resize?.(),setQuality:value=>viewer?.setQuality?.(value)};
 try{
  let mod;
  if(entry().kind==="character"){
   status.textContent="GM 角色預覽：僅使用現有測試素材，不修改存檔。";
   mod=await import("./gm-whole-suit.mjs?v=20261015-thrust1");
  }else{
   status.textContent="GM 2.5D 戰鬥沙盒：不影響正式戰鬥或音效。";
   mod=await import("./gm-battle-simulation.js?v=20261015-thrust1");
  }
  if(ticket!==serial||abort.signal.aborted)return;
  viewer=await mod.mount({host,signal:abort.signal,quality:quality.value});
  if(ticket!==serial||abort.signal.aborted)viewer?.dispose?.();
 }catch(error){if(ticket===serial)showFailure("視覺測試無法載入："+String(error?.message||error));}
}
search.oninput=renderCases;
toggle.onclick=()=>{disabled=!disabled;toggle.textContent=disabled?"啟用預覽":"停用預覽";void start();};
$("restart").onclick=()=>{disabled=false;toggle.textContent="停用預覽";void start();};
quality.onchange=()=>void start();
window.addEventListener("pagehide",()=>{setMaximized(false);release();});
window.addEventListener("keydown",event=>{
 if(event.key!=="Escape")return;
 if(maximized){event.preventDefault();event.stopImmediatePropagation();setMaximized(false);return;}
 if(embedded){event.preventDefault();try{window.parent?.postMessage({type:"civilization3d:close"},location.origin);}catch(_){}}
});
window.Civilization3DTestCenter=Object.freeze({
 version:6,caseIds:cases.map(c=>c.id),categoryIds:categories.map(c=>c[0]),
 getCurrent:()=>selected,isMaximized:()=>maximized,
 getFixture:()=>({world:1,selectedMap:0,regionProgress:1,appearanceMode:embedded?"formal":"free",scenarioMode:embedded?"formal":"free"})
});
renderCategories();renderCases();renderInfo();void start();
})();
