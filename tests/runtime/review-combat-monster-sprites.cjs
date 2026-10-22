/* Regression: every review must reuse an exact approved formal monster identity. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const root=path.resolve(__dirname,'../..');
 const {resolveFormalMonster}=await import(pathToFileURL(path.join(root,'3d-test/monster-formal-resolver.mjs')).href);
 const {mappings}=await import(pathToFileURL(path.join(root,'3d-test/monster-sprites.mjs')).href);
 const pick=id=>{const row=mappings[id];assert.ok(row,'Missing official mapping '+id);return row;};
 const expectSame=(input,official)=>{
  const standard=resolveFormalMonster(official),review=resolveFormalMonster({...input,mode:'review'});
  assert.ok(standard,'Original official identity must resolve: '+JSON.stringify(official));
  assert.ok(review,'Review identity must resolve: '+JSON.stringify(input));
  assert.equal(review.mapping.id,standard.mapping.id);
  assert.equal(review.asset.assetId,standard.asset.assetId);
  assert.equal(review.asset.facing,'left-3/4');
 };
 const g=pick('galaxy-map-001');
 const gCtx={world:1,kind:g.kind,name:g.name,id:g.id,location:'0:0'};
 expectSame(gCtx,{...gCtx,mode:'main'});
 const u=pick('universe-boss-001');
 const uCtx={world:2,kind:u.kind,name:u.name,id:u.id,location:'0'};
 expectSame(uCtx,{...uCtx,mode:'main'});
 const high=Object.values(mappings).find(x=>x.world==='higher'&&x.mode==='main'&&x.status==='batch17-formal-enabled'&&x.kind==='boss');
 assert.ok(high,'Missing high-dimensional formal boss');
 const hCtx={world:3,kind:high.kind,name:high.name,id:high.id,location:String(high.bossIndex)};
 expectSame(hCtx,{...hCtx,mode:'main'});
 for(const [id,world] of [['galaxy-calamity-01',1],['universe-calamity-01',2]]){
  const row=pick(id),ctx={world,kind:row.kind,name:row.name,id:row.bossId,location:row.bossId};
  expectSame(ctx,{...ctx,mode:'calamity'});
  assert.equal(resolveFormalMonster({...ctx,mode:'review',location:'wrong'}),null,'Do not guess calamity identity');
 }
 assert.equal(resolveFormalMonster({...uCtx,mode:'review',name:'not-a-boss'}),null,'No fuzzy review names');
 assert.equal(resolveFormalMonster({...hCtx,mode:'review',kind:'normal'}),null,'Reject wrong high-dimensional kind');
 assert.equal(resolveFormalMonster({...gCtx,mode:'review',location:'100:0'}),null,'Reject non-existent maps');
 const renderer=fs.readFileSync(path.join(root,'3d-test/t3b-formal-renderer.js'),'utf8');
 assert.match(renderer,/\['main','bounty','arena','void','mirror','special','calamity','alternate','review'\]\.includes\(bundle\.enemyMode\)/,'Review must reach sprite activation');
 const ui=fs.readFileSync(path.join(root,'secondworldcalamityui.js'),'utf8');
 const contexts=ui.match(/mode:"review",world:[12],owner:"secondworldcalamityui\.js",variant:"calamity",location:String\(def\.id\)/g)||[];
 assert.equal(contexts.length,2,'Both galaxy and universe calamity review must transmit the original boss ID');
 console.log('review-monster-sprites: PASS (3 mainlines, 2 calamities, negative guards, activation gate)');
})().catch(error=>{console.error(error);process.exitCode=1;});
