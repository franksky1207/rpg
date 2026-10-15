/* Shared visual projection of verified B1 input; never a combat/event owner. */
export const CLIPS=Object.freeze(['idle','attack','hit','dodge','return','defeat']);
export const SLOTS=Object.freeze(['weapon','helmet','armor','shoes','accessory']);
export const GRID=Object.freeze({low:128,medium:192,high:256});
export const PHASES=Object.freeze({prepare:[0,120],approach:[120,180],strike:[300,100],'known-effect':[400,120],return:[520,180],defeat:[0,700]});
export function elapsedClock({phase,mode,due,remaining,now,generation,eventId}){
 const [offset,duration]=PHASES[phase]||[0,0];const left=mode==='playing'?Math.max(0,Math.min(duration,(due??now)-now)):Math.max(0,Math.min(duration,remaining||0));
 return Object.freeze({generation,eventId,phase,mode,elapsedMs:offset+duration-left});
}
export function sampleTime(ms){if(!Number.isFinite(ms))throw Error('Nonfinite clip time');const elapsed=Math.min(700,Math.max(0,ms));return {elapsedMs:elapsed,tick:Math.min(21,Math.floor(elapsed*30/1000+1e-6)),nativeFrame:(Math.min(21,Math.floor(elapsed*30/1000+1e-6))+1)*2};}
export function selectedLayers(equipment){const actual=new Set(equipment.filter(d=>d.present&&d.assetKind==='equipment-glb').map(d=>d.type));return ['body-base',...['helmet','armor','shoes','accessory'].filter(s=>!actual.has(s)).map(s=>'body-'+s),...SLOTS.filter(s=>actual.has(s))];}
export function project(frame,clock,{clip='source',timeMs=null}={}){
 if(!frame?.input)return null;const input=frame.input;const t=Math.min(700,Math.max(0,clock.elapsedMs));const roles={player:{clip:'idle',ms:t,x:input.controls.stage.playerFoot[0]},enemy:{clip:'idle',ms:t,x:input.controls.stage.enemyFoot[0]}};
 const event=frame.sourceRef?input.events.find(e=>e.eventId===frame.sourceRef.eventId):null;let cue=null;
 if(clip!=='source'){
  if(!CLIPS.includes(clip))throw Error('Unknown inspection clip');for(const r of Object.values(roles)){r.clip=clip;r.ms=timeMs===null?t:Math.max(0,Math.min(700,timeMs));}
 }else if(event?.type==='actor-defeated'&&frame.phase==='defeat'&&roles[event.data.role]&&input.computed.final[event.data.role].hp===0){
  roles[event.data.role].clip='defeat';roles[event.data.role].ms=t;
 }else if(event?.type==='combat-action'&&PHASES[frame.phase]){
  const d=event.data,actor=d.actor,target=d.target;
  if(d.sourceType==='dodge'){
   if(roles[target])roles[target]={...roles[target],clip:'dodge',ms:t};if(roles[actor]){roles[actor].clip=t>=520?'return':'attack';roles[actor].ms=t>=520?(t-520)*700/180:Math.min(t,300);const delta=input.controls.stage.maxApproachUV*Math.min(t/300,1)*(t>=520?(700-t)/180:1);roles[actor].x+=actor==='player'?delta:-delta;}
  }else if(d.sourceType==='attack'&&roles[actor]){
   // All schemes use identical phase retiming. Source clips stay 700ms.
   // Hold attack impact tick9 until B1 return; return starts at matching pose.
   roles[actor].clip=t>=520?'return':'attack';roles[actor].ms=t>=520?(t-520)*700/180:Math.min(t,300);
   if(d.sourceType==='attack'&&roles[target]&&t>=300){roles[target].clip='hit';roles[target].ms=Math.min(700,(t-300)*700/220);}
   const delta=input.controls.stage.maxApproachUV*Math.min(t/300,1)*(t>=520?(700-t)/180:1);roles[actor].x+=actor==='player'?delta:-delta;
  }
  if(frame.phase==='known-effect'){
   const type=d.sourceType==='drain'?'drain':d.crit===true||d.revengeCrit===true?'crit':d.sourceType==='counter'||d.source==='counter'?'counter':d.sourceType==='combo'||d.source==='combo'?'combo':d.sourceType==='dodge'?'dodge':d.sourceType==='attack'?'impact':null;
   if(type)cue={type,role:['drain','combo','counter'].includes(d.sourceType)?(actor||'player'):(target||actor||'enemy'),actor,target,eventId:event.eventId,seq:event.seq,source:event.source,actualDamage:Number.isFinite(d.actualDamage)?d.actualDamage:null,healed:Number.isFinite(d.healed)?d.healed:null,ageMs:Math.max(0,t-400)};
  }
 }else if(clip==='source'&&['outcome','closed'].includes(frame.phase)&&frame.mode!=='cancelled'&&frame.mode!=='background'){
  for(const role of ['player','enemy'])if(frame.knownState[role].hp===0){roles[role].clip='defeat';roles[role].ms=700;}
 }
 for(const role of Object.values(roles))Object.assign(role,sampleTime(role.ms));
 return {roles,cue,fixtureSHA:input.fixtureSHA,caseSHA:input.caseSHA,sourceEventId:event?.eventId||null,computedOnly:true,inspection:clip!=='source'};
}
export function placement(input,role,stageWidth,stageHeight,portrait){const s=input.controls.stage;let height=role==='player'?s.playerHeight:s.enemyHeightByKind[input.representative.kind];if(role==='enemy'&&input.representative.kind==='boss'&&portrait)height=Math.min(height,s.portraitBossHeightCap);return {footY:s.playerFoot[1]*stageHeight,sourceSize:height*stageHeight*1.8};}
