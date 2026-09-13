(()=>{
 const parts=Array.from({length:6},(_,i)=>`assets/bg-map-reupload-${String(i+1).padStart(2,"0")}.b64?v=20260913-mapbg6`);
 let ready=false;
 function sync(){
  const active=ready && !!document.querySelector("#main .map-screen");
  document.body.classList.toggle("map-background-active",active);
 }
 Promise.all(parts.map(url=>fetch(url,{cache:"no-store"}).then(r=>{
  if(!r.ok)throw new Error(`map background asset ${r.status}`);
  return r.text();
 }))).then(chunks=>{
  const data=chunks.join("").replace(/\s+/g,"");
  const probe=new Image();
  probe.onload=()=>{
   document.documentElement.style.setProperty("--map-bg-image",`url("data:image/webp;base64,${data}")`);
   ready=true;
   sync();
  };
  probe.onerror=()=>console.warn("Adventure map background decode failed");
  probe.src=`data:image/webp;base64,${data}`;
  const main=document.getElementById("main");
  if(main)new MutationObserver(sync).observe(main,{childList:true,subtree:true});
 }).catch(err=>console.warn("Adventure map background failed to load",err));
})();
