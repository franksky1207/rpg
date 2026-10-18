"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),crypto=require("node:crypto"),cp=require("node:child_process");
const base="development/combat-animation/batch7/",manifest=JSON.parse(fs.readFileSync(base+"approved-sources/manifest.json"));
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const fixed={galaxy:"06e4bf6bb0ce50f4b90d8111db3608821ef0d582400cc760920abbfb45a54e56",universe:"e1b438fb7f7221d05a0468277f3e53e62173e95fd553d22cf333bea31e016239",higher:"d0a934a3d44bd36f3da12d2169b089020cb37d818cbd41dca8fd2053f24bf661"};
assert.equal(manifest.files.length,3);
for(const f of manifest.files){const b=fs.readFileSync(base+"approved-sources/"+f.path.split("/").pop());assert.equal(sha(b),fixed[f.epoch]);assert.equal(sha(b),f.sha256);assert.equal(b.length,f.bytes);}
const candidates=JSON.parse(fs.readFileSync(base+"candidates/manifest.json"));assert.equal(candidates.formalReleaseAllowed,false);assert.equal(candidates.entries.length,3);
for(const e of candidates.entries){assert.equal(e.id,"era-"+e.epoch);assert.equal(e.formalBattleAllowed,false);assert.equal(e.gmPreviewAllowed,false);assert.equal(e.status,"candidate-only");assert.ok(e.missingLayers.includes("attack-body")&&e.missingLayers.includes("independent-weapon"));assert.deepEqual(e.acceptedLayers,[]);assert.deepEqual(e.pivot,[.5,.9]);assert.equal(e.source.sha256,fixed[e.epoch]);if(e.epoch==="higher"){assert.equal(e.asset,null);assert.equal(e.replacementVersion,2);assert.deepEqual(e.requiredLayers,["complete-character","attack-body","independent-weapon"]);continue;}const b=fs.readFileSync(e.asset.path);assert.equal(sha(b),e.asset.sha256);assert.equal(b.length,e.asset.bytes);assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");assert.equal(e.source.sha256,fixed[e.epoch]);}
// No unreviewed candidates/master art may be loaded by the shipped web app.
const tracked=cp.execFileSync("git",["ls-files"],{encoding:"utf8"}).split("\n");
for(const file of tracked.filter(p=>/\.(?:js|mjs|html|css)$/.test(p)&&!p.startsWith("development/")&&!p.startsWith("scripts/")&&!p.startsWith("tests/"))){assert.ok(!fs.readFileSync(file,"utf8").includes(base),"Candidate leaked into runtime: "+file);}
console.log("PASS Batch7 immutable sources, independent candidate IDs, WebP digests and non-release boundary (not art acceptance)");

const removed=JSON.parse(fs.readFileSync(base+"higher-v2-removal-record.json"));for(const p of removed.deleted)assert.equal(fs.existsSync(p),false,p);
const replacement=JSON.parse(fs.readFileSync(base+'replacement-pack/manifest.json'));
const higher=candidates.entries.find(e=>e.epoch==='higher');
assert.equal(replacement.files.length,3);
for(const f of replacement.files){const record=higher.sourceLayers.find(s=>s.name===f.zip_path.split('/').pop());assert.ok(record);const bytes=fs.readFileSync(record.path);assert.equal(sha(bytes),f.sha256);assert.equal(bytes.length,f.bytes);assert.equal(record.sha256,f.sha256);}
assert.deepEqual(JSON.parse(fs.readFileSync(base+'mask-recipe.json')).entries.map(e=>e.epoch),['galaxy','universe']);
for(const e of candidates.entries)assert.ok(!JSON.stringify(e).match(/cape-with-hidden|orbit-rings|celestial-bodies|higher_approved_master/));
console.log('PASS higher-v2 exact package digests, old-design deletion and recipe non-resurrection');
