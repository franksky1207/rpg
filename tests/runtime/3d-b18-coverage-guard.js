/* A1/B18: deterministic coverage guard. No credentials, saves or network. */
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"../..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const index=read("index.html");
const ui=read("ui.js");
const bridge=read("3d-test/formal-home.js");
const engine=read("3d-test/prototype-engine.js");
const policy=read("3d-test/mode-foundation.js");
const gmIndex=read("3d-test/index.html");
function assertSingleEntryVersion(html,scriptPath){
 const tag=html.split("\n").filter(line=>line.includes('src="'+scriptPath+'?'));
 assert.equal(tag.length,1,"Expected exactly one versioned script: "+scriptPath);
 const match=tag[0].match(new RegExp('src="'+scriptPath.replace(/[.*+?^${}()|[\]\\]/g,"\\const policy=read("3d-test/mode-foundation.js");")+'\\?v=([^"&]+)"'));
 assert.ok(match,"Missing cache-bust token for "+scriptPath);
 return match[1];
}
const formalEntryVersion=assertSingleEntryVersion(index,"3d-test/formal-home.js");
const gmEntryVersion=assertSingleEntryVersion(gmIndex,"./test-center.js");
assert.equal(formalEntryVersion,gmEntryVersion,"Formal and GM entrypoint cache versions must be synchronized");
const story=read("storyui.js");
const css=read("story.css");
for(const file of ["ui.js","storyui.js","3d-test/formal-home.js","3d-test/mode-foundation.js","3d-test/prototype-engine.js","3d-test/runtime.js","3d-test/test-center.js"]){
 new Function(read(file));
}
for(const route of ["home","adventure","storyrecord","character","enhancement","specialization","inventory","calamity","guide","settings"]){
 assert.match(ui,new RegExp(route+":", "m"),"Missing owner route "+route);
}
for(const title of ["ensureGalaxyReviewControl","ensureUniverseControl","ensureHigherControl","ensureCharacterControl","ensureInventoryControl","ensureForgeControl","ensureGrowthPageControls","ensureDungeonControl","ensureAdvancedDungeonControl","ensureFrontierControl","ensureBattlePreviewControl","ensureChronicleControls","ensureServiceControl"]){
 assert.ok(bridge.includes("function "+title+"("),"Missing formal bridge "+title);
}
for(const type of ["settings","guide","account","cloud","gm"]){
 assert.ok(engine.includes('kind==="'+type+'"')||engine.includes(type+":"),"Missing service visual "+type);
}
assert.ok(bridge.includes("gmRuntimeAuthorizationAuthorized"),"GM preview needs runtime authorization");
const alternateUi=read("alternateuniverseui.js");
const gmCenter=read("3d-test/test-center.js");
assert.ok(ui.includes("civilizationRequestHomeEntryReconcile"),"Late home entry reconciliation must have one owner");
assert.ok(alternateUi.includes("civilizationRequestHomeEntryReconcile")&&!alternateUi.includes("function reconcileInitialHome("),"Alternate universe must delegate startup reconciliation");
assert.ok(gmCenter.includes("Civilization3DAppearance.scene(kind,a)"),"Formal GM appearance must reuse production scene adapter");
assert.ok(gmCenter.includes('"3d-test/appearance-snapshot.js","./appearance-snapshot.js"'),"GM must load shared appearance adapter with resource manifest");
assert.ok(gmCenter.includes('return entries.map(([path,url],i)=>'),"GM must fall back per missing digest, not revert the entire resource set");
assert.ok(gmCenter.includes('typeof digest==="string"&&/^[a-f0-9]{24}$/.test(digest)'),"GM manifest digests must be validated");
assert.ok(gmCenter.includes('20261010-dual-mode-preflight3'),"GM and formal appearance fallbacks must match");
assert.ok(engine.includes("function visualMaterial("),"3D material construction must expose a shared helper");
for(const api of ["function mount(","function createScene(","function createEpochScene("]){
 assert.ok(engine.includes(api),"Legacy 3D entrypoint preserved until consumer audit: "+api);
}
for(const api of ["supported,mount,createScene,createEpochScene","createBattlePresentationScene","createChronicleTransitionScene"]){
 assert.ok(engine.includes(api),"Legacy export compatibility missing: "+api);
}
for(const helper of ["function sceneMaterial(","function sceneFillLight(","function applyCameraLimits("])assert.ok(engine.includes(helper),"Opt4 shared scene helper missing: "+helper);

