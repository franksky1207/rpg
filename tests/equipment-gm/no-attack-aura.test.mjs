import test from 'node:test';
import assert from 'node:assert/strict';
import {WholeSuitActor} from '../../3d-test/equipment-sprites-v1/actor.mjs';
import {release} from '../../3d-test/era-player-sprites.mjs';
// The formal era path must paint the sprite but never draw an attack arc.
for(const entry of release.entries)test(entry.id+' preserves sprites and hit flash without attack aura',async()=>{
 let strokes=0,arcs=0,images=0,flashes=0;
 const ctx=new Proxy({stroke(){strokes++;},arc(){arcs++;},drawImage(){images++;},fillRect(){flashes++;}},{get:(o,k)=>o[k]??(()=>{})});
 const actor=await new WholeSuitActor({stats:()=>({closed:false}),acquire:async()=>({bitmap:{},release(){}})},entry,{canvasFactory:()=>({dataset:{},getContext:()=>ctx})}).init();
 for(let ms=0;ms<=700;ms+=35)actor.draw({clip:'attack',elapsedMs:ms});
 assert.ok(images>0);assert.equal(strokes,0);assert.equal(arcs,0);
 actor.draw({clip:'hit',elapsedMs:350});assert.ok(flashes>0,'existing hit flash retained');
 actor.dispose();
});
