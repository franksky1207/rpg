from pathlib import Path
import re

TAG='20260928-thirdworld-guide-opt1'

def read(path): return Path(path).read_text(encoding='utf-8')
def write(path,s): Path(path).write_text(s,encoding='utf-8')
def one(s,old,new,label):
    c=s.count(old)
    if c!=1: raise SystemExit(f'{label}: expected 1 match, got {c}')
    return s.replace(old,new,1)

# ---- offlineprogress.js: expose the existing canonical duration policy, no behavior change ----
s=read('offlineprogress.js')
needle='})();'
pos=s.rfind(needle)
if pos<0: raise SystemExit('offlineprogress closure missing')
exports='''window.OFFLINE_PROGRESS_MAX_MS=OFFLINE_MAX_MS;\nwindow.OFFLINE_PROGRESS_MAX_HOURS=OFFLINE_MAX_MS/(60*60*1000);\nwindow.OFFLINE_DURATION_POLICY_VERSION=1;\n'''
if 'OFFLINE_DURATION_POLICY_VERSION' in s: raise SystemExit('offline duration export already exists')
s=s[:pos]+exports+s[pos:]
write('offlineprogress.js',s)

# ---- gameguide.js ----
s=read('gameguide.js')
old=''' function guidePhase(target=null){
  const holder=target&&typeof target==="object"?target:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);
  if(typeof window.currentWorldPhase==="function"){
   try{const value=Number(window.currentWorldPhase(holder));if(Number.isInteger(value)&&value>=1&&value<=3)return value;}catch(_){}
  }
  if(holder?.thirdWorld?.entered===true)return 3;
  if(holder?.secondWorld?.entered===true)return 2;
  return 1;
 }
'''
new=''' function guideState(target=null){return target&&typeof target==="object"?target:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);}
 function guidePhase(target=null){
  const holder=guideState(target);
  if(typeof window.currentWorldPhase==="function"){
   try{const value=Number(window.currentWorldPhase(holder));if(Number.isInteger(value)&&value>=1&&value<=3)return value;}catch(_){}
  }
  // 僅保留早期載入／測試相容 fallback；正式 runtime 以 currentWorldPhase 為唯一 owner。
  return holder?.thirdWorld?.entered===true?3:(holder?.secondWorld?.entered===true?2:1);
 }
 function thirdWorldGuideRuleSnapshot(target=null){
  const holder=guideState(target),entry=window.THIRD_WORLD_ENTRY_CONFIG||{},quality=window.THIRD_WORLD_EQUIPMENT_BASE_POLICY||{},stage=window.THIRD_WORLD_BOSS_STAGE_CONFIG||{};
  const levelCap=typeof window.effectiveLevelCap==="function"?Math.max(1,Math.floor(Number(window.effectiveLevelCap(holder))||1)):Math.max(1,Math.floor(Number(window.THIRD_WORLD_LEVEL_CAP)||Number(window.ABSOLUTE_MAX_LEVEL)||1));
  const entryLevel=Math.max(1,Math.floor(Number(entry.level)||Math.min(levelCap,1)));
  const expPerLevel=typeof window.effectiveExpNeed==="function"?Math.max(0,Math.floor(Number(window.effectiveExpNeed(entryLevel,holder))||0)):Math.max(0,Math.floor(Number(window.THIRD_WORLD_EXP_PER_LEVEL)||0));
  const enhancementCap=typeof window.effectiveEnhancementCap==="function"?Math.max(0,Math.floor(Number(window.effectiveEnhancementCap(holder))||0)):Math.max(0,Math.floor(Number(window.ENHANCEMENT_ABSOLUTE_MAX_LEVEL)||0));
  const vipRequired=Math.max(0,Math.floor(Number(entry.vipLevel)||0));
  const deathLossPercent=Math.max(0,Number(window.DEATH_EQUIPMENT_LOSS_CHANCE)||0)*100;
  const legendaryPercent=Math.max(0,Number(quality.legendaryChance)||0)*100,mythicPercent=Math.max(0,Number(quality.mythicChance)||0)*100;
  const offlineMaxHours=Math.max(0,Number(window.OFFLINE_PROGRESS_MAX_HOURS)||0);
  return Object.freeze({
   phase:guidePhase(holder),entryLevel,levelCap,expPerLevel,enhancementCap,vipRequired,deathLossPercent,legendaryPercent,mythicPercent,offlineMaxHours,
   bossCount:Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_COUNT)||1)),bossMaxHp:Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_MAX_HP)||1)),fivePointHpGap:Math.max(1,Math.floor(Number(window.THIRD_WORLD_FIVE_POINT_HP_GAP)||1)),maxDeaths:Math.max(1,Math.floor(Number(window.THIRD_WORLD_RUN_MAX_DEATHS)||1)),maxStage:Math.max(0,Math.floor(Number(stage.maxStage)||0))
  });
 }
'''
s=one(s,old,new,'guide phase block')

