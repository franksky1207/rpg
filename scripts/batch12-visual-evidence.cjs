'use strict';
// Real formal Renderer + Actor raster, driven by normalized owner samples.
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});const out='development/combat-animation/batch12/rendered';fs.mkdirSync(out,{recursive:true});const reports=[];
try{for(const viewport of [{width:1365,height:900},{width:390,height:844},{width:844,height:390}]){
 const page=await browser.newPage({viewport});await page.goto('http://127.0.0.1:4173/development/combat-animation/batch12/candidate-lab.html');await page.waitForFunction(()=>window.lab?.ready);await page.addStyleTag({url:'/3d-test/formal-player-sprites.css'});await page.addScriptTag({url:'/3d-test/t3b-formal-renderer.js'});
 const result=await page.evaluate(async()=>{
  document.body.innerHTML='';document.body.style.margin='0';
  const rows=[],images=[];
  for(const era of ['galaxy','universe','higher'])for(const rank of ['normal','elite','boss']){
   const screen=document.createElement('section');screen.className='combat-screen';screen.style.width=innerWidth>1000?'600px':innerWidth-24+'px';const host=document.createElement('div');host.className='formal-b-shared-stage';screen.append(host);document.body.append(screen);
   const abort=new AbortController(),renderer=CivilizationFormalBRenderer,bundle=await renderer.prepare({wholeSuit:true,eraVisualId:era,identity:{kind:rank},signal:abort.signal}),actor=await renderer.create({host,bundle,signal:abort.signal,isCurrent:()=>true});
   const phases=[['idle',0],['windup',196],['attack',280],['impact',336],['hold',420],['recover',560],['idle-end',700]],frames=[],contacts=[];
   if(rank==='normal'){for(let ms=35;ms<700;ms+=35)if(!phases.some(p=>p[1]===ms))phases.push(['motion-'+ms,ms]);phases.sort((a,b)=>a[1]-b[1]);}
   for(const [stage,ms] of phases){
    const clip=ms===0||ms===700?'idle':ms>420?'return':'attack',approach=ms<336?.42*ms/336:.42*Math.max(0,1-(ms-336)/364);
    actor.sample({player:{clip,elapsedMs:ms,approach},enemy:{clip:ms>=336&&ms<700?'hit':'idle',elapsedMs:Math.max(0,ms-336),approach:0},weaponAttack:clip==='idle'?undefined:{role:'player',elapsedMs:ms}});
    const player=host.querySelector('.formal-b-player-sprite'),enemy=host.querySelector('.formal-b-enemy-sprite'),pr=player.getBoundingClientRect(),er=enemy.getBoundingClientRect(),hr=host.getBoundingClientRect();
    const target=document.createElement('canvas');target.width=Math.ceil(hr.width);target.height=Math.ceil(hr.height);const c=target.getContext('2d');c.fillStyle='#202c40';c.fillRect(0,0,target.width,target.height);c.drawImage(enemy,er.x-hr.x,er.y-hr.y,er.width,er.height);c.drawImage(player,pr.x-hr.x,pr.y-hr.y,pr.width,pr.height);
    const pd=player.getContext('2d').getImageData(0,0,player.width,player.height).data,ed=enemy.getContext('2d').getImageData(0,0,enemy.width,enemy.height).data;let border=0,overlap=0,minGap=Infinity;const blue=[];
    for(let y=0;y<player.height;y++)for(let x=0;x<player.width;x++){const i=(y*player.width+x)*4;if(pd[i+3]>32&&(x===0||y===0||x===player.width-1||y===player.height-1))border++;if(pd[i+3]>80&&pd[i+2]>150&&pd[i+2]>pd[i]*1.10&&x>player.width*.65){const wx=pr.x+x/player.width*pr.width,wy=pr.y+y/player.height*pr.height;blue.push([wx,wy]);const ex=Math.round((wx-er.x)/er.width*enemy.width),ey=Math.round((wy-er.y)/er.height*enemy.height);if(ex>=0&&ex<enemy.width&&ey>=0&&ey<enemy.height&&ed[(ey*enemy.width+ex)*4+3]>32)overlap++;}}
    if(ms===336){for(const [wx,wy] of blue){const ey=Math.round((wy-er.y)/er.height*enemy.height);if(ey<0||ey>=enemy.height)continue;for(let ex=0;ex<enemy.width;ex++)if(ed[(ey*enemy.width+ex)*4+3]>32){minGap=Math.min(minGap,Math.abs(er.x+ex/enemy.width*er.width-wx));break;}}contacts.push({overlap,minGap:Number.isFinite(minGap)?minGap:null});}
    if(pr.x+pr.width*.5>=er.x+er.width*.5)throw Error('actor crossed enemy');
    frames.push({stage,ms,border,width:pr.width,height:pr.height,weaponStage:player.dataset.weaponStage,weaponReady:player.dataset.weaponReady});images.push({name:`formal-${innerWidth}-${era}-${rank}-${stage}.png`,data:target.toDataURL().split(',')[1]});
   }
   actor.dispose();abort.abort();screen.remove();rows.push({era,rank,frames,contacts,stats:renderer.spriteStats()});
  }
  CivilizationFormalBRenderer.clearSpriteCache();return {rows,images,after:CivilizationFormalBRenderer.spriteStats()};
 });
 for(const im of result.images)fs.writeFileSync(out+'/'+im.name,Buffer.from(im.data,'base64'));delete result.images;reports.push({viewport,...result});await page.close();
}
}finally{await browser.close();}
fs.writeFileSync(out+'/formal-visual-report.json',JSON.stringify({reports,hardware:false,method:'Actual formal Renderer/Actor and CSS; owner-normalized 336ms impact, alpha contact checked against actual enemy silhouette'},null,2));
for(const report of reports){for(const row of report.rows){for(const f of row.frames){assert.equal(f.border,0,JSON.stringify({viewport:report.viewport,era:row.era,rank:row.rank,f}));assert.equal(f.weaponReady,'true');if(f.stage==='impact')assert.equal(f.weaponStage,'impact','336ms must be exact owner impact, never rounded to pre-impact');}assert.ok(row.contacts[0].overlap>0,JSON.stringify({viewport:report.viewport,era:row.era,rank:row.rank,contacts:row.contacts}));assert.equal(row.stats.refs,0);}assert.equal(report.after.bytes,0);}
console.log('PASS actual Renderer 3 viewports x 3 eras x 3 ranks / 333 actual frames; pixel contact, no clipping, refs/bytes zero.');
})().catch(e=>{console.error(e);process.exitCode=1;});
