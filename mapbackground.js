(()=>{
 const parts=Array.from({length:5},(_,i)=>`assets/bg-map-test-${String(i+1).padStart(2,"0")}.b64?v=20260913-mapbg1`);
 Promise.all(parts.map(url=>fetch(url,{cache:"force-cache"}).then(r=>{
  if(!r.ok)throw new Error(`map background asset ${r.status}`);
  return r.text();
 }))).then(chunks=>{
  const data=chunks.join("").replace(/\s+/g,"");
  document.documentElement.style.setProperty("--map-bg-image",`url("data:image/webp;base64,${data}")`);
 }).catch(err=>console.warn("Adventure map background failed to load",err));
})();
