(function(){
 const sections={manage:[],test:[]};
 const MANAGE_SECTION_ORDER=["gm-data-management","gm-background-battle","gm-mainline-hp-lock","gm-combat-speed","general-manage","vip-manage","spec-manage","enhancement-manage","marks-manage","civilization-manage","dungeon-manage"];
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

 function buildVipUnboundedIntegrity(){
  const errors=[];
  const check=(ok,code,data=null)=>{if(!ok)errors.push({code,data});};
  check(Number(window.VIP_PROGRESSION_VERSION)===14,"VIP_PROGRESSION_VERSION",window.VIP_PROGRESSION_VERSION);
  check(Number(window.VIP_UNBOUNDED_LEVEL_VERSION)===1,"VIP_UNBOUNDED_LEVEL_VERSION",window.VIP_UNBOUNDED_LEVEL_VERSION);
  check(Number(window.VIP_PERK_MAX_LEVEL)===20,"VIP_PERK_MAX_LEVEL",window.VIP_PERK_MAX_LEVEL);
  check(Number(window.VIP_UI_VERSION)===2,"VIP_UI_VERSION",window.VIP_UI_VERSION);
  check(Number(window.GM_UNBOUNDED_VIP_TEST_VERSION)===1,"GM_UNBOUNDED_VIP_TEST_VERSION",window.GM_UNBOUNDED_VIP_TEST_VERSION);
  try{
   check(vipThreshold(21)===441000,"VIP_THRESHOLD_21",vipThreshold(21));
   check(vipThreshold(50)===2500000,"VIP_THRESHOLD_50",vipThreshold(50));
   check(vipLevelFromPoints(441000)===21,"VIP_LEVEL_21",vipLevelFromPoints(441000));
   check(vipLevelFromPoints(2500000)===50,"VIP_LEVEL_50",vipLevelFromPoints(2500000));
   const b=vipBonusStats(50);
   check(b.level===50&&b.hp===25&&b.atk===25&&b.def===12.5&&b.crit===12.5&&b.dodge===12.5,"VIP_BONUS_50",b);
   const probe={vipPoints:490000,vipLevel:0};normalizeVipState(probe);
   check(probe.vipLevel===22&&probe.vipPoints===490000,"VIP_NORMALIZE_490K",probe);
   const old=window.gmTestVipLevel;const tested=window.gmSetTestVipLevel(50,false);window.gmSetTestVipLevel(old,false);
   check(tested===50,"GM_TEST_VIP_50",tested);
   const guide=window.gameGuideCategoriesForState?.().flatMap(x=>x.items||[]).find(x=>x?.[0]==="VIP 系統")?.[1]||"";
   check(guide.includes("沒有上限")&&!guide.includes("最高 VIP20"),"VIP_GUIDE_COPY",guide);
   check(typeof window.gmVipManagementHtml==="function"&&window.gmVipManagementHtml().includes("指定 VIP 積分"),"VIP_GM_MANAGEMENT");
  }catch(error){errors.push({code:"VIP_PROBE_EXCEPTION",data:String(error?.message||error)});}
  return {version:1,passed:errors.length===0,errors,checkedAt:Date.now()};
 }
 window.VIP_UNBOUNDED_INTEGRITY_VERSION=1;
 window.VIP_UNBOUNDED_INTEGRITY_REPORT=buildVipUnboundedIntegrity();

 window.GM_HUB_MANAGE_ORDER=MANAGE_SECTION_ORDER.slice();
 window.GM_HUB_TEST_ORDER=TEST_SECTION_ORDER.slice();
 window.GM_HUB_EXTENSION_VERSION=13;
 window.GM_HUB_REGISTRY_VERSION=1;
 window.GM_HUB_SECTION_RENDERER_REPLACE_VERSION=1;
 window.GM_POWER_BENCHMARK_GROUP_REGISTRY_VERSION=2;
})();