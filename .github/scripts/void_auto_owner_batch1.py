from pathlib import Path

p=Path('dungeonvoidui.js')
text=p.read_text(encoding='utf-8')
old=''' async function autoClimb(){
  if(voidUi.running)return;voidUi.running=true;
  try{
   while(true){
    const run=typeof getVoidMirageRunSnapshot==="function"?getVoidMirageRunSnapshot():null;if(!run?.active)break;
    if(voidUi.exitAfterFloor){
     stopVoidMinimalModeIfOpen();
     const exited=requestVoidMirageExit();voidUi.finalRun=exited.run||getVoidMirageRunSnapshot();voidUi.phase="result";voidUi.floorResult=null;render();break;
    }
    const fr=fightNextVoidMirageFloor();
    if(!fr?.ok){stopVoidMinimalModeIfOpen();voidUi.finalRun=getVoidMirageRunSnapshot();voidUi.phase="result";voidUi.floorResult=null;render();break;}
    voidUi.floorResult=fr;voidUi.phase="combat";render();
    if(typeof window.syncMainMinimalMode==="function"&&window.getMinimalModeAdapterId?.()==="void-mirage"){
     if(fr.ended)stopVoidMinimalModeIfOpen();else window.syncMainMinimalMode();
    }
    await animateFloor(fr);
    if(fr.ended){voidUi.finalRun=fr.run;voidUi.phase="result";voidUi.floorResult=null;render();break;}
    if(voidUi.exitAfterFloor){
     stopVoidMinimalModeIfOpen();
     const exited=requestVoidMirageExit();voidUi.finalRun=exited.run||getVoidMirageRunSnapshot();voidUi.phase="result";voidUi.floorResult=null;render();break;
    }
    await sleep(350);
   }
  }finally{
   voidUi.running=false;
   if(typeof window.backgroundProgressStop==="function")window.backgroundProgressStop("void");
  }
 }
'''
new=''' async function runVoidMirageUiAuto(){
  if(voidUi.running)return false;
  if(typeof window.runVoidMirageAuto!=="function"){
   voidUi.message="虛空幻境自動挑戰核心未載入。";
   render();
   return false;
  }
  voidUi.running=true;
  try{
   await window.runVoidMirageAuto({
    async onFloorComplete(fr){
     if(!fr?.ok)return;
     voidUi.floorResult=fr;
     voidUi.phase="combat";
     render();
     if(window.getMinimalModeAdapterId?.()==="void-mirage"){
      if(fr.ended)stopVoidMinimalModeIfOpen();
      else if(typeof window.syncMainMinimalMode==="function")window.syncMainMinimalMode();
     }
     await animateFloor(fr);
     if(!fr.ended&&voidUi.exitAfterFloor&&typeof window.requestVoidMirageExit==="function")window.requestVoidMirageExit();
     if(!fr.ended)await sleep(350);
    },
    async onEnd(run){
     stopVoidMinimalModeIfOpen();
     voidUi.finalRun=run||(typeof getVoidMirageRunSnapshot==="function"?getVoidMirageRunSnapshot():null);
     voidUi.phase="result";
     voidUi.floorResult=null;
     render();
    }
   });
   return true;
  }finally{
   voidUi.running=false;
   if(typeof window.backgroundProgressStop==="function")window.backgroundProgressStop("void");
  }
 }
'''
if old not in text: raise SystemExit('dungeonvoidui autoClimb anchor not found')
text=text.replace(old,new,1)
old='''  if(typeof window.backgroundProgressSleep==="function")window.backgroundProgressSleep(100,"void").then(autoClimb);else setTimeout(autoClimb,100);'''
new='''  if(typeof window.backgroundProgressSleep==="function")window.backgroundProgressSleep(100,"void").then(runVoidMirageUiAuto);else setTimeout(runVoidMirageUiAuto,100);'''
if old not in text: raise SystemExit('dungeonvoidui start auto anchor not found')
text=text.replace(old,new,1)
old=''' window.VOID_MINIMAL_MODE_HOOK_VERSION=1;'''
new=''' window.VOID_MIRAGE_UI_AUTO_ADAPTER_VERSION=1;\n window.VOID_MINIMAL_MODE_HOOK_VERSION=1;'''
if old not in text: raise SystemExit('dungeonvoidui version anchor not found')
text=text.replace(old,new,1)
p.write_text(text,encoding='utf-8')

p=Path('dungeonvoid.js')
text=p.read_text(encoding='utf-8')
old=''' window.runVoidMirageAuto=async function(options={}){'''
new=''' window.VOID_MIRAGE_AUTO_OWNER_VERSION=1;\n window.runVoidMirageAuto=async function(options={}){'''
if old not in text: raise SystemExit('dungeonvoid auto owner anchor not found')
text=text.replace(old,new,1)
p.write_text(text,encoding='utf-8')

p=Path('PROJECT_HANDOFF.md')
text=p.read_text(encoding='utf-8')
anchor='''- 虛空戰敗或強制退出正式結束時切到 `stopped`，顯示「戰鬥已停止」與「滑動查看戰鬥結果」，滑掉後顯示既有虛空結果頁。\n'''
addition='''- 虛空戰敗或強制退出正式結束時切到 `stopped`，顯示「戰鬥已停止」與「滑動查看戰鬥結果」，滑掉後顯示既有虛空結果頁。\n- 虛空自動爬樓唯一正式 owner 為 `dungeonvoid.js` 的 `runVoidMirageAuto()`；`dungeonvoidui.js` 只透過 `onFloorComplete`／`onEnd` callback 做畫面、動畫、極簡模式與結果頁接線，不得再建立第二套 while-loop 爬樓流程。\n- `VOID_MIRAGE_AUTO_OWNER_VERSION = 1`；`VOID_MIRAGE_UI_AUTO_ADAPTER_VERSION = 1`。\n'''
if anchor not in text: raise SystemExit('handoff anchor not found')
text=text.replace(anchor,addition,1)
p.write_text(text,encoding='utf-8')

p=Path('index.html')
text=p.read_text(encoding='utf-8')
for old,new in {
 'dungeonvoid.js?v=20260914-cleanup4':'dungeonvoid.js?v=20260917-auto-owner1',
 'dungeonvoidui.js?v=20260917-void-minimal-batch3':'dungeonvoidui.js?v=20260917-auto-owner1'
}.items():
 if old not in text: raise SystemExit(f'index cache anchor not found: {old}')
 text=text.replace(old,new,1)
p.write_text(text,encoding='utf-8')
