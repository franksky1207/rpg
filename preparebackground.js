(()=>{
 const mq=window.matchMedia("(min-width:761px)");
 if(!mq.matches)return;
 const version="20260913-preparebg-desktop4";
 const parts=[1,2,3,4,5,6].map(i=>`assets/bg-prepare-desktop-fast-${String(i).padStart(2,"0")}.b64?v=${version}`);
 Promise.all(parts.map(url=>fetch(url,{cache:"force-cache"}).then(r=>{
  if(!r.ok)throw new Error(`Desktop prepare background asset ${r.status}`);
  return r.text();
 }))).then(chunks=>{
  const data=chunks.join("").replace(/\s+/g,"");
  const src=`data:image/webp;base64,${data}`;
  const probe=new Image();
  probe.onload=()=>document.documentElement.style.setProperty("--prepare-bg-image",`url("${src}")`);
  probe.onerror=()=>console.warn("Desktop prepare background image decode failed");
  probe.src=src;
 }).catch(err=>console.warn("Desktop prepare background failed to load",err));
})();
