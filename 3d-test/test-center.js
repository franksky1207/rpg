/* GM 3D Test Center v1: session-only fixture selection; no game state/save access. */
(function(){
"use strict";
/* Internal IDs retained for automated checks; user menu contains visual scenes only. */
const categories=[
["home","主畫面與紀元場景"],["map","冒險與宇宙地圖"],["character","玩家、裝備與養成"],
["combat","戰鬥、動畫與特效"],["dungeon","副本與競技場"],["frontier","文明災厄與異宇宙"],["chronicle","文明紀錄與轉生"],["service","設定與管理"]];
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
{id:"C-11-CORE",cat:"character",title:"界弦核心",kind:"core",detail:"高維核心的十階立體能量結構。"},
{id:"C-12-DUNGEON",cat:"dungeon",title:"副本作戰中心",kind:"dungeon-hub",detail:"副本總覽的立體作戰中心與入口。"},
{id:"C-12-BOUNTY",cat:"dungeon",title:"懸賞戰準備區",kind:"dungeon-bounty",detail:"銀河與宇宙的懸賞任務立體部署台。"},
{id:"C-12-ARENA",cat:"dungeon",title:"競技場",kind:"dungeon-arena",detail:"銀河／宇宙競技場與高維定相、異相競技場；依紀元切換。"},
{id:"C-13-MIRROR",cat:"dungeon",title:"鏡像戰紀錄",kind:"advanced-mirror",detail:"觀察鏡像戰的紀錄與立體映照。"},
{id:"C-13-VOID",cat:"dungeon",title:"虛空幻境樓層",kind:"advanced-void",detail:"立體展示虛空幻境的樓層攀升。"},
{id:"C-14-GALAXY-CALAMITY",cat:"frontier",title:"銀河文明災厄封印",kind:"frontier-galaxy",detail:"銀河十道災厄封印的立體排列。"},
{id:"C-14-UNIVERSE-CALAMITY",cat:"frontier",title:"宇宙文明災厄封印",kind:"frontier-universe",detail:"宇宙十大文明災厄封印的立體排列。"},
{id:"C-14-ALTERNATE",cat:"frontier",title:"異宇宙前線",kind:"frontier-alternate",detail:"異宇宙層域進度的立體前線。"},
{id:"C-15-BATTLE",cat:"combat",title:"戰場與生命顯示",kind:"battle-battle",detail:"角色與敵人的立體戰場及生命狀態。"},
{id:"C-15-SHIELD",cat:"combat",title:"護盾防護演出",kind:"battle-shield",detail:"立體防護盾與生命顯示的視覺效果。"},
{id:"C-15-ENCOUNTER",cat:"combat",title:"特殊遭遇演出",kind:"battle-encounter",detail:"特殊敵人的立體警示演出。"},
{id:"C-15-SETTLEMENT",cat:"combat",title:"結算與戰利品",kind:"battle-settlement",detail:"戰鬥結束後的立體戰利品視覺。"},
{id:"C-16-CHRONICLE",cat:"chronicle",title:"文明戰線紀錄",kind:"chronicle-record",detail:"展示三紀元歷史紀錄的立體視覺，不變更回顧進度。"},
{id:"C-16-STORY",cat:"chronicle",title:"文明劇情閱讀",kind:"chronicle-story",detail:"劇情文字與立體歷史書頁的視覺組合，劇情播放仍由正式介面處理。"},
{id:"C-16-REINCARNATION",cat:"chronicle",title:"文明轉生",kind:"chronicle-reincarnation",detail:"文明輪迴立體象徵，正式轉生條件、確認及不可逆交易不受影響。"},
{id:"C-17-SETTINGS",cat:"service",title:"設定中心",kind:"service-settings",detail:"設定介面的立體控制台；原設定項目仍由正式頁面操作。"},
{id:"C-17-GUIDE",cat:"service",title:"遊戲說明",kind:"service-guide",detail:"說明頁面的立體視覺；玩法文字與規則仍以正式內容為準。"},
{id:"C-17-ACCOUNT",cat:"service",title:"帳號中心",kind:"service-account",detail:"帳號立體視覺展示；不執行登入登出。"},
{id:"C-17-CLOUD",cat:"service",title:"雲端存檔中心",kind:"service-cloud",detail:"雲端存檔立體視覺；不執行資料上傳或下載。"},
{id:"C-17-GM",cat:"service",title:"GM 管理中心",kind:"service-gm",detail:"管理中心的立體視覺，不執行管理或資料修改。"} 
];
const $=id=>document.getElementById(id);
const host=$("prototypeHost"),status=$("status"),fallback=$("fallback"),fallbackReason=$("fallbackReason");
const quality=$("quality"),toggle=$("toggle"),caseList=$("caseList"),categoryList=$("categoryList"),search=$("caseSearch");

let runtime=null,serial=0,disabled=false,selected="B-03-HOME",category="ALL";
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
 if(!embedded||event.source!==window.parent||event.origin!==location.origin||event.data?.type!=="civilization3d:scenario-response")return;
 const data=event.data.snapshot;if(!data||!Array.isArray(data.calamities?.[1])||!Array.isArray(data.calamities?.[2]))return;
 formalScenario=data;renderInfo();if(scenarioMode==="formal"&&scenarioKinds.has(entry().kind))start();
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
 const effectiveWorld=scenarioMode==="formal"&&formalScenario?.dungeon?.arena&&entry().kind==="dungeon-arena"?Number(formalScenario.dungeon.arena.world):Number(snapshot.world);
 const factory=c.kind==="dungeon-arena"&&effectiveWorld===3?B.createDungeonAdvancedScene:c.kind.startsWith("service-")?B.createServiceConsoleScene:c.kind.startsWith("chronicle-")?B.createChronicleTransitionScene:c.kind.startsWith("battle-")?B.createBattlePresentationScene:c.kind.startsWith("frontier-")?B.createFrontierScene:c.kind.startsWith("advanced-")?B.createDungeonAdvancedScene:c.kind.startsWith("dungeon-")?B.createDungeonScene:["specialization","marks","civilization","core"].includes(c.kind)?B.createGrowthScene:c.kind==="forge"?B.createForgeScene:c.kind==="equipment"?B.createEquipmentScene:c.kind==="character"?B.createCharacterScene:c.kind==="higher"?B.createHigherDimensionalScene:c.kind==="universe"?B.createUniverseScene:c.kind==="galaxy"?B.createGalaxyScene:c.kind==="epoch"?B.createEpochScene:B.createScene;
 if(typeof factory!=="function"){fail("此場景尚未實作。");return;}
 fallback.hidden=true;host.hidden=false;
 runtime=window.Civilization3DRuntime.create({host,onClose:()=>{disabled=true;toggle.textContent="啟用 3D";start();},onFallback:reason=>fail("3D 場景失敗："+reason),onContextRestored:()=>{status.hidden=false;status.textContent="WebGL 已復原，可按重新啟動。";}});
 runtime.setQuality(quality.value);
 const progress=Math.max(1,Math.min(10,Number(snapshot.regionProgress)||1));
 const activeVisual=appearanceMode==="formal"?formalAppearance:freeVisual();
 if(appearanceKinds.has(c.kind)&&!activeVisual){status.hidden=false;status.textContent=appearanceError?"正式角色外觀快照同步失敗："+appearanceError:"等待正式角色外觀快照…";return;}
 const growthKinds=["specialization","marks","civilization","core"];
 const growth= growthKinds.includes(c.kind)&&activeVisual?{
   growthKind:c.kind,
   growthLevels:c.kind==="specialization"?specKeys.map((key,i)=>Number(appearanceMode==="formal"?activeVisual.specializations?.[key]:freeAppearance.specializations[i])||0)
     :c.kind==="marks"?(appearanceMode==="formal"?Object.values(activeVisual.markLevels||{}):freeAppearance.markLevels).slice(0,10).map(v=>Number(v)||0):[],
   growthLevel:Number(c.kind==="civilization"?activeVisual.civilizationLevel:activeVisual.coreLevel)||0
 }:{};
 const calamityFixture=(c.kind==="frontier-galaxy"||c.kind==="frontier-universe")?{
    calamitySeals:sceneCalamityStates(c.kind==="frontier-universe"?2:1)
  }:{};
  const dungeonOverrides=c.kind==="dungeon-arena"&&Number(snapshot.world)===3
   ?{advancedKind:"higher-arena",advancedStage:dungeonVisual.higherStage,advancedProgress:dungeonVisual.higherStage+1,higherArenaMode:dungeonVisual.higherMode,advancedUnlocked:true}
   :c.kind==="dungeon-arena"
   ?{dungeonKind:"arena",dungeonRank:dungeonVisual.arenaRank,dungeonPosition:dungeonVisual.arenaPosition,dungeonPhase:"select",dungeonRemaining:20,dungeonUnlocked:true}
   :c.kind==="dungeon-bounty"
   ?{dungeonKind:"bounty",dungeonTier:dungeonVisual.bountyTier,dungeonPhase:"ready",dungeonRemaining:20,dungeonUnlocked:true}
   :c.kind==="advanced-mirror"
   ?{advancedKind:"mirror",advancedProgress:dungeonVisual.mirrorWins,advancedUnlocked:true}
   :c.kind==="advanced-void"
   ?{advancedKind:"void",advancedProgress:dungeonVisual.voidFloor,advancedUnlocked:true}
   :null;
  const visual=dungeonOverrides || (c.kind.startsWith("service-")?{kind:c.kind.slice(8),visualOnly:true}:c.kind.startsWith("chronicle-")?{kind:c.kind.slice(10),visualOnly:true}:c.kind.startsWith("battle-")?{battleVisualKind:c.kind.slice(7),playerHpRatio:.85,enemyHpRatio:.55,shieldRatio:c.kind==="battle-shield"?1:0}:c.kind.startsWith("frontier-")?{frontierKind:c.kind==="frontier-alternate"?"alternate":"calamity",frontierProgress:c.kind==="frontier-alternate"?(alternateSelection.universe-1)*5+alternateSelection.depth-1:Number(snapshot.regionProgress),alternateSegment:alternateSelection.segment,alternateUniverse:alternateSelection.universe,alternateDepth:alternateSelection.depth,world:c.kind==="frontier-galaxy"?1:c.kind==="frontier-universe"?2:3}:c.kind.startsWith("advanced-")?{advancedKind:c.kind.slice(9),advancedStage:Math.min(2,Math.floor((Number(snapshot.regionProgress)-1)/3)),advancedProgress:c.kind==="advanced-void"?(Number(snapshot.regionProgress)-1)*100:c.kind==="advanced-mirror"?(Number(snapshot.regionProgress)-1)*2:0,advancedUnlocked:true}:c.kind.startsWith("dungeon-")?{dungeonKind:c.kind.slice(8),dungeonPhase:"select",dungeonRemaining:20,dungeonUnlocked:true,dungeonAvailableModes:[true,true,true,true],dungeonVisibleModes:c.kind==="dungeon-hub"&&Number(snapshot.world)===3?["arena","tower","mirror"]:["bounty","arena","tower","mirror"]}:growthKinds.includes(c.kind)?growth:appearanceKinds.has(c.kind)?visualScene(c.kind,activeVisual):{});
 const fixture=Object.freeze(c.kind==="frontier-alternate"?{world:3,universeCount:200,sectorCount:20,depthsPerUniverse:5,selectedUniverse:alternateSelection.universe,selectedDepth:alternateSelection.depth,review:false}:{world:Number(snapshot.world),mapCount:10,selectedMap:Number(snapshot.selectedMap),unlockedRegions:Array.from({length:10},(_,i)=>i<progress),completedRegions:Array.from({length:10},(_,i)=>i<progress-1),enemyCount:5,defeatedBosses:Array.from({length:100},(_,i)=>i<(progress-1)*10),highestUnlockedBossIndex:progress*10-1,clearedBossCount:(progress-1)*10,review:false});
 const scenarioKey=c.kind==="frontier-alternate"?"alternate":c.kind;
 const dungeonSceneKey={"dungeon-hub":"hub","dungeon-bounty":"bounty","dungeon-arena":"arena","advanced-mirror":"mirror","advanced-void":"void"}[c.kind];
 let scenarioArgs={};
 if(c.kind==="frontier-alternate"&&scenarioMode==="free")scenarioArgs={alternateLocked:alternateScenarioState==="locked",alternateActive:alternateScenarioState==="active",alternateCompleted:alternateScenarioState==="completed"};
 if(scenarioKinds.has(c.kind)&&scenarioMode==="formal"){
   if(!formalScenario){status.textContent="等待正式資料同步；不以模擬資料冒充正式狀態。";requestScenario();return;}
   if(c.kind.startsWith("battle-")){
     if(formalScenario.battle?.battleAvailable!==true){status.textContent="目前沒有進行中的正式戰鬥快照；請切回自由測試查看視覺效果。";return;}
     scenarioArgs={...formalScenario.battle};
   }else if(dungeonSceneKey){
     if(c.kind==="dungeon-bounty"&&Number(formalScenario.dungeon?.bounty?.world)===3){status.textContent="高維紀元沒有懸賞戰。";return;}
     if(!formalScenario.dungeon?.[dungeonSceneKey]){status.textContent="此副本沒有可用的正式資料快照。";return;}
     scenarioArgs={...formalScenario.dungeon[dungeonSceneKey]};
   }else if(c.kind==="frontier-galaxy"||c.kind==="frontier-universe"){
     const w=c.kind==="frontier-universe"?2:1,rows=formalScenario.calamities[w];
     scenarioArgs={world:w,frontierKind:"calamity",calamitySeals:rows,frontierProgress:rows.filter(x=>x.completed).length};
   }else scenarioArgs=formalScenario[scenarioKey]||{};
 }
 const current=runtime;
 const result=await current.show(c.id,args=>factory({...args,...fixture,...visual,...calamityFixture,...(c.kind==="higher"?{presences:Array.from({length:10},(_,i)=>({defeated:i<progress-1,available:true,remainingPercent:i===progress-1?50:100})),selectedPresence:Math.min(9,progress-1)}:{}),...scenarioArgs}));
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
window.Civilization3DTestCenter=Object.freeze({version:5,caseIds:cases.map(c=>c.id),categoryIds:categories.map(c=>c[0]),getCurrent:()=>selected,getFixture:()=>({...snapshot,equipmentCatalogCounts:equipmentCatalog?{galaxy:equipmentCatalog[1]?.reduce((n,g)=>n+g.entries.length,0),universe:equipmentCatalog[2]?.reduce((n,g)=>n+g.entries.length,0),higher:equipmentCatalog[3]?.[0]?.entries?.length}:null,selectedEquipmentNames:activeEquipmentSet()?.names||null,appearanceMode,formalAppearanceReady:!!formalAppearance,scenarioMode,formalReady:!!formalScenario,alternateScenarioState,calamitySimulation:sceneCalamityStates(calWorld()),dungeonVisual:{...dungeonVisual},alternateSegment:alternateSelection.segment,alternateUniverse:alternateSelection.universe,alternateDepth:alternateSelection.depth}),isMaximized:()=>maximized});
renderCategories();renderCases();renderInfo();
async function versionedSceneUrls(){
 try{
  const response=await fetch("../resource-manifest.json",{cache:"no-store",credentials:"same-origin"});
  if(!response.ok)throw new Error("version-file-unavailable");
  const manifest=await response.json();
  if(manifest?.schema!==1||!manifest.files)throw new Error("invalid-version-file");
  const version=(path,url)=>{
   const digest=manifest.files[path];
   if(!/^[a-f0-9]{24}$/.test(String(digest||"")))throw new Error("missing-version");
   return url+(url.includes("?")?"&":"?")+"asset="+digest;
  };
  return [
   version("vendor/babylonjs/7.54.3/babylon.js","../vendor/babylonjs/7.54.3/babylon.js"),
   version("3d-test/runtime.js","./runtime.js"),
   version("3d-test/prototype-engine.js","./prototype-engine.js"),
   version("3d-test/appearance-snapshot.js","./appearance-snapshot.js")
  ];
 }catch(_){
  return ["../vendor/babylonjs/7.54.3/babylon.js","./runtime.js?v=20261009-camera-center-v1","./prototype-engine.js?v=20261010-3d-b17b-services","./appearance-snapshot.js?v=20261010-opt4-shared-appearance"];
 }
}
(async()=>{
 try{
  const [engineUrl,runtimeUrl,sceneUrl,appearanceUrl]=await versionedSceneUrls();
  await Promise.all([
    window.BABYLON?.Engine?Promise.resolve():script(engineUrl),
    window.Civilization3DRuntime?.create?Promise.resolve():script(runtimeUrl),
    window.Civilization3DPrototype?.createBattlePresentationScene?Promise.resolve():script(sceneUrl),
    window.Civilization3DAppearance?.scene?Promise.resolve():script(appearanceUrl)
  ]);
  if(!window.BABYLON?.Engine||!window.Civilization3DRuntime?.create||!window.Civilization3DPrototype?.createChronicleTransitionScene)throw new Error("3D 模組載入不完整。");
  start();
  if(embedded)requestAppearance();
 }catch(error){fail(error.message);}
})();
})();
