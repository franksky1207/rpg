from pathlib import Path
import re

def replace_once(path, old, new):
    p=Path(path); s=p.read_text()
    if old not in s:
        raise SystemExit(f'missing expected text in {path}: {old[:80]!r}')
    p.write_text(s.replace(old,new,1))

def sub_once(path, pattern, repl, flags=0):
    p=Path(path); s=p.read_text()
    out,n=re.subn(pattern,repl,s,count=1,flags=flags)
    if n!=1:
        raise SystemExit(f'expected one regex match in {path}, got {n}: {pattern[:80]!r}')
    p.write_text(out)

replace_once('engine.js',
    'window.getNewStateNormalizerCount=function(){return newStateNormalizers.length;};\n',
    'window.getNewStateNormalizerCount=function(){return newStateNormalizers.length;};\n'
    'const EQUIPMENT_AUTO_SELL_QUALITY_COUNT=6;\n'
    'function normalizeAutoSellQualitySettings(target){\n'
    ' if(!target||typeof target!=="object")return target;\n'
    ' if(!target.settings||typeof target.settings!=="object"||Array.isArray(target.settings))target.settings={};\n'
    ' const auto=Array.isArray(target.settings.autoSell)?target.settings.autoSell.slice(0,EQUIPMENT_AUTO_SELL_QUALITY_COUNT):[];\n'
    ' while(auto.length<EQUIPMENT_AUTO_SELL_QUALITY_COUNT)auto.push(false);\n'
    ' target.settings.autoSell=auto.map(Boolean);\n'
    ' return target;\n'
    '}\n'
    'window.EQUIPMENT_AUTO_SELL_QUALITY_COUNT=EQUIPMENT_AUTO_SELL_QUALITY_COUNT;\n'
    'window.EQUIPMENT_AUTO_SELL_SETTINGS_NORMALIZATION_VERSION=1;\n'
    'window.normalizeAutoSellQualitySettings=normalizeAutoSellQualitySettings;\n'
    'registerNewStateNormalizer(normalizeAutoSellQualitySettings);\n')
replace_once('engine.js','autoSell:[false,false,false,false,false],keepUpgrade:true','autoSell:[false,false,false,false,false,false],keepUpgrade:true')

sub_once('ui.js',
    r' if\(!target\.settings\|\|typeof target\.settings!=="object"\|\|Array\.isArray\(target\.settings\)\)target\.settings=\{\};\n const auto=Array\.isArray\(target\.settings\.autoSell\)\?target\.settings\.autoSell\.slice\(0,6\):\[\];while\(auto\.length<6\)auto\.push\(false\);target\.settings\.autoSell=auto\.map\(Boolean\);\n',
    ' normalizeAutoSellQualitySettings(target);\n')

sub_once('equipmentlock.js',
    r' function normalizeAutoSellQualitySettings\(target\)\{.*?\n \}\n function restoreAfterEquipmentChange',
    ' function restoreAfterEquipmentChange',re.S)
