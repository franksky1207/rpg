from pathlib import Path

TAG='20260928-thirdworld-guide-opt2'

def read(path): return Path(path).read_text(encoding='utf-8')
def write(path,s): Path(path).write_text(s,encoding='utf-8')
def one(s,old,new,label):
    c=s.count(old)
    if c!=1: raise SystemExit(f'{label}: expected 1 match, got {c}')
    return s.replace(old,new,1)

# ---- gameguide shared extension owner ----
s=read('gameguide.js')
s=one(s,'function gameGuideCategoriesForState(target=null){','function baseGameGuideCategoriesForState(target=null){','rename base resolver')
anchor=' function itemHtml(item){return `<div class="guide-item"><h4>${item[0]}</h4><div class="guide-item-body">${item[1]}</div></div>`;}'
if anchor not in s: raise SystemExit('itemHtml anchor missing')
ext=''' const GUIDE_EXTENSION_REGISTRY=new Map();
 function normalizeGuideExtensionOrder(value){const n=Number(value);return Number.isFinite(n)?n:100;}
 function registerGameGuideExtension(extension){
  if(!extension||typeof extension!=="object")return false;
  const id=String(extension.id||"").trim();if(!id)return false;
  const normalized=Object.freeze({id,order:normalizeGuideExtensionOrder(extension.order),extendCategories:typeof extension.extendCategories==="function"?extension.extendCategories:null,renderBeforeLayout:typeof extension.renderBeforeLayout==="function"?extension.renderBeforeLayout:null});
  GUIDE_EXTENSION_REGISTRY.set(id,normalized);return true;
 }
 function gameGuideExtensions(){return Array.from(GUIDE_EXTENSION_REGISTRY.values()).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));}
 function cloneGuideCategories(categories){return (Array.isArray(categories)?categories:[]).map(category=>({...category,items:(Array.isArray(category?.items)?category.items:[]).map(item=>Array.isArray(item)?item.slice():item)}));}
 function gameGuideExtensionContext(target=null){const holder=guideState(target);return Object.freeze({target:holder,phase:guidePhase(holder)});}
 function applyGameGuideCategoryExtensions(categories,target=null){
  let current=cloneGuideCategories(categories),context=gameGuideExtensionContext(target);
  for(const extension of gameGuideExtensions()){
   if(typeof extension.extendCategories!=="function")continue;
   const result=extension.extendCategories(current,context);
   if(Array.isArray(result))current=result;
  }
  return current;
 }
 function gameGuideBeforeLayoutHtml(target=null){
  const context=gameGuideExtensionContext(target);
  return gameGuideExtensions().map(extension=>typeof extension.renderBeforeLayout==="function"?extension.renderBeforeLayout(context):"").filter(html=>typeof html==="string"&&html).join("");
 }
 function gameGuideCategoriesForState(target=null){return applyGameGuideCategoryExtensions(baseGameGuideCategoriesForState(target),target);}
'''
s=s.replace(anchor,ext+anchor,1)
s=s.replace('window.GAME_GUIDE_VERSION=22;','window.GAME_GUIDE_VERSION=23;',1)
s=s.replace('window.GAME_GUIDE_WORLD_AWARE_VERSION=9;','window.GAME_GUIDE_WORLD_AWARE_VERSION=10;',1)
export_anchor=' window.GAME_GUIDE_CURRENT_CATEGORY_VALIDATION_VERSION=1;'
if export_anchor not in s: raise SystemExit('guide version export anchor missing')
s=s.replace(export_anchor,export_anchor+'\n window.GAME_GUIDE_EXTENSION_REGISTRY_VERSION=1;\n window.GAME_GUIDE_CATEGORY_RESOLVER_VERSION=1;\n window.GAME_GUIDE_PAGE_EXTENSION_VERSION=1;',1)
api_anchor=' window.gameGuideCategoriesForState=gameGuideCategoriesForState;\n window.thirdWorldGuideRuleSnapshot=thirdWorldGuideRuleSnapshot;'
if api_anchor not in s: raise SystemExit('guide api anchor missing')
s=s.replace(api_anchor,' window.gameGuideCategoriesForState=gameGuideCategoriesForState;\n window.registerGameGuideExtension=registerGameGuideExtension;\n window.gameGuideExtensionIds=function(){return gameGuideExtensions().map(extension=>extension.id);};\n window.thirdWorldGuideRuleSnapshot=thirdWorldGuideRuleSnapshot;',1)
phase_anchor='  const phase=guidePhase(),worldLabel=phase===3?"高維紀元":phase===2?"宇宙紀元":"銀河紀元";'
if phase_anchor not in s: raise SystemExit('gameGuidePage phase anchor missing')
s=s.replace(phase_anchor,phase_anchor+'\n  const extensionHtml=gameGuideBeforeLayoutHtml();',1)
layout_anchor='</div></div><div class="guide-layout"><nav class="guide-categories">'
if layout_anchor not in s: raise SystemExit('gameGuidePage layout anchor missing')
s=s.replace(layout_anchor,'</div></div>${extensionHtml}<div class="guide-layout"><nav class="guide-categories">',1)
write('gameguide.js',s)

