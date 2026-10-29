'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),vm=require('node:vm');
const record=require('./player-copy-approved.json');
const read=p=>fs.readFileSync(p,'utf8'),old=p=>cp.execFileSync('git',['show',record.baseline+':'+p],{encoding:'utf8',maxBuffer:16*1024*1024});
// Prove the entire offline calculation, grant, timers and save-owner code remains byte-identical.
const source=read('offlineprogress.js'),base=old('offlineprogress.js');
for(const part of [s=>s.slice(0,s.indexOf(' function ensureOfflineModals(')),s=>s.slice(s.indexOf(' window.closeOfflineRewardModal='))]){
 assert.ok(part(source).length>1000);assert.equal(part(source),part(base));
}
for(const p of ['offlinestatecore.js','offlineworld3adapter.js','battlepipeline.js','reincarnationcore.js'])assert.equal(read(p),old(p),p+' unchanged');
// No administrator or structured diagnostic code is removed by this copy-only change.
for(const p of cp.execFileSync('git',['ls-files','*.js'],{encoding:'utf8'}).trim().split('\n').filter(p=>!p.includes('/')&&(/gm|integrity/i.test(p)||p==='batch5ui.js')))assert.equal(read(p),old(p),p);
const cloud=read('cloudsave.js');const start=cloud.indexOf(' function errorText('),end=cloud.indexOf(' async function refreshMeta',start);assert.ok(start>0&&end>start);
const logs=[];const context={console:{error:(...a)=>logs.push(a)}};vm.createContext(context);vm.runInContext(cloud.slice(start,end)+';this.display=errorText;',context);
for(const e of [new Error('Save Hook runtime owner pending'),{code:'FUTURE_SAVE_VERSION',message:'internal migration detail'},{code:'UNSUPPORTED_LEGACY_SAVE_VERSION',message:'Offline battle sample V1'}]){
 const text=context.display(e);assert.doesNotMatch(text,/Hook|runtime|owner|pending|migration|sample/);assert.equal(logs.at(-1)[1],e);
}
assert.match(context.display(new Error('row-level security')),/重新登入/);
assert.equal(context.display(new Error('本機存檔失敗，已取消上傳。')),'本機存檔失敗，已取消上傳。');
assert.match(cloud,/throw new Error\("正式存檔 migration 尚未載入。"\)/);
assert.match(read('saveversionguard.js'),/backup\.error/,'original structured backup diagnostics retained');
const auth=read('supabaseauth.js'),authStart=auth.indexOf(' function authMessage('),authEnd=auth.indexOf(' function setStatus',authStart);
vm.runInContext(auth.slice(authStart,authEnd)+';this.authDisplay=authMessage;',context);
const authError={message:'runtime owner pending DOM migration',code:'unknown'};
assert.doesNotMatch(context.authDisplay(authError),/runtime|owner|pending|DOM|migration/);assert.equal(logs.at(-1)[1],authError);
assert.match(context.authDisplay({code:'session_not_found',message:'Auth session missing'}),/重設密碼連結已失效/);
assert.match(context.authDisplay({message:'Invalid login credentials'}),/Email 或密碼不正確/);
console.log('Player copy boundaries passed: offline rules byte-identical; GM/integrity unchanged; safe error display retains raw diagnostics.');