sub_once('equipmentlock.js',
    r' window\.isGearLocked=function\(item\)\{return item\?\.locked===true;\};\n window\.shouldAutoSellItem=function\(item\)\{.*?\n \};',
    ' window.isGearLocked=function(item){return item?.locked===true;};\n'
    ' window.shouldAutoSellItem=function(item,target=state){\n'
    '  if(!item||item.locked===true)return false;\n'
    '  const q=Math.floor(Number(item.q)),count=Math.max(1,Math.floor(Number(window.EQUIPMENT_AUTO_SELL_QUALITY_COUNT)||6));\n'
    '  return q>=0&&q<count&&target?.settings?.autoSell?.[q]===true;\n'
    ' };\n'
    ' function equipmentDropDisposition(item,target=state,{score=null}={}){\n'
    '  const s=target&&typeof target==="object"?target:state;\n'
    '  if(!item)return {keep:false,process:false,upgrade:false,locked:false,autoProcess:false,reason:"missing"};\n'
    '  const scoreItem=typeof score==="function"?score:(row=>equipmentScore(row)),locked=item.locked===true,current=s?.equipment?.[item.type]||null,upgrade=scoreItem(item)>scoreItem(current),autoProcess=window.shouldAutoSellItem(item,s),keepUpgrade=s?.settings?.keepUpgrade===true;\n'
    '  if(locked)return {keep:true,process:false,upgrade,locked:true,autoProcess:false,reason:"locked"};\n'
    '  if(keepUpgrade&&upgrade)return {keep:true,process:false,upgrade:true,locked:false,autoProcess,reason:"upgrade"};\n'
    '  if(autoProcess)return {keep:false,process:true,upgrade,locked:false,autoProcess:true,reason:"auto-process"};\n'
    '  return {keep:true,process:false,upgrade,locked:false,autoProcess:false,reason:"quality-kept"};\n'
    ' }\n'
    ' window.equipmentDropDisposition=equipmentDropDisposition;\n'
    ' window.EQUIPMENT_AUTO_PROCESS_POLICY_VERSION=1;')
sub_once('equipmentlock.js',
    r' addItem=function\(item,options=\{\}\)\{.*?\n \};\n window\.addItem=addItem;',
    ' addItem=function(item,options={}){\n'
    '  if(!item)return {kept:false,sold:0,item:null,sale:null,enhancementStones:blankEnhancementReward()};\n'
    '  normalizeLockFlag(item);\n'
    '  const disposition=equipmentDropDisposition(item,state),upgrade=disposition.upgrade===true;\n'
    '  if(disposition.keep){\n'
    '   state.inventory.push(item);\n'
    '   if(upgrade)upgradeDropNoticePending=true;\n'
    '   return {kept:true,sold:0,item,sale:null,enhancementStones:blankEnhancementReward()};\n'
    '  }\n'
    '  if(disposition.process){\n'
    '   const sale=settleSale(item,options);\n'
    '   if(!sale?.ok){state.inventory.push(item);if(upgrade)upgradeDropNoticePending=true;return {kept:true,sold:0,item,sale:null,reason:sale?.reason||"sale",enhancementStones:blankEnhancementReward()};}\n'
    '   return {kept:false,sold:Math.max(0,Number(sale?.quote?.amount)||0),item,sale,enhancementStones:saleEnhancementReward(item,sale)};\n'
    '  }\n'
    '  state.inventory.push(item);\n'
    '  if(upgrade)upgradeDropNoticePending=true;\n'
    '  return {kept:true,sold:0,item,sale:null,enhancementStones:blankEnhancementReward()};\n'
    ' };\n'
    ' window.addItem=addItem;',re.S)
replace_once('equipmentlock.js',
    ' window.EQUIPMENT_AUTO_SELL_QUALITY_COUNT=6;\n window.EQUIPMENT_MYTHIC_AUTO_SELL_VERSION=1;\n window.EQUIPMENT_MYTHIC_MANUAL_CONFIRM_RETIRED_VERSION=1;\n window.normalizeAutoSellQualitySettings=normalizeAutoSellQualitySettings;\n if(typeof window.registerNewStateNormalizer==="function")window.registerNewStateNormalizer(normalizeAutoSellQualitySettings);\n normalizeAutoSellQualitySettings(state);',
    ' window.EQUIPMENT_MYTHIC_AUTO_SELL_VERSION=2;\n window.EQUIPMENT_MYTHIC_MANUAL_CONFIRM_RETIRED_VERSION=1;\n normalizeAutoSellQualitySettings(state);')

