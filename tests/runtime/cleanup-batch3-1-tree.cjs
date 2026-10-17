"use strict";
const assert=require("node:assert/strict");
const cp=require("node:child_process");
const fs=require("node:fs");
const base="a6d5690921d2e61f555b0f604c4ceb2c5b88c346";
const prefix="development/3d-source/equipment/concepts/";
function tree(ref){return cp.execFileSync("git",["ls-tree","-r","-l",ref],{encoding:"utf8",maxBuffer:64*1024*1024}).trimEnd().split("\n").map(x=>{let m=/^\d+ blob [a-f0-9]+\s+(\d+)\t(.+)$/.exec(x);if(!m)throw Error("Unexpected tree entry "+x);return {size:Number(m[1]),path:m[2]};});}
const before=tree(base),after=tree("HEAD");
const gone=before.filter(x=>x.path.startsWith(prefix)),old=new Set(before.map(x=>x.path)),now=new Set(after.map(x=>x.path));
assert.equal(gone.length,874,"Original inventory folder size changed");
assert.equal(gone.reduce((s,x)=>s+x.size,0),352471565,"Original inventory byte count changed");
for(const x of gone)assert.ok(!now.has(x.path),"Concept file still tracked: "+x.path);
assert.deepEqual(before.filter(x=>!x.path.startsWith(prefix)&&!now.has(x.path)).map(x=>x.path),[],"Unexpected source deletion");
for(const p of ["development/3d-source/equipment/concepts/_concept-index.json","development/3d-source/equipment/concepts/_concept-identities.json"])
 assert.ok(!fs.existsSync(p),"Deleted catalogue still present: "+p);
for(const p of ["assets/gm-equipment-2_5d/v1/catalog.json","assets/gm-equipment-2_5d/v1/g005.webp","assets/gm-equipment-2_5d/v1/g007.webp","assets/gm-equipment-2_5d/v1/g018.webp",
 "development/equipment-2_5d/gm-publication.json","data.js","combatcore.js","resource-cache-client.js"])assert.ok(fs.existsSync(p),"Protected runtime dependency missing: "+p);
const info={removed:gone.length,removedBytes:gone.reduce((s,x)=>s+x.size,0),remainingConceptFiles:after.filter(x=>x.path.startsWith(prefix)).length,protectedUnchanged:true};
console.log("PASS Batch 3-1 exact Git tree deletion:",JSON.stringify(info));
