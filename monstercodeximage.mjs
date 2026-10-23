import {createMonsterPool} from './3d-test/monster-sprite-pool.mjs?v=20261022-batch18-alternate1';
import {palettes} from './3d-test/monster-sprites.mjs?v=20261022-batch18-alternate1';
const pool=createMonsterPool({usage:'formal'});
export async function drawCodexMonster(canvas,row){
 let lease;
 try{lease=await pool.acquire(row.assetId);if(!canvas.isConnected)return;const ctx=canvas.getContext('2d');ctx.filter=palettes[row.visual?.palette]||'none';ctx.drawImage(lease.bitmap,0,0,512,512);canvas.nextElementSibling.textContent='';}
 finally{lease?.release();pool.clear();}
}
