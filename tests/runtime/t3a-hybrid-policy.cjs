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
console.log('PASS T3-A read-only policy / legacy preference / quality / fail-closed');
