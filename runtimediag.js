(function(){
 const MAX=12;
 const logs=[];
 function safe(v){
  try{return typeof v==='string'?v:JSON.stringify(v);}catch(_){return String(v);}
 }
 function snapshot(){
  let active=null;
  try{active=typeof getActiveDungeonRun==='function'?getActiveDungeonRun():null;}catch(_){active='ERR';}
  return {
   view:typeof view==='undefined'?'?':view,
   battleBusy:typeof battleBusy==='undefined'?'?':battleBusy,
   attempts:typeof state!=='undefined'?state?.dungeon?.attempts:null,
   activeRun:active
  };
 }
 function push(type,msg,extra){
  logs.push({t:new Date().toLocaleTimeString(),type,msg:String(msg||''),extra:extra||null,s:snapshot()});
  while(logs.length>MAX)logs.shift();
  try{localStorage.setItem('frank_rpg_runtime_diag',JSON.stringify(logs));}catch(_){ }
 }
 function show(title,detail){
  let box=document.getElementById('runtimeDiagBox');
  if(!box){
   box=document.createElement('div');box.id='runtimeDiagBox';
   box.style.cssText='position:fixed;right:8px;bottom:8px;z-index:999999;max-width:min(92vw,620px);max-height:46vh;overflow:auto;background:#2b0d0d;color:#ffe3e3;border:2px solid #ff6868;border-radius:10px;padding:10px 12px;font:12px/1.45 monospace;white-space:pre-wrap;box-shadow:0 8px 30px #000a';
   document.body.appendChild(box);
  }
  box.textContent=title+'\n'+detail+'\n\n請把這個紅框內容截圖或貼給 ChatGPT。';
 }
 window.addEventListener('error',function(e){
  const detail=`${e.message||'Error'}\n${e.filename||''}:${e.lineno||0}:${e.colno||0}`;
  push('error',e.message,detail);show('【Runtime Error】',detail);
 },true);
 window.addEventListener('unhandledrejection',function(e){
  const r=e.reason,detail=r?.stack||r?.message||safe(r)||'Unhandled rejection';
  push('rejection',detail);show('【Unhandled Promise】',detail);
 });
 function wrap(name){
  const base=window[name];if(typeof base!=='function'||base.__runtimeDiagWrapped)return;
  const wrapped=function(...args){
   push('call',name,{args});
   try{
    const out=base.apply(this,args);
    push('return',name,{out:typeof out==='object'?'[object]':out});
    return out;
   }catch(err){
    const detail=(err?.stack||err?.message||String(err));
    push('throw',name,detail);show(`【${name} threw】`,detail);throw err;
   }
  };
  wrapped.__runtimeDiagWrapped=true;
  window[name]=wrapped;
 }
 ['render','renderBountyDungeon','finishDungeonRun','openArenaDungeon','startArenaVenue','startArenaDungeon','startArenaStageFight'].forEach(wrap);
 window.showRuntimeDiag=function(){show('【Runtime Trace】',logs.map(x=>`${x.t} ${x.type} ${x.msg}\n${safe(x.extra)}\n${safe(x.s)}`).join('\n---\n')||'no logs');};
 window.clearRuntimeDiag=function(){logs.length=0;try{localStorage.removeItem('frank_rpg_runtime_diag');}catch(_){ }document.getElementById('runtimeDiagBox')?.remove();};
})();