old=''' function thirdWorldStageGuideText(){
  const cfg=window.THIRD_WORLD_BOSS_STAGE_CONFIG||{};
  const atk=Math.max(0,Math.floor(Number(cfg.atkPerStage)||600)),def=Math.max(0,Math.floor(Number(cfg.defPerStage)||1200)),crit=Math.max(0,Number(cfg.critPointsPerStage)||2),dodge=Math.max(0,Number(cfg.dodgePointsPerStage)||2);
  return `Boss 永久 HP 每跨過 90%、80%……10% 門檻就進入下一個 Stage，最高 Stage 9。每提升 1 Stage：ATK +${atk.toLocaleString()}、DEF +${def.toLocaleString()}、暴擊 +${crit}%、閃避 +${dodge}%。`;
 }
'''
new=''' function thirdWorldStageGuideText(rules=null){
  const cfg=window.THIRD_WORLD_BOSS_STAGE_CONFIG||{},snapshot=rules&&typeof rules==="object"?rules:thirdWorldGuideRuleSnapshot();
  const atk=Math.max(0,Math.floor(Number(cfg.atkPerStage)||0)),def=Math.max(0,Math.floor(Number(cfg.defPerStage)||0)),crit=Math.max(0,Number(cfg.critPointsPerStage)||0),dodge=Math.max(0,Number(cfg.dodgePointsPerStage)||0),step=Math.max(1,Math.floor(Number(cfg.stepPercent)||10));
  const firstThreshold=Math.max(step,100-step),lastThreshold=Math.max(step,100-snapshot.maxStage*step);
  return `Boss 永久 HP 每跨過 ${firstThreshold}%、${Math.max(lastThreshold,step)}% 等 ${step}% 門檻就進入下一個 Stage，最高 Stage ${snapshot.maxStage}。每提升 1 Stage：ATK +${atk.toLocaleString()}、DEF +${def.toLocaleString()}、暴擊 +${crit}%、閃避 +${dodge}%。`;
 }
'''
s=one(s,old,new,'stage guide')

old=''' function thirdWorldGuideCategories(target=null){
  const bossCount=Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_COUNT)||10)),bossHp=Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_MAX_HP)||1100000000)),gap=Math.max(1,Math.floor(Number(window.THIRD_WORLD_FIVE_POINT_HP_GAP)||55000000)),maxDeaths=Math.max(1,Math.floor(Number(window.THIRD_WORLD_RUN_MAX_DEATHS)||100);
'''
# current source has syntax fixed and different exact ending. use regex instead
pattern=r' function thirdWorldGuideCategories\(target=null\)\{\n  const bossCount=.*?;\n'
m=re.search(pattern,s)
if not m: raise SystemExit('thirdWorldGuideCategories header missing')
replacement=''' function thirdWorldGuideCategories(target=null){
  const rules=thirdWorldGuideRuleSnapshot(target),bossCount=rules.bossCount,bossHp=rules.bossMaxHp,gap=rules.fivePointHpGap,maxDeaths=rules.maxDeaths;
'''
s=s[:m.start()]+replacement+s[m.end():]

repls={
 '最多計算 12 小時。':'最多計算 ${rules.offlineMaxHours.toLocaleString()} 小時。',
 '高維紀元角色等級上限為 Lv2000。Lv1000～1999 每級固定需要 10,000,000 EXP；到達 Lv2000 後不再累積 EXP。':'高維紀元角色等級上限為 Lv${rules.levelCap}。Lv${rules.entryLevel}～${Math.max(rules.entryLevel,rules.levelCap-1)} 每級固定需要 ${rules.expPerLevel.toLocaleString()} EXP；到達 Lv${rules.levelCap} 後不再累積 EXP。',
 '基礎品質池為 95% 傳說、5% 神話':'基礎品質池為 ${rules.legendaryPercent.toLocaleString()}% 傳說、${rules.mythicPercent.toLocaleString()}% 神話',
 '最高 Lv2000。':'最高 Lv${rules.levelCap}。',
 '五部位 +40 強化':'五部位 +${rules.enhancementCap} 強化',
 '第三紀元死亡仍會執行原本 30% 的裝備遺失判定，但進入第三紀元本來就要求 VIP20':'第三紀元死亡仍會執行原本 ${rules.deathLossPercent.toLocaleString()}% 的裝備遺失判定，但進入第三紀元本來就要求 VIP${rules.vipRequired}',
 '["Stage 強化",thirdWorldStageGuideText()]':'["Stage 強化",thirdWorldStageGuideText(rules)]',
 'VIP20 是最後一個特殊特權階段，之後仍可持續提升基本能力。第三紀元會繼續套用目前仍有效的 VIP 特權。':'VIP 等級沒有上限，第三紀元會繼續套用目前仍有效的 VIP 特權。',
 '["VIP20","VIP20 同時是進入第三紀元的必要條件，也是第三紀元死亡裝備保護的來源；高維結算會把這項保護明確呈現給玩家。"]':'["VIP 裝備保護",`VIP${rules.vipRequired} 同時是進入第三紀元的必要條件，也是第三紀元死亡裝備保護的來源；高維結算會把這項保護明確呈現給玩家。`]'
}
for old,newv in repls.items():
    if old not in s: raise SystemExit(f'guide text anchor missing: {old}')
    s=s.replace(old,newv,1)

