/* GM 3D Test Center v1: session-only fixture selection; no game state/save access. */
(function(){
"use strict";
/* Internal IDs retained for automated checks; user menu contains visual scenes only. */
// Only published, operable 2.5D previews belong in the GM menu.
// Legacy 3D symbolic scenes are deliberately unreachable; dependent internals
// are removed only with the separate 2-3 runtime dependency audit.
const categories=[
 ["character","角色與動作"],["combat","戰場與對戰"]
];
const cases=[
 {id:"C-08-CHARACTER",cat:"character",title:"角色與五種動作",kind:"character",
  detail:"查看目前可用的 2.5D 角色、待機／攻擊／受擊／閃避／死亡與重播；G005、G007、G018 是既有測試素材，並非未來三紀元角色。"},
 {id:"C-15-BATTLE",cat:"combat",title:"2.5D 戰鬥模擬",kind:"battle-battle",
  detail:"查看已實作的戰場、角色、敵人、護盾及血量提示；可測普通怪、菁英怪、Boss 與播放控制，不發放收益。"}
];
const $=id=>document.getElementById(id);
const host=$("prototypeHost"),status=$("status"),fallback=$("fallback"),fallbackReason=$("fallbackReason");
const quality=$("quality"),toggle=$("toggle"),caseList=$("caseList"),categoryList=$("categoryList"),search=$("caseSearch");

let runtime=null,serial=0,disabled=false,selected="C-08-CHARACTER",category="character";
let snapshot={world:1,selectedMap:0,regionProgress:1};

const scenarioKinds=new Set(["galaxy","universe","higher","frontier-galaxy","frontier-universe","frontier-alternate","dungeon-hub","dungeon-bounty","dungeon-arena","advanced-mirror","advanced-void","battle-battle","battle-shield","battle-encounter","battle-settlement"]);
let scenarioMode="free",formalScenario=null;
const calamitySimulation={1:{selected:0,state:"available"},2:{selected:0,state:"available"}};
const scenarioPanel=document.createElement("section");scenarioPanel.className="center-appearance-panel";
scenarioPanel.innerHTML='<details open><summary>展示資料來源 · 自由測試設定</summary><div class="center-appearance-modes"><button id="scenarioFormal" type="button">同步正式資料</button><button id="scenarioFree" type="button">自由測試設定</button></div><p id="scenarioSource" class="muted"></p><button id="scenarioRefresh" type="button">重新同步正式資料</button><div id="scenarioCalamity" class="center-scenario-grid"><label>選擇文明災厄 <select id="scenarioCalamityIndex"></select></label><label>模擬狀態 <select id="scenarioCalamityState"></select></label></div></details>';
$("centerWorkspace").querySelector(".center-description").after(scenarioPanel);
const alternateScenarioLabel=document.createElement("label");alternateScenarioLabel.id="scenarioAlternateLabel";alternateScenarioLabel.textContent="異宇宙測試狀態 ";
const alternateScenarioSelect=document.createElement("select");alternateScenarioSelect.id="scenarioAlternateState";
for(const [v,t] of [["available","可挑戰"],["active","挑戰中"],["locked","失敗後鎖定"],["completed","已通關"]])alternateScenarioSelect.add(new Option(t,v));
alternateScenarioLabel.append(alternateScenarioSelect);scenarioPanel.querySelector("details").append(alternateScenarioLabel);
let alternateScenarioState="available";
alternateScenarioSelect.onchange=()=>{alternateScenarioState=alternateScenarioSelect.value;start();};
for(let i=0;i<10;i++)$("scenarioCalamityIndex").add(new Option("第 "+(i+1)+" 隻文明災厄",String(i)));
function calWorld(){return entry().kind==="frontier-universe"?2:1;}
function syncCalControls(){
 const cal=["frontier-galaxy","frontier-universe"].includes(entry().kind);
 $("scenarioCalamity").hidden=!cal||scenarioMode!=="free";if(!cal)return;
 const world=calWorld(),item=calamitySimulation[world],select=$("scenarioCalamityState");
 const choices=world===1?[["locked","尚未解鎖"],["available","可以挑戰"],["progress","進行中"],["completed","印記 MAX"],["review","回顧挑戰"]]:[["locked","尚未現身"],["appeared","已現身／前置條件不足"],["available","可以挑戰"],["progress","文明養成中"],["completed","文明階段完成"],["review","回顧挑戰"]];
 select.replaceChildren();choices.forEach(([v,t])=>select.add(new Option(t,v)));select.value=item.state;
 $("scenarioCalamityIndex").value=String(item.selected);
}
function requestScenario(){if(embedded&&window.parent!==window)window.parent.postMessage({type:"civilization3d:scenario-request"},location.origin);}
function syncScenarioPanel(){
 const visible=scenarioKinds.has(entry().kind);scenarioPanel.hidden=!visible;if(!visible)return;
 scenarioPanel.querySelector("summary").textContent="展示資料來源 · "+(scenarioMode==="formal"?"同步正式資料":"自由測試設定");
 $("scenarioFormal").classList.toggle("active",scenarioMode==="formal");$("scenarioFree").classList.toggle("active",scenarioMode==="free");
 $("scenarioSource").textContent=scenarioMode==="formal"?(formalScenario?"已取得遊戲正式唯讀資料。":"尚未取得正式資料，請在遊戲內 GM 中心同步。"):"本次預覽的模擬設定不會影響正式存檔。";
 $("fixtureWorld").disabled=scenarioMode==="formal"&&entry().kind.startsWith("dungeon-");
 for(const id of ["dungeonArenaRank","dungeonArenaPosition","dungeonHigherMode","dungeonHigherStage","dungeonBountyTier","dungeonMirrorWins","dungeonVoidFloor"])$(id).disabled=scenarioMode==="formal";
 $("scenarioRefresh").hidden=scenarioMode!=="formal";
 for(const id of ["fixtureProgress","fixtureSelected","alternateSegment","alternateUniverse","alternateDepth","alternateCulture","alternateCultureUniverse"])$(id).disabled=scenarioMode==="formal";
 $("scenarioAlternateLabel").hidden=entry().kind!=="frontier-alternate"||scenarioMode!=="free";
 syncCalControls();
}
$("scenarioFormal").onclick=()=>{scenarioMode="formal";renderInfo();requestScenario();start();};
$("scenarioRefresh").onclick=()=>{formalScenario=null;syncScenarioPanel();requestScenario();start();};
$("scenarioFree").onclick=()=>{scenarioMode="free";renderInfo();start();};
$("scenarioCalamityIndex").onchange=()=>{calamitySimulation[calWorld()].selected=Number($("scenarioCalamityIndex").value)||0;syncCalControls();start();};
$("scenarioCalamityState").onchange=()=>{calamitySimulation[calWorld()].state=$("scenarioCalamityState").value;start();};
window.addEventListener("message",event=>{
 if(embedded&&event.source===window.parent&&event.origin===location.origin&&event.data?.type==="civilization3d:scenario-error"){
  formalScenario=null;status.hidden=false;status.textContent="正式資料快照同步失敗："+String(event.data.reason||"來源不可用");return;
 }
 if(!embedded||event.source!==window.parent||event.origin!==location.origin||event.data?.type!=="civilization3d:scenario-response")return;
 const data=event.data.snapshot;if(!data||!Array.isArray(data.calamities?.[1])||!Array.isArray(data.calamities?.[2]))return;
 // Validate the read-only bridge contract; never promote malformed data to formal.
 if(!data.battle||data.battle.schema!==1||!["active","unavailable"].includes(data.battle.status)||data.battle.source!=="formal-combat")return;
 if(data.battle.status==="active"&&(!Number.isFinite(data.battle.playerHpRatio)||!Number.isFinite(data.battle.enemyHpRatio)||!Number.isFinite(data.battle.shieldRatio)))return;
 formalScenario=data;renderInfo();if(scenarioMode==="formal"&&scenarioKinds.has(entry().kind)&&!(entry().kind==="battle-battle"&&battleSimulationView))start();
});
function sceneCalamityStates(world){
 const {selected,state}=calamitySimulation[world];
 return Array.from({length:10},(_,i)=>{
   const completed=i<selected||i===selected&&["completed","review"].includes(state);
   const current=i===selected,visible=i<selected||current&&state!=="locked"&&state!=="appeared";
   return {visible:visible||current&&state==="appeared",unlocked:completed||current&&["available","progress","review"].includes(state),
     completed,review:current&&state==="review",remainingPercent:100,
     markLevel:world===1&&completed?10:0,progressPercent:world===2&&completed?100:0};
 });
}
const dungeonVisual={arenaRank:1,arenaPosition:"normal",higherMode:"fixed",higherStage:0,bountyTier:"normal",mirrorWins:0,voidFloor:0};
let alternateSelection={segment:1,universe:1,depth:1};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Math.floor(Number(n)||min)));
function fillAlternateSelectors(){
 const segment=$("alternateSegment"),universe=$("alternateUniverse"),depth=$("alternateDepth");
 if(!segment||!universe||!depth)return;
 if(!segment.options.length)for(let i=1;i<=20;i++)segment.add(new Option(`第 ${i} 區 · U${String((i-1)*10+1).padStart(3,"0")}～U${String(i*10).padStart(3,"0")}`,String(i)));
 alternateSelection.segment=clamp(alternateSelection.segment,1,20);
 alternateSelection.universe=clamp(alternateSelection.universe,(alternateSelection.segment-1)*10+1,alternateSelection.segment*10);
 universe.replaceChildren();for(let i=(alternateSelection.segment-1)*10+1;i<=alternateSelection.segment*10;i++)universe.add(new Option(`U${String(i).padStart(3,"0")}`,String(i)));
 segment.value=String(alternateSelection.segment);universe.value=String(alternateSelection.universe);depth.value=String(alternateSelection.depth);
 const cultures=window.ALTERNATE_UNIVERSE_CULTURES||[],rows=window.ALTERNATE_UNIVERSE_NAME_CULTURES||[],names=window.ALTERNATE_UNIVERSE_NAMES||[];
 const selectedCulture=rows[alternateSelection.universe-1]||"",cultureSelect=$("alternateCulture"),cultureUniverse=$("alternateCultureUniverse");
 if(cultureSelect.options.length!==cultures.length){cultureSelect.replaceChildren();cultures.forEach(c=>cultureSelect.add(new Option(c,c)));}
 cultureSelect.value=selectedCulture;
 const members=rows.map((c,i)=>c===selectedCulture?i+1:0).filter(Boolean);
 cultureUniverse.replaceChildren();members.forEach((number,i)=>cultureUniverse.add(new Option(`${i+1} 階 · U${String(number).padStart(3,"0")} · ${names[number-1]||""}`,String(number))));
 cultureUniverse.value=String(alternateSelection.universe);

 const summary=$("alternatePreviewSummary");if(summary)summary.textContent=`${selectedCulture} · ${members.indexOf(alternateSelection.universe)+1}/10 階 · ${names[alternateSelection.universe-1]||""} · `+`第 ${alternateSelection.segment} 區 · U${String(alternateSelection.universe).padStart(3,"0")} · 深度 ${alternateSelection.depth}/5 · 第 ${(alternateSelection.universe-1)*5+alternateSelection.depth} / 1000 層 · 純視覺預覽`;
}

