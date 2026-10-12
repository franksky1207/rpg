import {loadData,selectInput,copyFrozen} from './fixture-input.mjs?v=20261012-t2b1-v1';
import {Playback,bindRenderer} from './playback.mjs?v=20261012-t2b1-v1';
const $=id=>document.getElementById(id),selectors=['scheme','case','variant','lod'],buttons=['play','pause','resume','replay','stop'];
const slots=['weapon','helmet','armor','shoes','accessory'],slotNames=['武器','頭盔','鎧甲','鞋子','飾品'];
const phaseNames={ready:'準備就緒',idle:'待機',prepare:'準備（純視覺步驟）',approach:'前進（純視覺步驟）',strike:'打擊 cue（純視覺步驟）','known-effect':'已知來源事件',return:'回位（純視覺步驟）',outcome:'計算結果',closed:'播放結束'};
const caseNames=['普通怪基準戰','菁英怪基準戰','Boss 基準戰','Boss 擊敗玩家','菁英特殊效果（隔離能力輸入）'];
let pack=null,loading=false,loadAbort=null,loadTicket=0,disposed=false,listenerCount=0,lastFrame=null;
const cleanups=[];
function listen(target,event,fn){target.addEventListener(event,fn);listenerCount++;cleanups.push(()=>{target.removeEventListener(event,fn);listenerCount--;});}
for(let mask=0;mask<32;mask++){const option=document.createElement('option');option.value='g007-subset-'+mask;option.textContent=mask===0?'G007 全空槽':mask===31?'G007 五槽全穿':'G007｜'+slots.filter((s,i)=>mask&(1<<i)).map(s=>slotNames[slots.indexOf(s)]).join('＋');$('variant').append(option);}
{const option=document.createElement('option');option.value='mixed-g006-g007-empty-accessory';option.textContent='G006／G007 混穿＋缺素材回退';$('variant').append(option);}$('variant').value='g007-subset-31';
const selection=()=>({scheme:$('scheme').value,caseId:$('case').value,variantId:$('variant').value,lod:$('lod').value});
function controls(){const mode=playback.mode,valid=!!pack&&!loading&&!disposed&&!playback.hidden;$('play').disabled=!valid||mode==='playing'||mode==='paused';$('pause').disabled=!valid||mode!=='playing';$('resume').disabled=!valid||mode!=='paused';$('replay').disabled=!valid;$('stop').disabled=!valid||['ready','cancelled','completed','empty'].includes(mode);$('retry').disabled=loading;}
function status(text,error=false){$('status').textContent=text;$('status').dataset.error=String(error);}
function sourceLabel(e){if(!e)return null;if(e.type==='combat-action'){const d=e.data;const names={attack:'攻擊',dodge:'閃避',combo:'連擊',counter:'反擊',drain:'汲取',mark:'印記',berserk:'狂暴',combatSafety:'動作上限',firstActor:'先手'};const who=d.sourceType==='dodge'?d.target:d.actor;return (who==='player'?'玩家':'敵人')+'｜'+(names[d.sourceType]||d.sourceType)+(d.crit===true?'（來源暴擊）':'')+(d.actualDamage!==undefined?'｜實際傷害 '+d.actualDamage:'')+(d.healed!==undefined?'｜汲取 '+d.healed:'');}return '來源事件｜'+e.type+'｜seq '+e.seq;}
function render(frame){
 if(disposed)return;lastFrame=frame;const input=frame.input;if(!input){for(const role of ['player','enemy']){$(role+'-hp').textContent='HP 未載入';$(role+'-shield').textContent='護盾未知';$(role+'-bar').value=0;}$('stage-canvas').dataset.phase='ready';$('stage-canvas').style.setProperty('--player-foot-x',.25);$('stage-canvas').style.setProperty('--enemy-foot-x',.74);$('phase-label').textContent='ready｜沒有已驗證資料';$('event-label').textContent='不會使用假事件或舊資料補位';$('outcome-label').textContent='computed 不等於 committed';controls();return;}
 $('player-name').textContent=input.playerName+'（測試身分）';$('enemy-name').textContent=input.representative.name;$('enemy-type').textContent='正式來源｜'+input.representative.kind+'／Lv'+input.representative.level;
 for(const role of ['player','enemy']){const s=frame.knownState[role];$(role+'-hp').textContent='HP '+s.hp+' / '+s.maxHp;$(role+'-bar').max=s.maxHp;$(role+'-bar').value=s.hp;$(role+'-shield').textContent=s.shield===null?'護盾未知（沒有起始權威資料）':'已知護盾 '+s.shield;}
 const stage=input.controls.stage,canvas=$('stage-canvas');canvas.dataset.phase=frame.phase;canvas.style.setProperty('--player-height',stage.playerHeight);canvas.style.setProperty('--enemy-height',stage.enemyHeightByKind[input.representative.kind]);canvas.style.setProperty('--foot-y',stage.playerFoot[1]);
 let delta=0;if(frame.sourceRef&&['approach','strike','known-effect','return'].includes(frame.phase))delta=stage.maxApproachUV*(frame.phase==='approach'?.5:frame.phase==='return'?.25:1);
 canvas.style.setProperty('--player-foot-x',stage.playerFoot[0]+(frame.sourceRef?.actor==='player'?delta:0));canvas.style.setProperty('--enemy-foot-x',stage.enemyFoot[0]-(frame.sourceRef?.actor==='enemy'?delta:0));
 $('phase-label').textContent=frame.phase+'｜'+phaseNames[frame.phase]+'｜'+frame.mode;
 $('event-label').textContent=sourceLabel(frame.sourceEvent)||(frame.checkpoint?'當前有效快照；不補播過期攻擊或聲音':'技術占位／純視覺步驟，尚未接入動畫素材');
 $('outcome-label').textContent=['outcome','closed'].includes(frame.phase)&&frame.mode!=='cancelled'?frame.outcome:'HP／盾僅使用已知起始與最終快照；不由傷害推算';
 if(frame.mode==='background')status('背景呈現已跳過；回前台僅顯示已知計算快照');else if(frame.mode==='completed'&&frame.skipped)status('已恢復當前最終快照；未補播 '+frame.skipped+' 個中間動作');else if(!loading)status('離線比較｜Renderer 未完成｜靜音｜computed，不產生正式結算');
 $('diagnostic-text').textContent=JSON.stringify({selection:frame.selection,fixtureSHA:input.fixtureSHA,caseSHA:input.caseSHA,controlsSHA:input.controlsSHA,sourceBattleId:input.events[0].battleId,playbackId:frame.playbackId,generation:frame.generation,sourceRef:frame.sourceRef,capture:input.capture,controller:playback.diagnostics(),listeners:listenerCount,renderer:'unimplemented',animation:'idle-only-existing-assets-not-loaded',performance:'not-measured'},null,2);
 controls();
}
const playback=new Playback({onFrame:render});
function choose(){if(!pack||loading||disposed)return;try{const picked=selection();const input=selectInput(pack,picked);playback.select(input,picked);if(document.hidden)playback.visibility(true);$('equipment').replaceChildren(...input.equipment.map((d,i)=>{const li=document.createElement('li');li.dataset.slot=d.type;li.dataset.kind=d.assetKind;li.textContent=slotNames[i]+'｜'+(!d.present?'空槽':d.name+'｜'+(d.assetKind==='equipment-glb'?'GLB 已登錄，尚未渲染':'fallback：尚無對應模型'))+'｜LOD '+input.lod;return li;}));}catch(error){status('資料無法使用：'+error.message,true);}}
async function reload(){
 if(disposed)return;const ticket=++loadTicket;loadAbort?.abort();loadAbort=new AbortController();pack=null;loading=true;playback.reset();$('retry').hidden=true;$('equipment').replaceChildren();$('enemy-name').textContent='正在驗證資料';$('diagnostic-text').textContent='Fixture／Case／十三個來源 SHA 驗證中';status('正在驗證 Fixture、Case 與來源 SHA…');controls();
 try{const value=await loadData({signal:loadAbort.signal});if(disposed||ticket!==loadTicket)return;pack=value;loading=false;choose();}
 catch(error){if(disposed||ticket!==loadTicket)return;loading=false;status('載入失敗：'+error.message+'。請確認開發伺服器／資料來源，不會補造事件。',true);$('retry').hidden=false;controls();}
}
function dispose(){if(disposed)return;disposed=true;loadTicket++;loadAbort?.abort();loadAbort=null;pack=null;playback.dispose();for(const cleanup of cleanups.splice(0))cleanup();lastFrame=null;}
for(const id of selectors)listen($(id),'change',choose);
for(const [id,method] of [['play','play'],['pause','pause'],['resume','play'],['replay','replay'],['stop','stop']])listen($(id),'click',()=>playback[method]());
listen($('retry'),'click',reload);listen(document,'visibilitychange',()=>playback.visibility(document.hidden));listen(window,'pagehide',event=>{dispose();if(event.persisted)window.addEventListener('pageshow',()=>location.reload(),{once:true});});
window.CivilizationHybridComparisonDev=Object.freeze({version:1,snapshot:()=>lastFrame,selection:()=>copyFrozen(selection()),input:()=>playback.input,diagnostics:()=>Object.freeze({...playback.diagnostics(),listeners:listenerCount,loaded:!!pack,loading,loadTicket}),reload,dispose,subscribe:(fn,options)=>playback.subscribe(fn,options),bindRenderer:factory=>bindRenderer(playback,factory)});
reload();
