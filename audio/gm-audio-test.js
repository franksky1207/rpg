/* Independent GM audio preview. Isolated from 3D preview and combat simulation. */
(function(g){"use strict";
const html=()=>{const audio=g.CivilizationAudio;if(!(typeof state!=="undefined"&&state?.gm===true))return "";const p=audio?.previewSettings()||{};const tracks=Object.entries(audio?.tracks||{}).map(([id,item])=>'<option value="'+id+'">'+item.label+'</option>').join("");
return '<div class="muted gm-hub-note">A01 正式授權音樂與音效候選試聽。與文字、3D 共用同一音訊引擎；極簡模式一律靜音。候選檔案目前採來源站直連，若瀏覽器或來源網站阻擋請勿視為驗收通過。</div><div class="controls"><label>音樂／音效<select class="btn" id="gmAudioTrack">'+tracks+'</select></label><button class="btn blue" onclick="gmAudioPlay()">▶ 試聽</button><button class="btn" onclick="CivilizationAudio.stopPreview()">■ 停止</button></div><div class="controls"><label>主音量 <input type="range" min="0" max="100" value="'+Math.round((p.master||0)*100)+'" oninput="CivilizationAudio.previewLevel(\'master\',this.value/100)"></label><label>音樂 <input type="range" min="0" max="100" value="'+Math.round((p.music||0)*100)+'" oninput="CivilizationAudio.previewLevel(\'music\',this.value/100)"></label><label>戰鬥 <input type="range" min="0" max="100" value="'+Math.round((p.battle||0)*100)+'" oninput="CivilizationAudio.previewLevel(\'battle\',this.value/100)"></label></div><div class="muted">聲音資產本地化、更多音效、正式情境事件與完整混音將於 A01 未結案項目及 A02～A04 持續驗收；試聽不會修改正式戰鬥或存檔。</div>';
};
g.gmAudioPlay=()=>panelIsVisible()&&g.CivilizationAudio?.preview(document.getElementById("gmAudioTrack")?.value);
g.gmAudioTestHtml=html;
// A preview is valid only while its own GM test panel is visible and expanded.
// Leaving GM, changing GM tabs, changing game pages, or closing the panel resets it.
let wasPresent=false;
function panelIsVisible(){
 const section=document.querySelector('[data-gm-section="gm-audio-test"]');
 return !!(typeof state!=="undefined"&&state?.gm===true&&section?.open&&section.isConnected&&section.getClientRects().length);
}
function guard(){
 const present=panelIsVisible();
 if(wasPresent&&!present)g.CivilizationAudio?.resetPreview();
 wasPresent=present;
}
const observer=new MutationObserver(guard);
observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["open","style","hidden","class"]});
document.addEventListener("toggle",guard,true);
document.addEventListener("visibilitychange",()=>{if(document.hidden)g.CivilizationAudio?.stopPreview();});

g.registerGmHubSection?.("test","音樂音效測試中心",html,{id:"gm-audio-test"});
})(window);
