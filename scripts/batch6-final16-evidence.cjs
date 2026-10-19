"use strict";
// Batch 6 final integration gate: explicit existing coverage, no hidden skips or gameplay mutations.
const fs=require("node:fs"),cp=require("node:child_process");
const tests=[
["01","Formal Sprite battle lifecycle","tests/equipment-formal/browser.cjs"],
["01","Mainline combat/event owner","tests/runtime/combat-events-integration.cjs"],
["01","Ordinary and boss world target","tests/runtime/first-world-target-context-combat-batch3-integrity.js"],
["02-03","Dungeon bounty and arena battle UI","tests/runtime/batch4-mobile-combat-viewport.cjs"],
["04","Mirror presenter and combat events","tests/runtime/combat-events-owner-browser.js"],
["05-06","Void and calamity recovery","tests/runtime/calamity-shared-terminal-fast-catchup-integrity.js"],
["07","Alternate universe full combat","tests/runtime/alternate-universe-combat-integrity.js"],
["07","Alternate universe browser UI","tests/runtime/alternate-universe-batch4-3-regression.js"],
["08","Review and battle reentry","tests/runtime/galaxy-review-combat-browser.js"],
["09","Three-era appearance and renderer","tests/runtime/batch5-era-animation-contract.cjs"],
["09","Renderer contract","tests/runtime/hybrid-comparison-renderer-contract.cjs"],
["10","FX timers and stale ownership","tests/runtime/batch3-fx-timer-lifecycle.cjs"],
["10","Presenter replacement pressure","tests/runtime/batch3-presenter-pressure.cjs"],
["11","Animation user settings","tests/runtime/3d-mode-browser-regression.js"],
["12","Background pending promises","tests/runtime/batch2-background-sleeper-lifecycle.cjs"],
["12","Three-era background browser","tests/runtime/cross-era-background-browser.js"],
["12","Third era visibility and minimal","tests/runtime/thirdworld-background-browser.js"],
["12","Offline settlement provenance","tests/runtime/offline-sample-provenance-opt4-integrity.js"],
["13","GM battle and isolation","tests/runtime/gm-battle-simulation-browser.js"],
["13","GM animation terminology","tests/runtime/gm-animation-center-terminology.cjs"],
["14","Save schema compatibility","tests/runtime/save-schema17-compatibility-matrix.js"],
["14","Save and load owner","tests/runtime/save-load-pipeline-integrity.js"],
["14","Reincarnation protection","tests/runtime/reincarnation-save-integrity.js"],
["15","Audio lifecycle","tests/runtime/audio-lifecycle-browser.js"],
["15","Lazy audio and native persistence","tests/runtime/batch11-audio-lazy-browser.cjs"],
["15","Audio persistent preferences","tests/runtime/audio-settings-persistence-integrity.js"],
["16","Manifest integrity","tests/runtime/resource-manifest-integrity.js"],
["16","Cache policy","tests/runtime/resource-cache-integrity.js"],
["16","HTML JS CSS version guard","tests/runtime/html-cache-version-guard.js",["--self-test"]],
["16","Legacy art removal inventory","tests/runtime/cleanup-batch4-3-current-inventory.cjs"],
["16","Earlier batch 2 final13","scripts/batch2-final13-evidence.cjs"],
["16","Earlier batch 3 integration","scripts/batch3-integrated-evidence.cjs"]
];
const rows=[];let failures=0;
for(const [category,label,path,args=[]] of tests){
 const started=Date.now();let row={category,label,path,args,status:"missing",durationMs:0,exitCode:null};
 if(fs.existsSync(path)){
  const r=cp.spawnSync(process.execPath,[path,...args],{encoding:"utf8",timeout:300000,maxBuffer:16*1024*1024,env:{...process.env,RUNTIME_SMOKE_URL:"http://127.0.0.1:4173/index.html"}});
  row={...row,status:r.error?"error":r.status===0?"pass":"fail",durationMs:Date.now()-started,exitCode:r.status,tail:((r.stdout||"")+"\n"+(r.stderr||"")).slice(-3000)};
 }
 if(row.status!=="pass")failures++;
 rows.push(row);console.log("BATCH6",category,row.status,label,row.durationMs);
 if(row.status!=="pass")console.error(row.tail||"Missing test: "+path);
}
const result={schema:"cw.batch6.final16.integration.v1",sha:process.env.GITHUB_SHA||"local",scope:"Representative automated suite across 16 fixed categories; not all cartesian states, iPhone hardware thermals, true cloud account write or approved visual art.",total:rows.length,passed:rows.length-failures,failed:failures,rows};
fs.writeFileSync("batch6-final16-evidence.json",JSON.stringify(result,null,2)+"\n");
if(failures)process.exitCode=1;
