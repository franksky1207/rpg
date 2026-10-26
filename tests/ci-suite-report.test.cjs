'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('scripts/ci-run-suite.cjs','utf8');
function simulate(statuses){
 const reports=[],summary=[],calls=[];
 const suites={S:['echo alpha','echo beta']};
 const fsStub={
  writeFileSync:(name,content)=>reports.push({name,data:JSON.parse(content)}),
  appendFileSync:(name,content)=>summary.push(content)
 };
 const spawnSync=()=>{calls.push(1);const code=statuses[calls.length-1];return {status:code,signal:null};};
 const context={
  require:name=>name==='node:fs'?fsStub:name==='node:child_process'?{spawnSync}:name==='./ci-suites.json'?suites:require(name),
  process:{argv:['node','runner','S'],env:{GITHUB_SHA:'test-sha',GITHUB_STEP_SUMMARY:'summary'},exitCode:0},
  console:{log(){}},
  Date:{now:()=>1000+calls.length*1000},
  Object
 };
 vm.runInNewContext(source,context,{filename:'ci-run-suite.cjs'});
 return {reports,summary,calls,exitCode:context.process.exitCode};
}
test('CI suite preserves fail-fast exit status and writes failure evidence',()=>{
 const r=simulate([7,0]);
 assert.equal(r.calls.length,1);
 assert.equal(r.exitCode,7);
 assert.equal(r.reports.at(-1).data.passed,false);
 assert.equal(r.reports.at(-1).data.commands.length,1);
 assert.ok(r.summary.join('').includes('FAIL'));
 assert.match(r.summary.join(''),/\| 7 \|/);
});
test('successful CI suite preserves two command executions and success summary',()=>{
 const r=simulate([0,0]);
 assert.equal(r.calls.length,2);
 assert.equal(r.exitCode,0);
 assert.equal(r.reports.at(-1).data.passed,true);
 assert.ok(r.summary.join('').includes('PASS'));
});
