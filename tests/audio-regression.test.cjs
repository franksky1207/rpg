/* Civilisation Audio Regression: run with node tests/audio-regression.test.cjs */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.join(__dirname,"..");
const files={
 main:"ui.js",bounty:"dungeonbounty.js",arena:"dungeonarena.js",
 void:"dungeonvoidui.js",mirror:"mirrordungeonrun.js",w3arena:"thirdworldarenaui.js",
 alternate:"alternateuniverseui.js",galaxyCalamity:"calamityrun.js",
 universeCalamity:"secondworldcalamityrun.js"
};
const source=name=>fs.readFileSync(path.join(root,name),"utf8");
for(const [mode,file] of Object.entries(files)){
 const s=source(file);
 assert.match(s,/notify\?\.\("combat-start"/,mode+" must start combat audio");
 assert.match(s,/notify\?\.\("combat-exit"/,mode+" must exit combat audio");
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
const filesUi=fs.readdirSync(path.join(root,"audio/assets/common-sfx/ui-click")).filter(x=>x.endsWith(".ogg"));
assert.deepEqual(filesUi,["sfx-085.ogg"],"single selected UI click asset");
const manifest=JSON.parse(source("audio/assets/common-sfx/manifest.json"));
assert.deepEqual(manifest.categories["ui-click"].converted.map(x=>x.file),filesUi);
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
audio.notify("combat-exit",{era:"higher"});
assert.equal(audio.current().combatLocked,false);
assert.equal(listened.at(-1),"era-higher-theme");
// Explicit historical era must override the current player era when choosing battle tiers.
audio.notify("combat-start",{era:"galaxy",mode:"battle"});
assert.equal(listened.at(-1),"battle-normal-preview");
audio.notify("combat-exit",{era:"galaxy"});
assert.equal(listened.at(-1),"era-higher-theme","settled battle must restore the actual current era");
// Galaxy mainline can enter combat through a view transition. After settlement
// the same DOM must not start the soundtrack again.
audio.syncView("home");
audio.syncView("adventure","combat");
assert.equal(audio.current().combatLocked,true,"galaxy combat view must acquire battle theme");
assert.equal(listened.at(-1),"battle-normal-preview");
audio.notify("combat-exit");
audio.syncView("adventure","combat");
assert.equal(audio.current().combatLocked,false,"settlement modal must not relock");
assert.equal(listened.at(-1),"era-higher-theme");
// Mainline settlement keeps adventureScreen='combat' behind the result modal.
audio.notify("combat-start",{era:"galaxy",mode:"boss"});
audio.notify("combat-exit");
audio.syncView("adventure","combat");
assert.equal(audio.current().combatLocked,false,"stale combat UI must never reacquire an exited run");
assert.equal(listened.at(-1),"era-higher-theme","settlement must restore current era");
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
assert.equal(d.current().pendingExit,true);
d.notify("combat-start",{era:"galaxy",mode:"boss",runId:"new"});
assert.equal(deferredTracks.at(-1),"battle-medium-preview","new battle must replace pending old soundtrack");
scheduled.splice(0).forEach(fn=>fn());
assert.equal(d.current().combatLocked,true,"stale animation callback must not release new run");
assert.equal(deferredTracks.at(-1),"battle-medium-preview");
delayed.isCombatPresentationActive=()=>false;
d.notify("combat-exit",{runId:"new"});
assert.equal(d.current().combatLocked,false);
assert.equal(deferredTracks.at(-1),"era-galaxy-theme");
console.log("Audio regression PASS: 9 formal owners; UI click disabled (source retained); GM isolation; 50% SFX; scene ownership/settlement.");
