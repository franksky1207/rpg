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
{id:"C-08-CHARACTER",cat:"character",title:"角色全身展示",kind:"character",detail:"查看三紀元角色的立體全身展示雛形。"},
{id:"C-09-EQUIPMENT",cat:"character",title:"五槽裝備陳列",kind:"equipment",detail:"查看五個穿戴槽及背包裝備的立體展示雛形。"},
{id:"C-10-FORGE",cat:"character",title:"強化鍛造台",kind:"forge",detail:"五個裝備欄位的強化進度立體展示，實際強化仍由正式系統處理。"},
{id:"C-11-SPECIALIZATION",cat:"character",title:"八種專精星環",kind:"specialization",detail:"八種專精的立體能量節點；僅展示進度。"},
{id:"C-11-MARKS",cat:"character",title:"十印記星環",kind:"marks",detail:"十種印記的立體封印節點；不影響正式效果。"},
{id:"C-11-CIVILIZATION",cat:"character",title:"文明等級核心",kind:"civilization",detail:"文明等級的十階立體光環。"},
{id:"C-11-CORE",cat:"character",title:"界弦核心",kind:"core",detail:"高維核心的十階立體能量結構。"}
];
const $=id=>document.getElementById(id);
const host=$("prototypeHost"),status=$("status"),fallback=$("fallback"),fallbackReason=$("fallbackReason");
const quality=$("quality"),toggle=$("toggle"),caseList=$("caseList"),categoryList=$("categoryList"),search=$("caseSearch");

