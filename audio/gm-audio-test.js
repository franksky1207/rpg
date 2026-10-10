/* GM 音樂音效測試中心：依正式場景及狀況呈現；不以施工批次分類。 */
(function(g){"use strict";
const audio=()=>g.CivilizationAudio;
const permitted=()=>typeof state!=="undefined"&&state?.gm===true;
const GROUPS=Object.freeze([
 {id:"system",name:"主畫面與系統",contexts:[["home","主畫面主題曲","dark-title"],["upgrade","強化／升級提示","dark-hover"],["victory","結算勝利","dark-victory"],["notice","一般通知","dark-hover"]]},
 {id:"galaxy",name:"銀河紀元",contexts:[["galaxy-explore","探索與區域環境","dark-sector"],["galaxy-combat","一般戰鬥","galaxy-battle"],["galaxy-boss","Boss／文明災厄","boss-orchestra"],["galaxy-review","銀河回顧","dark-pulse"]]},
 {id:"universe",name:"宇宙紀元",contexts:[["universe-explore","宇宙探索","dark-sector"],["universe-combat","宇宙戰鬥","galaxy-battle"],["universe-boss","Boss／文明災厄","boss-orchestra"],["universe-review","宇宙回顧","dark-pulse"]]},
 {id:"higher",name:"高維紀元",contexts:[["higher-explore","高維探索","dark-airy"],["higher-combat","高維戰鬥","dark-urgent"],["higher-boss","高維 Boss","boss-orchestra"],["alternate","異宇宙／深度","dark-pulse"]]},
 {id:"combat",name:"戰鬥與技能",events:["attack","critical","dodge","combo","counter","shield","drain","penetration","mark","berserk","victory","defeat"]},
 {id:"monsters",name:"怪物與特殊遭遇",contexts:[["monster-entrance","一般怪物登場",null],["elite-entrance","菁英登場",null],["boss-entrance","Boss 登場",null],["special-entrance","特殊怪出現",null],["monster-death","怪物死亡",null]]},
 {id:"dungeons",name:"副本與特殊戰鬥",contexts:[["bounty","懸賞戰（銀河／宇宙）","galaxy-battle"],["arena","競技場","dark-urgent"],["mirror","鏡像戰","boss-orchestra"],["void","虛空戰","dark-pulse"],["calamity","文明災厄","boss-orchestra"],["alternate-dungeon","異宇宙挑戰","dark-urgent"]]},
 {id:"mix",name:"情境混音測試",contexts:[["mix-calm","寧靜探索","dark-airy"],["mix-fight","一般連戰","galaxy-battle"],["mix-tense","強敵迫近","dark-urgent"],["mix-boss","Boss 戰","boss-orchestra"],["mix-victory","勝利返回","dark-victory"]]}
]);
let group="higher",selected="higher-explore",wasPresent=false,checking=false;
const REVIEW_KEY="civilization.gm.audio.review.v1";
const RESULTS={ok:"有聲音，音量正常",low:"有聲音，但太小聲",silent:"沒有聲音",bad:"有聲音，但不適合場景"};
let reviews={};
try{const parsed=JSON.parse(localStorage.getItem(REVIEW_KEY)||"{}");if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed))reviews=parsed;}catch(_){}
function entryKey(row=current()){return row?(row.event?"event:":"scene:")+row.id:null;}
function reviewLabel(row){return RESULTS[reviews[entryKey(row)]?.result]||"尚未填寫";}
function reviewControl(){
 const result=reviews[entryKey()]?.result||"";
 const buttons=Object.entries(RESULTS).map(([id,name])=>'<button type="button" class="btn '+(result===id?'blue':'')+'" aria-pressed="'+(result===id)+'" onclick="gmSoundRecord(\''+id+'\')">'+name+'</button>').join('');
 return '<div style="margin-top:12px"><div style="margin-bottom:8px">我的聆聽紀錄：<b id="gmSoundReviewLabel">'+reviewLabel(current())+'</b></div><div class="controls gm-sound-review-actions" style="display:flex;flex-wrap:wrap;gap:8px">'+buttons+'</div><div class="controls" style="margin-top:10px"><button class="btn" type="button" onclick="gmSoundCopyReport()">複製驗收摘要</button></div><div class="muted" id="gmSoundReportStatus" role="status"></div></div>';
}
g.gmSoundRecord=result=>{
 if(!visible()||!entryKey())return false;
 const key=entryKey();
 if(!RESULTS[result])delete reviews[key];
 else {
 const row=current(),asset=audio()?.tracks?.[row.asset];
 reviews[key]={result,asset:row.asset||null,url:asset?.url||null,context:groupRow().name,scene:row.label,updatedAt:new Date().toISOString()};
 }
 try{localStorage.setItem(REVIEW_KEY,JSON.stringify(reviews));}catch(_){}
 refresh();
 return true;
};
g.gmSoundCopyReport=()=>{
 if(!visible())return false;
 const rows=Object.entries(reviews).filter(([,v])=>RESULTS[v?.result]);
 const all=GROUPS.flatMap(gp=>(gp.events?gp.events.map(id=>({key:"event:"+id,label:audio()?.combatCatalog?.[id]?.label||id,context:gp.name})):gp.contexts.map(([id,label])=>({key:"scene:"+id,label,context:gp.name}))));
 const missing=all.filter(x=>!RESULTS[reviews[x.key]?.result]);
 const output=['《文明戰線・GM 音樂音效聆聽回報》','全部項目：'+all.length+'｜已填寫：'+rows.length+'｜尚未填寫：'+missing.length,'此摘要為玩家本機聆聽紀錄，尚未同步 GitHub。','【已填寫】',...rows.map(([key,v])=>key+'｜'+v.context+'／'+v.scene+'｜'+RESULTS[v.result]+'｜音檔 '+(v.asset||'無')+'｜URL '+(v.url||'無')+'｜記錄 '+v.updatedAt),'【尚未填寫】',...missing.map(x=>x.key+'｜'+x.context+'／'+x.label+'｜尚未填寫')].join('\\n');
 const finish=ok=>{const el=document.getElementById("gmSoundReportStatus");if(el)el.textContent=ok?"摘要已複製，請貼回 ChatGPT。":"複製失敗，請允許瀏覽器使用剪貼簿。";};
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(output).then(()=>finish(true)).catch(()=>finish(false));return true;}
 const el=document.createElement("textarea");el.value=output;el.style.position="fixed";el.style.opacity="0";document.body.appendChild(el);el.select();let ok=false;try{ok=document.execCommand("copy");}catch(_){}el.remove();finish(ok);return ok;
};

