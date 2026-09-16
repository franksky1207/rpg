(function(){
 const errors=[],warnings=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const warn=(code,message,data=null)=>warnings.push({code,message,data});
 const clone=value=>JSON.parse(JSON.stringify(value));
 const utc=iso=>Date.parse(iso);

 function seededSequence(seed,length=2048){
  let x=(Number(seed)>>>0)||1,out=[];
  for(let i=0;i<length;i++){x=(1664525*x+1013904223)>>>0;out.push(x/4294967296);}
  return out;
 }
 function rngFrom(values,first){let i=0;return ()=>i++===0?first:(values[(i-1)%values.length]??0.5);}

 if(window.MIRROR_DUNGEON_INTEGRITY?.passed!==true)fail("MIRROR_INTEGRITY","鏡像戰專屬 integrity 未通過",window.MIRROR_DUNGEON_INTEGRITY?.errors||null);
 if(window.PROJECT_RUNTIME_REPORT?.passed!==true)fail("RUNTIME_INTEGRITY","專案 runtime integrity 未通過",window.PROJECT_RUNTIME_REPORT?.errors||null);

 if(typeof window.normalizeMirrorDungeonState==="function"){
  const beforeMidnight=utc("2026-09-16T15:59:00Z"),afterMidnight=utc("2026-09-16T16:01:00Z");
  const day1=typeof gameDailyDateKey==="function"?gameDailyDateKey(beforeMidnight):"2026-09-16";
  const day2=typeof gameDailyDateKey==="function"?gameDailyDateKey(afterMidnight):"2026-09-17";

  const zeroRecord={level:50,dungeon:{mirror:{version:1,history:{bestWins:0,bestDate:day1,miracleDates:[]},daily:{dateKey:day1,status:"completed",challengeDate:day1,startedAt:1,wins:0,losses:20,completedAt:2}}}};
  const z=window.normalizeMirrorDungeonState(zeroRecord,beforeMidnight);
  if(z?.history?.bestDate!==day1||z?.history?.bestWins!==0)fail("ZERO_WIN_RECORD","0 勝正式紀錄未被保留",z?.history||null);

  const duplicateMiracles={level:50,dungeon:{mirror:{version:1,history:{bestWins:20,bestDate:day1,miracleDates:[day1,day1]},daily:{dateKey:day1,status:"completed",challengeDate:day1,startedAt:1,wins:20,losses:0,completedAt:2}}}};
  const d=window.normalizeMirrorDungeonState(duplicateMiracles,beforeMidnight);
  if(d?.history?.miracleDates?.length!==2)fail("MIRACLE_DUPLICATES","同日多次神蹟日期不應被去重",d?.history||null);

  const running={level:50,dungeon:{mirror:{version:1,history:{bestWins:0,bestDate:null,miracleDates:[]},daily:{dateKey:day1,status:"running",challengeDate:day1,startedAt:1,wins:0,losses:0,completedAt:0}}}};
  const cross=window.normalizeMirrorDungeonState(clone(running),afterMidnight,{recoverInterrupted:false});
  if(cross?.daily?.status!=="running"||cross?.daily?.challengeDate!==day1)fail("CROSS_MIDNIGHT_RUNNING","跨午夜中的正式挑戰應維持開始日 running",cross?.daily||null);
  const reopenedNextDay=window.normalizeMirrorDungeonState(clone(running),afterMidnight,{recoverInterrupted:true});
  if(reopenedNextDay?.daily?.status!=="idle"||reopenedNextDay?.daily?.dateKey!==day2)fail("CROSS_DAY_RECOVERY","隔日重新載入應清除前一日中斷並開放新一天",reopenedNextDay?.daily||null);
  const sameDayInterrupted=window.normalizeMirrorDungeonState(clone(running),beforeMidnight,{recoverInterrupted:true});
  if(sameDayInterrupted?.daily?.status!=="failed")fail("SAME_DAY_RECOVERY","同日重新載入 running 應判定今日已結束",sameDayInterrupted?.daily||null);
  const oldCompleted=window.normalizeMirrorDungeonState(zeroRecord,afterMidnight);
  if(oldCompleted?.daily?.status!=="idle"||oldCompleted?.daily?.dateKey!==day2)fail("NEXT_DAY_RESET","前一日 completed 應在新日回到 idle",oldCompleted?.daily||null);
 }

 if(typeof window.createMirrorCombatSnapshot==="function"&&typeof window.runMirrorCombatCore==="function"){
  try{
   const snap=window.createMirrorCombatSnapshot();
   let mismatches=0;
   for(let seed=1;seed<=200;seed++){
    const seq=seededSequence(seed);
    const a=window.runMirrorCombatCore(snap,{logs:false,rng:rngFrom(seq,0.25)});
    const b=window.runMirrorCombatCore(snap,{logs:false,rng:rngFrom(seq,0.75)});
    const mirrored=a.win!==b.win&&a.turns===b.turns&&a.playerHp===b.mirrorHp&&a.mirrorHp===b.playerHp;
    if(!mirrored)mismatches++;
   }
   if(mismatches)fail("SYMMETRY",`200 組對稱亂數測試有 ${mismatches} 組不符合鏡像互換`,{mismatches});
  }catch(err){fail("SYMMETRY_EXCEPTION","鏡像公平性回歸測試執行失敗",String(err?.message||err));}
 }

 if(Number(window.DUNGEON_PREP_RETURN_UX_VERSION)!==1)fail("RETURN_UX","懸賞／競技準備頁返回副本列表功能未載入");
 if(Number(window.MIRROR_DUNGEON_GUIDE_VERSION)!==1)fail("GUIDE","鏡像戰遊戲說明未載入");
 if(typeof window.requestMirrorContinuousStop!=="undefined"||typeof window.stopMirrorCombatRun!=="undefined")fail("STOP_API","正式鏡像戰不應存在停止 API");
 if(typeof window.mirrorDungeonRewardForWins==="function"&&window.mirrorDungeonRewardForWins(20)!==8000)fail("MAX_REWARD","20 勝正式獎勵應為 8,000 VIP");
 if(typeof window.getNewStateNormalizerCount==="function"&&window.getNewStateNormalizerCount()!==4)fail("NORMALIZER_COUNT","正式 newState normalizer 數量應維持 4",window.getNewStateNormalizerCount());

 if(document?.documentElement){
  const viewport=document.querySelector('meta[name="viewport"]')?.getAttribute("content")||"";
  if(!viewport.includes("width=device-width"))warn("VIEWPORT","缺少行動裝置 viewport 設定");
 }

 const report={passed:errors.length===0,clean:errors.length===0&&warnings.length===0,errors,warnings,checkedAt:Date.now(),symmetryPairs:200};
 window.MIRROR_FINAL_CHECK=report;
 if(errors.length)console.error("[Mirror Final Check]",errors);
 else if(warnings.length)console.warn("[Mirror Final Check] passed with warnings",warnings);
 else console.info("[Mirror Final Check] passed");
})();