const embedded=new URLSearchParams(location.search).get("embedded")==="1";
if(embedded)scenarioMode="formal";
let appearanceMode=embedded?"formal":"free",formalAppearance=null;
const freeAppearance={world:1,level:500,quality:5,enhancement:20,equipped:[true,true,true,true,true],specializations:Array(8).fill(60),markLevels:Array(10).fill(10),civilizationLevel:10,coreLevel:10,hp:20000,atk:5200,def:2600,crit:27,dodge:21,vip:10,breakthrough:0};
const appearanceKinds=new Set(["character","equipment","forge","specialization","marks","civilization","core"]);
let equipmentCatalog=null,appearanceError="",equipmentRegion=0,equipmentSet=0;
const equipmentTypes=["weapon","helmet","armor","shoes","accessory"],equipmentLabels=["武器","頭盔","鎧甲","鞋子","飾品"];
function displayNames(holder,names){
 holder.replaceChildren();
 if(!Array.isArray(names)||names.length!==5||names.some(x=>!x)){
  holder.textContent="等待正式區域與裝備名稱資料…";return;
 }
 names.forEach((name,i)=>{const row=document.createElement("span");row.textContent=equipmentLabels[i]+"｜"+name;holder.append(row);});
}
function activeEquipmentSet(){
 const groups=equipmentCatalog?.[freeAppearance.world],group=groups?.[equipmentRegion];
 return group?.entries?.[equipmentSet]||null;
}
function refreshEquipmentSelectors(){
 const groups=equipmentCatalog?.[freeAppearance.world]||[];
 const region=$("appearanceRegion"),set=$("appearanceSet");
 equipmentRegion=Math.max(0,Math.min(equipmentRegion,groups.length-1));
 region.replaceChildren();groups.forEach((g,i)=>region.add(new Option(g.name,String(i))));
 region.value=String(equipmentRegion);
 const entries=groups[equipmentRegion]?.entries||[];
 equipmentSet=Math.max(0,Math.min(equipmentSet,entries.length-1));
 set.replaceChildren();entries.forEach((e,i)=>set.add(new Option(e.name+(e.level?" · Lv."+e.level:""),String(i))));
 set.value=String(equipmentSet);
 $("appearanceRegionLabel").hidden=freeAppearance.world===3;
 $("appearanceSetLabel").firstChild.textContent=freeAppearance.world===1?"小區域 ":freeAppearance.world===2?"Boss ":"命名階段 ";
 displayNames($("appearanceNames"),activeEquipmentSet()?.names);
}

