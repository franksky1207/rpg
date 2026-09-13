(()=>{
 function loadBattleBackground(parts,varName,label){
  Promise.all(parts.map(url=>fetch(url,{cache:"force-cache"}).then(r=>{
   if(!r.ok)throw new Error(`${label} battle background asset ${r.status}`);
   return r.text();
  }))).then(chunks=>{
   const data=chunks.join("").replace(/\s+/g,"");
   const src=`data:image/webp;base64,${data}`;
   const probe=new Image();
   probe.onload=()=>document.documentElement.style.setProperty(varName,`url("${src}")`);
   probe.onerror=()=>console.warn(`${label} battle background image decode failed`);
   probe.src=src;
  }).catch(err=>console.warn(`${label} battle background failed to load`,err));
 }
 const version="20260913-battlebg-stable1";
 const desktopParts=Array.from({length:12},(_,i)=>`assets/bg-battle-test-${String(i+1).padStart(2,"0")}.b64?v=${version}`);
 loadBattleBackground(desktopParts,"--battle-bg-image","Desktop");
})();
