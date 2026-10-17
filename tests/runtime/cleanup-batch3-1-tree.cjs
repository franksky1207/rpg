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
const removedOutside=before.filter(x=>!x.path.startsWith(prefix)&&!now.has(x.path)).map(x=>x.path);
const authorizedScripts=new Set(["scripts/equipment-art-review.py","scripts/equipment-asset-production-gate.py","scripts/equipment-concept-batches.py","scripts/equipment-concepts.py","scripts/equipment-modeling-gate.py","scripts/equipment-review-policy-v3.json"]);
for(const path of removedOutside)assert.ok(path.startsWith("tests/equipment-concepts/")||authorizedScripts.has(path)||path.startsWith("development/hybrid-comparison/t2b3-v1/evidence/")||path.startsWith("development/hybrid-comparison/t2b2-v1/review/")||/^development\/hybrid-comparison\/t2b2-v1\/repair-r[12]\//.test(path)||path.startsWith("docs/evidence/equipment-g")||path.startsWith("docs/evidence/equipment-policy/")||path.startsWith("docs/evidence/batch28-autonomous-review/")||path.startsWith("docs/evidence/batch28-review/")||path.startsWith("docs/evidence/batch28-g021-g030/")||path.startsWith("docs/evidence/batch28-local-art/")||path.startsWith("docs/evidence/batch28-five-slot-design/")||path.startsWith("development/art-candidates/batch28-g006-g007-2026-10-14/")||path.startsWith("docs/evidence/batch28-consolidated/")||path.startsWith("docs/evidence/t2b2-repair-r1/")||path.startsWith("docs/evidence/t2b2-repair-r2/")||/^docs\/evidence\/equipment-phase4\/gm-panel-(?:390|844|1365)\.png$/.test(path)||/^docs\/evidence\/equipment-phase5-weapons\/weapons-(?:panel-(?:390|844|1365)-g007|swing-(?:390|844)-g007|swing-1365-g(?:005|007|018))\.png$/.test(path)||/^docs\/2_5D_EQUIPMENT_G\d\d_ACCEPTANCE_/.test(path)||new Set(["docs/2_5D_EQUIPMENT_210_SET_SIX_PHASE_TRANSFORMATION_MASTER_PLAN_2026-10-15.md","docs/2_5D_EQUIPMENT_210_SET_VISUAL_DIRECTION_2026-10-15.md","docs/2_5D_EQUIPMENT_PRODUCTION_UNIFIED_SOP_2026-10-15.md","docs/3D_EQUIPMENT_210_SET_CONCEPT_NAMING_STANDARD_2026-10-11.md","docs/3D_EQUIPMENT_ART_DIRECTION.md","docs/3D_EQUIPMENT_CONCEPT_BATCH_ART_WORKFLOW_2026-10-11.md","docs/3D_EQUIPMENT_CONCEPT_BATCH_A_2026-10-11.md","docs/BATCH28_AUTONOMOUS_ART_REVIEW_INTEGRATION_2026-10-15.md","docs/BATCH28_DELEGATED_ART_REVIEW_AND_CONSOLIDATED_EXECUTION_2026-10-14.md","docs/BATCH28_EQUIPMENT_CONCEPT_TWO_STAGE_SOP_2026-10-15.md","docs/BATCH28_G001_G020_IMAGE_AUDIT_2026-10-13.md","docs/BATCH28_G001_G020_REVIEW_2026-10-13.md"]).has(path),"Unexpected source deletion: "+path);
if(removedOutside.length)assert.ok([35,247,667,1580,1805,1816].includes(removedOutside.length),"Unknown deletion increment from batches 3-2 / 3-3: "+removedOutside.length);
assert.equal(removedOutside.filter(path=>path.startsWith("tests/equipment-concepts/")).length,removedOutside.length?29:0,"Retired art-only fixture count");
for(const p of ["development/3d-source/equipment/concepts/_concept-index.json","development/3d-source/equipment/concepts/_concept-identities.json"])
 assert.ok(!fs.existsSync(p),"Deleted catalogue still present: "+p);
for(const p of ["assets/gm-equipment-2_5d/v1/catalog.json","assets/gm-equipment-2_5d/v1/g005.webp","assets/gm-equipment-2_5d/v1/g007.webp","assets/gm-equipment-2_5d/v1/g018.webp",
 "development/equipment-2_5d/gm-publication.json","data.js","combatcore.js","resource-cache-client.js"])assert.ok(fs.existsSync(p),"Protected runtime dependency missing: "+p);
const info={removed:gone.length,removedBytes:gone.reduce((s,x)=>s+x.size,0),remainingConceptFiles:after.filter(x=>x.path.startsWith(prefix)).length,protectedUnchanged:true};
console.log("PASS Batch 3-1 exact Git tree deletion:",JSON.stringify(info));
