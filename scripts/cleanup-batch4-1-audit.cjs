"use strict";
const fs=require("node:fs"),cp=require("node:child_process"),path=require("node:path"),assert=require("node:assert/strict");
const sha=cp.execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim();
const rows=cp.execFileSync("git",["ls-tree","-r","-l","HEAD"],{encoding:"utf8",maxBuffer:40*1024*1024}).trimEnd().split("\n").map(s=>{const m=/^\d+ blob ([a-f0-9]{40})\s+(\d+)\t(.+)$/.exec(s);assert.ok(m,"Invalid tree record: "+s);return {sha:m[1],bytes:Number(m[2]),path:m[3]};});
const manifest=JSON.parse(fs.readFileSync("development/hybrid-comparison/t2b3-v1/manifest.json","utf8"));
const registered=new Set([...Object.keys(manifest.files||{}),...Object.keys(manifest.vendor||{})]);
const selected=new Set(rows.filter(x=>/^(development\/hybrid-comparison\/|development\/3d-source\/|development\/art-candidates\/|development\/retired-formal-previews\/|assets\/3d\/|docs\/evidence\/)/.test(x.path)).map(x=>x.path));
const retained=new Set(["data.js","combatcore.js","resource-cache-client.js","development/equipment-2_5d/gm-publication.json"]);
function kind(p){
 if(p.startsWith("assets/3d/"))return "dependency-gated";
 if(registered.has(p))return "dependency-gated";
 if(/^(development\/hybrid-comparison\/t2b3-v1\/|development\/hybrid-comparison\/t2a-v1\/)/.test(p))return "dependency-gated";
 if(/^(development\/3d-source\/equipment\/|development\/3d-source\/characters\/)/.test(p))return "dependency-gated";
 if(p.startsWith("development/retired-formal-previews/"))return "historical-lock-review";
 if(p.startsWith("docs/evidence/"))return "evidence-review";
 if(p.startsWith("development/art-candidates/"))return "unreferenced-candidate-review";
 return "reference-review";
}
const inventory=rows.filter(x=>selected.has(x.path)).map(x=>({...x,disposition:kind(x.path),reason:registered.has(x.path)?"Pinned in B3 source manifest":"Requires code/CI reference closure and category-specific confirmation"}));
for(const p of retained)assert.ok(rows.some(x=>x.path===p),"Protected owner missing "+p);
for(const p of ["development/3d-source/equipment/concepts/_concept-index.json","scripts/equipment-concepts.py","tests/equipment-concepts/test_database.py"])assert.ok(!rows.some(x=>x.path===p),"Retired art-only source returned: "+p);
const counts={};for(const x of inventory){const v=counts[x.disposition]??={files:0,bytes:0};v.files++;v.bytes+=x.bytes;}
const summary={schema:"cw.cleanup4.audit1",head:sha,trackedFiles:rows.length,trackedBytes:rows.reduce((s,x)=>s+x.bytes,0),b3ManifestEntries:Object.keys(manifest.files).length,b3VendorEntries:Object.keys(manifest.vendor).length,inventoryFiles:inventory.length,groups:counts,method:"conservative: no inferred deletion approval; every candidate requires latest runtime/CI ownership check"};
fs.writeFileSync("cleanup-batch4-1-inventory.json",JSON.stringify({summary,files:inventory},null,2)+"\n");
console.log(JSON.stringify(summary,null,2));
