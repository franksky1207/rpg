#!/usr/bin/env node
"use strict";
// Same keep-on-reference policy as builder; report only, no copying.
const path=require("node:path"),policy=require("./publish-assets.cjs");
const root=path.resolve(__dirname,".."),plan=policy.inspect(root);
const totalBytes=plan.files.reduce((s,p)=>s+plan.sizes.get(p),0),includedBytes=plan.keep.reduce((s,p)=>s+plan.sizes.get(p),0);
const output={schema:2,policy:"conservative-audit-only",files:plan.files.length,totalBytes,includedBytes,candidateExcludedBytes:totalBytes-includedBytes,
 includedCount:plan.keep.length,excludedCount:plan.excluded.length,officialAudio:plan.audio,retainedSourceReferences:plan.retained,
 hardMissing:plan.missing,reviewNeeded:plan.unresolved,excluded:plan.excluded,
 notes:["Included bytes are a source selection estimate; build report measures real output.","No deployment was changed; referenced candidates retained.","Dynamic constructed URLs require browser validation."]};
if(process.argv.includes("--json"))console.log(JSON.stringify(output,null,2));
else console.log(JSON.stringify({stage:2,trackedMB:totalBytes/1e6,selectedMB:includedBytes/1e6,excludedCount:plan.excluded.length,hardMissing:plan.missing,retained:plan.retained},null,2));
if(plan.missing.length)process.exitCode=1;