replace_once('offlineprogress.js','const OFFLINE_GEAR_ACCUMULATOR_VERSION=3;','const OFFLINE_GEAR_ACCUMULATOR_VERSION=4;')
sub_once('offlineprogress.js',
    r' function createGearAccumulator\(\{target=null,reject,score,notifyUpgrade=true\}=\{\}\)\{.*?\n \}\n function cloneJson',
    ' function createGearAccumulator({target=null,reject,score,notifyUpgrade=true,respectDisposition=false}={}){\n'
    '  const s=isObject(target)?target:state,scoreItem=typeof score==="function"?score:(item=>equipmentScore(item)),types=equipmentTypes(),bestByType=new Map(),mythics=[],keptByPolicy=[],rejected=[];let droppedCount=0;\n'
    '  function rejectItem(item){if(!item)return;rejected.push(item);if(typeof reject==="function")reject(item);}\n'
    '  function policyDecision(item){if(typeof window.equipmentDropDisposition!=="function")throw new Error("Equipment auto-process policy owner unavailable");return window.equipmentDropDisposition(item,s,{score:scoreItem});}\n'
    '  function consider(raw){const item=normalizeOfflineDrop(raw);if(!item)return;droppedCount++;const type=item.type;if(!types.includes(type)){rejectItem(item);return;}if(respectDisposition===true){const disposition=policyDecision(item);if(disposition?.process===true)rejectItem(item);else keptByPolicy.push(item);return;}if(Number(item.q)===5){mythics.push(item);return;}const previous=bestByType.get(type);if(!previous||scoreItem(item)>scoreItem(previous)){if(previous)rejectItem(previous);bestByType.set(type,item);}else rejectItem(item);}\n'
    '  function finalize(){\n'
    '   if(!Array.isArray(s.inventory))s.inventory=[];\n'
    '   if(respectDisposition===true){const keptOrdinary=keptByPolicy.filter(item=>Number(item.q)!==5),keptMythics=keptByPolicy.filter(item=>Number(item.q)===5),keptUpgrade=keptByPolicy.some(item=>scoreItem(item)>scoreItem(s.equipment?.[item.type]||null));keptOrdinary.forEach(item=>s.inventory.push(item));keptMythics.forEach(item=>s.inventory.push(item));if(keptUpgrade&&notifyUpgrade!==false&&isFormalStateTarget(s)){try{upgradeDropNoticePending=true;}catch(_){}}return {droppedCount,rejected,keptOrdinary,mythics:keptMythics,keptCount:keptByPolicy.length};}\n'
    '   const keptOrdinary=[];bestByType.forEach((item,type)=>{const current=s.equipment?.[type]||null;if(scoreItem(item)>scoreItem(current))keptOrdinary.push(item);else rejectItem(item);});keptOrdinary.forEach(item=>s.inventory.push(item));mythics.forEach(item=>s.inventory.push(item));if(keptOrdinary.length&&notifyUpgrade!==false&&isFormalStateTarget(s)){try{upgradeDropNoticePending=true;}catch(_){}}return {droppedCount,rejected,keptOrdinary,mythics,keptCount:keptOrdinary.length+mythics.length};\n'
    '  }\n'
    '  return {consider,finalize};\n'
    ' }\n'
    ' function cloneJson',re.S)
