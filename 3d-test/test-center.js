/* GM 3D Test Center v1: session-only fixture selection; no game state/save access. */
(function(){
"use strict";
const categories=[
["A","核心底座／相機／裝置"],["B","主畫面／紀元入口"],["C","冒險／地圖／回顧"],
["D","角色／裝備／成長"],["E","副本／災厄／特殊模式"],["F","戰鬥／HUD／動畫"],
["G","劇情／轉生／系統"],["H","素材／模型／美術"],["I","相容性／回歸／驗收"]];
const cases=[
{id:"A-01-ENGINE",cat:"A",batch:"B01",title:"引擎與本地授權",status:"ready",kind:"hub",detail:"驗證共用 Babylon.js、正式本地引擎及版本資訊。"},
{id:"A-02-LIFECYCLE",cat:"A",batch:"B02",title:"Canvas／WebGL 生命週期",status:"ready",kind:"hub",detail:"可停用／啟用、重新啟動並觸發 WebGL 中斷；請確認安全回退。"},
{id:"A-02-CAMERA",cat:"A",batch:"B02",title:"相機與裝置操作",status:"ready",kind:"hub",detail:"可旋轉、滾輪／觸控縮放、＋／－／重置，以及大型預覽切換。"},
{id:"B-03-HOME",cat:"B",batch:"B03",title:"主畫面 3D 艦橋",status:"ready",kind:"epoch",detail:"重用正式首頁共用場景 factory；可切換三紀元僅視覺效果。"},
{id:"B-04-ENTRY",cat:"B",batch:"B04",title:"三紀元入口／條件／彈窗",status:"partial",kind:"epoch",detail:"已有三紀元 portal 3D 外觀；正式解鎖、確認 Modal 尚非 GM 內可操作模擬。"},
{id:"C-05-GALAXY-MAP",cat:"C",batch:"B05",title:"銀河十大區星圖",status:"ready",kind:"galaxy",detail:"與正式銀河預覽共用 factory；使用測試進度快照，不讀取玩家資料。"},
{id:"C-05-ENEMY",cat:"C",batch:"B05",title:"五怪象徵與選怪",status:"partial",kind:"galaxy",detail:"僅有既有五個象徵幾何；完整怪物模型、正式選怪 3D 操作尚未實作。"},
{id:"I-05-RERUN",cat:"I",batch:"B05",title:"首輪／轉生／回顧隔離",status:"partial",kind:"galaxy",detail:"可切換純展示情境；不模擬正式轉生或回顧戰交易，應另驗正式頁流程。"}
];
const $=id=>document.getElementById(id);
const host=$("prototypeHost"),status=$("status"),fallback=$("fallback"),fallbackReason=$("fallbackReason");
const quality=$("quality"),toggle=$("toggle"),caseList=$("caseList"),categoryList=$("categoryList"),search=$("caseSearch");
const typeLabel={ready:"可預覽",partial:"部分完成",planned:"未實作"};
let runtime=null,serial=0,disabled=false,selected="A-01-ENGINE",category="ALL",loading=false;
let snapshot={world:1,selectedMap:0,regionProgress:1,life:"first"};
const entry=()=>cases.find(c=>c.id===selected)||cases[0];
let maximized=false;
const maximizeButton=$("maximizePreview");
function setMaximized(value){
 maximized=!!value;
 document.body.classList.toggle("gm-3d-maximized",maximized);
 $("centerWorkspace").classList.toggle("center-maximized",maximized);
 maximizeButton.setAttribute("aria-pressed",String(maximized));
 maximizeButton.setAttribute("aria-label",maximized?"還原 3D 預覽":"最大化 3D 預覽");
 maximizeButton.textContent=maximized?"⛶ 還原預覽":"⛶ 最大化預覽";
 runtime?.resize();
 requestAnimationFrame(()=>runtime?.resize());
}
maximizeButton.addEventListener("click",()=>setMaximized(!maximized));

const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function renderCategories(){
  categoryList.replaceChildren();
  const counts=Object.fromEntries(categories.map(([id])=>[id,cases.filter(c=>c.cat===id).length]));
  for(const [id,title] of [["ALL","全部分類"],...categories]){
    const btn=document.createElement("button");btn.type="button";btn.className="center-category"+(category===id?" active":"");
    btn.setAttribute("aria-pressed",String(category===id));
    btn.textContent=title+" · "+(id==="ALL"?cases.length:counts[id]);
    btn.onclick=()=>{category=id;renderCategories();renderCases();};
    categoryList.append(btn);
  }
}
function renderCases(){
 caseList.replaceChildren();
 const q=search.value.trim().toLowerCase();
 for(const c of cases.filter(c=>(category==="ALL"||c.cat===category)&&[c.id,c.batch,c.title,c.detail,c.cat].join(" ").toLowerCase().includes(q))){
   const btn=document.createElement("button");btn.type="button";btn.className="center-case"+(selected===c.id?" active":"");
   btn.setAttribute("aria-pressed",String(selected===c.id));
   btn.innerHTML='<b>'+esc(c.title)+'</b><small>'+esc(c.id)+' · '+esc(c.batch)+' · '+typeLabel[c.status]+'</small>';
   btn.onclick=()=>{selected=c.id;renderCases();renderInfo();start();};
   caseList.append(btn);
 }
 if(!caseList.children.length){const p=document.createElement("p");p.textContent="此分類目前沒有符合條件的案例。";caseList.append(p);}
}
function renderInfo(){
 const c=entry();
 $("caseTitle").textContent=c.title;
 $("caseMetadata").textContent=c.id+" · "+c.batch+" · "+typeLabel[c.status];
 $("caseDetail").textContent=c.detail;
 $("fixturePanel").hidden=false;
 $("scenarioLabel").textContent=snapshot.life==="first"?"首次遊戲":snapshot.life==="rerun"?"轉生後正式主線":"通關回顧（僅展示）";
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
 const factory=c.kind==="galaxy"?B.createGalaxyScene:c.kind==="epoch"?B.createEpochScene:B.createScene;
 if(typeof factory!=="function"){fail("此場景尚未實作。");return;}
 fallback.hidden=true;host.hidden=false;
 runtime=window.Civilization3DRuntime.create({host,onClose:()=>{disabled=true;toggle.textContent="啟用 3D";start();},onFallback:reason=>fail("3D 場景失敗："+reason),onContextRestored:()=>{status.hidden=false;status.textContent="WebGL 已復原，可按重新啟動。";}});
 runtime.setQuality(quality.value);
 const progress=Math.max(1,Math.min(10,Number(snapshot.regionProgress)||1));
 const fixture=Object.freeze({world:Number(snapshot.world),mapCount:10,selectedMap:Number(snapshot.selectedMap),unlockedRegions:Array.from({length:10},(_,i)=>i<progress),enemyCount:5});
 const current=runtime;
 const result=await current.show(c.id,args=>factory({...args,...fixture}));
 if(ticket!==serial||current!==runtime)return;
 status.textContent=result.ok?"測試案例 "+c.id+" · 共用場景已載入 · 不讀取正式存檔":"3D 不可用："+result.reason;
 if(result.ok)status.hidden=true;
 else fail(result.reason);
}
function updateFixture(){
 snapshot={world:Number($("fixtureWorld").value),selectedMap:Number($("fixtureSelected").value),regionProgress:Number($("fixtureProgress").value),life:$("fixtureLife").value};
 renderInfo();start();
}
const embedded=new URLSearchParams(location.search).get("embedded")==="1";
if(embedded)$("backToGame").hidden=true;
$("fixtureWorld").onchange=updateFixture;
$("fixtureSelected").onchange=updateFixture;
$("fixtureProgress").onchange=updateFixture;
$("fixtureLife").onchange=updateFixture;
search.oninput=renderCases;
toggle.onclick=()=>{disabled=!disabled;toggle.textContent=disabled?"啟用 3D":"停用 3D";start();};
$("restart").onclick=()=>{disabled=false;toggle.textContent="停用 3D";start();};
quality.onchange=()=>runtime?.setQuality(quality.value);
$("contextTest").onclick=()=>{
 const canvas=host.querySelector("canvas");
 const gl=canvas?.getContext("webgl2")||canvas?.getContext("webgl");
 const ext=gl?.getExtension("WEBGL_lose_context");
 if(ext)ext.loseContext();else {status.hidden=false;status.textContent="此裝置不支援 WebGL 中斷測試擴充。";}
};
window.addEventListener("pagehide",()=>{setMaximized(false);safeStop();});
window.addEventListener("keydown",event=>{
 if(event.key==="Escape"&&maximized){event.preventDefault();event.stopImmediatePropagation();setMaximized(false);return;}
 if(embedded&&event.key==="Escape"){event.preventDefault();try{window.parent?.postMessage({type:"civilization3d:close"},location.origin);}catch(_){}}
});
function script(src){
 return new Promise((resolve,reject)=>{const el=document.createElement("script");el.src=src;el.onload=resolve;el.onerror=()=>reject(new Error("模組載入失敗："+src));document.head.append(el);});
}
window.Civilization3DTestCenter=Object.freeze({version:1,caseIds:cases.map(c=>c.id),categoryIds:categories.map(c=>c[0]),getCurrent:()=>selected,getFixture:()=>({...snapshot}),isMaximized:()=>maximized});
renderCategories();renderCases();renderInfo();
(async()=>{
 try{
  if(!window.BABYLON?.Engine)await script("../vendor/babylonjs/7.54.3/babylon.js");
  await script("./runtime.js?v=20261009-camera-center-v1");
  await script("./prototype-engine.js?v=20261009-shared-center-v1");
  start();
 }catch(error){fail(error.message);}
})();
})();
