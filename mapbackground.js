(()=>{
 fetch("assets/bg-map-test.b64?v=20260913-mapbg1",{cache:"force-cache"}).then(r=>{
  if(!r.ok)throw new Error(`map background asset ${r.status}`);
  return r.text();
 }).then(data=>{
  document.documentElement.style.setProperty("--map-bg-image",`url("data:image/webp;base64,${data.replace(/\s+/g,"")}")`);
 }).catch(err=>console.warn("Adventure map background failed to load",err));
})();
