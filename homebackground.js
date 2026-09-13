(()=>{
 const parts=[1,2,3,4].map(n=>`assets/bg-main-test-${n}.b64?v=20260913-mainbg1`);
 Promise.all(parts.map(url=>fetch(url,{cache:"force-cache"}).then(r=>{
  if(!r.ok)throw new Error(`background asset ${r.status}`);
  return r.text();
 }))).then(chunks=>{
  const data=chunks.join("").replace(/\s+/g,"");
  document.documentElement.style.setProperty("--home-bg-image",`url("data:image/webp;base64,${data}")`);
 }).catch(err=>console.warn("Main background test failed to load",err));
})();