replace_once('offlineprogress.js','eligibleRolls=countBernoulliHitsGeometric(count,OFFLINE_GEAR_RATE,Math.random),gear=createGearAccumulator({target:state});','eligibleRolls=countBernoulliHitsGeometric(count,OFFLINE_GEAR_RATE,Math.random),gear=createGearAccumulator({target:state,respectDisposition:true});')
sub_once('offlineprogress.js',
    r' function runGearAccumulatorRegression\(\)\{.*?\n \}\n function runThirdWorldOfflinePerformanceIntegrity',
    ' function runGearAccumulatorRegression(){\n'
    '  const errors=[];\n'
    '  function probe(){const target={equipment:{weapon:{score:50},armor:{score:80},helmet:{score:100},shoes:{score:1},accessory:{score:10}},inventory:[{id:"existing",score:1}],settings:{autoSell:[false,false,false,false,true,true],keepUpgrade:true}},rejected=[],gear=createGearAccumulator({target,reject:item=>rejected.push(item.id),score:item=>Number(item?.score)||0,notifyUpgrade:false,respectDisposition:true});gear.consider({id:"legendary-upgrade",type:"weapon",q:4,score:60});gear.consider({id:"legendary-equal",type:"armor",q:4,score:80});gear.consider({id:"epic-kept",type:"helmet",q:3,score:1});gear.consider({id:"mythic-equal",type:"shoes",q:5,score:1});gear.consider({id:"mythic-upgrade",type:"accessory",q:5,score:20});const result=gear.finalize();return {target,rejected,result};}\n'
    '  const a=probe(),b=probe();\n'
    '  if(JSON.stringify(a)!==JSON.stringify(b))errors.push({code:"ACCUMULATOR_NOT_DETERMINISTIC"});\n'
    '  if(a.target.inventory.map(item=>item.id).join("|")!=="existing|legendary-upgrade|epic-kept|mythic-upgrade")errors.push({code:"TARGET_INVENTORY_RESULT",inventory:a.target.inventory});\n'
    '  if(a.rejected.join("|")!=="legendary-equal|mythic-equal"||a.result.keptCount!==3||a.result.droppedCount!==5)errors.push({code:"TARGET_SELECTION_RESULT",rejected:a.rejected,result:a.result});\n'
    '  const strictTarget={equipment:{weapon:{score:50}},inventory:[],settings:{autoSell:[false,false,false,false,false,true],keepUpgrade:false}},strictRejected=[],strict=createGearAccumulator({target:strictTarget,reject:item=>strictRejected.push(item.id),score:item=>Number(item?.score)||0,notifyUpgrade:false,respectDisposition:true});strict.consider({id:"mythic-upgrade-no-keep",type:"weapon",q:5,score:99});const strictResult=strict.finalize();if(strictTarget.inventory.length!==0||strictRejected.join("|")!=="mythic-upgrade-no-keep"||strictResult.keptCount!==0)errors.push({code:"KEEP_UPGRADE_DISABLED",strictRejected,strictResult});\n'
    '  if(a.target.equipment.weapon.score!==50||a.target.equipment.armor.score!==80||a.target.equipment.helmet.score!==100||a.target.equipment.shoes.score!==1||a.target.equipment.accessory.score!==10)errors.push({code:"TARGET_EQUIPMENT_MUTATED"});\n'
    '  return Object.freeze({version:3,passed:errors.length===0,targetIsolation:true,deterministic:true,sharedDispositionOwner:true,allQualitySettings:true,errors:Object.freeze(errors)});\n'
    ' }\n'
    ' function runThirdWorldOfflinePerformanceIntegrity',re.S)
replace_once('offlineprogress.js',' function validateThirdWorldOfflineSettlement(){\n  const errors=[];',' function validateThirdWorldOfflineSettlement(){\n  const errors=[];if(Number(window.EQUIPMENT_AUTO_PROCESS_POLICY_VERSION)!==1||typeof window.equipmentDropDisposition!=="function")errors.push({code:"EQUIPMENT_AUTO_PROCESS_POLICY"});')
replace_once('offlineprogress.js','return Object.freeze({version:5,passed:errors.length===0,gearRate:OFFLINE_GEAR_RATE','return Object.freeze({version:6,passed:errors.length===0,gearRate:OFFLINE_GEAR_RATE')

