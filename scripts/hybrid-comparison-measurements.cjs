"use strict";
// Report specification helper, never a live sampler/renderer/GPU estimator.
const assert=require('node:assert/strict'),{sha}=require('./hybrid-comparison-fixtures.cjs');
const METRICS=['entryMs','secondEntryMs','downloadFiles','downloadBytes','decodeMs','JSHeapBytes','GPUBytes','textureBytes','CPUPercent','GPUPercent','releasedResources','longRunMs','foregroundRestoreMs'];
function frames(values,provenance){
 assert.ok(['synthetic-test','observed-t2b','observed-t2c'].includes(provenance));assert.ok(Array.isArray(values));assert.ok(values.every(v=>typeof v==='number'&&Number.isFinite(v)&&v>0));
 if(!values.length)return {status:'unavailable',reason:'no-frame-samples',provenance};
 const sorted=[...values].sort((a,b)=>a-b),mean=values.reduce((a,b)=>a+b,0)/values.length;
 return {status:provenance==='synthetic-test'?'synthetic-test':'observed',provenance,count:values.length,meanFrameMs:mean,fpsFromElapsed:1000/mean,p50FrameMs:sorted[Math.ceil(.5*sorted.length)-1],p95FrameMs:sorted[Math.ceil(.95*sorted.length)-1],p99FrameMs:sorted[Math.ceil(.99*sorted.length)-1],framesOver50Ms:values.filter(n=>n>50).length};
}
function template(controlsSHA,fixtureSHA){return {schema:'cw.t2a.measurement-report',version:1,scheme:null,caseSHA256:fixtureSHA,controlsSHA256:controlsSHA,device:{model:null,os:null,browser:null,gpu:null,viewport:null,physicalHardware:false},cachePhase:null,frameSamplesMs:[],frameSummary:frames([],'synthetic-test'),metrics:Object.fromEntries(METRICS.map(m=>[m,{status:'not-run',value:null,unit:m.endsWith('Bytes')?'bytes':m.endsWith('Percent')?'percent':m.endsWith('Ms')?'ms':'count',reason:'Renderer does not exist in T2-A'}])),resourceEstimates:[],visualScores:[],artHours:{status:'not-run',value:null},selection:'undecided'};}
function validateReport(r){
 assert.equal(r.schema,'cw.t2a.measurement-report');assert.equal(r.version,1);assert.ok(['A','B','C',null].includes(r.scheme));assert.equal(r.selection,'undecided');assert.match(r.caseSHA256,/^[a-f0-9]{64}$/);assert.match(r.controlsSHA256,/^[a-f0-9]{64}$/);
 const provenance=r.frameSummary.provenance;assert.deepEqual(r.frameSummary,frames(r.frameSamplesMs,provenance));
 for(const name of METRICS){const m=r.metrics[name];assert.ok(m&&['not-run','unavailable','observed'].includes(m.status));if(m.status==='observed'){assert.ok(typeof m.value==='number'&&Number.isFinite(m.value)&&m.value>=0);assert.ok(m.method&&m.evidence);}else{assert.equal(m.value,null);assert.ok(m.reason);}}
 for(const estimate of r.resourceEstimates){assert.equal(estimate.status,'estimate');assert.ok(estimate.formula&&Number.isFinite(estimate.value)&&estimate.value>=0);assert.ok(!Object.keys(r.metrics).some(k=>r.metrics[k]===estimate));}
 return true;
}
module.exports={METRICS,frames,template,validateReport,sha};
if(require.main===module){
 const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
 const bundle=JSON.parse(fs.readFileSync(path.join(root,'development/hybrid-comparison/t2a-v1/owner-fixtures.json'))),controls=JSON.parse(fs.readFileSync(path.join(root,'development/hybrid-comparison/t2a-v1/comparison-controls.json')));
 const r=template(sha(controls),bundle.cases[0].sha256);validateReport(r);process.stdout.write(JSON.stringify(r,null,2)+'\n');
}
