(()=>{
 const parts=Array.from({length:12},(_,i)=>`assets/bg-battle-test-${String(i+1).padStart(2,"0")}.b64?v=20260913-battlebg1`);
 Promise.all(parts.map(url=>fetch(url,{cache:"force-cache"}).then(r=>{
  if(!r.ok)throw new Error(`battle background asset ${r.status}`);
  return r.text();
 }))).then(chunks=>{
  const data=chunks.join("").replace(/\s+/g,"");
  document.documentElement.style.setProperty("--battle-bg-image",`url("data:image/webp;base64,${data}")`);
 }).catch(err=>console.warn("Battle background failed to load",err));
})();
