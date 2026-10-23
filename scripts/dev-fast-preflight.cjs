#!/usr/bin/env node
'use strict';
// Fast read-only preflight. Run before expensive browser suites.
const cp=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const base=process.argv[2]||process.env.GITHUB_BASE_REF&&'origin/'+process.env.GITHUB_BASE_REF||'HEAD^';
const cmd=(...args)=>cp.execFileSync('git',args,{encoding:'utf8'}).trim();
const names=cmd('diff','--name-only',base,'HEAD').split('\n').filter(Boolean);
const changed=new Set(names),problems=[],hints=[];
const html=fs.readFileSync('index.html','utf8');
const urls=[...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g)].map(x=>x[1]);
const cacheReferences=new Map();
for(const url of urls){const [filename,query='']=url.split('?');if(!cacheReferences.has(filename))cacheReferences.set(filename,[]);cacheReferences.get(filename).push(query);}
const scriptChanges=names.filter(n=>/\.(?:js|css)$/.test(n)&&!n.startsWith('tests/')&&!n.startsWith('scripts/')&&!n.startsWith('.github/'));
for(const filename of scriptChanges){
 if(!cacheReferences.has(filename))continue;
 const before=cp.execFileSync('git',['show',base+':index.html'],{encoding:'utf8',stdio:['ignore','pipe','ignore']});
 const old=[...before.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g)].map(x=>x[1]).filter(x=>x.split('?')[0]===filename);
 const fresh=urls.filter(x=>x.split('?')[0]===filename);
 if(JSON.stringify(old)===JSON.stringify(fresh))problems.push('Modified '+filename+' but index.html asset URL did not change');
}
const guard=fs.readFileSync('tests/runtime/pr48-presentation-baseline.cjs','utf8');
const legacy=[...new Set((guard.match(/(?:index\.html|\.replace\()/g)||[]))];
if(changed.has('index.html')&&guard.includes("'index.html'")&&!changed.has('tests/runtime/pr48-presentation-baseline.cjs'))hints.push('index.html changed: check exact historical PR48 guard authorization before merge');
const affected=names.some(n=>/combat|battle|thirdworld|secondworld|viewport|dungeon|arena|calamity|index\.html/.test(n));
if(affected)hints.push('Combat-related change: require full Runtime Integrity and published formal battle browser workflows on PR');
const output={base,head:cmd('rev-parse','HEAD'),changed:names.length,modifiedAssets:scriptChanges.filter(n=>cacheReferences.has(n)),errors:problems,hints};
console.log(JSON.stringify(output,null,2));
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'## Fast preflight\n\n'+'- Changed files: '+names.length+'\n'+'- Errors: '+problems.length+'\n'+problems.map(x=>'- ❌ '+x+'\n').join('')+hints.map(x=>'- ℹ️ '+x+'\n').join(''));
if(problems.length)process.exitCode=1;
