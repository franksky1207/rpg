from pathlib import Path
import re

def read(p): return Path(p).read_text(encoding='utf-8')
def write(p,s): Path(p).write_text(s,encoding='utf-8')
def once(s,old,new,label):
    c=s.count(old)
    if c!=1: raise SystemExit(f'{label}: expected 1 anchor, got {c}')
    return s.replace(old,new,1)

# 1) Player-facing specialization presentation only. Combat numeric owners stay untouched.
p=read('thirdworlddata.js')
p=once(p,' const VERSION=6;',' const VERSION=7;','thirdworlddata version')
p=once(p,' const SPECIALIZATION_PRESENTATION_VERSION=1;',' const SPECIALIZATION_PRESENTATION_VERSION=2;','specialization presentation version')
for old,new in [
 ('effect=`暴擊 +${finiteWhole(spec.critPoints,0)}pp`','effect=`暴擊 +${finiteWhole(spec.critPoints,0)}%`'),
 ('effect=`閃避 +${finiteWhole(spec.dodgePoints,0)}pp`','effect=`閃避 +${finiteWhole(spec.dodgePoints,0)}%`'),
 ('effect=`連擊率 +${finiteWhole(spec.comboRatePoints,0)}pp`','effect=`連擊率 +${finiteWhole(spec.comboRatePoints,0)}%`'),
 ('effect=`穿透率 +${finiteWhole(spec.penetrationRatePoints,0)}pp`','effect=`穿透率 +${finiteWhole(spec.penetrationRatePoints,0)}%`'),
 ('effect=`反擊率 +${finiteWhole(spec.counterRatePoints,0)}pp`','effect=`反擊率 +${finiteWhole(spec.counterRatePoints,0)}%`'),
 ('effect=`汲取率 +${finiteWhole(spec.drainRatePoints,0)}pp`','effect=`汲取率 +${finiteWhole(spec.drainRatePoints,0)}%`'),
 ('effect=`第一擊加成 +${finiteWhole(spec.initiativeBonusPoints,0)}pp`','effect=`第一擊加成 +${finiteWhole(spec.initiativeBonusPoints,0)}%`'),
]:
    p=once(p,old,new,'specialization '+old[:8])
# Behavioral presentation check without touching stats.
needle='   if(BOSS_ROWS.some(row=>{const p=thirdWorldBossSpecializationPresentation(row);return !p||!p.label||!p.effect;}))fail("BOSS_SPECIALIZATION_PRESENTATION");'
replacement=needle+'\n   const presentationEffects=BOSS_ROWS.map(row=>thirdWorldBossSpecializationPresentation(row)?.effect||"");\n   if(presentationEffects.some(effect=>effect.includes("pp"))||presentationEffects[2]!=="暴擊 +6%"||presentationEffects[4]!=="連擊率 +10%"||presentationEffects[8]!=="第一擊加成 +20%")fail("BOSS_SPECIALIZATION_PERCENT_PRESENTATION",presentationEffects);'
p=once(p,needle,replacement,'presentation regression')
write('thirdworlddata.js',p)

# 2) Canonical W3 contract follows the changed owner only.
c=read('thirdworldintegritycontract.js')
c=once(c,' const VERSION=36;',' const VERSION=37;','contract version')
c=once(c,'THIRD_WORLD_DATA_VERSION:6,','THIRD_WORLD_DATA_VERSION:7,','contract data version')
c=once(c,'THIRD_WORLD_BOSS_SPECIALIZATION_PRESENTATION_VERSION:1,','THIRD_WORLD_BOSS_SPECIALIZATION_PRESENTATION_VERSION:2,','contract presentation version')
write('thirdworldintegritycontract.js',c)

# 3) Runtime static contract / cache expectations.
t=read('tests/runtime/js-integrity.js')
t=t.replace('thirdworlddata.js?v=20260925-thirdworld-batch10-o3','thirdworlddata.js?v=20260928-thirdworld-batch12-o4')
t=t.replace('thirdworldintegritycontract.js?v=20260928-thirdworld-batch12-o1','thirdworldintegritycontract.js?v=20260928-thirdworld-batch12-o4')
# Add source-level assurance only if not present.
anchor='const thirdWorldUi=read("thirdworldui.js");'
if 'const thirdWorldData=read("thirdworlddata.js");' not in t:
    t=once(t,anchor,anchor+'\nconst thirdWorldData=read("thirdworlddata.js");','runtime data read')
