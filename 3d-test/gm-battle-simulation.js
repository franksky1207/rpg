/* GM-only adapter for the existing B comparison Renderer/Fixture/Playback.
 * No formal combat, audio, storage or cloud owner is imported or called. */
// GM-only visual estimate from recorded owner-fixture damage; never an authoritative per-hit HP snapshot.
function displayHp(frame){
 const start=frame.input?.computed?.start;
 if(!start)return frame.knownState;
 if(frame.phase==='outcome'||frame.phase==='closed'||frame.mode==='completed'||frame.mode==='background')return frame.input.computed.final;
 const state={player:{...start.player},enemy:{...start.enemy}};
 // Timeline is one initial idle row, then six phases per combat-action.
 // Use cursor instead of sourceRef: idle frames have no ref but must retain previous damage.
 let row=1;
 for(const event of frame.input.events){
  if(event.type!=='combat-action'||event.data.sourceType==='combatSafety'){row++;continue;}
  const appliedAt=row+4;row+=6;
  if(frame.cursor<appliedAt)break;
  const d=event.data,who=d.target;
  if(!['player','enemy'].includes(who))continue;
  const damage=d.actualDamage;
  if(Number.isFinite(damage)&&damage>=0)state[who].hp=Math.max(0,state[who].hp-damage);
  if(Number.isFinite(d.shieldAbsorbed)&&d.shieldAbsorbed>0&&Number.isFinite(state[who].shield))
   state[who].shield=Math.max(0,state[who].shield-d.shieldAbsorbed);
  if(['player','enemy'].includes(d.actor)&&Number.isFinite(d.healed)&&d.healed>0)
   state[d.actor].hp=Math.min(state[d.actor].maxHp,state[d.actor].hp+d.healed);
 }
 return state;
}