replace_once('integritycontract.js','GAME_GUIDE_VERSION:24','GAME_GUIDE_VERSION:25')
replace_once('tests/runtime/js-integrity.js','/GAME_GUIDE_VERSION:24/.test(contract)','/GAME_GUIDE_VERSION:25/.test(contract)')
replace_once('tests/runtime/js-integrity.js','/GAME_GUIDE_VERSION=24/.test(gameGuideSource)','/GAME_GUIDE_VERSION=25/.test(gameGuideSource)')
replace_once('tests/runtime/js-integrity.js',
    'const index=read("index.html"),contract=read("integritycontract.js"),runtime=read("runtimeintegrity.js"),finalIntegrity=read("finalintegrity.js"),offlineStateCore=read("offlinestatecore.js"),battlePipeline=read("battlepipeline.js"),offlineProgress=read("offlineprogress.js"),dungeonProgress=read("dungeonprogress.js"),arena=read("dungeonarena.js"),thirdWorldDungeonUi=read("thirdworlddungeonui.js"),gameGuideSource=read("gameguide.js"),saveGuard=read("saveversionguard.js"),compatibility=read("compatibilityowners.js"),worldTransitionSafety=read("worldtransitionsafety.js"),combatMath=read("combatmath.js"),dungeonCore=read("dungeoncore.js"),secondWorldCombat=read("secondworldcombat.js");',
    'const index=read("index.html"),contract=read("integritycontract.js"),runtime=read("runtimeintegrity.js"),finalIntegrity=read("finalintegrity.js"),offlineStateCore=read("offlinestatecore.js"),battlePipeline=read("battlepipeline.js"),offlineProgress=read("offlineprogress.js"),dungeonProgress=read("dungeonprogress.js"),arena=read("dungeonarena.js"),thirdWorldDungeonUi=read("thirdworlddungeonui.js"),gameGuideSource=read("gameguide.js"),saveGuard=read("saveversionguard.js"),compatibility=read("compatibilityowners.js"),worldTransitionSafety=read("worldtransitionsafety.js"),combatMath=read("combatmath.js"),dungeonCore=read("dungeoncore.js"),secondWorldCombat=read("secondworldcombat.js"),engine=read("engine.js"),ui=read("ui.js"),equipmentLock=read("equipmentlock.js");')
replace_once('tests/runtime/js-integrity.js',
    'assert(/window\\.appendOfflineBattleSample/.test(offlineProgress),"第二紀元 Offline sample consumer 必須維持 canonical append owner。")\n',
    'assert(/window\\.appendOfflineBattleSample/.test(offlineProgress),"第二紀元 Offline sample consumer 必須維持 canonical append owner。")\n'
    'assert(/EQUIPMENT_AUTO_SELL_QUALITY_COUNT=6/.test(engine)&&/normalizeAutoSellQualitySettings/.test(engine)&&/autoSell:\\[false,false,false,false,false,false\\]/.test(engine),"六品質自動處理設定 owner／新角色預設未收斂。")\n'
    'assert(/normalizeAutoSellQualitySettings\\(target\\)/.test(ui)&&!/autoSell\\.slice\\(0,6\\)/.test(ui),"UI save normalization 不得維護第二份六品質 autoSell 正規化。")\n'
    'assert(/EQUIPMENT_AUTO_PROCESS_POLICY_VERSION=1/.test(equipmentLock)&&/equipmentDropDisposition/.test(equipmentLock),"裝備自動處理正式 disposition owner 缺失。")\n'
    'assert(/respectDisposition:true/.test(offlineProgress)&&/window\\.equipmentDropDisposition/.test(offlineProgress),"高維 Offline 裝備必須使用正式自動處理 disposition owner。")\n')

for old,new in [
    ('engine.js?v=20260928-thirdworld-vip20-death-protection1','engine.js?v=20261002-autoprocess-policy-batch1'),
    ('ui.js?v=20261002-mythic-autosell-batch2','ui.js?v=20261002-autoprocess-policy-batch1'),
    ('equipmentlock.js?v=20261002-mythic-autosell-batch1','equipmentlock.js?v=20261002-autoprocess-policy-batch1'),
    ('offlineprogress.js?v=20261002-mythic-autosell-offline-fix1','offlineprogress.js?v=20261002-autoprocess-policy-batch1'),
    ('integritycontract.js?v=20260930-audit-batch4','integritycontract.js?v=20261002-autoprocess-policy-batch1')]:
    replace_once('index.html',old,new)
