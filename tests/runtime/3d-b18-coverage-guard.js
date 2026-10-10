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
assert.ok(bridge.includes('document.getElementById("civilization3dCharacterToggle")'),"No duplicate character preview");
assert.ok(bridge.includes('if(view==="dungeon-void-mirage")return;'),"No extra void settlement button");
assert.ok(story.includes('<div class="story-content"><div id="storyBody"'),"Story content and 3D must share grid track");
assert.ok(css.includes(".story-content{min-height:0"),"Story footer regression guard");
assert.ok(policy.includes("FULL_3D_AVAILABLE=false"),"Unfinished 3D must stay gated");
assert.ok(policy.includes("PREFIX+id"),"Mode preference must be account-scoped");
assert.ok(policy.includes("civilization-auth-signed-out"),"Mode must react to signout");
assert.ok(index.includes("3d-test/mode-foundation.js?"),"Mode policy loaded");
assert.ok(index.includes("3d-test/formal-home.js?"),"Visual bridge loaded");
assert.ok(!index.includes('<script src="3d-test/runtime.js')&&!index.includes('<script src="3d-test/appearance-snapshot.js'),"3D runtime cannot boot synchronously in text mode");
console.log("PASS B18 static coverage: core routes, optional visuals, mode isolation, GM, story and lazy loading.");