let runtime=null,serial=0,disabled=false,selected="B-03-HOME",category="ALL";
let snapshot={world:1,selectedMap:0,regionProgress:1};
const embedded=new URLSearchParams(location.search).get("embedded")==="1";
let appearanceMode=embedded?"formal":"free",formalAppearance=null;
const freeAppearance={world:1,level:500,quality:5,enhancement:20,equipped:[true,true,true,true,true]};
const appearanceKinds=new Set(["character","equipment","forge"]);
const appearancePanel=document.createElement("section");
appearancePanel.className="center-appearance-panel";
appearancePanel.innerHTML='<details id="appearanceDetails"><summary id="appearanceSummary">展示設定 · 正式角色外觀</summary><div class="center-appearance-modes"><button type="button" id="appearanceFormal">正式角色外觀</button><button type="button" id="appearanceFree">自由展示模式</button></div><p id="appearanceSource" class="muted"></p><div id="appearanceFreeControls" class="center-appearance-free"><label>展示紀元 <select id="appearanceWorld"><option value="1">銀河紀元</option><option value="2">宇宙紀元</option><option value="3">高維紀元</option></select></label><label>展示等級 <input id="appearanceLevel" type="number" min="1" max="2000" value="500"></label><label>裝備品質 <select id="appearanceQuality"><option value="0">普通</option><option value="1">精良</option><option value="2">稀有</option><option value="3">史詩</option><option value="4">傳說</option><option value="5" selected>神話</option></select></label><label>強化等級 <input id="appearanceEnhancement" type="number" min="0" max="40" value="20"></label><div class="center-appearance-slots">五槽穿戴：<label><input type="checkbox" data-appearance-slot="0" checked>武器</label><label><input type="checkbox" data-appearance-slot="1" checked>頭盔</label><label><input type="checkbox" data-appearance-slot="2" checked>鎧甲</label><label><input type="checkbox" data-appearance-slot="3" checked>鞋子</label><label><input type="checkbox" data-appearance-slot="4" checked>飾品</label></div></div><button type="button" id="appearanceRefresh">重新同步正式角色</button></details>';
$("centerWorkspace").querySelector(".center-description").after(appearancePanel);
function requestAppearance(){
 if(!embedded||window.parent===window)return;
 window.parent.postMessage({type:"civilization3d:appearance-request"},location.origin);
}
function freeVisual(){
 const world=freeAppearance.world;
 const cap=world===1?20:40;
 const level=Math.max(0,Math.min(cap,freeAppearance.enhancement));
 return {world,level:freeAppearance.level,equipment:Object.fromEntries(["weapon","helmet","armor","shoes","accessory"].map((type,i)=>[type,{present:freeAppearance.equipped[i],quality:freeAppearance.quality,level:freeAppearance.level,world}])),enhancements:Object.fromEntries(["weapon","helmet","armor","shoes","accessory"].map(type=>[type,level])),enhancementCap:cap,enhancementMin:0,inventorySamples:Array.from({length:5},()=>({present:true,quality:freeAppearance.quality}))};
}
function visualScene(kind,a){
 const types=["weapon","helmet","armor","shoes","accessory"];
 if(kind==="equipment")return {world:a.world,slots:types.map(t=>a.equipment?.[t]||{}),inventorySamples:a.inventorySamples||[],appearance:a};
 if(kind==="forge")return {world:a.world,cap:a.enhancementCap,slots:types.map(t=>({level:Number(a.enhancements?.[t])||0,invalid:Number(a.enhancements?.[t])<Number(a.enhancementMin)})),appearance:a};
 return {world:a.world,appearance:a};
}
function syncAppearancePanel(){
 const relevant=appearanceKinds.has(entry().kind);
 appearancePanel.hidden=!relevant;
 $("appearanceSummary").textContent="展示設定 · "+(appearanceMode==="formal"?"正式角色外觀":"自由展示模式");
 $("appearanceFormal").classList.toggle("active",appearanceMode==="formal");
 $("appearanceFree").classList.toggle("active",appearanceMode==="free");
 $("appearanceFreeControls").hidden=appearanceMode!=="free";
 $("appearanceRefresh").hidden=appearanceMode!=="formal";
 $("appearanceSource").textContent=appearanceMode==="formal"?(formalAppearance?"正式角色｜"+["銀河紀元","宇宙紀元","高維紀元"][formalAppearance.world-1]+"｜Lv."+formalAppearance.level+"｜VIP"+formalAppearance.vip+"｜唯讀展示":"等待正式角色外觀快照；不會改變遊戲資料。"):"自由展示｜僅影響本次 3D 預覽，不寫入正式角色。";

}
$("appearanceFormal").onclick=()=>{appearanceMode="formal";syncAppearancePanel();if(formalAppearance)start();else requestAppearance();};
$("appearanceFree").onclick=()=>{appearanceMode="free";syncAppearancePanel();start();};
$("appearanceRefresh").onclick=()=>{formalAppearance=null;syncAppearancePanel();requestAppearance();};
$("appearanceWorld").onchange=e=>{freeAppearance.world=Math.max(1,Math.min(3,Number(e.target.value)||1));start();};
appearancePanel.querySelectorAll("[data-appearance-slot]").forEach(el=>el.onchange=()=>{freeAppearance.equipped[Number(el.dataset.appearanceSlot)]=el.checked;start();});
$("appearanceLevel").onchange=e=>{freeAppearance.level=Math.max(1,Math.min(2000,Number(e.target.value)||1));start();};
$("appearanceQuality").onchange=e=>{freeAppearance.quality=Math.max(0,Math.min(5,Number(e.target.value)||0));start();};
$("appearanceEnhancement").onchange=e=>{freeAppearance.enhancement=Math.max(0,Math.min(40,Number(e.target.value)||0));start();};
window.addEventListener("message",event=>{
 if(!embedded||event.source!==window.parent||event.origin!==location.origin||event.data?.type!=="civilization3d:appearance-response")return;
 const a=event.data.appearance;
 if(!a||a.source!=="formal"||a.version!==1)return;
 formalAppearance=a;syncAppearancePanel();
 if(appearanceMode==="formal"&&appearanceKinds.has(entry().kind))start();
});
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
    const count=id==="ALL"?cases.length:counts[id];
    const name=document.createElement("span");name.className="center-category-name";name.textContent=title;
    const number=document.createElement("span");number.className="center-category-count";number.textContent=String(count);
    btn.append(name,number);
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
   const label=document.createElement("span");label.className="center-case-label";label.textContent=c.title;
   btn.append(label);
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
 syncAppearancePanel();
 $("fixtureWorld").closest("label").hidden=appearanceKinds.has(c.kind)||c.kind!=="epoch";
 $("fixtureProgress").closest("label").hidden=c.kind!=="galaxy"&&c.kind!=="universe"&&c.kind!=="higher"&&!["specialization","marks","civilization","core"].includes(c.kind);
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
 const factory=["specialization","marks","civilization","core"].includes(c.kind)?B.createGrowthScene:c.kind==="forge"?B.createForgeScene:c.kind==="equipment"?B.createEquipmentScene:c.kind==="character"?B.createCharacterScene:c.kind==="higher"?B.createHigherDimensionalScene:c.kind==="universe"?B.createUniverseScene:c.kind==="galaxy"?B.createGalaxyScene:c.kind==="epoch"?B.createEpochScene:B.createScene;
 if(typeof factory!=="function"){fail("此場景尚未實作。");return;}
 fallback.hidden=true;host.hidden=false;
 runtime=window.Civilization3DRuntime.create({host,onClose:()=>{disabled=true;toggle.textContent="啟用 3D";start();},onFallback:reason=>fail("3D 場景失敗："+reason),onContextRestored:()=>{status.hidden=false;status.textContent="WebGL 已復原，可按重新啟動。";}});
 runtime.setQuality(quality.value);
 const progress=Math.max(1,Math.min(10,Number(snapshot.regionProgress)||1));
 const activeVisual=appearanceMode==="formal"?formalAppearance:freeVisual();
 if(appearanceKinds.has(c.kind)&&!activeVisual){status.hidden=false;status.textContent="等待正式角色外觀快照…";return;}
 const growthKinds=["specialization","marks","civilization","core"];
 const growth= growthKinds.includes(c.kind)?{
   growthKind:c.kind,growthLevels:Array.from({length:c.kind==="specialization"?8:10},(_,i)=>Math.max(0,Math.min(c.kind==="specialization"?60:10,Math.round((i+1)*progress*(c.kind==="specialization"?60/80:1/10))))),
   growthLevel:progress
 }:{};
 const visual=appearanceKinds.has(c.kind)?visualScene(c.kind,activeVisual):growth;
 const fixture=Object.freeze({world:Number(snapshot.world),mapCount:10,selectedMap:Number(snapshot.selectedMap),unlockedRegions:Array.from({length:10},(_,i)=>i<progress),enemyCount:5,highestUnlockedBossIndex:progress*10-1,clearedBossCount:(progress-1)*10,review:false});
 const current=runtime;
 const result=await current.show(c.id,args=>factory({...args,...fixture,...visual,...(c.kind==="higher"?{presences:Array.from({length:10},(_,i)=>({defeated:i<progress-1,available:true,remainingPercent:i===progress-1?50:100})),selectedPresence:Math.min(9,progress-1)}:{})}));
 if(ticket!==serial||current!==runtime)return;
 status.textContent=result.ok?"":"3D 場景載入失敗："+result.reason;
 if(result.ok)status.hidden=true;
 else fail(result.reason);
}
function updateFixture(){
 snapshot={world:Number($("fixtureWorld").value),selectedMap:Number($("fixtureSelected").value),regionProgress:Number($("fixtureProgress").value)};
 renderInfo();start();
}
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
window.Civilization3DTestCenter=Object.freeze({version:3,caseIds:cases.map(c=>c.id),categoryIds:categories.map(c=>c[0]),getCurrent:()=>selected,getFixture:()=>({...snapshot}),isMaximized:()=>maximized});
renderCategories();renderCases();renderInfo();
(async()=>{
 try{
  await Promise.all([
    window.BABYLON?.Engine?Promise.resolve():script("../vendor/babylonjs/7.54.3/babylon.js"),
    window.Civilization3DRuntime?.create?Promise.resolve():script("./runtime.js?v=20261009-camera-center-v1"),
    window.Civilization3DPrototype?.createGrowthScene?Promise.resolve():script("./prototype-engine.js?v=20261009-b11")
  ]);
  if(!window.BABYLON?.Engine||!window.Civilization3DRuntime?.create||!window.Civilization3DPrototype?.createGrowthScene)throw new Error("3D 模組載入不完整。");
  start();
  if(embedded)requestAppearance();
 }catch(error){fail(error.message);}
})();
})();
