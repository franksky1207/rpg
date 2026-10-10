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
assert.match(core,/"ui-click":\{count:1,indices:\[85\]/);
assert.match(core,/sfxOutputScale=0\.5/);
assert.match(core,/function stopGmSfx\(/);
assert.match(core,/function warmCombatSfx\(/);
assert.match(core,/function sfxDiagnostics\(/);
const gm=source("audio/gm-audio-test.js");
assert.match(gm,/介面點擊｜固定 085/);
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
assert.equal(listened.at(-1),"era-galaxy-theme");
console.log("Audio regression PASS: 9 formal owners; 085 only; GM isolation; 50% SFX; scene ownership/settlement.");
