/* GM era-theme audition only; obsolete review storage cleared. */
(function(g){"use strict";
try{localStorage.removeItem("civilization.gm.audio.review.v1");}catch(_){}
const tracks=[["era-galaxy-theme","銀河紀元｜The Fall of Arcana"],["era-universe-theme","宇宙紀元｜Epic Orchestral Fantasy Theme"],["era-higher-theme","高維紀元｜Exploration Theme"]];
let chosen=0,detail="尚未播放",wasOpen=false;
const audio=()=>g.CivilizationAudio;
const panel=()=>document.querySelector('[data-gm-section="gm-audio-test"]');
const visible=()=>typeof state!=="undefined"&&state?.gm===true&&!!panel()?.open;
function html(){
 const gain=Math.round((audio()?.previewSettings?.().gmVolume??1)*100);
 return '<div id="gmSoundBody"><p class="muted">只保留三大紀元正式候選主題。循環接縫會從曲尾約 8 秒接回曲頭再播約 8 秒，不必整首等候。舊版音效與歷史試聽紀錄均已淘汰。</p>'
 +'<label>紀元主題<br><select class="btn" onchange="gmSoundSelectTheme(this.value)">'+tracks.map(([id,name],i)=>'<option value="'+i+'" '+(i===chosen?'selected':'')+'>'+name+'</option>').join('')+'</select></label>'
 +'<div class="controls" style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0"><button class="btn blue" onclick="gmSoundPlayTheme()">▶ 完整循環試聽</button><button class="btn" onclick="gmSoundSeam()">♫ 循環接縫試聽</button><button class="btn" onclick="gmSoundStop()">■ 停止</button></div>'
 +'<label>試聽音量 <input type="range" min="0" max="100" value="'+gain+'" oninput="gmSoundVolume(this.value/100)"><span id="gmSoundLevel">'+gain+'%</span></label>'
 +'<p class="muted" id="gmSoundPlaybackDetail" role="status">'+detail+'</p></div>';
}
function refresh(){const el=document.getElementById("gmSoundBody");if(el)el.outerHTML=html();}
g.gmSoundSelectTheme=value=>{if(!visible())return false;chosen=Math.max(0,Math.min(2,Number(value)||0));audio()?.stopPreview?.();detail="已切換歌曲，尚未播放";refresh();return true;};
g.gmSoundVolume=value=>{if(!visible())return false;audio()?.setPreviewVolume?.(value);const e=document.getElementById("gmSoundLevel");if(e)e.textContent=Math.round((audio()?.previewSettings?.().gmVolume??1)*100)+"%";return true;};
g.gmSoundPlayTheme=()=>{if(!visible())return false;const ok=audio()?.preview?.(tracks[chosen][0])===true;detail=ok?"正在載入完整循環版":"目前無法播放，請確認音樂設定及瀏覽器權限";const e=document.getElementById("gmSoundPlaybackDetail");if(e)e.textContent=detail;return ok;};
g.gmSoundSeam=()=>{if(!visible())return false;const ok=audio()?.previewSeam?.(tracks[chosen][0],8)===true;detail=ok?"接縫試聽：曲尾 8 秒 → 曲頭 8 秒（結束自動停止）":"目前無法播放接縫試聽";const e=document.getElementById("gmSoundPlaybackDetail");if(e)e.textContent=detail;return ok;};
g.gmSoundStop=()=>{audio()?.stopPreview?.();detail="已停止播放";const e=document.getElementById("gmSoundPlaybackDetail");if(e)e.textContent=detail;return true;};
g.gmAudioTestHtml=()=>typeof state!=="undefined"&&state?.gm===true?html():"";
document.addEventListener("civilization-audio-preview-status",e=>{if(!visible()||e.detail?.id!==tracks[chosen][0])return;const d=e.detail;const label=({playing:"播放中",failed:"播放失敗",volume:"音量已更新",blocked:"播放受限制","seam-tail":"已跳至曲尾","seam":"已接回曲頭","seam-done":"接縫試聽完成"})[d.status]||"載入中";const node=document.getElementById("gmSoundPlaybackDetail");if(node)node.textContent=label+"｜輸出音量："+Math.round((d.volume??0)*100)+"%"+(d.reason?"｜"+d.reason:"");});
new MutationObserver(()=>{const now=visible();if(wasOpen&&!now){audio()?.stopPreview?.();g.CivilizationAudioScenes?.restore?.();}wasOpen=now;}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["open"]});
g.registerGmHubSection?.("test","音樂音效測試中心",g.gmAudioTestHtml,{id:"gm-audio-test"});
g.GM_AUDIO_TEST_CATALOG_VERSION=17;
})(window);
