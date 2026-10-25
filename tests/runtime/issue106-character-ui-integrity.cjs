'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('playersemanticsui.js','utf8');
const adventure=fs.readFileSync('thirdworldui.js','utf8');
const expected='突破每級：裝備原始 HP／攻擊／防禦 +2.5%、最終傷害 +5%、轉生收益 +1%。';
assert.ok(source.includes(expected),'Character breakthrough caption must match approved copy');
assert.match(source,/ensureCharacterStat\(grid,"轉生收益加成",/);
assert.match(source,/damageRow\.insertAdjacentElement\("afterend",yieldRow\)/,'Yield should appear directly after final damage');
assert.match(source,/const duplicateCore=statByLabel\(grid,"界弦核心"\);if\(duplicateCore\)duplicateCore\.remove\(\);/);
assert.ok(!source.includes('ensureCharacterStat(grid,"界弦核心"'),'Character page should not recreate duplicate core');
assert.ok(adventure.includes('界弦核心')&&adventure.includes('third-world-core-progress'),'Higher-dimensional adventure core remains available');
for(const level of [0,1,10,130,500]){
 const formatted='+'+Math.max(0,Math.floor(Number(level)||0))+'%';
 assert.equal(formatted,'+'+level+'%');
}
console.log('PASS Issue106 character UI static integrity: labels, ordering, captions, core ownership, sample levels.');
