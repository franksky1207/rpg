(()=>{
 function loadBackground(parts,varName,label){
  Promise.all(parts.map(url=>fetch(url,{cache:"force-cache"}).then(r=>{
   if(!r.ok)throw new Error(`${label} background asset ${r.status}`);
   return r.text();
  }))).then(chunks=>{
   const data=chunks.join("").replace(/\s+/g,"");
   const src=`data:image/webp;base64,${data}`;
   const probe=new Image();
   probe.onload=()=>document.documentElement.style.setProperty(varName,`url("${src}")`);
   probe.onerror=()=>console.warn(`${label} background image decode failed`);
   probe.src=src;
  }).catch(err=>console.warn(`${label} background failed to load`,err));
 }

 const desktopParts=[1,2,3,4].map(n=>`assets/bg-main-test-${n}.b64?v=20260913-mainbg-mobile1`);
 const mobileParts=[1,2,3,4,5,6].map(n=>`assets/bg-main-mobile-${String(n).padStart(2,"0")}.b64?v=20260913-mainbg-mobile1`);
 loadBackground(desktopParts,"--home-bg-image","Desktop home");
 loadBackground(mobileParts,"--home-mobile-bg-image","Mobile home");
})();