marker='// Inventory Focus behavior contract:'
check='assert(/const VERSION=7;/.test(thirdWorldData)&&/SPECIALIZATION_PRESENTATION_VERSION=2/.test(thirdWorldData),"W3 data／特化 presentation 應為 O4 最新版本。");\nassert(!/effect=`[^`]*pp`/.test(thirdWorldData)&&/暴擊 \\+\\$\\{finiteWhole\\(spec\\.critPoints,0\\)\\}%/.test(thirdWorldData),"玩家可見高維 Boss 特化百分點必須顯示 %，不得再顯示 pp。");\n'
if check not in t:
    t=once(t,marker,check+'\n'+marker,'runtime O4 checks')
write('tests/runtime/js-integrity.js',t)

# 4) Cache-bust changed JS owners.
i=read('index.html')
for name in ['thirdworlddata.js','thirdworldintegritycontract.js']:
    pattern=rf'{re.escape(name)}\?v=[^"\']+'
    repl=f'{name}?v=20260928-thirdworld-batch12-o4'
    i,n=re.subn(pattern,repl,i,count=1)
    if n!=1: raise SystemExit(f'index cache anchor missing: {name} ({n})')
write('index.html',i)

# 5) Handoff: bring the stale top-level snapshot forward and close Batch 12/O1-O4.
h=read('PROJECT_HANDOFF.md')
h=re.sub(r'本次交接前 current `main` HEAD：\n\n```text\n[^\n]+\n```', '本次交接前 current `main` HEAD：\n\n```text\n410b86acc7bd773e0af1c54b09cacf0df238f2a9\n```', h, count=1)
old_done='''目前已完成：

- 第 9 大批：高維正式玩家 UI；
- 第 9 優化-1～5；
- 第 10 大批：10-1～10-5 正式連戰玩家流程與事件呈現；
- 第 10 優化-1～3：runtime 安全、legacy/offline contract、owner/UI 收斂。'''
new_done='''目前已完成：

- 第 9 大批與第 9 優化-1～5：高維正式玩家 UI／Core／裝備／離線等收斂；
- 第 10 大批與第 10 優化-1～3：正式連戰玩家流程、事件呈現、runtime 安全、legacy/offline contract；
- 第 11 大批＋11-O1～O3：三紀元冒險 Era View、W3／W2／W1 回顧戰、shared review runtime／W2 legacy transient cleanup；
- 第 12 大批 12-1～12-4：三紀元共用 Story Registry、W3 trigger／queue／reload recovery、settlement→Story、completion-ready、Summary→Story→Title post-flow；
- 第 12-O1：W3 Story 舊資料 reconciliation、失效 Story reference recovery、Schema16 migration regression；
- 第 12-O2：W3 Story completion 單一 owner、formal/generic Story lifecycle identity；
- 第 12-O3：Story normalization 收斂、shared pending arbitration、behavioral regression；
- 第 12-O4：更新交接基準與高維 Boss 特化玩家文案 `%` 收尾。'''
h=once(h,old_done,new_done,'handoff completed list')
# Refresh the compact version block rather than trying to catalog every subsystem constant.
block_re=r'目前第三紀元主要版本／owner：\n\n```text\n.*?\n```\n\n實際 global 名稱最後一項為：\n\n```text\n.*?\n```'
block_new='''目前第三紀元／Story 主要版本／owner（current main 摘要）：

```text
SAVE_SCHEMA_VERSION = 16
WORLD_PHASE_VERSION = 6
THIRD_WORLD_PHASE_VERSION = 7
THIRD_WORLD_DATA_VERSION = 7
THIRD_WORLD_BOSS_SPECIALIZATION_PRESENTATION_VERSION = 2
THIRD_WORLD_COMBAT_VERSION = 6
THIRD_WORLD_PROGRESS_VERSION = 5
THIRD_WORLD_SETTLEMENT_VERSION = 5
THIRD_WORLD_RUN_VERSION = 7
THIRD_WORLD_CONTINUOUS_RUNTIME_VERSION = 4
THIRD_WORLD_RUN_INTEGRITY_VERSION = 8
THIRD_WORLD_CORE_PROGRESSION_VERSION = 3
THIRD_WORLD_EQUIPMENT_REWARD_VERSION = 3
THIRD_WORLD_PLAYER_UI_VERSION = 9
THIRD_WORLD_PLAYER_FLOW_VERSION = 6
SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_VERSION = 5
CIVILIZATION_STORY_PROGRESS_VERSION = 17
STORY_RUNTIME_INTEGRITY_VERSION = 18
STORY_UI_VERSION = 10
STORY_UI_LIFECYCLE_WAIT_VERSION = 2
STORY_UI_INSTANCE_IDENTITY_VERSION = 1
CIVILIZATION_THIRD_WORLD_DATA_CONTRACT_EXTENSION_VERSION = 37
```

> 版本只做快速索引；下一個對話仍必須重新讀 current `main` owner，不能以本表取代實碼。'''
h,n=re.subn(block_re,block_new,h,count=1,flags=re.S)
if n!=1: raise SystemExit('handoff version block mismatch')
# Replace the old pp debt note with the completed O4 policy.
old_note='''**current-main 注意：** `thirdWorldBossSpecializationPresentation()` 目前對暴擊／閃避／連擊／穿透／反擊／汲取／先制的特化效果字串仍使用 `pp` 字樣，而 Boss 卡會顯示該 `spec.effect`。第 10 優化-3 已清掉「5pp 戰線」玩家文案，但尚未改這個特化效果 presentation。若之後要落實「所有玩家可見百分點一律顯示 `%`」，應另行處理，不要偷偷混入第 11 批。'''
new_note='''**玩家顯示政策（第 12-O4 已完成）：** `thirdWorldBossSpecializationPresentation()` 對暴擊／閃避／連擊／穿透／反擊／汲取／先制的玩家可見特化效果統一顯示 `%`；底層仍以 points 欄位做數值加成，未改任何戰鬥公式。5% 戰線也繼續只顯示 `%`。'''
h=once(h,old_note,new_note,'handoff pp note')
# Insert current Story framework section before level/combat if absent.
story_section='''
# 5A. 第 11／12 大批：三紀元回顧與共用 Story Framework

冒險／回顧：

- `adventureEraView` 是 session-only 共用 Era View owner；W3 可切高維／宇宙回顧／銀河回顧，W2 可切宇宙／銀河回顧；
- W3 defeated boss review、W2 100 Boss real review、W1 review 共用 review runtime lock／source owner；回顧一律零正式收益、零正式進度；
- W2 normalization 保留未知 future fields，只清明確退休 transient；Schema 16 不因 cleanup 升版。

高維 Story Framework：

- Trigger 共 11 個：`intro ×1 + milestone(stage 1～9) ×9 + final(stage 10 / 0%) ×1`；**0% 不另有第 10 篇 milestone**；
- W3 descriptor 在正式正文加入前維持 `contentReady:false`，placeholder 不得進 shared `pendingStory`；
- 三紀元共用 `storyProgress.pendingStory / completedStories`，W3 不另建 persistent queue；
- `story.unlockedStage` 由十王 canonical aggregate/title tier owner reconciliation，不另寫 900／800／…／0 公式；
- Story 舊資料會清理不存在／placeholder reference；合法 W1／W2 reference 必須保留；
- W3 Story completion 單一 owner：Intro 完成同步 `introSeen`；Final 只有在十王全滅＋stage10 後讀完，才原子寫入 `finalSeen=true` 與 `thirdWorld.completed=true`；
- Story lifecycle 使用 session token＋storyId＋`formal/generic` owner，GM／戰線紀錄 replay 不得冒充正式流程；
- W3 正式 post-flow：`Run Summary → Story → Title Notice`；title hold 為 session-only；
- shared pending arbitration 能辨識 galaxy／universe／higher-dimensional／unknown；W3 遇 foreign pending 只 defer，不搶、不清；unknown fail-closed；
- `CIVILIZATION_STORY_PROGRESS_VERSION=17` 已收斂重複 normalization，並由 Story Runtime Integrity 實際執行 behavioral regression。

**尚未完成／不得自行創作：** 高維序章正文、900～100% 九段 milestone 正文、0% Final 正文與最終畫面仍屬第 13 批內容，現在只有 framework。

---
'''
if '# 5A. 第 11／12 大批' not in h:
    h=once(h,'# 6. 等級／Combat／Settlement',story_section+'\n# 6. 等級／Combat／Settlement','handoff Story section')
write('PROJECT_HANDOFF.md',h)
