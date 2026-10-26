'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const baseline='f0990025';
function before(file){return cp.execFileSync('git',['show',baseline+':'+file],{encoding:'utf8',maxBuffer:5e6});}
function block(source,marker){const start=source.indexOf(marker);assert.ok(start>=0,marker);const lineEnd=source.indexOf('\n',start),end=source.indexOf('\n }',lineEnd);return source.slice(start,end<0?lineEnd:source.indexOf('\n',end+1));}
const functions={
 'calamityui.js':[' function ensureUnlockModal(){',' function calamityForStory(',' window.showCivilizationCalamityUnlockNoticeForStory=',' window.closeCivilizationCalamityUnlockNotice='],
 'secondworldcalamityui.js':[' function ensureNotice(){',' function notifyTitlePostFlow(',' function thirdWorldReviewOnly(){',' window.queueSecondWorldCalamityAppearanceNotice=',' window.flushSecondWorldCalamityAppearanceNotice=',' window.closeSecondWorldCalamityAppearanceNotice='],
 'thirdworldui.js':[' function ensureCoreConfirmModal(){',' window.openThirdWorldCoreInjectionConfirm=',' window.closeThirdWorldCoreInjectionConfirm=',' window.confirmThirdWorldCoreInjection=']
};
let count=0;
for(const [file,markers]of Object.entries(functions)){const old=before(file),next=fs.readFileSync(file,'utf8');for(const marker of markers){assert.equal(block(next,marker),block(old,marker),file+':'+marker);count++;}}
// All owners of automatic story/title/world/Boss notifications, audio and their styles stay identical.
const protectedFiles=['storyui.js','storyprogress.js','playertitles.js','playertitleui.js','worldphase.js','worldphaseui.js','thirdworldphase.js','thirdworldplayerflow.js','secondworldmainlineresult.js','calamityui.css','playertitles.css','story.css','audio/audio-core.js','combatmath.js','markcore.js','civilizationcore.js','reincarnationcore.js','reincarnationrerunworld1.js','reincarnationrerunworld2.js','reincarnationrerunworld3.js','thirdworldprogress.js','secondworldprogress.js'];
for(const file of protectedFiles){if(!fs.existsSync(file))continue;assert.equal(require('./formal-stop-approved.cjs').historicalBytes(file,fs.readFileSync(file)).toString('utf8'),before(file),file);count++;}
const core=require('./issue106-approved-sources.cjs').historicalBytes('combatcore.js',fs.readFileSync('combatcore.js')).toString('utf8').split('\n').filter(l=>!l.includes('window.recordMonsterCodexEncounter?.')).join('\n');assert.equal(core,before('combatcore.js'),'formal combat math unchanged');count++;
console.log('PASS: '+count+' protected notice functions/owners match '+baseline+' byte-for-byte');
