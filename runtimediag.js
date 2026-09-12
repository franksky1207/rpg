(function(){
 const MAX=20;
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
 function show(title,detail,tone='error'){
  let box=document.getElementById('runtimeDiagBox');
  if(!box){
   box=document.createElement('div');box.id='runtimeDiagBox';
   document.body.appendChild(box);
  }
  const ok=tone==='ok';
  box.style.cssText=`position:fixed;right:8px;bottom:8px;z-index:999999;max-width:min(92vw,720px);max-height:55vh;overflow:auto;background:${ok?'#0d2b16':'#2b0d0d'};color:${ok?'#dcffe6':'#ffe3e3'};border:2px solid ${ok?'#63d784':'#ff6868'};border-radius:10px;padding:10px 12px;font:12px/1.45 monospace;white-space:pre-wrap;box-shadow:0 8px 30px #000a`;
  box.textContent=title+'\n'+detail+(ok?'':'\n\n請把這個紅框內容截圖或貼給 ChatGPT。');
 }
 window.addEventListener('error',function(e){
  const detail=`${e.message||'Error'}\n${e.filename||''}:${e.lineno||0}:${e.colno||0}`;
  push('error',e.message,detail);show('【Runtime Error】',detail);
 },true);
 window.addEventListener('unhandledrejection',function(e){
  const r=e.reason,detail=r?.stack||r?.message||safe(r)||'Unhandled rejection';
  push('rejection',detail);show('【Unhandled Promise】',detail);
 });
 async function scanAllScripts(){
  const nodes=Array.from(document.scripts).filter(s=>s.src&&!s.src.includes('/runtimediag.js'));
  const seen=new Set(),errors=[];
  for(const node of nodes){
   const url=new URL(node.src,location.href);url.search='';
   if(url.origin!==location.origin||seen.has(url.href))continue;
   seen.add(url.href);
   try{
    const res=await fetch(url.href+'?diag='+Date.now(),{cache:'no-store'});
    if(!res.ok){errors.push(`${url.pathname.split('/').pop()}：HTTP ${res.status}`);continue;}
    const source=await res.text();
    try{new Function(source+`\n//# sourceURL=${url.href}`);}catch(err){errors.push(`${url.pathname.split('/').pop()}：${err?.message||err}`);}
   }catch(err){errors.push(`${url.pathname.split('/').pop()}：${err?.message||err}`);}
  }
  window.runtimeSyntaxScan={checked:seen.size,errors:errors.slice()};
  if(errors.length){
   show(`【全站 JS 語法掃描：${errors.length} 個錯誤】`,errors.map((x,i)=>`${i+1}. ${x}`).join('\n'));
  }else{
   show('【全站 JS 語法掃描通過】',`已檢查 ${seen.size} 支 JavaScript，未發現 SyntaxError。`,'ok');
   setTimeout(()=>document.getElementById('runtimeDiagBox')?.remove(),3500);
  }
 }
 window.addEventListener('load',()=>setTimeout(scanAllScripts,50),{once:true});
 window.showRuntimeDiag=function(){show('【Runtime Trace】',logs.map(x=>`${x.t} ${x.type} ${x.msg}\n${safe(x.extra)}\n${safe(x.s)}`).join('\n---\n')||'no logs');};
 window.clearRuntimeDiag=function(){logs.length=0;try{localStorage.removeItem('frank_rpg_runtime_diag');}catch(_){ }document.getElementById('runtimeDiagBox')?.remove();};
 window.runFullJsSyntaxScan=scanAllScripts;
})();