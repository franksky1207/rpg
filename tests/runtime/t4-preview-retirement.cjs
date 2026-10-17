'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const ledger=JSON.parse(fs.readFileSync('development/retired-formal-previews/20261013/source-evolution.json'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(ledger.publish,false);
for(const [p,row] of Object.entries(ledger.files)){
 assert.equal(sha(fs.readFileSync(row.archive)),row.beforeSHA256,p+' archive altered');
 assert.equal(sha(cp.execFileSync('git',['show',ledger.baselineHEAD+':'+p])),row.beforeSHA256,p+' baseline');
 if(row.afterSHA256===null)assert.equal(fs.existsSync(p),false,p+' must remain retired');
 else if(p==='3d-test/test-center.js'||p==='3d-test/index.html'||p==='index.html'||p==='combatfx.js'){
  const verify=require('../../development/hybrid-comparison/t2b3-v1/source-version.cjs');
  const oldSHA=sha(cp.execFileSync('git',['show','10ef9222427050eadf42b8f61b4d153da7b049b6:'+p]));
  verify(p,oldSHA); // Original T4 lock + exact one-query Batch28 transform.
  const read=fs.readFileSync,current=read(p,'utf8');
  try{
   fs.readFileSync=function(file,...args){return file===p?current+'\n// unauthorized extra change':read.call(fs,file,...args);};
   assert.throws(()=>verify(p,oldSHA),/Only authorized GM cache-bust changes|Exact authorized blade\/thrust synchronization source|GM visual center exact batch 2-2 approved source|Only approved dead 3D GM path removal allowed/);
  }finally{fs.readFileSync=read;}
 }else assert.equal(sha(fs.readFileSync(p)),row.afterSHA256,p+' exact authorized retirement');
}
for(const p of ['index.html','ui.js','worldmapui.js','storyui.js','alternateuniverseui.js','story.css']){
 const s=fs.readFileSync(p,'utf8');assert.doesNotMatch(s,/civilization3d(?:FormalHost|StoryHost|HomeToggle|GalaxyToggle|Toggle|HideStoryPreview|HomeRouteRendered)|galaxy3dPreviewControl|formal-home\.js|formal-dom\.js|preview-expand\.css|story-3d-preview/,p+' decorative dependency');
}
const index=fs.readFileSync('index.html','utf8');assert.match(index,/t3b-formal-entry.js\?v=/);assert.match(index,/gm3dprototype.js/);
for(const p of ['3d-test/prototype-engine.js','3d-test/runtime.js','3d-test/test-center.js','3d-test/character-assets.js','3d-test/shared-loader.js','3d-test/formal-snapshots.js'])assert.ok(fs.existsSync(p),'GM/formal shared retained '+p);
const plan=require('../../scripts/publish-assets.cjs').inspect(process.cwd());assert.equal(plan.missing.length,0);assert.ok(!plan.keep.some(p=>p.startsWith('development/')));
console.log('PASS T4 exact retirement/history/source protection, no formal decoration references, shared GM/B preserved, publish isolated');
