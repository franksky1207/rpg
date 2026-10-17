"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"../.."),pre="development/hybrid-comparison/t2b2-v1/";
const manifest=JSON.parse(fs.readFileSync(path.join(root,"development/hybrid-comparison/t2b3-v1/manifest.json"),"utf8"));
const inventory=JSON.parse(fs.readFileSync(path.join(root,pre,"inventory.json"),"utf8"));
const digest=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
assert.equal(Object.keys(manifest.files).length,174,"Exactly 174 approved B renderer inputs");
assert.equal(inventory.files.length,165,"Exactly 165 tracked B2 resource records");
let total=0;
for(const row of inventory.files){
 const p=path.join(root,pre,row.path);assert.ok(fs.statSync(p).isFile(),row.path);
 const bytes=fs.readFileSync(p);assert.equal(bytes.length,row.bytes,"Size "+row.path);assert.equal(digest(bytes),row.sha256,"SHA "+row.path);total+=row.bytes;
}
assert.equal(total,inventory.totalBytes,"Inventory byte total");
assert.equal(inventory.largestFileBytes,Math.max(...inventory.files.map(row=>row.bytes)),"Largest retained file");
const walk=dir=>fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)]):[];
for(const p of walk(path.join(root,"development")))assert.ok(!p.endsWith(".blend"),"Retired Blender still tracked: "+p);
console.log("PASS batch 4-3 current-only assets: 174 manifest; 165 SHA/size verified B2 files; no development Blender");
