(function(){
 const sections={manage:[],test:[]};
 const MANAGE_SECTION_ORDER=["gm-data-management","gm-background-battle","gm-combat-speed","general-manage","spec-manage","enhancement-manage","marks-manage","civilization-manage","dungeon-manage"];
 const TEST_SECTION_ORDER=["player-ability-test","second-world-calamity-test","power-benchmark-test","map-test","special-test","bounty-test","arena-test","void-test","mirror-test","calamity-test","player-title-preview","gm-story-test"];

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

 function abilityTestSubsection(title,renderer){
  let body="";
  try{body=typeof renderer==="function"?String(renderer()||""):'<div class="muted gm-hub-note">測試模組尚未載入。</div>';}
  catch(err){console.error("GM ability test subsection renderer failed",err);body='<div class="muted gm-hub-note">測試模組載入失敗。</div>';}
  return `<details class="gm-ability-test-sub"><summary>${title}</summary><div class="gm-ability-test-sub-body">${body}</div></details>`;
 }
 window.gmPlayerAbilityTestHtml=function(){
  const status=typeof window.gmTestCurrentStatusHtml==="function"?window.gmTestCurrentStatusHtml():"";
  return `${status}<div class="gm-ability-test-stack">${abilityTestSubsection("VIP 測試",window.gmTestVipControlHtml)}${abilityTestSubsection("專精測試",window.gmSpecializationTestHtml)}${abilityTestSubsection("強化測試",window.gmEnhancementTestHtml)}${abilityTestSubsection("印記測試",window.gmMarkTestHtml)}${abilityTestSubsection("文明等級測試",window.gmCivilizationTestHtml)}</div>`;
 };
 window.GM_PLAYER_ABILITY_TEST_GROUP_VERSION=1;

 function registerNativeSections(){
  const registrations=[
   ["manage","角色管理",window.gmGeneralManagementHtml,{id:"general-manage"}],
   ["manage","專精管理",window.gmSpecializationManagementHtml,{id:"spec-manage"}],
   ["manage","強化管理",window.gmEnhancementManagementHtml,{id:"enhancement-manage"}],
   ["manage","文明等級管理",window.gmCivilizationManagementHtml,{id:"civilization-manage"}],
   ["manage","副本管理",window.gmDungeonManagementHtml,{id:"dungeon-manage"}],
   ["test","角色能力測試",window.gmPlayerAbilityTestHtml,{id:"player-ability-test"}],
   ["test","地圖怪測試",window.gmMapMonsterTestHtml,{id:"map-test"}],
   ["test","特殊怪測試",window.gmSpecialTestHtml,{id:"special-test"}],
   ["test","懸賞戰測試",window.gmBountyTestHtml,{id:"bounty-test"}],
   ["test","競技場測試",window.gmArenaTestHtml,{id:"arena-test"}],
   ["test","虛空幻境測試",window.gmVoidMirageTestHtml,{id:"void-test"}]
  ];
  registrations.forEach(args=>window.registerGmHubSection(...args));
 }
 registerNativeSections();

 window.GM_HUB_MANAGE_ORDER=MANAGE_SECTION_ORDER.slice();
 window.GM_HUB_TEST_ORDER=TEST_SECTION_ORDER.slice();
 window.GM_HUB_EXTENSION_VERSION=9;
 window.GM_HUB_REGISTRY_VERSION=1;
})();