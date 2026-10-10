/* GM 音樂音效測試中心：依正式場景及狀況呈現；不以施工批次分類。 */
(function(g){"use strict";
const audio=()=>g.CivilizationAudio;
const permitted=()=>typeof state!=="undefined"&&state?.gm===true;
const GROUPS=Object.freeze([
 {id:"system",name:"主畫面與共用介面",contexts:[["home","主畫面","dark-title"],["character","角色資訊",null],["inventory","背包與裝備",null],["equipment","裝備更換",null],["upgrade","強化與升級提示","dark-hover"],["expertise","專精",null],["mark","印記",null],["civilization","文明等級",null],["shop","交易與出售",null],["redeem","裝備贖回",null],["story","劇情",null],["record","戰線紀錄",null],["cloud","雲端存讀",null],["settings","設定與帳號",null],["offline","離線結算",null],["victory","勝利結算","dark-victory"],["notice","系統通知","dark-hover"]]},
 {id:"galaxy",name:"銀河紀元",contexts:[["galaxy-explore","銀河區域與小區域","dark-sector"],["galaxy-combat","主線普通戰","galaxy-battle"],["galaxy-elite","主線菁英戰","dark-urgent"],["galaxy-boss","主線 Boss 戰","boss-orchestra"],["galaxy-calamity","銀河文明災厄","boss-orchestra"],["galaxy-review","銀河主線回顧","dark-pulse"],["galaxy-arena","銀河競技場","dark-urgent"],["galaxy-bounty","銀河懸賞戰","galaxy-battle"],["galaxy-special","特殊遭遇","dark-urgent"]]},
 {id:"universe",name:"宇宙紀元",contexts:[["universe-explore","宇宙章節與 Boss 選擇","dark-pulse"],["universe-boss","宇宙主線 Boss 戰","boss-orchestra"],["universe-calamity","宇宙文明災厄","boss-orchestra"],["universe-review","宇宙主線回顧","dark-pulse"],["universe-arena","宇宙競技場","dark-urgent"],["universe-bounty","宇宙懸賞戰","galaxy-battle"],["universe-special","特殊遭遇","dark-urgent"]]},
 {id:"higher",name:"高維紀元",contexts:[["higher-front","高維戰線・十名高維存在","dark-urgent"],["higher-stage","高維戰線・階段變化","boss-orchestra"],["higher-review","高維戰線・單場回顧","dark-pulse"],["higher-core","界弦核心",null],["higher-arena-fixed","高維競技場・定相","dark-urgent"],["higher-arena-alternate","高維競技場・異相","dark-pulse"],["alternate","異宇宙・宇宙與深度選擇","dark-pulse"],["alternate-battle","異宇宙・深度戰鬥","dark-urgent"]]},
 {id:"combat",name:"戰鬥事件與技能",events:["attack","critical","dodge","combo","counter","shield","drain","penetration","mark","berserk","victory","defeat"]},
 {id:"monsters",name:"怪物與特殊遭遇",contexts:[["monster-entrance","銀河普通怪登場",null],["elite-entrance","銀河菁英登場",null],["boss-entrance","主線 Boss 登場",null],["special-entrance","特殊遭遇出現",null],["monster-death","怪物擊敗",null]]},
 {id:"dungeons",name:"共用副本與特殊戰鬥",contexts:[["mirror","鏡像戰","boss-orchestra"],["void","虛空幻境","dark-pulse"],["calamity-galaxy","銀河文明災厄","boss-orchestra"],["calamity-universe","宇宙文明災厄","boss-orchestra"],["arena-galaxy","銀河競技場","dark-urgent"],["arena-universe","宇宙競技場","dark-urgent"],["arena-fixed","高維定相競技場","dark-urgent"],["arena-alternate","高維異相競技場","dark-pulse"],["bounty-galaxy","銀河懸賞戰","galaxy-battle"],["bounty-universe","宇宙懸賞戰","galaxy-battle"]]},
 {id:"mix",name:"情境混音測試",contexts:[["mix-calm","探索環境層","dark-airy"],["mix-fight","主線連戰","galaxy-battle"],["mix-tense","高維戰線張力","dark-urgent"],["mix-boss","Boss 戰配樂","boss-orchestra"],["mix-victory","勝利返回","dark-victory"]]}
]);
let group="higher",selected="higher-front",wasPresent=false,checking=false;
const REVIEW_KEY="civilization.gm.audio.review.v1";
const RESULTS={ok:"有聲音，音量正常",low:"有聲音，但太小聲",silent:"沒有聲音",bad:"有聲音，但不適合場景"};
let reviews={};
try{const parsed=JSON.parse(localStorage.getItem(REVIEW_KEY)||"{}");if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed))reviews=parsed;}catch(_){}
function entryKey(row=current()){return row?(row.event?"event:":"scene:")+row.id:null;}
function reviewStale(row){
 const v=reviews[entryKey(row)];if(!v||!RESULTS[v.result]||!row?.asset)return false;
 const currentUrl=audio()?.tracks?.[row.asset]?.url||null;
 return v.url!==currentUrl;
}
function reviewLabel(row){return reviewStale(row)?"素材已更新・請重新試聽":RESULTS[reviews[entryKey(row)]?.result]||"尚未填寫";}
function reviewControl(){
 const result=reviewStale(current())?"":reviews[entryKey()]?.result||"";
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
 const all=GROUPS.flatMap(gp=>(gp.events?gp.events.map(id=>({key:"event:"+id,label:audio()?.combatCatalog?.[id]?.label||id,context:gp.name})):gp.contexts.map(([id,label])=>({key:"scene:"+id,label,context:gp.name}))));
 const keys=new Set(all.map(x=>x.key));
 const stale=all.filter(x=>{const gp=GROUPS.find(y=>y.name===x.context);const row=gp?.contexts?.find(y=>x.key==="scene:"+y[0]);return row?reviewStale({id:row[0],asset:row[2]}):false;});
 const staleKeys=new Set(stale.map(x=>x.key));
 const filled=all.filter(x=>RESULTS[reviews[x.key]?.result]&&!staleKeys.has(x.key)),missing=all.filter(x=>!RESULTS[reviews[x.key]?.result]&&!staleKeys.has(x.key));
 const legacy=Object.entries(reviews).filter(([key,value])=>!keys.has(key)&&RESULTS[value?.result]);
 const line=x=>x.key+"｜"+x.context+"／"+x.label;
 const output=['《文明戰線・GM 音樂音效聆聽回報》','目前正式項目：'+all.length+'｜已填寫：'+filled.length+'｜尚未填寫：'+missing.length+'｜素材更新待重聽：'+stale.length+'｜歷史舊分類紀錄：'+legacy.length,'此摘要為玩家本機聆聽紀錄，尚未同步 GitHub。','【已填寫】',...filled.map(x=>{const v=reviews[x.key];return line(x)+'｜'+RESULTS[v.result]+'｜音檔 '+(v.asset||'無')+'｜URL '+(v.url||'無')+'｜記錄 '+v.updatedAt;}),'【素材更新待重新試聽】',...stale.map(x=>line(x)+'｜原結果 '+RESULTS[reviews[x.key].result]),'【尚未填寫】',...missing.map(x=>line(x)+'｜尚未填寫'),'【舊分類保留紀錄（未合併到新情境）】',...legacy.map(([key,v])=>key+'｜'+v.context+'／'+v.scene+'｜'+RESULTS[v.result]+'｜音檔 '+(v.asset||'無')+'｜記錄 '+v.updatedAt)].join(String.fromCharCode(10));
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
 +'<div class="controls"><button class="btn blue" type="button" onclick="gmSoundPlaySelected()">▶ 試聽目前情境</button><button class="btn" type="button" onclick="gmSoundStopPreview()">■ 停止</button><button class="btn" type="button" onclick="gmSoundNext(-1)">◀ 上一項</button><button class="btn" type="button" onclick="gmSoundNext(1)">下一項 ▶</button></div>'
 +'<div class="controls" style="margin-top:10px">'+controls()+'</div>'
 +reviewControl() +'<p class="muted">目前候選音檔來自 CC0 授權作品，仍使用來源站網址；最終配樂、怪物與武器專屬素材及同源檔案本地化尚待補齊。原始來源與授權登載於 audio/A01_AUDIO_LEDGER.md。</p>';
}
function statusText(){
 const entry=current();if(!entry)return "尚無場景資料";
 const asset=audio()?.tracks?.[entry.asset];
 return entry.label+"｜"+(asset?.url?stateFor(entry.asset)+"："+asset.label+"（"+asset.license+"；播放成功前不可視為可用）":"待素材・不可播放：尚無符合品質的音檔");
}
function refresh(){const node=document.getElementById("gmSoundBody");if(node)node.innerHTML=content();}
g.gmSoundChooseGroup=id=>{if(!visible())return;group=GROUPS.some(x=>x.id===id)?id:group;selected=entries()[0]?.id||"";g.CivilizationAudioScenes?.stopPreview?.();audio()?.resetPreview();refresh();verifyVisible();};
g.gmSoundChooseSituation=id=>{if(!visible())return;selected=entries().some(x=>x.id===id)?id:selected;g.CivilizationAudioScenes?.stopPreview?.();audio()?.resetPreview();refresh();const node=document.getElementById("gmSoundStatus");if(node)node.textContent=statusText();};
g.gmSoundNext=step=>{if(!visible())return;const list=entries(),index=list.findIndex(x=>x.id===selected);if(!list.length)return;selected=list[(index+step+list.length)%list.length]?.id;g.CivilizationAudioScenes?.stopPreview?.();audio()?.resetPreview();refresh();g.gmSoundPlaySelected();};
function a03Context(){
 const row=current();if(!row||row.event)return null;
 const scenes={
 galaxy:{"galaxy-explore":"explore","galaxy-combat":"battle","galaxy-elite":"elite","galaxy-boss":"boss","galaxy-calamity":"calamity","galaxy-review":"review","galaxy-arena":"arena","galaxy-bounty":"bounty","galaxy-special":"special"},
 universe:{"universe-explore":"explore","universe-boss":"boss","universe-calamity":"calamity","universe-review":"review","universe-arena":"arena","universe-bounty":"bounty","universe-special":"special"},
 higher:{"higher-front":"front","higher-stage":"frontStage","higher-review":"frontReview","higher-core":"core","higher-arena-fixed":"arenaFixed","higher-arena-alternate":"arenaAlternate","alternate":"alternateSelect","alternate-battle":"alternateBattle"},
 system:{home:"main",character:"character",inventory:"inventory",equipment:"equipment",upgrade:"enhance",expertise:"expertise",mark:"mark",civilization:"civilization",shop:"shop",redeem:"redeem",story:"story",cloud:"cloud",settings:"settings",offline:"offline",victory:"victory",notice:"notice",record:"record"},
 dungeons:{mirror:"mirror",void:"void","calamity-galaxy":"calamity","calamity-universe":"calamity","arena-galaxy":"arena","arena-universe":"arena","arena-fixed":"arenaFixed","arena-alternate":"arenaAlternate","bounty-galaxy":"bounty","bounty-universe":"bounty"}
 };
 const era=group==="system"?"shared":group==="dungeons"?(row.id.endsWith("-galaxy")?"galaxy":row.id.endsWith("-universe")?"universe":row.id==="arena-fixed"||row.id==="arena-alternate"?"higher":"shared"):group;
 const scene=scenes[group]?.[row.id];return scene?{era,scene}:null;
}

