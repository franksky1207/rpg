from pathlib import Path


def read(path):
    return Path(path).read_text(encoding='utf-8')

def write(path,text):
    Path(path).write_text(text,encoding='utf-8')

def rep(path,old,new,count=1):
    text=read(path)
    actual=text.count(old)
    if actual!=count:
        raise SystemExit(f"{path}: expected {count} match(es), found {actual}: {old[:180]!r}")
    write(path,text.replace(old,new,count))

# worldmapui.js — shared review runtime becomes the only mutable truth.
rep('worldmapui.js','  let galaxyReviewSelectedEnemy=4;\n  let galaxyReviewBattleActive=false;\n  let adventureReviewBattleActive=false;\n','  let galaxyReviewSelectedEnemy=4;\n  let adventureReviewBattleActive=false;\n')
rep('worldmapui.js',
'''  window.setGalaxyReviewBattleActive=function(value){\n    galaxyReviewBattleActive=value===true;\n    if(typeof window.setAdventureReviewBattleActive==="function")window.setAdventureReviewBattleActive(galaxyReviewBattleActive,galaxyReviewBattleActive?"galaxy":null);\n    return galaxyReviewBattleActive;\n  };\n  window.isGalaxyReviewBattleActive=function(){return galaxyReviewBattleActive===true;};\n''',
'''  // Legacy Galaxy API is compatibility-only; shared adventureReviewBattleActive/source is the sole runtime truth.\n  window.setGalaxyReviewBattleActive=function(value){\n    if(value===true){\n      if(typeof window.setAdventureReviewBattleActive==="function")window.setAdventureReviewBattleActive(true,"galaxy");\n      return typeof window.getAdventureReviewBattleSource==="function"&&window.getAdventureReviewBattleSource()==="galaxy";\n    }\n    if(typeof window.getAdventureReviewBattleSource==="function"&&window.getAdventureReviewBattleSource()==="galaxy"&&typeof window.setAdventureReviewBattleActive==="function")window.setAdventureReviewBattleActive(false);\n    return false;\n  };\n  window.isGalaxyReviewBattleActive=function(){return typeof window.isAdventureReviewBattleActive==="function"&&window.isAdventureReviewBattleActive()===true&&typeof window.getAdventureReviewBattleSource==="function"&&window.getAdventureReviewBattleSource()==="galaxy";};\n''')
rep('worldmapui.js',
'''  window.isAdventureReviewBattleActive=function(){return adventureReviewBattleActive===true;};\n  window.getAdventureReviewBattleSource=function(){return adventureReviewBattleActive===true?adventureReviewBattleSource:null;};\n  window.adventureEraViewLocked=adventureEraViewLocked;\n''',
'''  window.isAdventureReviewBattleActive=function(){return adventureReviewBattleActive===true;};\n  window.getAdventureReviewBattleSource=function(){return adventureReviewBattleActive===true?adventureReviewBattleSource:null;};\n  function adventureReviewWorldTransitionBlocker(){\n    if(adventureReviewBattleActive!==true)return false;\n    return {blocked:true,reasons:[adventureReviewBattleSource||"active"]};\n  }\n  const adventureReviewTransitionBlockerRegistered=typeof window.registerWorldTransitionRuntimeBlocker==="function"&&window.registerWorldTransitionRuntimeBlocker("adventure-review-runtime",adventureReviewWorldTransitionBlocker)===true;\n  if(typeof window.addEventListener==="function")window.addEventListener("pagehide",()=>{adventureReviewBattleActive=false;adventureReviewBattleSource=null;},{capture:false});\n  window.adventureEraViewLocked=adventureEraViewLocked;\n''')
rep('worldmapui.js',
'''  window.ADVENTURE_ERA_RUNTIME_LOCK_VERSION=3;\n  window.ADVENTURE_REVIEW_RUNTIME_SOURCE_VERSION=1;\n''',
'''  window.ADVENTURE_ERA_RUNTIME_LOCK_VERSION=4;\n  window.ADVENTURE_REVIEW_RUNTIME_SOURCE_VERSION=2;\n  window.GALAXY_REVIEW_SHARED_RUNTIME_DELEGATE_VERSION=1;\n  window.ADVENTURE_REVIEW_WORLD_TRANSITION_BLOCKER_VERSION=1;\n  window.ADVENTURE_REVIEW_PAGEHIDE_RESET_VERSION=1;\n  window.ADVENTURE_REVIEW_WORLD_TRANSITION_BLOCKER_REGISTERED=adventureReviewTransitionBlockerRegistered===true;\n''')

# Third-world extension tracks shared cross-era review runtime convergence.
rep('thirdworldintegritycontract.js',' const VERSION=31;\n',' const VERSION=32;\n')
rep('thirdworldintegritycontract.js',
'  ADVENTURE_ERA_VIEW_OWNER_VERSION:1,ADVENTURE_ERA_SESSION_POLICY_VERSION:1,ADVENTURE_ERA_RUNTIME_LOCK_VERSION:3,ADVENTURE_REVIEW_RUNTIME_SOURCE_VERSION:1,\n',
'  ADVENTURE_ERA_VIEW_OWNER_VERSION:1,ADVENTURE_ERA_SESSION_POLICY_VERSION:1,ADVENTURE_ERA_RUNTIME_LOCK_VERSION:4,ADVENTURE_REVIEW_RUNTIME_SOURCE_VERSION:2,GALAXY_REVIEW_SHARED_RUNTIME_DELEGATE_VERSION:1,ADVENTURE_REVIEW_WORLD_TRANSITION_BLOCKER_VERSION:1,ADVENTURE_REVIEW_PAGEHIDE_RESET_VERSION:1,\n')
rep('thirdworldintegritycontract.js','"setAdventureReviewBattleActive","isAdventureReviewBattleActive","getAdventureReviewBattleSource"','"setAdventureReviewBattleActive","isAdventureReviewBattleActive","getAdventureReviewBattleSource","isGalaxyReviewBattleActive"')

