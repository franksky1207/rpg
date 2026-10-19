'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const {createRunner}=require('../../scripts/batch6-suite-runner.cjs');
const manifests=[require('../../scripts/batch1-fixed12-evidence.cjs'),require('../../scripts/batch2-final13-evidence.cjs'),require('../../scripts/batch3-integrated-evidence.cjs')];
assert.deepEqual(manifests.map(r=>r.length),[12,13,18],'every original category remains present');
const leaves=new Map();
for(const [i,entries] of manifests.entries())for(const row of entries){const file=i===0?row[3]:row[1],args=i===0?[]:row[2]||[];if(file.startsWith('tests/'))leaves.set(JSON.stringify([file,args]),{file,args});}
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'batch6-runner-')),original=cp.spawnSync,originalLog=console.log,originalError=console.error;
try{
 process.chdir(temp);
 for(const {file} of leaves.values()){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'fixture');}
 const calls=[];let fail=true;
 console.log=()=>{};console.error=()=>{};
 cp.spawnSync=(exe,args,options)=>{calls.push({file:args[0],args:args.slice(1),timeout:options.timeout});return {status:fail&&args[0].endsWith('thirdworld-background-browser.js')?1:0,stdout:'all original output',stderr:''};};
 const tests=[['16','history1','scripts/batch1-fixed12-evidence.cjs'],['16','history2','scripts/batch2-final13-evidence.cjs'],['16','history3','scripts/batch3-integrated-evidence.cjs']];
 const runner=createRunner(tests),rows=tests.map(t=>runner.run(t[2]));
 assert.ok(rows.every(r=>r.status==='fail'),'one failed original must fail every containing suite');
 assert.equal(calls.length,leaves.size,'every original executes exactly once in one invocation');
 assert.equal(new Set(calls.map(r=>JSON.stringify([r.file,r.args]))).size,leaves.size);
 assert.ok(calls.every(r=>r.timeout<300000),'original child budgets retained');
 assert.equal(calls.find(r=>r.file.endsWith('thirdworld-background-browser.js')).timeout,120000);
 assert.equal(calls.find(r=>r.file.endsWith('audio-lifecycle-browser.js')).timeout,240000);
 for(const [i,file] of ['batch1-fixed12-evidence.json','batch2-final13-evidence.json','batch3-integrated-evidence.json'].entries()){
  const report=JSON.parse(fs.readFileSync(file)),entries=report.results||report.rows;
  assert.equal(entries.length,manifests[i].length);
  assert.ok(entries.some(r=>r.status==='fail'));
 }
 fail=false;calls.length=0;
 const fresh=createRunner(tests);assert.ok(tests.map(t=>fresh.run(t[2])).every(r=>r.status==='pass'));
 assert.equal(calls.length,leaves.size,'a new invocation never consumes old evidence');
 const missing=createRunner([['x','missing','missing.cjs']]);assert.equal(missing.run('missing.cjs').status,'missing');
 originalLog('PASS full original manifest, same-run identity, failure propagation, exact child budgets and fresh invocation');
}finally{console.log=originalLog;console.error=originalError;cp.spawnSync=original;process.chdir(root);fs.rmSync(temp,{recursive:true,force:true});}