export async function mount({host,signal,quality='medium'}){
 const root=new URL('../development/hybrid-comparison/',import.meta.url);
 const [{loadData,selectInput},{Playback,bindRenderer},{createRenderer,diagnostics},{elapsedClock}]=await Promise.all([
  import(new URL('fixture-input.mjs?v=20261014-b28-refined1',root)),import(new URL('playback.mjs?v=20261014-b28-refined1',root)),
  import(new URL('t2b3-v1/renderer.mjs?v=20261014-b28-refined2',root)),import(new URL('t2b3-v1/contract.mjs?v=20261012-t2b3-v1',root))]);
 signal.throwIfAborted();
 host.innerHTML=`<div class="gm-b-simulation"><div class="gm-b-controls">
 <label>基準戰<select data-b="case"><option value="normal-baseline">普通怪基準戰</option><option value="elite-baseline">菁英怪基準戰</option><option value="boss-baseline">Boss 基準戰</option><option value="boss-player-defeat">Boss 擊敗玩家</option><option value="elite-effects-owner-input">菁英特殊效果測試</option></select></label>
 <label>五槽裝備<select data-b="equipment"></select></label><label>LOD／圖集品質<select data-b="lod"><option value="low">省電</option><option value="medium">平衡</option><option value="high">高畫質</option></select></label>
 <label>動作<select data-b="clip"><option value="source">跟隨戰鬥</option>${['idle','attack','hit','dodge','return','defeat'].map(x=>`<option value="${x}">${({idle:'待機',attack:'攻擊',hit:'受擊',dodge:'閃避',return:'回位',defeat:'倒地'})[x]}</option>`).join('')}</select></label><label>畫格<input data-b="time" type="range" min="0" max="700" step="33.333" value="0" disabled></label>
 <div class="gm-b-buttons">${[['play','播放'],['pause','暫停'],['resume','繼續'],['replay','重播'],['stop','停止']].map(([x,n])=>`<button type="button" data-b="${x}">${n}</button>`).join('')}</div></div>
 <p class="gm-b-status" data-b="status" role="status">正在驗證沙盒素材…</p><div class="gm-b-arena" data-b="stage"></div>
 <div class="gm-b-hud">${['player','enemy'].map(x=>`<div><b data-b="${x}-name">${x==='player'?'測試玩家':'測試敵人'}</b><span data-b="${x}-hp"></span><progress data-b="${x}-bar" max="1" value="1"></progress><small data-b="${x}-shield"></small></div>`).join('')}</div>
 <p data-b="effect"></p><details><summary>裝備來源與效果檢視</summary><ul data-b="slots"></ul><p>GM 沙盒素材；固定 3/4 視角、即時 3D 玩家／敵人預渲染圖集。逐擊 HP 未收錄；過程血量依已記錄傷害推算，僅供 GM 視覺測試。結束值採正式樣本快照，不代表逐擊正式結算。</p></details></div>`;
 const $=name=>host.querySelector(`[data-b="${name}"]`),cleanups=[];
 let closed=false,pack=null,renderer=null,binding=null,bound=null,failed=false,lastFrame=null;
 const listen=(target,event,fn)=>{target.addEventListener(event,fn);cleanups.push(()=>target.removeEventListener(event,fn));};
 const status=text=>{$('status').textContent=text;};
 const slots=['武器','頭盔','鎧甲','鞋子','飾品'];
 for(let mask=0;mask<32;mask++)$('equipment').add(new Option(mask===0?'全空槽':mask===31?'G007 五槽全穿':slots.filter((_,i)=>mask&(1<<i)).join('＋'),'g007-subset-'+mask));
 $('equipment').add(new Option('G006／G007 混穿＋空槽（缺材明示）','mixed-g006-g007-empty-accessory'));
 $('equipment').value='g007-subset-31';$('lod').value=quality;
 const selection=()=>({scheme:'B',caseId:$('case').value,variantId:$('equipment').value,lod:$('lod').value});
 const controls=()=>{for(const name of ['play','pause','resume','replay','stop']){const disabled=closed||!pack||!!binding||playback.hidden||(name==='pause'&&playback.mode!=='playing')||(name==='resume'&&playback.mode!=='paused');if($(name).disabled!==disabled)$(name).disabled=disabled;}};
 const readClock=()=>elapsedClock({phase:playback.phase,mode:playback.mode,due:playback.due,remaining:playback.remaining,now:playback.clock.now(),eventId:playback.sourceRef?.eventId,generation:playback.generation});
 const inspection=()=>({clip:$('clip').value,timeMs:$('clip').value==='source'?null:Number($('time').value)});
 const playback=new Playback({onFrame:frame=>{
  if(closed)return;lastFrame=frame;
  if(frame.input){$('player-name').textContent=frame.input.playerName+'（沙盒）';$('enemy-name').textContent=frame.input.representative.name;
   for(const role of ['player','enemy']){const s=displayHp(frame)[role];$(role+'-hp').textContent=`HP ${s.hp.toLocaleString()} / ${s.maxHp.toLocaleString()}${frame.phase==='outcome'||frame.mode==='completed'?'':'（模擬）'}`;$(role+'-bar').max=s.maxHp;$(role+'-bar').value=s.hp;$(role+'-shield').textContent=s.shield===null?'護盾來源未收錄':`護盾 ${s.shield}`;}
   const d=frame.sourceEvent?.data;const names={attack:'攻擊',dodge:'閃避',combo:'連擊',counter:'反擊',drain:'汲取',mark:'印記'};
   $('effect').textContent=d?`${d.actor==='player'?'玩家':'敵人'} ${names[d.sourceType]||''}${d.actualDamage===undefined?'':` 傷害 ${d.actualDamage}`}${d.healed===undefined?'':` 回復 ${d.healed}`}`:frame.mode==='completed'?'播放完成；未發放收益':'';
  }controls();
 }});
 async function ready(){
  if(closed||playback.hidden||!pack)return false;
  if(bound===playback.id&&renderer&&!failed)return true;
  if(binding)await binding;
  if(closed)return false;
  if(bound===playback.id&&renderer&&!failed)return true;
  const id=playback.id;let candidate=null;failed=false;status('正在載入 B 戰鬥畫面…');
  binding=bindRenderer(playback,async context=>{candidate=await createRenderer(context,{stage:$('stage'),readClock,inspection,onError:error=>{failed=true;status('視覺暫不可用：'+error.message+'；可按播放重試。');}});return candidate;});controls();
  try{const result=await binding;if(closed||playback.id!==id)return false;if(!result.ok){failed=true;status('B 畫面載入失敗；可按播放重試。');return false;}renderer=candidate;bound=id;$('stage').querySelector('canvas')?.setAttribute('aria-label','2.5D B 戰鬥模擬');status('2.5D B 沙盒｜靜音、不寫入正式角色或存檔');return true;}
  finally{binding=null;if(!closed)controls();}
 }
 function choose(){if(!pack||closed)return;renderer=null;bound=null;failed=false;const selected=selection(),input=selectInput(pack,selected);playback.select(input,selected);$('slots').replaceChildren(...input.equipment.map((d,i)=>{const li=document.createElement('li');li.textContent=`${slots[i]}：${!d.present?'空槽':d.name+(d.assetKind==='equipment-glb'?'':'（素材 unavailable）')}`;return li;}));ready().catch(error=>{if(!closed)status(error.message);});}
 async function play(replay=false){if(!pack||closed)return;if(replay||failed||['completed','cancelled'].includes(playback.mode))choose();const id=playback.id;if(await ready()&&!closed&&playback.id===id)playback.play();}
 for(const name of ['case','equipment','lod'])listen($(name),'change',choose);
 for(const name of ['play','replay'])listen($(name),'click',()=>play(name==='replay').catch(error=>{if(!closed)status(error.message);}));
 listen($('pause'),'click',()=>playback.pause());listen($('resume'),'click',()=>playback.play());listen($('stop'),'click',()=>{playback.stop();renderer=null;bound=null;status('已停止，動畫及 GPU 資源已釋放');});
 listen($('clip'),'change',()=>{$('time').disabled=$('clip').value==='source';});
 listen(document,'visibilitychange',()=>{playback.visibility(document.hidden);if(!document.hidden){renderer=null;bound=null;status('已返回；不重播過期動作，按重播重新開始。');}});
 function dispose(){if(closed)return;closed=true;playback.dispose();pack=null;renderer=null;lastFrame=null;for(const cleanup of cleanups.splice(0))cleanup();signal.removeEventListener('abort',dispose);if(host.__gmBattleSimulation===api)delete host.__gmBattleSimulation;host.replaceChildren();}
 signal.addEventListener('abort',dispose,{once:true});
 const api=Object.freeze({dispose,setQuality:value=>{if(closed)return;$('lod').value=value;choose();},diagnostics:()=>({scheme:'B',closed,failed,rendererLoading:!!binding,playback:playback.diagnostics(),renderer:diagnostics(),current:renderer?.diagnostics(),frame:lastFrame,canCommit:false,canWriteCloud:false})});
 host.__gmBattleSimulation=api;
 try{pack=await loadData({signal,base:root});signal.throwIfAborted();choose();}catch(error){if(!closed)status('素材驗證失敗：'+error.message);}
 return api;
}
