/* Simplified era music director. Three local themes only; battles use the era
   theme until the three shared battle tracks are selected. No legacy sounds. */
(function(g){"use strict";
const eraTracks=Object.freeze({galaxy:"era-galaxy-theme",universe:"era-universe-theme",higher:"era-higher-theme"});
const catalog=Object.freeze(Object.fromEntries(Object.entries(eraTracks).map(([era,id])=>[era,Object.freeze({home:[id,null],explore:[id,null],battle:[id,null],boss:[id,null],front:[id,null]})])));
let selected=null,previewing=false;
function phase(){
 try{const n=Number(g.currentWorldPhase?.(typeof state!=="undefined"?state:null));if(n===3)return "higher";if(n===2)return "universe";if(n===1)return "galaxy";}catch(_){}
 const st=typeof state!=="undefined"?state:null;
 const p=Number(st?.worldPhase??st?.world);
 return p===3?"higher":p===2?"universe":"galaxy";
}
function resolve(era,scene){
 const actual=eraTracks[era]?era:phase();
 return {era:actual,scene:scene||"home",music:eraTracks[actual],ambient:null};
}
function auditionOpen(){return !!document.querySelector('[data-gm-section="gm-audio-test"][open]');}
function apply(){
 if(!selected||auditionOpen()||previewing)return false;
 const audio=g.CivilizationAudio;
 audio?.prioritizeEraTheme?.(selected.era);
 if(audio?.isSilent?.()||audio?.settings?.().musicEnabled===false)return false;
 const id=selected.music;
 if(audio?.currentMusicId?.()===id)return audio?.resumeMusic?.()===true;
 return audio?.playMusic?.(id)===true;
}
function setContext(era,scene,{preview=false}={}){
 if(preview)return previewContext(era,scene);
 const item=resolve(era,scene);
 if(selected?.music===item.music){selected=item;return apply();}
 selected=item;return apply();
}
function syncView(viewName,subScreen=""){
 return setContext(phase(),String(viewName||"home")+(subScreen?":"+subScreen:""));
}
function previewContext(era,scene){
 if(typeof state==="undefined"||state?.gm!==true)return false;
 previewing=true;return g.CivilizationAudio?.preview?.(resolve(era,scene).music)===true;
}
function stopPreview(){g.CivilizationAudio?.stopPreview?.();previewing=false;}
function restore(){previewing=false;return apply();}
function stop(){selected=null;previewing=false;g.CivilizationAudio?.stopMusic?.();}
function notify(type,detail={}){
 if(type==="navigation")return syncView(detail.view,detail.subScreen);
 // Real combat contexts are retained as labels, but no old battle soundtrack is invoked.
 return setContext(phase(),type||"home");
}
document.addEventListener("civilization-audio-unlocked",()=>{if(typeof view!=="undefined")syncView(view,typeof adventureScreen==="string"?adventureScreen:"");restore();});
document.addEventListener("civilization-audio-scene",e=>{if(e.detail?.type)notify(e.detail.type,e.detail);else if(e.detail?.era)setContext(e.detail.era,e.detail.scene);});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&!auditionOpen())restore();});
document.addEventListener("civilization-audio-settings-changed",e=>{
 if(e.detail?.key==="musicEnabled"&&g.CivilizationAudio?.settings?.().musicEnabled!==false)restore();
});
new MutationObserver(()=>{if(!g.CivilizationAudio?.isSilent?.()&&!auditionOpen())restore();}).observe(document.body,{attributes:true,attributeFilter:["class"]});
g.CivilizationAudioScenes=Object.freeze({version:5,catalog,phase,resolve,syncView,setContext,previewContext,stopPreview,notify,restore,stop,current:()=>selected?{...selected}:null});
})(window);
