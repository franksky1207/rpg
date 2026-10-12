'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const window={CivilizationPresentationMode:{accountPreference:()=> '3d',currentMode:()=> 'text'}};
vm.runInNewContext(fs.readFileSync('3d-test/t3a-hybrid-policy.js','utf8'),{window});
const policy=window.CivilizationHybridBattlePolicy;
assert.equal(policy.version,1);
for(const quality of ['high','standard','minimal']){
 const r=policy.resolve({requestedMode:'hybrid-b',rendererReady:true,webglAvailable:true,assetsVerified:true,quality,legacyMode:'3d'});
 assert.equal(r.legacyPreference,'3d');
 assert.equal(r.effectiveMode,quality==='minimal'?'text':'hybrid-b');
 assert.equal(r.canCommit,false);assert.equal(r.canCreateCombatEvents,false);
 assert.equal(Object.isFrozen(r),true);
}
for(const fail of [{rendererReady:false},{webglAvailable:false},{assetsVerified:false},{background:true},{contextLost:true},{activeOwnerUnsafe:true}]){
 const r=policy.resolve({requestedMode:'hybrid-b',rendererReady:true,webglAvailable:true,assetsVerified:true,...fail});
 assert.equal(r.effectiveMode,'text');
}
assert.equal(policy.fromCurrent({requestedMode:'hybrid-b'}).legacyPreference,'3d');
assert.equal(policy.resolve({requestedMode:'fake',quality:'bogus'}).effectiveMode,'text');
assert.equal(policy.resolve({quality:'bogus'}).quality,'standard');

// T3-A must remain non-authoritative until T3-B owner integration is reviewed.
const source=fs.readFileSync('3d-test/t3a-hybrid-policy.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const modeSource=fs.readFileSync('3d-test/mode-foundation.js','utf8');
assert.ok(index.includes('3d-test/t3a-hybrid-policy.js?v='),'formal page must load versioned B policy');
assert.ok(index.indexOf('3d-test/mode-foundation.js') < index.indexOf('3d-test/t3a-hybrid-policy.js'),'legacy mode owner must initialize before policy');
assert.match(modeSource,/FULL_3D_AVAILABLE=false/,'unreleased 3D switch must remain closed');
assert.doesNotMatch(source,/localStorage|sessionStorage|\.setItem\s*\(|\.reload\s*\(|\.dispatchEvent\s*\(|\.emit\s*\(/,'policy must never persist or dispatch battle events');
assert.equal(policy.resolve({requestedMode:'hybrid-b',rendererReady:true,webglAvailable:true,assetsVerified:true,quality:'minimal'}).effectiveMode,'text');
assert.equal(policy.resolve({requestedMode:'hybrid-b',rendererReady:true,webglAvailable:true,assetsVerified:false}).effectiveMode,'text');

console.log('PASS T3-A read-only policy / legacy preference / quality / fail-closed / formal release isolation');
