#!/usr/bin/env node
'use strict';
const cp=require('node:child_process');
const fs=require('node:fs');
const DOMAIN=['combat','monster','gm','equipment','background','resource'];
function classify(files){
  const result=Object.fromEntries(DOMAIN.map(k=>[k,false]));
  const mark=(...xs)=>xs.forEach(k=>result[k]=true);
  for(const file of files){
    if(!file)continue;
    if(/^(docs\/|development\/.*\.(?:md|txt)$|PROJECT_HANDOFF\.md$|README(?:\.md)?$)/i.test(file))continue;
    if(/^(\.github\/workflows\/|scripts\/ci-impact\.cjs$|tests\/ci-impact\.test\.cjs$)/.test(file)){mark(...DOMAIN);continue;}
    if(file==='index.html'||/^(ui\.js|engine\.js|combatcore\.js|battlepipeline\.js|resource-manifest\.json)$/.test(file)){mark(...DOMAIN);continue;}
    let matched=false;
    const set=(condition,...xs)=>{if(condition){mark(...xs);matched=true;}};
    set(/(?:combat|battle|renderer|sprite|viewport|animation|pr48|t3b|weapon|calamity|arena|dungeon|mirror)/i.test(file),'combat');
    set(/^(assets\/era-player\/|3d-test\/equipment|tests\/equipment|scripts\/equipment|data\/equipment)/.test(file)||/equipment|era-player/i.test(file),'equipment');
    set(/^(data\/monsters\/|assets\/monsters\/|development\/monster-art\/)/.test(file)||/monster|boss|dungeon|special|alternateuniverse|calamity/i.test(file),'monster');
    set(/^(3d-test\/|gm|tests\/runtime\/gm-|tests\/equipment-gm\/)/i.test(file),'gm');
    set(/(?:save|reincarn|background|offline|fast-catchup|settlement|migration|newstate|story|secondworld|thirdworld)/i.test(file),'background');
    set(/(?:resource|cache|manifest|publish|assets\/|audio\/|vendor\/|\.css$|\.html$)/i.test(file),'resource');
    if(/^(scripts\/|tests\/runtime\/|tests\/story\/)/.test(file)&&!matched){mark(...DOMAIN);matched=true;}
    if(!matched)mark(...DOMAIN);
  }
  return result;
}
function selfTest(){
 const cases=[
  [['docs/NOTES.md'],[]],
  [['resource-cache-sw.js'],['resource']],
  [['gm3dprototype.js'],['gm']],
  [['data/monsters/monster-mappings.json'],['monster']],
  [['dungeonbounty.js'],['combat','monster']],
  [['thirdworldcombat.js'],['combat','background']],
  [['3d-test/t3b-formal-renderer.js'],['combat','gm']],
  [['reincarnationcore.js'],['background']],
  [['tests/runtime/save-load-pipeline-integrity.js'],['background']],
  [['tests/runtime/batch18-alternate-contract.cjs'],['monster']],
  [['.github/workflows/functional-ci.yml'],DOMAIN],
  [['scripts/unknown-tool.cjs'],DOMAIN],
  [['index.html'],DOMAIN],
  [['removed-unclassified.bin'],DOMAIN]
 ];
 for(const [files,expected] of cases){const actual=Object.keys(classify(files)).filter(k=>classify(files)[k]);for(const k of expected)if(!actual.includes(k))throw Error('Missing '+k+' for '+files);
 if(files[0]==='docs/NOTES.md'&&actual.length)throw Error('Docs triggered jobs');
 if(files[0]==='resource-cache-sw.js'&&actual.some(k=>k!=='resource'))throw Error('Cache-only fanout');
 }
 process.stdout.write('PASS: '+cases.length+' CI impact route cases (necessary + unrelated checks)\n');
}
if(require.main===module){
 if(process.argv.includes('--self-test'))selfTest();
 else{
  const base=process.argv[2],head=process.argv[3]||'HEAD';
  const changed=base?cp.execFileSync('git',['diff','--name-only','--diff-filter=ACDMRT',base,head],{encoding:'utf8'}).trim().split('\n').filter(Boolean):[];
  const route=classify(changed);
  if(process.argv.includes('--all'))DOMAIN.forEach(k=>route[k]=true);
  process.stdout.write(DOMAIN.map(k=>k+'='+String(route[k])).join('\n')+'\n');
  process.stderr.write('CI impact: '+JSON.stringify({changed,route})+'\n');
 }
}
module.exports={classify,DOMAIN};
