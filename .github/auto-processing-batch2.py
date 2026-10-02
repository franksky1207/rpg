from pathlib import Path
import re


def replace_once(path, old, new):
    p=Path(path); s=p.read_text()
    if old not in s:
        raise SystemExit(f'missing expected text in {path}: {old[:120]!r}')
    p.write_text(s.replace(old,new,1))


def sub_once(path, pattern, repl, flags=0):
    p=Path(path); s=p.read_text()
    out,n=re.subn(pattern,repl,s,count=1,flags=flags)
    if n!=1:
        raise SystemExit(f'expected one regex match in {path}, got {n}: {pattern[:120]!r}')
    p.write_text(out)

# 8) equipmentlock boot normalization: only save when normalization actually changed persisted state.
replace_once('equipmentlock.js',
' function restoreAfterEquipmentChange(){\n',
' function equipmentNormalizationSignature(target=state){\n'
'  const lockValue=item=>item?.locked===true?1:item?.locked===false?0:null;\n'
'  const equipmentLocks=EQUIPMENT_TYPES.map(type=>lockValue(target?.equipment?.[type]));\n'
'  const inventoryLocks=(target?.inventory||[]).map(lockValue);\n'
'  const lost=(target?.lostGear||[]).map(entry=>[lockValue(entry?.item),entry?.currency??null,Number.isFinite(Number(entry?.cost))?Number(entry.cost):null,entry?.redemptionPending??null]);\n'
'  return JSON.stringify([target?.settings?.autoSell??null,equipmentLocks,inventoryLocks,lost]);\n'
' }\n'
' function restoreAfterEquipmentChange(){\n')
replace_once('equipmentlock.js',
' window.EQUIPMENT_MYTHIC_MANUAL_CONFIRM_RETIRED_VERSION=1;\n normalizeAutoSellQualitySettings(state);\n injectLockStyles();normalizeAllGearLocks();normalizeLostGearEconomy();save(false);\n',
' window.EQUIPMENT_MYTHIC_MANUAL_CONFIRM_RETIRED_VERSION=1;\n'
' window.EQUIPMENT_BOOT_NORMALIZATION_SAVE_VERSION=1;\n'
' const normalizationBefore=equipmentNormalizationSignature(state);\n'
' normalizeAutoSellQualitySettings(state);\n'
' normalizeAllGearLocks();normalizeLostGearEconomy();\n'
' const normalizationChanged=normalizationBefore!==equipmentNormalizationSignature(state);\n'
' window.EQUIPMENT_BOOT_NORMALIZATION_CHANGED=normalizationChanged;\n'
' injectLockStyles();if(normalizationChanged)save(false);\n')

# 9) Offline accumulator: remove mythic-special retention. Every quality uses the shared disposition owner.
sub_once('offlineprogress.js',
 r' function createGearAccumulator\(\{target=null,reject,score,notifyUpgrade=true,respectDisposition=false\}=\{\}\)\{.*?\n \}\n function cloneJson',
 ''' function createGearAccumulator({target=null,reject,score,notifyUpgrade=true}={}){
  const s=isObject(target)?target:state,scoreItem=typeof score==="function"?score:(item=>equipmentScore(item)),types=equipmentTypes(),kept=[],rejected=[];let droppedCount=0;
  function rejectItem(item){if(!item)return;rejected.push(item);if(typeof reject==="function")reject(item);}
  function policyDecision(item){if(typeof window.equipmentDropDisposition!=="function")throw new Error("Equipment auto-process policy owner unavailable");return window.equipmentDropDisposition(item,s,{score:scoreItem});}
  function consider(raw){const item=normalizeOfflineDrop(raw);if(!item)return;droppedCount++;if(!types.includes(item.type)){rejectItem(item);return;}const disposition=policyDecision(item);if(disposition?.process===true)rejectItem(item);else kept.push(item);}
  function finalize(){
   if(!Array.isArray(s.inventory))s.inventory=[];
   const keptOrdinary=kept.filter(item=>Number(item.q)!==5),keptMythics=kept.filter(item=>Number(item.q)===5),keptUpgrade=kept.some(item=>scoreItem(item)>scoreItem(s.equipment?.[item.type]||null));
   kept.forEach(item=>s.inventory.push(item));
   if(keptUpgrade&&notifyUpgrade!==false&&isFormalStateTarget(s)){try{upgradeDropNoticePending=true;}catch(_){}}
   return {droppedCount,rejected,keptOrdinary,mythics:keptMythics,keptCount:kept.length};
  }
  return {consider,finalize};
 }
 function cloneJson''',re.S)