# Runtime static regression for single source of truth and canonical world-transition registry integration.
rep('tests/runtime/js-integrity.js','const worldmap=read("worldmapui.js");\n','const worldmap=read("worldmapui.js");\nconst worldPhase=read("worldphase.js");\n')
rep('tests/runtime/js-integrity.js',
'''assert(/ADVENTURE_ERA_VIEW_OWNER_VERSION=1/.test(worldmap)&&/ADVENTURE_ERA_SESSION_POLICY_VERSION=1/.test(worldmap)&&/ADVENTURE_ERA_RUNTIME_LOCK_VERSION=3/.test(worldmap)&&/ADVENTURE_REVIEW_RUNTIME_SOURCE_VERSION=1/.test(worldmap),"三紀元冒險切換必須由單一 session-only owner 持有，並具備可辨識來源的 shared review runtime lock。");\n''',
'''assert(/ADVENTURE_ERA_VIEW_OWNER_VERSION=1/.test(worldmap)&&/ADVENTURE_ERA_SESSION_POLICY_VERSION=1/.test(worldmap)&&/ADVENTURE_ERA_RUNTIME_LOCK_VERSION=4/.test(worldmap)&&/ADVENTURE_REVIEW_RUNTIME_SOURCE_VERSION=2/.test(worldmap)&&/GALAXY_REVIEW_SHARED_RUNTIME_DELEGATE_VERSION=1/.test(worldmap),"三紀元冒險切換必須由單一 session-only owner 持有；銀河 legacy API 僅能作 shared review runtime delegate。\");\nassert(!/let galaxyReviewBattleActive=/.test(worldmap)&&/getAdventureReviewBattleSource\(\)==="galaxy"/.test(worldmap)&&/isAdventureReviewBattleActive\(\)===true/.test(worldmap),"銀河回顧不得再持有獨立 mutable active flag，必須完全由 shared source/lock 衍生。\");\nassert(/registerWorldTransitionRuntimeBlocker\("adventure-review-runtime",adventureReviewWorldTransitionBlocker\)/.test(worldmap)&&/ADVENTURE_REVIEW_WORLD_TRANSITION_BLOCKER_VERSION=1/.test(worldmap)&&/ADVENTURE_REVIEW_WORLD_TRANSITION_BLOCKER_REGISTERED=adventureReviewTransitionBlockerRegistered===true/.test(worldmap),"Shared review runtime 必須正式註冊到 World Transition blocker registry。\");\nassert(/ADVENTURE_REVIEW_PAGEHIDE_RESET_VERSION=1/.test(worldmap)&&/addEventListener\("pagehide",\(\)=>\{adventureReviewBattleActive=false;adventureReviewBattleSource=null;\}/.test(worldmap),"Shared review runtime 必須在 pagehide 清除 transient lock/source，避免 bfcache/reload 殘留。\");\nassert(/WORLD_TRANSITION_BLOCKER_REGISTRY_VERSION=1/.test(worldPhase)&&/registerWorldTransitionRuntimeBlocker=registerWorldTransitionRuntimeBlocker/.test(worldPhase)&&/worldTransitionRuntimeBlockers\.forEach/.test(worldPhase),"World Phase 必須維持 canonical runtime blocker registry owner。\");\n''')
rep('tests/runtime/js-integrity.js',
'''assert(/setAdventureReviewBattleActive=function\\(value,source=null\\)/.test(worldmap)&&/getAdventureReviewBattleSource=function/.test(worldmap)&&/setAdventureReviewBattleActive\\(galaxyReviewBattleActive,galaxyReviewBattleActive\\?"galaxy":null\\)/.test(worldmap),"銀河／宇宙／高維回顧必須共用單一 review runtime source/lock owner。");\n''',
'''assert(/setAdventureReviewBattleActive=function\\(value,source=null\\)/.test(worldmap)&&/getAdventureReviewBattleSource=function/.test(worldmap)&&/setAdventureReviewBattleActive\\(true,"galaxy"\\)/.test(worldmap)&&!/galaxyReviewBattleActive/.test(worldmap),"銀河／宇宙／高維回顧必須共用單一 review runtime source/lock owner，不得保留銀河第二份 active state。");\n''')

# Cache-bust changed production owners only.
for old,new in [
 ('worldmapui.js?v=20260928-thirdworld-batch11-4','worldmapui.js?v=20260928-thirdworld-batch11-o2'),
 ('thirdworldintegritycontract.js?v=20260928-thirdworld-batch11-o1','thirdworldintegritycontract.js?v=20260928-thirdworld-batch11-o2')
]:
    text=read('index.html')
    needle=f'src="{old}"'
    replacement=f'src="{new}"'
    actual=text.count(needle)
    if actual!=1:
        raise SystemExit(f"index.html: expected 1 exact script match, found {actual}: {needle!r}")
    write('index.html',text.replace(needle,replacement,1))

# Keep cache expectations exact and avoid filename substring collisions.
rep('tests/runtime/js-integrity.js','src="worldmapui.js?v=20260928-thirdworld-batch11-4"','src="worldmapui.js?v=20260928-thirdworld-batch11-o2"')
rep('tests/runtime/js-integrity.js','src="thirdworldintegritycontract.js?v=20260928-thirdworld-batch11-o1"','src="thirdworldintegritycontract.js?v=20260928-thirdworld-batch11-o2"')