const safe=x=>String(x||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function panel(){return document.querySelector('[data-gm-section="gm-audio-test"]');}
function visible(){const node=panel();return !!(permitted()&&node?.open&&node.isConnected&&node.getClientRects().length);}
function groupRow(){return GROUPS.find(x=>x.id===group)||GROUPS[0];}
function entries(row=groupRow()){
 if(row.events)return row.events.map(id=>{const o=audio()?.combatCatalog?.[id];return {id,label:o?.label||id,asset:o?.asset||null,event:id};});
 return row.contexts.map(([id,label,asset])=>({id,label,asset}));
}
function current(){return entries().find(x=>x.id===selected)||entries()[0];}
function controls(){
 const p=audio()?.previewSettings()||{master:.7,music:.45,battle:.65};
 return ['master','music','battle'].map(k=>'<label>'+({master:"主音量",music:"音樂",battle:"戰鬥"}[k])+' <input type="range" min="0" max="100" value="'+Math.round((p[k]||0)*100)+'" oninput="CivilizationAudio.previewLevel(\''+k+'\',this.value/100)"></label>').join('');
}
function stateFor(id){
 const status=audio()?.trackStatus?.(id)||"missing";
 return ({ready:"可載入",failed:"無法載入",checking:"檢查中",unchecked:"尚未檢查",missing:"待素材・不可播放"})[status]||"尚未檢查";
}
function verifyVisible(){
 if(checking||!visible())return;
 checking=true;
 const ids=entries().map(x=>x.asset).filter(Boolean);
 audio()?.checkTracks?.(ids)?.finally(()=>{checking=false;if(visible())refresh();});
}
function content(){
 const rows=entries();
 if(!rows.some(x=>x.id===selected))selected=rows[0]?.id||"";
 return '<div class="muted gm-hub-note">依紀元、場景、事件尋找聲音，無須改變正式角色所在紀元。場景選單只顯示名稱；音檔能否載入由下方播放狀態單獨提示。聆聽評價只保存在本機，直到複製摘要回報後才進行 GitHub 素材修正。所有極簡模式完全靜音。GM 試聽不更動戰鬥、收益或存檔。</div>'
 +'<div class="controls" style="align-items:end"><label>場景分類<br><select class="btn" id="gmSoundGroup" onchange="gmSoundChooseGroup(this.value)">'+GROUPS.map(x=>'<option value="'+x.id+'" '+(x.id===group?'selected':'')+'>'+safe(x.name)+'</option>').join('')+'</select></label>'
 +'<label>場景／狀況<br><select class="btn" id="gmSoundSituation" onchange="gmSoundChooseSituation(this.value)">'+rows.map(x=>'<option value="'+safe(x.id)+'" '+(x.id===selected?'selected':'')+'>'+safe(x.label)+'（'+safe(reviewLabel(x))+'）</option>').join('')+'</select></label></div>'
 +'<div id="gmSoundStatus" class="muted" role="status" style="margin:10px 0">'+statusText()+'</div>'
 +'<div class="controls"><button class="btn blue" type="button" onclick="gmSoundPlaySelected()">▶ 試聽目前情境</button><button class="btn" type="button" onclick="CivilizationAudio.resetPreview()">■ 停止</button><button class="btn" type="button" onclick="gmSoundNext(-1)">◀ 上一項</button><button class="btn" type="button" onclick="gmSoundNext(1)">下一項 ▶</button></div>'
 +'<div class="controls" style="margin-top:10px">'+controls()+'</div>'
 +reviewControl() +'<p class="muted">目前候選音檔來自 CC0 授權作品，仍使用來源站網址；最終配樂、怪物與武器專屬素材及同源檔案本地化尚待補齊。原始來源與授權登載於 audio/A01_AUDIO_LEDGER.md。</p>';
}
function statusText(){
 const entry=current();if(!entry)return "尚無場景資料";
 const asset=audio()?.tracks?.[entry.asset];
 return entry.label+"｜"+(asset?.url?stateFor(entry.asset)+"："+asset.label+"（"+asset.license+"；播放成功前不可視為可用）":"待素材・不可播放：尚無符合品質的音檔");
}
function refresh(){const node=document.getElementById("gmSoundBody");if(node)node.innerHTML=content();}
g.gmSoundChooseGroup=id=>{if(!visible())return;group=GROUPS.some(x=>x.id===id)?id:group;selected=entries()[0]?.id||"";audio()?.resetPreview();refresh();verifyVisible();};
g.gmSoundChooseSituation=id=>{if(!visible())return;selected=entries().some(x=>x.id===id)?id:selected;audio()?.resetPreview();const node=document.getElementById("gmSoundStatus");if(node)node.textContent=statusText();};
g.gmSoundNext=step=>{if(!visible())return;const list=entries(),index=list.findIndex(x=>x.id===selected);if(!list.length)return;selected=list[(index+step+list.length)%list.length]?.id;audio()?.resetPreview();refresh();g.gmSoundPlaySelected();};
g.gmSoundPlaySelected=()=>{
 if(!visible())return false;
 const row=current();if(!row)return false;
 const ok=row.event?audio()?.combatEvent({type:row.event==="critical"||row.event==="shield"?"attack":row.event,crit:row.event==="critical",shieldAbsorbed:row.event==="shield"?10:0},{simulation:true}):row.asset?audio()?.preview(row.asset):false;
 const node=document.getElementById("gmSoundStatus");
 if(node)node.textContent=statusText()+(ok?"｜已送出播放要求，請確認是否有聲音":"｜待素材、靜音或瀏覽器無法播放");
 return !!ok;
};
g.gmAudioTestHtml=()=>permitted()?'<div id="gmSoundBody">'+content()+'</div>':"";
function guard(){
 const present=visible();
 if(wasPresent&&!present){audio()?.resetPreview();group="higher";selected="higher-explore";}
 if(!wasPresent&&present)verifyVisible();
 wasPresent=present;
}
new MutationObserver(guard).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["open","style","hidden","class"]});
document.addEventListener("toggle",guard,true);
document.addEventListener("civilization-audio-preview-status",event=>{
 if(!visible())return;
 const entry=current();
 if(entry?.asset!==event.detail?.id)return;
 const node=document.getElementById("gmSoundStatus");
 if(node)node.textContent=statusText()+(event.detail.status==="playing"?"｜正在播放":"｜音檔載入或播放失敗（來源可能不可用）");
});
document.addEventListener("civilization-audio-availability",()=>{if(visible())refresh();});
document.addEventListener("visibilitychange",()=>{if(document.hidden)audio()?.resetPreview();else if(visible())verifyVisible();});
g.registerGmHubSection?.("test","音樂音效測試中心",g.gmAudioTestHtml,{id:"gm-audio-test"});
g.GM_AUDIO_TEST_CATALOG_VERSION=6;
})(window);
