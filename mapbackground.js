(()=>{
 const parts=[1,2,3].map(n=>`assets/bg-map-fix-${String(n).padStart(2,"0")}.b64?v=20260913-mapbg4`);
 let bgUrl="";
 function apply(){
  if(!bgUrl)return;
  const screen=document.querySelector("#main .map-screen");
  if(!screen)return;
  screen.style.backgroundImage=`linear-gradient(180deg,rgba(5,10,18,.42) 0%,rgba(5,10,18,.50) 48%,rgba(5,10,18,.62) 100%), ${bgUrl}`;
  screen.style.backgroundSize="cover";
  screen.style.backgroundPosition=window.matchMedia("(max-width:760px)").matches?"50% center":"center center";
  screen.style.backgroundRepeat="no-repeat";
 }
 Promise.all(parts.map(url=>fetch(url,{cache:"no-store"}).then(r=>{
  if(!r.ok)throw new Error(`map background asset ${r.status}`);
  return r.text();
 }))).then(chunks=>{
  const data=chunks.join("").replace(/\s+/g,"");
  bgUrl=`url("data:image/webp;base64,${data}")`;
  const probe=new Image();
  probe.onload=()=>apply();
  probe.onerror=()=>console.warn("Adventure map background decode failed");
  probe.src=`data:image/webp;base64,${data}`;
  new MutationObserver(apply).observe(document.getElementById("main"),{childList:true,subtree:true});
  window.addEventListener("resize",apply,{passive:true});
 }).catch(err=>console.warn("Adventure map background failed to load",err));
})();
