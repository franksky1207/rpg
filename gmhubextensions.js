(function(){
 const sections={manage:[],test:[]};
 let activeMode="manage";
 function sectionHtml(entry){let body="";try{body=String(entry.renderer()||"");}catch(err){console.error("GM hub extension renderer failed",err);body='<div class="muted gm-hub-note">擴充模組載入失敗。</div>';}return `<details class="gm-hub-section" ${entry.open?"open":""} data-gm-extension="${entry.id}"><summary>${entry.title}</summary><div class="gm-hub-body">${body}</div></details>`;}
 window.registerGmHubSection=function(mode,title,renderer,options={}){const key=mode==="test"?"test":"manage";if(typeof renderer!=="function")return false;const id=String(options?.id||`${key}-${title}`);if(sections[key].some(entry=>entry.id===id))return false;sections[key].push({id,title:String(title||"擴充"),renderer,open:options?.open===true});return true;};
 const baseSwitch=window.gmHubSwitch;
 if(typeof baseSwitch==="function")window.gmHubSwitch=function(tab){activeMode=tab==="test"?"test":"manage";return baseSwitch(tab);};
 const baseGmHtml=gmHtml;
 gmHtml=function(){const html=String(baseGmHtml()||"");const extra=sections[activeMode].map(sectionHtml).join("");if(!extra)return html;const marker='<div class="controls gm-hub-close">';const pos=html.indexOf(marker);return pos>=0?html.slice(0,pos)+extra+html.slice(pos):html+extra;};
 window.GM_HUB_EXTENSION_VERSION=1;
})();