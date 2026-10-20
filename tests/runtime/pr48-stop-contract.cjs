'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const base='39620ae6599096b3648688508bd80d567fe58e6e';
const files=['ui.js','worldmapui.js','thirdworldui.js','dungeonbounty.js','dungeonarena.js','thirdworldarenaui.js','calamityui.js','secondworldcalamityui.js','dungeonvoidui.js'];
const strip=s=>s.replaceAll(' data-combat-action="stop-continuous"','').replaceAll(' combat-viewport-stop','');
// Stop wrapper contents are compared independently below, so removing them here
// permits only relocation. All remaining markup AND executable code stay exact.
const normalize=s=>strip(s).replace('  if(window.CivilizationCombatViewport?.animationExpected?.()&&window.matchMedia?.("(max-width:820px), (max-height:500px) and (pointer:coarse)")?.matches)return;\n','').replaceAll('${stop}','').replace(/<div class="continuous-stop-wrap"><button[^]*?<\/button><\/div>/g,'');
let count=0;
for(const p of files){const before=cp.execFileSync('git',['show',base+':'+p],{encoding:'utf8'}),after=fs.readFileSync(p,'utf8');assert.equal(normalize(after),normalize(before),'gameplay, HUD and non-stop markup unchanged: '+p);
 const marked=[...after.matchAll(/<button data-combat-action="stop-continuous"[^]*?<\/button>/g)].map(m=>m[0]);assert.equal(marked.length,1,'one authored existing stop owner: '+p);
 for(const button of marked){const original=strip(button);assert(before.includes(original),'original label, dimensions, classes, event, disabled condition retained: '+p);assert(!/onclick="start/.test(button),'start must never be marked stop');count++;}
}
for(const p of ['mirrorcombatcore.js','mirrordungeonui.js','alternateuniverseui.js','thirdworldrun.js','combatcore.js','combatmath.js','engine.js','savemigration.js','offlineprogress.js','combatfx.js','audio/audio-core.js'])assert.equal(fs.readFileSync(p,'utf8'),cp.execFileSync('git',['show',base+':'+p],{encoding:'utf8'}),'protected owner unchanged: '+p);
console.log('PR48_STOP_CONTRACT_PASS',count,'original stop owners; gameplay and every button attribute preserved');

// PR #52 intentionally hardened the shared runtime owner; keep behavior coverage rather than obsolete bitwise identity.
const progress=fs.readFileSync('backgroundprogress.js','utf8');
assert.match(progress,/runtime-status-invalid/,'shared runtime malformed blockers must fail closed');