replace_once('offlineprogress.js','gear=createGearAccumulator({target:state,respectDisposition:true});','gear=createGearAccumulator({target:state});')
replace_once('offlineprogress.js','gear=createGearAccumulator({target,reject:item=>rejected.push(item.id),score:item=>Number(item?.score)||0,notifyUpgrade:false,respectDisposition:true});','gear=createGearAccumulator({target,reject:item=>rejected.push(item.id),score:item=>Number(item?.score)||0,notifyUpgrade:false});')
replace_once('offlineprogress.js','strict=createGearAccumulator({target:strictTarget,reject:item=>strictRejected.push(item.id),score:item=>Number(item?.score)||0,notifyUpgrade:false,respectDisposition:true});','strict=createGearAccumulator({target:strictTarget,reject:item=>strictRejected.push(item.id),score:item=>Number(item?.score)||0,notifyUpgrade:false});')
replace_once('offlineprogress.js','return Object.freeze({version:3,passed:errors.length===0,targetIsolation:true,deterministic:true,sharedDispositionOwner:true,allQualitySettings:true,errors:Object.freeze(errors)});','return Object.freeze({version:4,passed:errors.length===0,targetIsolation:true,deterministic:true,sharedDispositionOwner:true,allQualitySettings:true,mythicSpecialContainerRetired:true,errors:Object.freeze(errors)});')
replace_once('offlineprogress.js','const OFFLINE_GEAR_ACCUMULATOR_VERSION=4;','const OFFLINE_GEAR_ACCUMULATOR_VERSION=5;')
replace_once('offlineprogress.js','return Object.freeze({version:6,passed:errors.length===0,gearRate:OFFLINE_GEAR_RATE','return Object.freeze({version:7,passed:errors.length===0,gearRate:OFFLINE_GEAR_RATE')

# 10) Cross-path + legacy regression locks.
replace_once('tests/runtime/js-integrity.js',
 'assert(/EQUIPMENT_AUTO_PROCESS_POLICY_VERSION=1/.test(equipmentLock)&&/equipmentDropDisposition/.test(equipmentLock),"裝備自動處理正式 disposition owner 缺失。")\n',
 'assert(/EQUIPMENT_AUTO_PROCESS_POLICY_VERSION=1/.test(equipmentLock)&&/equipmentDropDisposition/.test(equipmentLock),"裝備自動處理正式 disposition owner 缺失。")\n'
 'assert(/EQUIPMENT_BOOT_NORMALIZATION_SAVE_VERSION=1/.test(equipmentLock)&&/normalizationBefore!==equipmentNormalizationSignature\\(state\\)/.test(equipmentLock)&&/if\\(normalizationChanged\\)save\\(false\\)/.test(equipmentLock),"裝備載入 normalization 不得再無條件寫存檔。")\n'
 'assert(/OFFLINE_GEAR_ACCUMULATOR_VERSION=5/.test(offlineProgress)&&/mythicSpecialContainerRetired:true/.test(offlineProgress)&&!/respectDisposition/.test(offlineProgress),"Offline 裝備 accumulator 應全面改用 shared disposition，且不得保留 mythic 特殊容器開關。")\n'
 'assert(/autoSell\\.slice\\(0,EQUIPMENT_AUTO_SELL_QUALITY_COUNT\\)/.test(engine)&&/while\\(auto\\.length<EQUIPMENT_AUTO_SELL_QUALITY_COUNT\\)auto\\.push\\(false\\)/.test(engine),"舊 5 格 autoSell 必須安全補第 6 格 false。")\n')
replace_once('tests/runtime/js-integrity.js',
 'assert(/respectDisposition:true/.test(offlineProgress)&&/window\\.equipmentDropDisposition/.test(offlineProgress),"高維 Offline 裝備必須使用正式自動處理 disposition owner。")\n',
 'assert(/window\\.equipmentDropDisposition/.test(offlineProgress)&&!/respectDisposition/.test(offlineProgress),"三紀元 Offline 裝備必須全面使用正式自動處理 disposition owner。")\n')

# Cache-bust touched browser JS.
replace_once('index.html','equipmentlock.js?v=20261002-autoprocess-policy-batch1','equipmentlock.js?v=20261002-autoprocess-policy-batch2')
replace_once('index.html','offlineprogress.js?v=20261002-autoprocess-policy-batch1','offlineprogress.js?v=20261002-autoprocess-policy-batch2')
