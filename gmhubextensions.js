(function(){
 const sections={manage:[],test:[]};
 let activeMode="manage";
 function sectionHtml(entry){let body="";try{body=String(entry.renderer()||"");}catch(err){console.error("GM hub extension renderer failed",err);body='<div class="muted gm-hub-note">擴充模組載入失敗。</div>';}return `<details class="gm-hub-section" ${entry.open?"open":""} data-gm-extension="${entry.id}"><summary>${entry.title}</summary><div class="gm-hub-body">${body}</div></details>`;}
 window.registerGmHubSection=function(mode,title,renderer,options={}){const key=mode==="test"?"test":"manage";if(typeof renderer!=="function")return false;const id=String(options?.id||`${key}-${title}`);if(sections[key].some(entry=>entry.id===id))return false;sections[key].push({id,title:String(title||"擴充"),renderer,open:options?.open===true,position:options?.position==="prepend"?"prepend":"append"});return true;};
 const baseSwitch=window.gmHubSwitch;
 if(typeof baseSwitch==="function")window.gmHubSwitch=function(tab){activeMode=tab==="test"?"test":"manage";return baseSwitch(tab);};
 function insertAfterTabs(html,extra){if(!extra)return html;const start=html.indexOf('<div class="gm-hub-tabs">');if(start<0)return extra+html;const end=html.indexOf("</div>",start);return end>=0?html.slice(0,end+6)+extra+html.slice(end+6):extra+html;}
 const baseGmHtml=gmHtml;
 gmHtml=function(){let html=String(baseGmHtml()||"");const entries=sections[activeMode],prepend=entries.filter(x=>x.position==="prepend").map(sectionHtml).join(""),append=entries.filter(x=>x.position!=="prepend").map(sectionHtml).join("");if(prepend)html=insertAfterTabs(html,prepend);if(append){const marker='<div class="controls gm-hub-close">';const pos=html.indexOf(marker);html=pos>=0?html.slice(0,pos)+append+html.slice(pos):html+append;}return html;};
 window.GM_HUB_EXTENSION_VERSION=2;
})();