# ---- mirror guide registers category extension instead of mutating base categories ----
write('mirrordungeonguide.js','''(function(){
 const VERSION=4;
 const config=window.MIRROR_DUNGEON_CONFIG;
 window.MIRROR_DUNGEON_GUIDE_VERSION=VERSION;
 if(!config||typeof window.registerGameGuideExtension!=="function")return;
 window.registerGameGuideExtension({
  id:"mirror-dungeon",
  order:100,
  extendCategories(categories){
   const dungeon=Array.isArray(categories)?categories.find(category=>category?.id==="dungeon"):null;
   if(!dungeon||!Array.isArray(dungeon.items))return categories;
   if(!dungeon.items.some(item=>Array.isArray(item)&&item[0]==="鏡像戰"))dungeon.items.push(["鏡像戰",`每日可挑戰 1 次，固定連戰 ${config.runBattles} 場。對手會複製開始挑戰時的角色戰力，每場隨機決定先攻；完成後依勝場取得 VIP 積分並記錄最高成績。`]);
   return categories;
  }
 });
})();''')

# ---- cloud guide registers page extension; no gameGuidePage monkey patch ----
write('cloudsaveguide.js','''(function(){
 const VERSION=4;
 window.CLOUD_SAVE_GUIDE_VERSION=VERSION;
 if(typeof window.registerGameGuideExtension!=="function")return;
 window.registerGameGuideExtension({
  id:"cloud-save",
  order:200,
  renderBeforeLayout(){
   return `<section class="card" style="margin:0 0 14px"><h3 style="margin-top:0">帳號與雲端存檔</h3><div class="guide-items"><div class="guide-item"><b>帳號登入</b><div>使用 Email 帳號登入；這台裝置會保持登入，直到主動登出。</div></div><div class="guide-item"><b>本機與雲端存檔</b><div>每台裝置平常使用自己的本機存檔，雲端不會自動同步或覆蓋進度。</div></div><div class="guide-item"><b>換裝置</b><div>先在原裝置完成離線收益結算並上傳存檔，再於新裝置登入同一帳號並下載雲端存檔。</div></div><div class="guide-item"><b>覆蓋前確認</b><div>上傳會覆蓋雲端存檔，下載會覆蓋目前裝置的本機存檔；操作前請確認存檔時間、等級與 EXP。</div></div><div class="guide-item"><b>離線收益</b><div>下載後離線計時會重新開始，上傳到下載之間的時間不會另外補發離線收益。</div></div></div></section>`;
  }
 });
})();''')

# ---- cache bust ----
s=read('index.html')
s=one(s,'gameguide.js?v=20260928-thirdworld-guide-opt1fix1',f'gameguide.js?v={TAG}','gameguide cache')
s=one(s,'mirrordungeonguide.js?v=20260923-guide-batch2',f'mirrordungeonguide.js?v={TAG}','mirror guide cache')
s=one(s,'cloudsaveguide.js?v=20260923-guide-batch3',f'cloudsaveguide.js?v={TAG}','cloud guide cache')
write('index.html',s)

# ---- permanent behavioral regression ----
write('tests/runtime/gameguide-extension-integrity.js','''const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
const context={console,Math,JSON,Object,Array,Set,Map,String,Number,Boolean,RegExp,Error,Date};
context.window=context;
context.MIRROR_DUNGEON_CONFIG={runBattles:20};
context.currentWorldPhase=target=>target?.thirdWorld?.entered===true?3:(target?.secondWorld?.entered===true?2:1);
vm.createContext(context);
for(const file of ["gameguide.js","mirrordungeonguide.js","cloudsaveguide.js"])vm.runInContext(fs.readFileSync(file,"utf8"),context,{filename:file});
assert(typeof context.registerGameGuideExtension==="function","Guide shared extension registry missing.");
assert(JSON.stringify(context.gameGuideExtensionIds())===JSON.stringify(["mirror-dungeon","cloud-save"]),"Guide extension registration/order drift.");
for(const phase of [1,2,3]){
 context.state={level:phase===3?1000:phase===2?501:1,secondWorld:{entered:phase>=2},thirdWorld:{entered:phase===3}};
 const categories=context.gameGuideCategoriesForState(context.state),dungeon=categories.find(row=>row?.id==="dungeon");
 assert(dungeon&&Array.isArray(dungeon.items),`Phase ${phase} dungeon guide missing.`);
 assert(dungeon.items.filter(item=>Array.isArray(item)&&item[0]==="鏡像戰").length===1,`Phase ${phase} mirror guide must appear exactly once.`);
 const html=context.gameGuidePage();
 assert((html.match(/帳號與雲端存檔/g)||[]).length===1,`Phase ${phase} cloud guide must appear exactly once.`);
}
const cloud=fs.readFileSync("cloudsaveguide.js","utf8"),mirror=fs.readFileSync("mirrordungeonguide.js","utf8");
assert(!/window\\.gameGuidePage\\s*=/.test(cloud),"Cloud guide must not monkey-patch gameGuidePage.");
assert(!/GAME_GUIDE_CATEGORIES/.test(mirror),"Mirror guide must not mutate legacy base categories directly.");
console.log("GAME GUIDE EXTENSION INTEGRITY PASSED");
''')