g.gmSoundStopPreview=()=>{g.CivilizationAudioScenes?.stopPreview?.();audio()?.resetPreview();return true;};
g.gmSoundPlaySelected=()=>{
 if(!visible())return false;
 const row=current();if(!row)return false;
 const context=a03Context();
 const mapped=context?g.CivilizationAudioScenes?.resolve?.(context.era,context.scene):null;
 const ok=row.event?audio()?.combatEvent({type:row.event==="critical"||row.event==="shield"?"attack":row.event,crit:row.event==="critical",shieldAbsorbed:row.event==="shield"?10:0},{simulation:true}):mapped&&(mapped.music||mapped.ambient)?g.CivilizationAudioScenes?.previewContext?.(context.era,context.scene):row.asset?audio()?.preview(row.asset):false;
 const node=document.getElementById("gmSoundStatus");
 if(node)node.textContent=statusText()+(ok?"｜已送出播放要求，請確認是否有聲音":"｜待素材、靜音或瀏覽器無法播放");
 return !!ok;
};
g.gmAudioTestHtml=()=>permitted()?'<div id="gmSoundBody">'+content()+'</div>':"";
function guard(){
 const present=visible();
 if(wasPresent&&!present){g.CivilizationAudioScenes?.stopPreview?.();audio()?.resetPreview();group="higher";selected="higher-front";g.CivilizationAudioScenes?.restore?.();}
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
document.addEventListener("visibilitychange",()=>{if(document.hidden){g.CivilizationAudioScenes?.stopPreview?.();audio()?.resetPreview();}else if(visible())verifyVisible();});
g.registerGmHubSection?.("test","音樂音效測試中心",g.gmAudioTestHtml,{id:"gm-audio-test"});
g.GM_AUDIO_TEST_CATALOG_VERSION=11;
})(window);
