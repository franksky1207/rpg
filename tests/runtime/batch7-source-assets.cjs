"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),crypto=require("node:crypto"),cp=require("node:child_process");
const base="development/combat-animation/batch7/",manifest=JSON.parse(fs.readFileSync(base+"approved-sources/manifest.json"));
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const fixed={galaxy:"06e4bf6bb0ce50f4b90d8111db3608821ef0d582400cc760920abbfb45a54e56",universe:"e1b438fb7f7221d05a0468277f3e53e62173e95fd553d22cf333bea31e016239",higher:"43e80f7a84ccc41f9716a1f5aba6f08d4b9fd2c969c74010fb3422b61c54f3b6"};
assert.equal(manifest.files.length,3);
for(const f of manifest.files){const b=fs.readFileSync(base+"approved-sources/"+f.path.split("/").pop());assert.equal(sha(b),fixed[f.epoch]);assert.equal(sha(b),f.sha256);assert.equal(b.length,f.bytes);}
const candidates=JSON.parse(fs.readFileSync(base+"candidates/manifest.json"));assert.equal(candidates.formalReleaseAllowed,false);assert.equal(candidates.entries.length,3);
for(const e of candidates.entries){assert.equal(e.id,"era-"+e.epoch);assert.equal(e.formalBattleAllowed,false);assert.equal(e.gmPreviewAllowed,false);assert.equal(e.status,"candidate-only");assert.ok(e.missingLayers.includes("attack-body")&&e.missingLayers.includes("independent-weapon"));assert.deepEqual(e.acceptedLayers,[]);assert.deepEqual(e.pivot,[.5,.9]);const b=fs.readFileSync(e.asset.path);assert.equal(sha(b),e.asset.sha256);assert.equal(b.length,e.asset.bytes);assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");assert.equal(e.source.sha256,fixed[e.epoch]);}
// No unreviewed candidates/master art may be loaded by the shipped web app.
const tracked=cp.execFileSync("git",["ls-files"],{encoding:"utf8"}).split("\n");
for(const file of tracked.filter(p=>/\.(?:js|mjs|html|css)$/.test(p)&&!p.startsWith("development/")&&!p.startsWith("scripts/")&&!p.startsWith("tests/"))){assert.ok(!fs.readFileSync(file,"utf8").includes(base),"Candidate leaked into runtime: "+file);}
console.log("PASS Batch7 immutable sources, independent candidate IDs, WebP digests and non-release boundary (not art acceptance)");