# ---- static runtime integrity ----
s=read('tests/runtime/js-integrity.js')
var_anchor='const gameGuideSource=read("gameguide.js");'
if var_anchor not in s: raise SystemExit('runtime guide variable anchor missing')
s=s.replace(var_anchor,var_anchor+'\nconst mirrorGuideSource=read("mirrordungeonguide.js");\nconst cloudGuideSource=read("cloudsaveguide.js");',1)
s=s.replace('GAME_GUIDE_VERSION=22','GAME_GUIDE_VERSION=23').replace('GAME_GUIDE_WORLD_AWARE_VERSION=9','GAME_GUIDE_WORLD_AWARE_VERSION=10')
old_cache="assert(index.includes('gameguide.js?v=20260928-thirdworld-guide-opt1fix1'),\"W3 正式用語修正後必須同步更新 gameguide.js cache-bust。\");"
new_cache="assert(index.includes('gameguide.js?v=20260928-thirdworld-guide-opt2')&&index.includes('mirrordungeonguide.js?v=20260928-thirdworld-guide-opt2')&&index.includes('cloudsaveguide.js?v=20260928-thirdworld-guide-opt2'),\"Guide Opt2 touched JS 必須同步 cache-bust。\");"
s=one(s,old_cache,new_cache,'runtime guide cache assertion')
insert_anchor='assert(/GAME_GUIDE_THIRD_WORLD_RULE_SNAPSHOT_VERSION=1/.test(gameGuideSource)&&/GAME_GUIDE_CURRENT_CATEGORY_VALIDATION_VERSION=1/.test(gameGuideSource),"W3 Guide 必須使用正式 rule snapshot 與當前紀元分類驗證。\");'
if insert_anchor not in s: raise SystemExit('runtime guide assertion anchor missing')
extra='''\nassert(/GAME_GUIDE_EXTENSION_REGISTRY_VERSION=1/.test(gameGuideSource)&&/GAME_GUIDE_CATEGORY_RESOLVER_VERSION=1/.test(gameGuideSource)&&/GAME_GUIDE_PAGE_EXTENSION_VERSION=1/.test(gameGuideSource)&&/registerGameGuideExtension/.test(gameGuideSource)&&/applyGameGuideCategoryExtensions/.test(gameGuideSource)&&/gameGuideBeforeLayoutHtml/.test(gameGuideSource),"Guide 必須由 gameguide.js 單一 owner 提供 shared category/page extension hook。\");
assert(/MIRROR_DUNGEON_GUIDE_VERSION=VERSION/.test(mirrorGuideSource)&&/const VERSION=4;/.test(mirrorGuideSource)&&/registerGameGuideExtension/.test(mirrorGuideSource)&&!/GAME_GUIDE_CATEGORIES/.test(mirrorGuideSource),"鏡像戰 Guide 必須註冊 shared extension，不得直接修改 legacy base categories。\");
assert(/CLOUD_SAVE_GUIDE_VERSION=VERSION/.test(cloudGuideSource)&&/const VERSION=4;/.test(cloudGuideSource)&&/registerGameGuideExtension/.test(cloudGuideSource)&&!/window\\.gameGuidePage\\s*=/.test(cloudGuideSource),"雲端 Guide 必須註冊 shared page extension，不得 monkey-patch gameGuidePage。\");'''
s=s.replace(insert_anchor,insert_anchor+extra,1)
write('tests/runtime/js-integrity.js',s)

# ---- Runtime Integrity permanently executes behavioral regression ----
s=read('.github/workflows/runtime-integrity.yml')
old='''      - name: Run unlimited VIP integrity\n        if: github.event_name != 'push' || steps.freshness.outputs.current == 'true'\n        run: set -o pipefail; node tests/runtime/vip-unbounded-integrity.js 2>&1 | tee -a runtime-integrity-report.txt'''
new='''      - name: Run Guide extension integrity\n        if: github.event_name != 'push' || steps.freshness.outputs.current == 'true'\n        run: set -o pipefail; node tests/runtime/gameguide-extension-integrity.js 2>&1 | tee -a runtime-integrity-report.txt\n      - name: Run unlimited VIP integrity\n        if: github.event_name != 'push' || steps.freshness.outputs.current == 'true'\n        run: set -o pipefail; node tests/runtime/vip-unbounded-integrity.js 2>&1 | tee -a runtime-integrity-report.txt'''
s=one(s,old,new,'runtime workflow guide test step')
write('.github/workflows/runtime-integrity.yml',s)
print('guide optimization batch2 patch applied')
