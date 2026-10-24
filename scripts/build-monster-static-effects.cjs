// Effects-only configuration and export. Does NOT import ANY recoloring painter.
const fs=require('node:fs'),crypto=require('node:crypto'),{chromium}=require('playwright');
const root='development/monster-art/full-review',E=require('../'+root+'/static-effects.js');
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function frozen(){const base=JSON.parse(fs.readFileSync(root+'/effects-audit/frozen-before.json'));for(const [p,hash] of Object.entries(base.files))if(digest(root+'/'+p)!==hash)throw Error('Frozen file changed: '+p);}
(async()=>{frozen();const D=JSON.parse(fs.readFileSync(root+'/manifest.json')),geometry=JSON.parse(fs.readFileSync(root+'/effects-audit/geometry.json'));
const configs=[],seen=new Set(),usage={total:D.specs.length,families:{},components:{},byAsset:{}};
const rows=D.rows.filter(r=>r.canonical===r.id).sort((a,b)=>a.assetId.localeCompare(b.assetId)||a.id.localeCompare(b.id));
let i=0;
for(const row of rows){const asset=D.assets.find(a=>a.assetId===row.assetId),s=D.specs.find(s=>s.id===row.id);const config=E.makeConfig(row,asset,s,i++,usage,seen);
 for(const m of config.members){const c=E.libraryMap[m.id];if(c.space!=='motif')continue;let pockets=geometry[asset.assetId].pockets[m.position];if(m.variant%2)pockets=pockets.slice().reverse();if(m.density===1)pockets=pockets.slice(0,1);m.anchors=pockets.map(p=>p.point);m.scale=Math.min(m.scale,...pockets.map(p=>p.radius*.70));}
 configs.push(config);
}
const counts=values=>Object.fromEntries([...new Set(values)].sort().map(k=>[k,values.filter(x=>x===k).length]));
const familyUse=counts(configs.flatMap(c=>c.families)),stats={denominator:configs.length,unit:'895 canonical appearances (AU stages and king projections not double-counted)',levels:counts(configs.map(c=>'L'+c.level)),families:familyUse,components:counts(configs.flatMap(c=>c.members.map(m=>m.id))),combinations:counts(configs.map(c=>c.combination)),familyMembers:counts(configs.flatMap(c=>c.members.map(m=>E.libraryMap[m.id].family))),maxFamilyAppearanceShare:Math.max(...Object.values(familyUse))/configs.length};
const output={version:E.VERSION,sourceMain:'658d5db2c14cd10598e648e2fafdfe3ad75f80dd',frozenBodyCommit:'ab521304e11ef6cbd7baa346d77847915527e804',library:E.library,families:E.families,configs,stats};
fs.writeFileSync(root+'/effects-manifest.json',JSON.stringify(output,null,2));fs.writeFileSync(root+'/effects-data.js','window.MONSTER_EFFECTS='+JSON.stringify(output)+';\n');
for(const dir of ['effects','effects-full','effect-library'])fs.mkdirSync(root+'/'+dir,{recursive:true});
const highOnly=process.argv.includes('--level5'),renderConfigs=highOnly?configs.filter(c=>c.level===5):configs;
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const metrics=[];
try{const p=await browser.newPage();await p.goto('http://127.0.0.1:4173/');await p.addScriptTag({path:root+'/static-effects.js'});
for(let start=0;start<renderConfigs.length;start+=20){const batch=renderConfigs.slice(start,start+20);const result=await p.evaluate(async({batch,base})=>{const output=[];for(const config of batch){const im=new Image();im.src=base+'/body/'+config.id+'.webp';await im.decode();const t=performance.now(),{canvas,metrics}=MonsterStaticEffects.render(im,config,{details:true});output.push({id:config.id,metrics,ms:performance.now()-t,png:canvas.toDataURL('image/png').split(',')[1]});canvas.width=canvas.height=1;}return output;},{batch,base:'/'+root});
 for(const item of result){fs.writeFileSync(root+'/effects/'+item.id+'.png',Buffer.from(item.png,'base64'));delete item.png;metrics.push(item);}console.log('Effects',Math.min(start+20,renderConfigs.length)+'/'+renderConfigs.length);}
const demos=[];
for(const component of E.library){const asset=D.assets.find(a=>E.compatible(component,a,[])),body=D.specs.find(s=>s.assetId===asset.assetId),cfg=configs.find(c=>c.id===body.id);
 for(const variant of [0,1,2]){const level=[0,2,5][variant];if(highOnly&&level!==5)continue;const position=component.positions[variant%component.positions.length];const member={id:component.id,position,variant,morphology:['symmetric','asymmetric','split'][variant],density:variant+1,scale:20+variant*6,opacity:.62+variant*.08,direction:0,color:'#9ddcd7'};if(component.space==='motif'){const pockets=geometry[asset.assetId].pockets[position];member.anchors=pockets.slice(0,variant===0?1:2).map(p=>p.point);member.scale=Math.min(member.scale,...pockets.map(p=>p.radius*.7));}
 const demo={id:component.id+'-L'+level,assetId:asset.assetId,bodyId:body.id,level,strength:level+.4,members:[member]};const result=await p.evaluate(async({demo,base})=>{const im=new Image();im.src=base+'/body/'+demo.bodyId+'.webp';await im.decode();const {canvas,metrics}=MonsterStaticEffects.render(im,demo,{details:true});return {png:canvas.toDataURL('image/png').split(',')[1],metrics};},{demo,base:'/'+root});fs.writeFileSync(root+'/effect-library/'+demo.id+'.png',Buffer.from(result.png,'base64'));demos.push({...demo,metrics:result.metrics});}
}
const mergedDemos=highOnly?JSON.parse(fs.readFileSync(root+'/effect-library/demos.json')).filter(d=>!demos.some(x=>x.id===d.id)).concat(demos):demos,mergedMetrics=highOnly?JSON.parse(fs.readFileSync(root+'/effects-audit/render-metrics.json')).filter(d=>!metrics.some(x=>x.id===d.id)).concat(metrics):metrics;fs.writeFileSync(root+'/effect-library/demos.json',JSON.stringify(mergedDemos,null,2));fs.writeFileSync(root+'/effects-audit/render-metrics.json',JSON.stringify(mergedMetrics,null,2));
console.log('Done:',configs.length,'configs,',E.library.length,'components;',stats.levels,stats.families,'max share',stats.maxFamilyAppearanceShare);
}finally{await browser.close();}frozen();})().catch(e=>{console.error(e);process.exitCode=1});
