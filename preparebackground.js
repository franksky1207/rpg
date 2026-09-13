(()=>{
 const mq=window.matchMedia("(min-width:761px)");
 if(!mq.matches)return;
 const version="20260913-preparebg-desktop5";
 const parts=[
  `assets/bg-prepare-desktop-fast-01a.b64?v=${version}`,
  `assets/bg-prepare-desktop-fast-01b.b64?v=${version}`,
  `assets/bg-prepare-desktop-fast-02.b64?v=${version}`,
  `assets/bg-prepare-desktop-fast-03.b64?v=${version}`,
  `assets/bg-prepare-desktop-fast-04.b64?v=${version}`,
  `assets/bg-prepare-desktop-fast-05.b64?v=${version}`,
  `assets/bg-prepare-desktop-fast-06.b64?v=${version}`
 ];
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
