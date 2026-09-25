(function(){
 const sections={manage:[],test:[]};
 const MANAGE_SECTION_ORDER=["gm-data-management","gm-background-battle","gm-combat-speed","general-manage","vip-manage","spec-manage","enhancement-manage","marks-manage","civilization-manage","dungeon-manage"];
 const TEST_SECTION_ORDER=["player-ability-test","power-benchmark-test","player-title-preview","gm-story-test"];

 function sectionHtml(entry){
  let body="";
  try{body=String(entry.renderer()||"");}
  catch(err){console.error("GM hub section renderer failed",err);body='<div class="muted gm-hub-note">GM 模組載入失敗。</div>';}
  const open=typeof window.gmHubSectionIsOpen==="function"&&window.gmHubSectionIsOpen(entry.id);
  return `<details class="gm-hub-section" data-gm-section="${entry.id}" ${open?"open":""} ontoggle="gmHubSectionToggle('${entry.id}',this.open)"><summary>${entry.title}</summary><div class="gm-hub-body">${body}</div></details>`;
 }

 window.registerGmHubSection=function(mode,title,renderer,options={}){
  const key=mode==="test"?"test":"manage";
  if(typeof renderer!=="function")return false;
  const id=String(options?.id||`${key}-${title}`);
  if(sections[key].some(entry=>entry.id===id))return false;
  sections[key].push({id,title:String(title||"擴充"),renderer,registeredAt:sections[key].length});
  return true;
 };
 window.replaceGmHubSectionRenderer=function(mode,id,renderer,title=null){
  const key=mode==="test"?"test":"manage";
  if(typeof renderer!=="function")return false;
  const target=sections[key].find(entry=>entry.id===String(id||""));
  if(!target)return false;
  target.renderer=renderer;
  if(title!=null)target.title=String(title||target.title);
  return true;
 };

 function orderedEntries(mode){
  const key=mode==="test"?"test":"manage";
  const order=key==="test"?TEST_SECTION_ORDER:MANAGE_SECTION_ORDER;
  const rank=new Map(order.map((id,index)=>[id,index]));
  return sections[key].slice().sort((a,b)=>{
   const ar=rank.has(a.id)?rank.get(a.id):order.length+a.registeredAt;
   const br=rank.has(b.id)?rank.get(b.id):order.length+b.registeredAt;
   return ar-br;
  });
 }

 window.gmHubRegisteredSectionsHtml=function(mode){
  return orderedEntries(mode).map(sectionHtml).join("");
 };
 window.gmHubRegisteredSectionIds=function(mode){
  return orderedEntries(mode).map(entry=>entry.id);
 };

 function normalizeTestVip(value){return typeof window.normalizeVipLevel==="function"?window.normalizeVipLevel(value):Math.max(0,Math.floor(Number(value)||0));}
 function installUnlimitedVipTestOverrides(){
  const baseUseCurrent=typeof window.gmUseCurrentTestStatus==="function"?window.gmUseCurrentTestStatus:null;
  const baseRefresh=typeof window.gmRefreshTestControls==="function"?window.gmRefreshTestControls:null;
  window.gmSetTestVipLevel=function(value,refresh=true){
   window.gmTestVipLevel=normalizeTestVip(value);
   if(refresh&&typeof window.gmPowerBenchmarkInvalidateSnapshot==="function")window.gmPowerBenchmarkInvalidateSnapshot();
   if(refresh&&typeof window.gmRefreshTestControls==="function")window.gmRefreshTestControls();
   return window.gmTestVipLevel;
  };
  window.gmTestVipLabel=function(){const lv=normalizeTestVip(window.gmTestVipLevel),b=vipBonusStats(lv);return `VIP${lv}｜HP/ATK +${b.hp}%｜DEF +${b.def}%｜暴擊/閃避 +${b.crit}%`;};
  window.gmTestVipOptions=function(){return "";};
  window.gmTestVipControlHtml=function(){const lv=normalizeTestVip(window.gmTestVipLevel);return `<div class="muted gm-hub-note">設定本次工作階段使用的測試 VIP 等級；VIP 測試沒有上限，只影響 GM 測試，不修改正式角色 VIP。</div><div class="controls" style="align-items:end"><label>VIP<br><input id="gmTestVipLevel" class="btn" type="number" min="0" step="1" value="${lv}" onchange="gmSetTestVipLevel(this.value)" style="width:140px"></label><span id="gmTestVipInfo" class="muted">${gmTestVipLabel()}</span></div>`;};
  window.gmTestPlayerStats=function(baseStats=null){
   const equipment=baseStats||window.gmTestEnhancedEquippedStats();
   const combat=playerCombatStats(equipment,normalizeTestVip(window.gmTestVipLevel));
   return typeof createSpecialPlayerSnapshot==="function"?createSpecialPlayerSnapshot(combat):combat;
  };
  if(baseRefresh){
   window.gmRefreshTestControls=function(){
    const result=baseRefresh();
    const level=normalizeTestVip(window.gmTestVipLevel);
    const input=document.getElementById("gmTestVipLevel");if(input)input.value=String(level);
    const info=document.getElementById("gmTestVipInfo");if(info)info.textContent=window.gmTestVipLabel();
    return result;
   };
  }
  if(baseUseCurrent){
   window.gmUseCurrentTestStatus=function(){
    const result=baseUseCurrent();
    window.gmSetTestVipLevel(state?.vipLevel,false);
    if(typeof window.gmPowerBenchmarkInvalidateSnapshot==="function")window.gmPowerBenchmarkInvalidateSnapshot();
    if(typeof window.gmRefreshTestControls==="function")window.gmRefreshTestControls();
    if(typeof window.gmPowerBenchmarkRefreshUi==="function")window.gmPowerBenchmarkRefreshUi();
    if(result&&typeof result==="object")result.vip=normalizeTestVip(window.gmTestVipLevel);
    return result;
   };
  }
  window.GM_UNBOUNDED_VIP_TEST_VERSION=1;
 }
 installUnlimitedVipTestOverrides();

 function abilityTestSubsection(title,renderer){
  let body="";
  try{body=typeof renderer==="function"?String(renderer()||""):'<div class="muted gm-hub-note">測試模組尚未載入。</div>';}
  catch(err){console.error("GM ability test subsection renderer failed",err);body='<div class="muted gm-hub-note">測試模組載入失敗。</div>';}
  return `<details class="gm-ability-test-sub"><summary>${title}</summary><div class="gm-ability-test-sub-body">${body}</div></details>`;
 }
 window.gmPlayerAbilityTestHtml=function(){
  const status=typeof window.gmTestCurrentStatusHtml==="function"?window.gmTestCurrentStatusHtml():"";
  return `${status}<div class="gm-ability-test-stack">${abilityTestSubsection("角色基準",window.gmTestCharacterBaseHtml)}${abilityTestSubsection("VIP 測試",window.gmTestVipControlHtml)}${abilityTestSubsection("專精測試",window.gmSpecializationTestHtml)}${abilityTestSubsection("強化測試",window.gmEnhancementTestHtml)}${abilityTestSubsection("印記測試",window.gmMarkTestHtml)}${abilityTestSubsection("文明等級測試",window.gmCivilizationTestHtml)}</div>`;
 };
 window.GM_PLAYER_ABILITY_TEST_GROUP_VERSION=3;

 function registerNativeSections(){
  const registrations=[
   ["manage","角色管理",window.gmGeneralManagementHtml,{id:"general-manage"}],
   ["manage","VIP 管理",window.gmVipManagementHtml,{id:"vip-manage"}],
   ["manage","專精管理",window.gmSpecializationManagementHtml,{id:"spec-manage"}],
   ["manage","強化管理",window.gmEnhancementManagementHtml,{id:"enhancement-manage"}],
   ["manage","文明等級管理",window.gmCivilizationManagementHtml,{id:"civilization-manage"}],
   ["manage","副本管理",window.gmDungeonManagementHtml,{id:"dungeon-manage"}],
   ["test","角色能力測試",window.gmPlayerAbilityTestHtml,{id:"player-ability-test"}],
  ];
  registrations.forEach(args=>window.registerGmHubSection(...args));
 }
 registerNativeSections();

 window.GM_HUB_MANAGE_ORDER=MANAGE_SECTION_ORDER.slice();
 window.GM_HUB_TEST_ORDER=TEST_SECTION_ORDER.slice();
 window.GM_HUB_EXTENSION_VERSION=12;
 window.GM_HUB_REGISTRY_VERSION=1;
 window.GM_HUB_SECTION_RENDERER_REPLACE_VERSION=1;
 window.GM_POWER_BENCHMARK_GROUP_REGISTRY_VERSION=2;
})();