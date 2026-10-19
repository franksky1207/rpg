'use strict';
// One invocation executes every distinct original test, then maps its evidence
// into all original categories. Never consume results from a previous run.
const fs=require('node:fs'),cp=require('node:child_process');
const historical={
 'scripts/batch1-fixed12-evidence.cjs':{kind:1,report:'batch1-fixed12-evidence.json',timeout:120000},
 'scripts/batch2-final13-evidence.cjs':{kind:2,report:'batch2-final13-evidence.json',timeout:150000},
 'scripts/batch3-integrated-evidence.cjs':{kind:3,report:'batch3-integrated-evidence.json',timeout:240000}
};
function createRunner(tests){
 const completed=new Map(),budgets=new Map();let executions=0;
 fs.mkdirSync('batch6-final16-logs',{recursive:true});
 const key=(file,args)=>JSON.stringify([file,args]);
 function entries(file){const h=historical[file];return require('../'+file).map(r=>h.kind===1?{label:r[1],file:r[3],args:[],id:r[0]}:{label:r[0],file:r[1],args:r[2]||[]});}
 function plan(file,args=[],timeout=300000){
  if(historical[file]){for(const row of entries(file))plan(row.file,row.args,historical[file].timeout);return;}
  const k=key(file,args);budgets.set(k,Math.min(budgets.get(k)||Infinity,timeout));
 }
 for(const row of tests)plan(row[2],row[3]||[]);
 function run(file,args=[]){
  const k=key(file,args);if(completed.has(k))return {...completed.get(k),reusedInThisRun:true};
  const start=Date.now();let result;
  if(historical[file]){
   const h=historical[file],rows=entries(file).map(row=>{
    const r=run(row.file,row.args);
    return {id:row.id,scope:row.label,file:row.file,status:r.status,durationMs:r.durationMs,elapsedMs:r.durationMs,ms:r.durationMs,exitCode:r.exitCode,tail:r.tail,logPath:r.logPath,executionId:r.executionId,reusedInThisRun:r.reusedInThisRun===true};
   });
   const report={schema:`cw.batch${h.kind}.${h.kind===1?'fixed12.evidence':h.kind===2?'final13.evidence':'integrated'}.v1`,sha:process.env.GITHUB_SHA||'local',scope:'All original assertions executed; duplicate references share evidence only within this invocation. Not iPhone hardware or full cartesian coverage.',...(h.kind===3?{rows}:{results:rows})};
   fs.writeFileSync(h.report,JSON.stringify(report,null,2)+'\n');
   result={status:rows.every(r=>r.status==='pass')?'pass':'fail',exitCode:rows.every(r=>r.status==='pass')?0:1,durationMs:Date.now()-start,tail:rows.map(r=>`${r.status} ${r.scope}${r.status==='pass'?'':'\n'+r.tail}`).join('\n'),logPath:h.report};
  }else{
   const executionId=++executions,logPath=`batch6-final16-logs/${String(executionId).padStart(2,'0')}-${file.split('/').pop()}.log`;
   const r=fs.existsSync(file)?cp.spawnSync(process.execPath,[file,...args],{encoding:'utf8',timeout:budgets.get(k),maxBuffer:16*1024*1024,env:{...process.env,RUNTIME_SMOKE_URL:'http://127.0.0.1:4173/index.html'}}):null;
   const output=(r?.stdout||'')+'\n'+(r?.stderr||'')+(r?.error?'\n'+r.error.stack:'');
   fs.writeFileSync(logPath,output);
   result={status:!r?'missing':r.error?'error':r.status===0?'pass':'fail',exitCode:r?.status??null,durationMs:Date.now()-start,tail:output.slice(-5500),logPath,executionId};
   console.log('BATCH6_ORIGINAL',result.status,file,result.durationMs);
   if(result.status!=='pass')console.error(output);
  }
  completed.set(k,result);return result;
 }
 return {run,summary:()=>({uniqueOriginalTests:executions,originalBudgetsPreserved:true,priorRunEvidenceUsed:false})};
}
module.exports={createRunner};
