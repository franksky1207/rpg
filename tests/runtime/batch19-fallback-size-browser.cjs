'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const nativePath=process.env.B19_REPORT||'/tmp/batch19-native.json',fallbackPath='/tmp/batch19-fallback-size.json';
cp.execFileSync(process.execPath,['development/combat-animation/batch19-1/measure-live.cjs'],{stdio:'inherit',env:{...process.env,B19_MODE:'calamity',B19_FALLBACK:'1',B19_REPORT:fallbackPath}});
const native=JSON.parse(fs.readFileSync(nativePath)),fallback=JSON.parse(fs.readFileSync(fallbackPath)),comparisons=[];
assert.equal(native.passed,true);assert.equal(fallback.passed,true);assert.equal(fallback.rows.length,12);
for(const row of fallback.rows){const real=native.rows.find(r=>r.viewport.width===row.viewport.width&&r.world===row.world&&r.mode===row.mode&&r.bossId===row.bossId);assert.ok(real);
 const p=row.layout.boxes[0],q=real.layout.boxes[0],heightDelta=Math.abs(p.height-q.height),selectedDelta=Math.abs(row.layout.paintedHeight-real.layout.paintedHeight);
 assert.ok(heightDelta<=Math.max(2,q.height*.02),'actual player Alpha must not jump on resource failure: '+JSON.stringify({row,heightDelta}));
 assert.ok(selectedDelta<=Math.max(2,real.layout.paintedHeight*.02),'same measured safe player height for verified/fallback');
 const pc=(p.left+p.right)/2-row.stage.left,qc=(q.left+q.right)/2-real.stage.left;
 assert.ok(Math.abs(pc-qc)<=2,'player remains in place through verified/fallback');
 comparisons.push({viewport:row.viewport,world:row.world,bossId:row.bossId,verifiedHeight:q.height,fallbackHeight:p.height,heightDelta,selectedDelta});
}
fs.writeFileSync('/tmp/batch19-fallback-comparison.json',JSON.stringify({passed:true,realDevice:false,comparisons},null,2));console.log('PASS 12 real HTTP failure outlines: actual player Alpha height and position match verified sprites');