const loader=read("scriptgrouploader.js");
assert.ok(loader.includes("const groupProgress=new Map()"),"GM group must keep live progress for joiners");
assert.ok(loader.includes("entry.listeners.add(onProgress)"),"Joined callers must receive current GM load progress");
for(const file of ["3d-test/prototype-engine.js","3d-test/runtime.js","3d-test/appearance-snapshot.js"]){
 assert.ok(bridge.includes('version("'+file+'"'),"Preview asset must use deployed manifest version: "+file);
}
assert.ok(bridge.includes("resourceVersionPromise=null;throw error"),"Failed preview load must allow resource version refresh");
assert.ok(bridge.includes("allSources.slice(0,2)"),"GM pre-warm must not eagerly load all 3D modules");

assert.ok(bridge.includes("function uniqueControls("),"All formal preview groups must share an idempotent guard");
assert.ok(bridge.includes("function syncAllPreviewButtons("),"All preview buttons must share state synchronization");
assert.ok(bridge.includes("activeHost&&!activeHost.isConnected"),"Detached scene hosts must be disposed on route rerender");
assert.ok(bridge.includes("ticket!==epoch||!enabled||!h.isConnected"),"Stale async previews must not attach to detached hosts");
assert.ok(bridge.includes("activeControl=null;activeHost=null;"),"Preview teardown must clear active control and host");
assert.ok(bridge.includes("existing.slice(1).forEach(node=>node.remove())"),"Late service mounts must deduplicate existing controls");
assert.ok(bridge.includes('[data-service3d-preview="')&&bridge.includes('control.setAttribute("data-service3d-preview",kind)'),"Service preview DOM attribute and deduplication selector must match");
assert.ok(bridge.includes('document.getElementById("civilization3dCharacterToggle")'),"No duplicate character preview");
assert.ok(bridge.includes('if(view==="dungeon-void-mirage")return;'),"No extra void settlement button");
assert.ok(story.includes('<div class="story-content"><div id="storyBody"'),"Story content and 3D must share grid track");
assert.ok(css.includes(".story-content{min-height:0"),"Story footer regression guard");
assert.ok(policy.includes("FULL_3D_AVAILABLE=false"),"Unfinished 3D must stay gated");
assert.ok(policy.includes("PREFIX+id"),"Mode preference must be account-scoped");
assert.ok(policy.includes("function parsePreference(raw)"),"Legacy mode preference compatibility must be preserved");
assert.ok(policy.includes("if(id!==accountId)closeSelector()"),"Mode selector must clear the previous account overlay");
assert.ok(policy.includes("if(userId()!==id)"),"Stale mode selector must not write another account preference");
assert.ok(policy.includes('existing==="3d"&&!FULL_3D_AVAILABLE'),"Unreleased old 3D preference must safely fall back to text");
assert.ok(policy.includes("registerSwitchBlocker")&&policy.includes("unregisterSwitchBlocker"),"Future pending-operation owners need a safe switching gate");
assert.ok(policy.includes("civilization-auth-signed-out"),"Mode must react to signout");
assert.ok(index.includes("3d-test/mode-foundation.js?"),"Mode policy loaded");
assert.ok(index.includes("3d-test/formal-home.js?"),"Visual bridge loaded");
assert.ok(!index.includes('<script src="3d-test/runtime.js')&&!index.includes('<script src="3d-test/appearance-snapshot.js'),"3D runtime cannot boot synchronously in text mode");
{
 const gm=read("3d-test/test-center.js"),bridge=read("gm3dprototype.js");
 const regionFiles=["earth","solar","nearstar","frontier","orion","galactic-frontier","galactic-mid","core-outer","core-war","galactic-unification"];
 let galacticNames=[];
 for(const region of regionFiles){
  const source=read("worldmaps-"+region+".js");
  const rows=[...source.matchAll(/\{chapter:"([^"]+)",name:"([^"]+)",min:(\d+),max:(\d+),gear:\[([^\]]+)\]/g)];
  assert.equal(rows.length,10,"Galaxy must expose ten named subregions: "+region);
  for(const row of rows){
   const names=[...row[5].matchAll(/"([^"]+)"/g)].map(x=>x[1]);
   assert.equal(names.length,5,"Galaxy set must have five named slots: "+row[2]);
   galacticNames.push(...names);
  }
 }
 assert.equal(galacticNames.length,500);
 assert.equal(new Set(galacticNames).size,500,"Galaxy unique names");
 const cosmicSets=[...read("secondworlddata.js").matchAll(/"equipment":\s*\{\s*"weapon":\s*"([^"]+)",\s*"helmet":\s*"([^"]+)",\s*"armor":\s*"([^"]+)",\s*"shoes":\s*"([^"]+)",\s*"accessory":\s*"([^"]+)"/g)];
 assert.equal(cosmicSets.length,100,"Universe 100 Boss x 5");
 const highSets=[...read("thirdworldloot.js").matchAll(/Object\.freeze\(\{band:(\d+),theme:"([^"]+)",weapon:"([^"]+)",helmet:"([^"]+)",armor:"([^"]+)",shoes:"([^"]+)",accessory:"([^"]+)"\}\)/g)];
 assert.equal(highSets.length,10,"Higher ten stages x 5");
 assert.match(bridge,/catalog\[1\]\.length!==10/);
 assert.match(bridge,/galaxy\.slice\(region\.mapStart,region\.mapEnd\+1\)/);
 assert.match(bridge,/window\.secondWorldBoss\?\./);
 assert.match(bridge,/THIRD_WORLD_EQUIPMENT_NAME_ROWS/);
 assert.match(bridge,/civilization3d:appearance-error/);
 assert.match(gm,/appearanceMode=embedded\?"formal":"free"/);
 assert.match(gm,/scenarioMode="formal"/);
 assert.match(gm,/selectedEquipmentNames:activeEquipmentSet\(\)\?\.names/);
 assert.ok(!gm.includes('id="appearanceLevel"')&&!gm.includes('id="appearanceEnhancement"'));
 const cases=[...gm.matchAll(/\{id:"[^"]+",cat:"([^"]+)"/g)].map(m=>m[1]);
 assert.equal(cases.length,31);
 assert.equal(new Set(cases).size,8);
 assert.equal(gmEntryVersion,formalEntryVersion);
 const frontier=read("3d-test/prototype-engine.js");
 for(const mesh of ["frontier-dimensional-boundary","frontier-dimensional-fracture","alternate-dimensional-breach","frontier-monolith","frontier-giant-core-cage","higher-dimensional-core-boundary","higher-dimensional-splinter"]){
  assert.ok(frontier.includes(mesh),"B24 frontier visual missing: "+mesh);
 }
 assert.equal(formalEntryVersion,gmEntryVersion);
 const chronicle=read("3d-test/prototype-engine.js");
 for(const visual of ["chronicle-hologram-index","chronicle-memory-shard","chronicle-glyph","reincarnation-epoch-gate","skippable:true","nonBlocking:true"]){
  assert.ok(chronicle.includes(visual),"B25 chronicle visualization missing: "+visual);
 }
 const runtime=read("3d-test/runtime.js");
 assert.match(runtime,/const VERSION=4;/);
 for(const safety of ["ResizeObserver","visibilitychange","pagehide","pageshow","renderPaused","signal.aborted","resizeObserver?.disconnect()"]){
  assert.ok(runtime.includes(safety),"B26 runtime safety missing: "+safety);
 }
 assert.match(read("3d-test/formal-home.js"),/runtime\.js\?v=20261010-opt1-lifecycle/);
 for(const token of ["acquireAsset:","releaseAsset,clearAssets:clearAssetCache","assetRefs.clear()","signal.aborted","onContextRestored"]){assert.ok(runtime.includes(token),"3D optimization 1 missing: "+token);}
 assert.equal(formalEntryVersion,gmEntryVersion);
 assert.equal(gmEntryVersion,formalEntryVersion);
 assert.match(read("3d-test/test-center.js"),/runtime\.js\?v=20261010-opt1-lifecycle/);
 const mapping=read("3d-test/appearance-snapshot.js");
 for(const field of ["function modelDescriptor(","function modelDescriptors(","assetKind:","geometry-fallback","visualKey","enhancement:bound"]){assert.ok(mapping.includes(field),"Opt3 mapping contract missing: "+field);}
 assert.ok(read("3d-test/prototype-engine.js").includes("modelDescriptors:Array.isArray(args.modelDescriptors)"),"Character must expose mapping descriptor");
 assert.ok(read("3d-test/prototype-engine.js").includes("?.modelDescriptor?.("),"Equipment must expose mapping descriptor");
 for(const field of ["appearanceSource:a.source","modelDescriptors:modelDescriptors(a)"]){assert.ok(mapping.includes(field),"Shared Opt3 appearance scene missing: "+field);}
 assert.ok(read("3d-test/prototype-engine.js").includes('appearanceSource:args.appearanceSource||"fixture"'),"Scene must distinguish formal and fixture visual source");
 const formalBattle=read("3d-test/formal-home.js"),gmBattle=read("gm3dprototype.js"),gmScenarios=read("3d-test/test-center.js");
 for(const x of ['status:"active"','status:"unavailable"','source:"formal-combat"','eventType:"presentation-snapshot"']){
  assert.ok(formalBattle.includes(x)&&gmBattle.includes(x),"Opt5 formal battle contract differs: "+x);
 }
 assert.ok(gmScenarios.includes('data.battle.schema!==1')&&gmScenarios.includes('data.battle.source!=="formal-combat"'),"Opt5 formal GM bridge must reject malformed combat snapshots");
 console.log("PASS repair 5: 100/100/10 formal equipment sets, eight groups, 31 scenes and GM source isolation.");
}
console.log("PASS B18 static coverage: core routes, optional visuals, mode isolation, GM, story and lazy loading.");
