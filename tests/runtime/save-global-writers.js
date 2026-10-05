const fs=require("fs");
const path=require("path");
// Permanent regression: save() global writes are restricted to the engine base, canonical Save Hook Core, and the audited Offline checkpoint compatibility wrapper.
function walk(dir){const out=[];for(const e of fs.readdirSync(dir,{withFileTypes:true})){if([".git","node_modules","tests"].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())out.push(...walk(p));else if(e.isFile()&&e.name.endsWith(".js"))out.push(p.replace(/^\.\//,""));}return out;}
const allowed=new Set(["engine.js","savehookcore.js","offlineprogress.js"]);
const patterns=[/\bwindow\.save\s*=/g,/\bglobalThis\.save\s*=/g,/\bfunction\s+save\s*\(/g,/\btry\s*\{\s*save\s*=/g];
const hits=[];
for(const file of walk(".")){
 const src=fs.readFileSync(file,"utf8");
 const matched=patterns.some(re=>{re.lastIndex=0;return re.test(src);});
 if(matched&&!allowed.has(file))hits.push(file);
}
if(hits.length){console.error("Unexpected global save writers:",hits.join(", "));process.exit(1);}
const hookCore=fs.readFileSync("savehookcore.js","utf8");
if(!/SAVE_HOOK_IMPLEMENTATION_OWNER/.test(hookCore)||!/IMPLEMENTATION_OWNER="savehookcore"/.test(hookCore)||!/hookedSave\.__saveHookOwner=IMPLEMENTATION_OWNER/.test(hookCore)||!/window\.save=hookedSave/.test(hookCore)){
 console.error("Canonical Save Hook Core contract changed.");process.exit(1);
}
const compatibility=fs.readFileSync("compatibilityowners.js","utf8");
if(/window\.save\s*=/.test(compatibility)||/try\s*\{\s*save\s*=/.test(compatibility)){
 console.error("Legacy compatibility owner must not own or wrap save().");process.exit(1);
}
const offline=fs.readFileSync("offlineprogress.js","utf8");
if(!/function installSaveWrapper\(\)/.test(offline)||!/offlineSettlementBusy/.test(offline)||!/checkpoint\(now\(\),false\)/.test(offline)||!/window\.save=wrapped/.test(offline)){
 console.error("Audited offline save compatibility wrapper contract changed.");process.exit(1);
}
console.log("Global save writer audit passed: engine base + Save Hook Core + audited Offline checkpoint wrapper only.");
