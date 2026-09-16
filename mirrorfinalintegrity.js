(function(){
 const MIRROR_DUNGEON_FINAL_INTEGRITY_VERSION=2;
 const errors=[],warnings=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const warn=(code,message,data=null)=>warnings.push({code,message,data});
 function clone(value){return JSON.parse(JSON.stringify(value));}
 function seededRng(seed,first){let firstPending=true,x=seed>>>0;return function(){if(firstPending){firstPending=false;return first;}x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}

 if(window.MIRROR_DUNGEON_INTEGRITY?.passed!==true)fail("MIRROR_INTEGRITY","鏡像戰基礎 integrity 未通過",window.MIRROR_DUNGEON_INTEGRITY?.errors||null);
 if(window.PROJECT_RUNTIME_REPORT?.passed!==true)fail("PROJECT_RUNTIME","專案 runtime integrity 未通過",window.PROJECT_RUNTIME_REPORT?.errors||null);

 if(typeof window.normalizeMirrorDungeonState==="function"){
  const sameTs=Date.parse("2026-09-16T04:00:00Z"),beforeMidnight=Date.parse("2026-09-16T15:59:00Z"),afterMidnight=Date.parse("2026-09-16T16:01:00Z"),nextTs=Date.parse("2026-09-17T04:00:00Z");
  const interrupted={dungeon:{mirror:{history:{bestWins:0,bestDate:null,miracleDates:[]},daily:{dateKey:"2026-09-16",status:"running",challengeDate:"2026-09-16",startedAt:1,wins:0,losses:0,completedAt:0}}}};
  const same=clone(interrupted);window.normalizeMirrorDungeonState(same,sameTs,{recoverInterrupted:true});
  if(same.dungeon.mirror.daily.status!=="failed")fail("INTERRUPT_SAME_DAY","同日重新載入 running 應轉為 failed",same.dungeon.mirror.daily);
  const crossed=clone(interrupted);window.normalizeMirrorDungeonState(crossed,nextTs,{recoverInterrupted:true});
  if(crossed.dungeon.mirror.daily.status!=="idle"||crossed.dungeon.mirror.daily.dateKey!=="2026-09-17")fail("INTERRUPT_CROSS_DAY","跨日中斷應保留新一天可挑戰機會",crossed.dungeon.mirror.daily);
  const liveCross=clone(interrupted);window.normalizeMirrorDungeonState(liveCross,afterMidnight,{recoverInterrupted:false});
  if(liveCross.dungeon.mirror.daily.status!=="running"||liveCross.dungeon.mirror.daily.challengeDate!=="2026-09-16")fail("LIVE_CROSS_MIDNIGHT","同一工作階段跨午夜時，進行中的挑戰應維持開始日 running",liveCross.dungeon.mirror.daily);
  const zero={dungeon:{mirror:{history:{bestWins:0,bestDate:"2026-09-16",miracleDates:[]},daily:{dateKey:"2026-09-16",status:"completed",challengeDate:"2026-09-16",startedAt:1,wins:0,losses:20,completedAt:2}}}};
  window.normalizeMirrorDungeonState(zero,sameTs);
  if(zero.dungeon.mirror.history.bestDate!=="2026-09-16"||zero.dungeon.mirror.history.bestWins!==0||zero.dungeon.mirror.daily.status!=="completed")fail("ZERO_WIN_RECORD","正式 0 勝紀錄不應被當成尚無紀錄",zero.dungeon.mirror);
  const miracles={dungeon:{mirror:{history:{bestWins:20,bestDate:"2026-09-16",miracleDates:["2026-09-16","2026-09-16"]},daily:{dateKey:"2026-09-16",status:"completed",challengeDate:"2026-09-16",startedAt:1,wins:20,losses:0,completedAt:2}}}};
  window.normalizeMirrorDungeonState(miracles,beforeMidnight);
  if(miracles.dungeon.mirror.history.miracleDates.length!==2)fail("MIRACLE_DUPLICATES","同一天多次 20 勝神蹟必須逐次保留，不得去重",miracles.dungeon.mirror.history);
  const oldCompleted={dungeon:{mirror:{history:{bestWins:17,bestDate:"2026-09-10",miracleDates:[]},daily:{dateKey:"2026-09-16",status:"completed",challengeDate:"2026-09-16",startedAt:1,wins:17,losses:3,completedAt:2}}}};
  window.normalizeMirrorDungeonState(oldCompleted,nextTs);
  if(oldCompleted.dungeon.mirror.daily.status!=="idle"||oldCompleted.dungeon.mirror.history.bestWins!==17||oldCompleted.dungeon.mirror.history.bestDate!=="2026-09-10")fail("DAILY_RESET_HISTORY","跨日重置不得清除歷史最高",oldCompleted.dungeon.mirror);
 }else fail("STATE_NORMALIZER_MISSING","normalizeMirrorDungeonState 未載入");

 if(typeof window.createMirrorCombatSnapshot==="function"&&typeof window.normalizeMirrorCombatSnapshot==="function"&&typeof window.runMirrorCombatCore==="function"){
  try{
   const base=window.createMirrorCombatSnapshot(),probe=clone(base);
   probe.specializations={...(probe.specializations||{}),initiative:60,combo:60,penetration:60,counter:60,drain:60};
   if(typeof window.mirrorSpecializationBonuses==="function")probe.specializationBonuses=window.mirrorSpecializationBonuses(probe.specializations);
   const snap=window.normalizeMirrorCombatSnapshot(probe);
   let pairs=0;
   for(let seed=1;seed<=64;seed++){
    const a=window.runMirrorCombatCore(snap,{logs:false,rng:seededRng(seed,0.25)}),b=window.runMirrorCombatCore(snap,{logs:false,rng:seededRng(seed,0.75)});
    if(a.firstActor!=="player"||b.firstActor!=="mirror")fail("FIRST_ACTOR_PAIR",`seed ${seed} 先攻配對異常`,{a:a.firstActor,b:b.firstActor});
    if(a.winner===b.winner)fail("SYMMETRY_PAIR",`seed ${seed} 交換先攻後勝者未鏡像互換`,{a:a.winner,b:b.winner});
    if(a.turns!==b.turns)fail("SYMMETRY_TURNS",`seed ${seed} 鏡像配對回合數不一致`,{a:a.turns,b:b.turns});
    if(a.playerHp!==b.mirrorHp||a.mirrorHp!==b.playerHp)fail("SYMMETRY_HP",`seed ${seed} 鏡像配對最終 HP 未互換`,{a:{playerHp:a.playerHp,mirrorHp:a.mirrorHp},b:{playerHp:b.playerHp,mirrorHp:b.mirrorHp}});
    const endA=a.events?.[a.events.length-1],endB=b.events?.[b.events.length-1];
    if(endA?.type!=="battleEnd"||endB?.type!=="battleEnd")fail("BATTLE_END_EVENT",`seed ${seed} battleEnd 不是最後事件`);
    if((a.winner==="player"&&!(a.playerHp>0&&a.mirrorHp===0))||(a.winner==="mirror"&&!(a.mirrorHp>0&&a.playerHp===0)))fail("DEATH_STATE",`seed ${seed} A 死亡狀態異常`,a);
    if((b.winner==="player"&&!(b.playerHp>0&&b.mirrorHp===0))||(b.winner==="mirror"&&!(b.mirrorHp>0&&b.playerHp===0)))fail("DEATH_STATE",`seed ${seed} B 死亡狀態異常`,b);
    pairs++;
   }
   if(pairs!==64)fail("SYMMETRY_PAIR_COUNT",`應完成 64 組對稱回歸，實際 ${pairs}`);
  }catch(err){fail("SYMMETRY_EXCEPTION","Mirror Combat 對稱回歸發生例外",String(err?.message||err));}
 }else fail("COMBAT_API_MISSING","Mirror Combat 最終回歸所需 API 未完整載入");

 if(typeof window.mirrorDungeonRewardForWins==="function"){
  for(let w=0;w<=20;w++){const expected=20*w*w,actual=window.mirrorDungeonRewardForWins(w);if(actual!==expected)fail("REWARD_TABLE",`${w} 勝獎勵應為 ${expected}，實際 ${actual}`);}
 }
 if(typeof window.mirrorDungeonResultComment==="function"){
  const comments=new Set(Array.from({length:21},(_,w)=>window.mirrorDungeonResultComment(w)));
  if(comments.size!==21)fail("COMMENT_COUNT",`0～20 勝應有 21 句不同評語，實際 ${comments.size}`);
 }
 if(typeof window.mirrorDungeonRecordTitle==="function"){
  const expected={15:"幸運眷顧",16:"天選之刻",17:"逆命者",18:"傳說之日",19:"距神一步",20:"神蹟"};
  for(let w=0;w<=20;w++){const actual=window.mirrorDungeonRecordTitle(w),want=expected[w]||"";if(actual!==want)fail("TITLE_TABLE",`${w} 勝稱號應為「${want}」，實際「${actual}」`);}
 }
 if(typeof window.requestMirrorContinuousStop!=="undefined"||typeof window.stopMirrorCombatRun!=="undefined")fail("STOP_API","正式鏡像戰不得存在停止 API");
 if(Number(window.DUNGEON_PREP_RETURN_UX_VERSION)!==1)fail("RETURN_UX","懸賞／競技準備頁返回副本列表模組未載入");
 if(Number(window.MIRROR_DUNGEON_GUIDE_VERSION)!==1)fail("GUIDE","鏡像戰說明模組未載入");
 if(typeof window.getNewStateNormalizerCount==="function"&&Number(window.getNewStateNormalizerCount())!==4)fail("NORMALIZER_COUNT",`正式 newState normalizer 應維持 4，實際 ${window.getNewStateNormalizerCount()}`);
 const viewport=document.querySelector('meta[name="viewport"]')?.getAttribute("content")||"";
 if(!viewport.includes("width=device-width"))warn("VIEWPORT","行動版 viewport 設定異常");

 const report={passed:errors.length===0,clean:errors.length===0&&warnings.length===0,errors,warnings,checkedAt:Date.now(),symmetryPairs:64};
 window.MIRROR_DUNGEON_FINAL_INTEGRITY_VERSION=MIRROR_DUNGEON_FINAL_INTEGRITY_VERSION;
 window.MIRROR_DUNGEON_FINAL_INTEGRITY=report;
 if(errors.length)console.error("[Mirror Dungeon Final Integrity]",errors);
 else if(warnings.length)console.warn("[Mirror Dungeon Final Integrity]",warnings);
 else console.info("[Mirror Dungeon Final Integrity] passed");
})();