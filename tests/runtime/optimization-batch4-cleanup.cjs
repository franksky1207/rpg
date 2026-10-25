'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const base='c0ec18d686d7111b2e5a7fa380c94653a2b8a2e4';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const files=cp.execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n');
// Byte protection covers every live root runtime/data owner, all formal/GM visuals,
// registered GLBs, licenses and exact source locks. Only retired background PNGs
// and unselected audio binary stock are allowed to disappear.
const guarded=files.filter(p=>/^([^/]+\.(?:js|mjs|css|html)$|(?:3d-test|data|assets\/(?!backgrounds-source\/))\/)/.test(p)&&p!=='assets/README.md');
for(const p of guarded){assert.ok(fs.existsSync(p),'protected file missing '+p);const old=cp.execFileSync('git',['rev-parse',base+':'+p],{encoding:'utf8'}).trim();const b=fs.readFileSync(p),blob=crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');assert.equal(blob,old,'protected bytes changed '+p);}
const policy=require('../../scripts/publish-assets.cjs'),plan=policy.inspect(process.cwd());
assert.equal(plan.missing.length,0);assert.equal(plan.backgrounds.length,32);assert.equal(plan.audio.files.length,17);
const audio=policy.walk('audio/assets').filter(p=>/\.(?:mp3|wav|ogg|flac|zip)$/i.test(p)).map(p=>'audio/assets/'+p).sort();assert.deepEqual(audio,[...plan.audio.files].sort());
const baseline=JSON.parse(fs.readFileSync('docs/evidence/optimization-batch4/published-baseline.json'));
const actual=policy.walk('.publish-stage3').filter(p=>p!=='.publish-candidate');assert.deepEqual(actual,Object.keys(baseline.files).sort(),'Full published GM closure must remain exact');
for(const p of actual)assert.equal(sha(fs.readFileSync('.publish-stage3/'+p)),baseline.files[p],'candidate bytes changed '+p);
for(const p of ['development/hybrid-comparison/index.html','development/hybrid-comparison/comparison.css','development/hybrid-comparison/comparison.mjs'])assert.equal(fs.existsSync(p),false,'retired standalone comparison UI');
for(const p of ['development/equipment-2_5d/formal-publication.json','development/equipment-2_5d/gm-publication.json'])assert.deepEqual(fs.readFileSync(p),cp.execFileSync('git',['show',base+':'+p]),'publication SHA lock');
console.log(`PASS batch4: ${guarded.length} runtime/visual/data files byte-identical; ${actual.length} full candidate files SHA256-identical; 32 backgrounds and exact 17 audio; GM and source locks retained`);
