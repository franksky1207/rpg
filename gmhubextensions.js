(function(){
 const sections={manage:[],test:[]};
 let activeMode="manage";
 const MANAGE_SECTION_ORDER=["gm-data-management","gm-background-battle","general-manage","spec-manage","enhancement-manage","marks-manage","dungeon-manage","mirror-manage"];
 const TEST_SECTION_ORDER=["vip-test","spec-test","enhancement-test","marks-test","map-test","special-test","bounty-test","arena-test","void-test","mirror-test","calamity-test","player-title-preview","gm-story-test"];

 function sectionHtml(entry){
  let body="";
  try{body=String(entry.renderer()||"");}
  catch(err){console.error("GM hub extension renderer failed",err);body='<div class="muted gm-hub-note">擴充模組載入失敗。</div>';}
  const open=typeof window.gmHubSectionIsOpen==="function"&&window.gmHubSectionIsOpen(entry.id);
  return `<details class="gm-hub-section" ${open?"open":""} data-gm-extension="${entry.id}" ontoggle="gmHubSectionToggle('${entry.id}',this.open)"><summary>${entry.title}</summary><div class="gm-hub-body">${body}</div></details>`;
 }

 window.registerGmHubSection=function(mode,title,renderer,options={}){
  const key=mode==="test"?"test":"manage";
  if(typeof renderer!=="function")return false;
  const id=String(options?.id||`${key}-${title}`);
  if(sections[key].some(entry=>entry.id===id))return false;
  sections[key].push({id,title:String(title||"擴充"),renderer,position:options?.position==="prepend"?"prepend":"append"});
  return true;
 };

 const baseSwitch=window.gmHubSwitch;
 if(typeof baseSwitch==="function")window.gmHubSwitch=function(tab){activeMode=tab==="test"?"test":"manage";return baseSwitch(tab);};

 function insertAfterTabs(html,extra){
  if(!extra)return html;
  const start=html.indexOf('<div class="gm-hub-tabs">');
  if(start<0)return extra+html;
  const end=html.indexOf("</div>",start);
  return end>=0?html.slice(0,end+6)+extra+html.slice(end+6):extra+html;
 }

 function reorderSections(html,order){
  if(typeof document==="undefined")return html;
  const template=document.createElement("template");
  template.innerHTML=String(html||"").trim();
  const hub=template.content.querySelector(".gm-hub");
  if(!hub)return html;
  const close=Array.from(hub.children).find(el=>el.classList?.contains("gm-hub-close"))||null;
  const rows=Array.from(hub.children).filter(el=>el.matches?.("details.gm-hub-section"));
  const rank=new Map(order.map((id,index)=>[id,index]));
  const original=new Map(rows.map((el,index)=>[el,index]));
  rows.sort((a,b)=>{
   const aId=a.getAttribute("data-gm-section")||a.getAttribute("data-gm-extension")||"";
   const bId=b.getAttribute("data-gm-section")||b.getAttribute("data-gm-extension")||"";
   const aRank=rank.has(aId)?rank.get(aId):order.length+original.get(a);
   const bRank=rank.has(bId)?rank.get(bId):order.length+original.get(b);
   return aRank-bRank;
  });
  rows.forEach(row=>hub.insertBefore(row,close));
  return template.innerHTML;
 }

 const baseGmHtml=gmHtml;
 gmHtml=function(){
  let html=String(baseGmHtml()||"");
  const entries=sections[activeMode];
  const prepend=entries.filter(x=>x.position==="prepend").map(sectionHtml).join("");
  const append=entries.filter(x=>x.position!=="prepend").map(sectionHtml).join("");
  if(prepend)html=insertAfterTabs(html,prepend);
  if(append){
   const marker='<div class="controls gm-hub-close">';
   const pos=html.indexOf(marker);
   html=pos>=0?html.slice(0,pos)+append+html.slice(pos):html+append;
  }
  return reorderSections(html,activeMode==="test"?TEST_SECTION_ORDER:MANAGE_SECTION_ORDER);
 };

 window.GM_HUB_MANAGE_ORDER=MANAGE_SECTION_ORDER.slice();
 window.GM_HUB_TEST_ORDER=TEST_SECTION_ORDER.slice();
 window.GM_HUB_EXTENSION_VERSION=4;
})();