const appearancePanel=document.createElement("section");
appearancePanel.className="center-appearance-panel";
appearancePanel.innerHTML='<details id="appearanceDetails"><summary id="appearanceSummary">展示資料來源</summary><div class="center-appearance-modes"><button type="button" id="appearanceFormal">同步正式資料</button><button type="button" id="appearanceFree">自由測試設定</button></div><p id="appearanceSource" class="muted"></p><div id="appearanceFreeControls" class="center-appearance-free"><label id="appearanceWorldLabel">展示紀元 <select id="appearanceWorld"><option value="1">銀河紀元</option><option value="2">宇宙紀元</option><option value="3">高維紀元</option></select></label><label id="appearanceRegionLabel">大區域 <select id="appearanceRegion"></select></label><label id="appearanceSetLabel">小區域 <select id="appearanceSet"></select></label><label id="appearanceStageLabel">強化外觀階段 <select id="appearanceStage"><option value="0">初始</option><option value="middle">成長中</option><option value="max" selected>已滿級</option></select></label><div id="appearanceNames" class="center-appearance-names" aria-live="polite"></div></div><div id="appearanceFormalNames" class="center-appearance-names" aria-live="polite"></div><button type="button" id="appearanceRefresh">重新同步正式角色</button></details>';
$("centerWorkspace").querySelector(".center-description").after(appearancePanel);
const specKeys=["training","scavenge","appraisal","initiative","combo","penetration","counter","drain"];
const growthControls=document.createElement("div");growthControls.id="growthFreeControls";growthControls.className="center-appearance-free";
growthControls.innerHTML='<label>外觀成長階段 <select id="growthVisualStage"><option value="0">初始</option><option value="middle">成長中</option><option value="max" selected>已滿級</option></select></label>';
appearancePanel.querySelector("#appearanceFreeControls").append(growthControls);
function syncMarkNames(){ /* names are read from formal appearance; no per-mark GM inputs */ }
const visualGrowthStage={specialization:"max",marks:"max",civilization:"max",core:"max"};
$("growthVisualStage").onchange=()=>{
 const kind=entry().kind,stage=$("growthVisualStage").value;
 visualGrowthStage[kind]=stage;
 const cap=kind==="specialization"?60:10;
 const level=stage==="max"?cap:stage==="middle"?Math.floor(cap/2):0;
 if(kind==="specialization")freeAppearance.specializations=Array(8).fill(level);
 else if(kind==="marks")freeAppearance.markLevels=Array(10).fill(level);
 else if(kind==="civilization")freeAppearance.civilizationLevel=level;
 else if(kind==="core")freeAppearance.coreLevel=level;
 start();
};
function requestAppearance(){
 if(!embedded||window.parent===window)return;
 window.parent.postMessage({type:"civilization3d:appearance-request"},location.origin);
}
function freeVisual(){
 const world=freeAppearance.world,chosen=activeEquipmentSet();
 const names=chosen?.names||[];
 const itemLevel=chosen?.level|| (world===1?500:world===2?1000:2000);
 const cap=world===1?20:40;
 const level=Math.max(0,Math.min(cap,freeAppearance.enhancement));
 return {world,level:itemLevel,equipment:Object.fromEntries(["weapon","helmet","armor","shoes","accessory"].map((type,i)=>[type,{present:freeAppearance.equipped[i],quality:5,level:itemLevel,world,name:String(names[i]||""),visualKey:String(names[i]||"")}])),enhancements:Object.fromEntries(["weapon","helmet","armor","shoes","accessory"].map(type=>[type,level])),enhancementCap:cap,enhancementMin:0,inventorySamples:Array.from({length:5},()=>({present:true,quality:5})),abilities:{hp:freeAppearance.hp,atk:freeAppearance.atk,def:freeAppearance.def,crit:freeAppearance.crit,dodge:freeAppearance.dodge},vip:freeAppearance.vip,breakthrough:freeAppearance.breakthrough,specializations:Object.fromEntries(specKeys.map((k,i)=>[k,freeAppearance.specializations[i]])),markLevels:Object.fromEntries(Array.from({length:10},(_,i)=>[String(i),freeAppearance.markLevels[i]])),civilizationLevel:freeAppearance.civilizationLevel,coreLevel:freeAppearance.coreLevel};
}
function visualScene(kind,a){
 if(appearanceMode==="formal"&&a?.source==="formal"&&window.Civilization3DAppearance?.scene){
  return window.Civilization3DAppearance.scene(kind,a);
 }
 const types=["weapon","helmet","armor","shoes","accessory"];
 if(kind==="equipment")return {world:a.world,slots:types.map(t=>a.equipment?.[t]||{}),inventorySamples:a.inventorySamples||[],appearance:a};
 if(kind==="forge")return {world:a.world,cap:a.enhancementCap,slots:types.map(t=>({level:Number(a.enhancements?.[t])||0,invalid:Number(a.enhancements?.[t])<Number(a.enhancementMin)})),appearance:a};
 return {world:a.world,appearance:a};
}
function syncAppearancePanel(){
 const relevant=appearanceKinds.has(entry().kind);
 appearancePanel.hidden=!relevant;
 $("appearanceSummary").textContent="展示資料來源 · "+(appearanceMode==="formal"?"正式角色資料":"自訂測試資料");
 $("appearanceFormal").classList.toggle("active",appearanceMode==="formal");
 $("appearanceFree").classList.toggle("active",appearanceMode==="free");
 $("appearanceFreeControls").hidden=appearanceMode!=="free";
 const equipped=["character","equipment"].includes(entry().kind),forge=entry().kind==="forge";
 $("appearanceWorldLabel").hidden=!(equipped||forge);
 $("appearanceRegionLabel").hidden=!equipped||freeAppearance.world===3;
 $("appearanceSetLabel").hidden=!equipped;
 $("appearanceStageLabel").hidden=!forge;
 $("appearanceNames").hidden=!equipped;
 $("appearanceFormalNames").hidden=appearanceMode!=="formal"||!["character","equipment","forge"].includes(entry().kind);
 if(equipped)refreshEquipmentSelectors();
 if(appearanceMode==="formal")displayNames($("appearanceFormalNames"),equipmentTypes.map(type=>formalAppearance?.equipment?.[type]?.name||"未穿戴"));

 growthControls.hidden=!["specialization","marks","civilization","core"].includes(entry().kind);
 if(!growthControls.hidden)$("growthVisualStage").value=visualGrowthStage[entry().kind];
 $("appearanceRefresh").hidden=appearanceMode!=="formal";
 const a=formalAppearance,c=entry(),fmt=x=>Number.isFinite(Number(x))?Number(x).toLocaleString("zh-TW"):"—";
 const detail=a?(c.kind==="character"?"":c.kind==="specialization"?"｜八專精 "+Object.values(a.specializations||{}).map(fmt).join("／"):c.kind==="marks"?"｜十印記 "+Object.values(a.markLevels||{}).map(fmt).join("／"):c.kind==="civilization"?"｜文明 Lv."+fmt(a.civilizationLevel):c.kind==="core"?"｜界弦核心 Lv."+fmt(a.coreLevel):""):"";
 $("appearanceSource").textContent=appearanceMode==="formal"?(a?"正式角色｜"+["銀河紀元","宇宙紀元","高維紀元"][a.world-1]+"｜Lv."+fmt(a.level)+"｜VIP"+fmt(a.vip)+detail+"｜唯讀展示":(appearanceError?"正式資料同步失敗："+appearanceError:"等待正式角色資料同步；不會改變遊戲資料。")):"自訂測試資料｜僅影響本次 3D 預覽，不寫入正式角色。";

}
$("appearanceFormal").onclick=()=>{appearanceMode="formal";appearanceError="";syncAppearancePanel();start();if(!formalAppearance)requestAppearance();};
$("appearanceFree").onclick=()=>{appearanceMode="free";syncAppearancePanel();start();};
$("appearanceRefresh").onclick=()=>{formalAppearance=null;appearanceError="";syncAppearancePanel();requestAppearance();};
$("appearanceWorld").onchange=e=>{freeAppearance.world=Math.max(1,Math.min(3,Number(e.target.value)||1));equipmentRegion=0;equipmentSet=0;const stage=$("appearanceStage").value;freeAppearance.enhancement=stage==="max"?(freeAppearance.world===1?20:40):stage==="middle"?(freeAppearance.world===1?10:30):0;refreshEquipmentSelectors();start();};
$("appearanceRegion").onchange=()=>{equipmentRegion=Number($("appearanceRegion").value)||0;equipmentSet=0;refreshEquipmentSelectors();start();};
$("appearanceSet").onchange=()=>{equipmentSet=Number($("appearanceSet").value)||0;refreshEquipmentSelectors();start();};
$("appearanceStage").onchange=()=>{freeAppearance.enhancement=$("appearanceStage").value==="max"?(freeAppearance.world===1?20:40):$("appearanceStage").value==="middle"?(freeAppearance.world===1?10:30):0;start();};
window.addEventListener("message",event=>{
 if(!embedded||event.source!==window.parent||event.origin!==location.origin||event.data?.type!=="civilization3d:appearance-response")return;
 const a=event.data.appearance;
 if(!a||a.source!=="formal"||a.version!==2)return;
 equipmentCatalog=event.data.catalog||null;appearanceError="";formalAppearance=a;syncAppearancePanel();
 if(appearanceMode==="formal"&&appearanceKinds.has(entry().kind))start();
});
window.addEventListener("message",event=>{
 if(!embedded||event.source!==window.parent||event.origin!==location.origin||event.data?.type!=="civilization3d:appearance-error")return;
 appearanceError=String(event.data.reason||"未知錯誤");syncAppearancePanel();
 if(appearanceMode==="formal")status.textContent="正式角色快照同步失敗："+appearanceError;
});
const entry=()=>cases.find(c=>c.id===selected)||cases[0];
let maximized=false,maximumScroll=null;
const maximizeButton=$("maximizePreview");
function setMaximized(value){
 const next=!!value;
 if(next===maximized)return;
 if(next)maximumScroll={left:window.scrollX,top:window.scrollY};
 maximized=next;
 document.body.classList.toggle("gm-3d-maximized",maximized);
 $("centerWorkspace").classList.toggle("center-maximized",maximized);
 maximizeButton.setAttribute("aria-pressed",String(maximized));
 maximizeButton.setAttribute("aria-label",maximized?"還原 3D 預覽":"最大化 3D 預覽");
 maximizeButton.textContent=maximized?"⛶ 還原預覽":"⛶ 最大化預覽";
 runtime?.resize?.();
 requestAnimationFrame(()=>{
   if(!maximized){
     if(maximumScroll)window.scrollTo({...maximumScroll,behavior:"instant"});
     maximumScroll=null;
   }
   runtime?.resize?.();
 });
}
maximizeButton.addEventListener("click",()=>setMaximized(!maximized));

