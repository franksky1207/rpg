/* GM 3D Test Center v1: session-only fixture selection; no game state/save access. */
(function(){
"use strict";
/* Internal IDs retained for automated checks; user menu contains visual scenes only. */
const categories=[
["home","主畫面與紀元場景"],["map","冒險與宇宙地圖"],["character","玩家、裝備與養成"],
["monster","怪物與 Boss 模型"],["combat","戰鬥、動畫與特效"],["special","副本、災厄與特殊演出"]];
const cases=[
{id:"B-03-HOME",cat:"home",title:"三紀元主畫面",kind:"epoch",detail:"觀察銀河、宇宙與高維紀元的立體場景。"},
{id:"C-05-GALAXY-MAP",cat:"map",title:"銀河紀元星圖",kind:"galaxy",detail:"觀察銀河十大區域與怪物象徵，可調整區域進度與聚焦位置。"},
{id:"C-06-UNIVERSE-MAP",cat:"map",title:"宇宙紀元星圖",kind:"universe",detail:"觀察宇宙十大區域與一百名 Boss 的立體分布。"},
{id:"C-07-HIGHER",cat:"map",title:"高維紀元戰線",kind:"higher",detail:"觀察十名高維存在與持續生命狀態的立體象徵。"},
{id:"C-08-CHARACTER",cat:"character",title:"角色全身展示",kind:"character",detail:"查看三紀元角色的立體全身展示雛形。"}
];
const $=id=>document.getElementById(id);
const host=$("prototypeHost"),status=$("status"),fallback=$("fallback"),fallbackReason=$("fallbackReason");
const quality=$("quality"),toggle=$("toggle"),caseList=$("caseList"),categoryList=$("categoryList"),search=$("caseSearch");

let runtime=null,serial=0,disabled=false,selected="B-03-HOME",category="ALL";
let snapshot={world:1,selectedMap:0,regionProgress:1};
const entry=()=>cases.find(c=>c.id===selected)||cases[0];
let maximized=false;
const maximizeButton=$("maximizePreview");
function setMaximized(value){
 const next=!!value;
 if(next===maximized)return;
 maximized=next;
 document.body.classList.toggle("gm-3d-maximized",maximized);
 $("centerWorkspace").classList.toggle("center-maximized",maximized);
 maximizeButton.setAttribute("aria-pressed",String(maximized));
 maximizeButton.setAttribute("aria-label",maximized?"還原 3D 預覽":"最大化 3D 預覽");
 maximizeButton.textContent=maximized?"⛶ 還原預覽":"⛶ 最大化預覽";
 runtime?.resize();
 requestAnimationFrame(()=>{
   if(!maximized){
     const stage=host.closest(".stage");
     const target=stage.getBoundingClientRect().top+window.scrollY-Math.max(12,Math.min(64,innerHeight*.08));
     window.scrollTo({top:Math.max(0,target),behavior:"instant"});
   }
   runtime?.resize();
 });
}
maximizeButton.addEventListener("click",()=>setMaximized(!maximized));

const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function renderCategories(){
  categoryList.replaceChildren();
  const counts=Object.fromEntries(categories.map(([id])=>[id,cases.filter(c=>c.cat===id).length]));
  for(const [id,title] of [["ALL","全部場景"],...categories]){
    const btn=document.createElement("button");btn.type="button";btn.className="center-category"+(category===id?" active":"");
    btn.setAttribute("aria-pressed",String(category===id));
    btn.textContent=title;
    btn.onclick=()=>{category=id;renderCategories();renderCases();};
    categoryList.append(btn);
  }
}
function renderCases(){
 caseList.replaceChildren();
 const q=search.value.trim().toLowerCase();
 for(const c of cases.filter(c=>(category==="ALL"||c.cat===category)&&[c.title,c.detail,categories.find(([id])=>id===c.cat)?.[1]].join(" ").toLowerCase().includes(q))){
   const btn=document.createElement("button");btn.type="button";btn.className="center-case"+(selected===c.id?" active":"");
   btn.setAttribute("aria-pressed",String(selected===c.id));
   btn.textContent=c.title;
   btn.onclick=()=>{selected=c.id;renderCases();renderInfo();start();};
   caseList.append(btn);
 }
 if(!caseList.children.length){const p=document.createElement("p");p.textContent="這裡還沒有可以觀看的 3D 場景。";caseList.append(p);}
}
function renderInfo(){
 const c=entry();
 $("caseTitle").textContent=c.title;

 $("caseDetail").textContent=c.detail;
 $("fixturePanel").hidden=false;
 $("fixtureWorld").closest("label").hidden=c.kind!=="epoch"&&c.kind!=="character";
 $("fixtureProgress").closest("label").hidden=c.kind!=="galaxy"&&c.kind!=="universe"&&c.kind!=="higher";
 $("fixtureSelected").closest("label").hidden=c.kind!=="galaxy"&&c.kind!=="universe";
}
function safeStop(){
 serial++;
 const old=runtime;runtime=null;
 if(old)old.dispose();
 host.replaceChildren();
}
function fail(reason){
 status.hidden=false;
 fallback.hidden=false;host.hidden=true;fallbackReason.textContent=String(reason);
 status.textContent="3D 安全模式：可重新啟動，或返回 GM";
}
async function start(){
 safeStop();
 const ticket=serial;
 if(disabled){fail("3D 已停用，不影響正式遊戲。");return;}
 if(!window.Civilization3DRuntime||!window.Civilization3DPrototype){fail("共用 3D 模組尚未載入。");return;}
 status.hidden=false;status.textContent="正在載入 3D 測試場景…";
 const c=entry(),B=window.Civilization3DPrototype;
 const factory=c.kind==="character"?B.createCharacterScene:c.kind==="higher"?B.createHigherDimensionalScene:c.kind==="universe"?B.createUniverseScene:c.kind==="galaxy"?B.createGalaxyScene:c.kind==="epoch"?B.createEpochScene:B.createScene;
 if(typeof factory!=="function"){fail("此場景尚未實作。");return;}
 fallback.hidden=true;host.hidden=false;
 runtime=window.Civilization3DRuntime.create({host,onClose:()=>{disabled=true;toggle.textContent="啟用 3D";start();},onFallback:reason=>fail("3D 場景失敗："+reason),onContextRestored:()=>{status.hidden=false;status.textContent="WebGL 已復原，可按重新啟動。";}});
 runtime.setQuality(quality.value);
 const progress=Math.max(1,Math.min(10,Number(snapshot.regionProgress)||1));
 const fixture=Object.freeze({world:Number(snapshot.world),mapCount:10,selectedMap:Number(snapshot.selectedMap),unlockedRegions:Array.from({length:10},(_,i)=>i<progress),enemyCount:5,highestUnlockedBossIndex:progress*10-1,clearedBossCount:(progress-1)*10,review:false});
 const current=runtime;
 const result=await current.show(c.id,args=>factory({...args,...fixture,...(c.kind==="higher"?{presences:Array.from({length:10},(_,i)=>({defeated:i<progress-1,available:true,remainingPercent:i===progress-1?50:100})),selectedPresence:Math.min(9,progress-1)}:{})}));
 if(ticket!==serial||current!==runtime)return;
 status.textContent=result.ok?"":"3D 場景載入失敗："+result.reason;
 if(result.ok)status.hidden=true;
 else fail(result.reason);
}
function updateFixture(){
 snapshot={world:Number($("fixtureWorld").value),selectedMap:Number($("fixtureSelected").value),regionProgress:Number($("fixtureProgress").value)};
 renderInfo();start();
}
const embedded=new URLSearchParams(location.search).get("embedded")==="1";
if(embedded)$("backToGame").hidden=true;
$("fixtureWorld").onchange=updateFixture;
$("fixtureSelected").onchange=updateFixture;
$("fixtureProgress").onchange=updateFixture;
search.oninput=renderCases;
toggle.onclick=()=>{disabled=!disabled;toggle.textContent=disabled?"啟用 3D":"停用 3D";start();};
$("restart").onclick=()=>{disabled=false;toggle.textContent="停用 3D";start();};
quality.onchange=()=>runtime?.setQuality(quality.value);
window.addEventListener("pagehide",()=>{setMaximized(false);safeStop();});
window.addEventListener("keydown",event=>{
 if(event.key==="Escape"&&maximized){event.preventDefault();event.stopImmediatePropagation();setMaximized(false);return;}
 if(embedded&&event.key==="Escape"){event.preventDefault();try{window.parent?.postMessage({type:"civilization3d:close"},location.origin);}catch(_){}}
});
function script(src){
 return new Promise((resolve,reject)=>{const el=document.createElement("script");el.src=src;el.onload=resolve;el.onerror=()=>reject(new Error("模組載入失敗："+src));document.head.append(el);});
}
window.Civilization3DTestCenter=Object.freeze({version:2,caseIds:cases.map(c=>c.id),categoryIds:categories.map(c=>c[0]),getCurrent:()=>selected,getFixture:()=>({...snapshot}),isMaximized:()=>maximized});
renderCategories();renderCases();renderInfo();
(async()=>{
 try{
  if(!window.BABYLON?.Engine)await script("../vendor/babylonjs/7.54.3/babylon.js");
  await script("./runtime.js?v=20261009-camera-center-v1");
  await script("./prototype-engine.js?v=20261009-shared-center-v1&v2=20261009-b06&v3=20261009-b07&v4=20261009-b08");
  start();
 }catch(error){fail(error.message);}
})();
})();
