/* GM 3D prototype bridge: session-only presentation, no gameplay mutation. */
(function(){
"use strict";
let overlay=null, previousFocus=null, previousOverflow=null, previousScrollX=0,previousScrollY=0, previousMainScrollTop=0;
function allowed(){return typeof state!=="undefined" && state?.gm===true;}
function close(){
  if(!overlay)return false;
  const node=overlay;overlay=null;
  node.remove();
  if(previousOverflow!==null)document.body.style.overflow=previousOverflow;
  previousOverflow=null;
  window.scrollTo(previousScrollX,previousScrollY);
  const main=document.getElementById("main");if(main)main.scrollTop=previousMainScrollTop;
  if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
  previousFocus=null;
  return true;
}
function open(){
  if(!allowed())return false;
  if(overlay)return true;
  previousFocus=document.activeElement;
  previousOverflow=document.body.style.overflow;
  previousScrollX=window.scrollX;previousScrollY=window.scrollY;
  previousMainScrollTop=document.getElementById("main")?.scrollTop||0;
  const layer=document.createElement("div");
  layer.id="gm3dPrototypeOverlay";
  layer.setAttribute("role","dialog");
  layer.setAttribute("aria-modal","true");
  layer.setAttribute("aria-label","3D 測試中心");
  layer.style.cssText="position:fixed;inset:0;z-index:2147483000;background:#050d19;display:flex;flex-direction:column;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)";
  const bar=document.createElement("div");
  bar.style.cssText="display:flex;align-items:center;justify-content:space-between;gap:10px;background:#0a1627;color:#e7f5ff;padding:10px max(14px,env(safe-area-inset-right)) 10px max(14px,env(safe-area-inset-left));border-bottom:1px solid #355879";
  const title=document.createElement("strong");title.textContent="GM 測試｜3D 測試中心";
  const exit=document.createElement("button");exit.type="button";exit.className="btn";exit.textContent="← 返回原本畫面";
  exit.addEventListener("click",close);
  bar.append(title,exit);
  const frame=document.createElement("iframe");
  frame.src="3d-test/?embedded=1&v=20261009-status-above-stage";
  frame.title="文明戰線 3D 測試中心";
  frame.style.cssText="display:block;flex:1;min-height:0;width:100%;border:0;background:#060c18";
  layer.append(bar,frame);
  frame.addEventListener("load",()=>{try{frame.contentWindow?.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();close();}});}catch(_){}});
  document.body.appendChild(layer);
  overlay=layer;
  document.body.style.overflow="hidden";
  exit.focus({preventScroll:true});
  return true;
}
document.addEventListener("keydown",event=>{
  if(!overlay)return;
  if(event.key==="Escape"){event.preventDefault();close();}
  if(event.key==="Tab"){
    // Keep the modal header reachable; iframe controls remain accessible through normal tabbing.
    if(document.activeElement===document.body){event.preventDefault();overlay.querySelector("button")?.focus();}
  }
});
window.addEventListener("message",event=>{
 if(!overlay||event.origin!==location.origin||event.source!==overlay.querySelector("iframe")?.contentWindow||!allowed())return;
 if(event.data?.type==="civilization3d:close"){close();return;}
 if(event.data?.type==="civilization3d:appearance-request"){
  const sender=event.source,origin=event.origin;
  // Read authoritative formal data; the loader is only invoked when GM requests a snapshot.
  (async()=>{
   try{
    if(!window.Civilization3DAppearance?.capture){
     const source="3d-test/appearance-snapshot.js";
     const response=await fetch("resource-manifest.json",{cache:"no-store",credentials:"same-origin"});
     const manifest=response.ok?await response.json():null;
     const digest=manifest?.files?.[source];
     const url=source+(/^[a-f0-9]{24}$/.test(String(digest||""))?"?asset="+digest:"?v=20261010-repair4-appearance");
     await new Promise((resolve,reject)=>{
      const el=document.createElement("script");el.src=url;el.onload=resolve;el.onerror=()=>reject(new Error("正式外觀模組載入失敗"));document.head.append(el);
     });
    }
    const appearance=window.Civilization3DAppearance?.capture();
    if(!appearance)throw new Error("正式角色快照尚無可讀取資料");
    const types=["weapon","helmet","armor","shoes","accessory"];
    const galaxy=typeof MAPS!=="undefined"&&Array.isArray(MAPS)?MAPS:[];
    const galGroups=typeof WORLD_REGIONS!=="undefined"&&Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[];
    const cosmic=Array.isArray(window.SECOND_WORLD_REGIONS)?window.SECOND_WORLD_REGIONS:[];
    const high=Array.isArray(window.THIRD_WORLD_EQUIPMENT_NAME_ROWS)?window.THIRD_WORLD_EQUIPMENT_NAME_ROWS:[];
    const catalog={
     1:galGroups.map(region=>({name:String(region.name||""),entries:galaxy.slice(region.mapStart,region.mapEnd+1).map(map=>({name:String(map.name||""),level:Number(map.max)||0,names:types.map((_,i)=>String(map.gear?.[i]||""))}))})),
     2:cosmic.map(region=>({name:String(region.name||""),entries:Array.from({length:10},(_,i)=>{const boss=window.secondWorldBoss?.(region.firstBossIndex+i);return {name:String(boss?.name||""),level:Number(boss?.level)||0,names:types.map(type=>String(boss?.equipment?.[type]||""))};})})),
     3:[{name:"高維紀元",entries:high.map((row,i)=>({name:"第 "+(i+1)+" 階段 · "+String(row.theme||""),level:0,names:types.map(type=>String(row[type]||""))}))}]
    };
    if(catalog[1].length!==10||catalog[2].length!==10||catalog[3][0].entries.length!==10||[...catalog[1],...catalog[2],...catalog[3]].some(g=>g.entries.length!==10||g.entries.some(e=>e.names.some(n=>!n))))throw new Error("正式裝備區域或名稱資料未完整載入");
    if(!overlay||!allowed()||overlay.querySelector("iframe")?.contentWindow!==sender)return;
    sender.postMessage({type:"civilization3d:appearance-response",appearance,catalog},origin);
   }catch(error){
    if(overlay&&allowed()&&overlay.querySelector("iframe")?.contentWindow===sender)sender.postMessage({type:"civilization3d:appearance-error",reason:String(error?.message||error)},origin);
   }
  })();
 }
 if(event.data?.type==="civilization3d:scenario-request"){
 const st=typeof state!=="undefined"?state:null;
 if(!st)return;
 const limited=(value,min,max)=>Math.max(min,Math.min(max,Math.floor(Number(value)||0)));
 const cal=(world)=>{
   const second=world===2;
   const defs=second?window.getSecondWorldCalamityDefinitions?.():window.getCivilizationCalamityDefinitions?.();
   return Array.from({length:10},(_,i)=>{
    const def=Array.isArray(defs)?defs[i]:null;
    const a=def?(second?window.getSecondWorldCalamityStatus?.(def.id):window.getCivilizationCalamityStatus?.(def.id)):null;
    const visible=def?(second?window.isSecondWorldCalamityVisible?.(def.id)===true:true):false;
    const completed=second?a?.completed===true:Number(a?.mark?.level)>=10;
    const max=Number(a?.maxHp),current=Number(a?.currentHp);
    return {visible,unlocked:second?a?.challengeable===true:(def?window.isCivilizationCalamityUnlocked?.(def.id)===true:false),completed,review:false,markLevel:limited(a?.mark?.level,0,10),progressPercent:Math.max(0,Math.min(100,Number(a?.progressPercent)||0)),remainingPercent:Number.isFinite(max)&&max>0&&Number.isFinite(current)?Math.max(0,Math.min(100,100*current/max)):100};
   });
 };
 const highest=limited(st?.unlockedMap,0,500);
 const regions=typeof WORLD_REGIONS!=="undefined"&&Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[];
 const regionIndex=regions.reduce((n,r,i)=>highest>=Number(r.mapStart)?i:n,0);
 const bosses=Array.isArray(window.SECOND_WORLD_BOSSES)?window.SECOND_WORLD_BOSSES:[];
 const unlocked=limited(window.secondWorldHighestUnlockedBossIndex?.(),0,99);
 const progressed=window.thirdWorldBossProgressSnapshot;
 const defs=Array.isArray(window.THIRD_WORLD_BOSS_DEFINITIONS)?window.THIRD_WORLD_BOSS_DEFINITIONS:[];
 const alternate=window.alternateUniverseProgressionSnapshot?.(st)||null;
 const cleared=limited(alternate?.deepestCleared,0,1000),attempt=window.alternateUniverseActiveAttempt?.(st)||null;
 const target=Math.max(1,Math.min(1000,Number(attempt?.depth)||Math.min(1000,cleared+1)));
 const failure=window.alternateUniverseFailureStatus?.(target,st)||null;
 const arena=window.getArenaCoreState?.()||{};
 const bounty=window.getBountyTestSnapshot?.()||{};
 const mirror=window.mirrorDungeonStatus?.()||{};
 const voidProgress=window.getVoidMirageProgressSnapshot?.()||window.getVoidMirageRunSnapshot?.()||{};
 const dungeonKeys=["bounty","arena","tower","mirror"];
 const policies=dungeonKeys.map(key=>window.dungeonModeAvailability?.(key)||null);
 const dungeonModes=dungeonKeys.filter((key,i)=>policies[i]?.visible!==false&&!(key==="bounty"&&window.currentWorldPhase?.()===3));
 const dungeonAvailability=dungeonModes.map(key=>{const policy=policies[dungeonKeys.indexOf(key)];return policy?.enabled===true||policy?.available===true||policy?.unlocked===true;});
 const dungeonSnapshot={
   hub:{dungeonKind:"hub",world:window.currentWorldPhase?.()||1,dungeonVisibleModes:dungeonModes,dungeonAvailableModes:dungeonAvailability,dungeonUnlocked:true},
   bounty:{dungeonKind:"bounty",world:window.currentWorldPhase?.()||1,unavailable:window.currentWorldPhase?.()===3,dungeonTier:bounty?.tier?.id||"normal",dungeonPhase:bounty.phase||"select",dungeonRemaining:Math.max(0,Number(window.dailyDungeonStatus?.("bounty")?.remaining)||0),dungeonUnlocked:true},
   arena:{world:window.currentWorldPhase?.()||1,dungeonKind:"arena",dungeonRank:Number(arena.rank)||1,dungeonPosition:arena.position||"normal",dungeonPhase:arena.phase||"select",dungeonRemaining:Math.max(0,Number(arena.daily?.remaining)||0),advancedKind:"higher-arena",advancedStage:Number(arena.runtime?.round?.stageIndex)||0,advancedProgress:Number(arena.runtime?.finishedRuns)||0,higherArenaMode:arena.runtime?.mode||arena.runtime?.round?.mode||arena.runtime?.selectedMode||"fixed",advancedUnlocked:true},
   mirror:{advancedKind:"mirror",advancedProgress:Number(mirror.history?.bestWins)||0,advancedUnlocked:mirror.unlocked===true},
   void:{advancedKind:"void",advancedProgress:Number(voidProgress.highestCleared??voidProgress.historicalHighest)||0,advancedUnlocked:true}
 };
 // Presentation event contract only: no battle execution or settlement authority.
 const combat=window.getCombatPresentationSnapshot?.()||null;
 const validCombat=combat&&Number(combat.playerMaxHp)>0&&Number(combat.enemyMaxHp)>0&&
   Number.isFinite(Number(combat.playerHp))&&Number.isFinite(Number(combat.enemyHp));
 const battleRatio=(value,max)=>Math.max(0,Math.min(1,Number(value)/Number(max)));
 const playerShield=Math.max(0,Number(combat?.playerShield)||0);
 const enemyShield=Math.max(0,Number(combat?.enemyShield)||0);
 const battleSnapshot=validCombat?{
   schema:1,status:"active",source:"formal-combat",eventType:"presentation-snapshot",
   battleAvailable:true,battleVisualKind:playerShield>0||enemyShield>0?"shield":"battle",
   playerHpRatio:battleRatio(combat.playerHp,combat.playerMaxHp),
   enemyHpRatio:battleRatio(combat.enemyHp,combat.enemyMaxHp),
   shieldRatio:battleRatio(playerShield,Math.max(1,Number(combat.playerShieldMax)||playerShield)),
   visualOnly:true,readOnly:true
 }:{schema:1,status:"unavailable",reason:"no-active-combat",source:"formal-combat",eventType:"presentation-snapshot",
   battleAvailable:false,battleVisualKind:"unavailable",visualOnly:true,readOnly:true};
 const snapshot={
   battle:battleSnapshot,
   dungeon:dungeonSnapshot,
   galaxy:{world:1,mapCount:regions.length||10,selectedMap:regionIndex,unlockedRegions:regions.map(r=>highest>=Number(r.mapStart)),completedRegions:regions.map((r,i)=>highest>=Number(regions[i+1]?.mapStart||501)),review:false},
   universe:{world:2,highestUnlockedBossIndex:unlocked,clearedBossCount:bosses.filter(b=>window.secondWorldBossKilled?.(b.index)===true).length,defeatedBosses:bosses.slice(0,100).map(b=>window.secondWorldBossKilled?.(b.index)===true),selectedMap:Math.max(0,Math.min(9,Number(window.getSecondWorld3DPreviewSelectedRegion?.()??Math.floor(unlocked/10)))),review:false},
   higher:{world:3,presences:defs.slice(0,10).map((_,i)=>{const v=typeof progressed==="function"?progressed(i,st):null;return {defeated:v?.defeated===true,available:v?.challengeStatus?.allowed===true,remainingPercent:Number(v?.remainingPercent??100)};}),selectedPresence:Math.max(0,defs.findIndex((_,i)=>!progressed?.(i,st)?.defeated))},
   calamities:{1:cal(1),2:cal(2)},
   alternate:{world:3,frontierKind:"alternate",frontierProgress:cleared,alternateUniverse:Math.ceil(target/5),alternateDepth:(target-1)%5+1,alternateSegment:Math.ceil(target/50),alternateLocked:failure?.locked===true,alternateActive:!!attempt,alternateCompleted:cleared>=target}
 };
 event.source.postMessage({type:"civilization3d:scenario-response",snapshot},event.origin);
 }
});
window.openGm3DPrototype=open;
window.closeGm3DPrototype=close;
window.gm3DPrototypeTestHtml=function(){
  return '<p class="muted gm-hub-note">開啟 GM 3D 測試中心，集中檢視已完成的場景及測試分類。退出後直接回到目前 GM 測試頁，不會重新整理、重設捲動或修改角色資料。</p><div class="controls"><button class="btn blue" type="button" onclick="openGm3DPrototype()">進入 3D 測試中心</button></div>';
};
window.GM_3D_PROTOTYPE_BRIDGE_VERSION=1;
})();