# version + exports + current-category validation
s=one(s,' window.GAME_GUIDE_VERSION=21;',' window.GAME_GUIDE_VERSION=22;','guide version')
s=one(s,' window.GAME_GUIDE_WORLD_AWARE_VERSION=8;',' window.GAME_GUIDE_WORLD_AWARE_VERSION=9;','world aware')
s=one(s,' window.GAME_GUIDE_WORLD_PHASE_OWNER_VERSION=1;',' window.GAME_GUIDE_WORLD_PHASE_OWNER_VERSION=2;\n window.GAME_GUIDE_THIRD_WORLD_RULE_SNAPSHOT_VERSION=1;\n window.GAME_GUIDE_CURRENT_CATEGORY_VALIDATION_VERSION=1;','phase owner version')
s=one(s,' window.gameGuideCategoriesForState=gameGuideCategoriesForState;',' window.gameGuideCategoriesForState=gameGuideCategoriesForState;\n window.thirdWorldGuideRuleSnapshot=thirdWorldGuideRuleSnapshot;','snapshot export')
s=one(s,' window.setGameGuideCategory=function(id){if(!GUIDE_CATEGORIES.some(x=>x.id===id))return;activeGuideCategory=id;if(typeof render==="function")render();};',' window.setGameGuideCategory=function(id){const categories=gameGuideCategoriesForState();if(!categories.some(x=>x.id===id))return;activeGuideCategory=id;if(typeof render==="function")render();};','category setter')
write('gameguide.js',s)

# ---- index cache bust ----
s=read('index.html')
s=one(s,'gameguide.js?v=20260928-thirdworld-entity-term1',f'gameguide.js?v={TAG}','gameguide cache')
s=one(s,'offlineprogress.js?v=20260927-offline-final-batch8-o3',f'offlineprogress.js?v={TAG}','offline cache')
write('index.html',s)

# ---- runtime integrity ----
s=read('tests/runtime/js-integrity.js')
s=s.replace('GAME_GUIDE_VERSION=21','GAME_GUIDE_VERSION=22').replace('GAME_GUIDE_WORLD_AWARE_VERSION=8','GAME_GUIDE_WORLD_AWARE_VERSION=9')
s=s.replace('GAME_GUIDE_WORLD_PHASE_OWNER_VERSION=1','GAME_GUIDE_WORLD_PHASE_OWNER_VERSION=2')
s=s.replace("gameguide.js?v=20260928-thirdworld-entity-term1",f"gameguide.js?v={TAG}")
anchor='assert(/GAME_GUIDE_VERSION=22/.test(gameGuideSource)&&/GAME_GUIDE_WORLD_AWARE_VERSION=9/.test(gameGuideSource)&&/GAME_GUIDE_WORLD_PHASE_OWNER_VERSION=2/.test(gameGuideSource)&&/GAME_GUIDE_THIRD_WORLD_VERSION=1/.test(gameGuideSource),'
if anchor not in s: raise SystemExit('updated guide version assertion anchor missing')
insert='''assert(/GAME_GUIDE_THIRD_WORLD_RULE_SNAPSHOT_VERSION=1/.test(gameGuideSource)&&/GAME_GUIDE_CURRENT_CATEGORY_VALIDATION_VERSION=1/.test(gameGuideSource),"W3 Guide 必須使用正式 rule snapshot 與當前紀元分類驗證。\");
assert(/effectiveLevelCap/.test(gameGuideSource)&&/effectiveExpNeed/.test(gameGuideSource)&&/effectiveEnhancementCap/.test(gameGuideSource)&&/THIRD_WORLD_ENTRY_CONFIG/.test(gameGuideSource)&&/THIRD_WORLD_EQUIPMENT_BASE_POLICY/.test(gameGuideSource)&&/DEATH_EQUIPMENT_LOSS_CHANCE/.test(gameGuideSource)&&/OFFLINE_PROGRESS_MAX_HOURS/.test(gameGuideSource),"W3 Guide 正式數值必須委派 canonical owner，不得維護第二份玩家規則。\");
assert(/const categories=gameGuideCategoriesForState\(\);if\(!categories\.some\(x=>x\.id===id\)\)return/.test(gameGuideSource),"Guide 分類切換必須依當前紀元實際 categories 驗證。\");
assert(/OFFLINE_DURATION_POLICY_VERSION=1/.test(offline)&&/OFFLINE_PROGRESS_MAX_HOURS=OFFLINE_MAX_MS\/\(60\*60\*1000\)/.test(offline),"離線 12 小時上限必須由 offlineprogress canonical owner 對外提供。\");
assert(index.includes('offlineprogress.js?v=20260928-thirdworld-guide-opt1'),"Guide Opt1 修改 offlineprogress.js export 後必須同步 cache-bust。\");
'''
idx=s.find(anchor)
if idx<0: raise SystemExit('cannot locate insertion point')
s=s[:idx]+insert+s[idx:]
write('tests/runtime/js-integrity.js',s)
print('guide optimization batch1 patch applied')