const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function renderCategories(){
  categoryList.replaceChildren();
  const counts=Object.fromEntries(categories.map(([id])=>[id,cases.filter(c=>c.cat===id).length]));
  for(const [id,title] of categories){
    const btn=document.createElement("button");btn.type="button";btn.className="center-category"+(category===id?" active":"");
    btn.setAttribute("aria-pressed",String(category===id));
    const count=counts[id];
    const name=document.createElement("span");name.className="center-category-name";name.textContent=title;
    const number=document.createElement("span");number.className="center-category-count";number.textContent=String(count);
    btn.append(name,number);
    btn.onclick=()=>{category=id;selected=cases.find(c=>c.cat===category).id;renderCategories();renderCases();renderInfo();start();};
    categoryList.append(btn);
  }
}
function renderCases(){
 caseList.replaceChildren();
 const q=search.value.trim().toLowerCase();
 for(const c of cases.filter(c=>c.cat===category&&[c.title,c.detail,categories.find(([id])=>id===c.cat)?.[1]].join(" ").toLowerCase().includes(q))){
   const btn=document.createElement("button");btn.type="button";btn.className="center-case"+(selected===c.id?" active":"");
   btn.setAttribute("aria-pressed",String(selected===c.id));
   const label=document.createElement("span");label.className="center-case-label";label.textContent=c.title;
   btn.append(label);
   btn.onclick=()=>{wholeSuitView=false;selected=c.id;renderCases();renderInfo();start();};
   caseList.append(btn);
 }
 if(!caseList.children.length){const p=document.createElement("p");p.textContent="沒有符合搜尋條件的測試項目。";caseList.append(p);}
}
function renderInfo(){
 const c=entry();
 $("caseTitle").textContent=c.title;

 $("caseDetail").textContent=c.detail;
 $("fixturePanel").hidden=!["epoch","galaxy","universe","higher","dungeon-hub","dungeon-bounty","dungeon-arena","advanced-higher-arena","advanced-mirror","advanced-void","frontier-galaxy","frontier-universe","frontier-alternate"].includes(c.kind);
 syncAppearancePanel();syncScenarioPanel();
 $("fixtureWorld").closest("label").hidden=appearanceKinds.has(c.kind)||!(c.kind==="epoch"||c.kind==="dungeon-hub"||c.kind==="dungeon-bounty"||c.kind==="dungeon-arena");
 if(c.kind==="dungeon-bounty"&&Number(snapshot.world)===3){snapshot.world=2;$("fixtureWorld").value="2";}
 const worldSelect=$("fixtureWorld");
 const higherOption=worldSelect.querySelector('option[value="3"]');
 if(c.kind==="dungeon-bounty"){
   if(higherOption)higherOption.remove();
 }else if(!higherOption){
   const opt=document.createElement("option");opt.value="3";opt.textContent="高維紀元";worldSelect.append(opt);
 }
 $("alternateSegmentLabel").hidden=$("alternateUniverseLabel").hidden=$("alternateDepthLabel").hidden=c.kind!=="frontier-alternate";
 $("alternateQuickControls").hidden=c.kind!=="frontier-alternate";
 $("alternateCultureLabel").hidden=$("alternateCultureUniverseLabel").hidden=c.kind!=="frontier-alternate";
 if(c.kind==="frontier-alternate")fillAlternateSelectors();
 $("fixtureProgress").closest("label").hidden=!["galaxy","universe","higher"].includes(c.kind);
 const progressLabel=$("fixtureProgress").closest("label");
 progressLabel.firstChild.textContent=c.kind==="higher"?"高維存在進度 ":"區域進度 ";
 for(const [i,opt] of Array.from($("fixtureProgress").options).entries())opt.textContent=c.kind==="higher"?"第 "+(i+1)+" 位高維存在":" "+(i+1)+" / 10 大區";
 const arena=c.kind==="dungeon-arena",high=arena&&Number(scenarioMode==="formal"&&formalScenario?.dungeon?.arena?.world||snapshot.world)===3;
 if(arena)$("caseDetail").textContent=high?"高維競技場：定相或異相，每輪三戰。":"銀河／宇宙競技場：階級、普通／困難／極限位置。";
 for(const [id,show] of [["dungeonArenaRankLabel",arena&&!high],["dungeonArenaPositionLabel",arena&&!high],["dungeonHigherModeLabel",high],["dungeonHigherStageLabel",high],["dungeonBountyTierLabel",c.kind==="dungeon-bounty"],["dungeonMirrorWinsLabel",c.kind==="advanced-mirror"],["dungeonVoidFloorLabel",c.kind==="advanced-void"]])$(id).hidden=!show;
 $("fixtureSelected").closest("label").hidden=c.kind!=="galaxy"&&c.kind!=="universe";
}
let battleSimulationView=true,wholeSuitView=false;
function safeStop(){
 document.getElementById("gmWholeSuitPicker")?.remove();
 const picker=document.getElementById("gmBattleViewPicker");picker?.remove();
 const review=document.getElementById("gmAtlasReview");review?.__review?.dispose();review?.remove();
 serial++;
 const old=runtime;runtime=null;
 if(old)old.dispose();
 host.replaceChildren();
}
function fail(reason){
 status.hidden=false;
 fallback.hidden=false;host.hidden=true;fallbackReason.textContent=String(reason);
 status.textContent="預覽安全模式：可重新啟動或返回 GM";
}
async function start(){
 safeStop();
 syncScenarioPanel();
 const ticket=serial;
 if(disabled){fail("預覽已停用，不影響正式遊戲。");return;}
 // Both user-visible choices mount actual 2.5D systems, never symbolic 3D scenes.
 appearancePanel.hidden=true;scenarioPanel.hidden=true;
 fallback.hidden=true;host.hidden=false;status.hidden=false;
 const abort=new AbortController();let view=null;
 runtime={dispose:()=>{abort.abort();view?.dispose();},resize:()=>view?.resize?.(),
   setQuality:value=>view?.setQuality?.(value)};
 if(entry().kind==="character"){
  status.textContent="GM 角色預覽：僅限現有測試素材；不修改正式裝備或存檔。";
  try{const m=await import('./gm-whole-suit.mjs?v=20261015-thrust1');
   if(ticket!==serial)return;view=await m.mount({host,signal:abort.signal,quality:quality.value});
   if(ticket!==serial)view.dispose();}
  catch(_){if(ticket===serial)fail("角色預覽無法載入，請重新啟動。");}
  return;
 }
 if(entry().kind==="battle-battle"){
  status.textContent="GM 2.5D 沙盒：不影響正式戰鬥或音效。";
  try{const m=await import('./gm-battle-simulation.js?v=20261015-thrust1');
   if(ticket!==serial)return;view=await m.mount({host,signal:abort.signal,quality:quality.value});
   if(ticket!==serial)view.dispose();}
  catch(error){if(ticket===serial)fail("2.5D 戰鬥模擬無法載入："+error.message);}
  return;
 }
 fail("沒有可用的視覺測試項目。");
}
function updateFixture(){
 snapshot={world:Number($("fixtureWorld").value),selectedMap:Number($("fixtureSelected").value),regionProgress:Number($("fixtureProgress").value)};
 renderInfo();start();
}
if(embedded)$("backToGame").hidden=true;
$("fixtureWorld").onchange=updateFixture;
$("fixtureSelected").onchange=updateFixture;
$("fixtureProgress").onchange=updateFixture;
const bindDungeon=(id,key,convert=v=>v)=>{$(id).onchange=()=>{dungeonVisual[key]=convert($(id).value);start();};};
const rankSelect=$("dungeonArenaRank");
for(let i=1;i<=10;i++){const o=document.createElement("option");o.value=String(i);o.textContent="第 "+i+" 階";rankSelect.append(o);}
for(let i=0;i<=20;i++){const o=document.createElement("option");o.value=String(i);o.textContent=i+" 勝";$("dungeonMirrorWins").append(o);}
for(const floor of [0,1,10,50,100,250,500,1000,2000,5000]){const o=document.createElement("option");o.value=String(floor);o.textContent=floor===0?"尚未通關":("第 "+floor+" 層");$("dungeonVoidFloor").append(o);}
bindDungeon("dungeonArenaRank","arenaRank",Number);
bindDungeon("dungeonArenaPosition","arenaPosition");
bindDungeon("dungeonHigherMode","higherMode");
bindDungeon("dungeonHigherStage","higherStage",Number);
bindDungeon("dungeonBountyTier","bountyTier");
bindDungeon("dungeonMirrorWins","mirrorWins",Number);
bindDungeon("dungeonVoidFloor","voidFloor",Number);
$("alternateSegment").onchange=()=>{alternateSelection.segment=clamp($("alternateSegment").value,1,20);alternateSelection.universe=(alternateSelection.segment-1)*10+1;fillAlternateSelectors();start();};
$("alternateUniverse").onchange=()=>{alternateSelection.universe=clamp($("alternateUniverse").value,1,200);alternateSelection.segment=Math.ceil(alternateSelection.universe/10);fillAlternateSelectors();start();};
$("alternateDepth").onchange=()=>{alternateSelection.depth=clamp($("alternateDepth").value,1,5);start();};
$("alternateCulture").onchange=()=>{
 const culture=$("alternateCulture").value,number=(window.ALTERNATE_UNIVERSE_NAME_CULTURES||[]).findIndex(v=>v===culture)+1;
 if(number>0){alternateSelection.universe=number;alternateSelection.segment=Math.ceil(number/10);fillAlternateSelectors();start();}
};
$("alternateCultureUniverse").onchange=()=>{
 const number=clamp($("alternateCultureUniverse").value,1,200);
 alternateSelection.universe=number;alternateSelection.segment=Math.ceil(number/10);fillAlternateSelectors();start();
};
function jumpAlternate(universeDelta,depthDelta){
 alternateSelection.universe=clamp(alternateSelection.universe+universeDelta,1,200);
 alternateSelection.segment=Math.ceil(alternateSelection.universe/10);
 alternateSelection.depth=clamp(alternateSelection.depth+depthDelta,1,5);
 fillAlternateSelectors();start();
}
$("alternateUniversePrev").onclick=()=>jumpAlternate(-1,0);
$("alternateUniverseNext").onclick=()=>jumpAlternate(1,0);
$("alternateDepthPrev").onclick=()=>jumpAlternate(0,-1);
$("alternateDepthNext").onclick=()=>jumpAlternate(0,1);
search.oninput=renderCases;
toggle.onclick=()=>{disabled=!disabled;toggle.textContent=disabled?"啟用預覽":"停用預覽";start();};
$("restart").onclick=()=>{disabled=false;toggle.textContent="停用預覽";start();};
quality.onchange=()=>start();
window.addEventListener("pagehide",()=>{setMaximized(false);safeStop();});
window.addEventListener("keydown",event=>{
 if(event.key==="Escape"&&maximized){event.preventDefault();event.stopImmediatePropagation();setMaximized(false);return;}
 if(embedded&&event.key==="Escape"){event.preventDefault();try{window.parent?.postMessage({type:"civilization3d:close"},location.origin);}catch(_){}}
});
window.Civilization3DTestCenter=Object.freeze({version:6,caseIds:cases.map(c=>c.id),categoryIds:categories.map(c=>c[0]),getCurrent:()=>selected,getFixture:()=>({...snapshot,equipmentCatalogCounts:equipmentCatalog?{galaxy:equipmentCatalog[1]?.reduce((n,g)=>n+g.entries.length,0),universe:equipmentCatalog[2]?.reduce((n,g)=>n+g.entries.length,0),higher:equipmentCatalog[3]?.[0]?.entries?.length}:null,selectedEquipmentNames:activeEquipmentSet()?.names||null,appearanceMode,formalAppearanceReady:!!formalAppearance,scenarioMode,formalReady:!!formalScenario,alternateScenarioState,calamitySimulation:sceneCalamityStates(calWorld()),dungeonVisual:{...dungeonVisual},alternateSegment:alternateSelection.segment,alternateUniverse:alternateSelection.universe,alternateDepth:alternateSelection.depth}),isMaximized:()=>maximized});
renderCategories();renderCases();renderInfo();
(async()=>{
 try{
  start();
  if(embedded)requestAppearance();
 }catch(error){fail(error.message);}
})();
})();
