/* Civilisation Audio Regression: run with node tests/audio-regression.test.cjs */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.join(__dirname,"..");
const files={
 main:"battlepipeline.js",universeMain:"secondworldmainline.js",higherMain:"thirdworldrun.js",bounty:"dungeonbounty.js",arena:"dungeonarena.js",
 void:"dungeonvoidui.js",mirror:"mirrordungeonrun.js",w3arena:"thirdworldarenaui.js",
 alternate:"alternateuniverseui.js",galaxyCalamity:"calamityrun.js",
 universeCalamity:"secondworldcalamityrun.js"
};
const source=name=>fs.readFileSync(path.join(root,name),"utf8");
for(const [mode,file] of Object.entries(files)){
 const s=source(file);
 assert.match(s,/(?:notify\?\.\("combat-start"|startRun\?\.)/,mode+" must start combat audio");
 assert.match(s,/(?:notify\?\.\("combat-exit"|endRun\?\.)/,mode+" must exit combat audio");
}
const core=source("audio/audio-core.js");
assert.doesNotMatch(core,/"ui-click":\{count:/,"cancelled UI click must not be registered");
assert.match(core,/sfxOutputScale=0\.5/);
assert.match(core,/function stopGmSfx\(/);
assert.match(core,/function warmCombatSfx\(/);
assert.match(core,/function sfxDiagnostics\(/);
const gm=source("audio/gm-audio-test.js");
assert.doesNotMatch(gm,/介面點擊｜固定 085/,"cancelled UI click must not be in GM audition");
assert.match(gm,/stopGmSfx/);
assert.doesNotMatch(gm,/audio\(\)\?\.stopSfx/);
const selected=require("../scripts/publish-assets.cjs").inspect(root).audio.files;
const crypto=require("node:crypto");
const common=JSON.parse(source("audio/assets/common-sfx/manifest.json"));
assert.equal(selected.length,17);
for(const file of selected){
 const raw=fs.readFileSync(path.join(root,file));assert.ok(raw.length>0,file);
 if(file.includes("common-sfx/")){
  const category=file.split("/").at(-2),name=path.basename(file);
  const row=common.categories[category].converted.find(x=>x.file===name);assert.ok(row,file);
  assert.equal(raw.length,row.bytes);assert.equal(crypto.createHash("sha256").update(raw).digest("hex"),row.sha256);
 }
}
assert.equal(fs.existsSync(path.join(root,"audio/assets/common-sfx/ui-click/sfx-085.ogg")),false,"disabled click resource stays retired");
const listened=[];
const listeners=new Map();
const document={
 querySelector:()=>null,
 addEventListener(type,cb){listeners.set(type,cb);},
 body:{},
 hidden:false
};
class MutationObserver{observe(){}}
const ctx={document,MutationObserver,state:{worldPhase:3},view:"home",setTimeout:fn=>fn(),console,window:null};
let active=false;
ctx.isCombatPresentationActive=()=>active;
ctx.CivilizationAudio={
 settings:()=>({musicEnabled:true}),isSilent:()=>false,prioritizeEraTheme(){},
 playMusic(id){listened.push(id);this.id=id;return true;},
 currentMusicId(){return this.id||null;},resumeMusic(){return true;},
 stopBattleSfx(){this.stops=(this.stops||0)+1;},warmCombatSfx(){this.warms=(this.warms||0)+1;}
};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(source("audio/audio-scenes.js"),ctx);
const audio=ctx.CivilizationAudioScenes;
audio.notify("combat-start",{era:"higher",mode:"arena-fixed"});
assert.equal(listened.at(-1),"battle-high-preview");
const count=listened.length;
audio.notify("combat-start",{era:"higher",mode:"arena-fixed"});
audio.syncView("dungeon");
audio.setContext("higher","arenaFixed");
assert.equal(listened.length,count,"renders/duplicate starts must never restart music");
assert.equal(audio.current().combatLocked,true);
audio.notify("combat-end");
assert.equal(audio.current().combatLocked,true,"individual fight must not exit continuous music");
audio.endRun(audio.current().activeRunId,{era:"higher"});
assert.equal(audio.current().combatLocked,false);
assert.equal(listened.at(-1),"era-higher-theme");
// Explicit historical era must override the current player era when choosing battle tiers.
audio.notify("combat-start",{era:"galaxy",mode:"battle"});
assert.equal(listened.at(-1),"battle-normal-preview");
audio.endRun(audio.current().activeRunId,{era:"galaxy"});
assert.equal(listened.at(-1),"era-higher-theme","settled battle must restore the actual current era");
// Galaxy mainline can enter combat through a view transition. After settlement
// the same DOM must not start the soundtrack again.
ctx.state.worldPhase=1;
audio.syncView("home");
audio.syncView("adventure","combat");
assert.equal(audio.current().combatLocked,false,"view must not acquire formal ownership");
assert.equal(listened.at(-1),"era-galaxy-theme");
audio.notify("combat-start",{era:"galaxy",mode:"boss"});
assert.equal(listened.at(-1),"battle-medium-preview","explicit Boss battle overrides legacy screen entry");
audio.endRun(audio.current().activeRunId);
audio.syncView("adventure","combat");
assert.equal(audio.current().combatLocked,false,"settlement modal must not relock");
assert.equal(listened.at(-1),"era-galaxy-theme");
audio.notify("combat-start",{era:"galaxy",mode:"boss"});
audio.endRun(audio.current().activeRunId);
audio.syncView("adventure","combat");
assert.equal(audio.current().combatLocked,false,"stale combat UI must never reacquire an exited run");
assert.equal(listened.at(-1),"era-galaxy-theme","settlement must restore current era");
audio.notify("combat-start",{era:"galaxy",mode:"battle",runId:"new-run"});
assert.equal(listened.at(-1),"battle-normal-preview","next battle selects its own tier");
audio.notify("combat-exit",{runId:"stale-run"});
assert.equal(audio.current().combatLocked,true,"late exit must not clear a new run");
audio.notify("combat-exit",{runId:"new-run"});
assert.equal(audio.current().combatLocked,false);
// Deferred animation release may arrive after the next formal run starts.
const scheduled=[],deferredTracks=[];
const delayed={
 document:{querySelector:()=>null,addEventListener(){},body:{},hidden:false},
 MutationObserver:class{observe(){}},
 state:{worldPhase:1},view:"adventure",adventureScreen:"combat",
 setTimeout(fn){scheduled.push(fn);},console,window:null,
 isCombatPresentationActive:()=>true
};
delayed.CivilizationAudio={
 settings:()=>({musicEnabled:true}),isSilent:()=>false,prioritizeEraTheme(){},
 playMusic(id){deferredTracks.push(id);this.id=id;return true;},
 currentMusicId(){return this.id||null;},resumeMusic(){return true;},
 stopBattleSfx(){},warmCombatSfx(){}
};
delayed.window=delayed;vm.createContext(delayed);
vm.runInContext(source("audio/audio-scenes.js"),delayed);
const d=delayed.CivilizationAudioScenes;
d.notify("combat-start",{era:"galaxy",mode:"battle",runId:"old"});
d.notify("combat-exit",{runId:"old"});
assert.equal(d.current().pendingExit,false,"formal exit must complete without presentation polling");
assert.equal(d.current().combatLocked,false);
d.notify("combat-start",{era:"galaxy",mode:"boss",runId:"new"});
assert.equal(deferredTracks.at(-1),"battle-medium-preview","new battle must replace pending old soundtrack");
scheduled.splice(0).forEach(fn=>fn());
assert.equal(d.current().combatLocked,true,"stale animation callback must not release new run");
assert.equal(deferredTracks.at(-1),"battle-medium-preview");
delayed.isCombatPresentationActive=()=>false;
d.notify("combat-exit",{runId:"new"});
assert.equal(d.current().combatLocked,false);
assert.equal(deferredTracks.at(-1),"era-galaxy-theme");
console.log("Audio regression PASS: 11 formal owners; UI click disabled (source retained); GM isolation; 50% SFX; scene ownership/settlement.");
